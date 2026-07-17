---
concept: 065-overlapping-subproblems
name: Overlapping Subproblems
---

## Definition

A problem has overlapping subproblems when solving it recursively requires
solving the **exact same** smaller subproblem more than once, reached through
different call paths.

## Problem

Without recognizing this, naive recursion silently redoes identical work at
exponential cost. Recognizing it is also what tells you a cache
(memoization/tabulation) will actually help — if a recursive breakdown never
revisits the same subproblem twice, caching has nothing to catch and buys
nothing.

## Execution

Naive recursive `fib(6)`, with a call counter keyed by argument:

Call fib(6)
↓
fib(6) needs fib(5) and fib(4) — both new, first time seen
↓
...expanding fib(5) needs fib(4) and fib(3) — **fib(4) is now needed a 2nd time**, via a different path than fib(6)'s direct call
↓
...expanding fib(4) (either occurrence) needs fib(3) and fib(2) — **fib(3) ends up needed 3 separate times** total across the whole tree
↓
By the time fib(6) finishes: fib(3) was called 3 times, fib(4) was called 2 times,
fib(2) was called 5 times, fib(1) was called 8 times, fib(0) was called 5 times —
25 calls total to answer one question, `fib(6) = 8`.

Every one of those repeat calls computes the identical answer every time —
`fib(3)` is `2` on all three occasions — pure wasted work.

## Computer Science

Contrast this against genuine divide-and-conquer, like merge sort: splitting
an array in half and recursing on each half never revisits the same
sub-array twice — every recursive call operates on a distinct slice. The real
dependency structure of a problem *with* overlapping subproblems is a
directed acyclic graph (DAG) of subproblems, not a tree — the recursion tree
just draws the same DAG node more than once.

Tags: Recursion tree, Divide and conquer, DAG, Exponential blowup, Dynamic programming

## Software Engineering

In practice, this is usually discovered by profiling a slow recursive
function and noticing the same arguments recurring far more often than seems
reasonable — not by spotting it from the problem statement up front. That
profiling instinct ("wait, why is this argument showing up so many times?")
is the practical trigger for reaching for memoization or tabulation.

Tags: Profiling, Performance debugging, Recognizing DP problems

## Common Mistakes

- Assuming every recursive function has overlapping subproblems — most divide-and-conquer algorithms (merge sort, quicksort's partitioning) don't, and memoizing them wastes memory tracking arguments that never repeat.
- Confusing "this function gets called many times" with "this function gets called many times with the *same* arguments" — only the second one is overlapping subproblems; the first is true of almost every recursive function.
- Trying to fix exponential blowup by optimizing constant factors or waiting longer, instead of recognizing the repeated-subproblem pattern and caching.

## Exercises

- Add a call-count map (keyed by argument) to naive recursive `fib`; print the counts after computing `fib(6)` and confirm they match the Execution trace above.
- Run the same call-counting experiment on a merge sort implementation; confirm every call receives a distinct sub-array — no argument repeats.
- Before running anything, predict naive `fib(10)`'s total call count, then run the counter and compare.

## javascript

```javascript
const calls = {}

function fib(n) {
  calls[n] = (calls[n] || 0) + 1
  if (n <= 1) return n
  return fib(n - 1) + fib(n - 2)
}

console.log(fib(6))     // 8
console.log(calls)      // { '0': 5, '1': 8, '2': 5, '3': 3, '4': 2, '5': 1, '6': 1 }
```
Walkthrough: `calls` tracks how many times each distinct argument is seen
across the whole recursion (JavaScript objects always iterate integer-like
keys in ascending numeric order, regardless of insertion order — which is why
`calls` prints from `'0'` up to `'6'` even though `fib(6)` was called first).
`fib(3)` shows up 3 times, `fib(2)` shows up 5 times — direct, printed
evidence of the same subproblem being solved repeatedly, not just an
assertion in prose.

## python

```python
calls = {}

def fib(n):
    calls[n] = calls.get(n, 0) + 1
    if n <= 1:
        return n
    return fib(n - 1) + fib(n - 2)

print(fib(6))     # 8
print(calls)       # {6: 1, 5: 1, 4: 2, 3: 3, 2: 5, 1: 8, 0: 5}
```
Walkthrough: identical counts to the JavaScript version — the repeated-argument
pattern is a fact about the recursion's shape, not about which language
executes it.
