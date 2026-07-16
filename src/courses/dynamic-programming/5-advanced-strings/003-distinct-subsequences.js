export default {
  id: 'dp5-003',
  slug: 'distinct-subsequences',
  chapter: 'dp5',
  order: 3,
  title: 'Distinct Subsequences: Counting, Not Just Checking',
  subtitle: 'The LCS table shape, one more time — this time counting occurrences',
  tags: ['dynamic programming', 'string dp', 'distinct subsequences', 'counting'],
  aliases: 'distinct subsequences dp counting occurrences',

  hook: {
    question: 'In how many DISTINCT ways does the subsequence "rabbit" appear inside "rabbbit"? Not "does it appear" (a yes/no question, like Chapter 1\'s LCS) — exactly how many different ways can you select characters (in order, not necessarily contiguous) from "rabbbit" that spell "rabbit"? The answer is 3, because the extra "b" in "rabbbit" gives three different choices for which two of the three b\'s to use.',
    realWorldContext: 'Counting distinct subsequence occurrences comes up in DNA analysis (how many ways does a target motif occur across a genome, accounting for its own internal repetition), text-similarity scoring beyond simple boolean matching, and combinatorics problems where "how many" matters more than "whether." It is also a clean illustration of how the exact same table shape used for a boolean question (LCS, Wildcard Matching) can be repurposed for a counting question, by swapping OR/max for addition.',
    previewVisualizationId: 'ScienceNotebook',
  },

  intuition: {
    prose: [
      '**Same (m+1)×(n+1) table, a counting recurrence this time.** `dp[i][j]` = the number of distinct ways `t[0..j)` appears as a subsequence of `s[0..i)`. This is the fourth recurrence built on the identical table shape from LCS, Edit Distance, and Wildcard Matching — the pattern by now should feel familiar: same shape, new meaning per cell, new rule for combining neighbors.',
      '**The recurrence.** `dp[i][j] = dp[i-1][j] + (dp[i-1][j-1] if s[i-1] == t[j-1] else 0)`. The `dp[i-1][j]` term always applies: "ignore `s[i-1]` entirely — every way to form `t[0..j)` from `s[0..i-1)` still works using the shorter prefix of `s`." The extra `dp[i-1][j-1]` term applies ONLY when the characters match: "additionally, use `s[i-1]` to provide the last character of `t[0..j)`, contributing every way the REST (`t[0..j-1)`) could be formed from `s[0..i-1)`." These two contributions are added, not compared with max/OR, because they represent genuinely DIFFERENT, non-overlapping ways of building the count — using `s[i-1]` and not using it are mutually exclusive choices whose counts should sum.',
      '**Base cases.** `dp[i][0] = 1` for every `i` — there is exactly one way to form the empty string as a subsequence of anything: use zero characters. `dp[0][j] = 0` for `j > 0` — a non-empty target cannot be formed from an empty source, ever.',
      '**Why addition, not max/OR, is the signature of a COUNTING dp.** LCS\'s mismatch case used `max` because it wanted the BEST of two options (only one "wins"). Distinct Subsequences ADDS two contributions because it wants the TOTAL across two genuinely different, non-overlapping categories of valid selections (selections that skip `s[i-1]`, and selections that use it). Recognizing "am I choosing the best option, or counting all options" is the single most important fork in designing any new DP recurrence — it determines whether neighboring cells combine via max/min/OR, or via addition.',
      '**Complexity and the "why 3?" answer, concretely.** `dp[7][6]` for `s="rabbbit"`, `t="rabbit"` — walking the recurrence, the three "extra" b\'s in "rabbbit" each independently offer a valid choice for "which b provides t\'s single b," and each choice leads to a fully valid completion of the rest of the match, giving exactly 3 distinct selections. The DP computes this by systematically summing contributions rather than requiring you to enumerate the three selections by hand.',
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Chapter 5, Lesson 3: Distinct Subsequences',
        body: '**Previous:** Word Break — 1D string DP with a variable-length lookback.\n**This lesson:** Distinct Subsequences — counting, not checking, on the LCS-shaped table.\n**Next:** Scramble String — an interval-style recurrence on strings, closing the chapter.',
      },
      {
        type: 'insight',
        title: 'The decision that determines the combination rule',
        body: 'Ask: "am I picking the SINGLE BEST way to reach this state, or am I ADDING UP EVERY way to reach it?" Best-of → max/min. Boolean either-or → OR/AND. Total count across mutually exclusive categories → addition. Distinct Subsequences is squarely the addition case.',
      },
      {
        type: 'strategy',
        title: 'The two mutually exclusive contributions, stated as choices',
        body: '**Skip s[i-1]:** every valid way of forming t[0..j) from the shorter s[0..i-1) still counts here — this is dp[i-1][j], always included.\n**Use s[i-1]** (only possible if it equals t[j-1]): every valid way of forming the shorter t[0..j-1) from s[0..i-1), now extended by matching t[j-1] to s[i-1] — this is dp[i-1][j-1], included only on a character match.',
      },
      {
        type: 'warning',
        title: 'dp[i][0] = 1, not 0 — an easy base-case mistake',
        body: 'It is tempting to think "zero characters to match, so zero ways" — but the correct reading is "there is exactly ONE way to select zero characters: select none." Setting dp[i][0] = 0 instead of 1 would make every subsequent count come out as 0, since the recurrence multiplies through (via addition chains) from this base case.',
      },
    ],
    visualizations: [
      {
        id: 'ScienceNotebook',
        title: 'Distinct Subsequences: Counts Accumulate',
        caption: 'Watch the table fill with counts, adding two contributions per matching cell instead of taking a max.',
        props: {
          lesson: {
            title: 'Distinct Subsequences Step by Step',
            subtitle: 'The fourth recurrence on the familiar table shape.',
            sequential: true,
            cells: [
              {
                type: 'js',
                title: 'Building the Count Table: "rabbbit" vs "rabbit"',
                instruction: 'Watch how each matching cell ADDS dp[i-1][j-1] on top of dp[i-1][j], rather than choosing the max.',
                html: `<div id="d" style="padding:12px;font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;background:#0f172a;color:#e2e8f0}`,
                startCode: `const d = document.getElementById('d');
const s = "rabbbit", t = "rabbit";
const m = s.length, n = t.length;
const dp = Array.from({length: m+1}, () => new Array(n+1).fill(0));
for (let i = 0; i <= m; i++) dp[i][0] = 1;
for (let i = 1; i <= m; i++) {
  for (let j = 1; j <= n; j++) {
    dp[i][j] = dp[i-1][j];
    if (s[i-1] === t[j-1]) dp[i][j] += dp[i-1][j-1];
  }
}

let html = '<div style="color:#60a5fa;margin-bottom:8px">s="' + s + '"  t="' + t + '"</div><table style="border-collapse:collapse;font-size:12px">';
html += '<tr><td></td><td></td>' + t.split('').map(c => '<td style="padding:5px 8px;color:#f59e0b">' + c + '</td>').join('') + '</tr>';
for (let i = 0; i <= m; i++) {
  html += '<tr><td style="padding:5px 8px;color:#94a3b8">' + (i===0?'':s[i-1]) + '</td>';
  for (let j = 0; j <= n; j++) {
    html += '<td style="border:1px solid #334155;padding:5px 8px;text-align:center;color:#4ade80">' + dp[i][j] + '</td>';
  }
  html += '</tr>';
}
html += '</table>';
html += '<div style="margin-top:10px;background:#052e16;border-radius:6px;padding:8px 12px;color:#4ade80">Distinct subsequence count: ' + dp[m][n] + '</div>';
d.innerHTML = html;`,
                outputHeight: 340,
              },
            ],
          },
        },
      },

      {
        id: 'JSNotebook',
        title: 'Build Distinct Subsequences from Scratch',
        caption: 'A counting recurrence, addition instead of max/OR.',
        props: {
          lesson: {
            title: 'Distinct Subsequences in JavaScript',
            subtitle: 'Two mutually exclusive contributions, summed.',
            cells: [
              {
                type: 'js',
                instruction: `## Step 1 — Build the Count Table

Implement \`numDistinct(s, t)\`. Base case: dp[i][0] = 1 for all i. Recurrence: always inherit dp[i-1][j]; add dp[i-1][j-1] only when s[i-1] === t[j-1].`,
                html: `<div id="out" style="font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;padding:14px;background:#0f172a;color:#e2e8f0;box-sizing:border-box;font-family:monospace}.pass{color:#4ade80;margin:2px 0}.fail{color:#f87171;margin:2px 0}`,
                startCode: `function numDistinct(s, t) {
  const m = s.length, n = t.length;
  const dp = Array.from({length: m + 1}, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = 1;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      // TODO: dp[i][j] = dp[i-1][j]
      // TODO: if (s[i-1] === t[j-1]) dp[i][j] += dp[i-1][j-1]
    }
  }
  return dp[m][n];
}

const out = document.getElementById('out');
function test(l, g, e) {
  const p = g === e;
  out.innerHTML += \`<div class="\${p?'pass':'fail'}">\${p?'✓':'✗'} \${l}: got \${g}, want \${e}</div>\`;
}

test('numDistinct("rabbbit", "rabbit")', numDistinct("rabbbit", "rabbit"), 3);
test('numDistinct("babgbag", "bag")', numDistinct("babgbag", "bag"), 5);
test('numDistinct("abc", "abc")', numDistinct("abc", "abc"), 1);
test('numDistinct("abc", "d")', numDistinct("abc", "d"), 0);
test('numDistinct("abc", "")', numDistinct("abc", ""), 1);`,
                solutionCode: `function numDistinct(s, t) {
  const m = s.length, n = t.length;
  const dp = Array.from({length: m + 1}, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = 1;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = dp[i-1][j];
      if (s[i-1] === t[j-1]) dp[i][j] += dp[i-1][j-1];
    }
  }
  return dp[m][n];
}

const out = document.getElementById('out');
function test(l, g, e) {
  const p = g === e;
  out.innerHTML += \`<div class="\${p?'pass':'fail'}">\${p?'✓':'✗'} \${l}: got \${g}, want \${e}</div>\`;
}

test('numDistinct("rabbbit", "rabbit")', numDistinct("rabbbit", "rabbit"), 3);
test('numDistinct("babgbag", "bag")', numDistinct("babgbag", "bag"), 5);
test('numDistinct("abc", "abc")', numDistinct("abc", "abc"), 1);
test('numDistinct("abc", "d")', numDistinct("abc", "d"), 0);
test('numDistinct("abc", "")', numDistinct("abc", ""), 1);`,
                outputHeight: 200,
              },
            ],
          },
        },
      },

      {
        id: 'PythonNotebook',
        title: 'Distinct Subsequences in Python',
        caption: 'Build the counting table, visualize it, then a from-scratch challenge.',
        props: {
          initialCells: [
            {
              type: 'code',
              language: 'python',
              label: 'Distinct Subsequences — Build and Verify',
              code: `def num_distinct(s, t):
    m, n = len(s), len(t)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(m + 1):
        dp[i][0] = 1

    for i in range(1, m + 1):
        for j in range(1, n + 1):
            dp[i][j] = dp[i - 1][j]
            if s[i - 1] == t[j - 1]:
                dp[i][j] += dp[i - 1][j - 1]

    return dp[m][n]


print("num_distinct('rabbbit', 'rabbit'):", num_distinct("rabbbit", "rabbit"))
print("num_distinct('babgbag', 'bag'):", num_distinct("babgbag", "bag"))

assert num_distinct("rabbbit", "rabbit") == 3
assert num_distinct("babgbag", "bag") == 5
print("Assertions passed!")`,
            },
            {
              type: 'code',
              language: 'python',
              label: 'Visualize: The Count Table as a Heatmap',
              code: `import matplotlib.pyplot as plt
import numpy as np


def distinct_table(s, t):
    m, n = len(s), len(t)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(m + 1):
        dp[i][0] = 1
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            dp[i][j] = dp[i - 1][j]
            if s[i - 1] == t[j - 1]:
                dp[i][j] += dp[i - 1][j - 1]
    return dp


s, t = "rabbbit", "rabbit"
dp = distinct_table(s, t)
data = np.array(dp, dtype=float)

fig, ax = plt.subplots(figsize=(6, 5), facecolor="#0f172a")
ax.set_facecolor("#0f172a")
im = ax.imshow(data, cmap="Greens", aspect="auto")
ax.set_xticks(range(len(t) + 1))
ax.set_xticklabels(["ε"] + list(t), color="#e2e8f0")
ax.set_yticks(range(len(s) + 1))
ax.set_yticklabels(["ε"] + list(s), color="#e2e8f0")
for i in range(len(s) + 1):
    for j in range(len(t) + 1):
        ax.text(j, i, str(dp[i][j]), ha="center", va="center", color="black" if dp[i][j] < data.max()/2 else "white", fontsize=10)
ax.set_title(f's="{s}"  t="{t}"  →  {dp[-1][-1]} distinct occurrences', color="#e2e8f0")
plt.tight_layout()
plt.show()`,
            },
            {
              type: 'code',
              language: 'python',
              challengeType: 'write',
              challengeNumber: 1,
              challengeTitle: 'Distinct Subsequences, from scratch',
              difficulty: 'medium',
              prompt: 'Fill in the recurrence in num_distinct_scratch(s, t): always inherit from dp[i-1][j], and add dp[i-1][j-1] only on a character match. Uncomment the assertions once ready.',
              hint: 'dp[i][j] = dp[i-1][j] + (dp[i-1][j-1] if s[i-1] == t[j-1] else 0) — remember this is addition, not max, because both contributions are genuinely distinct, non-overlapping ways of building the count.',
              label: 'From Scratch — Distinct Subsequences',
              code: `def num_distinct_scratch(s, t):
    m, n = len(s), len(t)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(m + 1):
        dp[i][0] = 1

    for i in range(1, m + 1):
        for j in range(1, n + 1):
            # YOUR CODE HERE:
            # dp[i][j] = dp[i-1][j]
            # if s[i-1] == t[j-1]: dp[i][j] += dp[i-1][j-1]
            pass

    return dp[m][n]


# --- Uncomment to test when ready ---
# assert num_distinct_scratch("aabdbaabbaa", "ab") == 12, f"got {num_distinct_scratch('aabdbaabbaa', 'ab')}"
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
      text: 'Why does Distinct Subsequences ADD dp[i-1][j-1] and dp[i-1][j] on a character match, rather than taking their max (like LCS does on a mismatch)?',
      options: [
        'Addition and max always give the same result for this specific problem, so it is an arbitrary stylistic choice',
        'The two contributions represent genuinely different, non-overlapping categories of valid selections — using s[i-1] to match t[j-1], versus not using s[i-1] at all — and the goal is a TOTAL COUNT across all valid selections, not the single best one, so their counts must be summed',
        'Addition is used only because dp[i-1][j-1] is always smaller than dp[i-1][j]',
      ],
      correct: 1,
    },
    {
      id: 'q2',
      type: 'choice',
      text: 'Why is dp[i][0] = 1 for every i, rather than 0?',
      options: [
        'There is exactly ONE way to select zero characters from any string: select none at all — this is not "zero ways," it is "one (trivial) way," and getting this base case wrong (using 0) would zero out every subsequent count that builds on it',
        'dp[i][0] should actually be i, representing i different ways to choose nothing',
        'dp[i][0] is only ever used for i = 0 and is irrelevant otherwise',
      ],
      correct: 0,
    },
    {
      id: 'q3',
      type: 'choice',
      text: 'What is the single most important question to ask when deriving a NEW DP recurrence, to decide whether cells combine via max/min/OR versus addition?',
      options: [
        'Whether the problem involves strings or arrays',
        '"Am I choosing the single BEST way to reach this state, or am I counting the TOTAL number of ways across mutually exclusive categories?" Best-of implies max/min/OR; total-count-across-categories implies addition',
        'Whether the answer needs to be an integer or a boolean',
      ],
      correct: 1,
    },
    {
      id: 'q4',
      type: 'choice',
      text: 'LCS, Edit Distance, Wildcard Matching, and Distinct Subsequences all use the identical (m+1)×(n+1) table shape. What is the actual reusable skill across all four?',
      options: [
        'Memorizing all four specific recurrences so they can be recalled on demand',
        'Recognizing that a problem comparing two sequences fits this table shape, and then deriving the SPECIFIC recurrence fresh each time by asking what each cell should mean and how its neighbors combine for THIS problem — the shape is reusable, the recurrence is derived, not memorized',
        'Always using max as the combination rule regardless of the specific problem',
      ],
      correct: 1,
    },
  ],
};
