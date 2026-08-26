# Lesson 30: Search Algorithms — Linear and Binary

**What you will build**
The reader will implement linear search (O(n)) and binary search (O(log n)), trace them mechanically, prove why binary search requires a SORTED list, and use the `bisect` module. The transferable problems: (1) linear search is the default — scan every element; it works on any sequence but is slow; (2) binary search requires a SORTED input and is dramatically faster — but incorrect on unsorted data; (3) the `bisect` module gives you production-ready binary search and sorted-insertion.

**What you need to know first**
Lessons 0–29 (full curriculum through Big-O).

**Terms used in this lesson**
- **Linear search** — scanning every element of a list one by one to find a target. It solves the problem of finding an item in an unsorted collection.
- **Binary search** — repeatedly halving a sorted search space to find a target. It solves the problem of searching efficiently (O(log n)) in a sorted collection.
- **Worst-case complexity** — the maximum amount of time an algorithm can take for an input of size n.
- **Recursion** — a function calling itself to solve a smaller instance of the same problem.
- **O(n)** — linear time complexity.
- **O(log n)** — logarithmic time complexity.
- **Stack overflow** — a failure caused by exceeding the maximum number of recursive function calls.
- **Dataclass** — a decorator that automatically generates special methods.

**Objects and methods used**

- **`enumerate`**
  - *What it is:* A built-in Python generator.
  - *Implementation:* `def enumerate(iterable, start=0): ...` yields `(index, value)` tuples.
  - *Its use:* To get both the index and the element during linear search.
  - *Type:* Built-in function.
  - *Responsibility:* Yields pairs containing a count and a value.
  - *Depends on:* An iterable object.
  - *Connects to:* Consumed by a `for` loop.
  - *Shape:* A standard library built-in.

- **`bisect.bisect_left`**
  - *What it is:* A function to locate the insertion point for a target in a sorted list.
  - *Implementation:* `def bisect_left(a, x, lo=0, hi=None, *, key=None): ...` 
  - *Its use:* To find if an element exists, or where to put it.
  - *Type:* Module-level function.
  - *Responsibility:* Finds the correct insertion index via binary search.
  - *Depends on:* A pre-sorted list and a comparable target.
  - *Connects to:* Returns an integer index to the caller.
  - *Shape:* Standard library utility function.

- **`bisect.bisect_right`**
  - *What it is:* Similar to `bisect_left`, but locates the insertion point to the right of any existing identical elements.
  - *Implementation:* `def bisect_right(a, x, lo=0, hi=None, *, key=None): ...`
  - *Its use:* To insert items after existing matches.
  - *Type:* Module-level function.
  - *Responsibility:* Finds the insertion point after existing equals.
  - *Depends on:* A pre-sorted list and a comparable target.
  - *Connects to:* Returns an integer index to the caller.
  - *Shape:* Standard library utility function.

- **`bisect.insort`**
  - *What it is:* A function to insert an element into a sorted list while maintaining the sort order.
  - *Implementation:* `def insort(a, x, lo=0, hi=None, *, key=None): ...`
  - *Its use:* Keeping a list sorted dynamically.
  - *Type:* Module-level function.
  - *Responsibility:* Finds insertion point and modifies the list in-place.
  - *Depends on:* A pre-sorted list and a comparable target.
  - *Connects to:* Modifies the list passed to it.
  - *Shape:* Standard library utility function causing an O(n) memory shift.

- **`time.time`**
  - *What it is:* A function that returns the current time in seconds since the Epoch.
  - *Implementation:* `def time(): -> float`
  - *Its use:* To measure the elapsed time of our algorithms.
  - *Type:* Module-level function.
  - *Responsibility:* Reading the system clock.
  - *Depends on:* System clock.
  - *Connects to:* Returns a `float`.
  - *Shape:* Standard library utility.

- **`@dataclass(order=True)`**
  - *What it is:* A decorator from the `dataclasses` module.
  - *Implementation:* `@dataclass(order=True)` synthesizes `__lt__`, `__le__`, `__gt__`, `__ge__`.
  - *Its use:* Making custom objects comparable.
  - *Type:* Class decorator.
  - *Responsibility:* Generating boilerplate magic methods.
  - *Depends on:* A class definition with type-hinted fields.
  - *Connects to:* Modifies the class object at definition time.
  - *Shape:* Python metaprogramming built-in.

---

## Concept Unit: Linear Search

### The Problem
If we have a sequence of items, how do we find a specific target and its position? Given an unsorted collection, what is the simplest way to locate an item without missing anything?

### Introduce the concept in isolation
To scan every element, we use a loop. Let's look at `enumerate` in action.

```python
demo_list = [10, 20, 30]
target = 20
found_index = -1
for i, val in enumerate(demo_list):
    if val == target:
        found_index = i
        break
print(found_index)
```
Output:
```
1
```
This proves that by iterating one by one, checking equality at each step, we correctly locate the index of the target. This technique is called **linear search**.

### Discard the throwaway example
We will discard this one-off loop and write a reusable search function for our project.

### Project Change
- **Reference Source**: None.
- **Files affected**: `search_tools.py` (created).
- **Change type**: Add.
- **Location**: Top of file.
- **Dependencies**: None.

### The New Code
```python
def linear_search(lst, target):
    for i, x in enumerate(lst):
        if x == target:
            return i
    return -1
```

### The Updated Project
```python
# search_tools.py
# ← new
1: def linear_search(lst, target):
2:     for i, x in enumerate(lst):
3:         if x == target:
4:             return i
5:     return -1

print(linear_search([3, 1, 4, 1, 5, 9, 2, 6], 5))
print(linear_search([3, 1, 4, 1, 5, 9, 2, 6], 7))
```
Output:
```
4
-1
```

### Mechanical walkthrough
- `def linear_search(lst, target):` defines a new function taking a list and a target.
- `for i, x in enumerate(lst):` iterates through the list, yielding index `i` and element `x`.
- `if x == target:` checks if the current element matches the target.
- `return i` returns the match index, immediately stopping the search.
- `return -1` executes if the loop finishes entirely, meaning the target was missing.

**Trace for `linear_search([3, 1, 4], 4)`:**
- `i=0 x=3` (no)
- `i=1 x=1` (no)
- `i=2 x=4` (yes), `return 2`.

**Complexity:** O(n) worst case (target is last or not present), O(1) best case (target is first), O(n/2) average. Use this for unsorted data, small collections, or when searching exactly once.

---

## Concept Unit: Binary Search

### The Problem
Linear search is too slow for large collections. If a list is already sorted, can we find an item faster than checking every single element?

### Introduce the concept in isolation
When data is sorted, we can check the middle element. If our target is smaller, we know it must be in the left half, eliminating the entire right half instantly. 

```python
lst = [2, 4, 6, 8, 10]
target = 8
low, high = 0, len(lst) - 1
mid = (low + high) // 2  # 2
if lst[mid] < target:
    low = mid + 1        # 3
print(f"Next search space: indices {low} to {high}")
```
Output:
```
Next search space: indices 3 to 4
```
This proves that a single comparison cuts the problem space in half. This is called **binary search**.

### Discard the throwaway example
We will discard this static check and write a dynamic loop.

### Project Change
- **Reference Source**: None.
- **Files affected**: `search_tools.py` (modified).
- **Change type**: Add.
- **Location**: Below `linear_search`.
- **Dependencies**: None.

### The New Code
```python
def binary_search(lst, target):
    low, high = 0, len(lst) - 1
    while low <= high:
        mid = (low + high) // 2
        if lst[mid] == target:
            return mid
        elif lst[mid] < target:
            low = mid + 1
        else:
            high = mid - 1
    return -1
```

### The Updated Project
```python
# search_tools.py
def linear_search(lst, target):
    for i, x in enumerate(lst):
        if x == target:
            return i
    return -1

# ← new
8: def binary_search(lst, target):
9:     low, high = 0, len(lst) - 1
10:    while low <= high:
11:        mid = (low + high) // 2
12:        if lst[mid] == target:
13:            return mid
14:        elif lst[mid] < target:
15:            low = mid + 1
16:        else:
17:            high = mid - 1
18:    return -1

sorted_lst = [1, 3, 5, 7, 9, 11, 13, 15]
print(binary_search(sorted_lst, 7))
print(binary_search(sorted_lst, 6))
print(binary_search(sorted_lst, 1))
print(binary_search(sorted_lst, 15))
```
Output:
```
3
-1
0
7
```

### Mechanical walkthrough
- `low, high = 0, len(lst) - 1` sets pointers to the start and end of the list.
- `while low <= high:` loops as long as the search space is valid (at least 1 item).
- `mid = (low + high) // 2` calculates the middle index using integer division.
- `if lst[mid] == target:` returns the index if the middle element is a match.
- `elif lst[mid] < target:` updates `low = mid + 1` to search the right half because the target is larger than the middle element.
- `else:` updates `high = mid - 1` to search the left half.

**Trace for `binary_search([1,3,5,7,9,11,13,15], 7)`:**
- `low=0`, `high=7`, `mid=3`, `lst[3]=7 == 7`, `return 3`

**Trace for `target=6`:**
- `low=0 high=7 mid=3 lst[3]=7 > 6`, `high=2`
- `low=0 high=2 mid=1 lst[1]=3 < 6`, `low=2`
- `low=2 high=2 mid=2 lst[2]=5 < 6`, `low=3`
- `low=3 > high=2`, exit loop, `return -1`

**Complexity:** O(log n) — it halves the search space at each step.

---

## Concept Unit: Why binary search FAILS on unsorted data

### The Problem
Does binary search work on any list? What happens if the data is not in order?

### Introduce the concept in isolation
Let's trace binary search on a randomized list.

```python
unsorted = [9, 1, 5, 3, 7]
# We want to find 3, which is at index 3
low, high = 0, len(unsorted) - 1
mid = (low + high) // 2  # mid = 2, lst[2] = 5
if unsorted[mid] > 3:
    high = mid - 1       # high = 1
print(f"Target 3 is in {unsorted[0:high+1]}")
```
Output:
```
Target 3 is in [9, 1]
```
The logic eliminated the right half where `3` actually lives! This proves that on unsorted data, binary search is dangerously incorrect.

### Discard the throwaway example
We will discard this failed search example.

### Project Change
- **Reference Source**: None.
- **Files affected**: `search_tools.py`
- **Change type**: Usage/Demonstration.
- **Location**: Bottom of file.
- **Dependencies**: None.

### The New Code
```python
unsorted = [9, 1, 5, 3, 7]
print(binary_search(unsorted, 3))
```

### The Updated Project
```python
# search_tools.py
# ...
def binary_search(lst, target):
    low, high = 0, len(lst) - 1
    while low <= high:
        mid = (low + high) // 2
        if lst[mid] == target:
            return mid
        elif lst[mid] < target:
            low = mid + 1
        else:
            high = mid - 1
    return -1

# ← new
25: unsorted = [9, 1, 5, 3, 7]
26: print(binary_search(unsorted, 3))
```
Output:
```
-1
```

### Mechanical walkthrough
- Binary search assumes that if `lst[mid] < target`, the target MUST be to the right, and if `lst[mid] > target`, it MUST be to the left.
- On unsorted data, this assumption is completely violated. The algorithm will happily eliminate the half containing the target.
- `low=0 high=4 mid=2 lst[2]=5 > 3, high=1`
- `low=0 high=1 mid=0 lst[0]=9 > 3, high=-1`
- `low=0 > high=-1, return -1` — MISSED IT!
- **Rule:** ALWAYS sort before binary searching.

---

## Concept Unit: Recursive Binary Search

### The Problem
The iterative loop is effective, but searching half of a list is just a smaller version of the same problem. Can a function invoke itself to solve this?

### Introduce the concept in isolation
A function calling itself is recursion. 

```python
def countdown(n):
    if n <= 0:
        return
    countdown(n - 1)

countdown(3)
```
Output (predictable):
`(No output, function terminates safely)`
This proves a function can invoke itself with a smaller boundary.

### Discard the throwaway example
Discard the countdown; we will write a recursive search.

### Project Change
- **Reference Source**: None.
- **Files affected**: `search_tools.py` (modified).
- **Change type**: Add.
- **Location**: Below `binary_search`.
- **Dependencies**: None.

### The New Code
```python
def binary_search_recursive(lst, target, low=0, high=None):
    if high is None:
        high = len(lst) - 1
    if low > high:
        return -1
    mid = (low + high) // 2
    if lst[mid] == target:
        return mid
    elif lst[mid] < target:
        return binary_search_recursive(lst, target, mid+1, high)
    else:
        return binary_search_recursive(lst, target, low, mid-1)
```

### The Updated Project
```python
# search_tools.py
# ...
# ← new
30: def binary_search_recursive(lst, target, low=0, high=None):
31:     if high is None:
32:         high = len(lst) - 1
33:     if low > high:
34:         return -1
35:     mid = (low + high) // 2
36:     if lst[mid] == target:
37:         return mid
38:     elif lst[mid] < target:
39:         return binary_search_recursive(lst, target, mid+1, high)
40:     else:
41:         return binary_search_recursive(lst, target, low, mid-1)

print(binary_search_recursive([1,3,5,7,9], 7))
print(binary_search_recursive([1,3,5,7,9], 4))
```
Output:
```
3
-1
```

### Mechanical walkthrough
- `def binary_search_recursive(lst, target, low=0, high=None):` provides default arguments to mimic the iterative startup.
- `if high is None: high = len(lst) - 1` initializes `high` safely on the first call.
- `if low > high: return -1` is the base case: the search space is exhausted.
- `mid = (low + high) // 2` finds the midpoint.
- `if lst[mid] == target: return mid` is the success base case.
- `return binary_search_recursive(lst, target, mid+1, high)` triggers recursion if the target is larger, returning the result of the recursive call back up the chain.
- `return binary_search_recursive(lst, target, low, mid-1)` triggers recursion if the target is smaller.

The recursive version is elegant but uses O(log n) stack frames. The iterative version is typically preferred in Python to avoid overhead or `RecursionError` on deep recursion.

---

## Concept Unit: The `bisect` Module

### The Problem
Writing binary search by hand is prone to off-by-one errors. Does Python provide a standard, highly optimized way to do this in production code?

### Introduce the concept in isolation
Python includes the `bisect` module for binary search operations.

```python
import bisect
arr = [10, 20, 30]
idx = bisect.bisect_left(arr, 20)
print(idx)
```
Output:
```
1
```
This proves that `bisect_left` natively performs binary search to find an index.

### Discard the throwaway example
We will discard this and implement a full demonstration in our project.

### Project Change
- **Reference Source**: None.
- **Files affected**: `search_tools.py`
- **Change type**: Add.
- **Location**: Bottom of file.
- **Dependencies**: `import bisect`.

### The New Code
```python
import bisect

sorted_lst = [1, 3, 5, 7, 9, 11]
print(bisect.bisect_left(sorted_lst, 7))
print(bisect.bisect_left(sorted_lst, 6))
print(bisect.bisect_left(sorted_lst, 0))
print(bisect.bisect_left(sorted_lst, 12))

print(bisect.bisect_right(sorted_lst, 7))

bisect.insort(sorted_lst, 6)
print(sorted_lst)
```

### The Updated Project
```python
# search_tools.py
# ...
# ← new
45: import bisect
46: 
47: sorted_lst = [1, 3, 5, 7, 9, 11]
48: 
49: # bisect_left: index where target would be inserted
50: print(bisect.bisect_left(sorted_lst, 7))
51: print(bisect.bisect_left(sorted_lst, 6))
52: print(bisect.bisect_left(sorted_lst, 0))
53: print(bisect.bisect_left(sorted_lst, 12))
54: 
55: # bisect_right: insert AFTER existing matches
56: print(bisect.bisect_right(sorted_lst, 7))
57: 
58: # insort: insert while maintaining sorted order
59: bisect.insort(sorted_lst, 6)
60: print(sorted_lst)
```
Output:
```
3
3
0
6
4
[1, 3, 5, 6, 7, 9, 11]
```

### Mechanical walkthrough
- `import bisect` loads the standard module.
- `bisect_left(sorted_lst, 7)` returns `3`, the leftmost index where `7` could be inserted without breaking the sorted order.
- `bisect_left(sorted_lst, 6)` returns `3`, showing where `6` would go (pushing `7` to index 4).
- To checking if an element exists, you must inspect the returned index: `i = bisect.bisect_left(a, x); if i < len(a) and a[i] == x:`
- `bisect_right(sorted_lst, 7)` returns `4`, telling us to insert a *new* `7` after the existing one.
- `bisect.insort(sorted_lst, 6)` finds the insertion point and automatically mutates the list. This relies on binary search to find the spot, but still requires O(n) time overall because a Python list must shift all subsequent elements in memory.

---

## Concept Unit: Searching in sorted lists of objects

### The Problem
Often we search arrays of objects, not integers. How do we binary search custom objects?

### Introduce the concept in isolation
We can use the `dataclass` decorator with `order=True` to make instances comparable, allowing `bisect` to function.

```python
from dataclasses import dataclass

@dataclass(order=True)
class Box:
    weight: int

print(Box(10) < Box(20))
```
Output:
```
True
```
This proves that `@dataclass(order=True)` synthesizes `__lt__` correctly based on the fields.

### Discard the throwaway example
We will discard the `Box` and apply this to a `Student` record.

### Project Change
- **Reference Source**: None.
- **Files affected**: `search_tools.py`
- **Change type**: Add.
- **Location**: Bottom of file.
- **Dependencies**: `from dataclasses import dataclass`.

### The New Code
```python
from dataclasses import dataclass

@dataclass(order=True)
class Student:
    gpa: float
    name: str

students = sorted([
    Student(3.9, 'Alice'),
    Student(3.5, 'Bob'),
    Student(3.7, 'Carol'),
    Student(3.2, 'Dave'),
])
print(students)

idx = bisect.bisect_left(students, Student(3.6, ''))
print(idx)
```

### The Updated Project
```python
# search_tools.py
# ...
import bisect
# ← new
62: from dataclasses import dataclass
63: 
64: @dataclass(order=True)
65: class Student:
66:     gpa: float
67:     name: str
68: 
69: students = sorted([
70:     Student(3.9, 'Alice'),
71:     Student(3.5, 'Bob'),
72:     Student(3.7, 'Carol'),
73:     Student(3.2, 'Dave'),
74: ])
75: print(students)
76: 
77: idx = bisect.bisect_left(students, Student(3.6, ''))
78: print(idx)
```
Output:
```
[Student(gpa=3.2, name='Dave'), Student(gpa=3.5, name='Bob'), Student(gpa=3.7, name='Carol'), Student(gpa=3.9, name='Alice')]
2
```

### Mechanical walkthrough
- `from dataclasses import dataclass` imports the decorator.
- `@dataclass(order=True)` configures the class to be comparable. It compares fields top-to-bottom: `gpa` first, then `name` as a tiebreaker.
- `sorted([...])` natively uses these generated comparison methods to order the students by GPA.
- `bisect_left(students, Student(3.6, ''))` queries the list with a dummy object possessing the target GPA.
- `idx` becomes `2`, accurately reporting that a `3.6` GPA student fits exactly between Bob (3.5) and Carol (3.7).

---

## Concept Unit: Empirical Comparison (Linear vs. Binary)

### The Problem
We know O(log n) is mathematically faster than O(n), but what does that speedup actually look like in code?

### Introduce the concept in isolation
We can use `time.time()` to take timestamps and measure elapsed seconds.

```python
import time
start = time.time()
# ... minimal work
end = time.time()
print(end - start > 0)
```
Output:
```
True
```
This proves we can capture high-resolution execution time by subtracting timestamps.

### Discard the throwaway example
We will discard this and write a formal timing loop to race our algorithms.

### Project Change
- **Reference Source**: None.
- **Files affected**: `search_tools.py`
- **Change type**: Add.
- **Location**: Bottom of file.
- **Dependencies**: `import time`.

### The New Code
```python
import time

for size in [10_000, 100_000, 1_000_000]:
    data = list(range(size))
    target = size - 1  # worst case for linear search

    start = time.time()
    for _ in range(1000):
        linear_search(data, target)
    linear_time = (time.time() - start) / 1000

    start = time.time()
    for _ in range(1000):
        binary_search(data, target)
    binary_time = (time.time() - start) / 1000

    print(f'n={size:>8}: linear={linear_time:.6f}s, binary={binary_time:.6f}s, speedup={linear_time/binary_time:.0f}x')
```

### The Updated Project
```python
# search_tools.py
# ...
# ← new
81: import time
82: 
83: for size in [10_000, 100_000, 1_000_000]:
84:     data = list(range(size))
85:     target = size - 1  # worst case for linear search
86: 
87:     start = time.time()
88:     for _ in range(1000):
89:         linear_search(data, target)
90:     linear_time = (time.time() - start) / 1000
91: 
92:     start = time.time()
93:     for _ in range(1000):
94:         binary_search(data, target)
95:     binary_time = (time.time() - start) / 1000
96: 
97:     print(f'n={size:>8}: linear={linear_time:.6f}s, binary={binary_time:.6f}s, speedup={linear_time/binary_time:.0f}x')
```
Expected output (times will vary slightly per run):
```
n=   10000: linear=0.000412s, binary=0.000004s, speedup=103x
n=  100000: linear=0.003890s, binary=0.000005s, speedup=778x
n= 1000000: linear=0.038760s, binary=0.000006s, speedup=6460x
```

### Mechanical walkthrough
- `data = list(range(size))` builds a massive sorted array.
- `target = size - 1` forces linear search to hit its worst case by querying the final element.
- `start = time.time()` records the clock.
- `for _ in range(1000):` runs the search 1000 times to get a stable, measurable duration.
- `(time.time() - start) / 1000` calculates the average execution time per search.
- The output clearly demonstrates that as `n` grows by a factor of 10, linear search takes exactly 10x longer. 
- Binary search takes barely any extra time (only 1 or 2 extra operations per 10x growth) because O(log n) is extremely flat. The speedup skyrockets as `n` increases.

---

Closing: search algorithms are the foundation of all retrieval. Lesson 31 covers sorting algorithms. Exercises: implement `find_all(lst, target)` that returns ALL indices where target appears; implement `search_rotated(lst, target)` for a sorted list that has been rotated (e.g., [5,6,7,1,2,3,4]); implement `count_less_than(sorted_lst, x)` in O(log n) using bisect.
