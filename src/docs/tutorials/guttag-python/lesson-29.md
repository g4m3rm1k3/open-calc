# Lesson 29: Algorithmic Complexity — Big-O Notation

What you will build: The reader understands Big-O notation: O(1), O(log n), O(n), O(n log n), O(n^2), O(2^n), how to derive complexity by counting operations, and why it matters. The transferable insight: Big-O measures how WORK GROWS relative to INPUT SIZE. A function that is 10x slower on 10x the data is O(n). A function that is 100x slower is O(n^2). The complexity class determines whether an algorithm is usable at scale, not the constant factor.

What you need to know first: Lessons 00-28.

**Terms used in this lesson:**
- **Big-O Notation** — A mathematical notation that describes the limiting behavior of a function when the argument tends towards a particular value or infinity. Here, it measures how the runtime or space requirements grow as input size grows.
- **Constant Time (O(1))** — The runtime is independent of the input size.
- **Linear Time (O(n))** — The runtime grows directly in proportion to the input size.
- **Logarithmic Time (O(log n))** — The runtime grows logarithmically as the input size increases (e.g., halving the search space each step).
- **Quadratic Time (O(n^2))** — The runtime grows proportionally to the square of the input size.
- **Exponential Time (O(2^n))** — The runtime doubles with each addition to the input data set.
- **Linearithmic Time (O(n log n))** — The runtime grows in proportion to n multiplied by log n, typical of efficient comparison-based sorts.

**Objects and methods used:**
- **`time.perf_counter`**
  - *What it is:* A function that returns the value (in fractional seconds) of a performance counter.
  - *Implementation:* `def perf_counter() -> float` in the `time` module.
  - *Its use:* Used to measure elapsed time with high resolution.
  - *Type:* Free function in the `time` module.
  - *Responsibility:* Returns a clock with the highest available resolution to measure short durations.
  - *Depends on:* Nothing explicitly passed, depends on OS clock.
  - *Connects to:* Called by benchmarking code to calculate elapsed time.
  - *Shape:* A diagnostic/benchmarking utility, used in development/testing.
- **`list.sort()`**
  - *What it is:* An in-place sorting method for lists.
  - *Implementation:* `def sort(self, *, key=None, reverse=False) -> None`
  - *Its use:* Used to sort the elements of a list efficiently in O(n log n) time using Timsort.
  - *Type:* Instance method on the `list` class.
  - *Responsibility:* Rearranges the elements of the list in place based on the standard less-than operator or a provided key function.
  - *Depends on:* The list it is called on.
  - *Connects to:* Modifies the underlying array of the list.
  - *Shape:* Core data structure utility.
- **`set()`**
  - *What it is:* A built-in Python class for unordered collections of unique elements.
  - *Implementation:* `class set(iterable=(), /)`
  - *Its use:* Used to store seen items for O(1) average case lookup to avoid O(n^2) nested loops.
  - *Type:* Built-in class.
  - *Responsibility:* Provides fast membership testing and guarantees element uniqueness via hashing.
  - *Depends on:* Optionally takes an iterable to initialize.
  - *Connects to:* Used by application code to filter or track elements.
  - *Shape:* Core data structure.
- **`set.add()`**
  - *What it is:* A method to add a single element to a set.
  - *Implementation:* `def add(self, element: Any) -> None`
  - *Its use:* Used to add seen items into the set during iteration.
  - *Type:* Instance method on the `set` class.
  - *Responsibility:* Mutates the set by adding the given element if it is not already present.
  - *Depends on:* The element being added (which must be hashable).
  - *Connects to:* Modifies the underlying hash table of the set.
  - *Shape:* Core data structure utility.
- **`str.join()`**
  - *What it is:* A method to concatenate an iterable of strings.
  - *Implementation:* `def join(self, iterable: Iterable[str]) -> str`
  - *Its use:* Used to efficiently combine many strings into one without quadratic reallocation.
  - *Type:* Instance method on the `str` class.
  - *Responsibility:* Creates a new string by concatenating all items in the iterable, separated by the string providing the method.
  - *Depends on:* An iterable of strings.
  - *Connects to:* Returns a newly allocated string.
  - *Shape:* Core string manipulation utility.

## Concept Unit: O(1) and O(n) — constant and linear
### The Problem
How can we mathematically describe how long a piece of code takes to run? If you have ten times as much data, does the code take ten times as long, or a hundred times as long? Why is it that some operations feel instantaneous regardless of the dataset size, while others bog down the system?
### Introduce the concept in isolation
```python
import time

def get_first(lst):      # O(1): same work regardless of list size
    return lst[0]

def linear_search(lst, target):  # O(n): worst case checks all n elements
    for item in lst:
        if item == target:
            return True
    return False

# Verify empirically:
for n in [1000, 10000, 100000]:
    data = list(range(n))
    t0 = time.perf_counter()
    for _ in range(1000): get_first(data)
    t_const = time.perf_counter() - t0

    t0 = time.perf_counter()
    linear_search(data, -1)   # worst case: target not present
    t_linear = time.perf_counter() - t0

    print(f'n={n:6d}: O(1)={t_const:.4f}s, O(n)={t_linear:.5f}s')
```
This proves that **Constant Time (O(1))** stays flat regardless of `n`, while **Linear Time (O(n))** grows proportionally with `n`. Trace `linear_search([0,1,...,999], -1)`: checks 0,1,...,999. Target -1 not found. Returns False. Work = n comparisons. 10x n -> 10x comparisons -> 10x time.
### Discard the throwaway
This empirical verification code is discarded and will not appear in the project again.
### Project Change
No reference counterpart — this is a standalone theory lesson.
### The New Code
```python
def get_first(lst):
    return lst[0]

def linear_search(lst, target):
    for item in lst:
        if item == target:
            return True
    return False
```
### The Updated Project
```python
1: def get_first(lst):
2:     return lst[0]
3: 
4: def linear_search(lst, target):
5:     for item in lst:
6:         if item == target:
7:             return True
8:     return False
```
This defines two functions showing O(1) and O(n) complexity.
### Mechanical walkthrough
- `def get_first(lst):` defines a function taking a list.
- `return lst[0]` accesses the first element. Array indexing is O(1) because the memory address is calculated directly.
- `def linear_search(lst, target):` defines a search function.
- `for item in lst:` iterates through every element.
- `if item == target:` performs a comparison.
- `return True` exits early if found.
- `return False` is reached only if all `n` elements are checked.
### CS lens
Algorithmic Complexity (Big-O). It measures the worst-case growth rate of an algorithm's resource consumption (usually time or memory) as a function of the input size `n`. Real-world examples: finding a name in an unsorted pile of papers (O(n)), looking up a word in a dictionary (O(log n)), or matching every person in a room with every other person (O(n^2)).
### SE lens
Design Principle: Scalability. We must choose algorithms based on expected data volume. A simple O(n) linear search is perfectly fine for 10 items, but disastrous for 10 billion. The alternative (always optimizing prematurely) wastes developer time for small datasets, but choosing the wrong complexity class for large datasets causes system failures.
### Commands needed
`python3`
### Run it
Predicted confidently: The printed output will show O(1) times remaining roughly equal across all `n`, while O(n) times increase by a factor of 10 as `n` increases by a factor of 10.
### One sentence connecting to previous unit
Now that we've seen how a linear search must check every item, let's look at how we can do better if the data is already sorted.

## Concept Unit: O(log n) — binary search
### The Problem
If we have a billion items, a linear search might take a billion steps. If those items are sorted, can we find our target without looking at every single one? How can we systematically eliminate large chunks of the search space?
### Introduce the concept in isolation
```python
def binary_search(sorted_lst, target):
    lo, hi = 0, len(sorted_lst) - 1
    steps = 0
    while lo <= hi:
        steps += 1
        mid = (lo + hi) // 2
        if sorted_lst[mid] == target:
            print(f'Found in {steps} steps')
            return mid
        elif sorted_lst[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1
    print(f'Not found in {steps} steps')
    return -1

binary_search(list(range(1000)), 999)
binary_search(list(range(1000000)), 999999)
```
This proves **Logarithmic Time (O(log n))**. 1000x more data -> only 2x more steps (log2(1000) ~ 10). Trace `binary_search([0..999], 999)`: lo=0, hi=999. mid=499: 499 < 999 -> lo=500. mid=749: 749<999 -> lo=750. mid=874 -> lo=875. mid=937 -> lo=938. mid=968 -> lo=969. mid=984 -> lo=985. mid=992 -> lo=993. mid=996 -> lo=997. mid=998 -> lo=999. mid=999 == target: found in 10 steps.
### Discard the throwaway
This empirical verification code is discarded and will not appear in the project again.
### Project Change
No reference counterpart — this is a standalone theory lesson.
### The New Code
```python
def binary_search(sorted_lst, target):
    lo, hi = 0, len(sorted_lst) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if sorted_lst[mid] == target:
            return mid
        elif sorted_lst[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return -1
```
### The Updated Project
```python
 1: def get_first(lst):
 2:     return lst[0]
 3: 
 4: def linear_search(lst, target):
 5:     for item in lst:
 6:         if item == target:
 7:             return True
 8:     return False
 9: 
10: def binary_search(sorted_lst, target):  # ← new
11:     lo, hi = 0, len(sorted_lst) - 1       # ← new
12:     while lo <= hi:                       # ← new
13:         mid = (lo + hi) // 2              # ← new
14:         if sorted_lst[mid] == target:     # ← new
15:             return mid                    # ← new
16:         elif sorted_lst[mid] < target:    # ← new
17:             lo = mid + 1                  # ← new
18:         else:                             # ← new
19:             hi = mid - 1                  # ← new
20:     return -1                             # ← new
```
This adds the `binary_search` function which operates in O(log n) time.
### Mechanical walkthrough
- `def binary_search(sorted_lst, target):` defines the function.
- `lo, hi = 0, len(sorted_lst) - 1` sets the initial search bounds to the start and end of the list.
- `while lo <= hi:` loops as long as the search space is valid.
- `mid = (lo + hi) // 2` calculates the middle index using integer division.
- `if sorted_lst[mid] == target:` checks if the middle element is the target.
- `return mid` returns the index if found.
- `elif sorted_lst[mid] < target:` checks if the target must be in the right half.
- `lo = mid + 1` updates the lower bound to shrink the search space by half.
- `else:` implies the target must be in the left half.
- `hi = mid - 1` updates the upper bound.
- `return -1` returns -1 if the loop exhausts the search space without finding the target.
### CS lens
Divide and Conquer. Binary search is the classic O(log n) algorithm. Each step eliminates half the remaining possibilities. Real-world examples: guessing a number between 1 and 100 by asking "higher or lower?", searching a physical dictionary by splitting it open, or traversing a balanced binary search tree.
### SE lens
Preconditions. Binary search *requires* the data to be sorted. The alternative is sorting the data first, which takes O(n log n) time. If you only search once, a linear search (O(n)) is faster than sorting and then binary searching. But if you search thousands of times, sorting once and binary searching thereafter is a massive performance win.
### Commands needed
`python3`
### Run it
Predicted confidently: Found in 10 steps for 1000 items, and 20 steps for 1,000,000 items.
### One sentence connecting to previous unit
While searching can be done in O(log n) or O(n) time, what happens when we need to compare every item against every other item?

## Concept Unit: O(n^2) — quadratic: nested loops
### The Problem
How do we check if a list has any duplicate values? The intuitive way is to compare the first item to all others, then the second item to all others. How does the total amount of work grow as the list size doubles?
### Introduce the concept in isolation
```python
def has_duplicates(lst):     # O(n^2): nested loops
    n = len(lst)
    for i in range(n):
        for j in range(i + 1, n):
            if lst[i] == lst[j]:
                return True
    return False

def has_duplicates_fast(lst):  # O(n): use a set
    seen = set()
    for item in lst:
        if item in seen:       # O(1) set lookup
            return True
        seen.add(item)
    return False

import time
for n in [1000, 2000, 4000]:
    data = list(range(n))      # no duplicates
    t0 = time.perf_counter()
    has_duplicates(data)
    t1 = time.perf_counter()
    has_duplicates_fast(data)
    t2 = time.perf_counter()
    print(f'n={n}: O(n^2)={t1-t0:.4f}s, O(n)={t2-t1:.4f}s')
```
This proves **Quadratic Time (O(n^2))**. Doubling `n` results in 4x time for O(n^2), while O(n) only takes 2x time. Trace `has_duplicates([0..3])`: i=0: j=1,2,3. i=1: j=2,3. i=2: j=3. i=3: no j. Total comparisons: 3+2+1 = n*(n-1)/2 = O(n^2).
### Discard the throwaway
This empirical verification code is discarded and will not appear in the project again.
### Project Change
No reference counterpart — this is a standalone theory lesson.
### The New Code
```python
def has_duplicates(lst):
    n = len(lst)
    for i in range(n):
        for j in range(i + 1, n):
            if lst[i] == lst[j]:
                return True
    return False

def has_duplicates_fast(lst):
    seen = set()
    for item in lst:
        if item in seen:
            return True
        seen.add(item)
    return False
```
### The Updated Project
```python
22: def has_duplicates(lst):             # ← new
23:     n = len(lst)                     # ← new
24:     for i in range(n):               # ← new
25:         for j in range(i + 1, n):    # ← new
26:             if lst[i] == lst[j]:     # ← new
27:                 return True          # ← new
28:     return False                     # ← new
29: 
30: def has_duplicates_fast(lst):        # ← new
31:     seen = set()                     # ← new
32:     for item in lst:                 # ← new
33:         if item in seen:             # ← new
34:             return True              # ← new
35:         seen.add(item)               # ← new
36:     return False                     # ← new
```
This adds the naive quadratic duplicate check and the fast linear duplicate check.
### Mechanical walkthrough
- `def has_duplicates(lst):` defines the naive approach.
- `n = len(lst)` gets the list length.
- `for i in range(n):` iterates over every index.
- `for j in range(i + 1, n):` iterates over all subsequent indices. This nested loop structure causes O(n^2) complexity.
- `if lst[i] == lst[j]:` compares two elements.
- `return True` returns immediately if a duplicate is found.
- `return False` is reached only if no duplicates exist.
- `def has_duplicates_fast(lst):` defines the optimized approach.
- `seen = set()` initializes an empty set for O(1) lookups.
- `for item in lst:` iterates through the list once (O(n)).
- `if item in seen:` checks for membership in constant time.
- `return True` exits if found.
- `seen.add(item)` adds the item to the set.
- `return False` returns if no duplicates were found.
### CS lens
Space-Time Tradeoff. We reduced the time complexity from O(n^2) to O(n) by using a hash set. This costs O(n) additional memory. Real-world examples of O(n^2): comparing every pixel in an image to every other pixel, bubble sort, or naive collision detection between many moving objects.
### SE lens
Algorithmic scaling. O(n^2) algorithms often pass unit tests (where n=10) with flying colors, but completely freeze production systems (where n=1,000,000). The alternative is to recognize nested loops over the same dataset and proactively look for a hashing or sorting-based optimization.
### Commands needed
`python3`
### Run it
Predicted confidently: The O(n^2) time will roughly quadruple when `n` doubles, whereas the O(n) time will only double.
### One sentence connecting to previous unit
While O(n^2) is bad, some recursive algorithms exhibit even worse growth, while some built-in operations like sorting sit neatly between O(n) and O(n^2).

## Concept Unit: O(n log n) and O(2^n)
### The Problem
How expensive is sorting a list? And what happens when a function calls itself multiple times per step, branching out like a tree?
### Introduce the concept in isolation
```python
import time

# O(n log n): sorting (Python's sort, merge sort, heap sort)
def count_operations_sort(n):
    data = list(range(n, 0, -1))  # reverse sorted: worst case for many sorts
    t0 = time.perf_counter()
    data.sort()                    # Timsort: O(n log n)
    return time.perf_counter() - t0

# O(2^n): exponential - naive recursive Fibonacci
def fib_exp(n):
    if n <= 1:
        return n
    return fib_exp(n-1) + fib_exp(n-2)  # 2 recursive calls: 2^n total calls

# Measure fib_exp: grows explosively
for n in [10, 20, 30]:
    t0 = time.perf_counter()
    result = fib_exp(n)
    elapsed = time.perf_counter() - t0
    print(f'fib({n})={result}, time={elapsed:.4f}s')
```
This proves **Exponential Time (O(2^n))** grows explosively. Trace `fib_exp(4)`: calls fib(3)+fib(2). fib(3) calls fib(2)+fib(1). fib(2) called TWICE. Tree has 2^4=16 calls for n=4. `fib(30)`: ~2^30 = 1 billion calls.
### Discard the throwaway
This empirical verification code is discarded and will not appear in the project again.
### Project Change
No reference counterpart — this is a standalone theory lesson.
### The New Code
```python
def fib_exp(n):
    if n <= 1:
        return n
    return fib_exp(n-1) + fib_exp(n-2)
```
### The Updated Project
```python
38: def fib_exp(n):                        # ← new
39:     if n <= 1:                         # ← new
40:         return n                       # ← new
41:     return fib_exp(n-1) + fib_exp(n-2) # ← new
```
This adds the naive recursive Fibonacci generator.
### Mechanical walkthrough
- `def fib_exp(n):` defines a function taking an integer.
- `if n <= 1:` is the base case for the recursion.
- `return n` returns the value for 0 or 1.
- `return fib_exp(n-1) + fib_exp(n-2)` is the recursive step, calling the function twice. This branching causes the total number of calls to double for each increase in `n`.
### CS lens
Combinatorial Explosion. Exponential time algorithms are practically unusable for n > 50. Real-world examples of O(2^n) or O(n!): the Traveling Salesperson Problem, brute-forcing a password, or naive recursive backtracking. **Linearithmic Time (O(n log n))** is the best possible worst-case time for comparison-based sorting algorithms.
### SE lens
Algorithmic bounds. Whenever you see a recursive function that makes two or more calls to itself, carefully analyze the depth and branching factor. The alternative is dynamic programming (memoization), which can often turn an O(2^n) recursive algorithm into an O(n) iterative or cached one.
### Commands needed
`python3`
### Run it
Predicted confidently: `fib(10)` takes ~0.0s, `fib(20)` takes ~0.01s, `fib(30)` takes ~0.3s, and `fib(40)` takes ~30s.
### One sentence connecting to previous unit
Now that we know how loops and recursion affect complexity, let's look at hidden complexities inside Python's built-in operations.

## Concept Unit: Analyzing Python operations
### The Problem
When you write `x in lst` or `string_a + string_b`, you aren't writing loops, but work is still happening. How do we avoid accidentally writing an O(n^2) algorithm by putting an O(n) built-in operation inside an O(n) loop?
### Introduce the concept in isolation
```python
# WRONG: building string in loop
def slow_join(words):
    result = ''
    for w in words:       # O(n^2): each += creates new string of growing length
        result += w
    return result

# RIGHT:
def fast_join(words):
    return ''.join(words) # O(n): one allocation

words = ['word'] * 10000
import time
t0=time.perf_counter(); slow_join(words); print(f'slow: {time.perf_counter()-t0:.3f}s')
t0=time.perf_counter(); fast_join(words); print(f'fast: {time.perf_counter()-t0:.4f}s')
```
This proves that using `+=` on strings in a loop is O(n^2) while `''.join()` is O(n). Trace `slow_join(['a','b','c'])`: result='' + 'a' = 'a' (new str, length 1). 'a'+'b'='ab' (new str, length 2). 'ab'+'c'='abc' (new str, length 3). Total work: 0+1+2+...+(n-1) = n*(n-1)/2 = O(n^2). fast_join: `''.join`: ONE allocation of the final string. O(n).
### Discard the throwaway
This empirical verification code is discarded and will not appear in the project again.
### Project Change
No reference counterpart — this is a standalone theory lesson.
### The New Code
```python
def slow_join(words):
    result = ''
    for w in words:
        result += w
    return result

def fast_join(words):
    return ''.join(words)
```
### The Updated Project
```python
43: def slow_join(words):         # ← new
44:     result = ''               # ← new
45:     for w in words:           # ← new
46:         result += w           # ← new
47:     return result             # ← new
48: 
49: def fast_join(words):         # ← new
50:     return ''.join(words)     # ← new
```
This adds string joining examples.
### Mechanical walkthrough
- `def slow_join(words):` defines the naive approach.
- `result = ''` initializes an empty string.
- `for w in words:` loops over the words.
- `result += w` concatenates the strings. Because strings are immutable in Python, this requires allocating a new string and copying all characters every single iteration.
- `return result` returns the final string.
- `def fast_join(words):` defines the optimized approach.
- `return ''.join(words)` calls the `join` method on the empty string separator. This calculates the total needed length once, allocates the memory once, and copies each word in exactly once, making it O(n).
### CS lens
Amortized Analysis and Immutability. Python lists have O(1) amortized appends because they occasionally reallocate and copy, but mostly just write to pre-allocated space. Strings are immutable, so *every* concatenation allocates and copies. Real-world examples: Java's `StringBuilder` vs `String` concatenation, or resizing dynamic arrays.
### SE lens
Idiomatic Python. Understanding the performance characteristics of built-ins is crucial. The alternative (ignoring them) leads to "accidentally quadratic" code. Always use `''.join()` for sequences of strings, `set` for lookups, and `list.append()` instead of `list.insert(0, ...)` (which is O(n) because it shifts all elements).
### Commands needed
`python3`
### Run it
Predicted confidently: `slow_join` will take significantly longer (orders of magnitude) than `fast_join` for large inputs.
### One sentence connecting to previous unit
Understanding how Big-O applies to both loops and built-in operations gives us a complete toolkit to evaluate our code's scalability.

## Closing
### Connect the pieces
We can classify `linear_search` as O(n), `binary_search` as O(log n), `has_duplicates` as O(n^2), and `has_duplicates_fast` as O(n). Understanding these complexity classes allows us to reason about performance independently of hardware speed. At scale, an O(n) algorithm will fundamentally beat an O(n^2) algorithm regardless of the constant factors, because the total work grows much more slowly as the dataset increases.
