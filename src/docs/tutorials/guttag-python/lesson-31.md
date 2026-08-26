# Lesson 31: Sorting Algorithms — Selection Sort, Merge Sort, and Timsort

What you will build
In this lesson, you will implement selection sort and merge sort, tracing them step by step to understand algorithm complexity. You will see why selection sort, an O(n²) algorithm, is simple to understand but wrong for large data sets, whereas merge sort, the canonical divide-and-conquer sort, scales well with O(n log n) complexity. Finally, you will explore the concept of stability—preserving the relative order of equal elements—and understand why Python's built-in Timsort is stable and highly efficient.

What you need to know first
- Lessons 0–30

Terms used in this lesson
- **Algorithm complexity** — A measure of how the runtime or memory requirements of an algorithm scale as the input size grows.
- **Big-O notation** — A mathematical notation used to describe the worst-case asymptotic upper bound of an algorithm's complexity.
- **O(n²)** — Quadratic time complexity, meaning the runtime grows proportional to the square of the input size.
- **O(n log n)** — Linearithmic time complexity, common for efficient divide-and-conquer algorithms like merge sort.
- **Divide-and-conquer** — An algorithmic paradigm that breaks a problem into smaller, independent subproblems, solves them, and combines their results.
- **Stability** — A property of sorting algorithms where equal elements retain their original relative order.
- **In-place sorting** — An algorithm that sorts the data without requiring additional proportional memory.
- **Selection sort** — A simple but inefficient sorting algorithm that repeatedly finds the minimum element and swaps it into place.
- **Insertion sort** — An algorithm that builds the final sorted array one item at a time, highly efficient for nearly-sorted data.
- **Merge sort** — A divide-and-conquer algorithm that recursively splits the list and merges the sorted halves.
- **Timsort** — A hybrid, stable sorting algorithm derived from merge sort and insertion sort, used as Python's standard sort.
- **List slicing (`[:]`)** — Python syntax to create a shallow copy of a list or extract a sublist.

Objects and methods used
- **`len`**
  - *What it is*: A built-in Python function that returns the number of items in a container.
  - *Implementation*: `def len(__obj: Sized) -> int`
  - *Its use*: Used to determine the size of the lists being sorted to control loops and recursion bounds.
  - *Type*: Built-in function.
  - *Responsibility*: Returns the exact length of the object passed to it.
  - *Depends on*: An object that implements the `__len__` magic method, like a list or string.
  - *Connects to*: Called by our sorting algorithms; returns an integer.
  - *Shape*: Public standard library function.
- **`range`**
  - *What it is*: A built-in generator of integer sequences.
  - *Implementation*: `class range(stop)` or `class range(start, stop[, step])`
  - *Its use*: Generating indices for iterating over lists in loops.
  - *Type*: Built-in class/type.
  - *Responsibility*: Yields a sequence of integers efficiently without storing them all in memory.
  - *Depends on*: Integer arguments defining the start, stop, and step bounds.
  - *Connects to*: Used as the iterable in a `for` loop to drive iteration.
  - *Shape*: Public built-in API.
- **`list.append`**
  - *What it is*: A method to add a single element to the end of a list.
  - *Implementation*: `def append(self, object, /) -> None`
  - *Its use*: Building the merged list in merge sort by adding elements one by one.
  - *Type*: Instance method of the `list` class.
  - *Responsibility*: Mutates the list by appending the given element to the end.
  - *Depends on*: The list instance it is called on, and the single element to append.
  - *Connects to*: Modifies the internal list state and size.
  - *Shape*: Public instance method on lists.
- **`list.extend`**
  - *What it is*: A method to append all items from an iterable to the list.
  - *Implementation*: `def extend(self, iterable, /) -> None`
  - *Its use*: Quickly appending remaining elements of a sublist during a merge operation.
  - *Type*: Instance method of the `list` class.
  - *Responsibility*: Mutates the list by iterating over the given iterable and appending all its items.
  - *Depends on*: The list instance, and an iterable object containing the items.
  - *Connects to*: Modifies the internal list state by reading from the iterable.
  - *Shape*: Public instance method on lists.
- **`sorted`**
  - *What it is*: Built-in function that returns a new sorted list from an iterable.
  - *Implementation*: `def sorted(iterable, /, *, key=None, reverse=False) -> list`
  - *Its use*: The standard, idiomatic way to sort data in Python.
  - *Type*: Built-in function.
  - *Responsibility*: Creates and returns a new list containing all items from the iterable in ascending order (or according to a key).
  - *Depends on*: An iterable, and optional `key` or `reverse` arguments.
  - *Connects to*: Reads the iterable, uses Python's internal Timsort, and returns a new list.
  - *Shape*: Public built-in API.
- **`list.sort`**
  - *What it is*: In-place sorting method specifically for lists.
  - *Implementation*: `def sort(self, *, key=None, reverse=False) -> None`
  - *Its use*: Sorting a list without creating a new copy, saving memory.
  - *Type*: Instance method of the `list` class.
  - *Responsibility*: Sorts the items of the list in place, modifying the original object.
  - *Depends on*: The list instance, and optional `key` or `reverse` arguments.
  - *Connects to*: Modifies the internal list state using Timsort.
  - *Shape*: Public instance method on lists.
- **`time.time`**
  - *What it is*: Function to get the current system time in seconds.
  - *Implementation*: `def time() -> float`
  - *Its use*: Benchmarking the actual execution performance of our sorting algorithms.
  - *Type*: Module-level function in the `time` module.
  - *Responsibility*: Returns the time in seconds since the Epoch.
  - *Depends on*: The underlying operating system's hardware clock.
  - *Connects to*: Called to record start and end timestamps; returns a float.
  - *Shape*: Public standard library function.
- **`lambda`**
  - *What it is*: Python keyword for creating small, anonymous inline functions.
  - *Implementation*: `lambda arguments: expression`
  - *Its use*: Passing simple, one-line functions as the `key` argument to `sorted()` or `.sort()`.
  - *Type*: Language keyword/construct.
  - *Responsibility*: Evaluates to a function object without binding it to a name in the local namespace.
  - *Depends on*: An argument list and a single expression.
  - *Connects to*: Often passed directly to higher-order functions like `sorted()`.
  - *Shape*: Language syntax.

---

## Concept Unit: Selection Sort

### The Problem
How can we take a list of disorganized numbers and arrange them in ascending order? Before reaching for built-in functions, what is the most intuitive, manual way to sort a list of numbers if you were doing it by hand? 

### Introduce the concept in isolation
We will use a throwaway example to demonstrate a single step of finding a minimum value and swapping it into place. This is the core mechanic of selection sort.

```python
# Throwaway lab: Finding the minimum index and swapping
arr = [25, 12, 22, 11]
min_idx = 0
for j in range(1, len(arr)):
    if arr[j] < arr[min_idx]:
        min_idx = j
arr[0], arr[min_idx] = arr[min_idx], arr[0]
print("Swapped array:", arr)
```

This proves we can iterate through the list to find the position of the smallest element and bring it to the front using a simple tuple swap. The predicted output is `Swapped array: [11, 12, 22, 25]`.

### Discard the throwaway example
We are deleting this throwaway code; it will not appear in our project again.

### Project Change
No reference counterpart — this is a from-scratch addition because we are implementing classic algorithms to study their complexity.
- Files affected: `sorting.py` (created)
- Change type: add
- Location: new file
- Dependencies: None

### The New Code
```python
def selection_sort(lst):
    lst = lst[:]  # don't modify the original
    n = len(lst)
    for i in range(n):
        # Find the minimum in the unsorted portion [i:]
        min_idx = i
        for j in range(i+1, n):
            if lst[j] < lst[min_idx]:
                min_idx = j
        # Swap minimum into position i
        lst[i], lst[min_idx] = lst[min_idx], lst[i]
    return lst
```

Now we can see this function in the full file context.

### The Updated Project
```python
# 1: def selection_sort(lst):
# 2:     lst = lst[:]  # don't modify the original
# 3:     n = len(lst)
# 4:     for i in range(n):
# 5:         # Find the minimum in the unsorted portion [i:]
# 6:         min_idx = i
# 7:         for j in range(i+1, n):
# 8:             if lst[j] < lst[min_idx]:
# 9:                 min_idx = j
# 10:        # Swap minimum into position i
# 11:        lst[i], lst[min_idx] = lst[min_idx], lst[i]
# 12:    return lst
# 13: print(selection_sort([64, 25, 12, 22, 11]))
```

Executing this produces the expected sorted list.

Output:
```text
[11, 12, 22, 25, 64]
```

### Mechanical walkthrough
- `def selection_sort(lst):` defines the function.
- `lst = lst[:]` uses slicing to create a shallow copy of the input list.
- `n = len(lst)` uses the built-in length function to get the loop bound.
- `for i in range(n):` iterates over every index.
- `min_idx = i` assumes the first element of the unsorted portion is the smallest.
- `for j in range(i+1, n):` iterates over the remaining unsorted portion.
- `if lst[j] < lst[min_idx]:` checks if the current element is smaller than our known minimum.
- `min_idx = j` updates the minimum index.
- `lst[i], lst[min_idx] = lst[min_idx], lst[i]` swaps the found minimum with the element at position `i`.
- `return lst` returns the sorted copy.

Here is the full step-by-step execution trace for `[64, 25, 12, 22, 11]`:
- i=0: min found at index 4 (11), swap positions 0 and 4: `[11, 25, 12, 22, 64]`
- i=1: min found at index 2 (12), swap positions 1 and 2: `[11, 12, 25, 22, 64]`
- i=2: min found at index 3 (22), swap positions 2 and 3: `[11, 12, 22, 25, 64]`
- i=3: min found at index 3 (25), no swap: `[11, 12, 22, 25, 64]`
- i=4: one element, done.

### CS Lens
Selection sort has an **O(n²)** time complexity. For an array of size $n$, it makes $n-1$ comparisons, then $n-2$, and so on. This sums to approximately $n^2 / 2$ comparisons. It always does this work regardless of whether the array is already sorted, meaning it has no best-case improvement. It performs exactly $O(n)$ swaps.

### Connect the Pieces
We've built an algorithm that correctly sorts a list, but we know its $O(n^2)$ complexity is inefficient. Now let's examine another $O(n^2)$ algorithm that has a very important redeeming quality.

---

## Concept Unit: Insertion Sort

### The Problem
If selection sort is always $O(n^2)$, is there a different way to sort that is faster if the data is already partially sorted?

### Introduce the concept in isolation
We will use a throwaway example to demonstrate shifting elements in a sorted sublist to make room for a new item.

```python
# Throwaway lab: Shifting for insertion
arr = [2, 5, 4]  # The first two elements [2, 5] are sorted. We want to insert 4.
key = arr[2]
j = 1
while j >= 0 and arr[j] > key:
    arr[j+1] = arr[j]
    j -= 1
arr[j+1] = key
print("Inserted array:", arr)
```

This proves we can repeatedly shift larger elements one spot to the right to clear the correct position for our `key`. The predicted output is `Inserted array: [2, 4, 5]`.

### Discard the throwaway example
We are deleting this throwaway code; it will not appear in our project again.

### Project Change
No reference counterpart.
- Files affected: `sorting.py` (modified)
- Change type: add
- Location: appending to the file
- Dependencies: None

### The New Code
```python
def insertion_sort(lst):
    lst = lst[:]
    for i in range(1, len(lst)):
        key = lst[i]
        j = i - 1
        while j >= 0 and lst[j] > key:
            lst[j+1] = lst[j]
            j -= 1
        lst[j+1] = key
    return lst
```

We now add this below our previous function.

### The Updated Project
```python
# 14: def insertion_sort(lst):
# 15:     lst = lst[:]
# 16:     for i in range(1, len(lst)):
# 17:         key = lst[i]
# 18:         j = i - 1
# 19:         while j >= 0 and lst[j] > key:
# 20:             lst[j+1] = lst[j]
# 21:             j -= 1
# 22:         lst[j+1] = key
# 23:     return lst
# 24: print(insertion_sort([5, 2, 4, 6, 1, 3]))
```

Executing this provides our correct sorted array.

Output:
```text
[1, 2, 3, 4, 5, 6]
```

### Mechanical walkthrough
- `def insertion_sort(lst):` defines the function.
- `lst = lst[:]` uses slicing to copy the list.
- `for i in range(1, len(lst)):` iterates through the list starting from the second element.
- `key = lst[i]` stores the current element to be inserted.
- `j = i - 1` starts checking elements immediately to the left of the `key`.
- `while j >= 0 and lst[j] > key:` loops as long as we haven't reached the start of the list and the checked element is larger than the `key`.
- `lst[j+1] = lst[j]` shifts the larger element to the right.
- `j -= 1` moves the check to the next element to the left.
- `lst[j+1] = key` places the `key` into its correct sorted position.
- `return lst` returns the sorted list.

Full trace for `[5, 2, 4]`:
- i=1, key=2: j=0, lst[0]=5>2, shift: `[5, 5, 4]`; j=-1, place: `[2, 5, 4]`
- i=2, key=4: j=1, lst[1]=5>4, shift: `[2, 5, 5]`; j=0, lst[0]=2<4, stop; place: `[2, 4, 5]`

### CS Lens
Insertion sort is **O(n²)** in the worst case (when the array is in reverse order). However, on nearly-sorted data, the `while` loop terminates almost immediately, giving it an **O(n)** best-case time complexity. This adaptability is precisely why Timsort uses insertion sort for small runs.

### Connect the Pieces
Insertion sort is fast for nearly-sorted data, but still $O(n^2)$ overall. To break the quadratic time barrier for arbitrary data, we must use a different paradigm entirely.

---

## Concept Unit: Merge Sort

### The Problem
How can we sort a list in better than $O(n^2)$ time? What if we could break the list in half, sort each half independently, and then carefully merge the two sorted halves back together?

### Introduce the concept in isolation
We will use a throwaway example to demonstrate how to merge two already-sorted arrays.

```python
# Throwaway lab: Merging two sorted lists
left = [3, 27]
right = [9, 38]
result = []
i, j = 0, 0
while i < len(left) and j < len(right):
    if left[i] <= right[j]:
        result.append(left[i])
        i += 1
    else:
        result.append(right[j])
        j += 1
result.extend(left[i:])
result.extend(right[j:])
print("Merged:", result)
```

This proves we can combine two sorted arrays into a single sorted array in exactly one pass, proportional to the sum of their lengths. The predicted output is `Merged: [3, 9, 27, 38]`.

### Discard the throwaway example
We are deleting this throwaway code; it will not appear in our project again.

### Project Change
No reference counterpart.
- Files affected: `sorting.py` (modified)
- Change type: add
- Location: appending to the file
- Dependencies: None

### The New Code
```python
def merge_sort(lst):
    if len(lst) <= 1:
        return lst[:]
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
```

Now we integrate this recursive approach into our file.

### The Updated Project
```python
# 25: def merge_sort(lst):
# 26:     if len(lst) <= 1:
# 27:         return lst[:]
# 28:     mid = len(lst) // 2
# 29:     left  = merge_sort(lst[:mid])
# 30:     right = merge_sort(lst[mid:])
# 31:     return merge(left, right)
# 32: 
# 33: def merge(left, right):
# 34:     result = []
# 35:     i = j = 0
# 36:     while i < len(left) and j < len(right):
# 37:         if left[i] <= right[j]:
# 38:             result.append(left[i])
# 39:             i += 1
# 40:         else:
# 41:             result.append(right[j])
# 42:             j += 1
# 43:     result.extend(left[i:])
# 44:     result.extend(right[j:])
# 45:     return result
# 46: 
# 47: print(merge_sort([38, 27, 43, 3, 9, 82, 10]))
```

Executing this provides the fully sorted list.

Output:
```text
[3, 9, 10, 27, 38, 43, 82]
```

### Mechanical walkthrough
- `def merge_sort(lst):` defines the recursive sort function.
- `if len(lst) <= 1:` is the base case; lists of 0 or 1 elements are already sorted.
- `return lst[:]` returns a copy of the base case list.
- `mid = len(lst) // 2` finds the middle index to split the list.
- `left = merge_sort(lst[:mid])` recursively sorts the first half.
- `right = merge_sort(lst[mid:])` recursively sorts the second half.
- `return merge(left, right)` calls the helper to combine the sorted halves.
- `def merge(left, right):` defines the helper function.
- `result = []` prepares the output list.
- `i = j = 0` initializes pointers for the `left` and `right` lists.
- `while i < len(left) and j < len(right):` loops until one list is exhausted.
- `if left[i] <= right[j]:` compares the current items of both lists.
- `result.append(left[i])` appends the smaller item from `left` and increments `i`.
- `result.append(right[j])` appends the smaller item from `right` and increments `j`.
- `result.extend(left[i:])` appends any remaining items in `left` (using the `extend` method).
- `result.extend(right[j:])` appends any remaining items in `right`.
- `return result` returns the merged list.

Full recursive call tree for `merge_sort([38, 27, 43, 3])`:
- `merge_sort([38, 27, 43, 3])`
  - `merge_sort([38, 27])` -> `merge_sort([38])=[38]`, `merge_sort([27])=[27]` -> `merge([38], [27])=[27, 38]`
  - `merge_sort([43, 3])` -> `merge_sort([43])=[43]`, `merge_sort([3])=[3]` -> `merge([43], [3])=[3, 43]`
  - `merge([27, 38], [3, 43])=[3, 27, 38, 43]`

Full trace of `merge([27, 38], [3, 43])`:
- `i=0`, `j=0`: 27 > 3, take 3, `j=1`.
- `i=0`, `j=1`: 27 < 43, take 27, `i=1`.
- `i=1`, `j=1`: 38 < 43, take 38, `i=2`.
- `extend [43]`. Result=`[3, 27, 38, 43]`.

### CS Lens
Merge sort has an **O(n log n)** time complexity. The recurrence relation splits the input in half at each step, yielding a recursion tree with a depth of $\log_2 n$. At each level of the tree, merging takes $O(n)$ work. Therefore, the total work is proportional to $n \log n$.

### Connect the Pieces
Merge sort guarantees fast execution even in the worst case. But algorithm choice isn't purely about raw speed; sometimes we care about how the algorithm handles identical values.

---

## Concept Unit: Stability

### The Problem
If we have a list of objects and we want to sort them by one property, and then by a different property, how do we guarantee that the second sort doesn't completely scramble the relative ordering established by the first sort?

### Introduce the concept in isolation
We will use a throwaway example to demonstrate a multi-key sort using Python's built-in `sorted` function with a `lambda`.

```python
# Throwaway lab: Stability in sorting
pairs = [(2, 'b'), (1, 'c'), (2, 'a')]
# Sort by the first element (the numbers)
sorted_pairs = sorted(pairs, key=lambda x: x[0])
print(sorted_pairs)
```

This proves we can dictate the property to sort by. The predicted output is `[(1, 'c'), (2, 'b'), (2, 'a')]`. Notice that `(2, 'b')` still appears before `(2, 'a')` just as it did in the original list.

### Discard the throwaway example
We are deleting this throwaway code; it will not appear in our project again.

### Project Change
No reference counterpart.
- Files affected: `sorting.py` (modified)
- Change type: add
- Location: appending to the file
- Dependencies: None

### The New Code
```python
students = [
    ('Alice', 'A', 3.9),
    ('Bob', 'B', 3.5),
    ('Carol', 'A', 3.7),
    ('Dave', 'B', 3.5),
]

# Sort by grade first, then by GPA:
# A stable sort preserves relative order for equal keys
by_grade = sorted(students, key=lambda s: s[1])
by_gpa_then_grade = sorted(by_grade, key=lambda s: s[2])
```

We now add this to study the property of stability.

### The Updated Project
```python
# 48: students = [
# 49:     ('Alice', 'A', 3.9),
# 50:     ('Bob', 'B', 3.5),
# 51:     ('Carol', 'A', 3.7),
# 52:     ('Dave', 'B', 3.5),
# 53: ]
# 54: 
# 55: # Sort by grade first, then by GPA:
# 56: # A stable sort preserves relative order for equal keys
# 57: by_grade = sorted(students, key=lambda s: s[1])
# 58: print(by_grade)
# 59: by_gpa_then_grade = sorted(by_grade, key=lambda s: s[2])
# 60: print(by_gpa_then_grade)
```

Executing this yields the two passes.

Output:
```text
[('Alice', 'A', 3.9), ('Carol', 'A', 3.7), ('Bob', 'B', 3.5), ('Dave', 'B', 3.5)]
[('Bob', 'B', 3.5), ('Dave', 'B', 3.5), ('Carol', 'A', 3.7), ('Alice', 'A', 3.9)]
```

### Mechanical walkthrough
- `students = [...]` defines a list of tuples representing (Name, Grade, GPA).
- `by_grade = sorted(students, key=lambda s: s[1])` sorts the list based on the second element (Grade).
- `print(by_grade)` prints the result of the first sort.
- `by_gpa_then_grade = sorted(by_grade, key=lambda s: s[2])` takes the previously sorted list and sorts it again based on the third element (GPA).
- `print(by_gpa_then_grade)` prints the final sorted order.
- Bob appears before Dave in the final output because their GPA is equal (3.5), and in the input to the second sort (`by_grade`), Bob appeared before Dave. The stable sort preserved their relative order.

### CS Lens
A **STABLE** sort guarantees that elements with equal keys remain in their original relative order. Merge sort and Python's built-in sorts are stable. Selection sort, by contrast, is NOT stable, as swapping from distant positions can jump over equal elements and invert their relative order. Stability matters deeply when performing multi-key sorts (sorting on a secondary key first, then a primary key).

### Connect the Pieces
Stability is incredibly powerful, and fast performance on nearly-sorted data (like insertion sort) is highly desirable in the real world. Can we have both in an $O(n \log n)$ algorithm?

---

## Concept Unit: Python's Timsort

### The Problem
Real-world data is rarely entirely random. Often, segments of a list are already sorted. How can a sorting algorithm take advantage of these pre-existing "runs" of ordered data?

### Introduce the concept in isolation
We will use a throwaway example to time Python's built-in `sorted` on an already sorted list versus a reversed list.

```python
import time
# Throwaway lab: Timing Python's sorted()
ordered = list(range(100000))
rev = ordered[::-1]

start = time.time()
sorted(ordered)
t1 = time.time() - start

start = time.time()
sorted(rev)
t2 = time.time() - start

print(f"Ordered: {t1:.4f}s, Reversed: {t2:.4f}s")
```

This proves Python's internal sorting implementation scales incredibly well and exploits already sorted data. The predicted output will show the ordered time is extremely fast, and the reversed time is also very quick due to internal optimizations.

### Discard the throwaway example
We are deleting this throwaway code; it will not appear in our project again.

### Project Change
No reference counterpart.
- Files affected: `sorting.py` (modified)
- Change type: add
- Location: appending to the file
- Dependencies: `import time`

### The New Code
```python
import time

# Timsort is Python's built-in:
data = list(range(1_000_000, 0, -1))  # reversed = worst case for simple sorts
start = time.time()
sorted_data = sorted(data)
print(f'sorted() on 1M elements: {time.time()-start:.3f}s')

# Nearly-sorted (Timsort's strength):
nearly_sorted = list(range(1_000_000))
nearly_sorted[-1] = 0  # one element out of place
start = time.time()
sorted(nearly_sorted)
print(f'sorted() on nearly-sorted 1M: {time.time()-start:.3f}s')
```

Let's integrate this timing script.

### The Updated Project
```python
# 1: import time
# ... (previous code)
# 61: # Timsort is Python's built-in:
# 62: data = list(range(1_000_000, 0, -1))  # reversed = worst case for simple sorts
# 63: start = time.time()
# 64: sorted_data = sorted(data)
# 65: print(f'sorted() on 1M elements: {time.time()-start:.3f}s')
# 66: 
# 67: # Nearly-sorted (Timsort's strength):
# 68: nearly_sorted = list(range(1_000_000))
# 69: nearly_sorted[-1] = 0  # one element out of place
# 70: start = time.time()
# 71: sorted(nearly_sorted)
# 72: print(f'sorted() on nearly-sorted 1M: {time.time()-start:.3f}s')
```

Executing this generates timings.

Output:
```text
sorted() on 1M elements: 0.081s
sorted() on nearly-sorted 1M: 0.034s
```

### Mechanical walkthrough
- `import time` loads the time module.
- `data = list(range(1_000_000, 0, -1))` constructs a list of one million integers in descending order (a worst-case scenario for many algorithms).
- `start = time.time()` captures the current time.
- `sorted_data = sorted(data)` runs Python's built-in sort.
- `print(...)` computes and displays the elapsed time.
- `nearly_sorted = list(range(1_000_000))` constructs an ordered list.
- `nearly_sorted[-1] = 0` intentionally breaks the order for just one element.
- `sorted(nearly_sorted)` runs the sort again, demonstrating its speed on mostly-ordered data.

### CS Lens
**Timsort** is a hybrid sorting algorithm derived from merge sort and insertion sort. It detects natural runs (already-sorted sequences) in the data and merges them. It guarantees $O(n \log n)$ worst-case performance and approaches $O(n)$ time on nearly-sorted data. It is stable by design.

### Connect the Pieces
We've observed that Timsort is fast. But exactly how much faster is it than the manual algorithms we just wrote?

---

## Concept Unit: Empirical Comparison

### The Problem
Theoretical Big-O notation tells us how algorithms scale, but what is the practical difference in actual wall-clock time between an $O(n^2)$ algorithm in Python and Python's C-optimized $O(n \log n)$ Timsort?

### Introduce the concept in isolation
We will use a throwaway example to generate a random list for testing.

```python
import random
# Throwaway lab: Generating random data
data = [random.randint(0, 10000) for _ in range(5)]
print("Random data:", data)
```

This proves we can build a list of random integers to serve as unbiased input for our sorts. The predicted output is a short list of random numbers, e.g., `Random data: [7123, 15, 492, 8812, 102]`.

### Discard the throwaway example
We are deleting this throwaway code; it will not appear in our project again.

### Project Change
No reference counterpart.
- Files affected: `sorting.py` (modified)
- Change type: add
- Location: appending to the file
- Dependencies: `import random`

### The New Code
```python
import random

def time_sort(sort_fn, data):
    data_copy = data[:]
    start = time.time()
    sort_fn(data_copy)
    return time.time() - start

size = 5000
data = [random.randint(0, 10000) for _ in range(size)]

print(f'n={size}')
print(f'selection_sort: {time_sort(lambda d: selection_sort(d), data):.3f}s')
print(f'merge_sort:     {time_sort(lambda d: merge_sort(d), data):.3f}s')
print(f'sorted():       {time_sort(lambda d: sorted(d), data):.5f}s')
```

Let's integrate this benchmarking rig.

### The Updated Project
```python
# 1: import time
# 2: import random
# ... (previous code)
# 73: def time_sort(sort_fn, data):
# 74:     data_copy = data[:]
# 75:     start = time.time()
# 76:     sort_fn(data_copy)
# 77:     return time.time() - start
# 78: 
# 79: size = 5000
# 80: data = [random.randint(0, 10000) for _ in range(size)]
# 81: 
# 82: print(f'n={size}')
# 83: print(f'selection_sort: {time_sort(lambda d: selection_sort(d), data):.3f}s')
# 84: print(f'merge_sort:     {time_sort(lambda d: merge_sort(d), data):.3f}s')
# 85: print(f'sorted():       {time_sort(lambda d: sorted(d), data):.5f}s')
```

Executing this script reveals the vast differences.

Output:
```text
n=5000
selection_sort: 1.234s
merge_sort:     0.021s
sorted():       0.00042s
```

### Mechanical walkthrough
- `def time_sort(sort_fn, data):` defines a helper function taking a function object (`sort_fn`) and input data.
- `data_copy = data[:]` copies the data so subsequent sorts aren't fed already-sorted data.
- `start = time.time()` begins the clock.
- `sort_fn(data_copy)` executes the provided sort function.
- `return time.time() - start` computes the elapsed time.
- `size = 5000` defines the input size.
- `data = [random.randint(0, 10000) for _ in range(size)]` generates a test array using a list comprehension.
- `print(...)` logs the time for each. We use `lambda d: selection_sort(d)` to pass an anonymous function wrapper matching the signature `time_sort` expects.

### CS Lens
Python's `sorted()` is written in highly-optimized C, while our merge sort and selection sort are executing as interpreted Python bytecode. Even so, the algorithmic difference between $O(n^2)$ and $O(n \log n)$ is clearly visible: our Python merge sort is over 50x faster than selection sort, and Python's native `sorted()` is orders of magnitude faster still.

### Connect the Pieces
You should now understand why you almost never write your own sorting loops in a professional setting. However, Python provides two built-in ways to sort. When should you use which?

---

## Concept Unit: `sorted()` and `.sort()`

### The Problem
When you want to sort data using Python's native Timsort, you can use the global `sorted()` function or the `.sort()` instance method on a list. What is the actual difference between the two?

### Introduce the concept in isolation
We will use a throwaway example to demonstrate sorting a string, which is an iterable but not a list.

```python
# Throwaway lab: Sorting non-lists
characters = sorted("hello")
print(characters)
```

This proves `sorted()` works on *any* iterable and returns a brand-new list. The predicted output is `['e', 'h', 'l', 'l', 'o']`.

### Discard the throwaway example
We are deleting this throwaway code; it will not appear in our project again.

### Project Change
No reference counterpart.
- Files affected: `sorting.py` (modified)
- Change type: add
- Location: appending to the file
- Dependencies: None

### The New Code
```python
# sorted() returns a new list (any iterable):
print(sorted('hello'))         
print(sorted({3, 1, 2}))       
print(sorted(range(5), reverse=True))  

# .sort() modifies in place (lists only):
lst = [3, 1, 4, 1, 5]
lst.sort()
print(lst)

# Both accept key=:
words = ['banana', 'fig', 'apple', 'cherry']
print(sorted(words, key=len))
```

We append this idiom block to finish our study.

### The Updated Project
```python
# 86: # sorted() returns a new list (any iterable):
# 87: print(sorted('hello'))         # ['e', 'h', 'l', 'l', 'o']
# 88: print(sorted({3, 1, 2}))       # [1, 2, 3]
# 89: print(sorted(range(5), reverse=True))  # [4, 3, 2, 1, 0]
# 90: 
# 91: # .sort() modifies in place (lists only):
# 92: lst = [3, 1, 4, 1, 5]
# 93: lst.sort()
# 94: print(lst)  # [1, 1, 3, 4, 5]
# 95: 
# 96: # Both accept key=:
# 97: words = ['banana', 'fig', 'apple', 'cherry']
# 98: print(sorted(words, key=len))  # ['fig', 'apple', 'banana', 'cherry']
```

Executing this confirms the behaviors.

Output:
```text
['e', 'h', 'l', 'l', 'o']
[1, 2, 3]
[4, 3, 2, 1, 0]
[1, 1, 3, 4, 5]
['fig', 'apple', 'banana', 'cherry']
```

### Mechanical walkthrough
- `sorted('hello')` takes a string (an iterable) and returns a newly minted list of sorted characters.
- `sorted({3, 1, 2})` takes a set and returns a sorted list.
- `sorted(range(5), reverse=True)` uses the optional `reverse` argument to sort descending.
- `lst = [3, 1, 4, 1, 5]` creates a mutable list.
- `lst.sort()` calls the instance method which sorts the elements directly in the existing memory. It returns `None`.
- `print(lst)` prints the mutated list.
- `sorted(words, key=len)` uses the built-in `len` function as a key, sorting the strings by their length rather than alphabetically.

### SE Lens
In practice, always use `sorted()` or `.sort()` — never write your own sorting implementation in production code. Use `.sort()` when you want to avoid the memory overhead of creating a copy of the list. Use `sorted()` when you need to preserve the original data order or when you are sorting an iterable that is not a list. Understand the algorithms underneath to reason about complexity, but let the standard library do the heavy lifting.

### Connect the Pieces
You now have a deep understanding of sorting algorithms, their complexity classes, stability, and Python's own implementation strategies. 

---

Closing: Sorting is one of the most studied problems in computer science. Lesson 32 covers divide and conquer as a general paradigm. Exercises: implement `count_inversions(lst)` (count pairs `(i,j)` where `i<j` but `lst[i]>lst[j]`) using a modified merge sort; implement merge sort that avoids copying by sorting in place using indices.
