---
concept: 066-optimal-substructure
name: Optimal Substructure
---

## Definition

A problem has optimal substructure when an optimal solution to the whole
problem can be built directly from optimal solutions to its subproblems — you
never need a *non-optimal* subproblem answer to build the best overall answer.

## Problem

Dynamic programming (and greedy algorithms) both depend on this being true.
Without it, a recurrence like `dp[i] = best of (subproblem answers)` isn't
just slow to write correctly — it's **wrong**, no matter how carefully it's
implemented or how thoroughly it's cached.

## Execution

House Robber's recurrence is a direct example: `dp[i]` is "the most money
collectible from houses `0..i`, no two adjacent." Every `dp[i]` is built from
exactly two smaller answers:

dp[i] = max( dp[i-1],  dp[i-2] + nums[i] )
          ^ skip house i        ^ rob house i, plus the best from i-2 and earlier

For this to be correct, `dp[i-1]` and `dp[i-2]` must each already be the
**optimal** (best possible) answer for their own sub-range — not just *some*
valid arrangement of robbed houses. If `dp[i-2]` were merely a decent-but-not-best
answer, adding `nums[i]` to it could produce a total that looks fine but is
provably less than the true optimum — the recurrence would silently return a
wrong answer while still "running successfully." Optimal substructure is what
guarantees that never happens: the best answer to `0..i` truly is available by
combining the best answers to `0..i-1` and `0..i-2`, nothing more is needed.

## Computer Science

This is Bellman's principle of optimality, stated informally. A clean way to
see it can fail: shortest-path in a graph has optimal substructure (the
shortest path from A to C through B is the shortest A→B path plus the
shortest B→C path) — but **longest simple path** (no repeated vertices) does
not, because the longest path to an intermediate vertex might use up a vertex
that the extension onward also needed, so it doesn't compose the way shortest
path does.

Tags: Bellman's principle of optimality, Greedy algorithms, Recurrence relations, Correctness proofs, Graph theory

## Software Engineering

Verify this *before* writing any caching code around a recurrence — a
memoized or tabulated implementation of a recurrence that lacks optimal
substructure will run fast and pass casual testing while still being wrong on
inputs the tests didn't happen to cover. A correct cache around a wrong
recurrence just produces fast wrong answers instead of slow wrong answers.

Tags: Design before implementation, Correctness, Recurrence design, Debugging DP

## Common Mistakes

- Assuming any problem that can be broken into subproblems has optimal substructure — it needs the *stronger* property that optimal sub-answers compose into the optimal whole answer, which isn't automatic.
- Treating passing test cases as proof the recurrence itself is correct, rather than independently justifying why the recurrence must hold (as in the Execution section above).
- Reaching for a greedy algorithm on a problem that has optimal substructure but lacks the additional "greedy-choice property" it also needs — dynamic programming, trying every relevant option rather than committing to one, is the safer fallback.

## Exercises

- For House Robber: if `dp[i-2]` weren't actually the optimal answer for houses `0..i-2`, would `dp[i]` still be guaranteed optimal? Walk through why not, using a small concrete example.
- State House Robber's recurrence in one sentence and name the two smaller subproblems it reuses.
- Sketch a small graph (4-5 vertices) and find a case where the longest simple path to an intermediate vertex does *not* extend into the overall longest simple path.

## javascript

```javascript
function houseRobber(nums) {
  const dp = new Array(nums.length)
  dp[0] = nums[0]
  dp[1] = Math.max(nums[0], nums[1])
  for (let i = 2; i < nums.length; i++) {
    dp[i] = Math.max(dp[i - 1], dp[i - 2] + nums[i])
  }
  console.log(dp)
  return dp[dp.length - 1]
}

console.log(houseRobber([2, 7, 9, 3, 1]))   // 12
```
Walkthrough: printing `dp` (`[2, 7, 11, 11, 12]`) makes the composition
visible — `dp[2] = 11` comes from `dp[0] + 9`, and `dp[4] = 12` comes from
`dp[2] + 1`, each time reusing an already-optimal smaller answer rather than
recomputing anything.

## python

```python
def house_robber(nums):
    dp = [0] * len(nums)
    dp[0] = nums[0]
    dp[1] = max(nums[0], nums[1])
    for i in range(2, len(nums)):
        dp[i] = max(dp[i - 1], dp[i - 2] + nums[i])
    print(dp)
    return dp[-1]

print(house_robber([2, 7, 9, 3, 1]))   # 12
```
Walkthrough: identical composition to the JavaScript version — `dp` printed
as `[2, 7, 11, 11, 12]`, the same optimal-subproblem reuse visible directly in
the output.
