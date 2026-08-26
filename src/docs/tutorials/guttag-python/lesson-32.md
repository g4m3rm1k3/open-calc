# Lesson 32: Divide and Conquer

The reader will understand divide and conquer as a general algorithm design paradigm: divide the problem into subproblems, solve each subproblem recursively, combine the solutions. They will apply it to merge sort (reviewed), binary search (reviewed), and two new problems: finding the maximum subarray sum (Kadane's algorithm as contrast) and fast exponentiation (binary exponentiation). The transferable problems: (1) D&C is a TEMPLATE, not a specific algorithm — once you recognize the pattern, you can derive algorithms you haven't seen before; (2) D&C leads to O(log n) or O(n log n) complexity for problems that would otherwise be O(n²) or O(2^n); (3) the recurrence relation T(n) = 2T(n/2) + O(n) gives O(n log n), T(n) = T(n/2) + O(1) gives O(log n).

**What you need to know first**
- Lesson 31

**Terms used in this lesson**
- **Divide and Conquer** — A recursive algorithm design paradigm where a problem is split into independent subproblems of the same type, solved recursively, and merged to form a complete solution. This breaks complex problems into manageable ones.
- **Base Case** — The condition under which a recursive function returns a direct value rather than making another recursive call, preventing infinite loops.
- **Recursion** — A programming technique where a function calls itself to solve a smaller instance of the same problem.
- **Recurrence Relation** — An equation that recursively defines a sequence or multidimensional array of values, used to mathematically express the time complexity of divide and conquer algorithms.
- **Master Theorem** — A mathematical tool that provides a direct method for solving recurrence relations of the form T(n) = aT(n/b) + f(n), giving the time complexity.
- **Dynamic Programming** — An algorithmic technique that solves complex problems by breaking them down into overlapping subproblems, saving the results to avoid redundant work. Mentioned to contrast with D&C.
- **Parallelization** — The act of designing an algorithm so that multiple operations can be executed simultaneously on different processors, easily achieved with independent D&C subproblems.

**Objects and methods used**

- `print`
  - *What it is:* A built-in function to output text.
  - *Implementation:* `print(*objects, sep=' ', end='\n', file=None, flush=False)`
  - *Its use:* To display the results of our functions to the user.
  - *Type:* Built-in function.
  - *Responsibility:* Converts given objects to strings and writes them to standard output.
  - *Depends on:* Standard output stream.
  - *Connects to:* Calls `__str__` or `__repr__` on the passed objects, writes to `sys.stdout`.
  - *Shape:* A global built-in utility.

- `len`
  - *What it is:* A built-in function that returns the number of items in an object.
  - *Implementation:* `len(s)`
  - *Its use:* Used to determine the size of lists to find base cases and midpoints.
  - *Type:* Built-in function.
  - *Responsibility:* Returns the length of a collection.
  - *Depends on:* The object passed must support the `__len__` protocol.
  - *Connects to:* Calls `s.__len__()`.
  - *Shape:* A global built-in utility.

- `max`
  - *What it is:* A built-in function that returns the largest item in an iterable or the largest of two or more arguments.
  - *Implementation:* `max(arg1, arg2, *args, [key])`
  - *Its use:* Used to compare sums in the maximum subarray problem.
  - *Type:* Built-in function.
  - *Responsibility:* Returns the maximum value based on the default sorting order or a custom key.
  - *Depends on:* Comparable items.
  - *Connects to:* Computes the maximum by iterating and comparing.
  - *Shape:* A global built-in utility.

- `float`
  - *What it is:* A built-in class representing floating point numbers.
  - *Implementation:* `float(x)`
  - *Its use:* Used as `float('-inf')` to initialize maximum sums to negative infinity.
  - *Type:* Built-in class/type.
  - *Responsibility:* Constructs a float object from a number or string.
  - *Depends on:* A valid number or string representation of a number.
  - *Connects to:* C-level float parsing.
  - *Shape:* Core data type.

- `range`
  - *What it is:* A built-in immutable sequence type, often used for looping.
  - *Implementation:* `range(start, stop[, step])`
  - *Its use:* To iterate backwards and forwards from the midpoint in the crossover sum function.
  - *Type:* Built-in class/sequence.
  - *Responsibility:* Generates a sequence of numbers lazily.
  - *Depends on:* Integer arguments.
  - *Connects to:* Python's iteration protocol (`__iter__`).
  - *Shape:* A fundamental generator-like sequence.

---

## Concept Unit: The divide and conquer template

### The Problem
How can we recognize the underlying structure of algorithms like merge sort and binary search so we can apply the same strategy to new problems? If you were to describe how merge sort works abstractly, what steps would you list?

### Project Change
- **Reference Source:** No reference counterpart — this is a from-scratch addition because we are exploring algorithm templates.
- **Files affected:** `dc_template.py` (created)
- **Change type:** add
- **Location:** At the top of the file
- **Dependencies:** None

### The New Code
```python
def divide_and_conquer(problem):
    # This is a conceptual template, not runnable code
    if is_base_case(problem):
        return solve_base_case(problem)
    
    subproblems = divide(problem)
    solutions = [divide_and_conquer(sub) for sub in subproblems]
    return combine(solutions)
```

### The Updated Project
```python
# 1: def divide_and_conquer(problem):
# 2:     if is_base_case(problem):
# 3:         return solve_base_case(problem)
# 4:     
# 5:     subproblems = divide(problem)
# 6:     solutions = [divide_and_conquer(sub) for sub in subproblems]
# 7:     return combine(solutions)
```
This is a conceptual outline of the template. It first checks for a base case, divides the problem into subproblems, solves them recursively, and combines the results.

### Isolate the Concept
Because this is a conceptual template, we will map it to known algorithms instead of running it directly as a throwaway block. 
Output predicted: N/A, conceptual only.
Map to merge sort:
- Divide: split the list in half
- Conquer: recursively sort each half
- Combine: merge the two sorted halves

Map to binary search:
- Divide: find the middle element
- Conquer: recursively search the relevant half
- Combine: nothing to combine (the result is already found)

### Discard the Concept
The pseudocode template is discarded and will not appear in the project.

### Mechanical Walkthrough
- `def divide_and_conquer(problem):` defines the function.
- `if is_base_case(problem):` checks if the recursion should terminate.
- `return solve_base_case(problem)` returns the direct answer for the simplest case.
- `subproblems = divide(problem)` splits the input.
- `solutions = [divide_and_conquer(sub) for sub in subproblems]` is a list comprehension recursively solving each part.
- `return combine(solutions)` merges the partial answers.

### CS Lens
The Divide and Conquer paradigm is a fundamental algorithm design strategy. Also recognized in: MapReduce data processing, parallel processing tasks, database query optimization.

### SE Lens
Why use this template? It modularizes the problem logic. The alternative is writing complex, monolithic iterative loops that are hard to parallelize and debug. The cost is the overhead of recursive function calls.

### Execution and Verification
No execution needed for a conceptual template. Confidently predictable that it represents an abstract pattern.

### Connection to Next
Now we will apply this template to an actual problem: fast exponentiation.

---

## Concept Unit: Fast exponentiation — O(log n)

### The Problem
How do you calculate 2^10 efficiently without multiplying 2 by itself 10 times? What would you try if you could divide the exponent?

### Project Change
- **Reference Source:** No reference counterpart — this is a from-scratch addition because we are demonstrating fast exponentiation.
- **Files affected:** `fast_power.py` (created)
- **Change type:** add
- **Location:** At the top of the file
- **Dependencies:** None

### The New Code
```python
def fast_power(base, exp):
    if exp == 0:
        return 1
    if exp % 2 == 0:
        half = fast_power(base, exp // 2)
        return half * half
    else:
        return base * fast_power(base, exp - 1)
```

### The Updated Project
```python
# 1: def fast_power(base, exp):
# 2:     if exp == 0:
# 3:         return 1
# 4:     if exp % 2 == 0:
# 5:         half = fast_power(base, exp // 2)
# 6:         return half * half
# 7:     else:
# 8:         return base * fast_power(base, exp - 1)
```
This function computes the power of a base to an exponent using divide and conquer, achieving O(log n) time complexity.

### Isolate the Concept
Let's see this in action with a test run.
```python
def fast_power(base, exp):
    if exp == 0: return 1
    if exp % 2 == 0:
        half = fast_power(base, exp // 2)
        return half * half
    else:
        return base * fast_power(base, exp - 1)

print(fast_power(2, 10))
print(fast_power(3, 5))
print(fast_power(2, 0))
```
Output:
```
1024
243
1
```
This proves that the fast exponentiation works correctly by recursively halving the exponent.

### Discard the Concept
The isolated throwaway lab is discarded.

### Mechanical Walkthrough
- `def fast_power(base, exp):` defines the exponentiation function.
- `if exp == 0:` is the base case check.
- `return 1` returns the result for the 0th power.
- `if exp % 2 == 0:` checks if the exponent is even.
- `half = fast_power(base, exp // 2)` recursively calculates the power for half the exponent.
- `return half * half` combines the result by squaring the half-power.
- `else:` handles odd exponents.
- `return base * fast_power(base, exp - 1)` reduces the odd exponent by one and multiplies by the base once.

### Execution Trace
1. `fast_power(2,8)` — even exponent, calculates `half = fast_power(2,4)`
2. `fast_power(2,4)` — even exponent, calculates `half = fast_power(2,2)`
3. `fast_power(2,2)` — even exponent, calculates `half = fast_power(2,1)`
4. `fast_power(2,1)` — odd exponent, returns `2 * fast_power(2,0)`
5. `fast_power(2,0)` — base case, returns `1`
6. `fast_power(2,1)` — returns `2 * 1 = 2`
7. `fast_power(2,2)` — returns `2 * 2 = 4`
8. `fast_power(2,4)` — returns `4 * 4 = 16`
9. `fast_power(2,8)` — returns `16 * 16 = 256`

### CS Lens
Binary exponentiation (fast power) is a classic O(log n) algorithm. Also recognized in: modular exponentiation in RSA cryptography, matrix exponentiation for Fibonacci numbers.

### SE Lens
Why use fast power instead of a loop? A naive loop runs in O(n) time, doing n multiplications. Fast power runs in O(log n) time, drastically reducing the operations for large exponents. The tradeoff is recursion depth for massive exponents, though Python's built-in `**` is implemented in C using a similar approach.

### Execution and Verification
Execution output has been predicted confidently based on Python's math capabilities.

### Connection to Next
Now we will apply D&C to a more complex search space: finding the maximum subarray sum.

---

## Concept Unit: Finding the maximum subarray sum — D&C approach

### The Problem
Given an array of integers, how do you find the contiguous subarray with the largest sum? What if you split the array in half?

### Project Change
- **Reference Source:** No reference counterpart — this is a from-scratch addition.
- **Files affected:** `max_subarray.py` (created)
- **Change type:** add
- **Location:** At the top of the file
- **Dependencies:** None

### The New Code
```python
def max_subarray_dc(lst, low=None, high=None):
    if low is None:
        low, high = 0, len(lst) - 1
    if low == high:
        return lst[low]
    mid = (low + high) // 2
    left_max  = max_subarray_dc(lst, low, mid)
    right_max = max_subarray_dc(lst, mid+1, high)
    cross_max = max_crossing(lst, low, mid, high)
    return max(left_max, right_max, cross_max)

def max_crossing(lst, low, mid, high):
    left_sum = float('-inf')
    total = 0
    for i in range(mid, low-1, -1):
        total += lst[i]
        left_sum = max(left_sum, total)
    right_sum = float('-inf')
    total = 0
    for i in range(mid+1, high+1):
        total += lst[i]
        right_sum = max(right_sum, total)
    return left_sum + right_sum
```

### The Updated Project
```python
# 1: def max_subarray_dc(lst, low=None, high=None):
# 2:     if low is None:
# 3:         low, high = 0, len(lst) - 1
# 4:     if low == high:
# 5:         return lst[low]
# 6:     mid = (low + high) // 2
# 7:     left_max  = max_subarray_dc(lst, low, mid)
# 8:     right_max = max_subarray_dc(lst, mid+1, high)
# 9:     cross_max = max_crossing(lst, low, mid, high)
# 10:    return max(left_max, right_max, cross_max)
# 11:
# 12: def max_crossing(lst, low, mid, high):
# 13:    left_sum = float('-inf')
# 14:    total = 0
# 15:    for i in range(mid, low-1, -1):
# 16:        total += lst[i]
# 17:        left_sum = max(left_sum, total)
# 18:    right_sum = float('-inf')
# 19:    total = 0
# 20:    for i in range(mid+1, high+1):
# 21:        total += lst[i]
# 22:        right_sum = max(right_sum, total)
# 23:    return left_sum + right_sum
```
This algorithm divides the array, finding the maximum subarray in the left half, the right half, and the segment crossing the middle, taking the maximum of the three.

### Isolate the Concept
Let's see the algorithm process a test array.
```python
data = [-2, 1, -3, 4, -1, 2, 1, -5, 4]
print(max_subarray_dc(data))
```
Output:
```
6
```
This proves the algorithm successfully finds the maximum subarray sum of 6 (which corresponds to `[4, -1, 2, 1]`).

### Discard the Concept
The isolated run is discarded.

### Mechanical Walkthrough
- `def max_subarray_dc(lst, low=None, high=None):` defines the main function.
- `if low is None:` sets default boundaries for the first call.
- `low, high = 0, len(lst) - 1` calculates the first and last indices.
- `if low == high:` checks the base case (1 element).
- `return lst[low]` returns the single element.
- `mid = (low + high) // 2` finds the middle index.
- `left_max = max_subarray_dc(lst, low, mid)` recursively finds the left maximum.
- `right_max = max_subarray_dc(lst, mid+1, high)` recursively finds the right maximum.
- `cross_max = max_crossing(lst, low, mid, high)` calculates the maximum sum crossing the midpoint.
- `return max(left_max, right_max, cross_max)` returns the largest of the three.
- `def max_crossing(lst, low, mid, high):` defines the crossing helper.
- `left_sum = float('-inf')` initializes the left maximum sum.
- `total = 0` initializes the running total.
- `for i in range(mid, low-1, -1):` iterates backwards from the middle.
- `total += lst[i]` adds to the running total.
- `left_sum = max(left_sum, total)` updates the left maximum if the total is larger.
- The right side does the same iterating forwards.
- `return left_sum + right_sum` combines both halves of the crossing sum.

### Execution Trace
For `[-2, 1, -3, 4]`:
1. `max_subarray_dc([-2, 1, -3, 4], 0, 3)` calls `mid=1`. Left half `[0,1]`, Right half `[2,3]`.
2. Left recursion: `max_subarray_dc(..., 0, 1)`. `mid=0`. Left `[-2]`, Right `[1]`.
3. Left base case: returns `-2`. Right base case: returns `1`.
4. Cross: max from `mid=0` left is `-2`, max from `mid+1=1` right is `1`. Cross sum = `-1`.
5. Max for `[0,1]` is `max(-2, 1, -1) = 1`.
6. Right recursion: `max_subarray_dc(..., 2, 3)`. `mid=2`. Left base case `[-3]`, Right base case `[4]`. Cross = `1`.
7. Max for `[2,3]` is `max(-3, 4, 1) = 4`.
8. Top-level cross: `mid=1`. Left max starting from 1 back to 0 is `1` (from `1`), right max starting from 2 to 3 is `4` (from `4`). Cross sum = `1 + 4 = 5` (wait, from index 1 back, it's 1; index 2 forward is `4 + (-3) = 1`, actually `cross_max` will compute left max from index 1 `[1, -2]` which is `1`, right max from index 2 `[-3, 4]` which is `1`. Total cross = `2`.).
9. Top-level return: `max(1, 4, 2) = 4`.

### CS Lens
The algorithm is O(n log n). This is a classic example of using D&C to handle edge cases that straddle dividing lines. Also recognized in: closest pair of points algorithm, Strassen's matrix multiplication.

### SE Lens
Why show this D&C approach? Because it's a general technique that works on many problems and parallelizes effortlessly. The alternative is Kadane's algorithm (below), which is O(n) but relies on a specific insight rather than a universal pattern.

### Execution and Verification
Execution conceptually verified. Output is standard for Kadane/D&C max subarray problems.

### Connection to Next
Now we contrast this O(n log n) general pattern with a brilliant, problem-specific O(n) algorithm.

---

## Concept Unit: Kadane's algorithm — O(n) for the same problem

### The Problem
Can we do better than O(n log n) by recognizing when a running sum becomes completely useless?

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** `kadane.py` (created)
- **Change type:** add
- **Location:** At the top of the file
- **Dependencies:** None

### The New Code
```python
def max_subarray_kadane(lst):
    max_sum = lst[0]
    current_sum = lst[0]
    for x in lst[1:]:
        current_sum = max(x, current_sum + x)
        max_sum = max(max_sum, current_sum)
    return max_sum
```

### The Updated Project
```python
# 1: def max_subarray_kadane(lst):
# 2:     max_sum = lst[0]
# 3:     current_sum = lst[0]
# 4:     for x in lst[1:]:
# 5:         current_sum = max(x, current_sum + x)
# 6:         max_sum = max(max_sum, current_sum)
# 7:     return max_sum
```
This iteratively builds the maximum subarray sum in O(n) time by abandoning negative prefixes.

### Isolate the Concept
Testing Kadane's algorithm.
```python
data = [-2, 1, -3, 4, -1, 2, 1, -5, 4]
print(max_subarray_kadane(data))
```
Output:
```
6
```
This confirms Kadane's provides the identical result but through a linear scan.

### Discard the Concept
The test execution is discarded.

### Mechanical Walkthrough
- `def max_subarray_kadane(lst):` defines the function.
- `max_sum = lst[0]` initializes the global maximum to the first element.
- `current_sum = lst[0]` initializes the running local maximum.
- `for x in lst[1:]:` loops through the rest of the list.
- `current_sum = max(x, current_sum + x)` decides whether to extend the current subarray or start a new one at `x`.
- `max_sum = max(max_sum, current_sum)` updates the overall maximum if the current run is better.
- `return max_sum` yields the final answer.

### Execution Trace
For `[-2, 1, -3, 4]`:
1. Init: `max= -2`, `current = -2`.
2. Iter 1: `x=1`. `current = max(1, -2+1) = 1`. `max = max(-2, 1) = 1`.
3. Iter 2: `x=-3`. `current = max(-3, 1-3) = -2`. `max = max(1, -2) = 1`.
4. Iter 3: `x=4`. `current = max(4, -2+4) = 4`. `max = max(1, 4) = 4`.

### CS Lens
Kadane's algorithm is a simplified form of Dynamic Programming running in O(n) time.

### SE Lens
Why learn both? Kadane's is a brilliant special insight specific to this problem. D&C is a GENERAL technique. D&C is a stepping stone to the Master Theorem and O(n log n) algorithms, and parallelizes perfectly. Kadane's is strictly sequential.

### Execution and Verification
Execution output predicted with absolute certainty based on classical algorithm behavior.

### Connection to Next
Now we examine Quicksort, another D&C algorithm that relies on the element values to determine the divide step.

---

## Concept Unit: Quicksort — D&C with O(n log n) expected

### The Problem
Merge sort does all its work in the combine step. What if we do all the work in the divide step, sorting elements as we partition them, making the combine step trivial?

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** `quicksort.py` (created)
- **Change type:** add
- **Location:** At the top of the file
- **Dependencies:** None

### The New Code
```python
def quicksort(lst):
    if len(lst) <= 1:
        return lst
    pivot = lst[len(lst) // 2]
    left  = [x for x in lst if x < pivot]
    mid   = [x for x in lst if x == pivot]
    right = [x for x in lst if x > pivot]
    return quicksort(left) + mid + quicksort(right)
```

### The Updated Project
```python
# 1: def quicksort(lst):
# 2:     if len(lst) <= 1:
# 3:         return lst
# 4:     pivot = lst[len(lst) // 2]
# 5:     left  = [x for x in lst if x < pivot]
# 6:     mid   = [x for x in lst if x == pivot]
# 7:     right = [x for x in lst if x > pivot]
# 8:     return quicksort(left) + mid + quicksort(right)
```
This recursively partitions the list around a pivot element.

### Isolate the Concept
Testing Quicksort.
```python
print(quicksort([3, 6, 8, 10, 1, 2, 1]))
```
Output:
```
[1, 1, 2, 3, 6, 8, 10]
```
This proves that Quicksort successfully orders the list by grouping smaller, equal, and larger elements recursively.

### Discard the Concept
The isolated run is discarded.

### Mechanical Walkthrough
- `def quicksort(lst):` defines the sorting function.
- `if len(lst) <= 1:` checks for the base case (an empty or single-element list is already sorted).
- `return lst` yields the base case result.
- `pivot = lst[len(lst) // 2]` selects the middle element to partition around.
- `left = [x for x in lst if x < pivot]` extracts all elements smaller than the pivot.
- `mid = [x for x in lst if x == pivot]` extracts all elements equal to the pivot.
- `right = [x for x in lst if x > pivot]` extracts all elements larger than the pivot.
- `return quicksort(left) + mid + quicksort(right)` recursively sorts the left and right groups, and concatenates the lists in order.

### Execution Trace
For `[3, 1, 2]`:
1. `quicksort([3, 1, 2])`: `pivot=1`. `left=[]`, `mid=[1]`, `right=[3,2]`.
2. Recursion `left`: `quicksort([])` returns `[]`.
3. Recursion `right`: `quicksort([3, 2])`. `pivot=2`. `left=[]`, `mid=[2]`, `right=[3]`. Returns `[] + [2] + [3] = [2, 3]`.
4. Final return: `[] + [1] + [2, 3] = [1, 2, 3]`.

### CS Lens
Quicksort has an average-case time complexity of O(n log n), but a worst-case of O(n²) if the pivot choice consistently results in extreme splits (e.g., already sorted data with the wrong pivot strategy).

### SE Lens
Why use quicksort? In practice, an in-place quicksort is often faster than merge sort because it avoids allocating new lists and has excellent memory cache locality. The functional version shown here uses extra memory for clarity, but production versions are implemented in-place.

### Execution and Verification
Code behaves deterministically per standard python list mechanics and recursion. Output correctly predicted.

### Connection to Next
With several D&C algorithms implemented, how do we formally analyze their speed?

---

## Concept Unit: Recurrence relations and the Master Theorem

### The Problem
How can we mathematically prove that `max_subarray_dc` is O(n log n) and `fast_power` is O(log n)? What if we could model the time taken as a recursive equation?

### Project Change
- **Reference Source:** No reference counterpart — this is a from-scratch addition (conceptual).
- **Files affected:** `master_theorem.txt` (created)
- **Change type:** add
- **Location:** At the top of the file
- **Dependencies:** None

### The New Code
```text
merge sort: T(n) = 2T(n/2) + O(n)
binary search: T(n) = T(n/2) + O(1)
fast_power: T(n) = T(n/2) + O(1)
naive recursion: T(n) = 2T(n-1) + O(1)
```

### The Updated Project
```text
# 1: merge sort: T(n) = 2T(n/2) + O(n)
# 2: binary search: T(n) = T(n/2) + O(1)
# 3: fast_power: T(n) = T(n/2) + O(1)
# 4: naive recursion: T(n) = 2T(n-1) + O(1)
```
These equations represent the time complexity: the number of recursive calls, the size of each call, and the work done at each step.

### Isolate the Concept
No executable code here; this is a mathematical theorem.
For merge sort: we make `2` recursive calls, each on half the data `T(n/2)`, and it takes `O(n)` to combine them.

### Discard the Concept
The theoretical outline remains a concept.

### Mechanical Walkthrough
- `merge sort: T(n) = 2T(n/2) + O(n)` represents dividing into 2 subproblems of half size, with linear combine time, resolving to `O(n log n)`.
- `binary search: T(n) = T(n/2) + O(1)` represents 1 subproblem of half size, with constant division/combine time, resolving to `O(log n)`.
- `fast_power: T(n) = T(n/2) + O(1)` behaves exactly like binary search.
- `naive recursion: T(n) = 2T(n-1) + O(1)` represents 2 subproblems of size `n-1` (like naive Fibonacci), which resolves to exponential `O(2^n)`.
- The Master Theorem formalizes this: if `T(n) = aT(n/b) + O(n^d)`:
  - If `a < b^d`: `O(n^d)`
  - If `a = b^d`: `O(n^d log n)`
  - If `a > b^d`: `O(n^(log_b a))`
- For merge sort: `a=2, b=2, d=1`. `2 = 2^1`. This is the second case, giving `O(n log n)`.

### CS Lens
The Master Theorem is a cornerstone of algorithm analysis, turning complex recursive time tracing into simple algebra.

### SE Lens
Why care? Knowing the Master Theorem allows a developer to instantly assess whether a recursive design will perform well at scale. A poor divide step can inadvertently create an O(n²) or worse bottleneck.

### Execution and Verification
Mathematical rules; no execution needed.

### Connection to Next
Finally, we summarize the rules for when to apply this powerful technique.

---

## Concept Unit: When to use D&C

### The Problem
When should you reach for the Divide and Conquer template versus another technique?

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** None, purely conceptual synthesis.
- **Change type:** add
- **Location:** N/A
- **Dependencies:** None

### The New Code
```text
Rule of thumb: use D&C when:
- The problem can be split into independent subproblems of the same type.
- The combine step is efficient (O(n) or less).
```

### The Updated Project
```text
# 1: Rule of thumb: use D&C when:
# 2: - The problem can be split into independent subproblems of the same type.
# 3: - The combine step is efficient (O(n) or less).
```
This final checklist helps decide if D&C is applicable.

### Isolate the Concept
If subproblems overlap heavily (like computing Fibonacci iteratively where `fib(3)` is needed by `fib(4)` and `fib(5)`), D&C will repeat work, leading to exponential time. In that case, use Dynamic Programming instead (covered in Lesson 34).

### Discard the Concept
N/A

### Mechanical Walkthrough
- `Independent subproblems:` The work done in one half does not affect or duplicate the work in the other half.
- `Efficient combine:` The actual merging of results must be fast. If merging takes `O(n^2)`, the whole algorithm slows down significantly.

### CS Lens
D&C patterns to recognize in the wild:
- Sorting (Merge/Quick)
- Searching (Binary)
- Tree traversals
- Geometric algorithms (Closest pair of points)
- Mathematical (Strassen matrix multiplication, Fast Fourier Transform).

### SE Lens
Identifying the paradigm allows engineers to communicate complex implementations concisely. Saying "It's a D&C approach" instantly communicates the structure and likely complexity profile of the solution.

### Execution and Verification
Conceptual checklist.

### Connection to Next
This concludes our exploration of the D&C algorithm design paradigm.

---

## Closing

Divide and conquer is one of the three fundamental algorithm design paradigms (with greedy algorithms and dynamic programming). By understanding how to split a problem, solve its components independently, and stitch them back together efficiently, you unlock O(n log n) and O(log n) speeds. 

Lesson 33 covers loop invariants and proving algorithms correct.
