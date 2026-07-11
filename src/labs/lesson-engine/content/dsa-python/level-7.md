---
series: dsa-python
level: 7
title: Recursion
lang: python
---

# Recursion

A recursive function solves a problem by calling itself on a smaller version of the
same problem. Every recursive solution has two parts: the base case (the smallest
version of the problem with a known answer) and the recursive case (the reduction from
the current problem to the smaller one). Recursion is not just a technique — it is the
natural way to express any problem whose solution is defined in terms of itself.

## Base Case and Recursive Case

Recursion works because each call reduces the problem. The call stack grows as
Python evaluates each nested call, then unwinds as each call returns. The base case
stops the recursion. Without it, the function calls itself forever until Python raises
`RecursionError`.

Factorial is the canonical example: `n! = n × (n-1)!`, with `0! = 1` as the base case.

```python
def factorial(n):
    if n == 0:       # base case — stop here
        return 1
    return n * factorial(n - 1)   # recursive case — reduce n by 1

print(factorial(0))   # 1
print(factorial(4))   # 24  (4 × 3 × 2 × 1)
print(factorial(6))   # 720
```

**CS lens:** Each call to `factorial(n)` pushes a stack frame onto the call stack.
`factorial(4)` pushes frames for 4, 3, 2, 1, 0 — five frames total. Then each returns
its value to the caller above it. The call stack IS the recursion's memory: it holds
every intermediate `n` until all results are multiplied together on the way back up.

**SE lens:** The recursive definition mirrors the mathematical definition of factorial
exactly: `factorial(n) = n * factorial(n-1)`, `factorial(0) = 1`. When a problem has
a recursive mathematical definition, recursion is often the clearest implementation.
The code reads like a proof.

Recursion can solve structural problems too. Summing all elements in a nested list —
a list that may contain other lists — is natural recursively: sum the non-list elements
directly, and recurse into any nested lists.

```python
def deep_sum(values):
    total = 0
    for item in values:
        if isinstance(item, list):
            total += deep_sum(item)   # recurse into nested list
        else:
            total += item
    return total

print(deep_sum([1, [2, 3], [4, [5, 6]]]))   # 21
print(deep_sum([10, [20, [30]]]))            # 60
```

## Challenge: factorial

Write `factorial(n)` that returns `n!` for any non-negative integer `n`.
`0! = 1` by definition. Use recursion.

```challenge
def factorial(n):
    pass
```

```test
assert factorial(0) == 1
assert factorial(1) == 1
assert factorial(5) == 120
assert factorial(7) == 5040
assert factorial(10) == 3628800
```

## Memoization

Naive recursion recomputes the same subproblems repeatedly. Fibonacci is the
textbook example: `fib(5)` calls `fib(4)` and `fib(3)`; `fib(4)` also calls `fib(3)`.
`fib(3)` is computed twice — and the duplication compounds exponentially. The
naive implementation is O(2^n).

Memoization caches results: before computing, check the cache. If the answer is already
there, return it immediately. This reduces Fibonacci from O(2^n) to O(n).

```python
def fib_naive(n):
    if n <= 1:
        return n
    return fib_naive(n - 1) + fib_naive(n - 2)

# fib_naive(40) takes seconds — exponential blowup

def fib_memo(n, cache={}):
    if n in cache:
        return cache[n]        # cache hit — return immediately
    if n <= 1:
        return n
    cache[n] = fib_memo(n - 1, cache) + fib_memo(n - 2, cache)
    return cache[n]

print(fib_memo(40))    # 102334155  — instant
print(fib_memo(100))   # 354224848179261915075  — still instant
```

**CS lens:** This is dynamic programming via top-down memoization. The problem has
two properties that make memoization applicable: overlapping subproblems (the same
`fib(k)` appears in multiple branches) and optimal substructure (the answer to the
big problem depends only on the answers to the subproblems, not on how you got there).
Bottom-up DP (Level 10) builds the cache iteratively instead of recursively.

**SE lens:** `functools.lru_cache` is Python's built-in decorator for memoization.
It handles the cache automatically and avoids the mutable default argument pattern
(`cache={}`), which has a subtle footgun: the default dict is shared across all calls
to the function and persists between calls. Using `lru_cache` is cleaner.

```python
from functools import lru_cache

@lru_cache(maxsize=None)
def fib(n):
    if n <= 1:
        return n
    return fib(n - 1) + fib(n - 2)

print(fib(50))   # 12586269025
print(fib(100))  # 354224848179261915075
```

## Challenge: fibonacci with memoization

Write `fib(n)` that returns the nth Fibonacci number using memoization. The Fibonacci
sequence starts `0, 1, 1, 2, 3, 5, 8, 13, ...` — `fib(0) = 0`, `fib(1) = 1`,
`fib(n) = fib(n-1) + fib(n-2)` for `n >= 2`. The solution must handle `n = 50`
in under a second — naive recursion will not.

```challenge
def fib(n):
    pass
```

```test
assert fib(0) == 0
assert fib(1) == 1
assert fib(6) == 8
assert fib(10) == 55
assert fib(50) == 12586269025
```
