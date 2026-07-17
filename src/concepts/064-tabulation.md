---
concept: 064-tabulation
name: Tabulation (Bottom-Up DP)
---

## Definition

Tabulation builds the answer iteratively by filling a table from the smallest
subproblem up to the largest, so every entry is computed using only entries
that are already filled in before it — no recursion at all.

## Problem

Memoization (see that concept) still recurses — it pays call-stack overhead
per call, and on a deep enough input can overflow the stack entirely.
Tabulation inverts the direction: start at the base case(s), loop forward
filling each cell in order, and stop once the target cell is filled.

## Execution

Same problem as the Memoization concept — Fibonacci — solved the opposite direction:

Create dp array of size 6, fill dp[0] = 0, dp[1] = 1  (base cases)
↓
i = 2: dp[2] = dp[1] + dp[0] = 1 + 0 = 1
↓
i = 3: dp[3] = dp[2] + dp[1] = 1 + 1 = 2
↓
i = 4: dp[4] = dp[3] + dp[2] = 2 + 1 = 3
↓
i = 5: dp[5] = dp[4] + dp[3] = 3 + 2 = 5
↓
Return dp[5] = 5

No call stack ever grows beyond the current loop iteration — compare this to
the Memoization concept's trace of the exact same problem, where `fib(5)`
first cascades all the way down to `fib(0)` before anything returns.

## Computer Science

This is "bottom-up dynamic programming." The fill order matters: every cell's
dependencies must already be filled before that cell is reached, which is really
a topological ordering of the subproblems' dependency graph — Fibonacci's
dependency graph happens to be a simple chain, so "increasing `i`" is
automatically a valid order, but a 2D DP table (see the course-level lessons
on grid/sequence DP) needs its own fill-order rule for the same reason.

Tags: Dynamic programming, Iteration, Dependency order, Space optimization, Rolling array

## Software Engineering

Tabulation is usually preferred in production code when it applies cleanly:
no recursion-depth risk, and often easier to reason about performance since
the loop bounds are explicit. It also enables a further "rolling array"
optimization that recursion-plus-cache can't do as naturally — if the
recurrence only ever looks back a fixed number of steps (Fibonacci only needs
the last two), the full array can be replaced with just that many variables,
dropping memory from O(n) to O(1).

Tags: Stack safety, Performance, Space optimization, Iterative refactor

## Common Mistakes

- Filling cells out of order — writing `dp[i]` before `dp[i-1]` has actually been filled, reading a leftover/uninitialized value instead of the real one.
- Off-by-one table sizing — forgetting the extra slot needed for a base case (e.g. allocating size `n` when the recurrence needs indices up to `n` inclusive, requiring size `n+1`).
- Initializing only some of the base cases the recurrence actually reads from, leaving a gap the loop later reads as `undefined`/`None`.
- Assuming tabulation always beats memoization on efficiency — when a problem only ever needs a small fraction of the full subproblem space, memoization can end up doing strictly less total work than filling every table cell.

## Exercises

- Shift the loop's starting bound by one (start at `i = 1` instead of `i = 2`) and observe the resulting off-by-one bug.
- Rewrite the Fibonacci example using two rolling variables (`prev`, `prevPrev`) instead of a full array; confirm it produces the identical output.
- Print the fully-filled table at the end and manually trace which two earlier cells each entry depended on.

## javascript

```javascript
function fib(n) {
  const dp = new Array(n + 1)
  dp[0] = 0
  dp[1] = 1
  for (let i = 2; i <= n; i++) {
    dp[i] = dp[i - 1] + dp[i - 2]
    console.log(`dp[${i}] = dp[${i-1}] + dp[${i-2}] = ${dp[i]}`)
  }
  return dp[n]
}

console.log(fib(5))   // 5
```
Walkthrough: the array is allocated once, the two base cases are written
directly (no recursion), and the loop fills `dp[2]` through `dp[5]` in strictly
increasing order — each iteration reads two already-filled cells and writes
the next one, matching the Execution trace above exactly.

## python

```python
def fib(n):
    dp = [0] * (n + 1)
    dp[0] = 0
    dp[1] = 1
    for i in range(2, n + 1):
        dp[i] = dp[i - 1] + dp[i - 2]
        print(f"dp[{i}] = dp[{i-1}] + dp[{i-2}] = {dp[i]}")
    return dp[n]

print(fib(5))   # 5
```
Walkthrough: identical fill order and identical output to the JavaScript
version. This is the same underlying problem as the Memoization concept's
`fib(5)` example — comparing the two side by side is the fastest way to see
that memoization and tabulation are two different techniques for the same
recurrence, not two different problems.
