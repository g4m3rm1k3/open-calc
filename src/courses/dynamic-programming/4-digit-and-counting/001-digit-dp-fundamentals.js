export default {
  id: 'dp4-001',
  slug: 'digit-dp-fundamentals',
  chapter: 'dp4',
  order: 1,
  title: 'Digit DP: Counting Numbers by Their Digits',
  subtitle: 'The "tight" state — building numbers one digit at a time, bounded by N',
  tags: ['dynamic programming', 'digit dp', 'tight bound', 'counting problems'],
  aliases: 'digit dp tight bound counting numbers with a property',

  hook: {
    question: 'How many integers from 1 to 9,999,999,999 do NOT contain the digit 7 anywhere? Checking each number one at a time is 10 billion iterations. But every one of those numbers is just a sequence of at most 10 digits — and the property "contains no 7" can be checked digit by digit as you BUILD the number, left to right, never needing to look at an actual number bigger than a single digit at a time. Digit DP counts numbers satisfying a property by constructing them digit by digit, using DP to avoid recomputing the same "partial number so far" situation twice.',
    realWorldContext: 'Digit DP answers "how many numbers in this range have property X" — a common building block in number-theory competitive programming, and in real systems that validate numeric formats: counting how many valid account numbers, phone numbers, or serial numbers exist under a digit-pattern constraint (no repeated digits, digit sum in range, no forbidden digit), without generating and checking every single one.',
    previewVisualizationId: 'ScienceNotebook',
  },

  intuition: {
    prose: [
      '**Numbers as digit sequences, built left to right.** Any integer up to N can be thought of as a sequence of digits, built one position at a time, left (most significant) to right (least significant). At each position, you choose a digit — but you cannot choose ANY digit freely, because the number you are building must not exceed N.',
      '**The "tight" flag — the entire trick.** At each digit position, you are in one of two situations: either every digit chosen SO FAR exactly matches N\'s corresponding digits (you are "tight" against the bound — still walking the edge, and the NEXT digit is limited to at most N\'s digit at this position), or some earlier digit was chosen strictly LESS than N\'s digit at that position (you have "broken free" — every remaining digit can be anything 0-9, since the number is already guaranteed smaller than N regardless of what follows). Once `tight` becomes false, it can never become true again — you cannot un-break-free.',
      '**The recurrence.** `solve(pos, tight, started)`: at digit position `pos`, with `tight` and `started` (whether a nonzero digit has appeared yet, to correctly handle leading zeros) as described. The allowed digits at this position are `0..9` if not tight, or `0..N[pos]` if tight. For each candidate digit `d`, recurse into `solve(pos+1, tight AND (d == N[pos]), started OR d > 0)`. The base case, `pos == length`, returns 1 if `started` (a real, complete number was built) or 0 (only leading zeros — this represents zero itself, not a positive integer).',
      '**Why memoization works despite "tight" varying.** It might seem like `tight` makes every path through the recursion unique (since it depends on comparing against N\'s specific digits). But `tight` is only ever `true` along a SINGLE path — the one still exactly matching N so far — for any given `pos`. Every OTHER combination of `(pos, tight=false, started)` is identical regardless of how you arrived there, because once free of the bound, the only thing that matters going forward is which property-tracking state (like `started`, or later, a digit sum) you carry. This is why `(pos, tight, started, ...)` is memoizable: the number of DISTINCT reachable states is small (roughly `length × 2 × 2`), even though the number of PATHS through the recursion (corresponding to actual numbers) can be enormous.',
      '**Counting a range [L, R].** To count numbers with a property in `[L, R]`, compute `count(R) - count(L-1)`, where `count(X)` counts qualifying numbers in `[1, X]` (or `[0, X]`, adjusted consistently) using the recurrence above. This is the same "prefix subtraction" trick used for range-sum queries elsewhere — count up to the far end, count up to just before the near end, subtract.',
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Chapter 4, Lesson 1: Digit DP Fundamentals',
        body: '**Previous (Chapter 3):** Bitmask DP — TSP, Assignment, Bitmask BFS, Broken Profile.\n**This lesson:** Digit DP — the tight-bound state, counting numbers without a forbidden digit.\n**Next:** Digit DP with extra dimensions — digit-sum constraints, adjacent-digit constraints.',
      },
      {
        type: 'insight',
        title: 'The "tight" flag, restated plainly',
        body: '`tight = true` means: "every digit chosen so far equals N\'s digit at that position — I am still walking exactly along N\'s boundary, so my next digit is capped." `tight = false` means: "I already went strictly below N at some earlier position — I have total freedom from here on, since the number is already guaranteed to fit." Tight can only turn off, never back on.',
      },
      {
        type: 'strategy',
        title: 'Why "started" matters — leading zeros are not real digits',
        body: 'If you allow a leading zero to count as "digit 0 chosen," you would treat the number 007 as a 3-digit number with a real leading zero, which is wrong — 007 IS just 7, a 1-digit number. The `started` flag tracks whether a nonzero digit has appeared yet; while `started` is false, a chosen 0 is a "not-yet-started" placeholder, not a real digit — this matters for constraints like digit sum or digit count that must only apply to the digits that actually exist.',
      },
      {
        type: 'warning',
        title: 'Memoize on the STATE, never on the actual digits chosen',
        body: 'The cache key must be `(pos, tight, started, ...any other tracked property)` — NOT the specific digit sequence built so far. Two completely different digit sequences that arrive at the same `(pos, tight, started)` combination have IDENTICAL futures and must share one cache entry; caching on the actual sequence would give zero benefit; caching on too little (e.g., forgetting `started`) gives WRONG answers by conflating states that are not actually equivalent.',
      },
    ],
    visualizations: [
      {
        id: 'ScienceNotebook',
        title: 'Digit DP: Building Numbers Digit by Digit',
        caption: 'Watch the tight flag turn off exactly once per path, and watch how few distinct states actually exist.',
        props: {
          lesson: {
            title: 'Digit DP Step by Step',
            subtitle: 'Counting numbers without digit 7, up to a bound N.',
            sequential: true,
            cells: [
              {
                type: 'js',
                title: 'Brute Force: Check Every Number',
                instruction: 'For small N, brute force works — but watch how many numbers must be checked even for N as small as 100.',
                html: `<div id="d" style="padding:12px;font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;background:#0f172a;color:#e2e8f0}`,
                startCode: `const d = document.getElementById('d');
function bruteNoSeven(n) {
  let count = 0;
  const examples = [];
  for (let i = 1; i <= n; i++) {
    if (!String(i).includes('7')) {
      count++;
      if (examples.length < 15) examples.push(i);
    }
  }
  return { count, examples };
}
const { count, examples } = bruteNoSeven(100);
let html = '<div style="color:#60a5fa;margin-bottom:8px">Numbers 1-100 without digit 7 (first 15 shown):</div>';
html += '<div style="color:#4ade80">' + examples.join(', ') + ', ...</div>';
html += '<div style="margin-top:10px;background:#052e16;border-radius:6px;padding:8px 12px;color:#4ade80">Total: ' + count + ' out of 100 numbers checked one by one.</div>';
d.innerHTML = html;`,
                outputHeight: 200,
              },
              {
                type: 'js',
                title: 'Digit DP: Build Instead of Check',
                instruction: 'Watch the recursion explore (position, tight, started) states, never looking at an actual multi-digit number.',
                html: `<div id="d" style="padding:12px;font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;background:#0f172a;color:#e2e8f0}`,
                startCode: `const d = document.getElementById('d');
const N = "100";
const digits = N.split('').map(Number);
const L = digits.length;
const memo = new Map();
const log = [];

function solve(pos, tight, started) {
  if (pos === L) return started ? 1 : 0;
  const key = pos + ',' + tight + ',' + started;
  if (memo.has(key)) return memo.get(key);
  const limit = tight ? digits[pos] : 9;
  let total = 0;
  for (let dgt = 0; dgt <= limit; dgt++) {
    if (dgt === 7) continue;
    const newStarted = started || dgt > 0;
    const newTight = tight && (dgt === limit);
    total += solve(pos + 1, newTight, newStarted);
  }
  memo.set(key, total);
  log.push({ pos, tight, started, total });
  return total;
}
const answer = solve(0, true, false);

let html = '<div style="color:#60a5fa;margin-bottom:8px">Distinct (position, tight, started) states explored:</div>';
log.forEach(e => {
  html += '<div style="padding:3px 10px;background:#1e293b;border-radius:4px;margin-bottom:2px;font-size:12px">pos=' + e.pos + '  tight=' + e.tight + '  started=' + e.started + '  &rarr; count from here=<b style="color:#4ade80">' + e.total + '</b></div>';
});
html += '<div style="margin-top:10px;background:#052e16;border-radius:6px;padding:8px 12px;color:#4ade80">Answer: ' + answer + ' — same as brute force, but only ' + log.length + ' distinct states computed (not 100 numbers checked).</div>';
d.innerHTML = html;`,
                outputHeight: 400,
              },
            ],
          },
        },
      },

      {
        id: 'JSNotebook',
        title: 'Build Digit DP from Scratch',
        caption: 'The tight/started state, then counting without a forbidden digit.',
        props: {
          lesson: {
            title: 'Digit DP in JavaScript',
            subtitle: 'Build numbers digit by digit instead of checking each one.',
            cells: [
              {
                type: 'js',
                instruction: `## Step 1 — Count Numbers Without Digit 7

Implement \`countWithoutSeven(n)\`. At each position, try every digit from 0 to the current limit (n's digit if tight, else 9), skipping 7, and recurse.`,
                html: `<div id="out" style="font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;padding:14px;background:#0f172a;color:#e2e8f0;box-sizing:border-box;font-family:monospace}.pass{color:#4ade80;margin:2px 0}.fail{color:#f87171;margin:2px 0}`,
                startCode: `function countWithoutSeven(n) {
  const digits = String(n).split('').map(Number);
  const L = digits.length;
  const memo = new Map();

  function solve(pos, tight, started) {
    if (pos === L) return started ? 1 : 0;
    const key = pos + ',' + tight + ',' + started;
    if (!tight && memo.has(key)) return memo.get(key);

    const limit = tight ? digits[pos] : 9;
    let total = 0;
    for (let d = 0; d <= limit; d++) {
      if (d === 7) continue;
      // TODO: newStarted = started || d > 0
      // TODO: newTight = tight && (d === limit)
      // TODO: total += solve(pos + 1, newTight, newStarted)
    }
    if (!tight) memo.set(key, total);
    return total;
  }

  return solve(0, true, false);
}

const out = document.getElementById('out');
function test(l, g, e) {
  const p = g === e;
  out.innerHTML += \`<div class="\${p?'pass':'fail'}">\${p?'✓':'✗'} \${l}: got \${g}, want \${e}</div>\`;
}

test('countWithoutSeven(9)', countWithoutSeven(9), 8);
test('countWithoutSeven(20)', countWithoutSeven(20), 18);
test('countWithoutSeven(77)', countWithoutSeven(77), 62);
test('countWithoutSeven(100)', countWithoutSeven(100), 81);`,
                solutionCode: `function countWithoutSeven(n) {
  const digits = String(n).split('').map(Number);
  const L = digits.length;
  const memo = new Map();

  function solve(pos, tight, started) {
    if (pos === L) return started ? 1 : 0;
    const key = pos + ',' + tight + ',' + started;
    if (!tight && memo.has(key)) return memo.get(key);

    const limit = tight ? digits[pos] : 9;
    let total = 0;
    for (let d = 0; d <= limit; d++) {
      if (d === 7) continue;
      const newStarted = started || d > 0;
      const newTight = tight && (d === limit);
      total += solve(pos + 1, newTight, newStarted);
    }
    if (!tight) memo.set(key, total);
    return total;
  }

  return solve(0, true, false);
}

const out = document.getElementById('out');
function test(l, g, e) {
  const p = g === e;
  out.innerHTML += \`<div class="\${p?'pass':'fail'}">\${p?'✓':'✗'} \${l}: got \${g}, want \${e}</div>\`;
}

test('countWithoutSeven(9)', countWithoutSeven(9), 8);
test('countWithoutSeven(20)', countWithoutSeven(20), 18);
test('countWithoutSeven(77)', countWithoutSeven(77), 62);
test('countWithoutSeven(100)', countWithoutSeven(100), 81);`,
                outputHeight: 160,
              },
              {
                type: 'js',
                instruction: `## Step 2 — Count a Range [L, R]

Implement \`countInRange(l, r)\`, reusing \`countWithoutSeven\` via the prefix-subtraction trick: count up to r, subtract count up to l-1.`,
                html: `<div id="out" style="font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;padding:14px;background:#0f172a;color:#e2e8f0;box-sizing:border-box;font-family:monospace}.pass{color:#4ade80;margin:2px 0}.fail{color:#f87171;margin:2px 0}`,
                startCode: `function countWithoutSeven(n) {
  if (n <= 0) return 0;
  const digits = String(n).split('').map(Number);
  const L = digits.length;
  const memo = new Map();
  function solve(pos, tight, started) {
    if (pos === L) return started ? 1 : 0;
    const key = pos + ',' + tight + ',' + started;
    if (!tight && memo.has(key)) return memo.get(key);
    const limit = tight ? digits[pos] : 9;
    let total = 0;
    for (let d = 0; d <= limit; d++) {
      if (d === 7) continue;
      total += solve(pos + 1, tight && (d === limit), started || d > 0);
    }
    if (!tight) memo.set(key, total);
    return total;
  }
  return solve(0, true, false);
}

function countInRange(l, r) {
  // TODO: return countWithoutSeven(r) - countWithoutSeven(l - 1)
}

const out = document.getElementById('out');
function test(l, g, e) {
  const p = g === e;
  out.innerHTML += \`<div class="\${p?'pass':'fail'}">\${p?'✓':'✗'} \${l}: got \${g}, want \${e}</div>\`;
}

test('countInRange(1, 100)', countInRange(1, 100), 81);
test('countInRange(70, 79) (every number here has a 7 in the tens place)', countInRange(70, 79), 0);
test('countInRange(50, 100)', countInRange(50, 100), countWithoutSeven(100) - countWithoutSeven(49));`,
                solutionCode: `function countWithoutSeven(n) {
  if (n <= 0) return 0;
  const digits = String(n).split('').map(Number);
  const L = digits.length;
  const memo = new Map();
  function solve(pos, tight, started) {
    if (pos === L) return started ? 1 : 0;
    const key = pos + ',' + tight + ',' + started;
    if (!tight && memo.has(key)) return memo.get(key);
    const limit = tight ? digits[pos] : 9;
    let total = 0;
    for (let d = 0; d <= limit; d++) {
      if (d === 7) continue;
      total += solve(pos + 1, tight && (d === limit), started || d > 0);
    }
    if (!tight) memo.set(key, total);
    return total;
  }
  return solve(0, true, false);
}

function countInRange(l, r) {
  return countWithoutSeven(r) - countWithoutSeven(l - 1);
}

const out = document.getElementById('out');
function test(l, g, e) {
  const p = g === e;
  out.innerHTML += \`<div class="\${p?'pass':'fail'}">\${p?'✓':'✗'} \${l}: got \${g}, want \${e}</div>\`;
}

test('countInRange(1, 100)', countInRange(1, 100), 81);
test('countInRange(70, 79) (every number here has a 7 in the tens place)', countInRange(70, 79), 0);
test('countInRange(50, 100)', countInRange(50, 100), countWithoutSeven(100) - countWithoutSeven(49));`,
                outputHeight: 160,
              },
            ],
          },
        },
      },

      {
        id: 'PythonNotebook',
        title: 'Digit DP in Python',
        caption: 'Build the tight/started recursion, visualize how few states are actually explored, then a from-scratch challenge.',
        props: {
          initialCells: [
            {
              type: 'code',
              language: 'python',
              label: 'Count Without Digit 7 — Build and Verify',
              code: `from functools import lru_cache


def count_without_seven(n):
    if n <= 0:
        return 0
    digits = list(map(int, str(n)))
    length = len(digits)

    @lru_cache(maxsize=None)
    def solve(pos, tight, started):
        if pos == length:
            return 1 if started else 0
        limit = digits[pos] if tight else 9
        total = 0
        for d in range(0, limit + 1):
            if d == 7:
                continue
            new_started = started or d > 0
            new_tight = tight and (d == limit)
            total += solve(pos + 1, new_tight, new_started)
        return total

    result = solve(0, True, False)
    solve.cache_clear()
    return result


for n in [9, 20, 77, 100, 12345]:
    print(f"count_without_seven({n}) = {count_without_seven(n)}")

assert count_without_seven(9) == 8
assert count_without_seven(100) == 81
assert count_without_seven(12345) == 8303
print("Assertions passed!")`,
            },
            {
              type: 'code',
              language: 'python',
              label: 'Visualize: How Few States Are Actually Explored',
              code: `import matplotlib.pyplot as plt
from functools import lru_cache


def count_without_seven_with_stats(n):
    digits = list(map(int, str(n)))
    length = len(digits)
    call_count = [0]

    @lru_cache(maxsize=None)
    def solve(pos, tight, started):
        call_count[0] += 1
        if pos == length:
            return 1 if started else 0
        limit = digits[pos] if tight else 9
        total = 0
        for d in range(0, limit + 1):
            if d == 7:
                continue
            new_started = started or d > 0
            new_tight = tight and (d == limit)
            total += solve(pos + 1, new_tight, new_started)
        return total

    result = solve(0, True, False)
    calls = call_count[0]
    solve.cache_clear()
    return result, calls


ns = [10, 100, 1000, 10000, 100000, 1000000]
results = [count_without_seven_with_stats(n) for n in ns]
counts = [r[0] for r in results]
calls = [r[1] for r in results]

print("N values:", ns)
print("Distinct DP calls needed:", calls)

fig, ax1 = plt.subplots(figsize=(8, 4), facecolor="#0f172a")
ax1.set_facecolor("#0f172a")
x = range(len(ns))
ax1.bar(x, ns, color="#f87171", alpha=0.5, label="N (numbers that would need brute-force checking)")
ax1.bar(x, calls, color="#4ade80", label="Actual DP calls made")
ax1.set_yscale("log")
ax1.set_xticks(x)
ax1.set_xticklabels([str(n) for n in ns], color="#94a3b8", rotation=30)
ax1.set_ylabel("Count (log scale)", color="#94a3b8")
ax1.set_title("Digit DP calls stay tiny even as N grows by factors of 10", color="#e2e8f0", fontsize=11)
ax1.tick_params(colors="#94a3b8")
ax1.legend(facecolor="#1e293b", edgecolor="#334155", labelcolor="#e2e8f0", fontsize=9)
for sp in ax1.spines.values(): sp.set_visible(False)
plt.tight_layout()
plt.show()`,
            },
            {
              type: 'code',
              language: 'python',
              challengeType: 'write',
              challengeNumber: 1,
              challengeTitle: 'Count numbers without digit 4 or 9 (unlucky digits)',
              difficulty: 'medium',
              prompt: 'Fill in the solve() recursion in count_without_unlucky(n): same shape as count_without_seven, but skip both digit 4 and digit 9 (common "unlucky number" avoidance in some numbering systems). Uncomment the assertions once ready.',
              hint: 'Same recurrence as the demo cell above, just change which digits get skipped: if d == 4 or d == 9: continue.',
              label: 'From Scratch — Avoid Digits 4 and 9',
              code: `from functools import lru_cache


def count_without_unlucky(n):
    if n <= 0:
        return 0
    digits = list(map(int, str(n)))
    length = len(digits)

    @lru_cache(maxsize=None)
    def solve(pos, tight, started):
        if pos == length:
            return 1 if started else 0
        limit = digits[pos] if tight else 9
        total = 0
        for d in range(0, limit + 1):
            if d == 4 or d == 9:
                continue
            # YOUR CODE HERE:
            # new_started = started or d > 0
            # new_tight = tight and (d == limit)
            # total += solve(pos + 1, new_tight, new_started)
            pass
        return total

    result = solve(0, True, False)
    solve.cache_clear()
    return result


# --- Uncomment to test when ready ---
# assert count_without_unlucky(9) == 7          # skip 4 and 9: {1,2,3,5,6,7,8}
# assert count_without_unlucky(100) == 64
# print("count_without_unlucky(100):", count_without_unlucky(100))
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
      text: 'What does the "tight" flag represent in digit DP, and why can it only turn off, never back on?',
      options: [
        'It tracks whether the current digit is odd or even; parity can toggle back and forth freely',
        '"Tight" means every digit chosen so far exactly matches N\'s digits at those positions — still walking N\'s exact boundary. Once a digit strictly less than N\'s digit is chosen, the number is already guaranteed smaller than N regardless of what follows, so there is no way to become "tight" again',
        'It tracks whether the number built so far is even; it can turn on and off with each digit',
      ],
      correct: 1,
    },
    {
      id: 'q2',
      type: 'choice',
      text: 'Why is the "started" flag necessary — what goes wrong without it?',
      options: [
        'Nothing goes wrong; started is purely a stylistic choice',
        'Without tracking whether a nonzero digit has appeared yet, a leading zero would be treated as a real chosen digit, incorrectly turning (for example) the number 7 into a padded "007" — which matters for any constraint (digit sum, digit count, adjacent-digit rules) that should only apply to the digits that actually exist in the number',
        'started is required by JavaScript and Python\'s recursion limits, not by the algorithm itself',
      ],
      correct: 1,
    },
    {
      id: 'q3',
      type: 'choice',
      text: 'Why does memoizing digit DP on (pos, tight, started) work, given that "tight" seems to depend on the specific digits of N?',
      options: [
        'It does not really work — digit DP cannot actually be memoized, it just happens to run fast on small inputs',
        '"Tight" is only ever true along a single path at each position — the one still exactly matching N. Every other combination of (pos, tight=false, started) is genuinely identical regardless of the specific digits chosen to reach it, since once free of the bound, only the tracked state (not the path) determines the future',
        'Memoization works because pos, tight, and started are always equal to each other',
      ],
      correct: 1,
    },
    {
      id: 'q4',
      type: 'choice',
      text: 'To count numbers with a property in the range [L, R], the lesson uses count(R) - count(L-1). Why subtract count(L-1) rather than count(L)?',
      options: [
        'count(X) is defined as counting qualifying numbers in [1, X] inclusive, so count(R) already includes R itself, but count(L) would also include L, which needs to remain in the range — subtracting count(L-1) correctly excludes everything strictly below L while keeping L itself counted',
        'It does not matter; count(L) and count(L-1) always give the same result',
        'Because L is always 0 in digit DP problems, making this subtraction unnecessary in practice',
      ],
      correct: 0,
    },
  ],
};
