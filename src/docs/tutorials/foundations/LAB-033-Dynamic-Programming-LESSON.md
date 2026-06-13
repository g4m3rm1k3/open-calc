# FOUNDATIONS — LAB-033 — Dynamic Programming and Memoization

**Series:** FOUNDATIONS — Part VI: Algorithms
**Environment:** Browser DevTools console (F12 → Console). All examples run directly there.
**Time:** 55–70 minutes.

---

## What You Will Build

A naive recursive Fibonacci that demonstrates exponential blow-up, a memoized version that reduces it to O(n), a tabulated version, and a coin change solver. After this lab you will understand what makes a problem suitable for dynamic programming and the difference between top-down (memoization) and bottom-up (tabulation).

---

## What You Need to Know First

**From LAB-008 (Recursion):** Dynamic programming is recursion with memory. The recursive structure is identical — the difference is that results are stored so subproblems are never re-solved.

**From LAB-025 (Hash Tables):** Memoization stores results in a Map keyed by input. Hash table O(1) lookup makes memoization efficient.

**From LAB-033 Prerequisite — LAB-032 (Searching):** We build intuition about when precomputation (sorting, memoizing) pays off. Memoization is precomputation stored during computation.

---

> **Quick Check — try to answer before reading:**
>
> 1. How many function calls does a naive recursive `fib(5)` make?
> 2. What does "overlapping subproblems" mean? Give an example.
> 3. What does "optimal substructure" mean? Give an example.
>
> *(Answers at the end of this lab)*

---

## The Lesson

---

### Step 1 — The Exponential Problem: Naive Fibonacci

**The code:**

```js
function fibNaive(n) {
  if (n <= 1) return n;
  return fibNaive(n - 1) + fibNaive(n - 2);
}
```

**The walkthrough — call tree for `fib(5)`:**

```
fib(5)
├── fib(4)
│   ├── fib(3)
│   │   ├── fib(2)
│   │   │   ├── fib(1) → 1
│   │   │   └── fib(0) → 0
│   │   └── fib(1) → 1
│   └── fib(2)            ← DUPLICATE
│       ├── fib(1) → 1
│       └── fib(0) → 0
└── fib(3)                ← DUPLICATE
    ├── fib(2)            ← DUPLICATE
    │   ├── fib(1) → 1
    │   └── fib(0) → 0
    └── fib(1) → 1
```

`fib(2)` is computed 3 times. `fib(3)` is computed twice. For `fib(40)`, `fib(2)` is computed 165,580,141 times. The total call count for `fib(n)` is approximately 2^n — **exponential**.

```js
// Demonstrating the blow-up:
let callCount = 0;
function fibCounted(n) {
  callCount++;
  if (n <= 1) return n;
  return fibCounted(n - 1) + fibCounted(n - 2);
}

callCount = 0; fibCounted(10);  console.log(callCount);  // 177
callCount = 0; fibCounted(20);  console.log(callCount);  // 21891
callCount = 0; fibCounted(30);  console.log(callCount);  // 2692537
callCount = 0; fibCounted(40);  console.log(callCount);  // 331160281 — takes seconds
```

**The CS lens — overlapping subproblems:** The same subproblem (e.g., `fib(3)`) is solved multiple times by different parts of the recursion tree. This is the defining property that makes dynamic programming applicable. If every subproblem were unique, there would be nothing to gain by storing results.

---

### Step 2 — Memoization: Top-Down Dynamic Programming

**The problem this step solves:** Solve each subproblem exactly once by storing its result the first time it is computed.

**The code:**

```js
function fibMemoized(n, memo = new Map()) {
  if (n <= 1) return n;
  if (memo.has(n)) return memo.get(n);   // O(1) lookup — already solved

  const result = fibMemoized(n - 1, memo) + fibMemoized(n - 2, memo);
  memo.set(n, result);                   // store before returning
  return result;
}
```

**The walkthrough — call tree for `fib(5)` with memoization:**

```
fib(5, {})
├── fib(4, {})
│   ├── fib(3, {})
│   │   ├── fib(2, {})
│   │   │   ├── fib(1) → 1
│   │   │   └── fib(0) → 0
│   │   │   memo: {2→1}
│   │   └── fib(1) → 1
│   │   memo: {2→1, 3→2}
│   └── fib(2) → 1  ← CACHE HIT
│   memo: {2→1, 3→2, 4→3}
└── fib(3) → 2       ← CACHE HIT
memo: {2→1, 3→2, 4→3, 5→5}
Result: 5
```

Total unique calls: 5 (one per n from 1 to 5). Total with cache hits: still only 7. For `fib(40)`: 40 unique calls instead of 331 million.

**Why O(n):** Each value of n from 2 to n is computed exactly once. All subsequent calls for the same n hit the cache in O(1). Total work: n − 1 unique computations × O(1) each = O(n).

**The CS lens — memoization pattern:** Memoization is a general technique: wrap any pure function, check the cache before computing, store after computing. It works for any function whose output depends only on its input — exactly the pure functions from LAB-019.

**The SE lens — default parameter for the memo:** Passing `memo = new Map()` as a default parameter creates a fresh cache per top-level call. This is correct for independent calls. If you wanted to reuse the cache across multiple top-level calls (e.g., to answer 100 Fibonacci queries efficiently), you would create the Map outside the function and pass it in explicitly.

---

### Step 3 — Tabulation: Bottom-Up Dynamic Programming

**The problem this step solves:** Build the solution from the smallest subproblems upward, without recursion.

```js
function fibTabulated(n) {
  if (n <= 1) return n;

  const table = new Array(n + 1);
  table[0] = 0;
  table[1] = 1;

  for (let index = 2; index <= n; index++) {
    table[index] = table[index - 1] + table[index - 2];
  }

  return table[n];
}
```

**The walkthrough for `fib(6)`:**

table[0] = 0, table[1] = 1.
index=2: table[2] = 1 + 0 = 1.
index=3: table[3] = 1 + 1 = 2.
index=4: table[4] = 2 + 1 = 3.
index=5: table[5] = 3 + 2 = 5.
index=6: table[6] = 5 + 3 = 8. Return 8. ✓

**Space optimisation:** Fibonacci only needs the two most recent values. No need to store the entire table:

```js
function fibOptimal(n) {
  if (n <= 1) return n;
  let previous = 0;
  let current  = 1;
  for (let step = 2; step <= n; step++) {
    const next = previous + current;
    previous = current;
    current  = next;
  }
  return current;
}
```

This is O(n) time and O(1) space — the best possible for this problem.

**Top-down vs Bottom-up:**

| | Memoization (top-down) | Tabulation (bottom-up) |
|---|---|---|
| Order | Computes only needed subproblems | Computes all subproblems |
| Stack use | Uses recursion stack | No recursion |
| Easier to derive | Often yes — mirrors the recurrence | Requires identifying fill order |
| Stack overflow risk | For very large n | None |

---

### Step 4 — Coin Change: A Classic DP Problem

**The problem:** Given coin denominations and a target amount, find the minimum number of coins needed to reach the amount. Return -1 if it is impossible.

**Why DP applies:** Optimal substructure — the minimum coins for amount `a` is `1 + min(coins needed for a − coin)` for each coin denomination. Overlapping subproblems — the same amount appears as a sub-target of many larger amounts.

**The code:**

```js
function coinChange(denominations, targetAmount) {
  // table[amount] = minimum coins needed for that amount
  const table = new Array(targetAmount + 1).fill(Infinity);
  table[0] = 0;   // zero coins needed for amount zero

  for (let amount = 1; amount <= targetAmount; amount++) {
    for (const coin of denominations) {
      if (coin <= amount && table[amount - coin] + 1 < table[amount]) {
        table[amount] = table[amount - coin] + 1;
      }
    }
  }

  return table[targetAmount] === Infinity ? -1 : table[targetAmount];
}
```

**The walkthrough — coins `[1, 5, 6, 9]`, target `11`:**

table[0]=0. All others start at Infinity.

table[1]: coin 1 ≤ 1, table[0]+1=1 < Inf → table[1]=1.
table[2]: coin 1, table[1]+1=2 → table[2]=2.
...
table[5]: coin 1 → 5; coin 5, table[0]+1=1 < 5 → table[5]=1.
table[6]: coin 1, table[5]+1=2; coin 5, table[1]+1=2; coin 6, table[0]+1=1 < 2 → table[6]=1.
...
table[9]: coin 9, table[0]+1=1 → table[9]=1.
table[10]: coin 1, table[9]+1=2; coin 9, table[1]+1=2 → table[10]=2.
table[11]: coin 1, table[10]+1=3; coin 5, table[6]+1=2; coin 6, table[5]+1=2; coin 9, table[2]+1=3 → table[11]=2.

Return 2. Optimal: 5+6=11 or 9+... wait, 9+2=11 takes 3 coins (9+1+1). 5+6=11 takes 2. ✓

**Greedy would fail here.** Greedy takes the largest coin that fits each time: 9, then 1, 1 → 3 coins. DP finds 5+6 = 2 coins. Greedy is not optimal for all coin systems. DP guarantees the global optimum because it considers all subproblems.

```js
console.log(coinChange([1, 5, 6, 9], 11));  // 2
console.log(coinChange([2], 3));             // -1 (impossible)
console.log(coinChange([1, 2, 5], 11));      // 3 (5+5+1)
```

---

## Connect the Pieces

- **Git's diff algorithm** uses dynamic programming (the Myers diff algorithm, a form of LCS — longest common subsequence). Every `git diff` output is DP in action.
- **String edit distance (Levenshtein)** — how many insertions, deletions, and substitutions to transform one string into another — is a classic DP problem used in spell checkers, DNA sequencing, and fuzzy search.
- **React's reconciliation** uses a DP-inspired heuristic to diff virtual DOM trees efficiently.
- **Shortest path in weighted graphs** — Bellman-Ford is DP on the graph; Dijkstra is a greedy algorithm that happens to be optimal for non-negative weights (LAB-135).

---

## What Breaks Without This

**Forgetting to seed the table correctly:**

```js
function buggyTabulation(n) {
  const table = new Array(n + 1).fill(0);  // BUG: table[1] should be 1, not 0
  for (let index = 2; index <= n; index++) {
    table[index] = table[index - 1] + table[index - 2];
  }
  return table[n];
}

buggyTabulation(6);  // returns 0 — every entry stays 0 because table[1]=0
```

Every Fibonacci number comes out as 0. DP correctness depends entirely on the base cases. In tabulation, seeding `table[0]` and `table[1]` correctly is the equivalent of the recursion base case. An incorrect seed propagates through every computed entry.

---

## Definition of Done

- [ ] `fibNaive(10)` returns 55
- [ ] `fibMemoized(40)` returns instantly (< 1ms) and returns the correct value (102334155)
- [ ] `fibTabulated(40)` produces the same result
- [ ] `fibOptimal(40)` produces the same result in O(1) space
- [ ] `coinChange([1,5,6,9], 11)` returns 2
- [ ] `coinChange([2], 3)` returns -1
- [ ] You can explain: what are the two properties that make a problem suitable for dynamic programming?

**Git commit:**

```
git add src/
git commit -m "LAB-033: memoization turns O(2^n) Fibonacci to O(n); DP overlapping-subproblems + optimal-substructure properties demonstrated with Fibonacci and coin change"
```

---

## Quick Check Answers

1. **15 calls.** `fib(5)` makes 15 calls total. The call count follows `calls(n) = calls(n-1) + calls(n-2) + 1`. This grows like the Fibonacci sequence itself — exponentially.
2. **The same smaller problem is needed by multiple larger problems.** Example: to compute `fib(10)`, you need `fib(8)` via `fib(9)` AND `fib(8)` via the direct `fib(8)` call — the same subproblem appears in two different branches of the recursion tree.
3. **The optimal solution to a problem contains the optimal solutions to its subproblems.** Example: the shortest path from A to C through B is the shortest path from A to B PLUS the shortest path from B to C. If either of those sub-paths were not optimal, you could replace it and get a shorter total path — a contradiction. This property allows DP to build globally optimal solutions from locally optimal subproblem solutions.
