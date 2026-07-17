---
concept: 111-backtracking
name: Backtracking
---

## Definition

Backtracking builds a solution incrementally, abandoning a partial solution
the moment it becomes clear it can't possibly lead to a valid complete
answer, instead of continuing to build on top of a doomed choice.

## Problem

Trying every possible complete combination to find valid solutions wastes
enormous effort continuing to build on top of a choice that was already
invalid partway through. Backtracking checks validity as early as
possible, abandoning bad partial solutions immediately rather than
wastefully completing them.

## Execution

Place queens on a chessboard, one column at a time, so no two attack each other
↓
Place a queen in column 1, row 1 — valid so far
↓
Try column 2, row 1: conflicts (same row) — try row 2: conflicts (diagonal) — BACKTRACK, try row 3: valid so far
↓
Try column 3: every row conflicts with the two queens already placed — dead end
↓
BACKTRACK all the way to column 2, try the NEXT untried row there instead,
continuing the search from there

## Computer Science

Backtracking is a refinement of brute-force search — it still explores the
same space of possibilities, but prunes entire branches early the instant a
partial solution is provably invalid, rather than needing to complete a
doomed branch before checking it. This is often visualized as a decision
tree where invalid branches are cut off as soon as they're recognized as
dead ends.

Tags: Pruning, Decision tree, Exhaustive search, Constraint satisfaction

## Software Engineering

This is the standard technique for constraint-satisfaction problems
(N-Queens, Sudoku solving, generating valid parenthesizations) — problems
where a solution is built piece by piece and each piece can be checked for
validity against the constraints as soon as it's placed, rather than only
at the very end.

Tags: Constraint satisfaction, N-Queens, Sudoku, Combinatorial search

## Common Mistakes

- Checking validity only once a solution is FULLY built, instead of checking as early as possible — this wastes time completing branches that were already doomed several steps earlier.
- Forgetting to properly "undo" a choice when backtracking — if placing a queen mutates shared state, failing to remove it before trying the next option corrupts every subsequent attempt.

## Exercises

- Solve 4-Queens by hand (or trace through the code) and count how many placements get tried in total, compared to trying every possible arrangement blindly.
- Modify the example to solve for a different board size and confirm it still finds a valid arrangement.

## javascript

```javascript
function solveNQueens(n) {
  const cols = new Set(), diag1 = new Set(), diag2 = new Set()
  const positions = []

  function backtrack(row) {
    if (row === n) return true
    for (let col = 0; col < n; col++) {
      if (cols.has(col) || diag1.has(row - col) || diag2.has(row + col)) continue   // prune: conflict
      cols.add(col); diag1.add(row - col); diag2.add(row + col)
      positions.push(col)
      if (backtrack(row + 1)) return true
      cols.delete(col); diag1.delete(row - col); diag2.delete(row + col)   // undo — backtrack
      positions.pop()
    }
    return false
  }

  backtrack(0)
  return positions
}

console.log(solveNQueens(4))   // [ 1, 3, 0, 2 ] — a valid arrangement for 4-Queens
```
Walkthrough: `backtrack` tries each column for the current row, immediately
skipping (pruning) any column that conflicts with an already-placed queen
— no wasted effort completing a doomed arrangement. If a full row of
choices leads to a dead end later, the delete/pop lines undo that choice
before trying the next option, which is the "backtrack" step itself.

## python

```python
def solve_n_queens(n):
    cols, diag1, diag2 = set(), set(), set()
    positions = []

    def backtrack(row):
        if row == n:
            return True
        for col in range(n):
            if col in cols or (row - col) in diag1 or (row + col) in diag2:
                continue   # prune: conflict
            cols.add(col); diag1.add(row - col); diag2.add(row + col)
            positions.append(col)
            if backtrack(row + 1):
                return True
            cols.discard(col); diag1.discard(row - col); diag2.discard(row + col)   # undo -- backtrack
            positions.pop()
        return False

    backtrack(0)
    return positions


print(solve_n_queens(4))   # [1, 3, 0, 2] -- a valid arrangement for 4-Queens
```
Walkthrough: identical prune-and-undo mechanics as the JavaScript version —
each column is tried and immediately rejected if it conflicts with an
existing queen, and a dead end causes the most recent placement to be
undone before trying the next option.
