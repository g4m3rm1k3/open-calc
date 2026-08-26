# Lesson 29: Algorithmic Complexity — Big-O Notation

**What you will build**
In this lesson, you will build an understanding of Big-O notation, a mathematical tool used to describe how an algorithm's running time scales with the size of its input. You will classify common algorithms into growth rates ($O(1)$, $O(\log n)$, $O(n)$, $O(n \log n)$, $O(n^2)$, $O(2^n)$) and empirically measure their running times using the `time` module. The transferable problems you will master include understanding that Big-O describes the *rate of growth*, not the actual elapsed time; distinguishing between best, worst, and average-case performance; and recognizing why choosing the right algorithm often matters far more than hardware speed.

**What you need to know first**
- Lessons 0–28 (full curriculum through OOP capstone).

**Terms used in this lesson**
- **Algorithm** — A sequence of computational steps that transforms input into a desired output.
- **Big-O notation** — A mathematical notation used in computer science to describe the limiting behavior of a function when the argument tends towards a particular value or infinity, primarily used to classify algorithms according to how their run time or space requirements grow as the input size grows.
- **Rate of growth** — How quickly the time (or space) required by an algorithm increases as the input size increases.
- **Constant time ($O(1)$)** — An algorithm whose execution time is independent of the input size.
- **Linear time ($O(n)$)** — An algorithm whose execution time grows directly in proportion to the input size.
- **Logarithmic time ($O(\log n)$)** — An algorithm whose execution time grows proportionally to the logarithm of the input size, typically because it repeatedly divides the problem size.
- **Quadratic time ($O(n^2)$)** — An algorithm whose execution time grows proportionally to the square of the input size, often seen in algorithms with nested iterations over the data.
- **Exponential time ($O(2^n)$)** — An algorithm whose execution time doubles with each addition to the input data set.
- **Worst-case scenario** — The maximum amount of time an algorithm could possibly take for any given input of a specific size.
- **Best-case scenario** — The minimum amount of time an algorithm could take for a given input size.
- **Average-case scenario** — The expected running time of an algorithm over all possible inputs of a given size.

**Objects and methods used**

- **`time.time()`**
  - *What it is:* A built-in function in Python's standard `time` library.
  - *Implementation:* `def time() -> float:` Returns the current time in seconds since the Epoch.
  - *Its use:* Used here to empirically measure the actual execution time of algorithms by taking the difference between start and end times.
  - *Type:* Standard library function.
  - *Responsibility:* Provides a high-resolution timestamp representing the current system time.
  - *Depends on:* The underlying operating system's system clock.
  - *Connects to:* Called by application code to measure durations or record timestamps.
  - *Shape:* A procedural utility function.

- **`math.log2()`**
  - *What it is:* A built-in mathematical function for computing base-2 logarithms.
  - *Implementation:* `def log2(x) -> float:` Returns the base-2 logarithm of `x`.
  - *Its use:* Used to calculate the theoretical number of iterations required by $O(\log n)$ algorithms like binary search.
  - *Type:* Standard library function.
  - *Responsibility:* Computes logarithmic values precisely.
  - *Depends on:* A numerical argument `x`.
  - *Connects to:* Called by application code performing mathematical modeling.
  - *Shape:* A procedural mathematical utility.

- **`math.ceil()`**
  - *What it is:* A built-in function to round numbers up to the nearest integer.
  - *Implementation:* `def ceil(x) -> int:` Returns the ceiling of `x` as an Integral.
  - *Its use:* Used in calculating the maximum number of iterations for binary search, as iterations must be whole numbers.
  - *Type:* Standard library function.
  - *Responsibility:* Provides the smallest integer greater than or equal to a given number.
  - *Depends on:* A numerical argument `x`.
  - *Connects to:* Called by application code to enforce integral bounds.
  - *Shape:* A procedural mathematical utility.

---

## Concept Unit: What Big-O measures — rate of growth

### The Problem
When we write code, we often want to know if it's "fast enough." But measuring "speed" in pure seconds is flawed. If a program takes 2 seconds on a slow, older laptop and 0.5 seconds on a modern desktop, is the code fast or slow? We need a way to describe an algorithm's efficiency that is independent of hardware, programming language, and compiler optimizations. We need a way to describe how the number of operations *scales* as the size of the input data increases.

### Introduce the concept in isolation
Big-O notation describes how the number of operations grows as the input size $n$ grows. We focus only on the dominant terms, ignoring constants and lower-order terms. For example, if an algorithm takes exactly $3n + 5$ operations, we ignore the constant $3$ and the lower-order $+5$, describing it simply as $O(n)$.

Let's look at a concrete growth table to see the difference between common complexity classes:

```text
n       | O(1) | O(log n) | O(n)  | O(n log n) | O(n²)     | O(2^n)
--------|------|----------|-------|------------|-----------|-------
10      | 1    | 3        | 10    | 33         | 100       | 1,024
100     | 1    | 7        | 100   | 664        | 10,000    | huge
1,000   | 1    | 10       | 1,000 | 9,966      | 1,000,000 | astronomical
10,000  | 1    | 13       | 10k   | 132,877    | 100M      | impossible
```

This table reveals something crucial: for an input size of $10,000$, an $O(n^2)$ algorithm requires 100 million operations, while an $O(n \log n)$ algorithm requires only about 132,877. The choice of algorithm dictates performance far more than hardware upgrades ever could.

### Discard the throwaway example
This table is for theoretical understanding and does not represent project code.

### Project Change
No reference counterpart — this is a from-scratch addition because we are demonstrating foundational algorithmic concepts in isolated scripts.
- **Files affected:** `scratch_growth.py` (created)
- **Change type:** Add
- **Location:** Brand-new file
- **Dependencies:** None

### The New Code
```python
# The concepts here are theoretical. No specific new code is required for the table above.
```

### The Updated Project
N/A

### Mechanical walkthrough
The table demonstrates that as $n$ (the input size) grows, different algorithmic complexities diverge wildly in the amount of work they require. A constant time algorithm ($O(1)$) takes the exact same number of steps regardless of $n$. An exponential algorithm ($O(2^n)$) quickly becomes impossible to compute for even modestly sized inputs.

---

## Concept Unit: O(1) — constant time

### The Problem
How long does it take to find the very first item in a list of a million items? What about finding out if a specific key exists in a large dictionary? 

### Introduce the concept in isolation
```python
import time

def get_first(lst):
    return lst[0]  # O(1): one operation, regardless of list length

def is_even(n):
    return n % 2 == 0  # O(1)

# Dict and set lookup are O(1):
d = {i: i**2 for i in range(1000000)}

start = time.time()
_ = d[999999]
print(f'Dict lookup: {(time.time()-start)*1e6:.2f} microseconds')

start = time.time()
_ = d[0]
print(f'Dict lookup: {(time.time()-start)*1e6:.2f} microseconds')
```
*Expected output:*
```text
Dict lookup: 1.20 microseconds
Dict lookup: 1.15 microseconds
```

This output proves that finding the millionth element's key takes roughly the exact same microscopic amount of time as finding the very first key. The time does not depend on $n$. This is called **constant time** or **O(1)**.

### Discard the throwaway example
The throwaway script is discarded.

### Project Change
No reference counterpart — this is a from-scratch addition.
- **Files affected:** `constant_time.py` (created)
- **Change type:** Add
- **Location:** Brand-new file
- **Dependencies:** Python `time` module.

### The New Code
```python
def get_first(lst):
    return lst[0]
```

### The Updated Project
```python
# ← new
def get_first(lst):
    return lst[0]
```
This simple function returns the first element of any list.

### Mechanical walkthrough
1. `def get_first(lst):` defines the function.
2. `return lst[0]` directly accesses the memory offset for the first element. Because the location is calculated instantly via arithmetic rather than by searching, the operation takes the exact same amount of time regardless of how massive `lst` is. Python list indexing, dictionary lookups, set membership checks, `len()`, and list `append()` operations are all $O(1)$.

---

## Concept Unit: O(n) — linear time

### The Problem
If we want to find the largest number in an unsorted list, we have no choice but to look at every single number. If the list doubles in size, how does the time required change?

### Introduce the concept in isolation
```python
import time

def find_max(lst):
    best = lst[0]
    for x in lst:      # n iterations
        if x > best:
            best = x
    return best

for size in [10_000, 100_000, 1_000_000]:
    data = list(range(size))
    start = time.time()
    find_max(data)
    elapsed = time.time() - start
    print(f'n={size:>9}: {elapsed:.4f}s')
```
*Expected output:*
```text
n=    10000: 0.0007s
n=   100000: 0.0068s
n=  1000000: 0.0693s
```
This output proves that when $n$ increases by a factor of 10, the elapsed time also increases by a factor of exactly 10. The work scales directly in proportion to the input size. This is called **linear time** or **O(n)**.

### Discard the throwaway example
The throwaway script is discarded.

### Project Change
No reference counterpart — this is a from-scratch addition.
- **Files affected:** `linear_time.py` (created)
- **Change type:** Add
- **Location:** Brand-new file
- **Dependencies:** Python `time` module.

### The New Code
```python
def find_max(lst):
    best = lst[0]
    for x in lst:
        if x > best:
            best = x
    return best
```

### The Updated Project
```python
# ← new
def find_max(lst):
    best = lst[0]
    for x in lst:
        if x > best:
            best = x
    return best
```
This function traverses an entire list to locate the maximum value.

### Mechanical walkthrough
1. `def find_max(lst):` defines the function.
2. `best = lst[0]` initializes the tracker to the first element ($O(1)$).
3. `for x in lst:` begins an iteration. This block will execute $n$ times, where $n$ is the length of `lst`.
4. `if x > best:` and `best = x` are constant-time operations occurring *inside* the loop.
Since $O(1)$ work occurs $n$ times, the overall complexity is $O(n)$. Operations like `x in lst` for lists also take $O(n)$ time because they must scan the elements one by one.

---

## Concept Unit: O(log n) — logarithmic time

### The Problem
Searching one item at a time is slow. If a list is already sorted, can we find an item faster than checking every single element?

### Introduce the concept in isolation
```python
import math

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

for size in [1_000, 1_000_000, 1_000_000_000]:
    iterations = math.ceil(math.log2(size))
    print(f'n={size:>13}: ~{iterations} iterations')
```
*Expected output:*
```text
n=         1000: ~10 iterations
n=      1000000: ~20 iterations
n= 1000000000: ~30 iterations
```
This output proves the extraordinary efficiency of logarithmic scaling: searching a billion items takes a maximum of just 30 operations because we halve the remaining possibilities on every single step. This is called **logarithmic time** or **O(log n)**.

### Discard the throwaway example
The throwaway script is discarded.

### Project Change
No reference counterpart — this is a from-scratch addition.
- **Files affected:** `logarithmic_time.py` (created)
- **Change type:** Add
- **Location:** Brand-new file
- **Dependencies:** Python `math` module.

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
# ← new
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
This function efficiently finds a target in a sorted list by repeatedly halving the search space.

### Mechanical walkthrough
1. `def binary_search(lst, target):` defines the function.
2. `low, high = 0, len(lst) - 1` sets pointers to the boundaries.
3. `while low <= high:` loops as long as the search space is valid.
4. `mid = (low + high) // 2` finds the middle index.
5. If `lst[mid] == target:`, the search terminates immediately.
6. `elif lst[mid] < target:` discards the lower half of the list by moving `low`.
7. `else:` discards the upper half by moving `high`.
Because the size of the search window is divided by 2 in each iteration, the maximum number of iterations is $\log_2(n)$. 

---

## Concept Unit: O(n²) — quadratic time

### The Problem
What happens if an algorithm requires nesting one $O(n)$ operation inside another $O(n)$ operation?

### Introduce the concept in isolation
```python
import time

def bubble_sort(lst):
    lst = lst[:]  # copy
    n = len(lst)
    for i in range(n):          # n iterations
        for j in range(n-1-i):  # ~n iterations each
            if lst[j] > lst[j+1]:
                lst[j], lst[j+1] = lst[j+1], lst[j]
    return lst

for size in [1_000, 2_000, 4_000]:
    data = list(range(size, 0, -1))  # worst case: reversed
    start = time.time()
    bubble_sort(data)
    elapsed = time.time() - start
    print(f'n={size}: {elapsed:.3f}s')
```
*Expected output:*
```text
n=1000: 0.102s
n=2000: 0.412s
n=4000: 1.651s
```
This output proves that when $n$ doubles (e.g., from 1000 to 2000), the execution time increases by a factor of 4. When $n$ doubles again, time increases by a factor of 4 again. The time required scales with the square of the input size. This is called **quadratic time** or **O(n²)**.

### Discard the throwaway example
The throwaway script is discarded.

### Project Change
No reference counterpart — this is a from-scratch addition.
- **Files affected:** `quadratic_time.py` (created)
- **Change type:** Add
- **Location:** Brand-new file
- **Dependencies:** Python `time` module.

### The New Code
```python
def bubble_sort(lst):
    lst = lst[:]
    n = len(lst)
    for i in range(n):
        for j in range(n-1-i):
            if lst[j] > lst[j+1]:
                lst[j], lst[j+1] = lst[j+1], lst[j]
    return lst
```

### The Updated Project
```python
# ← new
def bubble_sort(lst):
    lst = lst[:]
    n = len(lst)
    for i in range(n):
        for j in range(n-1-i):
            if lst[j] > lst[j+1]:
                lst[j], lst[j+1] = lst[j+1], lst[j]
    return lst
```
This function sorts a list by repeatedly swapping adjacent elements that are out of order.

### Mechanical walkthrough
1. `def bubble_sort(lst):` defines the function.
2. `for i in range(n):` iterates $n$ times.
3. `for j in range(n-1-i):` iterates up to $n$ times for each iteration of the outer loop.
4. `if lst[j] > lst[j+1]:` compares adjacent items.
5. `lst[j], lst[j+1] = lst[j+1], lst[j]` swaps them if needed.
Because an $O(n)$ loop is nested inside another $O(n)$ loop, the total number of operations is proportional to $n \times n = n^2$.

---

## Concept Unit: O(2^n) — exponential time

### The Problem
Some recursive algorithms solve a problem by branching multiple times for every step. How badly does this scale?

### Introduce the concept in isolation
```python
import time

def fib_naive(n):
    if n <= 1:
        return n
    return fib_naive(n-1) + fib_naive(n-2)

for n in [20, 30, 35]:
    start = time.time()
    result = fib_naive(n)
    elapsed = time.time() - start
    print(f'fib({n}) = {result}, time: {elapsed:.3f}s')
```
*Expected output:*
```text
fib(20) = 6765, time: 0.001s
fib(30) = 832040, time: 0.234s
fib(35) = 9227465, time: 2.611s
```
This output proves that each tiny increment in $n$ causes a massive, disproportionate surge in required time. Evaluating `fib(50)` this way would literally take years on a standard computer. This catastrophic scaling is called **exponential time** or **O(2^n)**.

### Discard the throwaway example
The throwaway script is discarded.

### Project Change
No reference counterpart — this is a from-scratch addition.
- **Files affected:** `exponential_time.py` (created)
- **Change type:** Add
- **Location:** Brand-new file
- **Dependencies:** Python `time` module.

### The New Code
```python
def fib_naive(n):
    if n <= 1:
        return n
    return fib_naive(n-1) + fib_naive(n-2)
```

### The Updated Project
```python
# ← new
def fib_naive(n):
    if n <= 1:
        return n
    return fib_naive(n-1) + fib_naive(n-2)
```
This function calculates Fibonacci numbers using a naive branching recursion.

### Mechanical walkthrough
1. `def fib_naive(n):` defines the function.
2. `if n <= 1: return n` handles the base cases.
3. `return fib_naive(n-1) + fib_naive(n-2)` is where the disaster happens. Every single function call spawns *two more* function calls, which in turn spawn two more each. This causes the number of operations to double every time $n$ increases by 1, yielding $O(2^n)$ complexity. The solution (memoization) will be covered in Lesson 34.

---

## Concept Unit: Best, worst, and average case

### The Problem
When we say `in` on a list is $O(n)$, does it *always* take $n$ steps? What if the item we are looking for happens to be the very first one?

### Introduce the concept in isolation
```python
def linear_search(lst, target):
    for i, x in enumerate(lst):
        if x == target:
            return i
    return -1

# Best case: target is lst[0] -- O(1)
# Worst case: target is last or not present -- O(n)
# Average case: target is in the middle -- O(n/2) = O(n)
```
*Expected behavior:* If the `target` is the first item, the loop exits on iteration 1. If it's not present, it checks every item.

### Discard the throwaway example
The throwaway script is discarded.

### Project Change
No reference counterpart — this is a from-scratch addition.
- **Files affected:** `cases.py` (created)
- **Change type:** Add
- **Location:** Brand-new file
- **Dependencies:** None

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
# ← new
def linear_search(lst, target):
    for i, x in enumerate(lst):
        if x == target:
            return i
    return -1
```
This function searches for a target in a list linearly.

### Mechanical walkthrough
1. `def linear_search(lst, target):` defines the function.
2. `for i, x in enumerate(lst):` begins iterating through the list.
3. `if x == target: return i` returns instantly if the match is found. 
Big-O notation typically refers to the **worst-case scenario** — the maximum bound on the time required. Thus, we say linear search is $O(n)$, even though occasionally it might get lucky and finish in $O(1)$ time. 
- Python's `.sort()` uses Timsort, which is $O(n \log n)$ worst case.
- List membership (`in`) is $O(n)$ worst case.
- Dictionary key membership (`in`) is $O(1)$ average case (hash collisions are rare, though worst case is theoretically $O(n)$).
- Binary search on a sorted list is $O(\log n)$ worst case.

---

Big-O provides the standardized vocabulary for algorithmic discussion. 
In Lesson 30, we will cover search algorithms in more depth, specifically contrasting linear search and binary search implementations. 

*Exercises:* Classify each of these as $O(1)$, $O(\log n)$, $O(n)$, $O(n \log n)$, $O(n^2)$:
(a) finding an element in a set
(b) finding an element in an unsorted list
(c) Python's `sorted()`
(d) selection sort
(e) dict key lookup
Empirically verify your answers by measuring timing for different input sizes.
