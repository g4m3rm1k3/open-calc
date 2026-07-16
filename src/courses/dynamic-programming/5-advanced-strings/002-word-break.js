export default {
  id: 'dp5-002',
  slug: 'word-break',
  chapter: 'dp5',
  order: 2,
  title: 'Word Break: Segmenting a String into Dictionary Words',
  subtitle: 'A 1D string DP, then extending it to enumerate every segmentation',
  tags: ['dynamic programming', 'string dp', 'word break', 'segmentation'],
  aliases: 'word break dp string segmentation dictionary words',

  hook: {
    question: 'Can the string "applepenapple" be split into a sequence of words from the dictionary {"apple", "pen"}? Yes: "apple pen apple". Can "catsandog" be split using {"cats", "dog", "sand", "and", "cat"}? No — every possible split leaves a leftover chunk that is not a dictionary word. This is a 1D DP (unlike the 2D tables of the last few lessons) — the state is simply a position in ONE string, not a pair of positions in two.',
    realWorldContext: 'Word segmentation is a foundational NLP problem for languages without spaces between words (Chinese, Japanese, Thai text segmentation) and for URL/hashtag parsing ("#dynamicprogramming" — is it segmentable into real words?). Search autocomplete and spell-correction systems use word-break-style DP to check whether a garbled or concatenated input could plausibly be a sequence of valid words.',
    previewVisualizationId: 'ScienceNotebook',
  },

  intuition: {
    prose: [
      '**Back to one dimension — but the recurrence has a twist.** `dp[i]` = can `s[0..i)` be fully segmented into dictionary words? Unlike Chapter 1\'s 1D DP (which looked back at a FIXED number of previous states, like `dp[i-1]` and `dp[i-2]`), Word Break\'s recurrence looks back at EVERY possible previous split point: `dp[i] = OR over all j < i of (dp[j] AND s[j:i] is in the dictionary)`. This makes the naive version O(n²) (or O(n² × average word length) with substring checks), not O(n) — a reminder that "1D DP" describes the shape of the STATE, not automatically the cost of each transition.',
      '**Base case and reading the answer.** `dp[0] = True` — the empty prefix is trivially "successfully segmented" (zero words used). The final answer is `dp[n]`, where `n` is the full string\'s length. Every `dp[i]` in between represents "is there SOME way to have validly segmented the string up to position i," without caring which specific way.',
      '**Word Break II: from "can it be done" to "show every way it can be done."** This is the same reconstruction idea from Chapter 1\'s sequence DP (recovering the actual LCS string, not just its length) — but now there can be MANY valid answers, not one. Instead of a boolean `dp[i]`, compute `sentences[i]` = the list of every valid way to segment `s[0..i)`, expressed as complete sentences. `sentences[i]` is built by trying every dictionary word ending exactly at position `i`, and for each one, prepending it to every sentence already found for the position where that word started.',
      '**Why memoized recursion (not a forward array fill) is more natural for Word Break II.** Word Break I fills `dp[]` forward because a single boolean is cheap to combine (OR). Word Break II\'s "list of sentences" can be expensive to build eagerly for positions that never end up contributing to the final answer. A recursive `solve(start)` — "give me every valid sentence for the SUFFIX beginning at `start`" — naturally skips any work for combinations that are never actually needed, while `@lru_cache` (or a manual memo dict) still ensures each distinct `start` is only computed once.',
      '**Complexity caution for Word Break II.** The NUMBER of valid segmentations can itself be exponential in the string length (imagine a dictionary and string constructed so that every position offers multiple valid word choices) — so Word Break II is fundamentally different from Word Break I in its worst-case OUTPUT size, not just its implementation. Memoization prevents recomputing the same suffix\'s sentence list twice, but it cannot make the total output smaller than however many valid segmentations genuinely exist.',
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Chapter 5, Lesson 2: Word Break',
        body: '**Previous:** Wildcard Matching — a third recurrence on the 2D sequence-DP table.\n**This lesson:** Word Break I (can it be segmented) and II (show every segmentation) — 1D string DP with a variable-length lookback.\n**Next:** Distinct Subsequences — counting, not just checking, on the 2D table shape.',
      },
      {
        type: 'insight',
        title: 'Variable-length lookback vs. fixed-length lookback',
        body: 'Chapter 1\'s House Robber looked back exactly 1-2 positions — O(1) work per state. Word Break looks back to EVERY earlier valid split point — O(n) work per state, O(n²) total. Both are "1D DP" in the sense that the state is a single index, but recognizing the cost of each transition is a separate, equally important analysis.',
      },
      {
        type: 'strategy',
        title: 'Word Break I vs II: boolean OR vs. list concatenation',
        body: 'Word Break I combines sub-answers with logical OR (any valid split point is enough). Word Break II combines sub-answers by concatenating every combination of (word, already-found suffix sentence) — structurally similar to how Chapter 1\'s Coin Change II counted combinations rather than just checking feasibility.',
      },
      {
        type: 'warning',
        title: 'Word Break II\'s output size is not under your control',
        body: 'Memoizing `solve(start)` prevents recomputing the same suffix twice, but if a string genuinely admits an exponential number of distinct segmentations, the function must still return all of them — memoization controls redundant WORK, not the unavoidable size of a correct, complete answer.',
      },
    ],
    visualizations: [
      {
        id: 'ScienceNotebook',
        title: 'Word Break: Every Split Point Considered',
        caption: 'Watch dp[i] check every earlier valid split point, not just a fixed lookback.',
        props: {
          lesson: {
            title: 'Word Break Step by Step',
            subtitle: '1D DP with a variable-length lookback.',
            sequential: true,
            cells: [
              {
                type: 'js',
                title: 'dp[i] Checks Every Earlier Split',
                instruction: 'For "applepenapple" with dictionary {apple, pen}, watch which split points make each dp[i] true.',
                html: `<div id="d" style="padding:12px;font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;background:#0f172a;color:#e2e8f0}`,
                startCode: `const d = document.getElementById('d');
const s = "applepenapple";
const words = new Set(["apple", "pen"]);
const n = s.length;
const dp = new Array(n + 1).fill(false);
dp[0] = true;
const log = [];

for (let i = 1; i <= n; i++) {
  for (let j = 0; j < i; j++) {
    if (dp[j] && words.has(s.slice(j, i))) {
      dp[i] = true;
      log.push({ i, j, word: s.slice(j, i) });
      break;
    }
  }
}

let html = '<div style="color:#60a5fa;margin-bottom:8px">s = "' + s + '"  dictionary = {apple, pen}</div>';
log.forEach(e => {
  html += '<div style="padding:4px 10px;background:#1e293b;border-radius:4px;margin-bottom:3px">dp[' + e.i + '] = true via split at j=' + e.j + ' &nbsp; (word: "<b style="color:#4ade80">' + e.word + '</b>")</div>';
});
html += '<div style="margin-top:10px;background:' + (dp[n] ? '#052e16' : '#450a0a') + ';border-radius:6px;padding:8px 12px;color:' + (dp[n] ? '#4ade80' : '#f87171') + '">Final: dp[' + n + '] = ' + dp[n] + '</div>';
d.innerHTML = html;`,
                outputHeight: 300,
              },
              {
                type: 'js',
                title: 'Word Break II: Every Valid Sentence',
                instruction: 'For "catsanddog", watch every complete valid segmentation get built from suffix sentences.',
                html: `<div id="d" style="padding:12px;font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;background:#0f172a;color:#e2e8f0}`,
                startCode: `const d = document.getElementById('d');
const s = "catsanddog";
const words = new Set(["cat", "cats", "and", "sand", "dog"]);
const n = s.length;
const memo = new Map();

function solve(start) {
  if (start === n) return [""];
  if (memo.has(start)) return memo.get(start);
  const results = [];
  for (let end = start + 1; end <= n; end++) {
    const piece = s.slice(start, end);
    if (words.has(piece)) {
      for (const rest of solve(end)) {
        results.push(rest === "" ? piece : piece + " " + rest);
      }
    }
  }
  memo.set(start, results);
  return results;
}

const sentences = solve(0);
let html = '<div style="color:#60a5fa;margin-bottom:8px">s = "' + s + '"  dictionary = {cat, cats, and, sand, dog}</div>';
sentences.forEach(sentence => {
  html += '<div style="padding:4px 10px;background:#1e293b;border-radius:4px;margin-bottom:3px;color:#4ade80">"' + sentence + '"</div>';
});
html += '<div style="margin-top:10px;background:#172554;border-radius:6px;padding:8px 12px;color:#93c5fd">' + sentences.length + ' distinct valid segmentations found.</div>';
d.innerHTML = html;`,
                outputHeight: 260,
              },
            ],
          },
        },
      },

      {
        id: 'JSNotebook',
        title: 'Build Word Break from Scratch',
        caption: 'Word Break I (feasibility), then Word Break II (enumeration).',
        props: {
          lesson: {
            title: 'Word Break in JavaScript',
            subtitle: 'A variable-length-lookback 1D DP, then a memoized enumeration.',
            cells: [
              {
                type: 'js',
                instruction: `## Step 1 — Word Break I

Implement \`wordBreak(s, wordDict)\`. \`dp[i]\` = can \`s[0..i)\` be segmented? Check every earlier split point \`j\`.`,
                html: `<div id="out" style="font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;padding:14px;background:#0f172a;color:#e2e8f0;box-sizing:border-box;font-family:monospace}.pass{color:#4ade80;margin:2px 0}.fail{color:#f87171;margin:2px 0}`,
                startCode: `function wordBreak(s, wordDict) {
  const words = new Set(wordDict);
  const n = s.length;
  const dp = new Array(n + 1).fill(false);
  dp[0] = true;

  for (let i = 1; i <= n; i++) {
    for (let j = 0; j < i; j++) {
      // TODO: if dp[j] is true AND s.slice(j, i) is in words, set dp[i] = true and break
    }
  }
  return dp[n];
}

const out = document.getElementById('out');
function test(l, g, e) {
  const p = g === e;
  out.innerHTML += \`<div class="\${p?'pass':'fail'}">\${p?'✓':'✗'} \${l}: got \${g}, want \${e}</div>\`;
}

test('leetcode', wordBreak("leetcode", ["leet","code"]), true);
test('applepenapple', wordBreak("applepenapple", ["apple","pen"]), true);
test('catsandog', wordBreak("catsandog", ["cats","dog","sand","and","cat"]), false);`,
                solutionCode: `function wordBreak(s, wordDict) {
  const words = new Set(wordDict);
  const n = s.length;
  const dp = new Array(n + 1).fill(false);
  dp[0] = true;

  for (let i = 1; i <= n; i++) {
    for (let j = 0; j < i; j++) {
      if (dp[j] && words.has(s.slice(j, i))) {
        dp[i] = true;
        break;
      }
    }
  }
  return dp[n];
}

const out = document.getElementById('out');
function test(l, g, e) {
  const p = g === e;
  out.innerHTML += \`<div class="\${p?'pass':'fail'}">\${p?'✓':'✗'} \${l}: got \${g}, want \${e}</div>\`;
}

test('leetcode', wordBreak("leetcode", ["leet","code"]), true);
test('applepenapple', wordBreak("applepenapple", ["apple","pen"]), true);
test('catsandog', wordBreak("catsandog", ["cats","dog","sand","and","cat"]), false);`,
                outputHeight: 160,
              },
              {
                type: 'js',
                instruction: `## Step 2 — Word Break II

Implement \`wordBreakII(s, wordDict)\`, returning every valid sentence. Use memoized recursion: \`solve(start)\` returns every valid sentence for the suffix beginning at \`start\`.`,
                html: `<div id="out" style="font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;padding:14px;background:#0f172a;color:#e2e8f0;box-sizing:border-box;font-family:monospace}.pass{color:#4ade80;margin:2px 0}.fail{color:#f87171;margin:2px 0}`,
                startCode: `function wordBreakII(s, wordDict) {
  const words = new Set(wordDict);
  const n = s.length;
  const memo = new Map();

  function solve(start) {
    if (start === n) return [""];
    if (memo.has(start)) return memo.get(start);
    const results = [];
    for (let end = start + 1; end <= n; end++) {
      const piece = s.slice(start, end);
      if (words.has(piece)) {
        // TODO: for each \`rest\` in solve(end), push
        //       (rest === "" ? piece : piece + " " + rest) onto results
      }
    }
    memo.set(start, results);
    return results;
  }

  return solve(0);
}

const out = document.getElementById('out');
function test(l, g, e) {
  const p = JSON.stringify([...g].sort()) === JSON.stringify([...e].sort());
  out.innerHTML += \`<div class="\${p?'pass':'fail'}">\${p?'✓':'✗'} \${l}: got \${JSON.stringify(g)}</div>\`;
}

test('catsanddog', wordBreakII("catsanddog", ["cat","cats","and","sand","dog"]), ["cats and dog", "cat sand dog"]);
test('single word', wordBreakII("apple", ["apple"]), ["apple"]);`,
                solutionCode: `function wordBreakII(s, wordDict) {
  const words = new Set(wordDict);
  const n = s.length;
  const memo = new Map();

  function solve(start) {
    if (start === n) return [""];
    if (memo.has(start)) return memo.get(start);
    const results = [];
    for (let end = start + 1; end <= n; end++) {
      const piece = s.slice(start, end);
      if (words.has(piece)) {
        for (const rest of solve(end)) {
          results.push(rest === "" ? piece : piece + " " + rest);
        }
      }
    }
    memo.set(start, results);
    return results;
  }

  return solve(0);
}

const out = document.getElementById('out');
function test(l, g, e) {
  const p = JSON.stringify([...g].sort()) === JSON.stringify([...e].sort());
  out.innerHTML += \`<div class="\${p?'pass':'fail'}">\${p?'✓':'✗'} \${l}: got \${JSON.stringify(g)}</div>\`;
}

test('catsanddog', wordBreakII("catsanddog", ["cat","cats","and","sand","dog"]), ["cats and dog", "cat sand dog"]);
test('single word', wordBreakII("apple", ["apple"]), ["apple"]);`,
                outputHeight: 160,
              },
            ],
          },
        },
      },

      {
        id: 'PythonNotebook',
        title: 'Word Break in Python',
        caption: 'Both variants, with a visualization of split points, then a from-scratch challenge.',
        props: {
          initialCells: [
            {
              type: 'code',
              language: 'python',
              label: 'Word Break I and II — Build and Verify',
              code: `def word_break(s, word_dict):
    words = set(word_dict)
    n = len(s)
    dp = [False] * (n + 1)
    dp[0] = True
    for i in range(1, n + 1):
        for j in range(i):
            if dp[j] and s[j:i] in words:
                dp[i] = True
                break
    return dp[n]


def word_break_ii(s, word_dict):
    words = set(word_dict)
    n = len(s)
    memo = {}

    def solve(start):
        if start == n:
            return [""]
        if start in memo:
            return memo[start]
        results = []
        for end in range(start + 1, n + 1):
            piece = s[start:end]
            if piece in words:
                for rest in solve(end):
                    results.append(piece if not rest else piece + " " + rest)
        memo[start] = results
        return results

    return solve(0)


print("word_break('leetcode', ['leet','code']):", word_break("leetcode", ["leet", "code"]))
print("word_break('catsandog', [...]):", word_break("catsandog", ["cats", "dog", "sand", "and", "cat"]))
print("word_break_ii('catsanddog', [...]):", word_break_ii("catsanddog", ["cat", "cats", "and", "sand", "dog"]))

assert word_break("leetcode", ["leet", "code"]) is True
assert word_break("catsandog", ["cats", "dog", "sand", "and", "cat"]) is False
assert sorted(word_break_ii("catsanddog", ["cat", "cats", "and", "sand", "dog"])) == sorted(["cats and dog", "cat sand dog"])
print("Assertions passed!")`,
            },
            {
              type: 'code',
              language: 'python',
              label: 'Visualize: Which Split Points Are Reachable',
              code: `import matplotlib.pyplot as plt


def word_break_with_splits(s, word_dict):
    words = set(word_dict)
    n = len(s)
    dp = [False] * (n + 1)
    dp[0] = True
    split_used = [None] * (n + 1)
    for i in range(1, n + 1):
        for j in range(i):
            if dp[j] and s[j:i] in words:
                dp[i] = True
                split_used[i] = j
                break
    return dp, split_used


s = "applepenapple"
dp, split_used = word_break_with_splits(s, ["apple", "pen"])

fig, ax = plt.subplots(figsize=(10, 3), facecolor="#0f172a")
ax.set_facecolor("#0f172a")
for i in range(len(s) + 1):
    color = "#4ade80" if dp[i] else "#334155"
    ax.scatter([i], [0], s=300, color=color, zorder=2)
    ax.text(i, 0.15, str(i), ha="center", color="#94a3b8", fontsize=9)
for i in range(1, len(s) + 1):
    if split_used[i] is not None:
        j = split_used[i]
        ax.annotate("", xy=(i, 0), xytext=(j, 0),
                     arrowprops=dict(arrowstyle="->", color="#4ade80", connectionstyle="arc3,rad=0.3"))
ax.set_xlim(-0.5, len(s) + 0.5)
ax.set_ylim(-0.3, 0.5)
ax.axis("off")
ax.set_title(f's = "{s}" — reachable split points (green) and the word each arrow represents', color="#e2e8f0", fontsize=10)
plt.tight_layout()
plt.show()`,
            },
            {
              type: 'code',
              language: 'python',
              challengeType: 'write',
              challengeNumber: 1,
              challengeTitle: 'Word Break, from scratch',
              difficulty: 'medium',
              prompt: 'Fill in word_break_scratch(s, word_dict): for each position i, check every earlier split point j. Uncomment the assertions once ready.',
              hint: 'dp[i] = True as soon as some j < i has dp[j] True and s[j:i] in the word set. No need to check further j once dp[i] is already True.',
              label: 'From Scratch — Word Break',
              code: `def word_break_scratch(s, word_dict):
    words = set(word_dict)
    n = len(s)
    dp = [False] * (n + 1)
    dp[0] = True

    for i in range(1, n + 1):
        for j in range(i):
            # YOUR CODE HERE:
            # if dp[j] and s[j:i] in words: dp[i] = True; break
            pass

    return dp[n]


# --- Uncomment to test when ready ---
# assert word_break_scratch("pineapplepenapple", ["apple", "pen", "applepen", "pine", "pineapple"]) == True
# assert word_break_scratch("aaaaaaa", ["aaaa", "aaa"]) == True
# assert word_break_scratch("aaaaaaab", ["aaaa", "aaa"]) == False
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
      text: 'Word Break\'s dp[i] looks back at every earlier split point j, unlike House Robber\'s fixed dp[i-1]/dp[i-2]. What does this say about "1D DP" as a category?',
      options: [
        '1D DP always means O(1) work per state; Word Break must therefore not really be 1D DP',
        '"1D DP" describes the shape of the STATE (a single index) — it says nothing by itself about how much work each transition costs. Word Break is 1D in state but O(n) per transition (checking every earlier split point), giving O(n²) total, unlike House Robber\'s O(1) per transition',
        'Word Break secretly uses 2D DP internally, disguised as a 1D array',
      ],
      correct: 1,
    },
    {
      id: 'q2',
      type: 'choice',
      text: 'Why is memoized recursion more natural than a forward dp[] array fill for Word Break II specifically?',
      options: [
        'Recursion is always faster than iteration in JavaScript and Python',
        'Word Break II\'s per-position "answer" is a whole LIST of sentences, which can be expensive to build. A recursive solve(start) only computes the sentence list for positions actually needed to answer the original query, while memoization still ensures each distinct position is computed once — a forward fill would eagerly compute every position\'s full list regardless of whether it is ever used',
        'Word Break II cannot be implemented with a forward array fill under any circumstances',
      ],
      correct: 1,
    },
    {
      id: 'q3',
      type: 'choice',
      text: 'Why can Word Break II\'s total output size be exponential in the string length, even with correct memoization?',
      options: [
        'Because memoization is broken for this specific problem and recomputes work unnecessarily',
        'A string and dictionary can be constructed so that a genuinely exponential number of distinct valid segmentations exist — memoization prevents recomputing the same suffix\'s sentence list twice, but it cannot reduce the size of the CORRECT, complete answer below however many valid segmentations actually exist',
        'Word Break II always runs in polynomial time and space; this scenario cannot occur',
      ],
      correct: 1,
    },
    {
      id: 'q4',
      type: 'choice',
      text: 'What is the base case for Word Break I\'s dp[], and why does it represent "the empty prefix"?',
      options: [
        'dp[0] = False, because zero words cannot form a valid segmentation',
        'dp[0] = True — segmenting a prefix of length 0 requires using zero dictionary words, which is trivially and vacuously a valid (if empty) segmentation, giving every other dp[i] a valid starting point to build from',
        'There is no base case; the recursion terminates purely based on string length',
      ],
      correct: 1,
    },
  ],
};
