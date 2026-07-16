export default {
  id: 'dp5-004',
  slug: 'scramble-string',
  chapter: 'dp5',
  order: 4,
  title: 'Scramble String: Interval DP, Back Again — on Strings',
  subtitle: 'Recursively splitting a string in half, with an optional swap',
  tags: ['dynamic programming', 'string dp', 'scramble string', 'interval dp', 'recursion tree'],
  aliases: 'scramble string dp interval dp on strings',

  hook: {
    question: 'Is "rgeat" a scrambled version of "great"? Yes — split "great" into "gr" and "eat", then split "eat" (recursively) into "e" and "at", swap "e" and "at" to get "ate"... actually the real scramble here swaps the TOP-level split: "great" splits into "gr"+"eat", and scrambling swaps them to "eat"+"gr", then further scrambles "eat" internally into "eat" itself (no change) giving... the point is: a "scramble" is built by repeatedly picking a substring, splitting it in half at any position, and optionally swapping the two halves, all the way down to single characters. Checking whether one string could have been produced from another this way is a genuinely tree-shaped recursive question — Chapter 3\'s Interval DP, applied to strings instead of numeric arrays.',
    realWorldContext: 'Scramble-string-style reasoning models any binary tree of "split and possibly swap" transformations: verifying whether a shuffled/reordered hierarchical document structure could have come from a specific original (a scrambled outline), and appears directly in bioinformatics as one model for genome rearrangement (chromosomal segments splitting and reordering during evolution). It is also a canonical exercise in recognizing when a problem requires interval DP over TWO strings simultaneously, not just one array.',
    previewVisualizationId: 'ScienceNotebook',
  },

  intuition: {
    prose: [
      '**Restating the recursive structure.** A string `s1` scrambles into `s2` if EITHER `s1 == s2` (the trivial base case), OR there exists some split point `i` such that: (no-swap case) `s1[0:i]` scrambles into `s2[0:i]` AND `s1[i:]` scrambles into `s2[i:]`; OR (swap case) `s1[0:i]` scrambles into `s2[len-i:]` AND `s1[i:]` scrambles into `s2[0:len-i]`. This is Chapter 3\'s interval DP "split at every position, try every split" pattern — but now the state is a PAIR of substrings (one from each string), not a single interval `[i,j]`.',
      '**A crucial early prune: character multisets must match.** Before trying any split, check whether `s1` and `s2` contain exactly the same multiset of characters (e.g., via sorted comparison or a character-count comparison). If they do not, NO scramble is possible — full stop, no need to explore any split. This is a cheap O(n log n) or O(n) check that prunes an enormous number of hopeless recursive branches immediately, well before the expensive split-and-recurse logic runs.',
      '**Why memoization matters here, specifically.** Without memoization, the same `(substring of s1, substring of s2)` pair can be asked about repeatedly through different split paths — this is a genuine case of overlapping subproblems, exactly the condition from Lesson 1 of this entire course that signals dynamic programming applies. Memoizing on the PAIR of substrings (or, more efficiently, on `(start1, start2, length)` — since a substring is fully determined by its start index and length) turns an exponential brute-force tree into a polynomial-time algorithm.',
      '**Memoizing on substrings vs. memoizing on indices.** The simplest correct implementation memoizes directly on the pair of substring VALUES (e.g., using a dictionary keyed by `(s1_sub, s2_sub)` in Python, which works because strings are hashable). A more index-based version memoizes on `(i1, i2, length)` — the starting index in `s1`, the starting index in `s2`, and the shared length — avoiding the overhead of slicing and hashing substrings repeatedly. Both are correct; the index-based version is the standard "production" optimization once the substring-keyed version is understood and verified.',
      '**Closing the chapter: interval DP is not limited to numeric arrays.** Chapter 3 introduced interval DP on numeric sequences (Matrix Chain, Burst Balloons). This lesson shows the identical "split range into two, try every split point, optionally recombine" structure applies just as naturally when the "range" is a substring and the state additionally needs to track a SECOND string\'s corresponding range. The core recognition skill — "does the optimal answer for a range depend on splitting it and combining two independently-solved pieces?" — transfers across data types, exactly like the table-shape recognition from this chapter\'s first three lessons.',
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Chapter 5, Lesson 4: Scramble String',
        body: '**Previous:** Distinct Subsequences — counting on the LCS-shaped table.\n**This lesson:** Scramble String — interval DP on a PAIR of strings, closing the chapter.\n**Next chapter:** DP Optimization Techniques — monotonic deque, Knuth\'s optimization, divide-and-conquer optimization.',
      },
      {
        type: 'insight',
        title: 'Interval DP\'s signature, recognized again',
        body: 'Chapter 3: "does the best answer for range [i,j] come from trying every split point k and combining the two halves\' answers?" Scramble String: identical question, except the "range" is a pair of same-length substrings from two different strings, and "combining" means checking both halves matched (in either order — swap or no-swap).',
      },
      {
        type: 'strategy',
        title: 'Always prune with a character-count check first',
        body: 'Before any recursive split logic, compare the sorted characters (or character-count dictionaries) of the two substrings being compared. A mismatch here means an immediate `False`, skipping potentially enormous recursive exploration for pairs that could never possibly scramble into each other.',
      },
      {
        type: 'warning',
        title: 'Both split branches must be checked — do not stop at the first',
        body: 'A split at position `i` might fail in the no-swap orientation but SUCCEED in the swap orientation (or vice versa) — and different split positions `i` can each independently succeed or fail. The recursion must try every split position AND both orientations at each one, returning True as soon as any single (position, orientation) combination fully succeeds, but it cannot skip checking the swap case just because the no-swap case failed at that particular split.',
      },
    ],
    visualizations: [
      {
        id: 'ScienceNotebook',
        title: 'Scramble String: The Recursion Tree',
        caption: 'Watch splits get tried at every position, with both orientations checked, and the character-count prune cut off hopeless branches.',
        props: {
          lesson: {
            title: 'Scramble String Step by Step',
            subtitle: 'Interval DP on a pair of strings.',
            sequential: true,
            cells: [
              {
                type: 'js',
                title: 'The Character-Count Prune',
                instruction: 'Before any splitting, check whether the two strings even have the same characters available. See how many candidate pairs get eliminated immediately.',
                html: `<div id="d" style="padding:12px;font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;background:#0f172a;color:#e2e8f0}`,
                startCode: `const d = document.getElementById('d');
function sameChars(a, b) {
  return a.split('').sort().join('') === b.split('').sort().join('');
}
const pairs = [
  ['great', 'rgeat'],
  ['abcde', 'caebd'],
  ['a', 'a'],
  ['abb', 'bba'],
];
let html = '<div style="color:#60a5fa;margin-bottom:8px">Character-count prune check:</div>';
pairs.forEach(([a, b]) => {
  const ok = sameChars(a, b);
  html += '<div style="padding:5px 10px;background:#1e293b;border-radius:4px;margin-bottom:4px">"' + a + '" vs "' + b + '"  &rarr;  same characters? <b style="color:' + (ok ? '#4ade80' : '#f87171') + '">' + ok + '</b>' + (ok ? ' (worth exploring splits)' : ' (PRUNED — no need to check any split)') + '</div>';
});
d.innerHTML = html;`,
                outputHeight: 220,
              },
              {
                type: 'js',
                title: 'Trying Every Split, Both Orientations',
                instruction: 'For "great" vs "rgeat", watch each split position get tried in both no-swap and swap orientations.',
                html: `<div id="d" style="padding:12px;font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;background:#0f172a;color:#e2e8f0}`,
                startCode: `const d = document.getElementById('d');
const memo = new Map();
const log = [];

function sameChars(a, b) {
  return a.split('').sort().join('') === b.split('').sort().join('');
}

function solve(a, b) {
  if (a === b) return true;
  if (!sameChars(a, b)) return false;
  const key = a + '|' + b;
  if (memo.has(key)) return memo.get(key);
  const n = a.length;
  let result = false;
  for (let i = 1; i < n && !result; i++) {
    const noSwap = solve(a.slice(0, i), b.slice(0, i)) && solve(a.slice(i), b.slice(i));
    const swap = solve(a.slice(0, i), b.slice(n - i)) && solve(a.slice(i), b.slice(0, n - i));
    log.push({ a, b, i, noSwap, swap });
    result = noSwap || swap;
  }
  memo.set(key, result);
  return result;
}

const answer = solve("great", "rgeat");
let html = '<div style="color:#60a5fa;margin-bottom:8px">Splits tried (top-level call only shown first):</div>';
log.slice(0, 10).forEach(e => {
  html += '<div style="padding:3px 10px;background:#1e293b;border-radius:4px;margin-bottom:2px;font-size:11px">"' + e.a + '" vs "' + e.b + '"  split at ' + e.i + ':  noSwap=' + e.noSwap + '  swap=<b style="color:' + (e.swap?'#4ade80':'#94a3b8') + '">' + e.swap + '</b></div>';
});
html += '<div style="margin-top:10px;background:' + (answer?'#052e16':'#450a0a') + ';border-radius:6px;padding:8px 12px;color:' + (answer?'#4ade80':'#f87171') + '">Result: "great" scrambles into "rgeat"? ' + answer + '</div>';
d.innerHTML = html;`,
                outputHeight: 380,
              },
            ],
          },
        },
      },

      {
        id: 'JSNotebook',
        title: 'Build Scramble String from Scratch',
        caption: 'Interval DP on strings, with the character-count prune and memoization.',
        props: {
          lesson: {
            title: 'Scramble String in JavaScript',
            subtitle: 'Split at every position, try both orientations, memoize on the pair.',
            cells: [
              {
                type: 'js',
                instruction: `## Step 1 — The Character-Count Prune

Implement \`sameChars(a, b)\`, checking whether two strings are anagrams of each other (same multiset of characters).`,
                html: `<div id="out" style="font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;padding:14px;background:#0f172a;color:#e2e8f0;box-sizing:border-box;font-family:monospace}.pass{color:#4ade80;margin:2px 0}.fail{color:#f87171;margin:2px 0}`,
                startCode: `function sameChars(a, b) {
  // TODO: return true if a and b are anagrams of each other
  // Hint: sort both strings' characters and compare.
}

const out = document.getElementById('out');
function test(l, g, e) {
  const p = g === e;
  out.innerHTML += \`<div class="\${p?'pass':'fail'}">\${p?'✓':'✗'} \${l}: got \${g}, want \${e}</div>\`;
}

test('sameChars("great", "rgeat")', sameChars("great", "rgeat"), true);
test('sameChars("abcde", "caebd")', sameChars("abcde", "caebd"), true);
test('sameChars("abc", "abd")', sameChars("abc", "abd"), false);
test('sameChars("a", "a")', sameChars("a", "a"), true);`,
                solutionCode: `function sameChars(a, b) {
  return a.split('').sort().join('') === b.split('').sort().join('');
}

const out = document.getElementById('out');
function test(l, g, e) {
  const p = g === e;
  out.innerHTML += \`<div class="\${p?'pass':'fail'}">\${p?'✓':'✗'} \${l}: got \${g}, want \${e}</div>\`;
}

test('sameChars("great", "rgeat")', sameChars("great", "rgeat"), true);
test('sameChars("abcde", "caebd")', sameChars("abcde", "caebd"), true);
test('sameChars("abc", "abd")', sameChars("abc", "abd"), false);
test('sameChars("a", "a")', sameChars("a", "a"), true);`,
                outputHeight: 140,
              },
              {
                type: 'js',
                instruction: `## Step 2 — The Full Scramble Check

Implement \`isScramble(s1, s2)\`. Use the character-count prune first, then try every split position in both orientations, memoizing on the pair of substrings.`,
                html: `<div id="out" style="font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;padding:14px;background:#0f172a;color:#e2e8f0;box-sizing:border-box;font-family:monospace}.pass{color:#4ade80;margin:2px 0}.fail{color:#f87171;margin:2px 0}`,
                startCode: `function sameChars(a, b) {
  return a.split('').sort().join('') === b.split('').sort().join('');
}

function isScramble(s1, s2) {
  const memo = new Map();
  function solve(a, b) {
    if (a === b) return true;
    if (!sameChars(a, b)) return false;
    const key = a + '|' + b;
    if (memo.has(key)) return memo.get(key);
    const n = a.length;
    let result = false;
    for (let i = 1; i < n && !result; i++) {
      // TODO: noSwap = solve(a[0:i], b[0:i]) && solve(a[i:], b[i:])
      // TODO: swap = solve(a[0:i], b[n-i:]) && solve(a[i:], b[0:n-i])
      // TODO: result = noSwap || swap
    }
    memo.set(key, result);
    return result;
  }
  return solve(s1, s2);
}

const out = document.getElementById('out');
function test(l, g, e) {
  const p = g === e;
  out.innerHTML += \`<div class="\${p?'pass':'fail'}">\${p?'✓':'✗'} \${l}: got \${g}, want \${e}</div>\`;
}

test('isScramble("great", "rgeat")', isScramble("great", "rgeat"), true);
test('isScramble("abcde", "caebd")', isScramble("abcde", "caebd"), false);
test('isScramble("a", "a")', isScramble("a", "a"), true);
test('isScramble("abb", "bba")', isScramble("abb", "bba"), true);`,
                solutionCode: `function sameChars(a, b) {
  return a.split('').sort().join('') === b.split('').sort().join('');
}

function isScramble(s1, s2) {
  const memo = new Map();
  function solve(a, b) {
    if (a === b) return true;
    if (!sameChars(a, b)) return false;
    const key = a + '|' + b;
    if (memo.has(key)) return memo.get(key);
    const n = a.length;
    let result = false;
    for (let i = 1; i < n && !result; i++) {
      const noSwap = solve(a.slice(0, i), b.slice(0, i)) && solve(a.slice(i), b.slice(i));
      const swap = solve(a.slice(0, i), b.slice(n - i)) && solve(a.slice(i), b.slice(0, n - i));
      result = noSwap || swap;
    }
    memo.set(key, result);
    return result;
  }
  return solve(s1, s2);
}

const out = document.getElementById('out');
function test(l, g, e) {
  const p = g === e;
  out.innerHTML += \`<div class="\${p?'pass':'fail'}">\${p?'✓':'✗'} \${l}: got \${g}, want \${e}</div>\`;
}

test('isScramble("great", "rgeat")', isScramble("great", "rgeat"), true);
test('isScramble("abcde", "caebd")', isScramble("abcde", "caebd"), false);
test('isScramble("a", "a")', isScramble("a", "a"), true);
test('isScramble("abb", "bba")', isScramble("abb", "bba"), true);`,
                outputHeight: 180,
              },
            ],
          },
        },
      },

      {
        id: 'PythonNotebook',
        title: 'Scramble String in Python',
        caption: 'Build the interval DP on string pairs, visualize the recursion tree size, then a from-scratch challenge.',
        props: {
          initialCells: [
            {
              type: 'code',
              language: 'python',
              label: 'Scramble String — Build and Verify',
              code: `from functools import lru_cache


def is_scramble(s1, s2):
    @lru_cache(maxsize=None)
    def solve(a, b):
        if a == b:
            return True
        if sorted(a) != sorted(b):
            return False
        n = len(a)
        for i in range(1, n):
            if solve(a[:i], b[:i]) and solve(a[i:], b[i:]):
                return True
            if solve(a[:i], b[n - i:]) and solve(a[i:], b[:n - i]):
                return True
        return False

    result = solve(s1, s2)
    solve.cache_clear()
    return result


print("is_scramble('great', 'rgeat'):", is_scramble("great", "rgeat"))
print("is_scramble('abcde', 'caebd'):", is_scramble("abcde", "caebd"))

assert is_scramble("great", "rgeat") is True
assert is_scramble("abcde", "caebd") is False
print("Assertions passed!")`,
            },
            {
              type: 'code',
              language: 'python',
              label: 'Visualize: The Prune\'s Impact on Recursive Calls',
              code: `import matplotlib.pyplot as plt
from functools import lru_cache


def is_scramble_with_stats(s1, s2, use_prune=True):
    calls = [0]

    @lru_cache(maxsize=None)
    def solve(a, b):
        calls[0] += 1
        if a == b:
            return True
        if use_prune and sorted(a) != sorted(b):
            return False
        n = len(a)
        for i in range(1, n):
            if solve(a[:i], b[:i]) and solve(a[i:], b[i:]):
                return True
            if solve(a[:i], b[n - i:]) and solve(a[i:], b[:n - i]):
                return True
        return False

    result = solve(s1, s2)
    solve.cache_clear()
    return result, calls[0]


pairs = [("great", "rgeat"), ("abcde", "caebd"), ("abcdefgh", "hgfedcba")]
with_prune = [is_scramble_with_stats(a, b, True)[1] for a, b in pairs]
without_prune = [is_scramble_with_stats(a, b, False)[1] for a, b in pairs]

print("Calls with prune:", with_prune)
print("Calls without prune:", without_prune)

fig, ax = plt.subplots(figsize=(8, 4), facecolor="#0f172a")
ax.set_facecolor("#0f172a")
labels = [f"{a}/{b}" for a, b in pairs]
x = range(len(pairs))
ax.bar([i - 0.2 for i in x], without_prune, width=0.38, color="#f87171", label="Without character-count prune")
ax.bar([i + 0.2 for i in x], with_prune, width=0.38, color="#4ade80", label="With character-count prune")
ax.set_xticks(x)
ax.set_xticklabels(labels, color="#94a3b8", fontsize=9)
ax.set_ylabel("Recursive calls made", color="#94a3b8")
ax.set_title("The character-count prune cuts recursive calls substantially", color="#e2e8f0", fontsize=11)
ax.tick_params(colors="#94a3b8")
ax.legend(facecolor="#1e293b", edgecolor="#334155", labelcolor="#e2e8f0", fontsize=9)
for sp in ax.spines.values(): sp.set_visible(False)
plt.tight_layout()
plt.show()`,
            },
            {
              type: 'code',
              language: 'python',
              challengeType: 'write',
              challengeNumber: 1,
              challengeTitle: 'Scramble String, from scratch',
              difficulty: 'hard',
              prompt: 'Fill in the split-and-check loop in is_scramble_scratch(s1, s2): try every split position i, checking both the no-swap and swap orientations. Uncomment the assertions once ready.',
              hint: 'no-swap: solve(a[:i], b[:i]) and solve(a[i:], b[i:]). swap: solve(a[:i], b[n-i:]) and solve(a[i:], b[:n-i]). Return True as soon as either succeeds at any split.',
              label: 'From Scratch — Scramble String',
              code: `from functools import lru_cache


def is_scramble_scratch(s1, s2):
    @lru_cache(maxsize=None)
    def solve(a, b):
        if a == b:
            return True
        if sorted(a) != sorted(b):
            return False
        n = len(a)
        for i in range(1, n):
            # YOUR CODE HERE:
            # if solve(a[:i], b[:i]) and solve(a[i:], b[i:]): return True
            # if solve(a[:i], b[n-i:]) and solve(a[i:], b[:n-i]): return True
            pass
        return False

    result = solve(s1, s2)
    solve.cache_clear()
    return result


# --- Uncomment to test when ready ---
# assert is_scramble_scratch("abb", "bba") == True
# assert is_scramble_scratch("a", "a") == True
# assert is_scramble_scratch("abcdefghijklmnopq", "efghijklmnopqcadb") == False
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
      text: 'Why is the character-count prune (comparing sorted characters or character counts) checked BEFORE any recursive splitting is attempted?',
      options: [
        'It is not actually necessary for correctness, only a minor speed optimization that could be skipped',
        'If two strings do not contain the same multiset of characters, no rearrangement or split-and-swap sequence can ever transform one into the other — checking this first (a cheap O(n log n) or O(n) operation) eliminates hopeless recursive exploration immediately, before the expensive split logic runs',
        'The character-count check is what actually determines the final answer; the recursive splitting is only used to double-check its result',
      ],
      correct: 1,
    },
    {
      id: 'q2',
      type: 'choice',
      text: 'Why must BOTH the no-swap and swap orientations be checked at every split position, rather than stopping after checking one orientation?',
      options: [
        'Checking both is redundant; if no-swap fails, swap always fails too',
        'A given split position might fail in one orientation but succeed in the other (or a different split position might succeed where this one fails in both) — the two orientations represent genuinely different candidate scrambles, and missing either could produce a false negative',
        'Only the swap orientation ever needs to be checked; no-swap is never actually possible in a genuine scramble',
      ],
      correct: 1,
    },
    {
      id: 'q3',
      type: 'choice',
      text: 'How does Scramble String\'s recursion relate to Chapter 3\'s interval DP (Matrix Chain, Burst Balloons)?',
      options: [
        'It is unrelated — Scramble String uses a completely different algorithmic idea specific to strings',
        'It is the same "split a range at every possible position, and combine the two independently-solved pieces" structure, generalized so the "range" being split is a pair of same-length substrings from two different strings rather than a single numeric interval',
        'Scramble String is a simplified special case of interval DP that never actually requires trying multiple split points',
      ],
      correct: 1,
    },
    {
      id: 'q4',
      type: 'choice',
      text: 'Why does memoization matter for Scramble String specifically — what is being computed repeatedly without it?',
      options: [
        'Without memoization, nothing is repeated; the recursion tree would already be optimally small',
        'The same pair of substrings (or equivalently, the same (start-in-s1, start-in-s2, length) state) can be reached through multiple different split paths in the recursion tree — this is the overlapping-subproblems condition from Lesson 1 of the whole course, and memoizing on that pair turns an exponential brute-force tree into a polynomial-time algorithm',
        'Memoization is only useful here for reducing memory usage, not for reducing time complexity',
      ],
      correct: 1,
    },
  ],
};
