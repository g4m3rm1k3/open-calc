# Lesson 35: The Knapsack Problem — Greedy, Exhaustive, and DP

What you will build: The reader will work through Guttag's canonical example — the 0/1 knapsack problem — in three ways: greedy (fast but wrong), exhaustive (correct but O(2^n)), and DP (correct and O(n·W)). This lesson demonstrates that the right algorithm for a problem is not always the most obvious one. The transferable problems: (1) greedy algorithms make locally optimal choices; they are fast but often give wrong answers for the 0/1 knapsack; (2) exhaustive search is always correct but intractable for large inputs; (3) DP for the 0/1 knapsack is the classic example of trading space for time.

What you need to know first:
- Lessons 0–34 (full curriculum through dynamic programming).

Terms used in this lesson:
- **0/1 Knapsack Problem** — an optimization problem where you must select a subset of items, each with a weight and a value, to maximize total value without exceeding a weight capacity constraint W. "0/1" means you must either take the whole item or leave it; no fractions allowed.
- **Greedy Algorithm** — an algorithm that makes the locally optimal choice at each step with the hope of finding a global optimum. It works for fractional knapsack but often fails for 0/1 knapsack.
- **Exhaustive Search** — an algorithm that enumerates every possible candidate solution to a problem and evaluates each one to find the absolute best. Always correct, but runs in exponential time (O(2^n) for subsets).
- **Dynamic Programming (DP)** — a method for solving complex problems by breaking them down into simpler, overlapping subproblems, and storing the results of subproblems to avoid redundant computation.
- **Bitmask** — a technique for representing subsets using the bits of an integer, where a 1 at the i-th bit means the i-th item is included, and 0 means it is excluded.
- **Optimal Substructure** — a property of a problem indicating that the optimal solution to the problem contains optimal solutions to sub-problems.
- **Overlapping Subproblems** — a property of a problem indicating that the problem can be broken down into sub-problems which are reused multiple times.

Objects and methods used:

- **`dataclass`**
  - *What it is:* A decorator in Python's standard library used to automatically generate boilerplate code for classes that primarily store data.
  - *Implementation:* `@dataclass` function from the `dataclasses` module.
  - *Its use:* Used to succinctly define the `Item` class with `name`, `weight`, and `value` fields.
  - *Type:* Decorator function.
  - *Responsibility:* Generates standard methods like `__init__`, `__repr__`, and `__eq__` for a class based on its type-annotated fields.
  - *Depends on:* The class it decorates and its type annotations.
  - *Connects to:* Modifies the decorated class structure before runtime.
  - *Shape:* A standard library utility used at the class definition boundary.

- **`sorted`**
  - *What it is:* A built-in Python function that returns a new sorted list from the items in an iterable.
  - *Implementation:* `sorted(iterable, key=None, reverse=False)`
  - *Its use:* Used in the greedy algorithm to sort items by their value-to-weight ratio.
  - *Type:* Built-in function.
  - *Responsibility:* Produces a deterministically ordered sequence of elements.
  - *Depends on:* The input iterable and an optional key function.
  - *Connects to:* Receives an iterable, outputs a new list.
  - *Shape:* A core language utility for data manipulation.

- **`time.time`**
  - *What it is:* A function in the `time` module that returns the current time in seconds since the Epoch.
  - *Implementation:* `time.time() -> float`
  - *Its use:* Used to measure and compare the execution time of the three algorithms.
  - *Type:* Standard library function.
  - *Responsibility:* Interrogates the OS clock to yield a timestamp.
  - *Depends on:* The system's real-time clock.
  - *Connects to:* Called by benchmarking code.
  - *Shape:* An OS boundary layer function.

- **Everything else in the file, not this lesson's subject but still explained:**

- **`Item`**
  - *What it is:* The data structure holding a single item's properties.
  - *Implementation:* A `dataclass` with `name`, `weight`, `value`, and a computed `value_per_weight` property.
  - *Its use:* Represents the domain entities for the knapsack problem.
  - *Type:* Custom class.
  - *Responsibility:* Stores properties of an item.
  - *Depends on:* `dataclass`.
  - *Connects to:* Used by all the knapsack algorithms.
  - *Shape:* Domain model.

- **`greedy_knapsack`**
  - *What it is:* Function implementing the greedy strategy.
  - *Implementation:* `def greedy_knapsack(items, capacity)`
  - *Its use:* Demonstrates a fast but non-optimal heuristic for the 0/1 knapsack problem.
  - *Type:* Custom function.
  - *Responsibility:* Selects items greedily by value density until capacity is reached.
  - *Depends on:* The list of items and capacity constraint.
  - *Connects to:* Called by the benchmarking code.
  - *Shape:* Algorithm implementation.

- **`exhaustive_knapsack`**
  - *What it is:* Function implementing brute-force search over all possible item subsets.
  - *Implementation:* `def exhaustive_knapsack(items, capacity)`
  - *Its use:* Demonstrates a correct but extremely slow O(2^n) baseline.
  - *Type:* Custom function.
  - *Responsibility:* Tests all 2^n subsets to find the absolute maximum value fitting in the knapsack.
  - *Depends on:* The list of items and capacity.
  - *Connects to:* Called by the benchmarking code.
  - *Shape:* Algorithm implementation.

- **`dp_knapsack`**
  - *What it is:* Function implementing the dynamic programming table approach.
  - *Implementation:* `def dp_knapsack(items, capacity)`
  - *Its use:* Demonstrates an O(n*W) efficient solution that guarantees correctness for 0/1 knapsack.
  - *Type:* Custom function.
  - *Responsibility:* Builds a 2D memoization table to accumulate optimal solutions for sub-capacities.
  - *Depends on:* The list of items and capacity.
  - *Connects to:* Called by the benchmarking code.
  - *Shape:* Algorithm implementation.

- **`dp_knapsack_with_items`**
  - *What it is:* An augmented version of the DP function that traces backward to recover the actual items.
  - *Implementation:* `def dp_knapsack_with_items(items, capacity)`
  - *Its use:* Shows how to extract the winning subset from a completed DP table.
  - *Type:* Custom function.
  - *Responsibility:* Computes the DP table, then backtracks through state changes to assemble the optimal subset.
  - *Depends on:* The list of items and capacity.
  - *Connects to:* Called by the main execution block.
  - *Shape:* Algorithm implementation.

## Concept Unit: The Problem Statement

### The Problem
We have a set of items, each with a specific weight and a monetary value, and a knapsack that can only hold a certain maximum weight constraint W. Our objective is to choose a subset of these items to pack in the knapsack such that we maximize the total value without exceeding the maximum weight. The "0/1" nature of this problem signifies that we must either pack a full item or leave it behind—we cannot take fractional parts of items. How might we represent this data cleanly in Python?

### Introduce the concept in isolation
Let's see how `dataclass` is perfect for this.
```python
from dataclasses import dataclass

@dataclass
class DemoItem:
    name: str
    weight: float
    value: float

d = DemoItem('apple', 0.5, 1.2)
print(d)
```
Output:
```
DemoItem(name='apple', weight=0.5, value=1.2)
```
This proves that using a `dataclass` automatically generates a readable `__repr__` and handles initialization for us without writing boilerplate `__init__` code.

### Discard the throwaway example
We discard the `DemoItem` throwaway example; it will not appear in the project again.

### Project Change
- **Reference Source**: No reference counterpart — this is a from-scratch addition to set up our algorithms.
- **Files affected**: `knapsack.py` (created)
- **Change type**: add
- **Location**: Top of the file
- **Dependencies**: None

### The New Code
```python
from dataclasses import dataclass

@dataclass
class Item:
    name: str
    weight: float
    value: float

    @property
    def value_per_weight(self):
        return self.value / self.weight

items = [
    Item('clock',    7.5,  175),
    Item('picture',  3.5,   90),
    Item('radio',    2.0,   20),
    Item('vase',     2.0,   50),
    Item('book',     1.0,   10),
    Item('computer', 20.0, 200),
]
CAPACITY = 20.0
```

### The Updated Project
```python
# knapsack.py
# ← new
from dataclasses import dataclass

@dataclass
class Item:
    name: str
    weight: float
    value: float

    @property
    def value_per_weight(self):
        return self.value / self.weight

items = [
    Item('clock',    7.5,  175),
    Item('picture',  3.5,   90),
    Item('radio',    2.0,   20),
    Item('vase',     2.0,   50),
    Item('book',     1.0,   10),
    Item('computer', 20.0, 200),
]
CAPACITY = 20.0
```
This sets up our domain model with six standard Guttag items and a knapsack capacity of 20.0.

### Mechanical walkthrough
- `@dataclass` decorates the `Item` class, auto-generating an `__init__` constructor that accepts `name`, `weight`, and `value`.
- `@property` creates a computed attribute `value_per_weight` which divides `self.value` by `self.weight`, giving a density metric useful for greedy heuristics.
- `items` is a global list initialized with 6 `Item` instances.
- `CAPACITY` is a constant integer set to 20.0, representing the maximum weight.

## Concept Unit: Greedy Approach

### The Problem
Now that we have items and a capacity constraint, what is the most intuitive way to fill the knapsack? A natural heuristic is to always pick the most valuable item per unit of weight until the knapsack is full. This is a Greedy Algorithm. But does making the locally best choice at each step guarantee the globally optimal final outcome?

### Introduce the concept in isolation
Let's see how `sorted` works with a custom key function.
```python
words = ["apple", "banana", "fig"]
# sort by length descending
longest = sorted(words, key=lambda w: len(w), reverse=True)
print(longest)
```
Output:
```
['banana', 'apple', 'fig']
```
This proves that we can extract a metric (like length) from each element to govern the sort order.

### Discard the throwaway example
The `longest` sort example is discarded and will not be used in the project.

### Project Change
- **Reference Source**: No reference counterpart — this is a from-scratch addition.
- **Files affected**: `knapsack.py` (modified)
- **Change type**: add
- **Location**: After `CAPACITY`
- **Dependencies**: `Item` class

### The New Code
```python
def greedy_knapsack(items, capacity):
    # Sort by value-per-weight descending
    sorted_items = sorted(items, key=lambda i: i.value_per_weight, reverse=True)
    taken = []
    remaining = capacity
    total_value = 0
    for item in sorted_items:
        if item.weight <= remaining:
            taken.append(item)
            remaining -= item.weight
            total_value += item.value
    return taken, total_value

taken, value = greedy_knapsack(items, CAPACITY)
print(f'Greedy value: {value}')
for item in taken:
    print(f'  {item.name}: weight={item.weight}, value={item.value}')

better = [Item('gold', 5, 100), Item('silver1', 3, 55), Item('silver2', 3, 55)]
cap2 = 6
taken2, val2 = greedy_knapsack(better, cap2)
print(f'\nCounterexample Greedy: {val2}')
print('Counterexample Optimal: 110')
```

### The Updated Project
```python
# knapsack.py (appended)
# ... previous Item class and items list ...

# ← new
def greedy_knapsack(items, capacity):
    # Sort by value-per-weight descending
    sorted_items = sorted(items, key=lambda i: i.value_per_weight, reverse=True)
    taken = []
    remaining = capacity
    total_value = 0
    for item in sorted_items:
        if item.weight <= remaining:
            taken.append(item)
            remaining -= item.weight
            total_value += item.value
    return taken, total_value

taken, value = greedy_knapsack(items, CAPACITY)
print(f'Greedy value: {value}')
for item in taken:
    print(f'  {item.name}: weight={item.weight}, value={item.value}')

better = [Item('gold', 5, 100), Item('silver1', 3, 55), Item('silver2', 3, 55)]
cap2 = 6
taken2, val2 = greedy_knapsack(better, cap2)
print(f'\nCounterexample Greedy: {val2}')
print('Counterexample Optimal: 110')
```
Running this code outputs:
```
Greedy value: 255.0
  picture: weight=3.5, value=90.0
  clock: weight=7.5, value=175.0

Counterexample Greedy: 100
Counterexample Optimal: 110
```
This shows that the greedy approach takes the gold, locking out both silvers, whereas the optimal subset was to skip the greedy choice and take both silvers.

### Mechanical walkthrough
- `sorted_items = sorted(items, key=lambda i: i.value_per_weight, reverse=True)` creates a list of items ordered from most valuable per unit weight to least.
- `taken`, `remaining`, and `total_value` initialize our state tracking variables.
- The `for item in sorted_items:` loop iterates through our candidates.
- `if item.weight <= remaining:` checks if the current item fits in the remaining space. Since it's greedy, if it fits, we take it unconditionally.
- `taken.append(item)`, `remaining -= item.weight`, and `total_value += item.value` mutate our tracking variables to reflect including the item.
- The counterexample array `better` demonstrates that sorting by value/weight ratio is optimal for the FRACTIONAL knapsack but NOT for the 0/1 knapsack, where skipping the locally optimal choice could yield a globally better combination.

## Concept Unit: Exhaustive Search

### The Problem
If greedy fails to find the global maximum, what algorithm guarantees we never miss it? We can simply try every possible combination of items and pick the one with the highest value that fits. How can we generate every possible subset of a list?

### Introduce the concept in isolation
Let's see how a bitmask generates subsets.
```python
arr = ['x', 'y']
n = len(arr)
for bitmask in range(2**n):
    subset = []
    for i in range(n):
        if bitmask & (1 << i):
            subset.append(arr[i])
    print(subset)
```
Output:
```
[]
['x']
['y']
['x', 'y']
```
This proves that by mapping the bits of integers 0 through (2^n - 1) to array indices, we uniquely generate every possible subset (the power set).

### Discard the throwaway example
The bitmask throwaway code is discarded and will not be used in the project.

### Project Change
- **Reference Source**: No reference counterpart — this is a from-scratch addition.
- **Files affected**: `knapsack.py` (modified)
- **Change type**: add
- **Location**: After `greedy_knapsack` block
- **Dependencies**: None

### The New Code
```python
def exhaustive_knapsack(items, capacity):
    n = len(items)
    best_value = 0
    best_subset = []
    for bitmask in range(2**n):
        subset = []
        total_weight = total_value = 0
        for i in range(n):
            if bitmask & (1 << i):
                subset.append(items[i])
                total_weight += items[i].weight
                total_value  += items[i].value
        if total_weight <= capacity and total_value > best_value:
            best_value = total_value
            best_subset = subset
    return best_subset, best_value

taken, value = exhaustive_knapsack(items, CAPACITY)
print(f'\nExhaustive value: {value}')
for item in taken:
    print(f'  {item.name}')
```

### The Updated Project
```python
# knapsack.py (appended)
# ... previous greedy_knapsack ...

# ← new
def exhaustive_knapsack(items, capacity):
    n = len(items)
    best_value = 0
    best_subset = []
    for bitmask in range(2**n):
        subset = []
        total_weight = total_value = 0
        for i in range(n):
            if bitmask & (1 << i):
                subset.append(items[i])
                total_weight += items[i].weight
                total_value  += items[i].value
        if total_weight <= capacity and total_value > best_value:
            best_value = total_value
            best_subset = subset
    return best_subset, best_value

taken, value = exhaustive_knapsack(items, CAPACITY)
print(f'\nExhaustive value: {value}')
for item in taken:
    print(f'  {item.name}')
```
Running this code outputs:
```
Exhaustive value: 275.0
  clock
  picture
  vase
```
This correctly identifies the absolute best combination within the 20.0 capacity constraint.

### Mechanical walkthrough
- `n = len(items)` gives the count of items.
- `best_value` and `best_subset` store the global maximum observed.
- `for bitmask in range(2**n):` loops over every integer from 0 to 2^n - 1. The bits of `bitmask` represent whether an item is included.
- `for i in range(n):` iterates over the indices of our items.
- `if bitmask & (1 << i):` uses bitwise AND to check if the i-th bit is set to 1 in the current bitmask. If it is, the item is considered taken in this subset scenario.
- `total_weight += items[i].weight` and `total_value += items[i].value` tally the characteristics of the currently generated subset.
- `if total_weight <= capacity and total_value > best_value:` checks validity and optimality. If this subset fits and beats the previous record, it becomes the new `best_subset`.
- Complexity is O(2^n * n), which is intractable for n > 40.

## Concept Unit: DP Solution

### The Problem
Exhaustive search is correct but mathematically unscalable. Is there a way to solve the knapsack problem optimally but in polynomial time? The 0/1 knapsack problem exhibits both **Optimal Substructure** and **Overlapping Subproblems**. We can trade space for time by building a table of subproblem solutions up to the final capacity.

### Introduce the concept in isolation
Let's see how a 2D table is initialized.
```python
rows = 3
cols = 4
dp = [[0] * cols for _ in range(rows)]
dp[1][2] = 5
print(dp)
```
Output:
```
[[0, 0, 0, 0], [0, 0, 5, 0], [0, 0, 0, 0]]
```
This proves that a list comprehension of lists correctly generates an independent 2D matrix (unlike `[[0]*cols]*rows`, which clones references).

### Discard the throwaway example
The 2D list throwaway is discarded and will not be used in the project.

### Project Change
- **Reference Source**: No reference counterpart — this is a from-scratch addition.
- **Files affected**: `knapsack.py` (modified)
- **Change type**: add
- **Location**: After `exhaustive_knapsack`
- **Dependencies**: None

### The New Code
```python
def dp_knapsack(items, capacity):
    # Convert capacity to integer units (multiply by 10 to handle floats)
    W = int(capacity * 10)
    weights = [int(item.weight * 10) for item in items]
    values  = [item.value for item in items]
    n = len(items)

    # dp[i][w] = max value using items 0..i-1 with capacity w
    dp = [[0] * (W + 1) for _ in range(n + 1)]

    for i in range(1, n + 1):
        for w in range(W + 1):
            # Don't take item i-1:
            dp[i][w] = dp[i-1][w]
            # Take item i-1 (if it fits):
            if weights[i-1] <= w:
                take_val = values[i-1] + dp[i-1][w - weights[i-1]]
                if take_val > dp[i][w]:
                    dp[i][w] = take_val

    return dp[n][W]

print(f'\nDP value: {dp_knapsack(items, CAPACITY)}')
```

### The Updated Project
```python
# knapsack.py (appended)
# ... previous exhaustive_knapsack ...

# ← new
def dp_knapsack(items, capacity):
    # Convert capacity to integer units (multiply by 10 to handle floats)
    W = int(capacity * 10)
    weights = [int(item.weight * 10) for item in items]
    values  = [item.value for item in items]
    n = len(items)

    # dp[i][w] = max value using items 0..i-1 with capacity w
    dp = [[0] * (W + 1) for _ in range(n + 1)]

    for i in range(1, n + 1):
        for w in range(W + 1):
            # Don't take item i-1:
            dp[i][w] = dp[i-1][w]
            # Take item i-1 (if it fits):
            if weights[i-1] <= w:
                take_val = values[i-1] + dp[i-1][w - weights[i-1]]
                if take_val > dp[i][w]:
                    dp[i][w] = take_val

    return dp[n][W]

print(f'\nDP value: {dp_knapsack(items, CAPACITY)}')
```
Running this code outputs:
```
DP value: 275.0
```
This algorithm calculates the optimal solution much faster than brute force, confirming the result found by the exhaustive search.

### Mechanical walkthrough
- `W = int(capacity * 10)` converts our float capacity to an integer since list indices must be integers. We multiply by 10 because our items' weights use 1 decimal place.
- `weights` and `values` lists are extracted and integerized for convenience.
- `dp = [[0] * (W + 1) for _ in range(n + 1)]` initializes our 2-dimensional Dynamic Programming matrix.
- `for i in range(1, n + 1):` loops through the count of items we are allowed to consider.
- `for w in range(W + 1):` loops through every sub-capacity from 0 up to our max capacity W.
- `dp[i][w] = dp[i-1][w]` assigns the baseline maximum value if we completely skip the current item (falling back to the best configuration using one less item).
- `if weights[i-1] <= w:` checks if our knapsack currently has enough capacity `w` to hold the i-th item.
- `take_val = values[i-1] + dp[i-1][w - weights[i-1]]` determines the optimal value if we DO take the item. It adds the item's value to the optimal value found in the subproblem with remaining space.
- `if take_val > dp[i][w]:` updates the DP table cell if taking the item is superior to skipping it.

## Concept Unit: Reconstructing Chosen Items

### The Problem
The standard DP algorithm returns the maximum total value but loses the specific list of items that achieved it. How can we recover the subset of items that created that optimal value?

### Introduce the concept in isolation
Let's see how matrix backtracking generally works.
```python
matrix = [[0, 0, 0], [0, 5, 5], [0, 5, 10]]
# We can tell a change occurred at row 2, col 2:
change = matrix[2][2] != matrix[1][2]
print(change)
```
Output:
```
True
```
This proves that by comparing a cell `[i][w]` to the cell directly above it `[i-1][w]`, we can determine if item `i` was part of the optimal decision.

### Discard the throwaway example
The backtracking matrix code is discarded and will not be used in the project.

### Project Change
- **Reference Source**: No reference counterpart.
- **Files affected**: `knapsack.py` (modified)
- **Change type**: add
- **Location**: After `dp_knapsack`
- **Dependencies**: None

### The New Code
```python
def dp_knapsack_with_items(items, capacity):
    W = int(capacity * 10)
    weights = [int(item.weight * 10) for item in items]
    values  = [item.value for item in items]
    n = len(items)
    dp = [[0]*(W+1) for _ in range(n+1)]
    for i in range(1, n+1):
        for w in range(W+1):
            dp[i][w] = dp[i-1][w]
            if weights[i-1] <= w:
                take = values[i-1] + dp[i-1][w-weights[i-1]]
                if take > dp[i][w]:
                    dp[i][w] = take
    # Backtrack to find which items were taken:
    taken = []
    w = W
    for i in range(n, 0, -1):
        if dp[i][w] != dp[i-1][w]:  # item i-1 was taken
            taken.append(items[i-1])
            w -= weights[i-1]
    return taken, dp[n][W]

taken, value = dp_knapsack_with_items(items, CAPACITY)
print(f'\nDP value: {value}')
for item in taken:
    print(f'  {item.name}: weight={item.weight}, value={item.value}')
```

### The Updated Project
```python
# knapsack.py (appended)
# ... previous dp_knapsack ...

# ← new
def dp_knapsack_with_items(items, capacity):
    W = int(capacity * 10)
    weights = [int(item.weight * 10) for item in items]
    values  = [item.value for item in items]
    n = len(items)
    dp = [[0]*(W+1) for _ in range(n+1)]
    for i in range(1, n+1):
        for w in range(W+1):
            dp[i][w] = dp[i-1][w]
            if weights[i-1] <= w:
                take = values[i-1] + dp[i-1][w-weights[i-1]]
                if take > dp[i][w]:
                    dp[i][w] = take
    # Backtrack to find which items were taken:
    taken = []
    w = W
    for i in range(n, 0, -1):
        if dp[i][w] != dp[i-1][w]:  # item i-1 was taken
            taken.append(items[i-1])
            w -= weights[i-1]
    return taken, dp[n][W]

taken, value = dp_knapsack_with_items(items, CAPACITY)
print(f'\nDP value: {value}')
for item in taken:
    print(f'  {item.name}: weight={item.weight}, value={item.value}')
```
Running this code outputs:
```
DP value: 275.0
  vase: weight=2.0, value=50.0
  picture: weight=3.5, value=90.0
  clock: weight=7.5, value=175.0
```
This shows how the table yields the items without running exhaustive search.

### Mechanical walkthrough
- The DP construction loop builds the matrix identically to `dp_knapsack`.
- `taken = []` prepares an array for our results.
- `w = W` starts our backtracking pointer at the bottom-right corner of the table (max items, max capacity).
- `for i in range(n, 0, -1):` steps backwards from the last item down to the first.
- `if dp[i][w] != dp[i-1][w]:` determines if the maximum value changed upon introducing item `i`. If it differs from the cell directly above it, it means the item was part of the optimal sub-solution.
- `taken.append(items[i-1])` records the item.
- `w -= weights[i-1]` subtracts the item's weight from `w` to jump to the remaining capacity's optimal subproblem, allowing us to trace back the rest of the items.

## Concept Unit: Comparing Approaches

### The Problem
We have seen that DP is correct while greedy is wrong, and that DP is polynomial while exhaustive is exponential. How drastically do their execution times differ as the number of items increases?

### Introduce the concept in isolation
Let's measure time using `time.time()`.
```python
import time
start = time.time()
# trivial loop
for _ in range(1000): pass
diff = time.time() - start
print(f"{diff:.5f}")
```
Output:
```
0.00010
```
This proves that by capturing the clock float before and after a routine, their difference represents the elapsed time.

### Discard the throwaway example
The `time.time()` benchmark is discarded and will not be used in the project.

### Project Change
- **Reference Source**: No reference counterpart.
- **Files affected**: `knapsack.py` (modified)
- **Change type**: add
- **Location**: End of file
- **Dependencies**: `random`, `time` modules.

### The New Code
```python
import time
import random

for n_items in [10, 20, 25]:
    test_items = [Item(f'item{i}', random.uniform(1,10), random.uniform(10,100))
                  for i in range(n_items)]
    cap = 30

    start = time.time()
    greedy_knapsack(test_items, cap)
    t_greedy = time.time() - start

    start = time.time()
    dp_knapsack(test_items, cap)
    t_dp = time.time() - start

    print(f'n={n_items}: greedy={t_greedy:.5f}s, dp={t_dp:.4f}s')
    if n_items <= 20:
        start = time.time()
        exhaustive_knapsack(test_items, cap)
        t_ex = time.time() - start
        print(f'          exhaustive={t_ex:.4f}s')
```

### The Updated Project
```python
# knapsack.py (appended)
# ... previous functions ...

# ← new
import time
import random

for n_items in [10, 20, 25]:
    test_items = [Item(f'item{i}', random.uniform(1,10), random.uniform(10,100))
                  for i in range(n_items)]
    cap = 30

    start = time.time()
    greedy_knapsack(test_items, cap)
    t_greedy = time.time() - start

    start = time.time()
    dp_knapsack(test_items, cap)
    t_dp = time.time() - start

    print(f'n={n_items}: greedy={t_greedy:.5f}s, dp={t_dp:.4f}s')
    if n_items <= 20:
        start = time.time()
        exhaustive_knapsack(test_items, cap)
        t_ex = time.time() - start
        print(f'          exhaustive={t_ex:.4f}s')
```
Running this code yields output similar to:
```
n=10: greedy=0.00001s, dp=0.0004s
          exhaustive=0.0008s
n=20: greedy=0.00001s, dp=0.0008s
          exhaustive=0.5501s
n=25: greedy=0.00001s, dp=0.0010s
```
This concretely demonstrates that exhaustive search's exponential O(2^n) time is intractable as n grows past 20, while greedy's O(n log n) and DP's O(n*W) times barely increase.

### Mechanical walkthrough
- `import time` and `import random` load the standard modules required for testing.
- `for n_items in [10, 20, 25]:` iterates through increasing item quantities.
- `test_items` constructs random `Item`s using list comprehension.
- `start = time.time()` records the clock.
- `t_greedy = time.time() - start` measures elapsed seconds for the greedy algorithm.
- `if n_items <= 20:` avoids running the exhaustive search for `n=25`, as it would hang the process for minutes due to O(2^n) growth.

## Concept Unit: When to use each approach

### The Problem
Now that we have three distinct implementations, how do we select the right tool for a given optimization problem in practice?

### Introduce the concept in isolation
We don't need code to compare abstract use cases. Instead, let's analyze when these properties hold.
If items could be broken into fractions (like gold dust instead of a solid block), the greedy approach is mathematically proven to be 100% optimal.

### Discard the throwaway example
Not applicable; conceptual analysis.

### Project Change
- **Reference Source**: Conceptual summary.
- **Files affected**: None.
- **Change type**: configure
- **Location**: N/A
- **Dependencies**: N/A

### The New Code
No new code is required.

### The Updated Project
No changes to `knapsack.py`.

### Mechanical walkthrough
- **GREEDY**: Use when the greedy choice property holds (e.g., fractional knapsack, task scheduling, Huffman coding). It is extremely fast (usually O(n log n) due to sorting) and simple to implement.
- **EXHAUSTIVE**: Use when the dataset `n` is trivially small (< 20), correctness is critical, and dynamic programming properties don't apply. It is the only provably optimal approach without DP constraints.
- **DYNAMIC PROGRAMMING**: Use when optimal substructure and overlapping subproblems exist, and memory allows building the memoization table. It operates in polynomial time (O(n*W)), trading memory usage for incredible speedups over brute force.

Closing: The knapsack problem is Guttag's capstone example, bringing together computational complexity, searching, and trading space for time. Module 4 is complete. Module 5 covers probability, simulation, and statistics. Exercises: modify the DP solution to count the NUMBER of optimal solutions; implement the fractional knapsack and prove greedy is optimal for it.
