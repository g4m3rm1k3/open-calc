# Lesson 35: The Knapsack Problem — Greedy, Exhaustive, and DP

**What you will build**
The reader understands the 0/1 knapsack problem and three approaches: greedy (fast, suboptimal), exhaustive/brute-force (optimal, exponential), and dynamic programming (optimal, polynomial). The transferable insight: the knapsack problem is a canonical NP-hard problem in its general form, but with integer weights, DP gives O(n * capacity) pseudo-polynomial time. This is the pattern for resource allocation, scheduling, and portfolio optimization.

**What you need to know first**
Lessons 00-34.

**Terms used in this lesson**
- **0/1 Knapsack Problem** — A combinatorial optimization problem where items have weights and values, and the goal is to maximize total value without exceeding a weight limit. Each item can be taken at most once (0 or 1).
- **Greedy approach** — A heuristic algorithm that makes the locally optimal choice at each stage with the intent of finding a global optimum. Fast but suboptimal for this problem.
- **Exhaustive search** — A brute-force algorithm that checks every possible combination of items to find the global optimum. Optimal but computationally explosive (exponential time).
- **Dynamic programming (DP)** — An algorithm design technique that breaks a problem down into overlapping subproblems, solving each once and storing the result to avoid redundant work. Optimal and pseudo-polynomial time for integer knapsack.
- **Pseudo-polynomial time** — A time complexity that is polynomial in the numeric value of the input (like the capacity), but exponential in the length of the input (number of bits to represent it).

**Objects and methods used**
- `dataclass`
  - *What it is:* A Python decorator used to automatically generate special methods like `__init__` and `__repr__` for user-defined classes.
  - *Implementation:* `@dataclass` decorator on a class definition.
  - *Its use:* Used to define the `Item` class concisely.
  - *Type:* Decorator (function taking a class and returning a class).
  - *Responsibility:* Automatically creates boilerplate code for classes that primarily store state.
  - *Depends on:* Class definition with type-hinted attributes.
  - *Connects to:* Modifies the class to include standard methods; called by Python runtime when reading the class.
  - *Shape:* A utility from the `dataclasses` module, standard library.
- `sorted`
  - *What it is:* A built-in Python function that returns a new sorted list from an iterable.
  - *Implementation:* `sorted(iterable, key=key_func, reverse=True)`
  - *Its use:* Used to sort the items by density for the greedy approach.
  - *Type:* Built-in function.
  - *Responsibility:* Creates a new list containing all items from the iterable in ascending (or descending) order.
  - *Depends on:* An iterable and optionally a `key` function and `reverse` boolean flag.
  - *Connects to:* Calls the `key` function on each element if provided; returns a list.
  - *Shape:* Python built-in standard library function.
- `time.perf_counter`
  - *What it is:* A function that returns the value of a performance counter, a clock with the highest available resolution to measure a short duration.
  - *Implementation:* `time.perf_counter()` returns a float.
  - *Its use:* Used to time the execution of different approaches in the complexity comparison.
  - *Type:* Standard library function from the `time` module.
  - *Responsibility:* Provides a precise monotonic time value for benchmarking.
  - *Depends on:* Nothing (takes no arguments).
  - *Connects to:* The operating system's highest resolution clock.
  - *Shape:* A utility from the standard library used for benchmarking.

## Concept Unit: Greedy Approach

### The Problem
How can we select items to maximize value without exceeding a weight capacity? If you were packing a backpack and could only take so much weight, what would you naturally try first? Would picking the most valuable items first work? What about picking the lightest? Or perhaps the ones with the highest value-to-weight ratio?

### Introduce the concept in isolation
```python
def example_greedy(items_dict, limit):
    # Take items by highest value first
    sorted_items = sorted(items_dict.items(), key=lambda x: x[1], reverse=True)
    total = 0
    taken = []
    for name, val in sorted_items:
        if total + val <= limit:
            taken.append(name)
            total += val
    return taken

print(example_greedy({'A': 3, 'B': 4, 'C': 5}, 5))
```
Predicted confidently: `['C']`

This proves that a **greedy approach** takes the locally best option (highest value) but may miss better combinations (like taking A and B, which sum to 7, while C is only 5).

### Discard the throwaway
The code above is discarded and will not appear in the project again.

### Project Change
- **Reference Source**: None - this is a standalone theory lesson.
- **Files affected**: `knapsack.py` (created)
- **Change type**: add
- **Location**: brand-new file
- **Dependencies**: none

### The New Code
```python
from dataclasses import dataclass

@dataclass
class Item:
    name: str
    weight: float
    value: float

    def density(self):
        return self.value / self.weight

def greedy_knapsack(items, capacity, key=None):
    if key is None:
        key = lambda x: x.density()
    sorted_items = sorted(items, key=key, reverse=True)
    total_weight = 0.0
    total_value = 0.0
    taken = []
    for item in sorted_items:
        if total_weight + item.weight <= capacity:
            taken.append(item.name)
            total_weight += item.weight
            total_value += item.value
    return taken, total_value
```

### The Updated Project
```python
1: from dataclasses import dataclass
2: 
3: @dataclass
4: class Item:
5:     name: str
6:     weight: float
7:     value: float
8: 
9:     def density(self):
10:         return self.value / self.weight
11: 
12: def greedy_knapsack(items, capacity, key=None):
13:     if key is None:
14:         key = lambda x: x.density()
15:     sorted_items = sorted(items, key=key, reverse=True)
16:     total_weight = 0.0
17:     total_value = 0.0
18:     taken = []
19:     for item in sorted_items:
20:         if total_weight + item.weight <= capacity:
21:             taken.append(item.name)
22:             total_weight += item.weight
23:             total_value += item.value
24:     return taken, total_value
```
The file now defines the items and a greedy function that sorts and packs them.

### Mechanical walkthrough
- `@dataclass` decorates the `Item` class, automatically giving it an initializer and representation based on its attributes.
- `class Item:` defines a new class named `Item`.
- `name: str` defines a string attribute.
- `weight: float` defines a float attribute.
- `value: float` defines a float attribute.
- `def density(self):` defines a method to calculate value per unit weight.
- `return self.value / self.weight` calculates and returns the density.
- `def greedy_knapsack(items, capacity, key=None):` defines the greedy algorithm function.
- `if key is None:` checks if a sorting key function was provided.
- `key = lambda x: x.density()` provides a default sorting key using density.
- `sorted_items = sorted(items, key=key, reverse=True)` creates a new list sorted highest-to-lowest by the key.
- `total_weight = 0.0` initializes the accumulator for weight.
- `total_value = 0.0` initializes the accumulator for value.
- `taken = []` initializes a list to hold selected item names.
- `for item in sorted_items:` iterates over the sorted items.
- `if total_weight + item.weight <= capacity:` checks if adding the current item exceeds the limit.
- `taken.append(item.name)` adds the item's name to the list of chosen items.
- `total_weight += item.weight` adds the item's weight to the running total.
- `total_value += item.value` adds the item's value to the running total.
- `return taken, total_value` returns the final selection and its value.

### CS lens
The **greedy approach** makes a locally optimal choice at each step. Real-world uses: coin change (when denominations are standard), Huffman coding, Dijkstra's algorithm.

### SE lens
Design principle: **Heuristics vs. Optimality**. A real tradeoff: getting a "good enough" answer in a fraction of a millisecond versus finding the absolute best answer but taking years to compute.

### Commands needed
None for this unit.

### Run it
Predicted confidently: `(['A', 'B'], 7)`

### One sentence connecting to previous unit
The greedy approach was fast but missed the best combination, so we must explore other methods.


## Concept Unit: Exhaustive Search

### The Problem
Since the greedy approach isn't perfect, how can we guarantee we find the absolute best combination? What if we literally just try every single possible way to pack the backpack? How many ways are there?

### Introduce the concept in isolation
```python
def example_combinations(n):
    for mask in range(2**n):
        combo = []
        for i in range(n):
            if mask & (1 << i):
                combo.append(i)
        print(combo)

example_combinations(3)
```
Predicted confidently: 
`[]`
`[0]`
`[1]`
`[0, 1]`
`[2]`
`[0, 2]`
`[1, 2]`
`[0, 1, 2]`

This proves that bitmasking can generate an **exhaustive search** of all subsets.

### Discard the throwaway
The code above is discarded and will not appear in the project again.

### Project Change
- **Reference Source**: None - this is a standalone theory lesson.
- **Files affected**: `knapsack.py` (modified)
- **Change type**: add
- **Location**: bottom of the file
- **Dependencies**: previous code

### The New Code
```python
def exhaustive_knapsack(items, capacity):
    n = len(items)
    best_value = 0
    best_combo = []

    for mask in range(2**n):    # iterate all 2^n subsets
        total_weight = 0
        total_value = 0
        taken = []
        for i in range(n):
            if mask & (1 << i):   # bit i is set: item i is included
                total_weight += items[i].weight
                total_value  += items[i].value
                taken.append(items[i].name)
        if total_weight <= capacity and total_value > best_value:
            best_value = total_value
            best_combo = taken

    return best_combo, best_value
```

### The Updated Project
```python
25: def exhaustive_knapsack(items, capacity): # <- new
26:     n = len(items)
27:     best_value = 0
28:     best_combo = []
29: 
30:     for mask in range(2**n):    # iterate all 2^n subsets
31:         total_weight = 0
32:         total_value = 0
33:         taken = []
34:         for i in range(n):
35:             if mask & (1 << i):   # bit i is set: item i is included
36:                 total_weight += items[i].weight
37:                 total_value  += items[i].value
38:                 taken.append(items[i].name)
39:         if total_weight <= capacity and total_value > best_value:
40:             best_value = total_value
41:             best_combo = taken
42: 
43:     return best_combo, best_value
```
The file now contains a brute-force approach to guarantee the optimal result.

### Mechanical walkthrough
- `def exhaustive_knapsack(items, capacity):` defines the function.
- `n = len(items)` gets the number of items.
- `best_value = 0` tracks the highest valid value found.
- `best_combo = []` tracks the item names for the highest valid value.
- `for mask in range(2**n):` loops from `0` to `2^n - 1`, representing all binary combinations.
- `total_weight = 0` resets the weight for the current subset.
- `total_value = 0` resets the value for the current subset.
- `taken = []` resets the list of taken items for the current subset.
- `for i in range(n):` loops through each item index.
- `if mask & (1 << i):` checks if the `i`-th bit is set in `mask`.
- `total_weight += items[i].weight` adds the item's weight if the bit is set.
- `total_value += items[i].value` adds the item's value if the bit is set.
- `taken.append(items[i].name)` adds the item's name to the subset list.
- `if total_weight <= capacity and total_value > best_value:` checks if the subset is valid and better than the previous best.
- `best_value = total_value` updates the best value.
- `best_combo = taken` updates the best combination of items.
- `return best_combo, best_value` returns the overall optimal choice.

### CS lens
**Exhaustive search** or brute-force guarantees correctness but explodes combinatorially. Real-world uses: password cracking, small-scale traveling salesperson problems, verifying optimization algorithms.

### SE lens
Design principle: **Scalability**. An O(2^n) algorithm works fine for n=10, but fails completely for n=50. The tradeoff is knowing your input bounds before choosing an algorithm.

### Commands needed
None for this unit.

### Run it
Predicted confidently: `(['A', 'B'], 7)`

### One sentence connecting to previous unit
Exhaustive search gave us the perfect answer, but at a terrible computational cost, leading us to look for a middle ground.


## Concept Unit: Dynamic Programming

### The Problem
If greedy is too inaccurate and exhaustive is too slow, is there a way to reuse work so we don't recalculate the same subsets over and over? What if we built up the solution item by item, capacity by capacity?

### Introduce the concept in isolation
```python
def example_dp():
    # A simple 1D DP array building up sums
    dp = [0, 0, 0, 0, 0]
    for i in range(1, 5):
        dp[i] = dp[i-1] + i
    return dp

print(example_dp())
```
Predicted confidently: `[0, 1, 3, 6, 10]`

This proves that **dynamic programming** stores intermediate results to build up a final answer step-by-step.

### Discard the throwaway
The code above is discarded and will not appear in the project again.

### Project Change
- **Reference Source**: None - this is a standalone theory lesson.
- **Files affected**: `knapsack.py` (modified)
- **Change type**: add
- **Location**: bottom of the file
- **Dependencies**: previous code

### The New Code
```python
def dp_knapsack(items, capacity):
    n = len(items)
    # dp[i][w] = max value using items[0..i-1] with weight limit w
    dp = [[0] * (capacity + 1) for _ in range(n + 1)]

    for i in range(1, n + 1):
        item = items[i-1]
        w = int(item.weight)  # assume integer weights for DP
        v = item.value
        for c in range(capacity + 1):
            # Option 1: don't take item i
            dp[i][c] = dp[i-1][c]
            # Option 2: take item i (if it fits)
            if c >= w:
                take = dp[i-1][c-w] + v
                if take > dp[i][c]:
                    dp[i][c] = take

    return dp[n][capacity]
```

### The Updated Project
```python
45: def dp_knapsack(items, capacity): # <- new
46:     n = len(items)
47:     # dp[i][w] = max value using items[0..i-1] with weight limit w
48:     dp = [[0] * (capacity + 1) for _ in range(n + 1)]
49: 
50:     for i in range(1, n + 1):
51:         item = items[i-1]
52:         w = int(item.weight)  # assume integer weights for DP
53:         v = item.value
54:         for c in range(capacity + 1):
55:             # Option 1: don't take item i
56:             dp[i][c] = dp[i-1][c]
57:             # Option 2: take item i (if it fits)
58:             if c >= w:
59:                 take = dp[i-1][c-w] + v
60:                 if take > dp[i][c]:
61:                     dp[i][c] = take
62: 
63:     return dp[n][capacity]
```
The file now contains a polynomial-time dynamic programming solution for integer weights.

### Mechanical walkthrough
- `def dp_knapsack(items, capacity):` defines the function.
- `n = len(items)` gets the number of items.
- `dp = [[0] * (capacity + 1) for _ in range(n + 1)]` creates a 2D list filled with zeroes.
- `for i in range(1, n + 1):` iterates over the items (1-indexed for the DP table).
- `item = items[i-1]` gets the actual item from the 0-indexed list.
- `w = int(item.weight)` casts the weight to an integer to use as an array index.
- `v = item.value` extracts the item's value.
- `for c in range(capacity + 1):` iterates through every possible capacity up to the limit.
- `dp[i][c] = dp[i-1][c]` carries over the max value found without using the current item.
- `if c >= w:` checks if the current capacity can hold the current item's weight.
- `take = dp[i-1][c-w] + v` calculates the value if we *do* take the item (value of the remaining capacity plus this item's value).
- `if take > dp[i][c]:` compares the "take" option against the "don't take" option.
- `dp[i][c] = take` updates the table if taking the item is better.
- `return dp[n][capacity]` returns the value in the bottom-right corner of the table, which represents considering all items at full capacity.

### CS lens
**Dynamic programming** uses memoization or tabulation to avoid repeating work. Real-world uses: DNA sequence alignment, route planning, git diff algorithms.

### SE lens
Design principle: **Space-Time Tradeoff**. We use O(n * capacity) memory to reduce time complexity from exponential to pseudo-polynomial.

### Commands needed
None for this unit.

### Run it
Predicted confidently: `7`

### One sentence connecting to previous unit
The DP approach gave us the optimal value extremely fast, but it didn't tell us *which* items we actually picked to get that value.


## Concept Unit: Backtracking

### The Problem
We know the maximum value is 7, but how do we extract the list of items? If you traced your steps forward to build the answer, how can you walk backward to see the choices you made?

### Introduce the concept in isolation
```python
def example_backtrack():
    path = [0, 1, 3, 6]
    steps = []
    for i in range(3, 0, -1):
        if path[i] != path[i-1]:
            steps.append(path[i] - path[i-1])
    return steps

print(example_backtrack())
```
Predicted confidently: `[3, 2, 1]`

This proves that **backtracking** through intermediate states allows us to reconstruct the individual decisions that led to the final outcome.

### Discard the throwaway
The code above is discarded and will not appear in the project again.

### Project Change
- **Reference Source**: None - this is a standalone theory lesson.
- **Files affected**: `knapsack.py` (modified)
- **Change type**: add
- **Location**: bottom of the file
- **Dependencies**: previous code

### The New Code
```python
def dp_knapsack_with_items(items, capacity):
    n = len(items)
    dp = [[0]*(capacity+1) for _ in range(n+1)]

    for i in range(1, n+1):
        w = int(items[i-1].weight)
        v = items[i-1].value
        for c in range(capacity+1):
            dp[i][c] = dp[i-1][c]
            if c >= w and dp[i-1][c-w] + v > dp[i][c]:
                dp[i][c] = dp[i-1][c-w] + v

    # Backtrack to find which items
    taken = []
    c = capacity
    for i in range(n, 0, -1):
        if dp[i][c] != dp[i-1][c]:  # item i was taken
            taken.append(items[i-1].name)
            c -= int(items[i-1].weight)

    return dp[n][capacity], taken[::-1]
```

### The Updated Project
```python
65: def dp_knapsack_with_items(items, capacity): # <- new
66:     n = len(items)
67:     dp = [[0]*(capacity+1) for _ in range(n+1)]
68: 
69:     for i in range(1, n+1):
70:         w = int(items[i-1].weight)
71:         v = items[i-1].value
72:         for c in range(capacity+1):
73:             dp[i][c] = dp[i-1][c]
74:             if c >= w and dp[i-1][c-w] + v > dp[i][c]:
75:                 dp[i][c] = dp[i-1][c-w] + v
76: 
77:     # Backtrack to find which items
78:     taken = []
79:     c = capacity
80:     for i in range(n, 0, -1):
81:         if dp[i][c] != dp[i-1][c]:  # item i was taken
82:             taken.append(items[i-1].name)
83:             c -= int(items[i-1].weight)
84: 
85:     return dp[n][capacity], taken[::-1]
```
The DP solution now also tracks and returns the specific items chosen.

### Mechanical walkthrough
- `def dp_knapsack_with_items(items, capacity):` defines the function.
- `n = len(items)` gets the number of items.
- `dp = [[0]*(capacity+1) for _ in range(n+1)]` creates the 2D DP table.
- `for i in range(1, n+1):` iterates items to fill the table.
- `w = int(items[i-1].weight)` extracts integer weight.
- `v = items[i-1].value` extracts value.
- `for c in range(capacity+1):` iterates capacities.
- `dp[i][c] = dp[i-1][c]` defaults to not taking the item.
- `if c >= w and dp[i-1][c-w] + v > dp[i][c]:` checks if taking the item yields a strictly better value.
- `dp[i][c] = dp[i-1][c-w] + v` updates the table with the higher value.
- `taken = []` initializes the backtracking list.
- `c = capacity` starts backtracking at the maximum capacity.
- `for i in range(n, 0, -1):` loops backward through the items.
- `if dp[i][c] != dp[i-1][c]:` checks if the value changed between the previous row and current row, which implies the item was taken.
- `taken.append(items[i-1].name)` adds the item to the list of chosen items.
- `c -= int(items[i-1].weight)` reduces the remaining capacity by the taken item's weight.
- `return dp[n][capacity], taken[::-1]` returns the max value and the reversed list of taken items (since backtracking finds them in reverse order).

### CS lens
**Backtracking** through a DP table reconstructs the sequence of optimal choices without needing to store full arrays of items inside the table itself. Real-world uses: routing protocol path reconstruction, reconstructing the edits in a Levenshtein distance calculation.

### SE lens
Design principle: **Data Representation**. Storing just the values and backtracking to reconstruct the path is much more memory efficient than storing the actual lists of items in every cell of the DP table.

### Commands needed
None for this unit.

### Run it
Predicted confidently: `(7, ['A', 'B'])`

### One sentence connecting to previous unit
Now that we have optimal code that also gives us the items, we need to prove why going through the trouble of writing DP is necessary.


## Concept Unit: Complexity Comparison

### The Problem
Does algorithm choice actually matter in practice? When the number of items grows, how does O(2^n) compare to O(n * W)?

### Introduce the concept in isolation
```python
def example_growth():
    print("Linear vs Exponential:")
    for n in [10, 20]:
        print(f"n={n}: 50*n={50*n}, 2^n={2**n}")

example_growth()
```
Predicted confidently:
`Linear vs Exponential:`
`n=10: 50*n=500, 2^n=1024`
`n=20: 50*n=1000, 2^n=1048576`

This proves that **exponential growth** rapidly overtakes polynomial growth, even for small inputs.

### Discard the throwaway
The code above is discarded and will not appear in the project again.

### Project Change
- **Reference Source**: None - this is a standalone theory lesson.
- **Files affected**: `knapsack.py` (modified)
- **Change type**: add
- **Location**: bottom of the file
- **Dependencies**: previous code

### The New Code
```python
import time

def time_all(n_items, capacity):
    import random
    items = [Item(f'I{i}', random.randint(1,10), random.randint(1,20))
             for i in range(n_items)]

    # Exhaustive: O(2^n)
    if n_items <= 20:
        t0 = time.perf_counter()
        exhaustive_knapsack(items, capacity)
        t_ex = time.perf_counter() - t0
    else:
        t_ex = float('inf')

    # DP: O(n * capacity)
    t0 = time.perf_counter()
    dp_knapsack(items, capacity)
    t_dp = time.perf_counter() - t0

    print(f'n={n_items}, cap={capacity}: exhaustive={t_ex:.4f}s, dp={t_dp:.4f}s')
```

### The Updated Project
```python
87: import time # <- new
88: 
89: def time_all(n_items, capacity): # <- new
90:     import random
91:     items = [Item(f'I{i}', random.randint(1,10), random.randint(1,20))
92:              for i in range(n_items)]
93: 
94:     # Exhaustive: O(2^n)
95:     if n_items <= 20:
96:         t0 = time.perf_counter()
97:         exhaustive_knapsack(items, capacity)
98:         t_ex = time.perf_counter() - t0
99:     else:
100:         t_ex = float('inf')
101: 
102:     # DP: O(n * capacity)
103:     t0 = time.perf_counter()
104:     dp_knapsack(items, capacity)
105:     t_dp = time.perf_counter() - t0
106: 
107:     print(f'n={n_items}, cap={capacity}: exhaustive={t_ex:.4f}s, dp={t_dp:.4f}s')
```
The file now includes a profiling function to empirically test execution times.

### Mechanical walkthrough
- `import time` imports the standard library time module.
- `def time_all(n_items, capacity):` defines the profiling function.
- `import random` imports the random module locally.
- `items = [Item(f'I{i}', random.randint(1,10), random.randint(1,20)) for i in range(n_items)]` creates a list of random items using a list comprehension.
- `if n_items <= 20:` restricts exhaustive search to small inputs.
- `t0 = time.perf_counter()` captures the precise start time.
- `exhaustive_knapsack(items, capacity)` runs the brute-force search.
- `t_ex = time.perf_counter() - t0` calculates the elapsed time for exhaustive.
- `else: t_ex = float('inf')` assigns infinity if the input is too large, avoiding locking up the machine.
- `t0 = time.perf_counter()` captures the start time for DP.
- `dp_knapsack(items, capacity)` runs the DP function.
- `t_dp = time.perf_counter() - t0` calculates the elapsed time for DP.
- `print(...)` outputs the formatted timing results.

### CS lens
**Algorithmic complexity** dictates whether a solution is viable. An O(n * W) pseudo-polynomial algorithm is practically fast for reasonable weights, while O(2^n) is entirely unscalable. Real-world uses: cryptography relies on the fact that some problems only have exponential-time solutions.

### SE lens
Design principle: **Empirical Measurement**. Theoretical Big-O notation is crucial, but writing small benchmark scripts proves the practical impact of those choices on real hardware.

### Commands needed
python3

### Run it
Predicted confidently:
`n=10, cap=50: exhaustive=0.0010s, dp=0.0001s`
`n=20, cap=50: exhaustive=1.2000s, dp=0.0002s`
`n=50, cap=50: exhaustive=inf, dp=0.0005s`

### One sentence connecting to previous unit
By comparing the running times, we proved why learning the DP pattern was worth the extra cognitive load.

## Closing
### Connect the pieces
We traced solving the knapsack problem with `capacity=5` and `items=[(w=2,v=3),(w=3,v=4),(w=4,v=5)]` across three different techniques. 
1. The **greedy approach** picked the items with the highest value-to-weight ratio (density). It selected A and then B for a total weight of 5 and value of 7. It was fast but risky.
2. The **exhaustive search** evaluated all 8 subsets: `{}`, `{A}`, `{B}`, `{C}`, `{A,B}`, `{A,C}`, `{B,C}`, `{A,B,C}`. It saw that `{A,B}` gave a valid 7, while `{B,C}` was too heavy, proving 7 was the optimal answer.
3. The **dynamic programming** approach constructed a table from the bottom up, recording `dp[3][5]=7`, and **backtracking** proved that skipping C and taking B and A led exactly to the optimal value of 7. DP gave us the certainty of exhaustive search with the speed required for large real-world applications.
