---
concept: 067-big-o-notation
name: Big-O Notation
---

## Definition

Big-O notation describes how an algorithm's running time or memory use grows
as its input size grows, focusing on the dominant trend as input size
increases without bound — not the exact operation count on any one input.

## Problem

Two algorithms can look equally fast on a small test input, then behave
completely differently as input grows — one taking milliseconds at a
thousand items and hours at a million, the other scaling gracefully. Big-O
gives a precise, hardware-independent language for describing and comparing
that growth trend directly, instead of comparing raw timings that depend on
whatever machine happened to run the test.

## Execution

A single loop over n items: `for i in 0..n: doSomething()`
↓
n = 10   → 10 operations
↓
n = 100  → 100 operations
↓
n = 1000 → 1000 operations
↓
Operations grow exactly in proportion to n — this is **O(n)**, linear time

Compare a nested loop: `for i in 0..n: for j in 0..n: doSomething()`
↓
n = 10   → 100 operations
↓
n = 100  → 10,000 operations
↓
n = 1000 → 1,000,000 operations
↓
Operations grow with n² — this is **O(n²)**, quadratic time

Counting operations this way is a property of the algorithm's own structure,
not of how any particular language executes it — the growth pattern is
identical no matter which language the loop is written in.

## Computer Science

Big-O describes an upper bound on growth rate, ignoring constant factors and
lower-order terms — O(2n + 5) and O(n) are the same complexity class, because
as n grows without bound, the constant factor and the "+5" become
irrelevant next to the dominant n term. Common classes, in increasing order
of growth: O(1) constant, O(log n) logarithmic, O(n) linear, O(n log n)
linearithmic, O(n²) quadratic, O(2ⁿ) exponential.

Tags: Asymptotic analysis, Growth rate, Complexity classes, Amortized analysis

## Software Engineering

This matters in practice once input sizes get large enough that the growth
rate — not the constant factor — dominates actual wall-clock time. An
O(n²) algorithm can easily outperform an O(n log n) one for small n, since
constants and overhead matter more there; the crossover point where the
asymptotically better algorithm actually wins is often smaller than
intuition suggests, and only measuring at realistic input sizes reveals it.
Space complexity (memory growth) is analyzed with the same notation and
matters just as much as time.

Tags: Scalability, Algorithm selection, Space complexity, Premature optimization

## Common Mistakes

- Assuming a lower Big-O is always faster in practice — for small inputs, an algorithm with worse asymptotic complexity but lower constant-factor overhead can easily win; Big-O only describes the trend as n grows large, not performance at any one specific n.
- Missing hidden complexity inside a single line — a loop that calls a built-in method which is itself O(n) internally (like an array "contains" check) makes the whole enclosing loop O(n²), not O(n), even though it reads like "just one more operation."
- Forgetting to account for space complexity — an algorithm that's fast in time but uses O(n) extra memory when O(1) was achievable is a real trade-off worth naming, not a free win.

## Exercises

- Time the JavaScript example's two functions for arrays of size 100, 1,000, and 10,000 — observe how the *ratio* between their run times changes as n grows, not just the absolute times.
- Find a way to rewrite `hasDuplicatePairs` using a Set instead of a nested loop, and determine its new Big-O — is it still O(n²)?

## javascript

```javascript
function linearSearch(arr, target) {
  for (let i = 0; i < arr.length; i++) {      // O(n): visits each element once
    if (arr[i] === target) return i
  }
  return -1
}

function hasDuplicatePairs(arr) {
  for (let i = 0; i < arr.length; i++) {         // outer loop: n iterations
    for (let j = i + 1; j < arr.length; j++) {   // inner loop: up to n iterations each
      if (arr[i] === arr[j]) return true          // nested loops multiply: O(n^2) total
    }
  }
  return false
}

console.log(linearSearch([5, 3, 8, 1], 8))     // 2 — O(n)
console.log(hasDuplicatePairs([5, 3, 8, 3]))   // true — O(n^2)
```
Walkthrough: `linearSearch` visits at most `n` elements once, so its operation
count grows exactly linearly with the array size — O(n). `hasDuplicatePairs`
nests a nearly-full inner loop inside the outer one, so its operation count
grows roughly with n² — O(n²) — meaning quadrupling the input size roughly
sixteen-folds the work, not just quadruples it.

## python

```python
def linear_search(arr, target):
    for i in range(len(arr)):        # O(n): visits each element once
        if arr[i] == target:
            return i
    return -1


def has_duplicate_pairs(arr):
    for i in range(len(arr)):               # outer loop: n iterations
        for j in range(i + 1, len(arr)):    # inner loop: up to n iterations each
            if arr[i] == arr[j]:            # nested loops multiply: O(n^2) total
                return True
    return False


print(linear_search([5, 3, 8, 1], 8))       # 2 -- O(n)
print(has_duplicate_pairs([5, 3, 8, 3]))    # True -- O(n^2)
```
Walkthrough: identical growth pattern to the JavaScript version — `linear_search`'s
work grows in direct proportion to `len(arr)`, while `has_duplicate_pairs`'s
nested loop makes its work grow with the square of the input size.
