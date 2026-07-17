---
concept: 118-branch-and-bound
name: Branch and Bound
---

## Definition

Branch and Bound explores a space of possible solutions like Backtracking,
but additionally computes an optimistic "bound" on the best possible
result from a partial solution, pruning any branch whose bound is already
worse than the best complete solution found so far.

## Problem

Backtracking prunes branches only once they're provably invalid — but for
optimization problems (find the cheapest or best solution, not just *a*
valid one), many branches are valid but simply worse than a solution
already found, and exploring them fully wastes time even though they'd
never win. Branch and Bound prunes those too, using a bound to prove a
branch can't possibly beat the current best before fully exploring it.

## Execution

Find the minimum-cost way to complete a partial route, having already
spent $50 with a best-known complete solution costing $100
↓
At a partial route costing $50 so far, compute an optimistic lower bound
on however much more it could possibly cost to finish (say, $40 minimum
more) — best-case total for this branch: $90
↓
$90 < $100 (current best) — this branch MIGHT still beat the best found so
far — keep exploring it
↓
At a DIFFERENT partial route costing $70 so far, with a lower bound of $40
more — best-case total: $110
↓
$110 > $100 (current best) — even in the best case, this branch can't beat
what's already been found — PRUNE it immediately, without exploring further

## Computer Science

The bound must be a genuine, provable limit on how good that branch could
possibly get (an admissible bound) — if the bound were merely a guess,
pruning based on it could incorrectly discard the actual optimal solution.
A valid bound guarantees that pruning never loses the true optimum, only
branches that are mathematically guaranteed to be worse.

Tags: Admissible bound, Pruning, Optimization, Search space reduction

## Software Engineering

This is the standard technique for combinatorial optimization problems —
the traveling salesman problem, the knapsack problem when solved exactly
rather than approximately — where the search space is too large for brute
force, but Dynamic Programming's overlapping-subproblems structure doesn't
cleanly apply either.

Tags: Traveling salesman problem, Combinatorial optimization, Knapsack problem

## Common Mistakes

- Using a bound that isn't actually a genuine limit on the branch's best possible outcome — an unsound bound can prune away the true optimal solution, silently producing a wrong answer instead of just a slow one.
- Forgetting to update "best solution found so far" as soon as a better complete solution is found — the bound comparison is only useful against the best complete solution actually known at that point in the search.

## Exercises

- Trace by hand a small branch-and-bound search where two branches have the same partial cost but different bounds, and confirm only the promising one continues.
- Compare Branch and Bound against plain Backtracking on the same optimization problem — identify one branch plain backtracking would fully explore that branch and bound prunes early.

## javascript

```javascript
function branchAndBoundMinCost(partialCost, remainingBoundEstimate, bestSoFar) {
  const optimisticTotal = partialCost + remainingBoundEstimate
  if (optimisticTotal >= bestSoFar) {
    return { pruned: true, reason: `optimistic total ${optimisticTotal} can't beat best ${bestSoFar}` }
  }
  return { pruned: false, reason: `optimistic total ${optimisticTotal} might still improve on ${bestSoFar}` }
}

console.log(branchAndBoundMinCost(50, 40, 100))   // pruned: false — 90 < 100, worth exploring
console.log(branchAndBoundMinCost(70, 40, 100))   // pruned: true — 110 >= 100, skip this branch
```
Walkthrough: `optimisticTotal` is the best this branch could possibly
achieve, assuming everything remaining goes perfectly. If even that
best-case total can't beat the best complete solution already found, the
whole branch is skipped — no need to explore any of its sub-branches in
detail, since none of them could possibly do better than this bound
already proves is impossible.

## python

```python
def branch_and_bound_min_cost(partial_cost, remaining_bound_estimate, best_so_far):
    optimistic_total = partial_cost + remaining_bound_estimate
    if optimistic_total >= best_so_far:
        return {'pruned': True, 'reason': f"optimistic total {optimistic_total} can't beat best {best_so_far}"}
    return {'pruned': False, 'reason': f'optimistic total {optimistic_total} might still improve on {best_so_far}'}


print(branch_and_bound_min_cost(50, 40, 100))   # pruned: False -- 90 < 100, worth exploring
print(branch_and_bound_min_cost(70, 40, 100))   # pruned: True -- 110 >= 100, skip this branch
```
Walkthrough: identical bound-comparison mechanics as the JavaScript
version — a branch is only explored further if its optimistic best-case
total genuinely has a chance of improving on the best complete solution
already found.
