# Lesson 32: Divide and Conquer

The reader understands the divide-and-conquer paradigm: split the problem in half, solve each half recursively, combine the results. They implement merge sort (O(n log n)) and see it applied to fast exponentiation (O(log n)). The transferable insight: divide and conquer achieves O(n log n) or O(log n) by splitting problems in half. Any algorithm that can split its input and recombine the results in linear time gets O(n log n) total. This is why binary search, merge sort, FFT, and many others are so fast.

What you need to know first: Lessons 00-31.

Terms used in this lesson:
- **Divide and Conquer** — A design paradigm that solves a problem by recursively breaking it down into two or more sub-problems of the same type until they become simple enough to be solved directly.
- **Base case** — The condition in a recursive function that stops the recursion, preventing an infinite loop.
- **O(n log n)** — The time complexity typically seen when a dataset of size n is repeatedly halved (log n steps) and recombined with linear (n) work at each step.
- **O(log n)** — The time complexity when a problem space is halved at each step without linear recombination work.
- **Pivot** — The element chosen in quicksort to partition the array.
- **Partition** — The step in quicksort that reorganizes the array around a pivot element.
- **def** — Keyword used to define a new function.
- **if** / **else** — Conditional keywords used to branch logic.
- **return** — Keyword used to exit a function and pass a value back to the caller.
- **while** / **for** / **in** — Looping keywords to iterate over sequences or run while a condition holds.
- **global** — Keyword used to declare that a variable inside a function refers to the module-level variable of the same name.
- **import** — Keyword used to bring external modules into the current namespace.
- **is** / **None** — `is` checks for object identity. `None` is the singleton object representing the absence of a value.
- **List slicing `[:]`** — Syntax to create a new list containing a subset of elements from an existing list.
- **List creation `[]`** — Syntax to define a new empty or populated list.
- **f-string** — Syntax `f'...'` for formatting strings with embedded Python expressions.
- **Operators (`//`, `%`, `<=`, `<`, `==`, `+=`, `=`, `+`, `-`, `*`)** — Standard arithmetic, comparison, and assignment operators in Python.

Objects and methods used:

**`len`**
- *What it is:* A built-in function to count items.
- *Implementation:* `def len(obj: Sized) -> int`
- *Its use:* Used to check if a list has reached the base case (size 1 or 0) or to find the midpoint.
- *Type:* Built-in function.
- *Responsibility:* Returns the number of items in a container.
- *Depends on:* A single argument that implements the sized protocol (like a list).
- *Connects to:* Called by our sorting/math algorithms; returns an integer.
- *Shape:* Core standard library.

**`max`**
- *What it is:* A built-in function to find the largest item.
- *Implementation:* `def max(arg1, arg2, *args)`
- *Its use:* Used to combine the results of two recursive calls by returning the larger of the two.
- *Type:* Built-in function.
- *Responsibility:* Identifies and returns the maximum value among its arguments.
- *Depends on:* Two or more comparable arguments.
- *Connects to:* Called by `max_dc`; returns a single value.
- *Shape:* Core standard library.

**`list.append`**
- *What it is:* A list method to add one item.
- *Implementation:* `def append(self, object: _T) -> None`
- *Its use:* Used to add the next smallest item to the merged result list.
- *Type:* Instance method of `list`.
- *Responsibility:* Mutates the list by adding the given object to the end.
- *Depends on:* An existing list instance and one item to add.
- *Connects to:* Called during the merge step; returns None.
- *Shape:* Standard list API.

**`list.extend`**
- *What it is:* A list method to add multiple items.
- *Implementation:* `def extend(self, iterable: Iterable[_T]) -> None`
- *Its use:* Used to append all remaining elements from a list when the other list is exhausted.
- *Type:* Instance method of `list`.
- *Responsibility:* Mutates the list by appending all items from the provided iterable.
- *Depends on:* An existing list instance and an iterable of items.
- *Connects to:* Called at the end of the merge step; returns None.
- *Shape:* Standard list API.

**`math.log2`**
- *What it is:* A mathematical function to compute base-2 logarithm.
- *Implementation:* `def log2(x: float) -> float`
- *Its use:* Used to verify that the empirical total work matches the O(n log n) theoretical bound.
- *Type:* Module-level function in `math`.
- *Responsibility:* Calculates the base-2 logarithm of a number.
- *Depends on:* A positive numeric argument.
- *Connects to:* Called in our profiling script; returns a float.
- *Shape:* Standard library `math` module.

**`print`**
- *What it is:* A built-in function to output text.
- *Implementation:* `def print(*values, sep=' ', end='\n', file=sys.stdout, flush=False)`
- *Its use:* Used to display the results of our algorithms.
- *Type:* Built-in function.
- *Responsibility:* Writes string representations of objects to a stream.
- *Depends on:* Objects to print.
- *Connects to:* Writes to standard output.
- *Shape:* Core standard library.

**`list`**
- *What it is:* A built-in type for mutable sequences.
- *Implementation:* `class list(Iterable[_T])`
- *Its use:* Used to construct a list from a `range` object for sorting.
- *Type:* Built-in class.
- *Responsibility:* Maintains an ordered, mutable sequence of items.
- *Depends on:* An optional iterable to initialize from.
- *Connects to:* Instantiated to hold our test data.
- *Shape:* Core standard library.

**`range`**
- *What it is:* A built-in type generating a sequence of numbers.
- *Implementation:* `class range(start, stop[, step])`
- *Its use:* Used to generate a sequence of numbers for loops or to populate a list.
- *Type:* Built-in class.
- *Responsibility:* Generates arithmetic progressions lazily.
- *Depends on:* Integer bounds.
- *Connects to:* Consumed by `for` loops or `list()`.
- *Shape:* Core standard library.

## Concept Unit: The divide-and-conquer pattern
### The Problem
How can we find the maximum value in a list more efficiently, or at least differently, than simply looking at every element one by one in a loop? If we split the list in half, and knew the maximum of the left half and the maximum of the right half, could we find the overall maximum without looking at all elements again? What if we kept splitting until the halves were trivially small?

### Introduce the concept in isolation
```python
# Throwaway demonstration of simple division
data = [3, 1, 4, 1]
mid = len(data) // 2
left, right = data[:mid], data[mid:]
print(left, right)
```
Output confidently predicted: `[3, 1] [4, 1]`
This proves that we can slice a list into two distinct halves. This is the foundation of **divide and conquer**.

### Discard the throwaway
This snippet is deleted and will not appear in the project again.

### Project Change
- Reference Source: No reference counterpart — this is a standalone theory lesson because it introduces algorithmic fundamentals.
- Files affected: `lesson32.py` (created)
- Change type: add
- Location: Brand new file.
- Dependencies: None.

### The New Code
```python
def max_linear(lst):
    m = lst[0]
    for x in lst[1:]:
        if x > m: m = x
    return m

def max_dc(lst):
    if len(lst) == 1:
        return lst[0]
    mid = len(lst) // 2
    left_max  = max_dc(lst[:mid])
    right_max = max_dc(lst[mid:])
    return max(left_max, right_max)

data = [3, 1, 4, 1, 5, 9, 2, 6]
```

### The Updated Project
```python
# 1: def max_linear(lst):             # <- new
# 2:     m = lst[0]                   # <- new
# 3:     for x in lst[1:]:            # <- new
# 4:         if x > m: m = x          # <- new
# 5:     return m                     # <- new
# 6: 
# 7: def max_dc(lst):                 # <- new
# 8:     if len(lst) == 1:            # <- new
# 9:         return lst[0]            # <- new
# 10:    mid = len(lst) // 2          # <- new
# 11:    left_max  = max_dc(lst[:mid]) # <- new
# 12:    right_max = max_dc(lst[mid:]) # <- new
# 13:    return max(left_max, right_max) # <- new
# 14: 
# 15: data = [3, 1, 4, 1, 5, 9, 2, 6] # <- new
```
This adds the `max_dc` function which applies the divide-and-conquer pattern to find the maximum element.

### Mechanical walkthrough
- `def max_linear(lst):`: Defines a linear approach taking one list argument.
- `m = lst[0]`: Initializes maximum to the first element.
- `for x in lst[1:]:`: Iterates through the rest of the list.
- `if x > m: m = x`: Updates maximum if a larger value is found.
- `return m`: Returns the found maximum.
- `def max_dc(lst):`: Defines the divide-and-conquer function.
- `if len(lst) == 1:`: Checks if the list has only one element (base case).
- `return lst[0]`: Returns the only element.
- `mid = len(lst) // 2`: Calculates the midpoint integer index using floor division.
- `left_max = max_dc(lst[:mid])`: Recursively calls `max_dc` on the left half.
- `right_max = max_dc(lst[mid:])`: Recursively calls `max_dc` on the right half.
- `return max(left_max, right_max)`: Uses the built-in `max` function to return the larger of the two maxes.
- `data = [...]`: Creates a test list.

### CS lens
Divide and Conquer is a fundamental algorithmic paradigm. It appears in:
1. Merge Sort and Quick Sort for efficient sorting.
2. Binary Search for O(log n) lookups in sorted data.
3. The Fast Fourier Transform (FFT) for signal processing.
4. Strassen's matrix multiplication algorithm.

### SE lens
Design principle: Recursive decomposition. The alternative not chosen is iterative processing with manual stacks. The real tradeoff is call stack depth (which costs memory and risks stack overflow in Python) versus the clean, expressive simplicity of recursive logic.

### Commands needed
`python3 lesson32.py`

### Run it
Predicted confidently: Nothing will print yet since we only defined the variables and functions.

### One sentence connecting to previous unit
Now that we have seen how dividing a list allows us to find a maximum, we can apply this same splitting technique to sorting.

## Concept Unit: Merge sort
### The Problem
If we split an unsorted list into halves down to single elements, those single elements are technically "sorted" lists of length 1. How can we take two sorted lists and combine them into a single sorted list efficiently without re-sorting from scratch? What is the logic for interleaving them?

### Introduce the concept in isolation
```python
# Throwaway demonstration of merging two sorted lists
left = [3, 5]
right = [1, 4]
res = []
i = 0; j = 0
while i < len(left) and j < len(right):
    if left[i] < right[j]:
        res.append(left[i])
        i += 1
    else:
        res.append(right[j])
        j += 1
res.extend(left[i:])
res.extend(right[j:])
print(res)
```
Output confidently predicted: `[1, 3, 4, 5]`
This proves we can combine two sorted arrays in linear time by walking pointers. This is the **merge** operation.

### Discard the throwaway
This snippet is deleted and will not appear in the project again.

### Project Change
- Reference Source: No reference counterpart.
- Files affected: `lesson32.py` (modified)
- Change type: add
- Location: Appended to the file.
- Dependencies: Previous unit's basic understanding.

### The New Code
```python
def merge_sort(lst):
    if len(lst) <= 1:
        return lst
    mid = len(lst) // 2
    left  = merge_sort(lst[:mid])
    right = merge_sort(lst[mid:])
    return merge(left, right)

def merge(left, right):
    result = []
    i = j = 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            result.append(left[i])
            i += 1
        else:
            result.append(right[j])
            j += 1
    result.extend(left[i:])
    result.extend(right[j:])
    return result

print(merge_sort([5, 3, 8, 1, 4]))
```

### The Updated Project
```python
# 16: def merge_sort(lst):                     # <- new
# 17:     if len(lst) <= 1:                    # <- new
# 18:         return lst                       # <- new
# 19:     mid = len(lst) // 2                  # <- new
# 20:     left  = merge_sort(lst[:mid])        # <- new
# 21:     right = merge_sort(lst[mid:])        # <- new
# 22:     return merge(left, right)            # <- new
# 23: 
# 24: def merge(left, right):                  # <- new
# 25:     result = []                          # <- new
# 26:     i = j = 0                            # <- new
# 27:     while i < len(left) and j < len(right): # <- new
# 28:         if left[i] <= right[j]:          # <- new
# 29:             result.append(left[i])       # <- new
# 30:             i += 1                       # <- new
# 31:         else:                            # <- new
# 32:             result.append(right[j])      # <- new
# 33:             j += 1                       # <- new
# 34:     result.extend(left[i:])              # <- new
# 35:     result.extend(right[j:])             # <- new
# 36:     return result                        # <- new
# 37: 
# 38: print(merge_sort([5, 3, 8, 1, 4]))       # <- new
```
This adds the `merge_sort` function which breaks the list down, and `merge` which stitches it back together in sorted order.

### Mechanical walkthrough
- `def merge_sort(lst):`: Defines the main sorting function.
- `if len(lst) <= 1:`: Base case; lists of 0 or 1 element are already sorted.
- `return lst`: Returns the sorted list.
- `mid = len(lst) // 2`: Finds the middle index.
- `left = merge_sort(lst[:mid])`: Sorts the left half recursively.
- `right = merge_sort(lst[mid:])`: Sorts the right half recursively.
- `return merge(left, right)`: Combines the two sorted halves.
- `def merge(left, right):`: Defines the helper merging function.
- `result = []`: Initializes an empty list to hold the merged elements.
- `i = j = 0`: Initializes two pointer indices to 0.
- `while i < len(left) and j < len(right):`: Loops as long as neither list is exhausted.
- `if left[i] <= right[j]:`: Compares the current elements of both lists.
- `result.append(left[i])`: Adds the smaller element to the result.
- `i += 1`: Advances the left pointer.
- `else:`: Handles the case where the right element is smaller.
- `result.append(right[j])`: Adds the right element.
- `j += 1`: Advances the right pointer.
- `result.extend(left[i:])`: Appends any remaining elements from the left list.
- `result.extend(right[j:])`: Appends any remaining elements from the right list.
- `return result`: Returns the fully merged and sorted list.
- `print(...)`: Prints the result of the function call.

### CS lens
Merge Sort is a classic Divide and Conquer algorithm. It appears in:
1. Python's Timsort (which is derived from merge sort and insertion sort).
2. External sorting algorithms where data is too large to fit in RAM.
3. Linked list sorting (where it can be implemented with O(1) space).

### SE lens
Design principle: Delegation. The alternative not chosen is an in-place sort like Bubble Sort. The real tradeoff is that Merge Sort is stable and guarantees O(n log n) time, but typically requires O(n) auxiliary space to hold the newly merged arrays, unlike in-place algorithms.

### Commands needed
`python3 lesson32.py`

### Run it
Predicted confidently: `[1, 3, 4, 5, 8]`

### One sentence connecting to previous unit
Having built merge sort, we must now formally verify its efficiency by tracking exactly how much work it performs across all recursive layers.

## Concept Unit: Merge sort complexity analysis
### The Problem
How do we actually prove that merge sort runs in O(n log n) time instead of O(n^2)? If we count every time a recursive function is called and measure how many elements are merged at each step, will the total work mirror the theoretical mathematical curve `n * log2(n)`?

### Introduce the concept in isolation
```python
# Throwaway demonstration of global counters
count = 0
def increment():
    global count
    count += 1
increment()
print(count)
```
Output confidently predicted: `1`
This proves we can track a running tally across multiple function calls using the **global** keyword.

### Discard the throwaway
This snippet is deleted and will not appear in the project again.

### Project Change
- Reference Source: No reference counterpart.
- Files affected: `lesson32.py` (modified)
- Change type: add
- Location: Appended to the file.
- Dependencies: None.

### The New Code
```python
def merge_sort_counted(lst, depth=0):
    global call_count, total_work
    call_count += 1
    if len(lst) <= 1:
        return lst
    mid = len(lst) // 2
    left  = merge_sort_counted(lst[:mid], depth+1)
    right = merge_sort_counted(lst[mid:], depth+1)
    merged = merge(left, right)
    total_work += len(lst)
    return merged

for n in [8, 16, 32, 64]:
    call_count = 0
    total_work = 0
    merge_sort_counted(list(range(n, 0, -1)))
    import math
    print(f'n={n:3d}: calls={call_count}, work={total_work}, n*log2(n)={n*math.log2(n):.0f}')
```

### The Updated Project
```python
# 40: def merge_sort_counted(lst, depth=0):             # <- new
# 41:     global call_count, total_work                 # <- new
# 42:     call_count += 1                               # <- new
# 43:     if len(lst) <= 1:                             # <- new
# 44:         return lst                                # <- new
# 45:     mid = len(lst) // 2                           # <- new
# 46:     left  = merge_sort_counted(lst[:mid], depth+1) # <- new
# 47:     right = merge_sort_counted(lst[mid:], depth+1) # <- new
# 48:     merged = merge(left, right)                   # <- new
# 49:     total_work += len(lst)                        # <- new
# 50:     return merged                                 # <- new
# 51: 
# 52: for n in [8, 16, 32, 64]:                         # <- new
# 53:     call_count = 0                                # <- new
# 54:     total_work = 0                                # <- new
# 55:     merge_sort_counted(list(range(n, 0, -1)))     # <- new
# 56:     import math                                   # <- new
# 57:     print(f'n={n:3d}: calls={call_count}, work={total_work}, n*log2(n)={n*math.log2(n):.0f}') # <- new
```
This adds an instrumented version of merge sort to empirically measure its time complexity.

### Mechanical walkthrough
- `def merge_sort_counted(lst, depth=0):`: Defines the tracked sort function with a default depth argument.
- `global call_count, total_work`: Declares intent to modify module-level counter variables.
- `call_count += 1`: Increments the recursive call counter.
- `if len(lst) <= 1: return lst`: Standard base case.
- `mid = len(lst) // 2`: Midpoint calculation.
- `left = merge_sort_counted(lst[:mid], depth+1)`: Sorts left half, incrementing depth.
- `right = merge_sort_counted(lst[mid:], depth+1)`: Sorts right half, incrementing depth.
- `merged = merge(left, right)`: Uses the original merge function.
- `total_work += len(lst)`: Adds the size of the current list to the total work (since merging takes O(n) time).
- `return merged`: Returns the sorted list.
- `for n in [8, 16, 32, 64]:`: Loops through various input sizes.
- `call_count = 0; total_work = 0`: Resets global counters for each run.
- `merge_sort_counted(list(range(n, 0, -1)))`: Calls the function with a worst-case reversed list.
- `import math`: Imports the standard math library.
- `print(...)`: Uses an f-string to print formatted metrics, comparing empirical work against mathematical expectation.

### CS lens
Algorithmic Complexity is a fundamental CS concept. It appears in:
1. Benchmarking database queries.
2. Predicting load limits for web servers.
3. Choosing appropriate data structures (e.g. hash maps vs trees).

### SE lens
Design principle: Profiling and Instrumentation. The alternative not chosen is relying solely on mathematical proofs. The real tradeoff is that modifying code to inject counters (`global` state) makes it messy and thread-unsafe, but provides undeniable runtime validation of theoretical complexity.

### Commands needed
`python3 lesson32.py`

### Run it
Predicted confidently:
```
n=  8: calls=15, work=24, n*log2(n)=24
n= 16: calls=31, work=64, n*log2(n)=64
n= 32: calls=63, work=160, n*log2(n)=160
n= 64: calls=127, work=384, n*log2(n)=384
```

### One sentence connecting to previous unit
If cutting a problem in half and processing the halves gives us O(n log n), what happens if we cut it in half and only process *one* of the halves?

## Concept Unit: Fast exponentiation
### The Problem
If we want to compute 2^1000000, multiplying 2 by itself a million times is very slow (O(n)). Since `2^10 = (2^5) * (2^5)`, we can compute `2^5` just once, and square it. Can we write a recursive function that repeatedly halves the exponent to compute massive powers in mere fractions of a second?

### Introduce the concept in isolation
```python
# Throwaway demonstration of halving an exponent
exp = 10
print(exp // 2, exp % 2 == 0)
exp = 5
print(exp // 2, exp % 2 == 0)
```
Output confidently predicted: `5 True`, `2 False`
This proves we can repeatedly halve integers and check if they are even. This is the **halving step**.

### Discard the throwaway
This snippet is deleted and will not appear in the project again.

### Project Change
- Reference Source: No reference counterpart.
- Files affected: `lesson32.py` (modified)
- Change type: add
- Location: Appended to the file.
- Dependencies: None.

### The New Code
```python
def power(base, exp):
    if exp == 0:
        return 1
    if exp % 2 == 0:
        half = power(base, exp // 2)
        return half * half
    else:
        return base * power(base, exp - 1)

print(power(2, 10))
print(power(3, 5))
```

### The Updated Project
```python
# 59: def power(base, exp):                       # <- new
# 60:     if exp == 0:                            # <- new
# 61:         return 1                            # <- new
# 62:     if exp % 2 == 0:                        # <- new
# 63:         half = power(base, exp // 2)        # <- new
# 64:         return half * half                  # <- new
# 65:     else:                                   # <- new
# 66:         return base * power(base, exp - 1)  # <- new
# 67: 
# 68: print(power(2, 10))                         # <- new
# 69: print(power(3, 5))                          # <- new
```
This adds the O(log n) exponentiation function.

### Mechanical walkthrough
- `def power(base, exp):`: Defines the exponentiation function.
- `if exp == 0:`: Base case; anything to the power of 0 is 1.
- `return 1`: Returns the base case result.
- `if exp % 2 == 0:`: Checks if the exponent is an even number.
- `half = power(base, exp // 2)`: Recursively computes the power of half the exponent.
- `return half * half`: Combines by squaring the result of the half, cutting work in half.
- `else:`: If the exponent is odd.
- `return base * power(base, exp - 1)`: Reduces the exponent by 1 to make it even for the next call.
- `print(...)`: Prints the results.

### CS lens
O(log n) efficiency is a CS holy grail. It appears in:
1. Cryptography (RSA relies heavily on fast modular exponentiation).
2. Binary search trees finding an element.
3. Blockchain state verification (Merkle proofs).

### SE lens
Design principle: Algorithmic optimization over hardware scaling. The alternative not chosen is waiting for a million iterations in a `for` loop. The real tradeoff is complexity; a `for` loop is universally understood, whereas recursive halving requires deeper conceptual tracing, but it changes an intractable problem into an instantaneous one.

### Commands needed
`python3 lesson32.py`

### Run it
Predicted confidently:
```
1024
243
```

### One sentence connecting to previous unit
While halving the workload makes math incredibly fast, we can also apply divide-and-conquer to array sorting in a way that doesn't use extra memory, unlike merge sort.

## Concept Unit: Quicksort
### The Problem
Merge sort guarantees fast sorting, but creating a new `result = []` list every time uses O(n) extra memory. Can we divide an array in half and sort it *in place*, by just swapping elements around a chosen "pivot" value? 

### Introduce the concept in isolation
```python
# Throwaway demonstration of in-place swapping
arr = [10, 20]
arr[0], arr[1] = arr[1], arr[0]
print(arr)
```
Output confidently predicted: `[20, 10]`
This proves that Python allows simultaneous variable assignment to swap values without a temporary variable. This is **in-place swapping**.

### Discard the throwaway
This snippet is deleted and will not appear in the project again.

### Project Change
- Reference Source: No reference counterpart.
- Files affected: `lesson32.py` (modified)
- Change type: add
- Location: Appended to the file.
- Dependencies: None.

### The New Code
```python
def quicksort(lst, lo=0, hi=None):
    if hi is None:
        hi = len(lst) - 1
    if lo < hi:
        p = partition(lst, lo, hi)
        quicksort(lst, lo, p - 1)
        quicksort(lst, p + 1, hi)

def partition(lst, lo, hi):
    pivot = lst[hi]
    i = lo - 1
    for j in range(lo, hi):
        if lst[j] <= pivot:
            i += 1
            lst[i], lst[j] = lst[j], lst[i]
    lst[i+1], lst[hi] = lst[hi], lst[i+1]
    return i + 1

data = [3, 6, 8, 10, 1, 2, 1]
quicksort(data)
print(data)
```

### The Updated Project
```python
# 71: def quicksort(lst, lo=0, hi=None):          # <- new
# 72:     if hi is None:                          # <- new
# 73:         hi = len(lst) - 1                   # <- new
# 74:     if lo < hi:                             # <- new
# 75:         p = partition(lst, lo, hi)          # <- new
# 76:         quicksort(lst, lo, p - 1)           # <- new
# 77:         quicksort(lst, p + 1, hi)           # <- new
# 78: 
# 79: def partition(lst, lo, hi):                 # <- new
# 80:     pivot = lst[hi]                         # <- new
# 81:     i = lo - 1                              # <- new
# 82:     for j in range(lo, hi):                 # <- new
# 83:         if lst[j] <= pivot:                 # <- new
# 84:             i += 1                          # <- new
# 85:             lst[i], lst[j] = lst[j], lst[i] # <- new
# 86:     lst[i+1], lst[hi] = lst[hi], lst[i+1]   # <- new
# 87:     return i + 1                            # <- new
# 88: 
# 89: data = [3, 6, 8, 10, 1, 2, 1]               # <- new
# 90: quicksort(data)                             # <- new
# 91: print(data)                                 # <- new
```
This introduces the quicksort algorithm which uses in-place array partitioning.

### Mechanical walkthrough
- `def quicksort(lst, lo=0, hi=None):`: Defines quicksort with optional low and high index bounds.
- `if hi is None: hi = len(lst) - 1`: Initializes the high bound to the last index on the first call.
- `if lo < hi:`: Ensures the bounds define a valid sub-array to sort.
- `p = partition(lst, lo, hi)`: Calls partition to organize the array around a pivot and returns the pivot's final index.
- `quicksort(lst, lo, p - 1)`: Recursively sorts the elements before the pivot.
- `quicksort(lst, p + 1, hi)`: Recursively sorts the elements after the pivot.
- `def partition(lst, lo, hi):`: Defines the partition helper function.
- `pivot = lst[hi]`: Chooses the last element in the given range as the comparison pivot.
- `i = lo - 1`: Initializes the pointer for the boundary of smaller elements.
- `for j in range(lo, hi):`: Iterates through the given range up to the pivot.
- `if lst[j] <= pivot:`: Checks if the current element is smaller than or equal to the pivot.
- `i += 1`: Moves the smaller-element boundary forward.
- `lst[i], lst[j] = lst[j], lst[i]`: Swaps the current element into the smaller-element zone.
- `lst[i+1], lst[hi] = lst[hi], lst[i+1]`: Swaps the pivot itself into its final correct position right after the smaller elements.
- `return i + 1`: Returns the final index of the pivot.
- `data = [...]`: Creates test data.
- `quicksort(data)`: Mutates the list in place.
- `print(data)`: Prints the now-sorted list.

### CS lens
In-place memory management is vital. It appears in:
1. Embedded systems with strict RAM constraints.
2. V8 JavaScript engine array sorting.
3. Linux kernel memory allocators.

### SE lens
Design principle: Mutability vs Immutability. The alternative not chosen is Merge Sort returning a brand new list. The real tradeoff is that mutating data in place (Quicksort) saves memory and garbage collection overhead, but makes functions impure and introduces side-effects, making concurrent access dangerous.

### Commands needed
`python3 lesson32.py`

### Run it
Predicted confidently: `[1, 1, 2, 3, 6, 8, 10]`

### One sentence connecting to previous unit
We now have two powerful sorting algorithms and a mathematical technique, all sharing the same divide-and-conquer philosophy.

## Closing
### Connect the pieces
Trace `merge_sort([5, 3, 8, 1, 4])` through all concept units:
- We start with the full problem `[5, 3, 8, 1, 4]`.
- The divide step splits it into `[5, 3]` and `[8, 1, 4]`.
- We recurse: `[5, 3]` splits into `[5]` and `[3]`.
- The base case hits, and the merge step combines them into `[3, 5]`.
- Meanwhile, the right half recurses, splits, and merges into `[1, 4, 8]`.
- Finally, the top-level merge step interleaves `[3, 5]` and `[1, 4, 8]` into `[1, 3, 4, 5, 8]`.
- As proved by our complexity counter, this recursive halving and linear combination took just `n log2(n)` work rather than `n^2`.
