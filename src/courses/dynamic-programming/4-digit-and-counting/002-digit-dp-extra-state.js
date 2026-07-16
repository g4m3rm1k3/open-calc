export default {
  id: 'dp4-002',
  slug: 'digit-dp-extra-state',
  chapter: 'dp4',
  order: 2,
  title: 'Digit DP with Extra State: Digit Sums and Adjacency',
  subtitle: 'Adding dimensions to the recursion — sum-so-far, previous digit',
  tags: ['dynamic programming', 'digit dp', 'digit sum', 'extra state dimensions'],
  aliases: 'digit dp extra state digit sum constraint previous digit',

  hook: {
    question: 'How many integers from 1 to 999,999 have a digit sum of at most 20? "Digit sum" is not something you can determine just from (position, tight, started) — you need to actually track a running total as you build the number. Digit DP generalizes cleanly: whatever extra property you need to enforce, add it as one more parameter to the recursive state, exactly the way earlier chapters added extra dimensions to array and bitmask DP.',
    realWorldContext: 'Digit-sum constraints model real numeral-system rules: some cultures avoid phone numbers or addresses with unlucky digit-sum properties; ISBN and credit-card check-digit schemes are built on digit-sum-like invariants (Luhn\'s algorithm sums digits with alternating weights). More generally, "count numbers with a numeric property depending on the digits\' relationship to each other" — sums, adjacency, repeated digits — is the entire scope of digit DP once you know how to add a tracked quantity to the state.',
    previewVisualizationId: 'ScienceNotebook',
  },

  intuition: {
    prose: [
      '**Adding digit sum to the state.** `solve(pos, tight, started, sum_so_far)` — everything from Lesson 1 stays the same, plus one more parameter: the sum of digits chosen so far (only counting digits after `started` becomes true). At the base case (`pos == length`), check the final sum against the constraint: return 1 if `started` AND `sum_so_far <= K`, else 0.',
      '**Pruning early: do not wait until the end to check.** Since digit sums only ever increase (digits are non-negative), if `sum_so_far` ever exceeds `K` partway through, EVERY completion of the remaining digits will also exceed `K` — there is no way to "undo" an excess. Checking `if sum_so_far > K: return 0` immediately, before recursing further, prunes an entire subtree at once. This does not change correctness (the base case would have caught it eventually) but can meaningfully cut down the work in problems with larger `K`.',
      '**A different extra dimension: the previous digit.** For a constraint like "no two adjacent digits are equal," the state needs to remember the LAST digit placed (or a sentinel like `-1` if `started` is still false), so the next digit choice can be checked against it: `solve(pos, tight, started, prevDigit)`. At each step, skip any candidate digit equal to `prevDigit` (only relevant once `started` is true — a leading zero should not block the digit 0 from being the genuine first digit).',
      '**The general lesson: state dimensions are additive, not multiplicative in difficulty.** Each NEW constraint typically costs exactly one new parameter to the recursion, and the reasoning for each dimension is local: "what is the smallest additional fact a future digit choice needs to know, that isn\'t already captured by (pos, tight, started)?" You do not need to redesign the whole algorithm for each new rule — Chapter 1\'s 2D grids, Chapter 3\'s bitmask-plus-position, and this lesson\'s digit-sum-plus-adjacency all follow the identical principle: state carries forward exactly the information the future needs, nothing more, nothing less.',
      '**Complexity impact of extra dimensions.** Each additional tracked dimension multiplies the state space. `(pos, tight, started)` alone has roughly `length × 2 × 2` states. Adding `sum_so_far` (which can range up to `9 × length`) multiplies the state count by `O(length)`. Adding `prevDigit` (10 possible values plus "none") multiplies by roughly 11. This stays entirely tractable for digit DP specifically because `length` (the number of digits in N) is tiny — usually under 20 — even when N itself is astronomically large.',
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Chapter 4, Lesson 2: Digit DP with Extra State',
        body: '**Previous:** Digit DP Fundamentals — the tight/started state, counting without a forbidden digit.\n**This lesson:** Extra dimensions — digit sum constraints, adjacent-digit constraints.\n**Next:** Practice — combining constraints, counting with multiple simultaneous rules.',
      },
      {
        type: 'insight',
        title: 'One new rule, one new parameter — the general pattern',
        body: 'Digit sum constraint → add `sum_so_far`. No repeated adjacent digits → add `prev_digit`. No digit used more than once anywhere → add a bitmask of digits used (yes — bitmask DP and digit DP can combine directly, exactly as Chapter 3 taught). Whatever the constraint, ask: "what is the minimum extra fact a future digit needs to know?" — that fact becomes the new dimension.',
      },
      {
        type: 'strategy',
        title: 'Prune early when a running total can only get worse',
        body: 'If a tracked quantity (like digit sum) is monotonically non-decreasing as more digits are added, and the constraint is an upper bound, check the bound as soon as it is knowable — do not wait for the base case. This is the same "cut a subtree the moment it becomes provably useless" idea used across all of dynamic programming and backtracking.',
      },
      {
        type: 'warning',
        title: 'Do not track sum_so_far before "started"',
        body: 'While `started` is false, chosen 0s are placeholder leading zeros, not real digits — they must not contribute to `sum_so_far` (a leading-zero-padded "007" must have digit sum 7, not 0+0+7=7 coincidentally correct here, but consider "digit sum of 010" — the real number is 10, sum should be 1, not 0+1+0=1... actually also coincidentally fine; the real danger is digit COUNT or adjacency-style constraints, where counting a placeholder leading zero as a real "digit" or "previous digit" changes the answer). Gate every extra-state update behind `started` (or the digit\'s own contribution to becoming started) consistently.',
      },
    ],
    visualizations: [
      {
        id: 'ScienceNotebook',
        title: 'Digit Sum: One Extra Number Threaded Through the Recursion',
        caption: 'Watch sum_so_far accumulate, and watch pruning cut off entire subtrees once it exceeds the limit.',
        props: {
          lesson: {
            title: 'Digit DP with Extra State, Step by Step',
            subtitle: 'Digit sum as a fourth state dimension.',
            sequential: true,
            cells: [
              {
                type: 'js',
                title: 'Digit Sum DP: Watch the Running Total',
                instruction: 'Counting numbers up to 100 with digit sum at most 5. Watch sum_so_far grow as digits are chosen, and watch some branches get pruned.',
                html: `<div id="d" style="padding:12px;font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;background:#0f172a;color:#e2e8f0}`,
                startCode: `const d = document.getElementById('d');
const N = "100";
const digits = N.split('').map(Number);
const L = digits.length;
const K = 5;
let pruned = 0;
const log = [];

function solve(pos, tight, started, sumSoFar) {
  if (sumSoFar > K) { pruned++; return 0; }
  if (pos === L) return started ? 1 : 0;
  const limit = tight ? digits[pos] : 9;
  let total = 0;
  for (let dgt = 0; dgt <= limit; dgt++) {
    const newStarted = started || dgt > 0;
    const newSum = newStarted ? sumSoFar + dgt : 0;
    total += solve(pos + 1, tight && (dgt === limit), newStarted, newSum);
  }
  log.push({ pos, tight, started, sumSoFar, total });
  return total;
}
const answer = solve(0, true, false, 0);

let html = '<div style="color:#60a5fa;margin-bottom:8px">Sample of states explored (pos, sumSoFar so far):</div>';
log.slice(0, 12).forEach(e => {
  html += '<div style="padding:3px 10px;background:#1e293b;border-radius:4px;margin-bottom:2px;font-size:12px">pos=' + e.pos + '  tight=' + e.tight + '  sum=' + e.sumSoFar + '  &rarr; count=<b style="color:#4ade80">' + e.total + '</b></div>';
});
html += '<div style="margin-top:10px;background:#052e16;border-radius:6px;padding:8px 12px;color:#4ade80">Answer: ' + answer + ' numbers (1-100) with digit sum &le; ' + K + '. Pruned ' + pruned + ' times when sum exceeded ' + K + '.</div>';
d.innerHTML = html;`,
                outputHeight: 380,
              },
              {
                type: 'js',
                title: 'Adjacent-Digit Constraint: Tracking prevDigit',
                instruction: 'A different extra dimension: the previous digit, to forbid two equal digits in a row.',
                html: `<div id="d" style="padding:12px;font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;background:#0f172a;color:#e2e8f0}`,
                startCode: `const d = document.getElementById('d');
const N = "100";
const digits = N.split('').map(Number);
const L = digits.length;

function solve(pos, tight, started, prevDigit) {
  if (pos === L) return started ? 1 : 0;
  const limit = tight ? digits[pos] : 9;
  let total = 0;
  for (let dgt = 0; dgt <= limit; dgt++) {
    if (started && dgt === prevDigit) continue; // forbid repeat
    const newStarted = started || dgt > 0;
    total += solve(pos + 1, tight && (dgt === limit), newStarted, newStarted ? dgt : -1);
  }
  return total;
}
const answer = solve(0, true, false, -1);

let html = '<div style="color:#60a5fa;margin-bottom:10px">Numbers 1-100 with no two adjacent equal digits (e.g. 11, 22, 33, ..., 99 excluded):</div>';
html += '<div style="background:#052e16;border-radius:6px;padding:8px 12px;color:#4ade80">Answer: ' + answer + '</div>';
html += '<div style="margin-top:10px;color:#94a3b8;font-size:12px">Check: 100 total minus 9 repeated-digit two-digit numbers (11,22,...,99) minus... (100 itself has digits 1,0,0 -- adjacent 0,0 repeats, so it is excluded too)</div>';
d.innerHTML = html;`,
                outputHeight: 240,
              },
            ],
          },
        },
      },

      {
        id: 'JSNotebook',
        title: 'Build Extra-State Digit DP from Scratch',
        caption: 'Digit sum constraint, then adjacent-digit constraint.',
        props: {
          lesson: {
            title: 'Digit DP Extra State in JavaScript',
            subtitle: 'One new parameter per new rule.',
            cells: [
              {
                type: 'js',
                instruction: `## Step 1 — Digit Sum Constraint

Implement \`countDigitSumAtMost(n, k)\`: count numbers from 1 to n whose digits sum to at most k. Add \`sumSoFar\` as a fourth parameter, only incrementing it once \`started\` is true.`,
                html: `<div id="out" style="font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;padding:14px;background:#0f172a;color:#e2e8f0;box-sizing:border-box;font-family:monospace}.pass{color:#4ade80;margin:2px 0}.fail{color:#f87171;margin:2px 0}`,
                startCode: `function countDigitSumAtMost(n, k) {
  const digits = String(n).split('').map(Number);
  const L = digits.length;

  function solve(pos, tight, started, sumSoFar) {
    if (sumSoFar > k) return 0;
    if (pos === L) return started ? 1 : 0;
    const limit = tight ? digits[pos] : 9;
    let total = 0;
    for (let d = 0; d <= limit; d++) {
      // TODO: newStarted = started || d > 0
      // TODO: newSum = newStarted ? sumSoFar + d : 0
      // TODO: total += solve(pos + 1, tight && (d === limit), newStarted, newSum)
    }
    return total;
  }

  return solve(0, true, false, 0);
}

const out = document.getElementById('out');
function test(l, g, e) {
  const p = g === e;
  out.innerHTML += \`<div class="\${p?'pass':'fail'}">\${p?'✓':'✗'} \${l}: got \${g}, want \${e}</div>\`;
}

test('countDigitSumAtMost(100, 5)', countDigitSumAtMost(100, 5), 21);
test('countDigitSumAtMost(500, 10)', countDigitSumAtMost(500, 10), 228);
test('countDigitSumAtMost(9999, 20)', countDigitSumAtMost(9999, 20), 6627);`,
                solutionCode: `function countDigitSumAtMost(n, k) {
  const digits = String(n).split('').map(Number);
  const L = digits.length;

  function solve(pos, tight, started, sumSoFar) {
    if (sumSoFar > k) return 0;
    if (pos === L) return started ? 1 : 0;
    const limit = tight ? digits[pos] : 9;
    let total = 0;
    for (let d = 0; d <= limit; d++) {
      const newStarted = started || d > 0;
      const newSum = newStarted ? sumSoFar + d : 0;
      total += solve(pos + 1, tight && (d === limit), newStarted, newSum);
    }
    return total;
  }

  return solve(0, true, false, 0);
}

const out = document.getElementById('out');
function test(l, g, e) {
  const p = g === e;
  out.innerHTML += \`<div class="\${p?'pass':'fail'}">\${p?'✓':'✗'} \${l}: got \${g}, want \${e}</div>\`;
}

test('countDigitSumAtMost(100, 5)', countDigitSumAtMost(100, 5), 21);
test('countDigitSumAtMost(500, 10)', countDigitSumAtMost(500, 10), 228);
test('countDigitSumAtMost(9999, 20)', countDigitSumAtMost(9999, 20), 6627);`,
                outputHeight: 160,
              },
              {
                type: 'js',
                instruction: `## Step 2 — Adjacent-Digit Constraint

Implement \`countNoAdjacentEqual(n)\`: count numbers from 1 to n with no two consecutive equal digits. Track \`prevDigit\` (use -1 while not started) as the fourth parameter.`,
                html: `<div id="out" style="font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;padding:14px;background:#0f172a;color:#e2e8f0;box-sizing:border-box;font-family:monospace}.pass{color:#4ade80;margin:2px 0}.fail{color:#f87171;margin:2px 0}`,
                startCode: `function countNoAdjacentEqual(n) {
  const digits = String(n).split('').map(Number);
  const L = digits.length;

  function solve(pos, tight, started, prevDigit) {
    if (pos === L) return started ? 1 : 0;
    const limit = tight ? digits[pos] : 9;
    let total = 0;
    for (let d = 0; d <= limit; d++) {
      if (started && d === prevDigit) continue;
      // TODO: newStarted = started || d > 0
      // TODO: newPrev = newStarted ? d : -1
      // TODO: total += solve(pos + 1, tight && (d === limit), newStarted, newPrev)
    }
    return total;
  }

  return solve(0, true, false, -1);
}

const out = document.getElementById('out');
function test(l, g, e) {
  const p = g === e;
  out.innerHTML += \`<div class="\${p?'pass':'fail'}">\${p?'✓':'✗'} \${l}: got \${g}, want \${e}</div>\`;
}

test('countNoAdjacentEqual(20)', countNoAdjacentEqual(20), 19);
test('countNoAdjacentEqual(100)', countNoAdjacentEqual(100), 90);
test('countNoAdjacentEqual(555)', countNoAdjacentEqual(555), 459);`,
                solutionCode: `function countNoAdjacentEqual(n) {
  const digits = String(n).split('').map(Number);
  const L = digits.length;

  function solve(pos, tight, started, prevDigit) {
    if (pos === L) return started ? 1 : 0;
    const limit = tight ? digits[pos] : 9;
    let total = 0;
    for (let d = 0; d <= limit; d++) {
      if (started && d === prevDigit) continue;
      const newStarted = started || d > 0;
      const newPrev = newStarted ? d : -1;
      total += solve(pos + 1, tight && (d === limit), newStarted, newPrev);
    }
    return total;
  }

  return solve(0, true, false, -1);
}

const out = document.getElementById('out');
function test(l, g, e) {
  const p = g === e;
  out.innerHTML += \`<div class="\${p?'pass':'fail'}">\${p?'✓':'✗'} \${l}: got \${g}, want \${e}</div>\`;
}

test('countNoAdjacentEqual(20)', countNoAdjacentEqual(20), 19);
test('countNoAdjacentEqual(100)', countNoAdjacentEqual(100), 90);
test('countNoAdjacentEqual(555)', countNoAdjacentEqual(555), 459);`,
                outputHeight: 160,
              },
            ],
          },
        },
      },

      {
        id: 'PythonNotebook',
        title: 'Extra-State Digit DP in Python',
        caption: 'Digit sum constraint with a visualization, then a from-scratch adjacency challenge.',
        props: {
          initialCells: [
            {
              type: 'code',
              language: 'python',
              label: 'Digit Sum Constraint — Build and Verify',
              code: `from functools import lru_cache


def count_digit_sum_at_most(n, k):
    digits = list(map(int, str(n)))
    length = len(digits)

    @lru_cache(maxsize=None)
    def solve(pos, tight, started, sum_so_far):
        if sum_so_far > k:
            return 0
        if pos == length:
            return 1 if started else 0
        limit = digits[pos] if tight else 9
        total = 0
        for d in range(0, limit + 1):
            new_started = started or d > 0
            new_sum = sum_so_far + d if new_started else 0
            new_tight = tight and (d == limit)
            total += solve(pos + 1, new_tight, new_started, new_sum)
        return total

    result = solve(0, True, False, 0)
    solve.cache_clear()
    return result


for n, k in [(100, 5), (500, 10), (9999, 20)]:
    print(f"count_digit_sum_at_most({n}, {k}) = {count_digit_sum_at_most(n, k)}")

assert count_digit_sum_at_most(100, 5) == 21
assert count_digit_sum_at_most(9999, 20) == 6627
print("Assertions passed!")`,
            },
            {
              type: 'code',
              language: 'python',
              label: 'Visualize: How the Count Changes with K',
              code: `import matplotlib.pyplot as plt
from functools import lru_cache


def count_digit_sum_at_most(n, k):
    digits = list(map(int, str(n)))
    length = len(digits)

    @lru_cache(maxsize=None)
    def solve(pos, tight, started, sum_so_far):
        if sum_so_far > k:
            return 0
        if pos == length:
            return 1 if started else 0
        limit = digits[pos] if tight else 9
        total = 0
        for d in range(0, limit + 1):
            new_started = started or d > 0
            new_sum = sum_so_far + d if new_started else 0
            new_tight = tight and (d == limit)
            total += solve(pos + 1, new_tight, new_started, new_sum)
        return total

    result = solve(0, True, False, 0)
    solve.cache_clear()
    return result


n = 999
k_values = list(range(1, 26))
counts = [count_digit_sum_at_most(n, k) for k in k_values]

fig, ax = plt.subplots(figsize=(8, 4), facecolor="#0f172a")
ax.set_facecolor("#0f172a")
ax.plot(k_values, counts, "o-", color="#4ade80")
ax.set_xlabel("K (max allowed digit sum)", color="#94a3b8")
ax.set_ylabel(f"Count of numbers 1..{n} qualifying", color="#94a3b8")
ax.set_title(f"How many of 1..{n} have digit sum ≤ K, as K increases", color="#e2e8f0")
ax.tick_params(colors="#94a3b8")
for sp in ax.spines.values(): sp.set_visible(False)
plt.tight_layout()
plt.show()
print(f"At K=25, count = {counts[-1]} — not quite all {n}, since 4 numbers (999, 998, 989, 899) have digit sum 26 or 27, above 25")`,
            },
            {
              type: 'code',
              language: 'python',
              challengeType: 'write',
              challengeNumber: 1,
              challengeTitle: 'Count numbers with no two adjacent equal digits',
              difficulty: 'medium',
              prompt: 'Fill in the solve() recursion in count_no_adjacent_equal(n): track prev_digit as a fourth state parameter (use -1 while not started), and skip any digit equal to prev_digit once started. Uncomment the assertions once ready.',
              hint: 'if started and d == prev_digit: continue (skip this digit choice). Otherwise recurse exactly like the digit-sum cell, but threading prev_digit instead of sum_so_far.',
              label: 'From Scratch — No Adjacent Equal Digits',
              code: `from functools import lru_cache


def count_no_adjacent_equal(n):
    digits = list(map(int, str(n)))
    length = len(digits)

    @lru_cache(maxsize=None)
    def solve(pos, tight, started, prev_digit):
        if pos == length:
            return 1 if started else 0
        limit = digits[pos] if tight else 9
        total = 0
        for d in range(0, limit + 1):
            if started and d == prev_digit:
                continue
            # YOUR CODE HERE:
            # new_started = started or d > 0
            # new_prev = d if new_started else -1
            # new_tight = tight and (d == limit)
            # total += solve(pos + 1, new_tight, new_started, new_prev)
            pass
        return total

    result = solve(0, True, False, -1)
    solve.cache_clear()
    return result


# --- Uncomment to test when ready ---
# assert count_no_adjacent_equal(54321) == 36803, f"got {count_no_adjacent_equal(54321)}"
# print("count_no_adjacent_equal(54321):", count_no_adjacent_equal(54321))
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
      text: 'What is the general procedure for adding a new constraint to a digit DP recursion?',
      options: [
        'Rewrite the entire algorithm from scratch, since every new constraint requires a fundamentally different technique',
        'Identify the minimum additional fact a future digit choice needs to know that (pos, tight, started) does not already capture, and add exactly that as one more recursion parameter — a running sum, the previous digit, a bitmask of digits used, etc.',
        'Add a nested loop over all possible values of the new constraint outside the digit-by-digit recursion entirely',
      ],
      correct: 1,
    },
    {
      id: 'q2',
      type: 'choice',
      text: 'Why can a digit-sum constraint be safely pruned early (returning 0 as soon as sum_so_far exceeds K), rather than only checking at the base case?',
      options: [
        'Because digit sums are always exactly equal to K at the correct answer',
        'Digit sums only increase as more (non-negative) digits are added — once the running sum exceeds K, no possible completion of the remaining digits can bring it back down, so every path through that state is guaranteed to fail regardless of what follows',
        'Early pruning is only a performance trick with no logical justification — it happens to give the same answer by coincidence',
      ],
      correct: 1,
    },
    {
      id: 'q3',
      type: 'choice',
      text: 'For the "no two adjacent equal digits" constraint, why must prevDigit use a sentinel value (like -1) while started is still false, rather than defaulting to 0?',
      options: [
        'Using 0 as the default would incorrectly forbid the genuine first digit from being 0 in some edge case, and more importantly would treat "no digit chosen yet" as if a real digit 0 had already been placed, which could incorrectly block a legitimate next digit of 0 from being chosen as the actual first digit',
        'JavaScript and Python require a sentinel value for any function parameter that has not been assigned yet',
        'It does not matter — using 0 as the default produces identical results in every case',
      ],
      correct: 0,
    },
    {
      id: 'q4',
      type: 'choice',
      text: 'How does adding a tracked quantity like digit sum affect the size of the state space, and why does digit DP stay tractable anyway?',
      options: [
        'It has no effect — the state space size is always exactly 2 regardless of how many dimensions are tracked',
        'Each additional dimension multiplies the total number of distinct states (e.g., digit sum can add a factor of roughly length, since the sum ranges up to about 9 × length) — this stays tractable specifically because "length" (the number of digits in N) is tiny, typically under 20, even when N itself is astronomically large',
        'Adding dimensions always makes the problem exponentially harder with no way to keep it tractable',
      ],
      correct: 1,
    },
  ],
};
