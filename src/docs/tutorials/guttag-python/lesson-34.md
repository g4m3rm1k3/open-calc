# Lesson 34: Dynamic Programming — Memoization and Tabulation

What you will build
The reader will understand dynamic programming (DP) as the technique for problems with OVERLAPPING subproblems: solve each subproblem once, cache the result, look it up when needed again. They will implement top-down (memoization) and bottom-up (tabulation) DP for Fibonacci, rod cutting, and longest common subsequence. The transferable problems: (1) DP applies when a problem has OPTIMAL SUBSTRUCTURE (the optimal solution uses optimal solutions to subproblems) and OVERLAPPING SUBPROBLEMS (the same subproblems recur); (2) top-down DP (memoization) adds a cache to a recursive solution; bottom-up DP (tabulation) computes subproblems iteratively in the right order; (3) DP often transforms O(2^n) or O(n^2) exponential to O(n) or O(n^2) polynomial.

What you need to know first
- Lessons 0–33

Terms used in this lesson
- **Dynamic Programming** — A method for solving complex problems by breaking them down into simpler subproblems, solving each of those subproblems just once, and storing their solutions. This exists to avoid the exponential time complexity of recomputing overlapping subproblems.
- **Memoization** — An optimization technique used primarily to speed up computer programs by storing the results of expensive function calls and returning the cached result when the same inputs occur again. This is a top-down approach to DP.
- **Tabulation** — A bottom-up approach to dynamic programming where a table is built iteratively to store the results of subproblems from the smallest to the largest, avoiding the overhead of recursive call stacks.
- **Overlapping Subproblems** — A property of a problem where any recursive algorithm solving the problem solves the same subproblems over and over, rather than generating new subproblems. DP is designed to take advantage of this property.
- **Optimal Substructure** — A property of a problem where its optimal solution can be constructed efficiently from optimal solutions of its subproblems. This is the foundation that makes recursive definitions (and thus DP) possible.

Objects and methods used

- **`dict`**
  - What it is: A built-in Python dictionary type.
  - Implementation: Hash map.
  - Its use: To cache results of subproblems in memoization.
  - Type: Class.
  - Responsibility: Store key-value pairs with O(1) average time complexity for lookups and insertions.
  - Depends on: Hashable keys.
  - Connects to: Recursive function calls that check the dictionary before computing.
  - Shape: Internal implementation detail for caching.

- **`functools.lru_cache`**
  - What it is: A decorator to wrap a function with a memoizing callable that saves up to the maxsize most recent calls.
  - Implementation: Python decorator.
  - Its use: To automatically memoize recursive functions without managing a cache dictionary manually.
  - Type: Function / Decorator.
  - Responsibility: Cache function return values based on arguments to prevent redundant execution.
  - Depends on: Hashable arguments of the decorated function.
  - Connects to: The function it decorates and the caller of that function.
  - Shape: Public API wrapper around a function.

- **`time.time`**
  - What it is: A function that returns the time in seconds since the epoch as a floating point number.
  - Implementation: Built-in C function in Python's `time` module.
  - Its use: To measure the execution time of algorithms to compare performance.
  - Type: Function.
  - Responsibility: Provide the current system time to enable duration measurements.
  - Depends on: System clock.
  - Connects to: Timing blocks around function calls in our diagnostic scripts.
  - Shape: Diagnostic tool.

- **`max`**
  - What it is: A built-in Python function that returns the largest item in an iterable or the largest of two or more arguments.
  - Implementation: Built-in Python function.
  - Its use: To find the maximum value among different subproblem choices.
  - Type: Function.
  - Responsibility: Compare items and return the largest one.
  - Depends on: Comparable arguments.
  - Connects to: Value comparisons in recurrence relations during DP.
  - Shape: Core logic component in finding optimal substructure.

## Concept Unit: The problem with naive recursion — repeated computation

### The Problem
When we solve problems recursively, such as calculating the Fibonacci sequence, we often define the solution in terms of smaller versions of the exact same problem. The problem is that many of these smaller subproblems are identical. Without a way to remember past work, a naive recursive algorithm will recompute the same answers over and over again, leading to an exponential explosion in function calls and execution time. How can we demonstrate exactly how much wasted effort occurs? 

### Introduce the concept in isolation
We will write a naive recursive Fibonacci function and wrap it with execution time and call-count tracking to see the exponential growth in action.

```python
import time

# A global variable to track how many times the function is called
call_count = 0

def fib_counted(n):
    global call_count
    call_count += 1
    if n <= 1:
        return n
    return fib_counted(n-1) + fib_counted(n-2)

start = time.time()
result = fib_counted(20)
end = time.time()

print(f"fib(20) = {result}")
print(f"Time taken: {end - start:.4f} seconds")
print(f"Function called {call_count} times")
```

Output:
```text
fib(20) = 6765
Time taken: 0.0020 seconds
Function called 21891 times
```

This output proves that to compute `fib(20)`, the function had to be called 21,891 times. If we traced the full call tree for `fib(5)`, we would see `fib(3)` computed twice and `fib(2)` computed three times. This is the hallmark of **Overlapping Subproblems**. The number of calls grows at an O(2^n) exponential rate.

### Discard the throwaway example
We discard this tracking implementation. The naive recursive approach with global counters is just a diagnostic tool; it will not appear in our final solutions.

### Project Change
- Reference Source: No reference counterpart.
- Files affected: `fibonacci.py` (created)
- Change type: Add
- Location: N/A
- Dependencies: Python 3

### The New Code
```python
import time

def fib_naive(n):
    if n <= 1:
        return n
    return fib_naive(n-1) + fib_naive(n-2)

start = time.time()
print(fib_naive(35))
print(f'Time: {time.time()-start:.3f}s')
```

### The Updated Project
```python
# 1: import time
# 2: 
# 3: def fib_naive(n):
# 4:     if n <= 1:
# 5:         return n
# 6:     return fib_naive(n-1) + fib_naive(n-2)
# 7: 
# 8: start = time.time()
# 9: print(fib_naive(35))
# 10: print(f'Time: {time.time()-start:.3f}s')
```
This is the complete baseline project file. It defines a standard recursive Fibonacci function and times its execution for `n=35`, demonstrating the severe performance penalty of repeated computation.

### Mechanical walkthrough
- `def fib_naive(n):` defines a function taking a single integer `n`.
- `if n <= 1:` is the base case. If `n` is 0 or 1, it directly returns `n`.
- `return fib_naive(n-1) + fib_naive(n-2)` is the recursive step. It calls itself twice. Because there is no mechanism to store the result of `fib_naive(n-1)`, when `fib_naive(n-2)` is evaluated later in the tree, the exact same work is done again.
- `time.time()` captures the current time in seconds as a float. By subtracting the `start` time from a second call to `time.time()`, we compute the elapsed duration. The execution time for `n=35` is approximately 2.5 seconds, returning 9227465, which is astronomically slow for such a small input.

## Concept Unit: Memoization — top-down DP

### The Problem
We have seen that naive recursion repeats the same function calls endlessly. If the function is deterministic (it always returns the same output for the same input), we should only ever compute the answer for a given `n` once. How can we intercept a recursive call, check if we already know the answer, and return it instantly if we do?

### Introduce the concept in isolation
We will use a Python `dict` to store the results of function calls. We call this technique **Memoization**.

```python
def expensive_square(n, cache={}):
    if n in cache:
        print(f"Returning cached result for {n}")
        return cache[n]
    
    print(f"Computing result for {n}")
    result = n * n
    cache[n] = result
    return result

print(expensive_square(4))
print(expensive_square(4))
```

Output:
```text
Computing result for 4
16
Returning cached result for 4
16
```

This output proves that the actual computation (the print statement "Computing...") only runs the first time. The second time, the dictionary lookup intercepts the request and returns the saved value immediately. 

### Discard the throwaway example
We discard this isolated caching demonstration. It will not appear in the project.

### Project Change
- Reference Source: No reference counterpart.
- Files affected: `fibonacci.py` (modified)
- Change type: Add
- Location: Appended to the end of the file.
- Dependencies: None.

### The New Code
```python
def fib_memo(n, cache=None):
    if cache is None:
        cache = {}
    if n in cache:
        return cache[n]
    if n <= 1:
        return n
    result = fib_memo(n-1, cache) + fib_memo(n-2, cache)
    cache[n] = result
    return result

start = time.time()
print(fib_memo(100))
print(f'Time: {time.time()-start:.6f}s')

from functools import lru_cache

@lru_cache(maxsize=None)
def fib_lru(n):
    if n <= 1: return n
    return fib_lru(n-1) + fib_lru(n-2)

print(fib_lru(200))
```

### The Updated Project
```python
# 12: def fib_memo(n, cache=None):
# 13:     if cache is None:
# 14:         cache = {}
# 15:     if n in cache:
# 16:         return cache[n]
# 17:     if n <= 1:
# 18:         return n
# 19:     result = fib_memo(n-1, cache) + fib_memo(n-2, cache)
# 20:     cache[n] = result
# 21:     return result
# 22: 
# 23: start = time.time()
# 24: print(fib_memo(100))
# 25: print(f'Time: {time.time()-start:.6f}s')
# 26: 
# 27: from functools import lru_cache
# 28: 
# 29: @lru_cache(maxsize=None)
# 30: def fib_lru(n):
# 31:     if n <= 1: return n
# 32:     return fib_lru(n-1) + fib_lru(n-2)
# 33: 
# 34: print(fib_lru(200))
```
This adds a manual memoization implementation using a default argument and dictionary, and an automated one using Python's built-in `@lru_cache` decorator.

### Mechanical walkthrough
- `def fib_memo(n, cache=None):` defines the function with an optional `cache` parameter. We use `None` and initialize it to `{}` inside to avoid mutable default argument bugs.
- `if n in cache:` checks if the key `n` exists in our dictionary. If it does, `return cache[n]` immediately returns the saved result.
- `result = fib_memo(n-1, cache) + fib_memo(n-2, cache)` performs the recursive calls, passing the `cache` dictionary down the call stack so all recursive branches share the same memory.
- `cache[n] = result` stores the newly computed answer into the dictionary before returning it. 
- The result of `fib_memo(100)` is `354224848179261915075`, and the time is around `0.00003s`. The exponential `O(2^n)` call tree has been transformed into a Directed Acyclic Graph (DAG) with only `O(n)` nodes, because each subproblem `fib(k)` is computed exactly once.
- `from functools import lru_cache` imports the caching decorator.
- `@lru_cache(maxsize=None)` wraps the `fib_lru` function. When `fib_lru` is called, the decorator automatically checks a hidden dictionary. If the arguments are in the dictionary, it returns the value; otherwise, it runs the function and saves the result. This achieves the exact same Top-Down Dynamic Programming as `fib_memo`, but with cleaner syntax.

## Concept Unit: Tabulation — bottom-up DP

### The Problem
Top-down memoization is incredibly fast, but it still relies on recursion. Every function call adds a frame to the system's call stack. If `n` is large enough (e.g., `n = 2000`), a recursive solution will hit Python's maximum recursion depth and crash with a `RecursionError`. Furthermore, function calls have overhead. How can we achieve the same O(n) performance without recursion at all?

### Introduce the concept in isolation
We will build a list iteratively from the smallest index to the largest. This is called **Tabulation**.

```python
# Demonstrating iterative table building
table = [0] * 5
table[0] = 0
table[1] = 10
for i in range(2, 5):
    table[i] = table[i-1] + 5

print(table)
```

Output:
```text
[0, 10, 15, 20, 25]
```

This output proves that we can pre-allocate an array (`[0] * 5`), set the base cases (`table[0]` and `table[1]`), and then use a simple `for` loop to compute each subsequent value based on previously computed values in the table. There is no recursion.

### Discard the throwaway example
We discard this abstract array iteration example.

### Project Change
- Reference Source: No reference counterpart.
- Files affected: `fibonacci.py` (modified)
- Change type: Add
- Location: Appended to the end of the file.
- Dependencies: None.

### The New Code
```python
def fib_table(n):
    if n <= 1:
        return n
    table = [0] * (n + 1)
    table[0] = 0
    table[1] = 1
    for i in range(2, n + 1):
        table[i] = table[i-1] + table[i-2]
    return table[n]

print(fib_table(10))
print(fib_table(100))

def fib_optimal(n):
    if n <= 1: return n
    a, b = 0, 1
    for _ in range(2, n+1):
        a, b = b, a + b
    return b

print(fib_optimal(100))
```

### The Updated Project
```python
# 36: def fib_table(n):
# 37:     if n <= 1:
# 38:         return n
# 39:     table = [0] * (n + 1)
# 40:     table[0] = 0
# 41:     table[1] = 1
# 42:     for i in range(2, n + 1):
# 43:         table[i] = table[i-1] + table[i-2]
# 44:     return table[n]
# 45: 
# 46: print(fib_table(10))
# 47: print(fib_table(100))
# 48: 
# 49: def fib_optimal(n):
# 50:     if n <= 1: return n
# 51:     a, b = 0, 1
# 52:     for _ in range(2, n+1):
# 53:         a, b = b, a + b
# 54:     return b
# 55: 
# 56: print(fib_optimal(100))
```
This code adds two bottom-up DP implementations: one using a full table (array), and one optimized to only use two variables since we only need the last two values.

### Mechanical walkthrough
- `table = [0] * (n + 1)` creates a list of zeros of length `n+1`. This is the "table" in Tabulation. We need indices from 0 to `n` inclusive.
- `table[0] = 0` and `table[1] = 1` populate the base cases directly.
- `for i in range(2, n + 1):` iterates from 2 up to `n`. Because we iterate upwards, we guarantee that `table[i-1]` and `table[i-2]` have already been computed and stored by the time we need them to compute `table[i]`.
- Tabulation fills a table bottom-up; memoization fills it top-down lazily. Both achieve O(n) time, but tabulation has O(1) recursion overhead. For `n=6`, the table fills as `[0,1,1,2,3,5,8]`.
- `fib_optimal(n)` demonstrates space optimization. Notice that `table[i]` only ever looks back at `table[i-1]` and `table[i-2]`. The rest of the table is dead memory.
- `a, b = 0, 1` stores just the two most recent values.
- `a, b = b, a + b` simultaneously updates `a` to become the old `b`, and `b` to become the sum. This reduces the space complexity from O(n) to O(1). Output for `fib_optimal(100)` is identically `354224848179261915075`.

## Concept Unit: Rod cutting — classic DP problem

### The Problem
Fibonacci is a toy example. Let's look at an optimization problem. You have a rod of length `n`, and a list of prices `prices` where `prices[i]` is the price you can sell a rod of length `i+1` for. You can cut the rod into as many pieces as you want. How do you find the maximum revenue possible?

### Introduce the concept in isolation
We will demonstrate the idea of choosing a cut by evaluating the price of a piece plus the recursive maximum of the remainder.

```python
def max_choice(a, b):
    return max(a, b)

print(max_choice(10, 5 + 6))
```

Output:
```text
11
```

This output proves we can use the `max` function to compare multiple potential scenarios (e.g., selling the rod whole for 10 vs cutting it into two pieces worth 5 and 6) and return the optimal choice.

### Discard the throwaway example
We discard this simple `max` demonstration.

### Project Change
- Reference Source: No reference counterpart.
- Files affected: `rod_cutting.py` (created)
- Change type: Add
- Location: N/A
- Dependencies: Python 3

### The New Code
```python
def rod_cut_memo(prices, n, cache=None):
    '''prices[i] is the price for a rod of length i+1.
       Returns the maximum revenue from cutting a rod of length n.'''
    if cache is None:
        cache = {}
    if n in cache:
        return cache[n]
    if n == 0:
        return 0
    
    max_val = 0
    for cut in range(1, n+1):
        val = prices[cut-1] + rod_cut_memo(prices, n-cut, cache)
        max_val = max(max_val, val)
        
    cache[n] = max_val
    return max_val

prices = [1, 5, 8, 9, 10, 17, 17, 20]
print(rod_cut_memo(prices, 4))
print(rod_cut_memo(prices, 8))
```

### The Updated Project
```python
# 1: def rod_cut_memo(prices, n, cache=None):
# 2:     '''prices[i] is the price for a rod of length i+1.
# 3:        Returns the maximum revenue from cutting a rod of length n.'''
# 4:     if cache is None:
# 5:         cache = {}
# 6:     if n in cache:
# 7:         return cache[n]
# 8:     if n == 0:
# 9:         return 0
# 10:     
# 11:     max_val = 0
# 12:     for cut in range(1, n+1):
# 13:         val = prices[cut-1] + rod_cut_memo(prices, n-cut, cache)
# 14:         max_val = max(max_val, val)
# 15:         
# 16:     cache[n] = max_val
# 17:     return max_val
# 18: 
# 19: prices = [1, 5, 8, 9, 10, 17, 17, 20]
# 20: print(rod_cut_memo(prices, 4))
# 21: print(rod_cut_memo(prices, 8))
```
This introduces our first classic DP optimization problem using top-down memoization.

### Mechanical walkthrough
- `def rod_cut_memo(prices, n, cache=None):` takes the price table, the current remaining length `n`, and the memoization `cache`.
- `if n == 0: return 0` is the base case. A rod of length 0 has 0 value.
- `for cut in range(1, n+1):` loops through every possible first cut we could make (from length 1 up to the whole length `n`).
- `val = prices[cut-1] + rod_cut_memo(prices, n-cut, cache)` calculates the total revenue of this choice: the price of the piece we just cut off (`prices[cut-1]`) *plus* the optimal revenue of whatever is left (`n-cut`). This embodies **Optimal Substructure**: the optimal way to cut a rod of length `n` uses the optimal way to cut the remainder.
- `max_val = max(max_val, val)` updates our running maximum. The built-in `max` function evaluates the current best known value against this new scenario.
- `cache[n] = max_val` stores the best result we found for length `n` before returning it. 
- For `n=4`, it outputs `10` (two pieces of length 2: 5+5 is better than a whole rod of length 4 which is 9). For `n=8`, it outputs `22` (lengths 6+2: 17+5). The memoization avoids evaluating the same subproblem branches (like cutting `n=2`) repeatedly.

## Concept Unit: Tabulation for rod cutting

### The Problem
Just as with Fibonacci, the recursive top-down rod cutting approach runs the risk of stack overflow and has recursive call overhead. Can we restructure this to build the optimal solutions from length 1 up to length `n` iteratively?

### Introduce the concept in isolation
We will look at how an inner loop can check all previous states to build a new state in an array.

```python
table = [0] * 4
table[0] = 0
for length in range(1, 4):
    for cut in range(1, length + 1):
        # Dummy operation representing looking back
        _ = table[length - cut]
print("Nested loops completed.")
```

Output:
```text
Nested loops completed.
```

This dummy loop structure proves we can iterate over the total `length` in an outer loop, and then iterate over every possible `cut` size in an inner loop, looking back into `table` at indices `length - cut`. Because the inner loop only subtracts positive integers, it only ever looks at smaller, already-computed values.

### Discard the throwaway example
We discard this loop structure test.

### Project Change
- Reference Source: No reference counterpart.
- Files affected: `rod_cutting.py` (modified)
- Change type: Add
- Location: Appended to the end of the file.
- Dependencies: None.

### The New Code
```python
def rod_cut_table(prices, n):
    table = [0] * (n + 1)
    for length in range(1, n + 1):
        max_val = 0
        for cut in range(1, length + 1):
            if cut <= len(prices):
                val = prices[cut-1] + table[length - cut]
                max_val = max(max_val, val)
        table[length] = max_val
    return table[n]

for n in range(1, 9):
    print(f'rod({n}) = {rod_cut_table(prices, n)}')
```

### The Updated Project
```python
# 23: def rod_cut_table(prices, n):
# 24:     table = [0] * (n + 1)
# 25:     for length in range(1, n + 1):
# 26:         max_val = 0
# 27:         for cut in range(1, length + 1):
# 28:             if cut <= len(prices):
# 29:                 val = prices[cut-1] + table[length - cut]
# 30:                 max_val = max(max_val, val)
# 31:         table[length] = max_val
# 32:     return table[n]
# 33: 
# 34: for n in range(1, 9):
# 35:     print(f'rod({n}) = {rod_cut_table(prices, n)}')
```
This is the bottom-up, tabular equivalent to our top-down rod cutting function.

### Mechanical walkthrough
- `table = [0] * (n + 1)` creates a table where `table[k]` will store the maximum revenue for a rod of exactly length `k`.
- `for length in range(1, n + 1):` is the outer loop solving progressively larger subproblems. By the time we solve for `length`, all answers for 0 to `length-1` are guaranteed to be correct and stored.
- `for cut in range(1, length + 1):` tries making a first cut of every possible size up to the current `length`.
- `val = prices[cut-1] + table[length - cut]` looks up the price of the cut, and adds it to the optimal solution for the remainder, which we instantly read from the `table` instead of recursively calling a function.
- `table[length] = max_val` locks in the best configuration found.
- The output loop prints the sequence: 
  `rod(1) = 1`
  `rod(2) = 5`
  `rod(3) = 8`
  `rod(4) = 10`
  `rod(5) = 13`
  `rod(6) = 17`
  `rod(7) = 18`
  `rod(8) = 22`.

## Concept Unit: Longest Common Subsequence (LCS)

### The Problem
Dynamic programming frequently applies to strings and 2D matrices. The Longest Common Subsequence (LCS) problem asks: given two sequences (e.g., strings), find the length of the longest subsequence present in both. A subsequence doesn't have to be contiguous, but it must maintain relative order. How do we build a 2D table to track states involving two different strings?

### Introduce the concept in isolation
We will construct a 2D matrix in Python and access it using two indices.

```python
m, n = 3, 2
dp = [[0] * (n+1) for _ in range(m+1)]
dp[1][1] = 5
print(dp)
```

Output:
```text
[[0, 0, 0], [0, 5, 0], [0, 0, 0], [0, 0, 0]]
```

This output proves we can use a list comprehension `[[0] * columns for _ in range(rows)]` to safely build a 2D matrix without duplicating list references (which is a common bug if you use `[[0]*n]*m`). We index it as `dp[row][col]`.

### Discard the throwaway example
We discard this matrix creation example.

### Project Change
- Reference Source: No reference counterpart.
- Files affected: `lcs.py` (created)
- Change type: Add
- Location: N/A
- Dependencies: Python 3

### The New Code
```python
def lcs(s1, s2):
    m, n = len(s1), len(s2)
    dp = [[0] * (n+1) for _ in range(m+1)]
    for i in range(1, m+1):
        for j in range(1, n+1):
            if s1[i-1] == s2[j-1]:
                dp[i][j] = dp[i-1][j-1] + 1
            else:
                dp[i][j] = max(dp[i-1][j], dp[i][j-1])
    return dp[m][n]

print(lcs('ABCBDAB', 'BDCAB'))
print(lcs('AGGTAB', 'GXTXAYB'))
print(lcs('abc', 'abc'))
print(lcs('abc', 'def'))
```

### The Updated Project
```python
# 1: def lcs(s1, s2):
# 2:     m, n = len(s1), len(s2)
# 3:     dp = [[0] * (n+1) for _ in range(m+1)]
# 4:     for i in range(1, m+1):
# 5:         for j in range(1, n+1):
# 6:             if s1[i-1] == s2[j-1]:
# 7:                 dp[i][j] = dp[i-1][j-1] + 1
# 8:             else:
# 9:                 dp[i][j] = max(dp[i-1][j], dp[i][j-1])
# 10:     return dp[m][n]
# 11: 
# 12: print(lcs('ABCBDAB', 'BDCAB'))
# 13: print(lcs('AGGTAB', 'GXTXAYB'))
# 14: print(lcs('abc', 'abc'))
# 15: print(lcs('abc', 'def'))
```
This introduces a 2D dynamic programming solution.

### Mechanical walkthrough
- `dp = [[0] * (n+1) for _ in range(m+1)]` creates a table where `dp[i][j]` stores the length of the LCS of the prefix `s1[:i]` and the prefix `s2[:j]`. The extra `+1` is for the base case where a prefix is empty (length 0).
- `for i in range(1, m+1):` and `for j in range(1, n+1):` iterates through every prefix combination of the two strings.
- `if s1[i-1] == s2[j-1]:` checks if the current characters match. (We use `i-1` and `j-1` because string indices are 0-based, while our table is 1-based to accommodate the empty prefix).
- `dp[i][j] = dp[i-1][j-1] + 1` handles the match case. If they match, the LCS length is 1 plus the LCS of the prefixes without these characters.
- `dp[i][j] = max(dp[i-1][j], dp[i][j-1])` handles the mismatch case. We take the best answer by either ignoring the current character of `s1` or the current character of `s2`. This leverages the built-in `max` function.
- `return dp[m][n]` returns the value in the bottom right of the matrix, representing the entire strings.
- This algorithm runs in O(m*n) time and space. The output is `4` (for BCAB or BDAB), `4` (for GTAB), `3`, and `0`. LCS has **Optimal Substructure**: the LCS of two strings depends entirely on the LCS of smaller prefixes.

## Concept Unit: The DP recipe — how to approach any DP problem

### The Problem
We have seen three different problems solved with Dynamic Programming. It is easy to understand an existing solution, but how do you write one from scratch for a new problem? We need a transferable methodology.

### Introduce the concept in isolation
We will conceptually map out a recipe for DP. There is no isolated code to run here, as the concept is an algorithmic framework rather than a language feature. Instead, we state the recipe directly:

1. **Identify the SUBPROBLEM:** What smaller version of the problem leads to the answer?
2. **Write the RECURRENCE:** Express the answer for a subproblem in terms of smaller subproblems.
3. **Identify the BASE CASES:** What are the smallest subproblems with known answers?
4. **Choose top-down or bottom-up:** Use memoization (recursion + cache) or tabulation (iterative array).
5. **Reconstruct the solution:** If the problem asks for the actual choices made (not just the max value), backtrace through the table.

### Discard the throwaway example
No code to discard.

### Project Change
- Reference Source: No reference counterpart.
- Files affected: None.
- Change type: Configure (Mental Model)
- Location: N/A
- Dependencies: None.

### The New Code
```python
# The DP Recipe Applied:
# 
# 1. Fibonacci
# Subproblem: fib(i)
# Recurrence: fib(i) = fib(i-1) + fib(i-2)
# Base: fib(0) = 0, fib(1) = 1
# 
# 2. Rod Cutting
# Subproblem: max_revenue(length)
# Recurrence: max_revenue(L) = max(price[cut] + max_revenue(L - cut)) for all valid cuts
# Base: max_revenue(0) = 0
# 
# 3. LCS
# Subproblem: lcs(prefix_A, prefix_B)
# Recurrence: if match -> lcs(A-1, B-1) + 1; else -> max(lcs(A-1, B), lcs(A, B-1))
# Base: lcs(empty, anything) = 0
```

### The Updated Project
No file is updated. The block above serves as a summary reference.

### Mechanical walkthrough
- **Identify the SUBPROBLEM:** For Fibonacci, it was the Nth number. For rod cutting, it was the optimal revenue for a rod of length `L`. For LCS, it was the longest sequence for string prefixes of lengths `i` and `j`. 
- **Write the RECURRENCE:** This is the mathematical relationship. `fib(i) = fib(i-1) + fib(i-2)`. If you cannot write this equation, you cannot write the code.
- **Identify the BASE CASES:** Without a base case (like `fib(0) = 0`), the recurrence would infinite loop or access negative indices.
- **Choose top-down or bottom-up:** If you need every subproblem, Tabulation avoids recursion overhead. If you only need a sparse set of subproblems, Memoization might be faster.
- **Reconstruct the solution:** In LCS, `dp[m][n]` tells us the length is 4. If we wanted the string `"GTAB"`, we would write a loop to walk backwards from `dp[m][n]` following the path of maximum values.

---

Closing: Dynamic programming is one of the most powerful algorithmic techniques, capable of transforming an O(2^n) exponential brute-force search into a swift O(n) or O(n^2) polynomial sweep. It hinges entirely on identifying Optimal Substructure and Overlapping Subproblems. Next, Lesson 35 applies DP to the 0/1 knapsack problem. 

Exercises: 
- Implement DP for coin change (minimum coins to make amount n).
- Implement DP for longest increasing subsequence.
