// DSA + Design Patterns — Lesson 28
// Sequence DP: LCS & Edit Distance

export const lesson = {
  id: 'dsa-patterns-28',
  series: { id: 'dsa-patterns', title: 'DSA + Design Patterns' },
  title: '28. Sequence DP: LCS & Edit Distance',
  checkpoints: [
    { id: 'cp-lcs',        label: 'LCS' },
    { id: 'cp-editdist',   label: 'Edit Distance' },
    { id: 'cp-lis',        label: 'LIS' },
  ],
  segments: [

    // ── Introduction ──────────────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'intro',
      text: 'You need to measure how similar two DNA sequences are, or find the minimum edits to fix a typo, or find the longest run of numbers that only goes up. All three problems share the same structure: you are comparing sequences element by element, and the best answer for the whole sequence depends on optimal answers for sub-sequences. Brute force — try all combinations — is exponential. There is a technique that remembers every sub-problem answer in a table, so each sub-problem is solved exactly once. The table itself is the memory. No design pattern adds clarity here — the algorithm structure is its own best documentation.',
      code: null,
    },

    // ── Step 1: Dynamic programming recap ────────────────────────────────────

    {
      type: 'narration',
      id: 'step1-dp-recap',
      text: 'Dynamic programming (DP) solves problems by breaking them into overlapping sub-problems and storing each sub-problem\'s answer in a table (memoization — top-down, or tabulation — bottom-up). The two conditions for DP: (1) Optimal substructure — the optimal solution to the problem contains optimal solutions to its sub-problems. (2) Overlapping sub-problems — the same sub-problems recur. For sequence DP, the table is usually 2D: dp[i][j] represents the answer for the first i characters of string A and the first j characters of string B. Time: O(m × n). Space: O(m × n) — the full table — but often reducible to O(min(m,n)) by keeping only two rows.',
      code: `// Fibonacci as simple DP example — both forms
// Naive recursive: exponential O(2^n) — recomputes the same values
function fibNaive(n) {
  if (n <= 1) return n
  return fibNaive(n-1) + fibNaive(n-2)   // overlapping sub-problems
}

// DP tabulation: O(n) — each sub-problem solved exactly once
function fibDP(n) {
  if (n <= 1) return n
  const dp = new Array(n+1)
  dp[0] = 0; dp[1] = 1
  for (let i = 2; i <= n; i++) dp[i] = dp[i-1] + dp[i-2]   // build up from base cases
  return dp[n]
}

console.log(fibDP(10))   // 55
console.log(fibDP(20))   // 6765

// For sequences, we extend this to 2D tables
// dp[i][j] = answer considering first i chars of A and first j chars of B`,
    },

    // ── Step 2: LCS — definition and recurrence ───────────────────────────────

    {
      type: 'narration',
      id: 'step2-lcs-recurrence',
      text: 'The Longest Common Subsequence (LCS) of two strings is the longest sequence of characters that appears in both strings in the same relative order, but not necessarily consecutively. LCS("ABCBDAB", "BDCAB") = "BCAB" or "BDAB" (length 4). The DP recurrence: if A[i] === B[j], then dp[i][j] = dp[i-1][j-1] + 1 (the current characters match, extend the LCS of the shorter prefixes). If A[i] !== B[j], then dp[i][j] = max(dp[i-1][j], dp[i][j-1]) (take the better of ignoring A[i] or ignoring B[j]). Base cases: dp[0][j] = dp[i][0] = 0 (empty string has LCS 0 with anything).',
      code: `// LCS recurrence illustrated step by step
// LCS("ABC", "AC") = "AC" — length 2

// Table dp[i][j] = LCS length of A[0..i-1] and B[0..j-1]
// A = "ABC" (length 3), B = "AC" (length 2)
// Rows: i=0..3 (0 = empty prefix of A)
// Cols: j=0..2 (0 = empty prefix of B)

const A = 'ABC', B = 'AC'
const m = A.length, n = B.length

// Init: row 0 and col 0 are all zeros (base cases)
const dp = Array.from({length:m+1}, () => new Array(n+1).fill(0))

for (let i = 1; i <= m; i++) {
  for (let j = 1; j <= n; j++) {
    if (A[i-1] === B[j-1]) {                         // characters match
      dp[i][j] = dp[i-1][j-1] + 1                   // extend the diagonal
    } else {                                         // no match
      dp[i][j] = Math.max(dp[i-1][j], dp[i][j-1])   // best of skip A[i] or skip B[j]
    }
  }
}

console.log('LCS length:', dp[m][n])   // 2

// Print the table (rows = A chars, cols = B chars)
console.log('dp table:')
dp.forEach((row, i) => console.log(('  ' + (i === 0 ? '' : A[i-1])).slice(-2) + ' ' + row.join(' ')))`,
    },

    // ── Step 3: LCS string reconstruction ────────────────────────────────────

    {
      type: 'narration',
      id: 'step3-lcs-reconstruct',
      text: 'The LCS length is in dp[m][n], but to reconstruct the actual subsequence, backtrack through the table. Start at dp[m][n]. If A[i-1] === B[j-1], this character is in the LCS — prepend it to the result and move to dp[i-1][j-1]. Otherwise, move in the direction of the larger value: if dp[i-1][j] >= dp[i][j-1], move up (go to dp[i-1][j]); otherwise move left. Stop when i or j reaches 0. This is O(m + n) backtracking after O(m × n) fill.',
      code: `function lcs(A, B) {
  const m = A.length, n = B.length
  const dp = Array.from({length:m+1}, () => new Array(n+1).fill(0))  // ← NEW

  // Fill the table
  for (let i = 1; i <= m; i++) {                    // ← NEW
    for (let j = 1; j <= n; j++) {                  // ← NEW
      if (A[i-1] === B[j-1])                        // ← NEW
        dp[i][j] = dp[i-1][j-1] + 1                // ← NEW  match: extend diagonal
      else                                           // ← NEW
        dp[i][j] = Math.max(dp[i-1][j], dp[i][j-1])// ← NEW  no match: best of two skips
    }
  }

  // Backtrack to find the actual subsequence
  let result = ''                                    // ← NEW
  let i = m, j = n                                  // ← NEW  start at bottom-right
  while (i > 0 && j > 0) {                          // ← NEW
    if (A[i-1] === B[j-1]) {                        // ← NEW  this char is in LCS
      result = A[i-1] + result                      // ← NEW  prepend
      i--; j--                                      // ← NEW  move diagonal
    } else if (dp[i-1][j] >= dp[i][j-1]) {         // ← NEW
      i--                                           // ← NEW  move up
    } else {                                        // ← NEW
      j--                                           // ← NEW  move left
    }
  }

  return { length: dp[m][n], sequence: result }     // ← NEW
}

console.log(lcs('ABCBDAB', 'BDCAB'))    // length: 4, sequence: 'BCAB' or 'BDAB'
console.log(lcs('AGGTAB', 'GXTXAYB'))  // length: 4, sequence: 'GTAB'
console.log(lcs('ABC', 'AC'))           // length: 2, sequence: 'AC'`,
    },

    // ── Challenge 1: LCS ─────────────────────────────────────────────────────

    {
      type: 'challenge',
      id: 'ch-lcs',
      text: 'Implement lcs(A, B) that returns {length, sequence}. Test: lcs("ABCBDAB", "BDCAB") should return length 4. Also test lcs("AGGTAB", "GXTXAYB") — length 4. Log both results. For extra verification, log lcs("", "ABC") — should return {length: 0, sequence: ""}.',
      expectedOutput: null,
      startCode: `function lcs(A, B) {
  const m = A.length, n = B.length
  const dp = Array.from({length:m+1}, () => new Array(n+1).fill(0))

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      // YOUR CODE HERE: fill dp[i][j] based on match or no match
    }
  }

  // Backtrack to reconstruct the sequence
  let result = '', i = m, j = n
  while (i > 0 && j > 0) {
    // YOUR CODE HERE: backtrack through dp table
  }

  return { length: dp[m][n], sequence: result }
}

console.log(lcs('ABCBDAB', 'BDCAB'))
console.log(lcs('AGGTAB', 'GXTXAYB'))
console.log(lcs('', 'ABC'))`,
      hint: 'Fill: if A[i-1]===B[j-1], dp[i][j]=dp[i-1][j-1]+1, else dp[i][j]=Math.max(dp[i-1][j],dp[i][j-1]). Backtrack: if match, prepend A[i-1] and move i--,j--. Else move toward larger dp value.',
      validate: ({ logs }) => {
        const flat = logs.join(' ')
        return flat.includes('4') && (flat.includes('BCAB') || flat.includes('BDAB') || flat.includes('GTAB'))
      },
    },

    { type: 'checkpoint', id: 'cp-lcs' },

    // ── Step 4: Edit distance — definition ────────────────────────────────────

    {
      type: 'narration',
      id: 'step4-edit-dist',
      text: 'Edit distance (also called Levenshtein distance, after Vladimir Levenshtein, 1965) is the minimum number of single-character edits needed to transform one string into another. Three allowed operations: insert a character, delete a character, replace a character (each costs 1). editDistance("kitten", "sitting") = 3: (k→s, e→i, insert g). Applications: spell checkers, DNA sequence alignment, diff tools (git diff uses a variant), natural language processing. The DP recurrence is similar to LCS but tracks edits instead of matches.',
      code: `// Edit distance recurrence
// editDistance("cat", "cut"):
// One replace: c-a-t → c-u-t

// dp[i][j] = min edits to turn A[0..i-1] into B[0..j-1]
// Base cases:
//   dp[0][j] = j  (insert j characters to turn empty string into B[0..j-1])
//   dp[i][0] = i  (delete i characters to turn A[0..i-1] into empty string)

// Recurrence:
//   if A[i-1] === B[j-1]: dp[i][j] = dp[i-1][j-1]        (no edit needed)
//   else: dp[i][j] = 1 + min(
//     dp[i-1][j],     // delete A[i-1]
//     dp[i][j-1],     // insert B[j-1]
//     dp[i-1][j-1]    // replace A[i-1] with B[j-1]
//   )

const A = 'cat', B = 'cut'
const m = A.length, n = B.length
const dp = Array.from({length:m+1}, (_,i) => new Array(n+1).fill(0).map((_,j) => i===0?j:j===0?i:0))

for (let i = 1; i <= m; i++) {
  for (let j = 1; j <= n; j++) {
    if (A[i-1] === B[j-1]) {
      dp[i][j] = dp[i-1][j-1]   // no edit
    } else {
      dp[i][j] = 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1])
    }
  }
}

console.log('edit distance cat→cut:', dp[m][n])   // 1`,
    },

    // ── Step 5: Edit distance full implementation ─────────────────────────────

    {
      type: 'narration',
      id: 'step5-edit-dist-full',
      text: 'The full edit distance implementation with operation reconstruction. Track which operation was chosen at each cell to reconstruct the path from the source string to the target. This is the algorithm behind spell checkers: find all dictionary words within edit distance 1 or 2. It is also the core of git diff — comparing line sequences instead of characters (each "character" is a line of code).',
      code: `function editDistance(A, B) {
  const m = A.length, n = B.length

  // Initialize: dp[i][0] = i deletions, dp[0][j] = j insertions
  const dp = Array.from({length:m+1}, (_, i) =>      // ← NEW
    Array.from({length:n+1}, (_, j) => i === 0 ? j : j === 0 ? i : 0)  // ← NEW
  )

  for (let i = 1; i <= m; i++) {                      // ← NEW
    for (let j = 1; j <= n; j++) {                    // ← NEW
      if (A[i-1] === B[j-1]) {                        // ← NEW  characters match
        dp[i][j] = dp[i-1][j-1]                       // ← NEW  no edit needed
      } else {                                        // ← NEW
        dp[i][j] = 1 + Math.min(                      // ← NEW  cost 1 + best option
          dp[i-1][j],    // ← NEW  delete A[i-1]
          dp[i][j-1],    // ← NEW  insert B[j-1]
          dp[i-1][j-1]   // ← NEW  replace A[i-1] with B[j-1]
        )
      }
    }
  }

  // Reconstruct operations
  const ops = []                                      // ← NEW
  let i = m, j = n                                    // ← NEW
  while (i > 0 || j > 0) {                           // ← NEW
    if (i > 0 && j > 0 && A[i-1] === B[j-1]) {      // ← NEW
      ops.unshift('keep ' + A[i-1])                  // ← NEW
      i--; j--
    } else if (j > 0 && (i === 0 || dp[i][j-1] <= dp[i-1][j] && dp[i][j-1] <= dp[i-1][j-1])) {
      ops.unshift('insert ' + B[j-1])                // ← NEW
      j--
    } else if (i > 0 && (j === 0 || dp[i-1][j] <= dp[i][j-1] && dp[i-1][j] <= dp[i-1][j-1])) {
      ops.unshift('delete ' + A[i-1])                // ← NEW
      i--
    } else {
      ops.unshift('replace ' + A[i-1] + ' with ' + B[j-1])  // ← NEW
      i--; j--
    }
  }

  return { distance: dp[m][n], ops }                 // ← NEW
}

const r = editDistance('kitten', 'sitting')
console.log('distance:', r.distance)   // 3
console.log('operations:')
r.ops.forEach(op => console.log(' ', op))`,
    },

    // ── Challenge 2: Edit distance ────────────────────────────────────────────

    {
      type: 'challenge',
      id: 'ch-editdist',
      text: 'Implement editDistance(A, B) returning {distance}. Compute the edit distance between "kitten" and "sitting" (expected: 3), "sunday" and "saturday" (expected: 3), and "abc" and "abc" (expected: 0). Log all three distances. Edge case: if either string is empty, the distance equals the other string\'s length.',
      expectedOutput: null,
      startCode: `function editDistance(A, B) {
  const m = A.length, n = B.length

  const dp = Array.from({length:m+1}, (_, i) =>
    Array.from({length:n+1}, (_, j) => i === 0 ? j : j === 0 ? i : 0)
  )

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      // YOUR CODE HERE
    }
  }

  return { distance: dp[m][n] }
}

console.log('kitten→sitting:', editDistance('kitten', 'sitting').distance)
console.log('sunday→saturday:', editDistance('sunday', 'saturday').distance)
console.log('abc→abc:', editDistance('abc', 'abc').distance)`,
      hint: 'if A[i-1]===B[j-1]: dp[i][j]=dp[i-1][j-1]. else: dp[i][j]=1+Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]).',
      validate: ({ logs }) => {
        const nums = logs.map(l => String(l).match(/\d+/g)).filter(Boolean).flat().map(Number)
        return nums.includes(3) && nums.includes(0)
      },
    },

    { type: 'checkpoint', id: 'cp-editdist' },

    // ── Step 6: LIS — definition and patience sorting ─────────────────────────

    {
      type: 'narration',
      id: 'step6-lis',
      text: 'The Longest Increasing Subsequence (LIS) of an array is the longest subsequence (not necessarily contiguous) where each element is strictly greater than the previous. LIS([10, 9, 2, 5, 3, 7, 101, 18]) = [2, 5, 7, 101] or [2, 5, 7, 18] — length 4. Naive DP is O(n²) — compare each pair. Patience sorting (an O(n log n) algorithm named after the card game Patience) uses a "piles" array and binary search. Each number is placed on the leftmost pile whose top is >= the number. The number of piles at the end is the LIS length.',
      code: `// LIS with naive O(n^2) DP first — easier to understand
function lisNaive(nums) {
  const n  = nums.length
  const dp = new Array(n).fill(1)    // dp[i] = LIS ending at index i

  for (let i = 1; i < n; i++) {
    for (let j = 0; j < i; j++) {
      if (nums[j] < nums[i]) {         // nums[j] can extend to nums[i]
        dp[i] = Math.max(dp[i], dp[j] + 1)
      }
    }
  }

  return Math.max(...dp)
}

console.log(lisNaive([10, 9, 2, 5, 3, 7, 101, 18]))   // 4
console.log(lisNaive([3, 10, 2, 1, 20]))               // 3  (3,10,20 or 1,2,20)
console.log(lisNaive([1, 2, 3, 4, 5]))                 // 5  (entire array)`,
    },

    // ── Step 7: Patience sorting — O(n log n) ────────────────────────────────

    {
      type: 'narration',
      id: 'step7-patience-sort',
      text: 'Patience sorting for LIS in O(n log n). Maintain a piles array where piles[k] stores the smallest tail element of any increasing subsequence of length k+1. For each number: binary search for the leftmost pile whose top is >= the number (O(log n) per number). If found, replace that pile\'s top. If not found, start a new pile. The invariant: piles is always sorted (smallest tails), enabling binary search. Length of piles = LIS length. This is elegant because the number of piles equals the number of cards in the longest non-increasing sequence — a theorem from combinatorics.',
      code: `function lisLength(nums) {
  const piles = []    // piles[k] = smallest ending value of LIS of length k+1

  for (const num of nums) {
    // Binary search for leftmost pile with top >= num
    let lo = 0, hi = piles.length    // ← NEW

    while (lo < hi) {                // ← NEW  binary search
      const mid = (lo + hi) >> 1    // ← NEW  >> 1 is floor division by 2
      if (piles[mid] < num) {        // ← NEW
        lo = mid + 1                 // ← NEW  search right
      } else {                       // ← NEW
        hi = mid                     // ← NEW  search left
      }
    }

    piles[lo] = num   // ← NEW  replace pile top (or start new pile)
  }

  return piles.length   // ← NEW  number of piles = LIS length
}

// Trace: [10, 9, 2, 5, 3, 7, 101, 18]
// 10 → piles: [10]
// 9  → piles: [9]      (replaces 10 — smaller tail means longer future sequences possible)
// 2  → piles: [2]
// 5  → piles: [2, 5]   (new pile)
// 3  → piles: [2, 3]   (replaces 5)
// 7  → piles: [2, 3, 7] (new pile)
// 101→ piles: [2, 3, 7, 101] (new pile)
// 18 → piles: [2, 3, 7, 18] (replaces 101)

console.log(lisLength([10, 9, 2, 5, 3, 7, 101, 18]))   // 4
console.log(lisLength([0, 1, 0, 3, 2, 3]))              // 4
console.log(lisLength([7, 7, 7, 7]))                    // 1  (strictly increasing)`,
    },

    // ── Challenge 3: LIS ─────────────────────────────────────────────────────

    {
      type: 'challenge',
      id: 'ch-lis',
      text: 'Implement lisLength(nums) using patience sorting (O(n log n) with binary search). Find the LIS length of [10, 9, 2, 5, 3, 7, 101, 18] (expected: 4) and [3, 10, 2, 1, 20] (expected: 3). Also find the LIS of [1] (expected: 1) and [] (expected: 0). Log all four results.',
      expectedOutput: null,
      startCode: `function lisLength(nums) {
  const piles = []

  for (const num of nums) {
    // Binary search for leftmost pile with top >= num
    let lo = 0, hi = piles.length
    while (lo < hi) {
      const mid = (lo + hi) >> 1
      // YOUR CODE HERE: if piles[mid] < num, search right; else search left
    }
    piles[lo] = num
  }

  return piles.length
}

console.log(lisLength([10, 9, 2, 5, 3, 7, 101, 18]))  // 4
console.log(lisLength([3, 10, 2, 1, 20]))              // 3
console.log(lisLength([1]))                            // 1
console.log(lisLength([]))                             // 0`,
      hint: 'In the binary search: if (piles[mid] < num) lo = mid + 1; else hi = mid. After the loop, piles[lo] = num places the number in the correct position (or extends piles).',
      validate: ({ logs }) => {
        const nums = logs.map(l => parseInt(String(l).trim())).filter(n => !isNaN(n))
        return nums.includes(4) && nums.includes(3) && nums.includes(1) && nums.includes(0)
      },
    },

    { type: 'checkpoint', id: 'cp-lis' },

    // ── Combined: All three on a real problem ─────────────────────────────────

    {
      type: 'narration',
      id: 'step8-combined',
      text: 'Bioinformatics example: given two DNA strings and a sequence of expression levels, find the LCS (most conserved subsequence), the edit distance (how many mutations apart they are), and the LIS length of the expression level data (how many consecutive time points show increasing expression). All three DP algorithms on the same data set. There is no design pattern to apply here — the algorithms are self-contained, and adding a pattern would obscure more than it reveals. The DP table IS the abstraction.',
      code: `function lcs(A, B) {
  const m=A.length,n=B.length
  const dp=Array.from({length:m+1},()=>new Array(n+1).fill(0))
  for(let i=1;i<=m;i++) for(let j=1;j<=n;j++) if(A[i-1]===B[j-1])dp[i][j]=dp[i-1][j-1]+1; else dp[i][j]=Math.max(dp[i-1][j],dp[i][j-1])
  let r='',i=m,j=n; while(i>0&&j>0){if(A[i-1]===B[j-1]){r=A[i-1]+r;i--;j--}else if(dp[i-1][j]>=dp[i][j-1])i--;else j--}
  return{length:dp[m][n],sequence:r}
}

function editDistance(A, B) {
  const m=A.length,n=B.length
  const dp=Array.from({length:m+1},(_,i)=>Array.from({length:n+1},(_,j)=>i===0?j:j===0?i:0))
  for(let i=1;i<=m;i++) for(let j=1;j<=n;j++) if(A[i-1]===B[j-1])dp[i][j]=dp[i-1][j-1];else dp[i][j]=1+Math.min(dp[i-1][j],dp[i][j-1],dp[i-1][j-1])
  return{distance:dp[m][n]}
}

function lisLength(nums) {
  const p=[]
  for(const n of nums){let lo=0,hi=p.length;while(lo<hi){const m=(lo+hi)>>1;if(p[m]<n)lo=m+1;else hi=m}p[lo]=n}
  return p.length
}

// Human gene (simplified) vs mouse gene
const human = 'ACGTACGTCGAT'
const mouse  = 'ACGACGCGAT'

// Expression levels over 12 time points
const expression = [12, 8, 15, 9, 11, 14, 10, 16, 13, 18, 17, 20]

const lcsResult  = lcs(human, mouse)
const edResult   = editDistance(human, mouse)
const lisResult  = lisLength(expression)

console.log('LCS length:', lcsResult.length, 'sequence:', lcsResult.sequence)
console.log('Edit distance (human→mouse):', edResult.distance)
console.log('Longest increasing expression run:', lisResult)`,
    },

    // ── Challenge 4: Combined ─────────────────────────────────────────────────

    {
      type: 'challenge',
      id: 'ch-combined',
      text: 'Given two strings s1="AGTACGCA" and s2="TATGC", compute: (1) LCS length and sequence, (2) edit distance, (3) LIS of the array [3, 1, 4, 1, 5, 9, 2, 6] (should be 4: 1,4,5,9 or 1,4,5,6 etc.). Log all results clearly labelled.',
      expectedOutput: null,
      startCode: `function lcs(A, B) {
  const m=A.length,n=B.length
  const dp=Array.from({length:m+1},()=>new Array(n+1).fill(0))
  for(let i=1;i<=m;i++) for(let j=1;j<=n;j++) if(A[i-1]===B[j-1])dp[i][j]=dp[i-1][j-1]+1;else dp[i][j]=Math.max(dp[i-1][j],dp[i][j-1])
  let r='',i=m,j=n;while(i>0&&j>0){if(A[i-1]===B[j-1]){r=A[i-1]+r;i--;j--}else if(dp[i-1][j]>=dp[i][j-1])i--;else j--}
  return{length:dp[m][n],sequence:r}
}

function editDistance(A, B) {
  const m=A.length,n=B.length
  const dp=Array.from({length:m+1},(_,i)=>Array.from({length:n+1},(_,j)=>i===0?j:j===0?i:0))
  for(let i=1;i<=m;i++) for(let j=1;j<=n;j++) if(A[i-1]===B[j-1])dp[i][j]=dp[i-1][j-1];else dp[i][j]=1+Math.min(dp[i-1][j],dp[i][j-1],dp[i-1][j-1])
  return{distance:dp[m][n]}
}

function lisLength(nums) {
  const p=[];for(const n of nums){let lo=0,hi=p.length;while(lo<hi){const m=(lo+hi)>>1;if(p[m]<n)lo=m+1;else hi=m}p[lo]=n}
  return p.length
}

const s1 = 'AGTACGCA'
const s2 = 'TATGC'
const arr = [3, 1, 4, 1, 5, 9, 2, 6]

// YOUR CODE HERE: call all three functions and log labelled results
`,
      hint: 'const r1=lcs(s1,s2); console.log("LCS:",r1.length,r1.sequence); console.log("Edit dist:",editDistance(s1,s2).distance); console.log("LIS:",lisLength(arr));',
      validate: ({ logs }) => {
        const flat = logs.join(' ')
        const nums = flat.match(/\d+/g)?.map(Number) || []
        return nums.includes(4) && (flat.toLowerCase().includes('lcs') || flat.toLowerCase().includes('lis'))
      },
    },

    // ── CodeLens setup ────────────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'codelens-setup',
      text: 'Open in CodeLens and step through the LCS fill. Watch dp[i][j] get assigned. When characters match (A[i-1]===B[j-1]), see the diagonal value +1. When they don\'t match, see the max of the two adjacent cells. Then step through the backtracking: follow the dp table backward from dp[m][n] to reconstruct the sequence. For edit distance, watch the three-way min — insert, delete, or replace.',
      code: `function lcs(A, B) {
  const m = A.length, n = B.length
  const dp = Array.from({length:m+1}, () => new Array(n+1).fill(0))

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (A[i-1] === B[j-1])
        dp[i][j] = dp[i-1][j-1] + 1
      else
        dp[i][j] = Math.max(dp[i-1][j], dp[i][j-1])
    }
  }

  let result = '', i = m, j = n
  while (i > 0 && j > 0) {
    if (A[i-1] === B[j-1]) { result = A[i-1] + result; i--; j-- }
    else if (dp[i-1][j] >= dp[i][j-1]) i--
    else j--
  }

  return { length: dp[m][n], sequence: result }
}

console.log(lcs('ABCBDAB', 'BDCAB'))`,
    },

    {
      type: 'codelens',
      id: 'cl-dp',
      text: 'Step through in CodeLens. Watch the 2D dp array fill cell by cell. See the diagonal copy when characters match (dp[i-1][j-1]+1). See the max-of-two-neighbours when they don\'t. Then watch the backtracking loop: each step prepends a character when there\'s a match, or steps toward the larger neighbouring cell. The path through the table reveals the actual subsequence.',
      code: `function lcs(A,B){const m=A.length,n=B.length;const dp=Array.from({length:m+1},()=>new Array(n+1).fill(0));for(let i=1;i<=m;i++)for(let j=1;j<=n;j++)if(A[i-1]===B[j-1])dp[i][j]=dp[i-1][j-1]+1;else dp[i][j]=Math.max(dp[i-1][j],dp[i][j-1]);let r='',i=m,j=n;while(i>0&&j>0){if(A[i-1]===B[j-1]){r=A[i-1]+r;i--;j--}else if(dp[i-1][j]>=dp[i][j-1])i--;else j--}return{length:dp[m][n],sequence:r}}
console.log(lcs('ABCD','ACDF'))
function ed(A,B){const m=A.length,n=B.length;const dp=Array.from({length:m+1},(_,i)=>Array.from({length:n+1},(_,j)=>i===0?j:j===0?i:0));for(let i=1;i<=m;i++)for(let j=1;j<=n;j++)if(A[i-1]===B[j-1])dp[i][j]=dp[i-1][j-1];else dp[i][j]=1+Math.min(dp[i-1][j],dp[i][j-1],dp[i-1][j-1]);return dp[m][n]}
console.log(ed('kitten','sitting'))`,
      lang: 'js',
    },

  ],
}
