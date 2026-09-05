# Lesson 30: Search Algorithms — Linear and Binary

What you will build: The reader implements linear search (O(n)), binary search (O(log n)), and understands the PRECONDITION of binary search (sorted input), the bisect module, and searching with custom keys. The transferable insight: binary search is the canonical example of 'divide and conquer applied to search.' Each step eliminates HALF the remaining candidates. This is why O(log n) is so powerful: log2(1,000,000) = 20. You find any element in a million-element sorted list in at most 20 steps.

What you need to know first: Lessons 00-29.

**Terms used in this lesson**
- **Linear search** — An algorithmic process that checks every element in a list sequentially until the target is found. It exists to provide a simple, foolproof way to search unsorted data.
- **Binary search** — An algorithmic process that repeatedly divides a sorted list in half to find a target. It exists to provide extremely fast searches, solving the performance bottlenecks of linear search on large datasets.
- **Divide and conquer** — An algorithmic design paradigm. It exists to solve complex problems by breaking them down into smaller, similar sub-problems, solving them, and combining the results.
- **Precondition** — A condition that must be true before a function or algorithm runs (e.g., binary search requires a sorted list). It exists to guarantee the correct behavior of the algorithm.
- **O(n)** — Linear time complexity. It describes performance that scales directly in proportion to the input size.
- **O(log n)** — Logarithmic time complexity. It describes performance that scales with the logarithm of the input size, indicating massive efficiency gains for large data.

**Objects and methods used**
- **`enumerate`**
  - *What it is:* A Python built-in function that adds a counter to an iterable.
  - *Implementation:* `enumerate(iterable, start=0)`
  - *Its use:* To retrieve both the index and the value simultaneously during our linear search loop.
  - *Type:* Built-in function
  - *Responsibility:* Yields a tuple containing a count (from start) and the values obtained from iterating over iterable.
  - *Depends on:* An iterable object.
  - *Connects to:* Consumed by a `for` loop to unpack index and item.
  - *Shape:* Standard library utility function, used as a helper in iteration.
- **`bisect.bisect_left`**
  - *What it is:* A function in the `bisect` module to locate the insertion point for a target in a sorted list to maintain sorted order.
  - *Implementation:* `bisect.bisect_left(a, x, lo=0, hi=len(a))`
  - *Its use:* To perform a highly optimized binary search for an element or its insertion point.
  - *Type:* Standard library module function
  - *Responsibility:* Finds the leftmost index where the target can be inserted while maintaining sorted order.
  - *Depends on:* A sorted list and a target value.
  - *Connects to:* Called by the user, returns an integer index.
  - *Shape:* A utility function from Python's standard library.
- **`bisect.insort`**
  - *What it is:* A function in the `bisect` module to insert an element into a sorted sequence.
  - *Implementation:* `bisect.insort(a, x, lo=0, hi=len(a))`
  - *Its use:* To insert a new item into our sorted dataset without having to manually find the index.
  - *Type:* Standard library module function
  - *Responsibility:* Inserts item `x` in list `a`, and keeps it sorted assuming `a` is already sorted.
  - *Depends on:* A sorted list and a target value.
  - *Connects to:* Modifies the list in place; relies on binary search internally.
  - *Shape:* Standard library utility function that modifies a data structure.
- **`bisect.bisect_right`**
  - *What it is:* A function similar to `bisect_left`, but returns an insertion point which comes after any existing entries of the target.
  - *Implementation:* `bisect.bisect_right(a, x, lo=0, hi=len(a))`
  - *Its use:* To find the upper bound when doing a range query.
  - *Type:* Standard library module function
  - *Responsibility:* Finds the rightmost index where the target can be inserted while maintaining sorted order.
  - *Depends on:* A sorted list and a target value.
  - *Connects to:* Called by the user to calculate an ending boundary index.
  - *Shape:* Utility function for bounded searches.
- **`lambda`**
  - *What it is:* A keyword used to create small, anonymous functions in Python.
  - *Implementation:* `lambda arguments: expression`
  - *Its use:* To define a quick, inline extraction function for the key parameter in our search algorithm.
  - *Type:* Keyword/Language feature
  - *Responsibility:* Creates a callable function object without binding it to a name.
  - *Depends on:* An expression to evaluate.
  - *Connects to:* Passed as an argument (like `key`) to other functions.
  - *Shape:* Anonymous inline function.
- **`sorted`**
  - *What it is:* A built-in function that builds a new sorted list from an iterable.
  - *Implementation:* `sorted(iterable, /, *, key=None, reverse=False)`
  - *Its use:* To prepare unsorted data so that we can apply binary search to it.
  - *Type:* Built-in function
  - *Responsibility:* Returns a new sorted list containing all items from the iterable.
  - *Depends on:* An iterable to sort.
  - *Connects to:* Called with an iterable and an optional key function, returns a new list.
  - *Shape:* Standard library utility.
- **`time.perf_counter`**
  - *What it is:* A function that returns a float value of time in seconds, useful for performance profiling.
  - *Implementation:* `time.perf_counter()`
  - *Its use:* To measure and compare the execution time between linear and binary searches.
  - *Type:* Standard library module function
  - *Responsibility:* Provides a high-resolution clock for short-duration timing.
  - *Depends on:* The system's underlying clock mechanism.
  - *Connects to:* Called before and after a block of code; differences are calculated.
  - *Shape:* Timing utility from the standard library.
- **`list.sort`**
  - *What it is:* A method that sorts a list in place.
  - *Implementation:* `list.sort(*, key=None, reverse=False)`
  - *Its use:* To sort the large dataset once before performing multiple binary searches.
  - *Type:* List instance method
  - *Responsibility:* Modifies the list to be in sorted order.
  - *Depends on:* The elements of the list being comparable.
  - *Connects to:* Called on the list instance, modifies it directly.
  - *Shape:* Core data structure method.

## Concept Unit: Linear search — O(n) brute force
### The Problem
How do we find a specific item in a collection of data? If the data is completely scrambled, in what order should we look? What happens if the item we are looking for is at the very end, or not there at all?
### Introduce the concept in isolation
```python
def linear_search(lst, target):
    for i, item in enumerate(lst):
        if item == target:
            return i    # found at index i
    return -1           # not found

data = [4, 2, 7, 1, 9, 3, 6, 5, 8]
print(linear_search(data, 7))   # 2 (index)
print(linear_search(data, 10))  # -1

# Python's 'in' operator: also O(n) for lists
print(7 in data)   # True  -- same as linear_search but returns bool
print(10 in data)  # False
```
Trace linear_search([4,2,7,1,9], 7): i=0,item=4: 4!=7. i=1,item=2: 2!=7. i=2,item=7: 7==7. Return 2. This proves that **linear search** must potentially look at every element, operating in O(n) time.
### Discard the throwaway
This exact throwaway code is deleted and will not appear in the project again.
### Project Change
No reference counterpart — this is a standalone theory lesson on search foundations.
- Files affected: `search_tools.py` created.
- Change type: add.
- Location: entire file.
- Dependencies: None.
### The New Code
```python
def linear_search(lst, target):
    for i, item in enumerate(lst):
        if item == target:
            return i
    return -1
```
### The Updated Project
```python
1: def linear_search(lst, target):  # <- new
2:     for i, item in enumerate(lst):  # <- new
3:         if item == target:  # <- new
4:             return i  # <- new
5:     return -1  # <- new
```
This structure creates a function that iterates through a list, checking every item sequentially until the target is found or the list is exhausted.
### Mechanical walkthrough
- `def linear_search(lst, target):` declares a function accepting a list and a target value.
- `for i, item in enumerate(lst):` iterates over the list, extracting both the index `i` and the `item` value at that index.
- `if item == target:` compares the current value with the target value.
- `return i` exits the function early and returns the index where the item was found.
- `return -1` provides a sentinel value indicating the target was not found in the list.
### CS lens
This is a sequential search, operating in O(n) time complexity. It appears in log parsing, checking for simple unindexed database rows, or simple array scans in low-level C code where setting up complex structures is unnecessary.
### SE lens
Design principle: Keep It Simple Stupid (KISS). An alternative not chosen is to build a complex hash map or sorted index. The tradeoff is that while linear search is slow on large data, it has zero setup cost and works on completely unordered inputs.
### Commands needed
None for this unit.
### Run it
Predicted confidently: For a target in the list, it returns its 0-based index. For a missing target, it returns -1.
### One sentence connecting to previous unit
Linear search solves the problem for unordered data, but for large datasets, we need a faster approach.

## Concept Unit: Binary search — O(log n) on sorted data
### The Problem
If you have a million records and they are already sorted, does it make sense to check the first item, then the second, and so on? How could you jump ahead and narrow down the possibilities faster?
### Introduce the concept in isolation
```python
def binary_search(sorted_lst, target):
    lo, hi = 0, len(sorted_lst) - 1

    while lo <= hi:
        mid = (lo + hi) // 2
        if sorted_lst[mid] == target:
            return mid          # found
        elif sorted_lst[mid] < target:
            lo = mid + 1        # target in right half
        else:
            hi = mid - 1        # target in left half

    return -1   # not found

data = [1, 3, 5, 7, 9, 11, 13]  # MUST be sorted
print(binary_search(data, 7))    # 3
print(binary_search(data, 6))    # -1
print(binary_search(data, 1))    # 0
print(binary_search(data, 13))   # 6
```
Trace binary_search([1,3,5,7,9,11,13], 7): lo=0,hi=6. mid=3: data[3]=7==7. Return 3. One step! If target=6: lo=0,hi=6,mid=3,data[3]=7>6 -> hi=2. lo=0,hi=2,mid=1,data[1]=3<6 -> lo=2. lo=2,hi=2,mid=2,data[2]=5<6 -> lo=3. lo=3>hi=2: return -1. This proves that **binary search** rapidly halves the search space in O(log n) time.
### Discard the throwaway
This throwaway code is deleted and will not appear in the project again.
### Project Change
No reference counterpart — this is a standalone theory lesson.
- Files affected: `search_tools.py` modified.
- Change type: add.
- Location: appending to file.
- Dependencies: previously defined `linear_search`.
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
1: def binary_search(sorted_lst, target):  # <- new
2:     lo, hi = 0, len(sorted_lst) - 1  # <- new
3:     while lo <= hi:  # <- new
4:         mid = (lo + hi) // 2  # <- new
5:         if sorted_lst[mid] == target:  # <- new
6:             return mid  # <- new
7:         elif sorted_lst[mid] < target:  # <- new
8:             lo = mid + 1  # <- new
9:         else:  # <- new
10:             hi = mid - 1  # <- new
11:     return -1  # <- new
```
This adds the binary search function which leverages sorted data to locate an element quickly by iteratively narrowing bounds.
### Mechanical walkthrough
- `def binary_search(sorted_lst, target):` defines the function, making it clear through variable naming that `sorted_lst` must be sorted.
- `lo, hi = 0, len(sorted_lst) - 1` initializes two pointers to the start and end of the list, respectively.
- `while lo <= hi:` sets up a loop that continues as long as there is a valid range of elements to examine.
- `mid = (lo + hi) // 2` calculates the midpoint index, using integer division `//` to ensure an integer index.
- `if sorted_lst[mid] == target:` tests if the midpoint is exactly what we are searching for.
- `return mid` returns the index if the target is found.
- `elif sorted_lst[mid] < target:` checks if the target is greater than the midpoint value, meaning it must be in the right half.
- `lo = mid + 1` shifts the lower bound up, discarding the left half.
- `else:` captures the case where the target is less than the midpoint value, meaning it must be in the left half.
- `hi = mid - 1` shifts the upper bound down, discarding the right half.
- `return -1` executes if the loop exhausts all options, meaning the target does not exist in the list.
### CS lens
This represents the classic "divide and conquer" paradigm applied to search. Real-world appearances include binary search trees (BSTs) in databases, git bisect for finding bugs, and B-trees in file systems.
### SE lens
Design principle: Contract prerequisites. The alternative not chosen is sorting the list inside `binary_search`. The tradeoff is that sorting internally would hide the O(n log n) cost; forcing the caller to provide a sorted list enforces the precondition and keeps the search function strictly O(log n).
### Commands needed
None for this unit.
### Run it
Predicted confidently: For target 7 in sorted data `[1,3,5,7,9,11,13]`, it returns 3. For target 6, it returns -1.
### One sentence connecting to previous unit
While writing our own binary search is educational, Python provides an optimized standard library module for this exact purpose.

## Concept Unit: The bisect module — binary search in the standard library
### The Problem
Why reinvent the wheel? If binary search is such a fundamental algorithm, shouldn't Python provide a built-in, highly optimized way to do it, and perhaps handle edge cases like inserting items while maintaining order?
### Introduce the concept in isolation
```python
import bisect

data = [1, 3, 5, 7, 9, 11, 13]

# bisect_left: index where target would be inserted to keep sorted order
print(bisect.bisect_left(data, 7))   # 3 (7 is at index 3)
print(bisect.bisect_left(data, 6))   # 3 (6 would go before 7)
print(bisect.bisect_left(data, 0))   # 0 (before all elements)
print(bisect.bisect_left(data, 14))  # 7 (after all elements)

# insort: insert while maintaining sorted order O(n) due to list shift
bisect.insort(data, 6)
print(data)  # [1, 3, 5, 6, 7, 9, 11, 13]

# Finding all values in a range [lo, hi]:
def values_in_range(sorted_lst, lo, hi):
    left  = bisect.bisect_left(sorted_lst, lo)
    right = bisect.bisect_right(sorted_lst, hi)
    return sorted_lst[left:right]

print(values_in_range([1,3,5,7,9,11,13], 4, 10))  # [5,7,9]
```
Trace values_in_range([1,3,5,7,9,11,13], 4, 10): bisect_left([...],4)=2 (5 is first >= 4). bisect_right([...],10)=5 (11 is first > 10). data[2:5]=[5,7,9]. This proves that **the bisect module** offers fast O(log n) primitives for working with sorted lists.
### Discard the throwaway
This throwaway code is deleted and will not appear in the project again.
### Project Change
No reference counterpart — this is a standalone theory lesson.
- Files affected: `search_tools.py` modified.
- Change type: add.
- Location: appending to file.
- Dependencies: None.
### The New Code
```python
import bisect

def values_in_range(sorted_lst, lo, hi):
    left  = bisect.bisect_left(sorted_lst, lo)
    right = bisect.bisect_right(sorted_lst, hi)
    return sorted_lst[left:right]
```
### The Updated Project
```python
1: import bisect  # <- new
2: 
3: def values_in_range(sorted_lst, lo, hi):  # <- new
4:     left  = bisect.bisect_left(sorted_lst, lo)  # <- new
5:     right = bisect.bisect_right(sorted_lst, hi)  # <- new
6:     return sorted_lst[left:right]  # <- new
```
This leverages Python's `bisect` library to quickly query sub-ranges of a sorted array.
### Mechanical walkthrough
- `import bisect` brings the standard library module into scope.
- `def values_in_range(sorted_lst, lo, hi):` defines a function to return a slice of a sorted list containing values between `lo` and `hi`.
- `left = bisect.bisect_left(sorted_lst, lo)` finds the index of the first element greater than or equal to `lo`.
- `right = bisect.bisect_right(sorted_lst, hi)` finds the index of the first element strictly greater than `hi`.
- `return sorted_lst[left:right]` returns the slice of the list using the found indices, extracting only the valid range in O(k) time where k is the number of elements found.
### CS lens
This is an application of bounded search queries. It appears in time-series databases for fetching events between two timestamps, graphics for frustum culling, and spatial indexing.
### SE lens
Design principle: Reuse standard libraries. The alternative not chosen is writing custom bound-finding loops. The tradeoff is trusting the opaque module implementation vs having complete control; in almost all Python code, standard library C implementations are drastically faster and less bug-prone.
### Commands needed
None for this unit.
### Run it
Predicted confidently: For a range `4` to `10` on `[1,3,5,7,9,11,13]`, it returns `[5, 7, 9]`.
### One sentence connecting to previous unit
Sometimes, the values we want to search aren't plain numbers, but complex objects, requiring us to define exactly what value we are sorting and searching on.

## Concept Unit: Searching with a key function
### The Problem
What if we have a list of tuples representing people's names and ages? If we want to find someone by their age, how do we tell the binary search to look only at the age field instead of the whole tuple?
### Introduce the concept in isolation
```python
def binary_search_key(sorted_lst, target, key=lambda x: x):
    lo, hi = 0, len(sorted_lst) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        mid_val = key(sorted_lst[mid])
        if mid_val == target:
            return mid
        elif mid_val < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return -1

people = [('Alice', 25), ('Bob', 30), ('Charlie', 35), ('Diana', 40)]
idx = binary_search_key(people, 35, key=lambda p: p[1])
print(idx)              # 2
print(people[idx])      # ('Charlie', 35)
```
Trace binary_search_key(people, 35, key=lambda p: p[1]): lo=0,hi=3. mid=1: key(people[1])=key(('Bob',30))=30 < 35 -> lo=2. mid=2: key(people[2])=35==35. Return 2. This proves that **searching with a key function** decouples the search logic from the data's specific structure.
### Discard the throwaway
This throwaway code is deleted and will not appear in the project again.
### Project Change
No reference counterpart — this is a standalone theory lesson.
- Files affected: `search_tools.py` modified.
- Change type: add.
- Location: appending to file.
- Dependencies: None.
### The New Code
```python
def binary_search_key(sorted_lst, target, key=lambda x: x):
    lo, hi = 0, len(sorted_lst) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        mid_val = key(sorted_lst[mid])
        if mid_val == target:
            return mid
        elif mid_val < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return -1
```
### The Updated Project
```python
1: def binary_search_key(sorted_lst, target, key=lambda x: x):  # <- new
2:     lo, hi = 0, len(sorted_lst) - 1  # <- new
3:     while lo <= hi:  # <- new
4:         mid = (lo + hi) // 2  # <- new
5:         mid_val = key(sorted_lst[mid])  # <- new
6:         if mid_val == target:  # <- new
7:             return mid  # <- new
8:         elif mid_val < target:  # <- new
9:             lo = mid + 1  # <- new
10:         else:  # <- new
11:             hi = mid - 1  # <- new
12:     return -1  # <- new
```
This generalizes binary search to handle arbitrary objects by introducing a functional key extractor.
### Mechanical walkthrough
- `def binary_search_key(sorted_lst, target, key=lambda x: x):` defines the function and sets a default `key` argument using an inline anonymous `lambda` function that just returns the item itself.
- `lo, hi = 0, len(sorted_lst) - 1` initializes the boundary pointers.
- `while lo <= hi:` loop as long as the search space is valid.
- `mid = (lo + hi) // 2` calculates the midpoint index.
- `mid_val = key(sorted_lst[mid])` dynamically extracts the comparison value from the midpoint object by calling the `key` function.
- `if mid_val == target:` compares the extracted value against our target.
- `return mid` returns the index if there is a match.
- `elif mid_val < target:` handles the case where the extracted value is less than the target.
- `lo = mid + 1` moves the lower bound up.
- `else:` handles the case where the extracted value is greater than the target.
- `hi = mid - 1` moves the upper bound down.
- `return -1` returns if the search fails.
### CS lens
This highlights the concept of functional programming abstractions, treating behavior (how to extract a comparison key) as data (an argument). It is widely used in relational databases for secondary indexes.
### SE lens
Design principle: Dependency Inversion. The alternative not chosen is hardcoding `sorted_lst[mid][1]` for the tuple. The tradeoff is performance (function call overhead inside a tight loop) versus massive reusability across any data type.
### Commands needed
None for this unit.
### Run it
Predicted confidently: For a tuple list sorted by age, searching for 35 with a `lambda p: p[1]` key returns the index containing `('Charlie', 35)`.
### One sentence connecting to previous unit
Now that we have all these tools, we need to know when to apply which algorithm depending on our performance needs.

## Concept Unit: When to use what — search selection guide
### The Problem
If sorting an array takes time, when is it actually worth doing it just so we can use binary search? If we only need to look for one item, is it faster to just scan the unsorted list?
### Introduce the concept in isolation
```python
import time
import bisect

n = 100000
data = list(range(n, 0, -1))  # reverse sorted
targets = list(range(0, n, 100))

# Linear: O(n) per search = O(n*k) total
t0 = time.perf_counter()
for t in targets:
    t in data
linear_time = time.perf_counter() - t0

# Sort once + binary: O(n log n) + O(k log n)
t0 = time.perf_counter()
data.sort()   # O(n log n) once
for t in targets:
    bisect.bisect_left(data, t)  # O(log n) per query
binary_time = time.perf_counter() - t0

print(f'Linear: {linear_time:.3f}s')
print(f'Sort+Binary: {binary_time:.3f}s')
print(f'Speedup: {linear_time/binary_time:.1f}x')
```
Trace: 1000 searches on 100000-element list. Linear: 1000 * 100000 comparisons = 100M. Binary: sort (1.7M ops) + 1000 * 17 = 18700 ops. Total: ~1.7M vs 100M -> ~58x speedup in operation count. This proves the pattern of **sort-once-search-many**.
### Discard the throwaway
This throwaway code is deleted and will not appear in the project again.
### Project Change
No reference counterpart.
- Files affected: `search_tools.py` modified.
- Change type: add.
- Location: appending to file.
- Dependencies: None.
### The New Code
```python
# Decision guide for searching:
# Data is unsorted, small n (< 1000): linear search or 'in'
# Data is unsorted, large n, many searches: sort once + binary search
# Data changes frequently: sorted container (SortedList from sortedcontainers)
# Need O(1) lookup: dict or set (hash map)
# Range queries: bisect on sorted list
```
### The Updated Project
```python
1: # Decision guide for searching:  # <- new
2: # Data is unsorted, small n (< 1000): linear search or 'in'  # <- new
3: # Data is unsorted, large n, many searches: sort once + binary search  # <- new
4: # Data changes frequently: sorted container (SortedList from sortedcontainers)  # <- new
5: # Need O(1) lookup: dict or set (hash map)  # <- new
6: # Range queries: bisect on sorted list  # <- new
```
This block of comments acts as a mental model reference inside the module.
### Mechanical walkthrough
- `# Decision guide for searching:` marks the start of the documentation.
- `# Data is unsorted, small n (< 1000): linear search or 'in'` documents that the overhead of sorting isn't worth it for small data or single lookups.
- `# Data is unsorted, large n, many searches: sort once + binary search` states the amortization principle: paying O(n log n) once is cheap if you do many O(log n) searches.
- `# Data changes frequently: sorted container (SortedList from sortedcontainers)` specifies that list insertions are O(n), so highly volatile data needs specialized structures.
- `# Need O(1) lookup: dict or set (hash map)` mentions that absolute fastest exact-match lookups belong to hashing, not binary search.
- `# Range queries: bisect on sorted list` reiterates that binary search excels at bounding problems.
### CS lens
This represents algorithmic profiling and amortization. Real-world systems like Postgres query planners constantly make this exact decision: "Should I do a sequential scan, or use an index scan?" based on the number of rows.
### SE lens
Design principle: Optimize for the dominant use case. The alternative not chosen is using a dictionary for everything. The tradeoff is that while dictionaries offer O(1) lookups, they use more memory and cannot answer range queries efficiently; sorted lists and binary search provide an optimal balance.
### Commands needed
None for this unit.
### Run it
Predicted confidently: This is a documentation block, so running the script does nothing.
### One sentence connecting to previous unit
Understanding the tradeoffs ensures we choose the right algorithmic tool for our dataset.

## Closing
### Connect the pieces
Let's trace `binary_search([1,3,5,7,9,11,13], 7)` step by step using our custom `binary_search` algorithm:
1. `lo=0, hi=6`. `mid = (0 + 6) // 2 = 3`. The element at `data[3]` is `7`. Since `7 == 7`, we return index `3` immediately.

If we searched for `6`:
1. `lo=0, hi=6`. `mid=3`. `data[3]` is `7`. `7 > 6`, so we set `hi = mid - 1 = 2`.
2. `lo=0, hi=2`. `mid = (0 + 2) // 2 = 1`. `data[1]` is `3`. `3 < 6`, so we set `lo = mid + 1 = 2`.
3. `lo=2, hi=2`. `mid = (2 + 2) // 2 = 2`. `data[2]` is `5`. `5 < 6`, so we set `lo = mid + 1 = 3`.
4. Now `lo=3` and `hi=2`. The condition `lo <= hi` fails. The loop terminates, and we return `-1`.

This demonstrates the divide and conquer mechanism that eliminates half the candidates at each step, culminating in an extremely efficient O(log n) operation count.
