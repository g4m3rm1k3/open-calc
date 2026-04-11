export default {
  id: 'dp1-004',
  slug: 'sequence-dp',
  chapter: 'dp1',
  order: 4,
  title: 'Sequence DP: LCS, Edit Distance & the Diff Algorithm',
  subtitle: 'Two strings walk into a table. Every cell is a decision.',
  tags: ['dynamic programming', 'LCS', 'edit distance', 'Levenshtein', 'sequence alignment', 'diff', 'LIS', 'two-sequence DP'],
  aliases: 'LCS longest common subsequence edit distance Levenshtein git diff spell check DNA alignment LIS longest increasing subsequence sequence comparison two-string DP',

  hook: {
    question: 'Run git diff on any file. In under a millisecond, Git annotates every line as added, removed, or unchanged. Your phone\'s autocorrect ranks "teh" candidates by how many keystrokes separate them from real words. Bioinformaticians align chromosomes from different species — strings hundreds of millions of characters long — to find evolutionary breakpoints. All three run the same 47-line algorithm, invented independently by a Soviet mathematician studying radio signals and two biologists comparing proteins. The key insight: comparing two sequences is the same as filling a table where cell (i, j) answers "what\'s the best we can do with the first i characters of A and the first j characters of B?"',
    realWorldContext: 'Sequence DP is everywhere you compare text. Git diff and GitHub code review use LCS on lines. Every spell checker ranks suggestions by edit distance. BLAST (the most-run scientific program in history) aligns DNA sequences using a sequence DP variant and runs billions of times a day on genomics servers. Plagiarism detectors compute edit distance between student submissions. Voice recognition matches phoneme sequences. Autocomplete systems find the closest match in a dictionary. If two sequences are being compared for similarity, sequence DP is almost certainly involved.',
    previewVisualizationId: 'ScienceNotebook',
  },

  intuition: {
    prose: [
      '**The algorithm behind git diff, spell check, and DNA sequencing.** In 1970, Saul Needleman and Christian Wunsch published an algorithm for aligning protein sequences — finding the best match between two amino acid chains. They had no idea they were writing the foundation for every text comparison tool ever built. Meanwhile, Vladimir Levenshtein, a Soviet mathematician, independently derived the edit distance formula in 1965. He was studying error-correcting codes for binary channels — how many single-bit flips separate two binary strings. The algorithm bearing his name now runs in every spell checker, search engine, and code review tool on earth. The insight both researchers shared: comparing two sequences is the same as filling a table where cell (i, j) answers "what\'s the best we can do with the first i characters of A and the first j characters of B?"',
      '**The two-sequence mindset.** In 1D DP, your table has one axis: position in a single array. In 2D grid DP, your axes are row and column in a grid. In sequence DP, your axes are positions in two different sequences. Row i represents "the first i characters of string 1." Column j represents "the first j characters of string 2." The first row and column are base cases — comparing something against an empty string has a known answer. Every cell is filled left-to-right, top-to-bottom. The answer lives in dp[m][n] at the bottom-right.',
      '**Longest Common Subsequence (LCS).** Given two strings, find the length of their longest common subsequence — characters that appear in both, in the same relative order, but not necessarily contiguous. "ABCBDAB" and "BDCABA" share the LCS "BCBA" (length 4). The recurrence: if s1[i-1] === s2[j-1], dp[i][j] = dp[i-1][j-1] + 1 (characters match: take a diagonal step, extending the LCS). Otherwise dp[i][j] = max(dp[i-1][j], dp[i][j-1]) (characters don\'t match: take the better of skipping from either string). Base cases: entire first row and column = 0.',
      '**Edit Distance (Levenshtein Distance).** Find the minimum number of single-character operations (insert, delete, substitute) to transform s1 into s2. "horse" → "ros" takes 3 operations: replace h→r, delete r, delete e. The recurrence: if s1[i-1] === s2[j-1], dp[i][j] = dp[i-1][j-1] (free match, no cost). Otherwise dp[i][j] = 1 + min(dp[i-1][j] delete, dp[i][j-1] insert, dp[i-1][j-1] substitute). Base cases: dp[i][0] = i (delete all i characters), dp[0][j] = j (insert j characters). Same table structure as LCS — completely different semantics.',
      '**Reconstructing the actual sequence.** The table gives you the score. To recover the actual LCS string or operation list, trace back from dp[m][n] to dp[0][0]. For LCS: if characters matched (diagonal), emit that character and move diagonally. If dp[i-1][j] >= dp[i][j-1], move up. Otherwise move left. This is how git diff reconstructs the changed lines — the LCS of the two file versions is the set of unchanged lines. Everything not in the LCS is an insertion or deletion.',
      '**Longest Increasing Subsequence (LIS).** LIS is the one-sequence sibling: find the longest subsequence of a single array where each element is strictly greater than the previous. [10, 9, 2, 5, 3, 7, 101, 18] → LIS = [2, 3, 7, 101], length 4. The O(n²) DP: dp[i] = length of LIS ending at index i, initialized to 1. For each i, scan all j < i: if nums[j] < nums[i], dp[i] = max(dp[i], dp[j] + 1). The answer is max(dp). There is also an O(n log n) solution using patience sorting — the same algorithm used to sort a deck of cards — but the O(n²) table version is the DP pattern to internalize first.',
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Chapter 1, Lesson 4: Sequence DP',
        body: '**Previous:** 2D DP grids — Unique Paths, Min Path Sum, seam carving.\n**This lesson:** Sequence DP — LCS, Edit Distance, reconstruction, LIS.\n**Next:** Knapsack DP — 0/1 Knapsack, unbounded Knapsack, coin change.',
      },
      {
        type: 'insight',
        title: 'LCS vs Edit Distance: same table, different recurrence',
        body: 'Both use the same (m+1)×(n+1) table and the same "diagonal when characters match" intuition. LCS adds 1 on a match and takes max on a mismatch. Edit Distance stays the same on a match and adds 1 + min of three options on a mismatch. The table structure is identical — swap the recurrence to change which problem you\'re solving.',
      },
      {
        type: 'strategy',
        title: 'Reading the table backward: reconstruction',
        body: 'The score in dp[m][n] is the answer. The actual sequence or operation list requires tracing back. At each cell ask: how did I get here? Diagonal (match), up (skip s1), or left (skip s2). Walk from bottom-right to top-left, building the answer in reverse. This is O(m+n) and runs after the O(mn) table fill.',
      },
      {
        type: 'insight',
        title: 'git diff is just LCS on lines',
        body: 'Git treats each line as a "character" and computes the LCS of the two file versions. Lines in the LCS are unchanged. Lines in version A but not the LCS are deletions (−). Lines in version B but not the LCS are insertions (+). Every diff tool you have used — git, GitHub, VS Code, code review systems — is a variant of this 50-year-old algorithm.',
      },
      {
        type: 'warning',
        title: 'Off-by-one: table index vs string index',
        body: 'dp[i][j] compares s1[0..i-1] with s2[0..j-1]. The i-th row character is s1[i-1]. This is the most common sequence DP bug: using s1[i] instead of s1[i-1], or starting the loop at 0 instead of 1. Always draw the table with the empty-string row/column explicitly — then the loop naturally starts at 1.',
      },
      {
        type: 'warning',
        title: 'LIS requires O(n²) or O(n log n) — not O(n)',
        body: 'LIS looks like it should solve in one pass, but each element must compare against all previous elements. The O(n²) DP is the natural approach. The O(n log n) patience sort uses binary search to maintain "pile tops" — it gives you the length but reconstructing the actual subsequence requires extra bookkeeping.',
      },
    ],
    visualizations: [
      {
        id: 'ScienceNotebook',
        title: 'Sequence DP: LCS, Edit Distance, and git diff',
        caption: 'Watch the table fill cell by cell. Diagonal steps are matches. The traceback path reveals the answer.',
        props: {
          lesson: {
            title: 'Sequence DP: LCS and Edit Distance',
            subtitle: 'Watch the table fill cell by cell. Diagonal = match. Up or Left = skip.',
            sequential: true,
            cells: [
              {
                type: 'js',
                title: 'LCS Table — Longest Common Subsequence',
                instruction: 'Each cell dp[i][j] = LCS length for s1[0..i-1] vs s2[0..j-1]. Gold diagonal cells are character matches (+1 step). Blue cells are max(up, left). The bottom-right holds the answer.',
                html: `<div id="out" style="padding:12px;font-family:monospace;font-size:13px;overflow:auto"></div>`,
                css: `body{margin:0;background:#0f172a;color:#e2e8f0}`,
                startCode: `const out = document.getElementById("out");
const s1 = "ABCBDAB";
const s2 = "BDCABA";
const m = s1.length, n = s2.length;

const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
const src = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(""));

for (let i = 1; i <= m; i++) {
  for (let j = 1; j <= n; j++) {
    if (s1[i-1] === s2[j-1]) {
      dp[i][j] = dp[i-1][j-1] + 1;
      src[i][j] = "diag";
    } else if (dp[i-1][j] >= dp[i][j-1]) {
      dp[i][j] = dp[i-1][j];
      src[i][j] = "up";
    } else {
      dp[i][j] = dp[i][j-1];
      src[i][j] = "left";
    }
  }
}

let lcs = "";
let i = m, j = n;
while (i > 0 && j > 0) {
  if (src[i][j] === "diag") { lcs = s1[i-1] + lcs; i--; j--; }
  else if (src[i][j] === "up") i--;
  else j--;
}

const path = new Set();
i = m; j = n;
while (i > 0 && j > 0) {
  path.add(i + "," + j);
  if (src[i][j] === "diag") { i--; j--; }
  else if (src[i][j] === "up") i--;
  else j--;
}

let h = "<div style='color:#60a5fa;font-size:14px;margin-bottom:6px'>LCS Table: <b>" + JSON.stringify(s1) + "</b> vs <b>" + JSON.stringify(s2) + "</b></div>";
h += "<table style='border-collapse:collapse;margin-bottom:10px'>";
h += "<tr><td style='width:36px;height:32px'></td><td style='width:36px;height:32px;color:#64748b;text-align:center'>&nbsp;</td>";
for (let j2 = 0; j2 < n; j2++) {
  h += "<td style='width:36px;height:32px;text-align:center;color:#94a3b8;font-weight:bold'>" + s2[j2] + "</td>";
}
h += "</tr>";
for (let i2 = 0; i2 <= m; i2++) {
  h += "<tr>";
  h += "<td style='width:36px;height:32px;text-align:center;color:#94a3b8;font-weight:bold'>" + (i2 === 0 ? "&nbsp;" : s1[i2-1]) + "</td>";
  for (let j2 = 0; j2 <= n; j2++) {
    const isPath = path.has(i2 + "," + j2);
    const isDiag = src[i2][j2] === "diag";
    const isBase = (i2 === 0 || j2 === 0);
    let bg = "#1e293b", color = "#94a3b8";
    if (isBase) { bg = "#0f2231"; color = "#475569"; }
    if (isDiag) { bg = "#854d0e"; color = "#fef08a"; }
    if (isPath) { bg = isDiag ? "#a16207" : "#1d4ed8"; color = "#fff"; }
    h += "<td style='width:36px;height:32px;text-align:center;border:1px solid #334155;background:" + bg + ";color:" + color + ";font-weight:bold;font-size:13px'>" + dp[i2][j2] + "</td>";
  }
  h += "</tr>";
}
h += "</table>";
h += "<div style='background:#1e293b;border-radius:6px;padding:8px 12px;color:#4ade80;font-size:13px'>LCS = <b>" + JSON.stringify(lcs) + "</b> &nbsp;|&nbsp; Length = " + lcs.length + "</div>";
h += "<div style='margin-top:6px;color:#64748b;font-size:11px'>Gold = diagonal match (+1) &nbsp;|&nbsp; Blue = traceback path &nbsp;|&nbsp; Gray = base case</div>";
out.innerHTML = h;`,
                outputHeight: 360,
              },
              {
                type: 'js',
                title: 'Edit Distance Table — Levenshtein Distance',
                instruction: 'Transform s1 into s2 using fewest operations. Base case: dp[i][0]=i, dp[0][j]=j. Green diagonal = match (free). Red = substitution, blue = insert/delete. Gold border = optimal path.',
                html: `<div id="out" style="padding:12px;font-family:monospace;font-size:13px;overflow:auto"></div>`,
                css: `body{margin:0;background:#0f172a;color:#e2e8f0}`,
                startCode: `const out = document.getElementById("out");
const s1 = "horse";
const s2 = "ros";
const m = s1.length, n = s2.length;

const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
const op = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(""));

for (let i = 0; i <= m; i++) { dp[i][0] = i; op[i][0] = "del"; }
for (let j = 0; j <= n; j++) { dp[0][j] = j; op[0][j] = "ins"; }
op[0][0] = "base";

for (let i = 1; i <= m; i++) {
  for (let j = 1; j <= n; j++) {
    if (s1[i-1] === s2[j-1]) {
      dp[i][j] = dp[i-1][j-1]; op[i][j] = "match";
    } else {
      const del2 = dp[i-1][j] + 1, ins = dp[i][j-1] + 1, sub = dp[i-1][j-1] + 1;
      if (sub <= del2 && sub <= ins) { dp[i][j] = sub; op[i][j] = "sub"; }
      else if (del2 <= ins) { dp[i][j] = del2; op[i][j] = "del"; }
      else { dp[i][j] = ins; op[i][j] = "ins"; }
    }
  }
}

const path = new Set();
const ops = [];
let i = m, j = n;
while (i > 0 || j > 0) {
  path.add(i + "," + j);
  const o = op[i][j];
  if (o === "match") { i--; j--; }
  else if (o === "sub") { ops.push("sub " + s1[i-1] + "->" + s2[j-1]); i--; j--; }
  else if (o === "del") { ops.push("del " + s1[i-1]); i--; }
  else if (o === "ins") { ops.push("ins " + s2[j-1]); j--; }
  else break;
}
path.add("0,0");
ops.reverse();

const opColors = { match: "#14532d", sub: "#7f1d1d", del: "#1e3a5f", ins: "#1e3a5f", base: "#0f2231", "": "#1e293b" };
const opText   = { match: "#4ade80", sub: "#fca5a5", del: "#93c5fd", ins: "#93c5fd", base: "#475569", "": "#94a3b8" };

let h = "<div style='color:#60a5fa;font-size:14px;margin-bottom:6px'>Edit Distance: <b>" + JSON.stringify(s1) + "</b> to <b>" + JSON.stringify(s2) + "</b></div>";
h += "<table style='border-collapse:collapse;margin-bottom:10px'>";
h += "<tr><td style='width:36px;height:32px'></td><td style='width:36px;height:32px;text-align:center;color:#64748b'>&nbsp;</td>";
for (let j2 = 0; j2 < n; j2++) {
  h += "<td style='width:36px;height:32px;text-align:center;color:#94a3b8;font-weight:bold'>" + s2[j2] + "</td>";
}
h += "</tr>";
for (let i2 = 0; i2 <= m; i2++) {
  h += "<tr><td style='width:36px;height:32px;text-align:center;color:#94a3b8;font-weight:bold'>" + (i2 === 0 ? "&nbsp;" : s1[i2-1]) + "</td>";
  for (let j2 = 0; j2 <= n; j2++) {
    const isPath = path.has(i2 + "," + j2);
    const o = op[i2][j2];
    const bg = opColors[o] || "#1e293b";
    const fc = opText[o] || "#94a3b8";
    const border = isPath ? "2px solid #f59e0b" : "1px solid #334155";
    h += "<td style='width:36px;height:32px;text-align:center;border:" + border + ";background:" + bg + ";color:" + fc + ";font-weight:bold;font-size:13px'>" + dp[i2][j2] + "</td>";
  }
  h += "</tr>";
}
h += "</table>";
h += "<div style='background:#1e293b;border-radius:6px;padding:8px 12px;color:#f59e0b;margin-bottom:6px'>Edit distance = <b>" + dp[m][n] + "</b></div>";
h += "<div style='font-size:12px;color:#94a3b8'>Operations: " + ops.join(" → ") + "</div>";
h += "<div style='margin-top:6px;color:#64748b;font-size:11px'>Green=match | Red=sub | Blue=ins/del | Gold border=optimal path</div>";
out.innerHTML = h;`,
                outputHeight: 340,
              },
              {
                type: 'js',
                title: 'git diff Simulation — LCS on Lines',
                instruction: 'Git treats each line as a token and runs LCS between two file versions. Lines in the LCS are unchanged. Everything else is an insertion (+) or deletion (−). This is exactly how every diff tool works.',
                html: `<div id="out" style="padding:12px;font-family:monospace;font-size:13px;overflow:auto"></div>`,
                css: `body{margin:0;background:#0f172a;color:#e2e8f0}`,
                startCode: `const out = document.getElementById("out");
const fileA = [
  "function add(a, b) {",
  "  return a + b;",
  "}",
  "",
  "function multiply(a, b) {",
  "  return a * b;",
  "}"
];
const fileB = [
  "function add(a, b) {",
  "  // add two numbers",
  "  return a + b;",
  "}",
  "",
  "function square(x) {",
  "  return x * x;",
  "}"
];

function lcsLines(A, B) {
  const m = A.length, n = B.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = A[i-1] === B[j-1]
        ? dp[i-1][j-1] + 1
        : Math.max(dp[i-1][j], dp[i][j-1]);
  const common = new Set();
  let i = m, j = n;
  while (i > 0 && j > 0) {
    if (A[i-1] === B[j-1]) { common.add("A" + (i-1)); common.add("B" + (j-1)); i--; j--; }
    else if (dp[i-1][j] >= dp[i][j-1]) i--;
    else j--;
  }
  return common;
}

const common = lcsLines(fileA, fileB);
let h = "<div style='color:#60a5fa;font-size:14px;margin-bottom:10px'>git diff — LCS on lines</div>";
h += "<div style='display:flex;gap:16px'>";
["A","B"].forEach((ver, vi) => {
  const lines = vi === 0 ? fileA : fileB;
  h += "<div style='flex:1'>";
  h += "<div style='color:#94a3b8;font-size:11px;margin-bottom:4px'>file" + ver + ".js</div>";
  lines.forEach((line, idx) => {
    const inLCS = common.has(ver + idx);
    const isDel = !inLCS && vi === 0, isAdd = !inLCS && vi === 1;
    const bg = isDel ? "#450a0a" : isAdd ? "#052e16" : "#1e293b";
    const color = isDel ? "#fca5a5" : isAdd ? "#86efac" : "#94a3b8";
    const borderColor = isDel ? "#ef4444" : isAdd ? "#22c55e" : "#334155";
    const prefix = isDel ? "- " : isAdd ? "+ " : "  ";
    h += "<div style='background:" + bg + ";color:" + color + ";padding:2px 6px;border-left:3px solid " + borderColor + ";margin-bottom:1px;white-space:pre'>" + prefix + line + "</div>";
  });
  h += "</div>";
});
h += "</div>";
out.innerHTML = h;`,
                outputHeight: 320,
              },
              {
                type: 'js',
                title: 'Longest Increasing Subsequence (LIS)',
                instruction: 'dp[i] = LIS length ending at index i. For each i, scan j < i: if nums[j] < nums[i], extend. Answer = max(dp). Number above each bar = dp[i]. Blue bars are LIS elements.',
                html: `<div id="out" style="padding:12px;font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;background:#0f172a;color:#e2e8f0}`,
                startCode: `const out = document.getElementById("out");
const nums = [10, 9, 2, 5, 3, 7, 101, 18];
const n = nums.length;
const dp = new Array(n).fill(1);
const parent = new Array(n).fill(-1);

for (let i = 1; i < n; i++)
  for (let j = 0; j < i; j++)
    if (nums[j] < nums[i] && dp[j] + 1 > dp[i]) {
      dp[i] = dp[j] + 1; parent[i] = j;
    }

const maxLen = Math.max(...dp);
const lisSet = new Set();
let cur = dp.indexOf(maxLen);
const endIdx = cur;
while (cur !== -1) { lisSet.add(cur); cur = parent[cur]; }

const maxVal = Math.max(...nums);
const barH = 120;

let h = "<div style='color:#60a5fa;font-size:14px;margin-bottom:10px'>LIS: nums = [" + nums.join(", ") + "]</div>";
h += "<div style='display:flex;align-items:flex-end;gap:6px;margin-bottom:12px;height:" + (barH + 30) + "px'>";
for (let i2 = 0; i2 < n; i2++) {
  const bh = Math.round((nums[i2] / maxVal) * barH);
  const inLIS = lisSet.has(i2);
  h += "<div style='display:flex;flex-direction:column;align-items:center;gap:3px'>";
  h += "<div style='color:" + (inLIS ? "#60a5fa" : "#64748b") + ";font-size:11px'>" + dp[i2] + "</div>";
  h += "<div style='width:36px;height:" + bh + "px;background:" + (inLIS ? "#3b82f6" : "#334155") + ";border-radius:4px 4px 0 0'></div>";
  h += "<div style='color:#e2e8f0;font-size:12px'>" + nums[i2] + "</div>";
  h += "</div>";
}
h += "</div>";
const lis = [];
cur = endIdx;
while (cur !== -1) { lis.unshift(nums[cur]); cur = parent[cur]; }
h += "<div style='background:#1e293b;border-radius:6px;padding:8px 12px;color:#4ade80;font-size:13px'>LIS = [" + lis.join(", ") + "] &nbsp;|&nbsp; Length = " + maxLen + "</div>";
h += "<div style='margin-top:6px;color:#64748b;font-size:11px'>Number above bar = dp[i] (LIS length ending here) &nbsp;|&nbsp; Blue = LIS elements</div>";
out.innerHTML = h;`,
                outputHeight: 290,
              },
            ],
          },
        },
      },
      {
        id: 'JSNotebook',
        title: 'Sequence DP in JavaScript — Build It From Scratch',
        caption: 'LCS length, Edit Distance, LCS reconstruction, and LIS. Each step has TODO stubs and a test suite.',
        props: {
          lesson: {
            title: 'Sequence DP in JavaScript',
            subtitle: 'LCS, Edit Distance, reconstruction, and LIS — implement from scratch.',
            cells: [
              {
                type: 'js',
                instruction: `## Step 1 — Longest Common Subsequence

Given two strings, return the **length** of their longest common subsequence.

**Recurrence:**
\`\`\`
if s1[i-1] === s2[j-1]:  dp[i][j] = dp[i-1][j-1] + 1
else:                     dp[i][j] = Math.max(dp[i-1][j], dp[i][j-1])
\`\`\`

Table size: (m+1) × (n+1). Base cases are already 0. Answer: dp[m][n].`,
                html: `<div id="out" style="font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;padding:14px;background:#0f172a;color:#e2e8f0;box-sizing:border-box}.pass{color:#4ade80;margin:2px 0}.fail{color:#f87171;margin:2px 0}`,
                startCode: `function lcs(s1, s2) {
  // TODO: create (m+1) x (n+1) table filled with 0
  // TODO: fill using the recurrence above
  // TODO: return dp[m][n]
}

const out = document.getElementById("out");
function check(label, got, want) {
  const ok = got === want;
  out.innerHTML += "<div class='" + (ok?"pass":"fail") + "'>" + (ok?"PASS":"FAIL") + " " + label + ": got " + JSON.stringify(got) + ", want " + JSON.stringify(want) + "</div>";
}

check("abcde / ace",       lcs("abcde", "ace"),       3);
check("abc / abc",         lcs("abc", "abc"),          3);
check("abc / def",         lcs("abc", "def"),          0);
check("ABCBDAB / BDCABA",  lcs("ABCBDAB", "BDCABA"),  4);
check("empty s1",          lcs("", "abc"),             0);
check("empty both",        lcs("", ""),                0);`,
                solutionCode: `function lcs(s1, s2) {
  const m = s1.length, n = s2.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = s1[i-1] === s2[j-1]
        ? dp[i-1][j-1] + 1
        : Math.max(dp[i-1][j], dp[i][j-1]);
  return dp[m][n];
}

const out = document.getElementById("out");
function check(label, got, want) {
  const ok = got === want;
  out.innerHTML += "<div class='" + (ok?"pass":"fail") + "'>" + (ok?"PASS":"FAIL") + " " + label + ": got " + JSON.stringify(got) + ", want " + JSON.stringify(want) + "</div>";
}

check("abcde / ace",       lcs("abcde", "ace"),       3);
check("abc / abc",         lcs("abc", "abc"),          3);
check("abc / def",         lcs("abc", "def"),          0);
check("ABCBDAB / BDCABA",  lcs("ABCBDAB", "BDCABA"),  4);
check("empty s1",          lcs("", "abc"),             0);
check("empty both",        lcs("", ""),                0);`,
              },
              {
                type: 'js',
                instruction: `## Step 2 — Edit Distance

Minimum operations (insert, delete, substitute) to transform s1 into s2.

**Base cases:** dp[i][0] = i, dp[0][j] = j.

**Recurrence:**
\`\`\`
if s1[i-1] === s2[j-1]:  dp[i][j] = dp[i-1][j-1]
else:  dp[i][j] = 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1])
\`\`\``,
                html: `<div id="out" style="font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;padding:14px;background:#0f172a;color:#e2e8f0;box-sizing:border-box}.pass{color:#4ade80;margin:2px 0}.fail{color:#f87171;margin:2px 0}`,
                startCode: `function editDistance(s1, s2) {
  // TODO: create (m+1) x (n+1) table
  // TODO: set base cases: dp[i][0] = i, dp[0][j] = j
  // TODO: fill using the recurrence above
  // TODO: return dp[m][n]
}

const out = document.getElementById("out");
function check(label, got, want) {
  const ok = got === want;
  out.innerHTML += "<div class='" + (ok?"pass":"fail") + "'>" + (ok?"PASS":"FAIL") + " " + label + ": got " + got + ", want " + want + "</div>";
}

check("horse / ros",             editDistance("horse", "ros"),            3);
check("intention / execution",   editDistance("intention", "execution"),  5);
check("abc / abc",               editDistance("abc", "abc"),              0);
check("a / b",                   editDistance("a", "b"),                  1);
check("empty / abc",             editDistance("", "abc"),                 3);
check("abc / empty",             editDistance("abc", ""),                 3);`,
                solutionCode: `function editDistance(s1, s2) {
  const m = s1.length, n = s2.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = s1[i-1] === s2[j-1]
        ? dp[i-1][j-1]
        : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);
  return dp[m][n];
}

const out = document.getElementById("out");
function check(label, got, want) {
  const ok = got === want;
  out.innerHTML += "<div class='" + (ok?"pass":"fail") + "'>" + (ok?"PASS":"FAIL") + " " + label + ": got " + got + ", want " + want + "</div>";
}

check("horse / ros",             editDistance("horse", "ros"),            3);
check("intention / execution",   editDistance("intention", "execution"),  5);
check("abc / abc",               editDistance("abc", "abc"),              0);
check("a / b",                   editDistance("a", "b"),                  1);
check("empty / abc",             editDistance("", "abc"),                 3);
check("abc / empty",             editDistance("abc", ""),                 3);`,
              },
              {
                type: 'js',
                instruction: `## Step 3 — Reconstruct the LCS String

Return the **actual** LCS string, not just its length. After filling the table, trace back from dp[m][n]:

- If s1[i-1] === s2[j-1]: emit that character, move diagonal (i--, j--)
- Else if dp[i-1][j] >= dp[i][j-1]: move up (i--)
- Else: move left (j--)

Build the string by prepending each emitted character.`,
                html: `<div id="out" style="font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;padding:14px;background:#0f172a;color:#e2e8f0;box-sizing:border-box}.pass{color:#4ade80;margin:2px 0}.fail{color:#f87171;margin:2px 0}`,
                startCode: `function lcsString(s1, s2) {
  // Step 1: fill the DP table (same recurrence as Step 1)
  // Step 2: trace back to reconstruct the actual LCS string
}

const out = document.getElementById("out");

function isSubseq(sub, str) {
  let si = 0;
  for (const c of str) { if (si < sub.length && c === sub[si]) si++; }
  return si === sub.length;
}
function check(s1, s2) {
  const got = lcsString(s1, s2);
  const expectedLen = lcs_len(s1, s2);
  const valid = got.length === expectedLen && isSubseq(got, s1) && isSubseq(got, s2);
  out.innerHTML += "<div class='" + (valid?"pass":"fail") + "'>" + (valid?"PASS":"FAIL") + " lcsString(" + JSON.stringify(s1) + ", " + JSON.stringify(s2) + ") = " + JSON.stringify(got) + " (len " + got.length + " want " + expectedLen + ")</div>";
}
function lcs_len(s1, s2) {
  const m = s1.length, n = s2.length;
  const dp = Array.from({ length: m+1 }, () => new Array(n+1).fill(0));
  for (let i=1;i<=m;i++) for (let j=1;j<=n;j++) dp[i][j]=s1[i-1]===s2[j-1]?dp[i-1][j-1]+1:Math.max(dp[i-1][j],dp[i][j-1]);
  return dp[m][n];
}

check("abcde", "ace");
check("ABCBDAB", "BDCABA");
check("abc", "def");`,
                solutionCode: `function lcsString(s1, s2) {
  const m = s1.length, n = s2.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = s1[i-1] === s2[j-1]
        ? dp[i-1][j-1] + 1
        : Math.max(dp[i-1][j], dp[i][j-1]);
  let result = "";
  let i = m, j = n;
  while (i > 0 && j > 0) {
    if (s1[i-1] === s2[j-1]) { result = s1[i-1] + result; i--; j--; }
    else if (dp[i-1][j] >= dp[i][j-1]) i--;
    else j--;
  }
  return result;
}

const out = document.getElementById("out");

function isSubseq(sub, str) {
  let si = 0;
  for (const c of str) { if (si < sub.length && c === sub[si]) si++; }
  return si === sub.length;
}
function check(s1, s2) {
  const got = lcsString(s1, s2);
  const expectedLen = lcs_len(s1, s2);
  const valid = got.length === expectedLen && isSubseq(got, s1) && isSubseq(got, s2);
  out.innerHTML += "<div class='" + (valid?"pass":"fail") + "'>" + (valid?"PASS":"FAIL") + " lcsString(" + JSON.stringify(s1) + ", " + JSON.stringify(s2) + ") = " + JSON.stringify(got) + " (len " + got.length + " want " + expectedLen + ")</div>";
}
function lcs_len(s1, s2) {
  const m = s1.length, n = s2.length;
  const dp = Array.from({ length: m+1 }, () => new Array(n+1).fill(0));
  for (let i=1;i<=m;i++) for (let j=1;j<=n;j++) dp[i][j]=s1[i-1]===s2[j-1]?dp[i-1][j-1]+1:Math.max(dp[i-1][j],dp[i][j-1]);
  return dp[m][n];
}

check("abcde", "ace");
check("ABCBDAB", "BDCABA");
check("abc", "def");`,
              },
              {
                type: 'js',
                instruction: `## Step 4 — Longest Increasing Subsequence

Given an integer array, return the length of the longest strictly increasing subsequence.

**Setup:** dp[i] = LIS length ending at index i. Initialize all to 1.

**Recurrence:** For each i, scan j < i. If nums[j] < nums[i]: dp[i] = Math.max(dp[i], dp[j] + 1).

**Answer:** Math.max(...dp) — the LIS doesn't have to end at the last element.`,
                html: `<div id="out" style="font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;padding:14px;background:#0f172a;color:#e2e8f0;box-sizing:border-box}.pass{color:#4ade80;margin:2px 0}.fail{color:#f87171;margin:2px 0}`,
                startCode: `function lengthOfLIS(nums) {
  // TODO: create dp array, all initialized to 1
  // TODO: for each i, scan j < i, update dp[i] if nums[j] < nums[i]
  // TODO: return Math.max(...dp)
}

const out = document.getElementById("out");
function check(label, got, want) {
  const ok = got === want;
  out.innerHTML += "<div class='" + (ok?"pass":"fail") + "'>" + (ok?"PASS":"FAIL") + " " + label + ": got " + got + ", want " + want + "</div>";
}

check("[10,9,2,5,3,7,101,18]",  lengthOfLIS([10,9,2,5,3,7,101,18]),  4);
check("[0,1,0,3,2,3]",           lengthOfLIS([0,1,0,3,2,3]),           4);
check("[7,7,7,7,7]",             lengthOfLIS([7,7,7,7,7]),             1);
check("[1,2,3,4,5]",             lengthOfLIS([1,2,3,4,5]),             5);
check("[5,4,3,2,1]",             lengthOfLIS([5,4,3,2,1]),             1);`,
                solutionCode: `function lengthOfLIS(nums) {
  const n = nums.length;
  const dp = new Array(n).fill(1);
  for (let i = 1; i < n; i++)
    for (let j = 0; j < i; j++)
      if (nums[j] < nums[i])
        dp[i] = Math.max(dp[i], dp[j] + 1);
  return Math.max(...dp);
}

const out = document.getElementById("out");
function check(label, got, want) {
  const ok = got === want;
  out.innerHTML += "<div class='" + (ok?"pass":"fail") + "'>" + (ok?"PASS":"FAIL") + " " + label + ": got " + got + ", want " + want + "</div>";
}

check("[10,9,2,5,3,7,101,18]",  lengthOfLIS([10,9,2,5,3,7,101,18]),  4);
check("[0,1,0,3,2,3]",           lengthOfLIS([0,1,0,3,2,3]),           4);
check("[7,7,7,7,7]",             lengthOfLIS([7,7,7,7,7]),             1);
check("[1,2,3,4,5]",             lengthOfLIS([1,2,3,4,5]),             5);
check("[5,4,3,2,1]",             lengthOfLIS([5,4,3,2,1]),             1);`,
              },
            ],
          },
        },
      },
      {
        id: 'PythonNotebook',
        title: 'Sequence DP in Python — Visualize and Extend',
        caption: 'LCS heatmap, edit distance operation coloring, DNA alignment, and from-scratch challenges.',
        props: {
          initialCells: [
            {
              type: 'code',
              language: 'python',
              label: 'LCS with heatmap and traceback arrows',
              code: `import numpy as np
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches

s1 = "ABCBDAB"
s2 = "BDCABA"
m, n = len(s1), len(s2)

dp = [[0] * (n + 1) for _ in range(m + 1)]
src = [[""] * (n + 1) for _ in range(m + 1)]

for i in range(1, m + 1):
    for j in range(1, n + 1):
        if s1[i-1] == s2[j-1]:
            dp[i][j] = dp[i-1][j-1] + 1
            src[i][j] = "diag"
        elif dp[i-1][j] >= dp[i][j-1]:
            dp[i][j] = dp[i-1][j]
            src[i][j] = "up"
        else:
            dp[i][j] = dp[i][j-1]
            src[i][j] = "left"

lcs_str = ""
path = set()
i, j = m, n
while i > 0 and j > 0:
    path.add((i, j))
    if src[i][j] == "diag":
        lcs_str = s1[i-1] + lcs_str
        i -= 1; j -= 1
    elif src[i][j] == "up":
        i -= 1
    else:
        j -= 1

fig, ax = plt.subplots(figsize=(10, 8))
fig.patch.set_facecolor("#0f172a")
ax.set_facecolor("#0f172a")

for i2 in range(m + 1):
    for j2 in range(n + 1):
        on_path = (i2, j2) in path
        is_diag = src[i2][j2] == "diag"
        val = dp[i2][j2]
        norm = val / (dp[m][n] or 1)
        if on_path and is_diag:
            bg = "#a16207"
        elif on_path:
            bg = "#1d4ed8"
        elif i2 == 0 or j2 == 0:
            bg = "#0f2231"
        else:
            r = int(15 + norm * 81)
            g = int(23 + norm * 142)
            b = int(42 + norm * 191)
            bg = f"#{r:02x}{g:02x}{b:02x}"
        rect = plt.Rectangle([j2 - 0.5, (m - i2) - 0.5], 1, 1, color=bg)
        ax.add_patch(rect)
        fc = "white" if on_path else ("#475569" if (i2 == 0 or j2 == 0) else "#e2e8f0")
        ax.text(j2, m - i2, str(val), ha="center", va="center",
                color=fc, fontsize=11, fontweight="bold", fontfamily="monospace")

ax.set_xlim(-0.5, n + 0.5)
ax.set_ylim(-0.5, m + 0.5)
ax.set_xticks(range(n + 1))
ax.set_xticklabels([""] + list(s2), color="#94a3b8", fontsize=12)
ax.set_yticks(range(m + 1))
ax.set_yticklabels([""] + list(reversed(s1)), color="#94a3b8", fontsize=12)
for spine in ax.spines.values():
    spine.set_edgecolor("#334155")
ax.set_title(f'LCS("{s1}", "{s2}") = "{lcs_str}" (length {len(lcs_str)})',
             color="#60a5fa", fontsize=13, pad=12)
legend = [
    mpatches.Patch(color="#a16207", label="Diagonal match on path"),
    mpatches.Patch(color="#1d4ed8", label="Traceback path (skip)"),
    mpatches.Patch(color="#0f2231", label="Base case"),
]
ax.legend(handles=legend, loc="upper left",
          facecolor="#1e293b", edgecolor="#334155", labelcolor="#94a3b8", fontsize=9)
plt.tight_layout()
plt.show()
print(f"LCS = '{lcs_str}', length = {len(lcs_str)}")
`,
            },
            {
              type: 'code',
              language: 'python',
              label: 'Edit Distance with operation coloring and path trace',
              code: `import matplotlib.pyplot as plt
import matplotlib.patches as mpatches

s1 = "intention"
s2 = "execution"
m, n = len(s1), len(s2)

dp = [[0] * (n + 1) for _ in range(m + 1)]
op = [[""] * (n + 1) for _ in range(m + 1)]

for i in range(m + 1): dp[i][0] = i; op[i][0] = "del"
for j in range(n + 1): dp[0][j] = j; op[0][j] = "ins"
op[0][0] = "base"

for i in range(1, m + 1):
    for j in range(1, n + 1):
        if s1[i-1] == s2[j-1]:
            dp[i][j] = dp[i-1][j-1]; op[i][j] = "match"
        else:
            d = dp[i-1][j] + 1
            ins = dp[i][j-1] + 1
            sub = dp[i-1][j-1] + 1
            if sub <= d and sub <= ins: dp[i][j] = sub; op[i][j] = "sub"
            elif d <= ins: dp[i][j] = d; op[i][j] = "del"
            else: dp[i][j] = ins; op[i][j] = "ins"

path = set()
ops_list = []
i, j = m, n
while i > 0 or j > 0:
    path.add((i, j))
    o = op[i][j]
    if o == "match": i -= 1; j -= 1
    elif o == "sub": ops_list.append(f"sub {s1[i-1]}->{s2[j-1]}"); i -= 1; j -= 1
    elif o == "del": ops_list.append(f"del {s1[i-1]}"); i -= 1
    elif o == "ins": ops_list.append(f"ins {s2[j-1]}"); j -= 1
    else: break
path.add((0, 0))
ops_list.reverse()

op_colors = {"match": "#14532d", "sub": "#7f1d1d", "del": "#1e3a5f",
             "ins": "#1e3a5f", "base": "#0f2231", "": "#1e293b"}
op_text   = {"match": "#4ade80", "sub": "#fca5a5", "del": "#93c5fd",
             "ins": "#93c5fd", "base": "#475569", "": "#94a3b8"}

fig, ax = plt.subplots(figsize=(12, 8))
fig.patch.set_facecolor("#0f172a")
ax.set_facecolor("#0f172a")

for i2 in range(m + 1):
    for j2 in range(n + 1):
        o = op[i2][j2]
        on_path = (i2, j2) in path
        rect = plt.Rectangle([j2 - 0.5, (m - i2) - 0.5], 1, 1, color=op_colors.get(o, "#1e293b"))
        ax.add_patch(rect)
        if on_path:
            border = plt.Rectangle([j2 - 0.5, (m - i2) - 0.5], 1, 1,
                                   fill=False, edgecolor="#f59e0b", linewidth=2)
            ax.add_patch(border)
        ax.text(j2, m - i2, str(dp[i2][j2]), ha="center", va="center",
                color=op_text.get(o, "#94a3b8"), fontsize=10, fontweight="bold", fontfamily="monospace")

ax.set_xlim(-0.5, n + 0.5)
ax.set_ylim(-0.5, m + 0.5)
ax.set_xticks(range(n + 1))
ax.set_xticklabels([""] + list(s2), color="#94a3b8", fontsize=11)
ax.set_yticks(range(m + 1))
ax.set_yticklabels([""] + list(reversed(s1)), color="#94a3b8", fontsize=11)
for sp in ax.spines.values():
    sp.set_edgecolor("#334155")
ax.set_title(f'Edit Distance: "{s1}" -> "{s2}" = {dp[m][n]}\\n{" -> ".join(ops_list)}',
             color="#60a5fa", fontsize=12, pad=12)
legend_patches = [
    mpatches.Patch(color="#14532d", label="Match (free)"),
    mpatches.Patch(color="#7f1d1d", label="Substitute (+1)"),
    mpatches.Patch(color="#1e3a5f", label="Insert / Delete (+1)"),
]
ax.legend(handles=legend_patches, loc="upper left",
          facecolor="#1e293b", edgecolor="#334155", labelcolor="#94a3b8", fontsize=9)
plt.tight_layout()
plt.show()
print(f"Distance: {dp[m][n]}")
print(f"Operations: {' -> '.join(ops_list)}")
`,
            },
            {
              type: 'code',
              language: 'python',
              label: 'DNA sequence alignment — Needleman-Wunsch global alignment',
              code: `# Needleman-Wunsch global alignment — the bioinformatics origin of sequence DP.
# Scoring: match = +2, mismatch = -1, gap = -2
import matplotlib.pyplot as plt

MATCH, MISMATCH, GAP = 2, -1, -2

# Simplified fragment of two primate gene sequences
seq1 = "ATCGATCGTAGCTAGC"
seq2 = "ATCGTTCGTAGCAAAC"
m, n = len(seq1), len(seq2)

dp = [[0] * (n + 1) for _ in range(m + 1)]
src = [[""] * (n + 1) for _ in range(m + 1)]

for i in range(m + 1): dp[i][0] = i * GAP; src[i][0] = "up"
for j in range(n + 1): dp[0][j] = j * GAP; src[0][j] = "left"
src[0][0] = "base"

for i in range(1, m + 1):
    for j in range(1, n + 1):
        score = MATCH if seq1[i-1] == seq2[j-1] else MISMATCH
        diag = dp[i-1][j-1] + score
        up   = dp[i-1][j]   + GAP
        left = dp[i][j-1]   + GAP
        dp[i][j] = max(diag, up, left)
        if dp[i][j] == diag: src[i][j] = "diag"
        elif dp[i][j] == up: src[i][j] = "up"
        else: src[i][j] = "left"

aligned1, aligned2, markers = "", "", ""
i, j = m, n
while i > 0 or j > 0:
    s = src[i][j]
    if s == "diag":
        c1, c2 = seq1[i-1], seq2[j-1]
        aligned1 = c1 + aligned1
        aligned2 = c2 + aligned2
        markers = ("|" if c1 == c2 else "x") + markers
        i -= 1; j -= 1
    elif s == "up":
        aligned1 = seq1[i-1] + aligned1
        aligned2 = "-" + aligned2
        markers = " " + markers
        i -= 1
    else:
        aligned1 = "-" + aligned1
        aligned2 = seq2[j-1] + aligned2
        markers = " " + markers
        j -= 1

identity = markers.count("|") / len(markers) * 100
print("Needleman-Wunsch global alignment:")
print(f"  Seq1: {aligned1}")
print(f"        {markers}")
print(f"  Seq2: {aligned2}")
print(f"  Score: {dp[m][n]}  |  Identity: {identity:.1f}%  |  Gaps: {aligned1.count('-') + aligned2.count('-')}")

# Heatmap
fig, ax = plt.subplots(figsize=(14, 6))
fig.patch.set_facecolor("#0f172a")
ax.set_facecolor("#0f172a")

minv = min(dp[i][j] for i in range(m+1) for j in range(n+1))
maxv = max(dp[i][j] for i in range(m+1) for j in range(n+1))
rng = maxv - minv or 1

for i2 in range(m + 1):
    for j2 in range(n + 1):
        val = dp[i2][j2]
        t = (val - minv) / rng
        is_match = (i2 > 0 and j2 > 0 and src[i2][j2] == "diag" and seq1[i2-1] == seq2[j2-1])
        if is_match:
            bg = "#166534"
        else:
            r = int(15 + t * 20)
            g = int(23 + t * 180)
            b = int(42 + t * 100)
            bg = f"#{r:02x}{g:02x}{b:02x}"
        rect = plt.Rectangle([j2 - 0.5, (m - i2) - 0.5], 1, 1, color=bg)
        ax.add_patch(rect)
        ax.text(j2, m - i2, str(val), ha="center", va="center",
                color="white", fontsize=8, fontfamily="monospace")

ax.set_xlim(-0.5, n + 0.5)
ax.set_ylim(-0.5, m + 0.5)
ax.set_xticks(range(n + 1))
ax.set_xticklabels([""] + list(seq2), color="#94a3b8", fontsize=9)
ax.set_yticks(range(m + 1))
ax.set_yticklabels([""] + list(reversed(seq1)), color="#94a3b8", fontsize=9)
for sp in ax.spines.values():
    sp.set_edgecolor("#334155")
ax.set_title(f"DNA Alignment (Needleman-Wunsch)  |  Identity: {identity:.1f}%",
             color="#60a5fa", fontsize=12, pad=10)
plt.tight_layout()
plt.show()
`,
            },
            {
              type: 'code',
              language: 'python',
              label: 'From scratch: Shortest Common Supersequence + LIS O(n log n)',
              code: `# ============================================================
# Challenge 1: Shortest Common Supersequence
# Shortest string that contains BOTH s1 and s2 as subsequences.
# Length = len(s1) + len(s2) - lcs(s1, s2)
# ============================================================

def lcs_table(s1, s2):
    m, n = len(s1), len(s2)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            dp[i][j] = dp[i-1][j-1] + 1 if s1[i-1] == s2[j-1] \
                       else max(dp[i-1][j], dp[i][j-1])
    return dp

def shortest_common_supersequence(s1, s2):
    dp = lcs_table(s1, s2)
    m, n = len(s1), len(s2)
    result = ""
    i, j = m, n
    while i > 0 and j > 0:
        if s1[i-1] == s2[j-1]:
            result = s1[i-1] + result; i -= 1; j -= 1
        elif dp[i-1][j] > dp[i][j-1]:
            result = s1[i-1] + result; i -= 1
        else:
            result = s2[j-1] + result; j -= 1
    result = s1[:i] + s2[:j] + result
    return result

def is_subseq(sub, string):
    it = iter(string)
    return all(c in it for c in sub)

s1, s2 = "abac", "cab"
scs = shortest_common_supersequence(s1, s2)
print(f"SCS('{s1}', '{s2}') = '{scs}' (length {len(scs)})")
assert is_subseq(s1, scs) and is_subseq(s2, scs), "SCS must contain both as subsequences"
print("  Verified both are subsequences of SCS")
print()

# ============================================================
# Challenge 2: LIS in O(n log n) — Patience Sorting
# Maintain pile tops. Binary search each new card.
# Number of piles = LIS length.
# ============================================================

import bisect
import matplotlib.pyplot as plt

def lis_fast(nums):
    tails = []
    for x in nums:
        pos = bisect.bisect_left(tails, x)
        if pos == len(tails):
            tails.append(x)
        else:
            tails[pos] = x
    return len(tails), tails

nums = [10, 9, 2, 5, 3, 7, 101, 18]
length, tails = lis_fast(nums)
print(f"LIS O(n log n) on {nums}")
print(f"  Length = {length}")
print(f"  Patience sort pile tops = {tails}")

# Visualize piles
piles = []
for x in nums:
    pos = bisect.bisect_left([p[-1] for p in piles], x)
    if pos == len(piles): piles.append([x])
    else: piles[pos].append(x)

fig, ax = plt.subplots(figsize=(10, 5))
fig.patch.set_facecolor("#0f172a")
ax.set_facecolor("#0f172a")

for pi, pile in enumerate(piles):
    for ri, card in enumerate(pile):
        is_top = ri == len(pile) - 1
        rect = plt.Rectangle([pi - 0.4, ri], 0.8, 0.8,
                              color="#3b82f6" if is_top else "#1e3a5f")
        ax.add_patch(rect)
        ax.text(pi, ri + 0.4, str(card), ha="center", va="center",
                color="white", fontsize=12, fontweight="bold")

ax.set_xlim(-0.5, len(piles) - 0.5)
ax.set_ylim(-0.5, max(len(p) for p in piles) + 0.5)
ax.set_xticks(range(len(piles)))
ax.set_xticklabels([f"Pile {i+1}" for i in range(len(piles))], color="#94a3b8")
ax.set_yticks([])
for sp in ax.spines.values(): sp.set_visible(False)
ax.set_title(f"Patience Sort — {len(piles)} piles = LIS length  |  Blue = pile top",
             color="#60a5fa", fontsize=12)
plt.tight_layout()
plt.show()
`,
            },
          ],
        },
      },
    ],
  },
};
