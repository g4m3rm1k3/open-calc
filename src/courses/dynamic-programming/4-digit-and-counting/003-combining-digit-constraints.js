export default {
  id: 'dp4-003',
  slug: 'combining-digit-constraints',
  chapter: 'dp4',
  order: 3,
  title: 'Combining Digit DP Constraints',
  subtitle: 'Multiple rules, tracked simultaneously — practice and mastery',
  tags: ['dynamic programming', 'digit dp', 'combined constraints', 'practice'],
  aliases: 'digit dp combined constraints practice mastery',

  hook: {
    question: 'How many integers from 1 to 999,999 have digit sum at most 20 AND no two adjacent equal digits? Neither constraint alone determines the answer — a number could easily satisfy one and fail the other. Real problems rarely arrive with exactly one clean rule; the actual skill in digit DP is not memorizing one recipe, it is comfortably stacking multiple independent state dimensions in the same recursion, each contributing its own piece of the answer.',
    realWorldContext: 'Combined constraints are the norm in practice: validating an account number might simultaneously require a specific digit-sum checksum AND a no-repeated-digit rule AND a "starts with a specific range" rule. Competitive programming problems almost always combine 2-3 digit properties precisely to test whether a solver understands digit DP as a composable technique rather than a single memorized template.',
    previewVisualizationId: 'ScienceNotebook',
  },

  intuition: {
    prose: [
      '**Stacking state dimensions is mechanical once each one is understood alone.** `solve(pos, tight, started, prevDigit, digitSum)` combines Lesson 2\'s two extensions directly — nothing new conceptually happens by adding a second extra dimension, the recursion just carries more information forward. The base case checks BOTH constraints: return 1 only if `started` AND `digitSum <= K` (the adjacency rule was already enforced during the loop, by skipping any digit equal to `prevDigit`).',
      '**Order of checks does not matter, independence does.** Whether you check the digit-sum bound first or the adjacency rule first inside the loop makes no difference to correctness — what matters is that each rule is enforced independently, at the point where it becomes checkable, without one rule\'s bookkeeping corrupting the other\'s. Skip a candidate digit for adjacency BEFORE updating anything; update sum and prevDigit together, from the same accepted digit, after that check passes.',
      '**A systematic checklist for any new digit DP problem.** (1) What is being counted — numbers with property X in a range? (2) What is the MINIMAL set of extra facts (beyond pos, tight, started) that some future digit choice needs, to correctly enforce X? (3) For each fact, when does it get updated, and does the update depend on `started` (to correctly ignore leading zeros)? (4) What does the base case need to verify, given every tracked fact? Working through these four questions mechanically produces the correct recursion for almost any counting-by-digits problem.',
      '**Recognizing when digit DP is NOT the right tool.** If the property being counted does not decompose cleanly digit-by-digit — for instance, "is this number prime" (primality depends on the number\'s actual value, not a simple digit-local rule) — digit DP does not apply, no matter how many state dimensions you add. Digit DP works precisely because properties like "digit sum," "no repeated adjacent digits," or "contains no forbidden digit" can be verified incrementally, one digit at a time, without ever needing the number\'s full numeric value.',
      '**This closes the chapter\'s arc.** Lesson 1 established the tight/started skeleton. Lesson 2 showed that new constraints are new parameters, not new algorithms. This lesson confirms that multiple constraints compose by simply including all of them — the same "state carries forward exactly what the future needs" principle that has held across arrays (Chapter 1), trees and DAGs (Chapter 2), bitmasks (Chapter 3), and now digit-by-digit construction.',
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Chapter 4, Lesson 3: Combining Digit DP Constraints',
        body: '**Previous:** Digit DP Extra State — digit sum, adjacent-digit constraints, one at a time.\n**This lesson:** Combining constraints — multiple state dimensions in one recursion, and a systematic checklist for new problems.\n**Next chapter:** Advanced String DP — wildcard matching, word break, and other string-specific recurrences.',
      },
      {
        type: 'insight',
        title: 'The four-question checklist for any digit DP problem',
        body: '1. What property, over what range, is being counted?\n2. What extra fact(s) does a future digit need, beyond (pos, tight, started)?\n3. When does each extra fact update, and is that update gated correctly behind `started`?\n4. What must the base case verify, given everything tracked?',
      },
      {
        type: 'strategy',
        title: 'Combining constraints costs no new ideas, only new parameters',
        body: 'Two independent constraints combine by including both extra dimensions in the same state tuple and enforcing both rules at the points where each becomes checkable. There is no special "combination algorithm" to learn — the composability was already built into the tight/started skeleton from Lesson 1.',
      },
      {
        type: 'warning',
        title: 'Digit DP requires a digit-local property — not every counting problem qualifies',
        body: 'If verifying the property requires knowing the number\'s actual numeric value (like primality, or "is a perfect square"), digit-by-digit construction cannot check it incrementally, and digit DP does not apply. The properties digit DP handles are always expressible as "some running fact about the digits seen so far," checkable without ever reconstructing the full number\'s value.',
      },
    ],
    visualizations: [
      {
        id: 'ScienceNotebook',
        title: 'Combined Constraints: Both Rules, One Recursion',
        caption: 'Digit sum and adjacency, tracked together — watch both rules apply independently at each digit choice.',
        props: {
          lesson: {
            title: 'Combining Digit DP Constraints, Step by Step',
            subtitle: 'Two extra dimensions in the same recursion.',
            sequential: true,
            cells: [
              {
                type: 'js',
                title: 'Both Constraints at Once',
                instruction: 'Counting numbers 1-100 with digit sum at most 10 AND no adjacent equal digits. Watch each candidate digit get checked against both rules.',
                html: `<div id="d" style="padding:12px;font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;background:#0f172a;color:#e2e8f0}`,
                startCode: `const d = document.getElementById('d');
const N = "100";
const digits = N.split('').map(Number);
const L = digits.length;
const K = 10;

function solve(pos, tight, started, prevDigit, digitSum) {
  if (digitSum > K) return 0;
  if (pos === L) return started ? 1 : 0;
  const limit = tight ? digits[pos] : 9;
  let total = 0;
  for (let dgt = 0; dgt <= limit; dgt++) {
    if (started && dgt === prevDigit) continue; // adjacency rule
    const newStarted = started || dgt > 0;
    const newSum = newStarted ? digitSum + dgt : 0; // digit sum rule
    total += solve(pos + 1, tight && (dgt === limit), newStarted, newStarted ? dgt : -1, newSum);
  }
  return total;
}
const answer = solve(0, true, false, -1, 0);

let html = '<div style="color:#60a5fa;margin-bottom:8px">Both rules enforced in the same loop:</div>';
html += '<div style="padding:8px 12px;background:#1e293b;border-radius:6px;margin-bottom:6px;font-size:12px;color:#94a3b8">if (started &amp;&amp; dgt === prevDigit) continue; &nbsp; // adjacency<br>newSum = digitSum + dgt; &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;// digit sum, checked at top of next call</div>';
html += '<div style="background:#052e16;border-radius:6px;padding:8px 12px;color:#4ade80">Answer: ' + answer + ' numbers (1-100) satisfy BOTH constraints.</div>';
d.innerHTML = html;`,
                outputHeight: 240,
              },
              {
                type: 'js',
                title: 'The Four-Question Checklist, Applied',
                instruction: 'Working through the checklist for a NEW constraint: "count numbers where every digit is even."',
                html: `<div id="d" style="padding:12px;font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;background:#0f172a;color:#e2e8f0}`,
                startCode: `const d = document.getElementById('d');
let html = '<div style="color:#60a5fa;margin-bottom:10px">New constraint: "every digit is even" — walking the checklist:</div>';
const steps = [
  ['1. What is counted?', 'Numbers 1..N where every digit is 0, 2, 4, 6, or 8.'],
  ['2. Extra fact needed?', 'NONE beyond (pos, tight, started) — this constraint only restricts which digits are ALLOWED at each position, it does not need to remember anything about previous choices.'],
  ['3. When does it update?', 'N/A — there is nothing extra to update. Just restrict the digit loop to even values only.'],
  ['4. Base case check?', 'Same as Lesson 1: return started ? 1 : 0. No extra condition needed.'],
];
steps.forEach(([q, a]) => {
  html += '<div style="padding:8px 12px;background:#1e293b;border-radius:6px;margin-bottom:6px"><div style="color:#f59e0b;font-weight:bold;margin-bottom:3px">' + q + '</div><div style="color:#94a3b8;font-size:12px">' + a + '</div></div>';
});
html += '<div style="margin-top:8px;background:#172554;border-radius:6px;padding:8px 12px;color:#93c5fd;font-size:12px">Not every new constraint needs a new dimension — sometimes it just restricts the existing digit loop.</div>';
d.innerHTML = html;`,
                outputHeight: 380,
              },
            ],
          },
        },
      },

      {
        id: 'JSNotebook',
        title: 'Combine Constraints from Scratch',
        caption: 'Digit sum + adjacency together, then a restricted-digit-set variant.',
        props: {
          lesson: {
            title: 'Combined Digit DP in JavaScript',
            subtitle: 'Multiple state dimensions, one recursion.',
            cells: [
              {
                type: 'js',
                instruction: `## Step 1 — Digit Sum AND No Adjacent Equal Digits

Implement \`countCombined(n, k)\`: count numbers 1..n with digit sum at most k AND no two adjacent equal digits. Combine both Lesson 2 techniques into one \`solve\`.`,
                html: `<div id="out" style="font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;padding:14px;background:#0f172a;color:#e2e8f0;box-sizing:border-box;font-family:monospace}.pass{color:#4ade80;margin:2px 0}.fail{color:#f87171;margin:2px 0}`,
                startCode: `function countCombined(n, k) {
  const digits = String(n).split('').map(Number);
  const L = digits.length;

  function solve(pos, tight, started, prevDigit, digitSum) {
    if (digitSum > k) return 0;
    if (pos === L) return started ? 1 : 0;
    const limit = tight ? digits[pos] : 9;
    let total = 0;
    for (let d = 0; d <= limit; d++) {
      if (started && d === prevDigit) continue;
      // TODO: newStarted = started || d > 0
      // TODO: newSum = newStarted ? digitSum + d : 0
      // TODO: newPrev = newStarted ? d : -1
      // TODO: total += solve(pos + 1, tight && (d === limit), newStarted, newPrev, newSum)
    }
    return total;
  }

  return solve(0, true, false, -1, 0);
}

const out = document.getElementById('out');
function test(l, g, e) {
  const p = g === e;
  out.innerHTML += \`<div class="\${p?'pass':'fail'}">\${p?'✓':'✗'} \${l}: got \${g}, want \${e}</div>\`;
}

test('countCombined(100, 10)', countCombined(100, 10), 58);
test('countCombined(500, 15)', countCombined(500, 15), 350);
test('countCombined(9999, 20)', countCombined(9999, 20), 5020);`,
                solutionCode: `function countCombined(n, k) {
  const digits = String(n).split('').map(Number);
  const L = digits.length;

  function solve(pos, tight, started, prevDigit, digitSum) {
    if (digitSum > k) return 0;
    if (pos === L) return started ? 1 : 0;
    const limit = tight ? digits[pos] : 9;
    let total = 0;
    for (let d = 0; d <= limit; d++) {
      if (started && d === prevDigit) continue;
      const newStarted = started || d > 0;
      const newSum = newStarted ? digitSum + d : 0;
      const newPrev = newStarted ? d : -1;
      total += solve(pos + 1, tight && (d === limit), newStarted, newPrev, newSum);
    }
    return total;
  }

  return solve(0, true, false, -1, 0);
}

const out = document.getElementById('out');
function test(l, g, e) {
  const p = g === e;
  out.innerHTML += \`<div class="\${p?'pass':'fail'}">\${p?'✓':'✗'} \${l}: got \${g}, want \${e}</div>\`;
}

test('countCombined(100, 10)', countCombined(100, 10), 58);
test('countCombined(500, 15)', countCombined(500, 15), 350);
test('countCombined(9999, 20)', countCombined(9999, 20), 5020);`,
                outputHeight: 160,
              },
              {
                type: 'js',
                instruction: `## Step 2 — All-Even-Digits (No Extra Dimension Needed)

Implement \`countAllEvenDigits(n)\`: count numbers 1..n where every digit is even (0, 2, 4, 6, or 8). Per the checklist, this needs NO new state dimension — just restrict which digits the loop tries.`,
                html: `<div id="out" style="font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;padding:14px;background:#0f172a;color:#e2e8f0;box-sizing:border-box;font-family:monospace}.pass{color:#4ade80;margin:2px 0}.fail{color:#f87171;margin:2px 0}`,
                startCode: `function countAllEvenDigits(n) {
  const digits = String(n).split('').map(Number);
  const L = digits.length;

  function solve(pos, tight, started) {
    if (pos === L) return started ? 1 : 0;
    const limit = tight ? digits[pos] : 9;
    let total = 0;
    for (let d = 0; d <= limit; d++) {
      // TODO: skip d if it is odd (d % 2 !== 0)
      // TODO: total += solve(pos + 1, tight && (d === limit), started || d > 0)
    }
    return total;
  }

  return solve(0, true, false);
}

const out = document.getElementById('out');
function test(l, g, e) {
  const p = g === e;
  out.innerHTML += \`<div class="\${p?'pass':'fail'}">\${p?'✓':'✗'} \${l}: got \${g}, want \${e}</div>\`;
}

test('countAllEvenDigits(9)', countAllEvenDigits(9), 4);
test('countAllEvenDigits(20)', countAllEvenDigits(20), 5);
test('countAllEvenDigits(100)', countAllEvenDigits(100), 24);`,
                solutionCode: `function countAllEvenDigits(n) {
  const digits = String(n).split('').map(Number);
  const L = digits.length;

  function solve(pos, tight, started) {
    if (pos === L) return started ? 1 : 0;
    const limit = tight ? digits[pos] : 9;
    let total = 0;
    for (let d = 0; d <= limit; d++) {
      if (d % 2 !== 0) continue;
      total += solve(pos + 1, tight && (d === limit), started || d > 0);
    }
    return total;
  }

  return solve(0, true, false);
}

const out = document.getElementById('out');
function test(l, g, e) {
  const p = g === e;
  out.innerHTML += \`<div class="\${p?'pass':'fail'}">\${p?'✓':'✗'} \${l}: got \${g}, want \${e}</div>\`;
}

test('countAllEvenDigits(9)', countAllEvenDigits(9), 4);
test('countAllEvenDigits(20)', countAllEvenDigits(20), 5);
test('countAllEvenDigits(100)', countAllEvenDigits(100), 24);`,
                outputHeight: 160,
              },
            ],
          },
        },
      },

      {
        id: 'PythonNotebook',
        title: 'Combining Constraints in Python',
        caption: 'Build the combined recursion, visualize how each rule shrinks the count, then a from-scratch mastery challenge.',
        props: {
          initialCells: [
            {
              type: 'code',
              language: 'python',
              label: 'Combined Constraints — Build and Verify',
              code: `from functools import lru_cache


def count_combined(n, k):
    digits = list(map(int, str(n)))
    length = len(digits)

    @lru_cache(maxsize=None)
    def solve(pos, tight, started, prev_digit, digit_sum):
        if digit_sum > k:
            return 0
        if pos == length:
            return 1 if started else 0
        limit = digits[pos] if tight else 9
        total = 0
        for d in range(0, limit + 1):
            if started and d == prev_digit:
                continue
            new_started = started or d > 0
            new_sum = digit_sum + d if new_started else 0
            new_prev = d if new_started else -1
            new_tight = tight and (d == limit)
            total += solve(pos + 1, new_tight, new_started, new_prev, new_sum)
        return total

    result = solve(0, True, False, -1, 0)
    solve.cache_clear()
    return result


for n, k in [(100, 10), (500, 15), (9999, 20)]:
    print(f"count_combined({n}, {k}) = {count_combined(n, k)}")

assert count_combined(100, 10) == 58
assert count_combined(9999, 20) == 5020
print("Assertions passed!")`,
            },
            {
              type: 'code',
              language: 'python',
              label: 'Visualize: Each Rule Shrinks the Count',
              code: `import matplotlib.pyplot as plt
from functools import lru_cache


def count_digit_sum_only(n, k):
    digits = list(map(int, str(n)))
    length = len(digits)

    @lru_cache(maxsize=None)
    def solve(pos, tight, started, digit_sum):
        if digit_sum > k:
            return 0
        if pos == length:
            return 1 if started else 0
        limit = digits[pos] if tight else 9
        total = 0
        for d in range(0, limit + 1):
            new_started = started or d > 0
            new_sum = digit_sum + d if new_started else 0
            total += solve(pos + 1, tight and (d == limit), new_started, new_sum)
        return total

    r = solve(0, True, False, 0)
    solve.cache_clear()
    return r


def count_combined(n, k):
    digits = list(map(int, str(n)))
    length = len(digits)

    @lru_cache(maxsize=None)
    def solve(pos, tight, started, prev_digit, digit_sum):
        if digit_sum > k:
            return 0
        if pos == length:
            return 1 if started else 0
        limit = digits[pos] if tight else 9
        total = 0
        for d in range(0, limit + 1):
            if started and d == prev_digit:
                continue
            new_started = started or d > 0
            new_sum = digit_sum + d if new_started else 0
            new_prev = d if new_started else -1
            total += solve(pos + 1, tight and (d == limit), new_started, new_prev, new_sum)
        return total

    r = solve(0, True, False, -1, 0)
    solve.cache_clear()
    return r


n = 999
sum_only = [count_digit_sum_only(n, k) for k in range(1, 28)]
combined = [count_combined(n, k) for k in range(1, 28)]

fig, ax = plt.subplots(figsize=(8, 4), facecolor="#0f172a")
ax.set_facecolor("#0f172a")
ax.plot(range(1, 28), sum_only, "o-", color="#3b82f6", label="Digit sum ≤ K only")
ax.plot(range(1, 28), combined, "o-", color="#4ade80", label="Digit sum ≤ K AND no adjacent repeats")
ax.set_xlabel("K", color="#94a3b8")
ax.set_ylabel(f"Count of numbers 1..{n} qualifying", color="#94a3b8")
ax.set_title("Adding a second constraint always shrinks (or keeps equal) the count", color="#e2e8f0", fontsize=11)
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
              challengeTitle: 'Mastery challenge: three constraints at once',
              difficulty: 'hard',
              prompt: 'Fill in solve() in count_mastery(n, k): count numbers 1..n with digit sum at most k, no two adjacent equal digits, AND every digit even. Combine all three rules in one recursion. Uncomment the assertion once ready.',
              hint: 'Same shape as count_combined, but also skip odd d values in the loop (like the all-even-digits example), on top of the adjacency and digit-sum checks.',
              label: 'From Scratch — Three Constraints Combined',
              code: `from functools import lru_cache


def count_mastery(n, k):
    digits = list(map(int, str(n)))
    length = len(digits)

    @lru_cache(maxsize=None)
    def solve(pos, tight, started, prev_digit, digit_sum):
        if digit_sum > k:
            return 0
        if pos == length:
            return 1 if started else 0
        limit = digits[pos] if tight else 9
        total = 0
        for d in range(0, limit + 1):
            if d % 2 != 0:
                continue
            if started and d == prev_digit:
                continue
            # YOUR CODE HERE:
            # new_started = started or d > 0
            # new_sum = digit_sum + d if new_started else 0
            # new_prev = d if new_started else -1
            # new_tight = tight and (d == limit)
            # total += solve(pos + 1, new_tight, new_started, new_prev, new_sum)
            pass
        return total

    result = solve(0, True, False, -1, 0)
    solve.cache_clear()
    return result


# --- Uncomment to test when ready ---
# result = count_mastery(9999, 20)
# print(f"count_mastery(9999, 20) = {result}")
# assert result == 294, f"got {result}"
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
      text: 'When combining two independent digit constraints (like digit sum and adjacency) into one recursion, what changes about the underlying algorithm?',
      options: [
        'A fundamentally new algorithm is required — combining constraints is not simply an extension of the single-constraint technique',
        'Nothing conceptually new — both extra dimensions are included in the same state tuple, and each rule is enforced independently at the point where it becomes checkable; the tight/started skeleton from Lesson 1 was already built to support this',
        'Combining constraints requires running two entirely separate digit DP passes and intersecting their results',
      ],
      correct: 1,
    },
    {
      id: 'q2',
      type: 'choice',
      text: 'The "every digit is even" constraint needs no extra state dimension beyond (pos, tight, started). Why not?',
      options: [
        'Because even numbers are always smaller than odd numbers',
        'This constraint only restricts which digits are ALLOWED at each position — it does not depend on anything about previously chosen digits, so there is nothing extra that a future digit needs to remember',
        'Every digit DP problem secretly needs the same four dimensions regardless of the constraint',
      ],
      correct: 1,
    },
    {
      id: 'q3',
      type: 'choice',
      text: 'Why does digit DP fail to handle a property like "is this number prime"?',
      options: [
        'Digit DP can handle primality just fine with enough extra state dimensions',
        'Primality depends on the number\'s actual numeric value as a whole (divisibility by every smaller number), not on a running fact about digits seen so far that can be checked incrementally, one digit at a time — digit DP only works for properties expressible that way',
        'Digit DP cannot handle numbers larger than 1000',
      ],
      correct: 1,
    },
    {
      id: 'q4',
      type: 'choice',
      text: 'What is the four-question checklist for approaching a new digit DP problem?',
      options: [
        'What is counted; what extra fact does a future digit need beyond (pos, tight, started); when/how does each extra fact update (correctly gated behind started); what must the base case verify',
        'What is the input size; what is the time complexity budget; what programming language to use; how to test the solution',
        'Is the number even or odd; is the number positive or negative; is the number a perfect square; is the number prime',
      ],
      correct: 0,
    },
  ],
};
