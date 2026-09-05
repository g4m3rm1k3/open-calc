# Lesson 34: Dynamic Programming — Memoization and Tabulation

What you will build: The reader understands dynamic programming (DP): the technique of caching results of overlapping subproblems to avoid redundant computation. They implement both top-down DP (memoization) and bottom-up DP (tabulation) for Fibonacci and the coin change problem. The transferable insight: DP applies when: (1) the problem has OVERLAPPING SUBPROBLEMS (same sub-inputs computed multiple times) and (2) OPTIMAL SUBSTRUCTURE (optimal solution built from optimal sub-solutions). If both hold, caching turns exponential into polynomial.

What you need to know first: Lessons 00-33.

## Terms used in this lesson
- **Dynamic Programming (DP)** — The technique of caching results of overlapping subproblems to avoid redundant computation. It solves complex problems by breaking them down into simpler subproblems.
- **Overlapping Subproblems** — When a recursive algorithm visits the same subproblems repeatedly. Caching prevents this redundancy.
- **Optimal Substructure** — When an optimal solution to a larger problem can be built efficiently from optimal solutions to its subproblems.
- **Memoization** — A top-down dynamic programming approach that recursively solves a problem while caching the results of expensive function calls to return the cached result when the same inputs occur again.
- **Tabulation** — A bottom-up dynamic programming approach that iteratively solves all subproblems from smallest to largest, storing their answers in a table to compute the final solution.
- **Greedy Algorithm** — An algorithm that makes a locally optimal choice at each step with the hope of finding a global optimum. It is fast but may fail to find the optimal solution if the problem does not possess the greedy-choice property.

## Objects and methods used

**`sys.setrecursionlimit`**
- *What it is:* A function to set the maximum depth of the Python interpreter stack.
- *Implementation:* `def setrecursionlimit(limit: int) -> None`
- *Its use:* Used to increase the recursion limit to accommodate deep recursive calls in naive or memoized implementations before they hit a `RecursionError`.
- *Type:* A built-in function in the `sys` module.
- *Responsibility:* Controls the maximum depth of the Python call stack to prevent infinite recursion from crashing the interpreter in C.
- *Depends on:* An integer representing the new maximum stack depth.
- *Connects to:* Modifies internal Python runtime state.
- *Shape:* A global configuration boundary for the runtime environment.

**`functools.lru_cache`**
- *What it is:* A decorator that wraps a function with a memoizing callable that saves up to the `maxsize` most recent calls.
- *Implementation:* `@lru_cache(maxsize=128, typed=False)`
- *Its use:* Used as an out-of-the-box memoization mechanism for recursive functions to instantly turn them into top-down DP solutions without manual cache management.
- *Type:* A decorator function from the standard library `functools` module.
- *Responsibility:* Intercepts function calls, checks if the result for the given arguments is already cached, and either returns the cached result or computes and stores it.
- *Depends on:* The function it decorates and the arguments passed to that function (which must be hashable).
- *Connects to:* Sits between the caller and the decorated function, maintaining an internal dictionary for the cache.
- *Shape:* A wrapper at the function definition boundary.

**`dict`**
- *What it is:* Python's built-in dictionary type, a hash map.
- *Implementation:* `class dict(**kwarg)`
- *Its use:* Used to manually build a cache for memoization, storing input parameters as keys and computed results as values.
- *Type:* A built-in class.
- *Responsibility:* Stores key-value pairs with O(1) average time complexity for lookups and insertions.
- *Depends on:* Hashable keys.
- *Connects to:* Used internally by memoized functions to store and retrieve past results.
- *Shape:* An internal data structure for state storage.

**`list`**
- *What it is:* Python's built-in mutable sequence type.
- *Implementation:* `class list([iterable])`
- *Its use:* Used to create the table in the tabulation (bottom-up) approach, storing solutions to subproblems sequentially.
- *Type:* A built-in class.
- *Responsibility:* Maintains an ordered, mutable sequence of items with O(1) time complexity for index-based access.
- *Depends on:* The items placed into it.
- *Connects to:* Used iteratively to build up solutions from base cases to the final answer.
- *Shape:* An internal data structure for linear state storage.

**`float('inf')`**
- *What it is:* A representation of positive infinity in Python.
- *Implementation:* `float(x: str)`
- *Its use:* Used to initialize the DP table with a maximum impossible value when seeking a minimum (like minimum coin change).
- *Type:* A float object.
- *Responsibility:* Acts as an upper bound that is greater than any other finite numeric value.
- *Depends on:* Built-in numeric type handling.
- *Connects to:* Compared against computed minimums to iteratively refine the best solution.
- *Shape:* A sentinel constant value for algorithms.

## Concept Unit: The overlapping subproblems problem

### The Problem
Why does calculating Fibonacci numbers naively take so long? What happens if you try to calculate `fib(40)` using the standard mathematical recurrence? If you draw out the function calls for `fib(5)`, how many times do you see `fib(2)` being evaluated from scratch?

### Introduce the concept in isolation
```python
import sys
sys.setrecursionlimit(10000)

call_count = 0

def fib_naive(n):
    global call_count
    call_count += 1
    if n <= 1:
        return n
    return fib_naive(n-1) + fib_naive(n-2)

for n in [10, 20, 30]:
    call_count = 0
    result = fib_naive(n)
    print(f'fib({n})={result}, calls={call_count}')
# fib(10)=55, calls=177
# fib(20)=6765, calls=21891
# fib(30)=832040, calls=2692537
# calls grow as ~2^n: fib(6) is computed MANY times
```
Trace `fib_naive(5)`: calls `fib(4)+fib(3)`. `fib(4)` calls `fib(3)+fib(2)`. `fib(3)` called TWICE. `fib(2)` called THREE times. Redundant: same inputs, same outputs, recomputed. This proves that an algorithm with **overlapping subproblems** will perform redundant work, driving execution time up exponentially.

### Discard the throwaway
This naive overlapping implementation is deleted and will not appear in the project again.

### Project Change
- **Reference Source:** No reference counterpart — this is a from-scratch addition because we are demonstrating algorithmic performance differences standalone.
- **Files affected:** `dynamic_programming.py` (created)
- **Change type:** Add
- **Location:** At the top of the file
- **Dependencies:** None

### The New Code
```python
import sys
sys.setrecursionlimit(10000)

call_count = 0

def fib_naive(n):
    global call_count
    call_count += 1
    if n <= 1:
        return n
    return fib_naive(n-1) + fib_naive(n-2)
```

### The Updated Project
```python
1: import sys
2: sys.setrecursionlimit(10000)
3: 
4: call_count = 0
5: 
6: def fib_naive(n):
7:     global call_count
8:     call_count += 1
9:     if n <= 1:
10:        return n
11:    return fib_naive(n-1) + fib_naive(n-2)
```
The file now contains a standard recursive implementation of the Fibonacci sequence that tracks the number of times it is called.

### Mechanical walkthrough
- `import sys`: Imports the system module to access interpreter settings.
- `sys.setrecursionlimit(10000)`: Sets the recursion limit to 10,000 to prevent deep recursive calls from crashing.
- `call_count = 0`: Initializes a global counter to track function executions.
- `def fib_naive(n):`: Defines a function taking an integer `n`.
- `global call_count`: Declares intent to modify the global `call_count` variable.
- `call_count += 1`: Increments the counter each time the function is invoked.
- `if n <= 1:`: Checks if the base case has been reached (0 or 1).
- `return n`: Returns the base case value directly.
- `return fib_naive(n-1) + fib_naive(n-2)`: The recursive step, returning the sum of the two preceding Fibonacci numbers.

### CS lens
**Overlapping Subproblems** are a characteristic of problems where naive recursive algorithms solve the same subproblems over and over. This appears in string matching (like Edit Distance), graph problems (like Shortest Path in a DAG), and computational biology (DNA sequence alignment).

### SE lens
Design principle: **Separation of state and logic**. Here, `call_count` is a global variable. Alternatively, we could have passed a state object down the call stack or encapsulated it in a class. The tradeoff is that a global variable is quick for a throwaway script but breaks thread safety and reusability in real applications.

### Commands needed
`python3 dynamic_programming.py`

### Run it
Predicted confidently: Output matches the trace, proving exponential growth in calls for linear increases in `n`.

### One sentence connecting to previous unit
Having seen how redundant computation balloons execution time, we need a way to remember past results to avoid repeating work.

## Concept Unit: Memoization — top-down DP

### The Problem
If we are computing `fib(3)` multiple times, how can we compute it just once? What data structure allows us to look up previously computed answers instantly? If we have the answer for `fib(3)`, what should the function do instead of branching?

### Introduce the concept in isolation
```python
def fib_memo(n, cache=None):
    if cache is None:
        cache = {}   # fresh cache each top-level call
    if n in cache:
        return cache[n]       # already computed
    if n <= 1:
        return n
    result = fib_memo(n-1, cache) + fib_memo(n-2, cache)
    cache[n] = result         # store before returning
    return result

from functools import lru_cache

@lru_cache(maxsize=None)
def fib_lru(n):
    if n <= 1:
        return n
    return fib_lru(n-1) + fib_lru(n-2)

print(fib_memo(50))   # 12586269025 (instant)
print(fib_lru(100))   # 354224848179261915075 (instant)
# Each subproblem computed ONCE: O(n) calls vs O(2^n)
```
Trace `fib_memo(5)`: cache={}. fib(5): not in cache. fib(4): not in cache. fib(3): not in cache. fib(2): not in cache. fib(1)=1, fib(0)=0. cache[2]=1. cache[3]=2. fib(4): needs fib(2)=cache[2]=1 (instant). cache[4]=3. cache[5]=5. Total: 9 calls vs 15 naive. This proves that **memoization** eliminates redundant recursive calls by trading space (the cache) for time.

### Discard the throwaway
This throwaway demonstration of `lru_cache` is discarded to focus on the manual dictionary implementation first.

### Project Change
- **Reference Source:** No reference counterpart — this is a from-scratch addition.
- **Files affected:** `dynamic_programming.py` (modified)
- **Change type:** Add
- **Location:** Below `fib_naive`
- **Dependencies:** None

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
```

### The Updated Project
```python
... unchanged from here up
11:    return fib_naive(n-1) + fib_naive(n-2)
12: 
13: def fib_memo(n, cache=None): # ← new
14:     if cache is None:        # ← new
15:         cache = {}           # ← new
16:     if n in cache:           # ← new
17:         return cache[n]      # ← new
18:     if n <= 1:               # ← new
19:         return n             # ← new
20:     result = fib_memo(n-1, cache) + fib_memo(n-2, cache) # ← new
21:     cache[n] = result        # ← new
22:     return result            # ← new
```
The file now contains a `fib_memo` function that uses a dictionary to store previously computed Fibonacci numbers, returning them instantly on subsequent calls.

### Mechanical walkthrough
- `def fib_memo(n, cache=None):`: Defines a recursive function with an optional `cache` parameter that defaults to `None`.
- `if cache is None:`: Checks if the cache was omitted (signifying a top-level call).
- `cache = {}`: Initializes an empty dictionary to store results.
- `if n in cache:`: Checks if the result for `n` has already been computed and stored.
- `return cache[n]`: Returns the stored result, skipping further recursion.
- `if n <= 1:`: Base case condition.
- `return n`: Returns the base case directly.
- `result = fib_memo(n-1, cache) + fib_memo(n-2, cache)`: Computes the Fibonacci number recursively, passing down the shared cache object.
- `cache[n] = result`: Stores the newly computed result in the cache dictionary.
- `return result`: Returns the final computed value.

### CS lens
**Memoization (Top-Down DP)** is the process of wrapping a recursive algorithm with a caching mechanism. It appears in parsing (packrat parsers), rendering (caching layout calculations), and web servers (caching expensive database queries by ID).

### SE lens
Design principle: **Default arguments and mutable state**. We use `cache=None` rather than `cache={}` because default arguments are evaluated once at function definition in Python. If we used `cache={}`, the same dictionary instance would persist across independent top-level calls, leaking state between unrelated computations.

### Commands needed
None for this unit.

### Run it
Predicted confidently: `fib_memo(50)` will execute instantly and return `12586269025`.

### One sentence connecting to previous unit
Memoization solves the performance issue by working top-down, but it still relies on deep recursion which can consume stack space; what if we build the solution bottom-up instead?

## Concept Unit: Tabulation — bottom-up DP

### The Problem
What if the recursion is so deep that even memoization hits the maximum recursion depth? How could you compute the answers starting from `fib(0)` and `fib(1)` and working your way up to `fib(n)`? Do we need to store all the answers, or just the recent ones?

### Introduce the concept in isolation
```python
def fib_tab(n):
    if n <= 1:
        return n
    # Build table from smallest subproblems up
    table = [0] * (n + 1)
    table[0] = 0
    table[1] = 1
    for i in range(2, n + 1):
        table[i] = table[i-1] + table[i-2]
    return table[n]

# Space-optimized: only need last two values
def fib_opt(n):
    if n <= 1:
        return n
    a, b = 0, 1
    for _ in range(2, n + 1):
        a, b = b, a + b
    return b

print(fib_tab(10))   # 55
print(fib_opt(50))   # 12586269025
# table[i] only depends on table[i-1] and table[i-2]
# O(n) time, O(n) space (tab) or O(1) space (opt)
```
Trace `fib_tab(6)`: `table=[0,1,0,0,0,0,0]`. `i=2: table[2]=1`. `i=3: table[3]=2`. `i=4: table[4]=3`. `i=5: table[5]=5`. `i=6: table[6]=8`. Return 8. This proves that **tabulation** avoids recursion entirely, iterating strictly from smallest to largest.

### Discard the throwaway
This throwaway `fib_opt` space-optimized version is discarded to focus solely on standard tabulation.

### Project Change
- **Reference Source:** No reference counterpart — this is a from-scratch addition.
- **Files affected:** `dynamic_programming.py` (modified)
- **Change type:** Add
- **Location:** Below `fib_memo`
- **Dependencies:** None

### The New Code
```python
def fib_tab(n):
    if n <= 1:
        return n
    table = [0] * (n + 1)
    table[0] = 0
    table[1] = 1
    for i in range(2, n + 1):
        table[i] = table[i-1] + table[i-2]
    return table[n]
```

### The Updated Project
```python
... unchanged from here up
20:     result = fib_memo(n-1, cache) + fib_memo(n-2, cache)
21:     cache[n] = result
22:     return result
23: 
24: def fib_tab(n):                         # ← new
25:     if n <= 1:                            # ← new
26:         return n                          # ← new
27:     table = [0] * (n + 1)                 # ← new
28:     table[0] = 0                          # ← new
29:     table[1] = 1                          # ← new
30:     for i in range(2, n + 1):             # ← new
31:         table[i] = table[i-1] + table[i-2] # ← new
32:     return table[n]                       # ← new
```
The file now contains `fib_tab`, an iterative approach that builds solutions to larger problems starting from the base cases.

### Mechanical walkthrough
- `def fib_tab(n):`: Defines an iterative function for Fibonacci.
- `if n <= 1:`: Handles base cases instantly.
- `return n`: Returns the base case value.
- `table = [0] * (n + 1)`: Initializes a list of zeros with length `n + 1` to hold all intermediate answers up to `n`.
- `table[0] = 0`: Sets the first base case in the table.
- `table[1] = 1`: Sets the second base case in the table.
- `for i in range(2, n + 1):`: Iterates from `2` up to and including `n`.
- `table[i] = table[i-1] + table[i-2]`: Fills the current table cell using the two previous adjacent cells.
- `return table[n]`: Returns the fully computed answer located at the end of the table.

### CS lens
**Tabulation (Bottom-Up DP)** is an algorithmic technique that builds solutions up from the smallest base cases iteratively. It appears in spreadsheet software (resolving cell dependencies topologically), database query planning (joining tables optimally), and string analysis (Longest Common Subsequence).

### SE lens
Design principle: **Space-Time Tradeoff**. By allocating an array of size `n + 1`, we trade memory for an O(n) execution time while completely avoiding the function call overhead of recursion. The alternative, a purely recursive approach, used O(n) stack space but incurred function call costs.

### Commands needed
None for this unit.

### Run it
Predicted confidently: `fib_tab(10)` returns `55` with no recursive calls made.

### One sentence connecting to previous unit
Fibonacci is a 1D sequence where each value depends on the previous two; how do we apply DP when the choices aren't just previous indices, but a set of possible options?

## Concept Unit: Coin change — DP on a harder problem

### The Problem
If you have coins of values 1, 5, 10, and 25, how do you find the minimum number of coins to make an exact amount? Does the optimal solution for `amount = X` relate to the optimal solution for `amount = X - coin_value`?

### Introduce the concept in isolation
```python
def coin_change(coins, amount):
    '''
    Returns minimum number of coins to make 'amount'.
    Returns -1 if impossible.
    '''
    # dp[i] = min coins to make amount i
    INF = float('inf')
    dp = [INF] * (amount + 1)
    dp[0] = 0   # base case: 0 coins to make 0

    for i in range(1, amount + 1):
        for coin in coins:
            if coin <= i and dp[i - coin] + 1 < dp[i]:
                dp[i] = dp[i - coin] + 1

    return dp[amount] if dp[amount] != INF else -1

print(coin_change([1, 5, 10, 25], 36))  # 3 (25+10+1)
print(coin_change([1, 5, 10, 25], 30))  # 2 (25+5)
print(coin_change([2], 3))              # -1 (impossible)
```
Trace `coin_change([1,5,10,25], 11)`: `dp=[0,INF,...]`. `i=1: coin=1: dp[0]+1=1 < INF -> dp[1]=1`. `i=5: coin=5: dp[0]+1=1 < INF -> dp[5]=1`. `i=10: coin=10: dp[0]+1=1 < INF -> dp[10]=1`. `i=11: coin=1: dp[10]+1=2 < INF -> dp[11]=2`. `coin=10: dp[1]+1=2` (no improvement). Return `2` (10+1). This proves that DP correctly identifies the minimal combination by trying all valid subproblems.

### Discard the throwaway
This isolated throwaway trace example is discarded to integrate the function fully.

### Project Change
- **Reference Source:** No reference counterpart — this is a from-scratch addition.
- **Files affected:** `dynamic_programming.py` (modified)
- **Change type:** Add
- **Location:** Below `fib_tab`
- **Dependencies:** None

### The New Code
```python
def coin_change(coins, amount):
    INF = float('inf')
    dp = [INF] * (amount + 1)
    dp[0] = 0

    for i in range(1, amount + 1):
        for coin in coins:
            if coin <= i and dp[i - coin] + 1 < dp[i]:
                dp[i] = dp[i - coin] + 1

    return dp[amount] if dp[amount] != INF else -1
```

### The Updated Project
```python
... unchanged from here up
29:     table[1] = 1
30:     for i in range(2, n + 1):
31:         table[i] = table[i-1] + table[i-2]
32:     return table[n]
33: 
34: def coin_change(coins, amount):              # ← new
35:     INF = float('inf')                       # ← new
36:     dp = [INF] * (amount + 1)                # ← new
37:     dp[0] = 0                                # ← new
38:                                              # ← new
39:     for i in range(1, amount + 1):           # ← new
40:         for coin in coins:                   # ← new
41:             if coin <= i and dp[i - coin] + 1 < dp[i]: # ← new
42:                 dp[i] = dp[i - coin] + 1     # ← new
43:                                              # ← new
44:     return dp[amount] if dp[amount] != INF else -1 # ← new
```
The file now contains `coin_change`, a function demonstrating tabulation on a problem where multiple branches exist at each subproblem.

### Mechanical walkthrough
- `def coin_change(coins, amount):`: Defines a function taking a list of coin denominations and an integer target amount.
- `INF = float('inf')`: Assigns positive infinity to a local variable to act as a sentinel for unreachable states.
- `dp = [INF] * (amount + 1)`: Creates a table to hold the minimum coins needed for every amount up to the target, initialized to infinity.
- `dp[0] = 0`: Sets the base case: it takes zero coins to make an amount of zero.
- `for i in range(1, amount + 1):`: Iterates through every amount from 1 up to the target amount.
- `for coin in coins:`: Iterates through each available coin denomination.
- `if coin <= i and dp[i - coin] + 1 < dp[i]:`: Checks if the coin can fit in the current amount `i` and if using it leads to a smaller number of coins than the current best for `dp[i]`.
- `dp[i] = dp[i - coin] + 1`: Updates the table with the new minimum coin count.
- `return dp[amount] if dp[amount] != INF else -1`: Returns the value in the final cell, or `-1` if it is still infinity (meaning the amount cannot be made).

### CS lens
**Optimal Substructure** dictates that an optimal solution to the overall problem can be constructed efficiently from optimal solutions to its subproblems. In `coin_change`, the optimal way to make amount `X` relies on the optimal way to make `X - coin`. This is seen in shortest path algorithms (Dijkstra's) and game theory.

### SE lens
Design principle: **Sentinel values**. We initialize the table with `float('inf')`. The alternative is using a distinct type like `None`, which would force us to perform type checks (`if dp[i] is None: ...`) inside the hot loop. The tradeoff is that `float('inf')` acts like a standard number, allowing simple `<` comparisons at the expense of potentially masking bugs if math is improperly applied to it elsewhere.

### Commands needed
None for this unit.

### Run it
Predicted confidently: `coin_change([1, 5, 10, 25], 36)` returns `3`.

### One sentence connecting to previous unit
If dynamic programming checks every combination, is there a faster way that just picks the biggest coin first?

## Concept Unit: When to use DP vs. greedy vs. brute force

### The Problem
Why use dynamic programming if we can just pick the largest coin that fits? Does a "greedy" approach always yield the optimal answer for any set of coins?

### Introduce the concept in isolation
```python
# DP vs Greedy:
# Greedy: make locally optimal choice at each step (fast but may fail)
# DP: consider ALL subproblems, cache overlapping ones (slower but correct)

def greedy_coins(coins, amount):
    coins = sorted(coins, reverse=True)  # largest first
    result = []
    for coin in coins:
        while amount >= coin:
            result.append(coin)
            amount -= coin
    return result if amount == 0 else None

# Coins [1, 3, 4], amount 6:
# Greedy: 4, 1, 1 -> 3 coins
# DP:     3, 3    -> 2 coins (optimal)
print(greedy_coins([1, 3, 4], 6))  # [4, 1, 1]: 3 coins
print(coin_change([1, 3, 4], 6))   # 2: optimal
```
Trace `greedy_coins([1,3,4], 6)`: `sorted=[4,3,1]`. `coin=4`: `6>=4`: append `4`, `amount=2`. `coin=3`: `2<3` skip. `coin=1`: append `1` (x2). Result=`[4,1,1]`, 3 coins. DP: `dp[6]`: `coin=3`: `dp[3]+1=dp[3]+1`. `dp[3]`: `coin=3`: `dp[0]+1=1` -> `dp[3]=1`. `dp[6]=dp[3]+1=2`. This proves that **greedy algorithms** can yield sub-optimal results on non-standard coin systems.

### Discard the throwaway
The `greedy_coins` implementation is discarded as it fails correctness for arbitrary systems.

### Project Change
- **Reference Source:** No reference counterpart — this is a standalone theory lesson.
- **Files affected:** None
- **Change type:** None
- **Location:** None
- **Dependencies:** None

### The New Code
```python
# No new code added to the project for this theory unit.
```

### The Updated Project
```python
# Project remains unchanged.
```
The file is unchanged, demonstrating that the greedy approach is excluded from our robust DP solution toolkit.

### Mechanical walkthrough
- `coins = sorted(coins, reverse=True)`: Sorts the coins in descending order to prioritize the largest denomination.
- `result = []`: Initializes a list to hold the chosen coins.
- `for coin in coins:`: Iterates over each coin, largest to smallest.
- `while amount >= coin:`: Continuously subtracts the coin while it fits into the remaining amount.
- `result.append(coin)`: Records the chosen coin.
- `amount -= coin`: Reduces the remaining amount.
- `return result if amount == 0 else None`: Returns the list of chosen coins if the exact amount was reached, otherwise `None`.

### CS lens
**Greedy Algorithms** solve problems by making locally optimal choices without looking ahead. They work perfectly for fractional knapsack or standard US currency (which has the "greedy-choice property"), but fail on 0-1 knapsack or arbitrary coin systems.

### SE lens
Design principle: **Correctness vs. Heuristics**. A greedy algorithm is a heuristic that is computationally much cheaper (O(n log n) for sorting plus O(amount) iteration) than full DP. The tradeoff is choosing between guaranteed optimality (DP) versus "good enough and fast" (greedy).

### Commands needed
None for this unit.

### Run it
Predicted confidently: `greedy_coins([1, 3, 4], 6)` returns `[4, 1, 1]` while DP correctly returns `2`.

### One sentence connecting to previous unit
Understanding when to reach for DP (guaranteed optimal) versus Greedy (fast but potentially incorrect) dictates how you approach performance scaling.

## Closing

### Connect the pieces
Trace `fib(6)` across our strategies:
- **Naive:** The function blindly branches `fib(5) + fib(4)`. By the time it computes `fib(6)`, `fib(2)` is redundantly calculated multiple times across a sprawling tree of `15` function calls.
- **Memoized:** The function branches, but caches. When `fib(6)` evaluates `fib(5)`, it caches all intermediate steps down to `0`. When the right side, `fib(4)`, is called, it instantly returns the cached value. Redundancy is destroyed, taking only `9` calls.
- **Tabulated:** The function builds an array `[0, 1, 0, 0, 0, 0, 0]`. It walks forward exactly `6` times. `table[2] = 1`, `table[3] = 2`, `table[4] = 3`, `table[5] = 5`, `table[6] = 8`. `8` is returned.

Both memoization and tabulation exploit overlapping subproblems and optimal substructure, transforming exponential explosions into simple linear sequences.
