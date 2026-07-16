export default {
  id: 'dp3-004',
  slug: 'broken-profile-dp',
  chapter: 'dp3',
  order: 4,
  title: 'Broken Profile DP: Tiling a Grid with Dominoes',
  subtitle: 'A bitmask that represents "which cells protrude into the next row"',
  tags: ['dynamic programming', 'bitmask dp', 'broken profile', 'domino tiling', 'tiling problems'],
  aliases: 'broken profile dp domino tiling bitmask row by row',

  hook: {
    question: 'In how many distinct ways can a 3-row, 4-column rectangle be completely covered by 1x2 domino tiles, with no gaps and no overlaps? Dominoes can be placed horizontally or vertically. A single vertical domino placed in row 0 "reaches into" row 1 — so you cannot decide row 0 and row 1 independently. The broken-profile technique processes the grid row by row, using a bitmask to remember exactly which cells of the CURRENT row are already spoken for by a domino that started in the row above.',
    realWorldContext: 'Domino and polyomino tiling counting appears in statistical physics (the "dimer model," used to study crystal lattices and phase transitions), VLSI chip layout (packing rectangular circuit blocks without gaps), and puzzle/game design (counting valid board configurations). The broken-profile technique generalizes far beyond dominoes — any tiling-counting or grid-filling problem where a placed piece can span into an adjacent row uses this same "row-by-row with a boundary bitmask" idea.',
    previewVisualizationId: 'ScienceNotebook',
  },

  intuition: {
    prose: [
      '**The simplest case first: tiling a 2×n strip.** With only 2 rows, a domino-tiling count follows a clean recurrence: `ways(n) = ways(n-1) + ways(n-2)` — Fibonacci in disguise, again. Column n can be covered by one vertical domino (leaving a 2×(n-1) strip: `ways(n-1)` ways) or by two horizontal dominoes stacked in columns n-1 and n (leaving a 2×(n-2) strip: `ways(n-2)` ways). This works because with only 2 rows, "what protrudes into the next column" only ever has two possibilities (nothing protrudes, or a single specific shape) — simple enough that two named variables suffice, no explicit bitmask needed yet.',
      '**Why 3+ rows needs a genuine bitmask.** With 3 or more rows, far more shapes can protrude from one row into the next — any subset of the row\'s cells could already be filled by dominoes placed earlier. This is exactly a subset, and exactly what a bitmask represents: bit `r` of a mask means "row-position `r` in the CURRENT row is already filled in," where "already filled in" can mean either "decided earlier in this same row" or "protruding down from a vertical domino placed in the row above."',
      '**The state: dp[row][mask].** `dp[row][mask]` = number of ways to completely and validly tile every row before `row`, such that `mask` describes which cells of `row` are already pre-filled (by verticals reaching down from `row-1`). The transition from `dp[row][mask]` enumerates every way to fill the REMAINING (not-yet-filled) cells of `row`, using horizontal dominoes (which stay within `row`) and vertical dominoes (which reach into `row+1`, and therefore determine `row+1`\'s incoming mask). Each valid full-row completion contributes to `dp[row+1][nextMask]` for whatever `nextMask` that completion produces.',
      '**A helper recursion inside the DP: filling one row.** Because a single row can be completed in many different ways (many different subsets of vertical vs. horizontal placements), a small recursive helper enumerates them: walk the row column by column; if the current column is already filled (bit set in the incoming mask), skip it; otherwise, try placing a horizontal domino (if the next column is free) OR a vertical domino (marking that column as filled in the OUTGOING mask, for the next row to receive). This helper is itself a mini bitmask search — the outer DP calls it once per (row, mask) combination.',
      '**Base case and answer.** Before row 0, nothing protrudes: start the recursion with `dp[0][mask=0] = 1` (well-formed as "zero rows processed, nothing pending, one way to have done nothing"). After processing the last row, the tiling is only complete if NOTHING protrudes further (there is no row after the last one to catch a protrusion) — so the answer is `dp[numRows][mask=0]`, filtering out any completion that would have required a nonexistent extra row.',
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Chapter 3, Lesson 4: Broken Profile DP',
        body: '**Previous:** Bitmask BFS — Shortest Path Visiting All Nodes.\n**This lesson:** Broken Profile DP — domino tiling, a bitmask that represents a boundary between decided and undecided cells.\n**Next chapter:** Digit DP — counting numbers with digit-level constraints.',
      },
      {
        type: 'insight',
        title: 'The name "broken profile," explained',
        body: 'The "profile" is the boundary line between the rows already fully decided and the rows not yet touched. That boundary is "broken" (irregular, not a clean straight line) whenever a vertical domino crosses it, sticking out from the decided region into the undecided one. The bitmask exists entirely to describe the shape of that irregular boundary.',
      },
      {
        type: 'strategy',
        title: 'Two levels of recursion, two different jobs',
        body: '**Outer level (dp[row][mask]):** how many ways to have validly tiled everything up to this row, given what protrudes in. **Inner level (the row-filling helper):** for ONE specific incoming mask, what are all the valid ways to finish this one row, and what mask does each way leave behind for the next row? Keep these conceptually separate — the outer level calls the inner level once per (row, mask) state it needs.',
      },
      {
        type: 'warning',
        title: 'The final answer excludes any dangling protrusion',
        body: 'A vertical domino placed in the very last row would reach into a row that does not exist — invalid. This is naturally excluded by requiring the FINAL mask (after the last row) to be exactly 0 (nothing pending) — any recursive path that leaves a nonzero mask after the last row represents an incomplete or invalid tiling and must not be counted.',
      },
    ],
    visualizations: [
      {
        id: 'ScienceNotebook',
        title: 'Broken Profile: The Boundary Bitmask',
        caption: 'Watch a vertical domino create a "broken" (irregular) boundary that the next row must account for.',
        props: {
          lesson: {
            title: 'Broken Profile DP Step by Step',
            subtitle: 'Row by row, tracking which cells protrude.',
            sequential: true,
            cells: [
              {
                type: 'js',
                title: '2×n Tiling: Fibonacci in Disguise',
                instruction: 'With only 2 rows, the count follows ways(n) = ways(n-1) + ways(n-2) — the same recurrence as Fibonacci and Climbing Stairs from Chapter 1.',
                html: `<div id="d" style="padding:12px;font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;background:#0f172a;color:#e2e8f0}`,
                startCode: `const d = document.getElementById('d');
function ways2xN(n) {
  const dp = new Array(n + 1);
  dp[0] = 1; dp[1] = 1;
  for (let i = 2; i <= n; i++) dp[i] = dp[i-1] + dp[i-2];
  return dp;
}
const dp = ways2xN(8);
let html = '<div style="color:#60a5fa;margin-bottom:8px">Ways to tile a 2×n strip:</div>';
for (let i = 1; i <= 8; i++) {
  html += '<div style="padding:4px 10px;background:#1e293b;border-radius:4px;margin-bottom:3px;display:inline-block;margin-right:6px">2×' + i + ': <b style="color:#4ade80">' + dp[i] + '</b></div>';
}
html += '<div style="margin-top:10px;color:#94a3b8">Exactly the Fibonacci sequence — no bitmask needed yet, since only 2 rows means very few possible protrusion shapes.</div>';
d.innerHTML = html;`,
                outputHeight: 200,
              },
              {
                type: 'js',
                title: 'Filling One Row: The Helper Recursion',
                instruction: 'For a 3-row grid, given an incoming mask (which cells are pre-filled), watch every valid way to complete that one row, and the outgoing mask each way produces.',
                html: `<div id="d" style="padding:12px;font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;background:#0f172a;color:#e2e8f0}`,
                startCode: `const d = document.getElementById('d');
const rows = 3;
const results = [];

function fillRow(col, curMask, nextMask) {
  if (col === rows) { results.push(nextMask); return; }
  if (curMask & (1 << col)) { fillRow(col + 1, curMask, nextMask); return; }
  // horizontal domino: covers (col) and (col+1) in THIS row
  if (col + 1 < rows && !(curMask & (1 << (col + 1)))) {
    fillRow(col + 2, curMask, nextMask);
  }
  // vertical domino: covers (col) here and (col) in the NEXT row
  fillRow(col + 1, curMask, nextMask | (1 << col));
}

fillRow(0, 0, 0); // incoming mask = 0 (nothing pre-filled)

let html = '<div style="color:#60a5fa;margin-bottom:8px">All ways to fill a 3-cell row with incoming mask = 000:</div>';
results.forEach((nextMask, i) => {
  html += '<div style="padding:4px 10px;background:#1e293b;border-radius:4px;margin-bottom:3px">way ' + (i+1) + ': outgoing mask = <b style="color:#4ade80">' + nextMask.toString(2).padStart(3,'0') + '</b></div>';
});
html += '<div style="margin-top:10px;background:#172554;border-radius:6px;padding:8px 12px;color:#93c5fd">' + results.length + ' distinct ways to complete this one row.</div>';
d.innerHTML = html;`,
                outputHeight: 340,
              },
            ],
          },
        },
      },

      {
        id: 'JSNotebook',
        title: 'Build Broken Profile DP from Scratch',
        caption: 'The row-filling helper, then the full row-by-row DP.',
        props: {
          lesson: {
            title: 'Broken Profile DP in JavaScript',
            subtitle: 'A mini bitmask search inside a bigger bitmask DP.',
            cells: [
              {
                type: 'js',
                instruction: `## Step 1 — The Row-Filling Helper

Implement \`fillRow(col, rows, curMask, nextMask, results)\`, which pushes every valid outgoing mask onto \`results\` for one way of completing the current row. Two choices per free cell: a horizontal domino (needs the next column free too) or a vertical domino (marks this column in the outgoing mask).`,
                html: `<div id="out" style="font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;padding:14px;background:#0f172a;color:#e2e8f0;box-sizing:border-box;font-family:monospace}.pass{color:#4ade80;margin:2px 0}.fail{color:#f87171;margin:2px 0}`,
                startCode: `function fillRow(col, rows, curMask, nextMask, results) {
  if (col === rows) { results.push(nextMask); return; }
  if (curMask & (1 << col)) {
    fillRow(col + 1, rows, curMask, nextMask, results);
    return;
  }
  // TODO: horizontal domino — if (col+1 < rows) and column col+1 is free in curMask,
  //       recurse with fillRow(col + 2, rows, curMask, nextMask, results)
  // TODO: vertical domino — always allowed; recurse with
  //       fillRow(col + 1, rows, curMask, nextMask | (1 << col), results)
}

const out = document.getElementById('out');
function test(l, g, e) {
  const p = g === e;
  out.innerHTML += \`<div class="\${p?'pass':'fail'}">\${p?'✓':'✗'} \${l}: got \${g}, want \${e}</div>\`;
}

let results = [];
fillRow(0, 2, 0, 0, results);
test('2-row, empty incoming mask: number of ways', results.length, 2);

results = [];
fillRow(0, 3, 0, 0, results);
test('3-row, empty incoming mask: number of ways', results.length, 3);

results = [];
fillRow(0, 3, 0b010, 0, results);
test('3-row, middle cell pre-filled: number of ways', results.length, 1);`,
                solutionCode: `function fillRow(col, rows, curMask, nextMask, results) {
  if (col === rows) { results.push(nextMask); return; }
  if (curMask & (1 << col)) {
    fillRow(col + 1, rows, curMask, nextMask, results);
    return;
  }
  if (col + 1 < rows && !(curMask & (1 << (col + 1)))) {
    fillRow(col + 2, rows, curMask, nextMask, results);
  }
  fillRow(col + 1, rows, curMask, nextMask | (1 << col), results);
}

const out = document.getElementById('out');
function test(l, g, e) {
  const p = g === e;
  out.innerHTML += \`<div class="\${p?'pass':'fail'}">\${p?'✓':'✗'} \${l}: got \${g}, want \${e}</div>\`;
}

let results = [];
fillRow(0, 2, 0, 0, results);
test('2-row, empty incoming mask: number of ways', results.length, 2);

results = [];
fillRow(0, 3, 0, 0, results);
test('3-row, empty incoming mask: number of ways', results.length, 3);

results = [];
fillRow(0, 3, 0b010, 0, results);
test('3-row, middle cell pre-filled: number of ways', results.length, 1);`,
                outputHeight: 160,
              },
              {
                type: 'js',
                instruction: `## Step 2 — The Full Row-by-Row DP

Implement \`countTilings(rows, cols)\`, using \`fillRow\` from Step 1 as a helper. \`solve(col, mask)\` (renamed from row to col here since we sweep left to right) should sum contributions from every valid row-completion.`,
                html: `<div id="out" style="font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;padding:14px;background:#0f172a;color:#e2e8f0;box-sizing:border-box;font-family:monospace}.pass{color:#4ade80;margin:2px 0}.fail{color:#f87171;margin:2px 0}`,
                startCode: `function fillRow(col, rows, curMask, nextMask, results) {
  if (col === rows) { results.push(nextMask); return; }
  if (curMask & (1 << col)) {
    fillRow(col + 1, rows, curMask, nextMask, results);
    return;
  }
  if (col + 1 < rows && !(curMask & (1 << (col + 1)))) {
    fillRow(col + 2, rows, curMask, nextMask, results);
  }
  fillRow(col + 1, rows, curMask, nextMask | (1 << col), results);
}

function countTilings(rows, cols) {
  const memo = new Map();
  function solve(column, mask) {
    if (column === cols) return mask === 0 ? 1 : 0;
    const key = column * 1000 + mask;
    if (memo.has(key)) return memo.get(key);

    const results = [];
    fillRow(0, rows, mask, 0, results);
    let total = 0;
    for (const nextMask of results) {
      // TODO: total += solve(column + 1, nextMask)
    }
    memo.set(key, total);
    return total;
  }
  return solve(0, 0);
}

const out = document.getElementById('out');
function test(l, g, e) {
  const p = g === e;
  out.innerHTML += \`<div class="\${p?'pass':'fail'}">\${p?'✓':'✗'} \${l}: got \${g}, want \${e}</div>\`;
}

test('2x2', countTilings(2, 2), 2);
test('2x4', countTilings(2, 4), 5);
test('3x2', countTilings(3, 2), 3);
test('3x4', countTilings(3, 4), 11);`,
                solutionCode: `function fillRow(col, rows, curMask, nextMask, results) {
  if (col === rows) { results.push(nextMask); return; }
  if (curMask & (1 << col)) {
    fillRow(col + 1, rows, curMask, nextMask, results);
    return;
  }
  if (col + 1 < rows && !(curMask & (1 << (col + 1)))) {
    fillRow(col + 2, rows, curMask, nextMask, results);
  }
  fillRow(col + 1, rows, curMask, nextMask | (1 << col), results);
}

function countTilings(rows, cols) {
  const memo = new Map();
  function solve(column, mask) {
    if (column === cols) return mask === 0 ? 1 : 0;
    const key = column * 1000 + mask;
    if (memo.has(key)) return memo.get(key);

    const results = [];
    fillRow(0, rows, mask, 0, results);
    let total = 0;
    for (const nextMask of results) {
      total += solve(column + 1, nextMask);
    }
    memo.set(key, total);
    return total;
  }
  return solve(0, 0);
}

const out = document.getElementById('out');
function test(l, g, e) {
  const p = g === e;
  out.innerHTML += \`<div class="\${p?'pass':'fail'}">\${p?'✓':'✗'} \${l}: got \${g}, want \${e}</div>\`;
}

test('2x2', countTilings(2, 2), 2);
test('2x4', countTilings(2, 4), 5);
test('3x2', countTilings(3, 2), 3);
test('3x4', countTilings(3, 4), 11);`,
                outputHeight: 200,
              },
            ],
          },
        },
      },

      {
        id: 'PythonNotebook',
        title: 'Broken Profile DP in Python',
        caption: 'Build the full tiling counter with a bar chart across grid sizes.',
        props: {
          initialCells: [
            {
              type: 'code',
              language: 'python',
              label: 'Domino Tiling Count — Build and Verify',
              code: `from functools import lru_cache


def count_tilings(rows, cols):
    def fill_row(col, cur_mask, next_mask):
        if col == rows:
            return [next_mask]
        if cur_mask & (1 << col):
            return fill_row(col + 1, cur_mask, next_mask)
        results = []
        if col + 1 < rows and not (cur_mask & (1 << (col + 1))):
            results += fill_row(col + 2, cur_mask, next_mask)
        results += fill_row(col + 1, cur_mask, next_mask | (1 << col))
        return results

    @lru_cache(maxsize=None)
    def solve(column, mask):
        if column == cols:
            return 1 if mask == 0 else 0
        total = 0
        for next_mask in fill_row(0, mask, 0):
            total += solve(column + 1, next_mask)
        return total

    result = solve(0, 0)
    solve.cache_clear()
    return result


print(f"2x2: {count_tilings(2, 2)}")
print(f"2x4: {count_tilings(2, 4)}")
print(f"3x2: {count_tilings(3, 2)}")
print(f"3x4: {count_tilings(3, 4)}")
print(f"3x6: {count_tilings(3, 6)}")

assert count_tilings(2, 2) == 2
assert count_tilings(2, 4) == 5
assert count_tilings(3, 4) == 11
assert count_tilings(3, 6) == 41
print("Assertions passed!")`,
            },
            {
              type: 'code',
              language: 'python',
              label: 'Visualize: Tiling Counts Grow Fast',
              code: `import matplotlib.pyplot as plt
from functools import lru_cache


def count_tilings(rows, cols):
    def fill_row(col, cur_mask, next_mask):
        if col == rows:
            return [next_mask]
        if cur_mask & (1 << col):
            return fill_row(col + 1, cur_mask, next_mask)
        results = []
        if col + 1 < rows and not (cur_mask & (1 << (col + 1))):
            results += fill_row(col + 2, cur_mask, next_mask)
        results += fill_row(col + 1, cur_mask, next_mask | (1 << col))
        return results

    @lru_cache(maxsize=None)
    def solve(column, mask):
        if column == cols:
            return 1 if mask == 0 else 0
        total = 0
        for next_mask in fill_row(0, mask, 0):
            total += solve(column + 1, next_mask)
        return total

    result = solve(0, 0)
    solve.cache_clear()
    return result


sizes = [2, 4, 6, 8, 10]
counts_2row = [count_tilings(2, c) for c in sizes]
counts_3row = [count_tilings(3, c) for c in sizes]

print("2-row counts:", counts_2row)
print("3-row counts:", counts_3row)

fig, ax = plt.subplots(figsize=(8, 4), facecolor="#0f172a")
ax.set_facecolor("#0f172a")
ax.plot(sizes, counts_2row, "o-", color="#3b82f6", label="2 rows")
ax.plot(sizes, counts_3row, "o-", color="#8b5cf6", label="3 rows")
ax.set_yscale("log")
ax.set_xlabel("Number of columns", color="#94a3b8")
ax.set_ylabel("Number of tilings (log scale)", color="#94a3b8")
ax.set_title("Domino tiling counts grow exponentially with grid size", color="#e2e8f0")
ax.tick_params(colors="#94a3b8")
ax.legend(facecolor="#1e293b", edgecolor="#334155", labelcolor="#e2e8f0")
for sp in ax.spines.values(): sp.set_visible(False)
plt.tight_layout()
plt.show()`,
            },
            {
              type: 'code',
              language: 'python',
              challengeType: 'write',
              challengeNumber: 1,
              challengeTitle: 'Count tilings from scratch, 4 rows',
              difficulty: 'hard',
              prompt: 'Fill in fill_row (the row-completion helper) and solve (the outer DP) in count_tilings_scratch. Uncomment the assertions once ready.',
              hint: 'fill_row: two recursive branches per free column — horizontal (col+2, same mask) and vertical (col+1, mask with this bit set). solve: sum solve(column+1, next_mask) over every next_mask that fill_row produces.',
              label: 'From Scratch — 4-Row Tiling',
              code: `from functools import lru_cache


def count_tilings_scratch(rows, cols):
    def fill_row(col, cur_mask, next_mask):
        if col == rows:
            return [next_mask]
        if cur_mask & (1 << col):
            return fill_row(col + 1, cur_mask, next_mask)
        results = []
        # YOUR CODE HERE:
        # horizontal domino: if col + 1 < rows and column col+1 is free,
        #   results += fill_row(col + 2, cur_mask, next_mask)
        # vertical domino (always allowed):
        #   results += fill_row(col + 1, cur_mask, next_mask | (1 << col))
        return results

    @lru_cache(maxsize=None)
    def solve(column, mask):
        if column == cols:
            return 1 if mask == 0 else 0
        total = 0
        for next_mask in fill_row(0, mask, 0):
            # YOUR CODE HERE: total += solve(column + 1, next_mask)
            pass
        return total

    result = solve(0, 0)
    solve.cache_clear()
    return result


# --- Uncomment to test when ready ---
# result = count_tilings_scratch(4, 4)
# print(f"4x4 tiling count: {result}")
# assert result == 36, f"got {result}"
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
      text: 'Why does tiling a 2×n strip reduce to a simple Fibonacci-style recurrence, while 3+ rows needs a genuine bitmask?',
      options: [
        'Because Fibonacci only works for exactly 2 rows by mathematical coincidence',
        'With only 2 rows, the set of possible "what protrudes into the next column" shapes is small enough (essentially just two cases) that two named variables capture it. With 3 or more rows, any subset of the row could be pre-filled by earlier verticals — genuinely 2^rows possibilities, which is exactly what a bitmask is for',
        '3+ row tilings cannot actually be counted with dynamic programming at all',
      ],
      correct: 1,
    },
    {
      id: 'q2',
      type: 'choice',
      text: 'What does the bitmask in broken profile DP actually represent?',
      options: [
        'Which dominoes have been placed so far, in placement order',
        'Which cells of the CURRENT row are already filled in — either because they were decided earlier in this same row (horizontal domino) or because a vertical domino from the row above reaches down into them',
        'The total number of dominoes used so far',
      ],
      correct: 1,
    },
    {
      id: 'q3',
      type: 'choice',
      text: 'Why does broken profile DP need two levels of recursion (an outer dp[row][mask] and an inner row-filling helper), rather than one flat recursion?',
      options: [
        'It does not — this is just a stylistic choice with no functional reason',
        'The outer level asks "how many ways to have tiled everything up through this row, given what protrudes in," while the inner level answers a narrower question — "for this ONE specific incoming mask, what are all the ways to finish this ONE row, and what does each leave behind" — keeping these separate makes each level simple enough to get right',
        'Two levels of recursion are required by the JavaScript and Python language specifications for any bitmask problem',
      ],
      correct: 1,
    },
    {
      id: 'q4',
      type: 'choice',
      text: 'Why must the final answer require the mask to be exactly 0 after the last row/column, rather than accepting any mask?',
      options: [
        'A nonzero final mask represents a vertical domino reaching into a row that does not exist — an invalid, incomplete tiling that must not be counted',
        'A nonzero final mask is fine and represents an equally valid tiling',
        'The mask must be 0 at the START, not the end — the ending mask does not matter',
      ],
      correct: 0,
    },
  ],
};
