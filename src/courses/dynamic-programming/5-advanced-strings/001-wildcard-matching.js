export default {
  id: 'dp5-001',
  slug: 'wildcard-matching',
  chapter: 'dp5',
  order: 1,
  title: 'Wildcard Matching: A Third Kind of 2D String Table',
  subtitle: 'Extending the LCS/Edit Distance table shape to pattern matching',
  tags: ['dynamic programming', 'string dp', 'wildcard matching', 'pattern matching'],
  aliases: 'wildcard matching dp pattern matching question mark star',

  hook: {
    question: 'Does the filename "report_2024_final.pdf" match the search pattern "report_*_final.?df"? The `?` matches exactly one character; the `*` matches any sequence of characters, including none at all. Checking this by hand for a specific string is easy; proving it works for EVERY possible way `*` could expand requires exploring exponentially many possibilities — unless, like LCS and Edit Distance before it, the problem is reframed as filling a 2D table.',
    realWorldContext: 'Wildcard matching is the algorithm behind shell glob patterns (`ls *.txt`), file search dialogs, and simplified search-query matching. It is a deliberately simpler cousin of full regular expressions (no character classes, no quantifiers beyond `*`) — precisely the kind of "80% of the power, much simpler implementation" tool that appears in production file systems, build tools (`.gitignore` patterns), and package managers.',
    previewVisualizationId: 'ScienceNotebook',
  },

  intuition: {
    prose: [
      '**Same table shape as Chapter 1\'s sequence DP, third recurrence.** `dp[i][j]` = does `s[0..i)` match `p[0..j)`? Exactly the same (m+1)×(n+1) table shape as LCS and Edit Distance — but the recurrence encodes a different question: not "how similar," but "does this specific pattern, with its wildcards, fully account for this specific string."',
      '**The recurrence, one case at a time.** If `p[j-1]` is a literal character equal to `s[i-1]`, or `p[j-1]` is `?` (matches anything, exactly one character): `dp[i][j] = dp[i-1][j-1]` — consume one character from both, defer to whether the REST matched. If `p[j-1]` is `*`: it can match ZERO characters of `s` (defer to `dp[i][j-1]` — pattern advances, string does not) OR match ONE MORE character of `s` while staying available for more (defer to `dp[i-1][j]` — string advances, pattern does not move past the `*` yet, since `*` might need to consume MORE). So `dp[i][j] = dp[i-1][j] OR dp[i][j-1]`. Otherwise (mismatched literal character): `dp[i][j] = False`.',
      '**Base cases: an empty string against a non-empty pattern.** `dp[0][0] = True` (empty matches empty). `dp[0][j]` (empty string against a j-character pattern prefix) is `True` only if every character in that pattern prefix is `*` — each `*` can shrink to consume nothing, but a literal character or `?` cannot. This is computed left to right: `dp[0][j] = dp[0][j-1]` if `p[j-1] == '*'`, else `False`.',
      '**Why `*` produces an OR, not a single deterministic choice.** Unlike LCS or Edit Distance, where each cell had one clear "best" predecessor, a `*` genuinely has two DIFFERENT valid ways to have arrived at a match — having just consumed one more string character while the `*` "waits," or having decided the `*` is done consuming and control passes to the rest of the pattern. Both possibilities must be checked; if EITHER leads to an eventual full match, this cell is `True`.',
      '**Connection to the family.** LCS asks "longest shared order-preserving subsequence." Edit Distance asks "fewest operations to transform one string into another." Wildcard Matching asks "does this specific pattern fully explain this specific string." All three fill the identical (m+1)×(n+1) table shape, differing only in what each cell\'s boolean/numeric meaning is and what the recurrence computes from the three neighbors (`dp[i-1][j-1]`, `dp[i-1][j]`, `dp[i][j-1]`) — the shape of the table is the reusable skill; the recurrence is what you derive fresh for each new problem.',
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Chapter 5, Lesson 1: Wildcard Matching',
        body: '**Previous (Chapter 4):** Digit DP — combining multiple constraints in one recursion.\n**This lesson:** Wildcard Matching — a third recurrence on the LCS/Edit-Distance table shape.\n**Next:** Word Break — segmenting a string into dictionary words, a 1D string DP.',
      },
      {
        type: 'insight',
        title: 'The three sequence-DP recurrences, side by side',
        body: '**LCS:** match &rarr; `dp[i-1][j-1]+1`; mismatch &rarr; `max(dp[i-1][j], dp[i][j-1])`.\n**Edit Distance:** match &rarr; `dp[i-1][j-1]`; mismatch &rarr; `1+min(three neighbors)`.\n**Wildcard:** literal/`?` match &rarr; `dp[i-1][j-1]`; `*` &rarr; `dp[i-1][j] OR dp[i][j-1]`; literal mismatch &rarr; `False`.\nSame table, three different "what do neighbors mean" rules.',
      },
      {
        type: 'strategy',
        title: 'Reading the two `*` cases as physical actions',
        body: '`dp[i-1][j]` ("string advances, pattern does not"): the `*` swallows `s[i-1]` and stays put, ready to swallow more. `dp[i][j-1]` ("pattern advances, string does not"): the `*` is declared finished contributing zero-or-more characters, and control moves to whatever comes after it in the pattern. A `*` matching zero characters total is exactly the second case applied immediately.',
      },
      {
        type: 'warning',
        title: 'Consecutive stars still need first-row initialization',
        body: 'A pattern like `**` or `*?*` against an empty string requires walking `dp[0][j]` correctly: it stays `True` only as long as every character seen so far in the pattern is `*`. The moment a `?` or literal character appears in the pattern prefix, every `dp[0][j]` from that point onward is `False` — an empty string can never satisfy a required character.',
      },
    ],
    visualizations: [
      {
        id: 'ScienceNotebook',
        title: 'Wildcard Matching: The Table Fills In',
        caption: 'Watch the * case check BOTH neighboring cells, unlike LCS or Edit Distance which each had one clear rule per case.',
        props: {
          lesson: {
            title: 'Wildcard Matching Step by Step',
            subtitle: 'Same table shape as LCS and Edit Distance — a new recurrence.',
            sequential: true,
            cells: [
              {
                type: 'js',
                title: 'Building the Table: "adceb" vs "*a*b"',
                instruction: 'Watch each cell fill in. Cells under a * column check TWO neighbors (OR); cells under a literal/? column check ONE neighbor.',
                html: `<div id="d" style="padding:12px;font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;background:#0f172a;color:#e2e8f0}`,
                startCode: `const d = document.getElementById('d');
const s = "adceb", p = "*a*b";
const m = s.length, n = p.length;
const dp = Array.from({length: m+1}, () => new Array(n+1).fill(false));
dp[0][0] = true;
for (let j = 1; j <= n; j++) if (p[j-1] === '*') dp[0][j] = dp[0][j-1];
for (let i = 1; i <= m; i++) {
  for (let j = 1; j <= n; j++) {
    if (p[j-1] === '?' || p[j-1] === s[i-1]) dp[i][j] = dp[i-1][j-1];
    else if (p[j-1] === '*') dp[i][j] = dp[i-1][j] || dp[i][j-1];
  }
}

let html = '<div style="color:#60a5fa;margin-bottom:8px">s="' + s + '"  p="' + p + '"</div><table style="border-collapse:collapse;font-size:12px">';
html += '<tr><td></td><td></td>' + p.split('').map(c => '<td style="padding:5px 8px;color:#f59e0b">' + c + '</td>').join('') + '</tr>';
for (let i = 0; i <= m; i++) {
  html += '<tr><td style="padding:5px 8px;color:#94a3b8">' + (i===0?'':s[i-1]) + '</td>';
  for (let j = 0; j <= n; j++) {
    html += '<td style="border:1px solid #334155;padding:5px 8px;text-align:center;color:' + (dp[i][j]?'#4ade80':'#64748b') + '">' + (dp[i][j]?'T':'F') + '</td>';
  }
  html += '</tr>';
}
html += '</table>';
html += '<div style="margin-top:10px;background:' + (dp[m][n] ? '#052e16' : '#450a0a') + ';border-radius:6px;padding:8px 12px;color:' + (dp[m][n] ? '#4ade80' : '#f87171') + '">Match result: ' + dp[m][n] + '</div>';
d.innerHTML = html;`,
                outputHeight: 320,
              },
            ],
          },
        },
      },

      {
        id: 'JSNotebook',
        title: 'Build Wildcard Matching from Scratch',
        caption: 'The three-case recurrence on the LCS-shaped table.',
        props: {
          lesson: {
            title: 'Wildcard Matching in JavaScript',
            subtitle: 'A third recurrence, the same table shape.',
            cells: [
              {
                type: 'js',
                instruction: `## Step 1 — Build the Table

Implement \`isMatch(s, p)\`. Handle the first row (empty string) specially, then fill the rest of the table with the three-case recurrence.`,
                html: `<div id="out" style="font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;padding:14px;background:#0f172a;color:#e2e8f0;box-sizing:border-box;font-family:monospace}.pass{color:#4ade80;margin:2px 0}.fail{color:#f87171;margin:2px 0}`,
                startCode: `function isMatch(s, p) {
  const m = s.length, n = p.length;
  const dp = Array.from({length: m + 1}, () => new Array(n + 1).fill(false));
  dp[0][0] = true;
  for (let j = 1; j <= n; j++) {
    if (p[j-1] === '*') dp[0][j] = dp[0][j-1];
  }

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (p[j-1] === '?' || p[j-1] === s[i-1]) {
        // TODO: dp[i][j] = dp[i-1][j-1]
      } else if (p[j-1] === '*') {
        // TODO: dp[i][j] = dp[i-1][j] || dp[i][j-1]
      }
    }
  }
  return dp[m][n];
}

const out = document.getElementById('out');
function test(l, g, e) {
  const p = g === e;
  out.innerHTML += \`<div class="\${p?'pass':'fail'}">\${p?'✓':'✗'} \${l}: got \${g}, want \${e}</div>\`;
}

test('isMatch("aa", "a")', isMatch("aa", "a"), false);
test('isMatch("aa", "*")', isMatch("aa", "*"), true);
test('isMatch("cb", "?a")', isMatch("cb", "?a"), false);
test('isMatch("adceb", "*a*b")', isMatch("adceb", "*a*b"), true);
test('isMatch("acdcb", "a*c?b")', isMatch("acdcb", "a*c?b"), false);
test('isMatch("", "*")', isMatch("", "*"), true);`,
                solutionCode: `function isMatch(s, p) {
  const m = s.length, n = p.length;
  const dp = Array.from({length: m + 1}, () => new Array(n + 1).fill(false));
  dp[0][0] = true;
  for (let j = 1; j <= n; j++) {
    if (p[j-1] === '*') dp[0][j] = dp[0][j-1];
  }

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (p[j-1] === '?' || p[j-1] === s[i-1]) {
        dp[i][j] = dp[i-1][j-1];
      } else if (p[j-1] === '*') {
        dp[i][j] = dp[i-1][j] || dp[i][j-1];
      }
    }
  }
  return dp[m][n];
}

const out = document.getElementById('out');
function test(l, g, e) {
  const p = g === e;
  out.innerHTML += \`<div class="\${p?'pass':'fail'}">\${p?'✓':'✗'} \${l}: got \${g}, want \${e}</div>\`;
}

test('isMatch("aa", "a")', isMatch("aa", "a"), false);
test('isMatch("aa", "*")', isMatch("aa", "*"), true);
test('isMatch("cb", "?a")', isMatch("cb", "?a"), false);
test('isMatch("adceb", "*a*b")', isMatch("adceb", "*a*b"), true);
test('isMatch("acdcb", "a*c?b")', isMatch("acdcb", "a*c?b"), false);
test('isMatch("", "*")', isMatch("", "*"), true);`,
                outputHeight: 200,
              },
            ],
          },
        },
      },

      {
        id: 'PythonNotebook',
        title: 'Wildcard Matching in Python',
        caption: 'Build the table, visualize it as a heatmap, then a from-scratch challenge.',
        props: {
          initialCells: [
            {
              type: 'code',
              language: 'python',
              label: 'Wildcard Matching — Build and Verify',
              code: `def is_match(s, p):
    m, n = len(s), len(p)
    dp = [[False] * (n + 1) for _ in range(m + 1)]
    dp[0][0] = True
    for j in range(1, n + 1):
        if p[j - 1] == "*":
            dp[0][j] = dp[0][j - 1]

    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if p[j - 1] == "?" or p[j - 1] == s[i - 1]:
                dp[i][j] = dp[i - 1][j - 1]
            elif p[j - 1] == "*":
                dp[i][j] = dp[i - 1][j] or dp[i][j - 1]

    return dp[m][n]


tests = [
    ("aa", "a", False),
    ("aa", "*", True),
    ("cb", "?a", False),
    ("adceb", "*a*b", True),
    ("acdcb", "a*c?b", False),
]
for s, p, expected in tests:
    got = is_match(s, p)
    status = "PASS" if got == expected else "FAIL"
    print(f"{status}  is_match({s!r}, {p!r}) = {got}  (expected {expected})")

assert all(is_match(s, p) == expected for s, p, expected in tests)
print("Assertions passed!")`,
            },
            {
              type: 'code',
              language: 'python',
              label: 'Visualize: The Table as a Heatmap',
              code: `import matplotlib.pyplot as plt
import numpy as np


def is_match_table(s, p):
    m, n = len(s), len(p)
    dp = [[False] * (n + 1) for _ in range(m + 1)]
    dp[0][0] = True
    for j in range(1, n + 1):
        if p[j - 1] == "*":
            dp[0][j] = dp[0][j - 1]
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if p[j - 1] == "?" or p[j - 1] == s[i - 1]:
                dp[i][j] = dp[i - 1][j - 1]
            elif p[j - 1] == "*":
                dp[i][j] = dp[i - 1][j] or dp[i][j - 1]
    return dp


s, p = "adceb", "*a*b"
dp = is_match_table(s, p)
data = np.array(dp, dtype=float)

fig, ax = plt.subplots(figsize=(6, 5), facecolor="#0f172a")
ax.set_facecolor("#0f172a")
im = ax.imshow(data, cmap="RdYlGn", aspect="auto", vmin=0, vmax=1)
ax.set_xticks(range(len(p) + 1))
ax.set_xticklabels(["ε"] + list(p), color="#e2e8f0")
ax.set_yticks(range(len(s) + 1))
ax.set_yticklabels(["ε"] + list(s), color="#e2e8f0")
for i in range(len(s) + 1):
    for j in range(len(p) + 1):
        ax.text(j, i, "T" if dp[i][j] else "F", ha="center", va="center", color="black", fontsize=10)
ax.set_title(f's="{s}"  p="{p}"  →  match = {dp[-1][-1]}', color="#e2e8f0")
plt.tight_layout()
plt.show()`,
            },
            {
              type: 'code',
              language: 'python',
              challengeType: 'write',
              challengeNumber: 1,
              challengeTitle: 'Wildcard matching from scratch',
              difficulty: 'medium',
              prompt: 'Fill in the recurrence in is_match_scratch(s, p): handle the "?"/literal-match case and the "*" case (as an OR of two neighbors). Uncomment the assertions once ready.',
              hint: 'dp[i][j] = dp[i-1][j-1] when p[j-1] is "?" or equals s[i-1]. dp[i][j] = dp[i-1][j] or dp[i][j-1] when p[j-1] is "*".',
              label: 'From Scratch — Wildcard Matching',
              code: `def is_match_scratch(s, p):
    m, n = len(s), len(p)
    dp = [[False] * (n + 1) for _ in range(m + 1)]
    dp[0][0] = True
    for j in range(1, n + 1):
        if p[j - 1] == "*":
            dp[0][j] = dp[0][j - 1]

    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if p[j - 1] == "?" or p[j - 1] == s[i - 1]:
                # YOUR CODE HERE: dp[i][j] = dp[i-1][j-1]
                pass
            elif p[j - 1] == "*":
                # YOUR CODE HERE: dp[i][j] = dp[i-1][j] or dp[i][j-1]
                pass

    return dp[m][n]


# --- Uncomment to test when ready ---
# assert is_match_scratch("mississippi", "m??*ss*?i*pi") == False
# assert is_match_scratch("mississippi", "m??*ss*?i*p*.") == False
# assert is_match_scratch("abcabczzzde", "*abc???de*") == True
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
      text: 'Why does the "*" case in wildcard matching require checking TWO neighboring cells (an OR), while literal-character and "?" cases only check one?',
      options: [
        'This is an arbitrary implementation choice; a single neighbor would also work correctly',
        'A "*" genuinely has two distinct valid histories that could lead to a match here: it might have just consumed one more string character while continuing to wait (dp[i-1][j]), or it might be finished contributing and control has passed to the rest of the pattern (dp[i][j-1]). Either possibility succeeding makes this cell true',
        'Two neighbors are checked only for performance reasons, not correctness',
      ],
      correct: 1,
    },
    {
      id: 'q2',
      type: 'choice',
      text: 'Why is dp[0][j] (empty string against pattern prefix) True only when every character in that pattern prefix is "*"?',
      options: [
        'It should actually always be False for any non-empty pattern',
        'A "*" can shrink to consume zero characters, so a prefix made entirely of "*" characters can match an empty string. A literal character or "?" requires an actual character to be present in the string, which an empty string cannot provide — so the moment a non-"*" character appears in the pattern prefix, matching an empty string becomes impossible',
        'dp[0][j] is always equal to dp[0][0] regardless of the pattern',
      ],
      correct: 1,
    },
    {
      id: 'q3',
      type: 'choice',
      text: 'LCS, Edit Distance, and Wildcard Matching all fill the same (m+1)×(n+1) table shape. What actually differs between them?',
      options: [
        'Nothing meaningfully differs; they are the same algorithm with different variable names',
        'The MEANING of each cell (length of shared subsequence vs. minimum edit operations vs. boolean match) and the RECURRENCE relating each cell to its neighbors differ, even though the table\'s shape and the general "fill row by row using previously computed neighbors" strategy stay the same',
        'Wildcard Matching uses a completely different table shape with an extra dimension for the wildcard positions',
      ],
      correct: 1,
    },
    {
      id: 'q4',
      type: 'choice',
      text: 'What would go wrong if the first-row initialization (dp[0][j]) were skipped or set incorrectly for a pattern starting with multiple "*" characters?',
      options: [
        'Nothing — the main double loop would still compute the correct final answer regardless of the first row',
        'The main recurrence for "*" directly reads dp[i][j-1], which for i=0 reads a value from that same first row — an incorrectly initialized first row would propagate wrong "false" or "true" values into every cell that depends on it, corrupting the entire table',
        'Wildcard patterns can never start with multiple consecutive "*" characters, so this case never actually arises',
      ],
      correct: 1,
    },
  ],
};
