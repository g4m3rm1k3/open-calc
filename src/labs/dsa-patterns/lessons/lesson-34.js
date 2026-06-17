// DSA + Design Patterns — Lesson 34
export const lesson = {
  id: 'dsa-patterns-34',
  series: { id: 'dsa-patterns', title: 'DSA + Design Patterns' },
  title: '34. String Matching: KMP Algorithm',
  checkpoints: [
    { id: 'cp-lps', label: 'Failure Function (LPS)' },
    { id: 'cp-kmp', label: 'KMP Search' },
    { id: 'cp-z', label: 'Z-Algorithm' },
  ],
  segments: [
    {
      type: 'narration',
      id: 'intro',
      text: 'You need to find every occurrence of a short pattern string inside a long text. A search engine indexes billions of documents. A virus scanner checks megabytes of binary data against thousands of signatures. The naive approach — align the pattern at every position and compare character by character — takes O(n × m) time where n is text length and m is pattern length. For a 1 MB text and a 100-character pattern, that is 100 million comparisons. There is a way to do it in O(n + m). The key insight is that a mismatch contains information you can exploit.',
      code: null,
    },
    {
      type: 'narration',
      id: 'dsa-1',
      text: 'The naive algorithm works like this: for each starting position i in text (0 to n-m), compare text[i..i+m-1] with the pattern. If all m characters match, record the occurrence. If any character mismatches, slide the pattern right by 1 and restart. The problem: after a partial match of k characters, we throw away all information from those k comparisons. O(nm) in the worst case — for example, pattern "AAAB" in text "AAAAAAAAB".',
      code:
        'function naiveSearch(text, pattern) {\n' +
        '  const matches = [];\n' +
        '  const n = text.length;\n' +
        '  const m = pattern.length;\n' +
        '  for (let i = 0; i <= n - m; i++) {\n' +
        '    let j = 0;\n' +
        '    while (j < m && text[i + j] === pattern[j]) j++;\n' +
        '    if (j === m) matches.push(i); // full match at position i  // ← NEW\n' +
        '  }\n' +
        '  return matches;\n' +
        '}\n' +
        '\n' +
        'console.log("naive", naiveSearch("ABABAB", "AB")); // [0,2,4]',
    },
    {
      type: 'narration',
      id: 'dsa-2',
      text: 'The KMP algorithm avoids redundant comparisons by precomputing a failure function — also called the LPS (Longest Proper Prefix that is also a Suffix) array — for the pattern. LPS[i] is the length of the longest string that is both a proper prefix and a proper suffix of pattern[0..i]. For example, for "AABAAB": LPS = [0,1,0,1,2,3]. "AA" is the longest prefix-that-is-also-suffix for the first 5 characters. This array tells us how far to "slide" the pattern on a mismatch.',
      code:
        'function computeLPS(pattern) {\n' +
        '  const m = pattern.length;\n' +
        '  const lps = new Array(m).fill(0); // ← NEW\n' +
        '  let len = 0; // length of previous longest prefix-suffix\n' +
        '  let i = 1;\n' +
        '\n' +
        '  while (i < m) {\n' +
        '    if (pattern[i] === pattern[len]) {\n' +
        '      lps[i] = ++len; // ← NEW: extend the prefix-suffix\n' +
        '      i++;\n' +
        '    } else if (len > 0) {\n' +
        '      len = lps[len - 1]; // ← NEW: fall back using existing lps value\n' +
        '    } else {\n' +
        '      lps[i] = 0;\n' +
        '      i++;\n' +
        '    }\n' +
        '  }\n' +
        '  return lps;\n' +
        '}\n' +
        '\n' +
        'console.log("LPS AABAAB", computeLPS("AABAAB")); // [0,1,0,1,2,3]\n' +
        'console.log("LPS ABAB",   computeLPS("ABAB"));   // [0,0,1,2]',
    },
    {
      type: 'narration',
      id: 'dsa-3',
      text: 'Computing the LPS array takes O(m) time. Here is why: the index i only moves forward, and len can decrease only by using lps[len-1]. Each "decrease" corresponds to a previous increase, so the total number of operations is bounded by 2m. This is the same amortized argument used for dynamic array resizing.',
      code: null,
    },
    {
      type: 'narration',
      id: 'dsa-4',
      text: 'KMP search uses the LPS array to avoid re-examining characters. Keep two pointers: i into the text and j into the pattern. On a match, advance both. On a mismatch with j > 0, set j = lps[j-1] (do not move i). On a mismatch with j === 0, advance i. When j reaches m, a full match is found at position i - m. Total time: O(n) for the scan because i never decreases, plus O(m) for preprocessing. Overall O(n + m).',
      code:
        'function kmpSearch(text, pattern) {\n' +
        '  const n = text.length;\n' +
        '  const m = pattern.length;\n' +
        '  const lps = computeLPS(pattern); // ← NEW: preprocessing\n' +
        '  const matches = [];\n' +
        '  let i = 0; // text pointer\n' +
        '  let j = 0; // pattern pointer\n' +
        '\n' +
        '  while (i < n) {\n' +
        '    if (text[i] === pattern[j]) {\n' +
        '      i++; j++; // ← NEW: characters match\n' +
        '    }\n' +
        '    if (j === m) {\n' +
        '      matches.push(i - m); // ← NEW: full match found\n' +
        '      j = lps[j - 1]; // continue search using lps\n' +
        '    } else if (i < n && text[i] !== pattern[j]) {\n' +
        '      j > 0 ? (j = lps[j - 1]) : i++; // ← NEW: use failure function or advance\n' +
        '    }\n' +
        '  }\n' +
        '  return matches;\n' +
        '}\n' +
        '\n' +
        'function computeLPS(pattern) {\n' +
        '  const m = pattern.length;\n' +
        '  const lps = new Array(m).fill(0);\n' +
        '  let len = 0, i = 1;\n' +
        '  while (i < m) {\n' +
        '    if (pattern[i] === pattern[len]) { lps[i++] = ++len; }\n' +
        '    else if (len > 0) { len = lps[len - 1]; }\n' +
        '    else { lps[i++] = 0; }\n' +
        '  }\n' +
        '  return lps;\n' +
        '}\n' +
        '\n' +
        'console.log("kmp ABABAB / AB", kmpSearch("ABABAB", "AB")); // [0,2,4]',
    },
    {
      type: 'narration',
      id: 'dsa-5',
      text: 'The Z-algorithm is a closely related O(n + m) string matching algorithm. It computes a Z-array for the concatenated string (pattern + "$" + text), where Z[i] is the length of the longest substring starting at position i that matches a prefix of the concatenated string. A match occurs wherever Z[i] equals the pattern length. The "$" sentinel ensures no Z-value extends past the pattern boundary into itself.',
      code:
        'function buildZArray(s) {\n' +
        '  const n = s.length;\n' +
        '  const z = new Array(n).fill(0);\n' +
        '  z[0] = n; // Z[0] is defined as the full string length by convention\n' +
        '  let l = 0, r = 0;\n' +
        '\n' +
        '  for (let i = 1; i < n; i++) {\n' +
        '    if (i < r) {\n' +
        '      z[i] = Math.min(r - i, z[i - l]); // ← NEW: use existing Z-box\n' +
        '    }\n' +
        '    while (i + z[i] < n && s[z[i]] === s[i + z[i]]) {\n' +
        '      z[i]++; // ← NEW: extend match\n' +
        '    }\n' +
        '    if (i + z[i] > r) { l = i; r = i + z[i]; } // ← NEW: update Z-box\n' +
        '  }\n' +
        '  return z;\n' +
        '}\n' +
        '\n' +
        'function zSearch(text, pattern) {\n' +
        '  const concat = pattern + "$" + text; // ← NEW: sentinel prevents overlap\n' +
        '  const z = buildZArray(concat);\n' +
        '  const matches = [];\n' +
        '  const m = pattern.length;\n' +
        '  for (let i = m + 1; i < concat.length; i++) {\n' +
        '    if (z[i] === m) matches.push(i - m - 1); // ← NEW: adjust for offset\n' +
        '  }\n' +
        '  return matches;\n' +
        '}\n' +
        '\n' +
        'console.log("z-search ABABAB / AB", zSearch("ABABAB", "AB")); // [0,2,4]',
    },
    {
      type: 'narration',
      id: 'dsa-6',
      text: 'KMP and Z-algorithm solve the same problem with the same O(n + m) complexity, but via different precomputed structures. KMP\'s LPS array stores information about the pattern\'s internal structure (prefix-suffix overlaps). Z-algorithm\'s Z-array stores match lengths. KMP tends to be easier to adapt for streaming (processing text character by character without storing it all); Z-algorithm is conceptually simpler for some applications like finding the longest repeated substring.',
      code: null,
    },
    {
      type: 'challenge',
      id: 'challenge-1',
      text: 'Compute the LPS array for "AABAAB". Print the result with console.log.',
      expectedOutput: null,
      startCode:
        'function computeLPS(pattern) {\n' +
        '  const m = pattern.length;\n' +
        '  const lps = new Array(m).fill(0);\n' +
        '  let len = 0;\n' +
        '  let i = 1;\n' +
        '  while (i < m) {\n' +
        '    if (pattern[i] === pattern[len]) {\n' +
        '      lps[i] = ++len;\n' +
        '      i++;\n' +
        '    } else if (len > 0) {\n' +
        '      // TODO: fall back using existing lps value\n' +
        '    } else {\n' +
        '      lps[i] = 0;\n' +
        '      i++;\n' +
        '    }\n' +
        '  }\n' +
        '  return lps;\n' +
        '}\n' +
        '\n' +
        'console.log(JSON.stringify(computeLPS("AABAAB")));',
      hint: 'In the else-if branch: len = lps[len - 1]; (do not increment i)',
      validate: ({ logs }) => {
        return logs.some(l => String(l).trim() === '[0,1,0,1,2,3]');
      },
    },
    { type: 'checkpoint', id: 'cp-lps' },
    {
      type: 'narration',
      id: 'pattern-intro',
      text: 'KMP is pure algorithmic mechanics. No design pattern improves it — wrapping it in a Strategy or Decorator would add ceremony without clarity. This is the honest lesson: not every algorithm needs a pattern. The LPS array IS the design. Its structure encodes the self-similarity of the pattern string. Recognizing when to apply a pattern and when to leave clean algorithm code alone is a skill as important as knowing the patterns themselves.',
      code: null,
    },
    {
      type: 'narration',
      id: 'pattern-code',
      text: 'Where a pattern DOES add value: if you need to support multiple string matching algorithms behind a common interface — for example, a search library that can use KMP, Z-algorithm, or Boyer-Moore depending on the use case — the Strategy pattern is the right tool. Here is that wrapper, keeping the algorithms themselves clean and the context stable.',
      code:
        'function computeLPS(pattern) {\n' +
        '  const m = pattern.length;\n' +
        '  const lps = new Array(m).fill(0);\n' +
        '  let len = 0, i = 1;\n' +
        '  while (i < m) {\n' +
        '    if (pattern[i] === pattern[len]) { lps[i++] = ++len; }\n' +
        '    else if (len > 0) { len = lps[len - 1]; }\n' +
        '    else { lps[i++] = 0; }\n' +
        '  }\n' +
        '  return lps;\n' +
        '}\n' +
        '\n' +
        'class KMPStrategy {\n' +
        '  search(text, pattern) {\n' +
        '    const n = text.length, m = pattern.length;\n' +
        '    const lps = computeLPS(pattern);\n' +
        '    const matches = [];\n' +
        '    let i = 0, j = 0;\n' +
        '    while (i < n) {\n' +
        '      if (text[i] === pattern[j]) { i++; j++; }\n' +
        '      if (j === m) { matches.push(i - m); j = lps[j - 1]; }\n' +
        '      else if (i < n && text[i] !== pattern[j]) { j > 0 ? (j = lps[j - 1]) : i++; }\n' +
        '    }\n' +
        '    return matches;\n' +
        '  }\n' +
        '}\n' +
        '\n' +
        'class NaiveStrategy {\n' +
        '  search(text, pattern) {\n' +
        '    const matches = [], n = text.length, m = pattern.length;\n' +
        '    for (let i = 0; i <= n - m; i++) {\n' +
        '      let j = 0;\n' +
        '      while (j < m && text[i + j] === pattern[j]) j++;\n' +
        '      if (j === m) matches.push(i);\n' +
        '    }\n' +
        '    return matches;\n' +
        '  }\n' +
        '}\n' +
        '\n' +
        'class StringSearcher {\n' +
        '  constructor(strategy) { this.strategy = strategy; } // ← NEW\n' +
        '  setStrategy(s) { this.strategy = s; } // ← NEW\n' +
        '  search(text, pattern) { return this.strategy.search(text, pattern); } // ← NEW\n' +
        '}\n' +
        '\n' +
        'const searcher = new StringSearcher(new KMPStrategy());\n' +
        'console.log("kmp", JSON.stringify(searcher.search("ABABAB", "AB")));',
    },
    {
      type: 'narration',
      id: 'pattern-meeting',
      text: 'The meeting point: the LPS array is an example of preprocessing — doing work upfront to answer future queries faster. This is a universal principle in computer science. Hash maps preprocess keys. Segment trees preprocess ranges. KMP preprocesses the pattern. Design patterns do the same conceptually: they preprocess recurring design problems into named solutions so you can apply them faster. Both KMP and patterns are about recognizing structure and reusing it.',
      code: null,
    },
    {
      type: 'challenge',
      id: 'challenge-2',
      text: 'Find all occurrences of "AB" in "ABABAB" using KMP. Print the result as a JSON array with console.log.',
      expectedOutput: null,
      startCode:
        'function computeLPS(pattern) {\n' +
        '  const m = pattern.length;\n' +
        '  const lps = new Array(m).fill(0);\n' +
        '  let len = 0, i = 1;\n' +
        '  while (i < m) {\n' +
        '    if (pattern[i] === pattern[len]) { lps[i++] = ++len; }\n' +
        '    else if (len > 0) { len = lps[len - 1]; }\n' +
        '    else { lps[i++] = 0; }\n' +
        '  }\n' +
        '  return lps;\n' +
        '}\n' +
        '\n' +
        'function kmpSearch(text, pattern) {\n' +
        '  const n = text.length, m = pattern.length;\n' +
        '  const lps = computeLPS(pattern);\n' +
        '  const matches = [];\n' +
        '  let i = 0, j = 0;\n' +
        '  while (i < n) {\n' +
        '    if (text[i] === pattern[j]) { i++; j++; }\n' +
        '    if (j === m) {\n' +
        '      // TODO: record match position and reset j using lps\n' +
        '    } else if (i < n && text[i] !== pattern[j]) {\n' +
        '      j > 0 ? (j = lps[j - 1]) : i++;\n' +
        '    }\n' +
        '  }\n' +
        '  return matches;\n' +
        '}\n' +
        '\n' +
        'console.log(JSON.stringify(kmpSearch("ABABAB", "AB")));',
      hint: 'When j === m: matches.push(i - m); then j = lps[j - 1];',
      validate: ({ logs }) => {
        return logs.some(l => String(l).trim() === '[0,2,4]');
      },
    },
    { type: 'checkpoint', id: 'cp-kmp' },
    {
      type: 'narration',
      id: 'combined-narration',
      text: 'Comparing KMP and naive search on a pathological input shows the O(nm) vs O(n+m) difference clearly. For pattern "AAAB" (length 4) in text "AAAAAAAAAB" (length 10), naive does up to 7×4 = 28 comparisons; KMP does at most 10+4 = 14. The gap widens dramatically for longer patterns and texts with many near-misses. The LPS array is what makes KMP better: it encodes exactly where to restart the pattern pointer after each mismatch.',
      code:
        'function computeLPS(pattern) {\n' +
        '  const m = pattern.length;\n' +
        '  const lps = new Array(m).fill(0);\n' +
        '  let len = 0, i = 1;\n' +
        '  while (i < m) {\n' +
        '    if (pattern[i] === pattern[len]) { lps[i++] = ++len; }\n' +
        '    else if (len > 0) { len = lps[len - 1]; }\n' +
        '    else { lps[i++] = 0; }\n' +
        '  }\n' +
        '  return lps;\n' +
        '}\n' +
        '\n' +
        'function kmpSearch(text, pattern) {\n' +
        '  const n = text.length, m = pattern.length;\n' +
        '  const lps = computeLPS(pattern);\n' +
        '  const matches = [];\n' +
        '  let i = 0, j = 0;\n' +
        '  while (i < n) {\n' +
        '    if (text[i] === pattern[j]) { i++; j++; }\n' +
        '    if (j === m) { matches.push(i - m); j = lps[j - 1]; }\n' +
        '    else if (i < n && text[i] !== pattern[j]) { j > 0 ? (j = lps[j - 1]) : i++; }\n' +
        '  }\n' +
        '  return matches;\n' +
        '}\n' +
        '\n' +
        'const text = "AAAAAAAAAB";\n' +
        'const pattern = "AAAB";\n' +
        'console.log("kmp matches", JSON.stringify(kmpSearch(text, pattern)));\n' +
        'console.log("lps for AAAB", JSON.stringify(computeLPS(pattern)));',
    },
    {
      type: 'challenge',
      id: 'challenge-3',
      text: 'Use the Z-algorithm to find all occurrences of "AB" in "ABABAB". Print the result as a JSON array.',
      expectedOutput: null,
      startCode:
        'function buildZArray(s) {\n' +
        '  const n = s.length;\n' +
        '  const z = new Array(n).fill(0);\n' +
        '  z[0] = n;\n' +
        '  let l = 0, r = 0;\n' +
        '  for (let i = 1; i < n; i++) {\n' +
        '    if (i < r) z[i] = Math.min(r - i, z[i - l]);\n' +
        '    while (i + z[i] < n && s[z[i]] === s[i + z[i]]) z[i]++;\n' +
        '    if (i + z[i] > r) { l = i; r = i + z[i]; }\n' +
        '  }\n' +
        '  return z;\n' +
        '}\n' +
        '\n' +
        'function zSearch(text, pattern) {\n' +
        '  const concat = pattern + "$" + text;\n' +
        '  const z = buildZArray(concat);\n' +
        '  const matches = [];\n' +
        '  const m = pattern.length;\n' +
        '  // TODO: find positions where z[i] === m (offset from m+1)\n' +
        '  return matches;\n' +
        '}\n' +
        '\n' +
        'console.log(JSON.stringify(zSearch("ABABAB", "AB")));',
      hint: 'Loop i from m+1 to concat.length-1. If z[i] === m, push (i - m - 1) to matches.',
      validate: ({ logs }) => {
        return logs.some(l => String(l).trim() === '[0,2,4]');
      },
    },
    { type: 'checkpoint', id: 'cp-z' },
    {
      type: 'narration',
      id: 'codelens-setup',
      text: 'Let\'s trace the KMP search of "AB" inside "ABABAB" step by step. Watch how the i and j pointers move, and how the LPS array prevents any character from being re-examined.',
      code: null,
    },
    {
      type: 'codelens',
      id: 'codelens-1',
      text: 'Step through KMP: i is the text pointer, j is the pattern pointer. Each match advances both; each mismatch uses the LPS fallback.',
      lang: 'js',
      code:
        'function computeLPS(pattern) {\n' +
        '  const m = pattern.length;\n' +
        '  const lps = new Array(m).fill(0);\n' +
        '  let len = 0, i = 1;\n' +
        '  while (i < m) {\n' +
        '    if (pattern[i] === pattern[len]) { lps[i++] = ++len; }\n' +
        '    else if (len > 0) { len = lps[len - 1]; }\n' +
        '    else { lps[i++] = 0; }\n' +
        '  }\n' +
        '  return lps;\n' +
        '}\n' +
        '\n' +
        'const text = "ABABAB";\n' +
        'const pattern = "AB";\n' +
        'const lps = computeLPS(pattern);\n' +
        'console.log("lps", JSON.stringify(lps));\n' +
        '\n' +
        'const n = text.length, m = pattern.length;\n' +
        'const matches = [];\n' +
        'let i = 0, j = 0;\n' +
        '\n' +
        'while (i < n) {\n' +
        '  if (text[i] === pattern[j]) { i++; j++; }\n' +
        '  if (j === m) {\n' +
        '    matches.push(i - m);\n' +
        '    console.log("match at", i - m, "i=" + i + " j=" + j);\n' +
        '    j = lps[j - 1];\n' +
        '  } else if (i < n && text[i] !== pattern[j]) {\n' +
        '    console.log("mismatch i=" + i + " j=" + j);\n' +
        '    j > 0 ? (j = lps[j - 1]) : i++;\n' +
        '  }\n' +
        '}\n' +
        'console.log("all matches", JSON.stringify(matches));',
    },
  ],
};
