# Lesson 33: Recursion and Induction — Proving Programs Correct

What you will build: The reader will understand mathematical induction as the formal basis for reasoning about recursive programs, learn loop invariants as the iterative equivalent, and prove the correctness of factorial, binary search, and merge sort. The transferable problems: (1) a recursive proof has EXACTLY the same structure as a recursive function: a base case and an inductive step; (2) a loop invariant is a property that is true BEFORE every iteration of a loop — proving it is established, maintained, and useful gives you the loop's correctness; (3) reasoning about correctness before debugging saves hours — a wrong algorithm cannot be debugged into correctness.

What you need to know first: Lessons 0–32 (full curriculum through divide and conquer).

Terms used in this lesson:
- **Mathematical induction** — a formal method of mathematical proof typically used to establish that a given statement is true for all natural numbers. It solves the problem of proving infinitely many cases by proving a starting point and a chain reaction.
- **Base case** — the first step of an inductive proof, which proves the statement for the initial value (e.g., n=0 or n=1). It exists to give the inductive chain reaction a solid starting point.
- **Inductive hypothesis** — the assumption made in the second step of an inductive proof, assuming the statement holds for an arbitrary case `k`. It provides the premise needed to prove the next case.
- **Inductive step** — the second step of an inductive proof, showing that if the statement holds for `k`, it must hold for `k+1`. It creates the chain reaction that extends the proof to all numbers.
- **Loop invariant** — a property or predicate that is guaranteed to be true before every single iteration of a loop. It exists to let us mathematically prove that a loop will compute the correct result when it finishes.
- **Precondition** — a condition that must be true before a function is called, forming the caller's part of a contract. It relieves the function from having to handle nonsensical inputs.
- **Postcondition** — a condition that the function guarantees will be true after it returns, assuming the precondition was met. It forms the implementer's part of a contract.
- **Design by contract** — a software engineering principle where functions have explicit preconditions and postconditions. It clarifies exactly who is responsible when a bug occurs.
- **Defensive programming** — the practice of writing code that checks for bad inputs and unexpected states at runtime. It solves the problem of a program crashing deeply in unexpected ways by failing early and explicitly.
- **assert** — a Python keyword that evaluates a condition and raises an `AssertionError` if it is false. It is used to declare invariants, preconditions, and postconditions in code so that assumptions are explicitly enforced during development.
- **for loop** — a Python construct that iterates over a sequence, binding a variable to each element in turn and executing a block of code. It solves the problem of needing to repeat an operation for every item in a collection.
- **while loop** — a Python construct that repeatedly executes a block of code as long as a condition remains true. It solves the problem of repeating an action when the exact number of iterations is unknown in advance.

Objects and methods used:
- **`sum_to_n`**
  - *What it is:* A standalone function that calculates the sum of integers from 1 to n using a mathematical formula.
  - *Implementation:* `def sum_to_n(n): return n * (n + 1) // 2`
  - *Its use:* Used here to demonstrate proving a formula using mathematical induction and verifying it with Python.
  - *Type:* A free function.
  - *Responsibility:* Calculates the arithmetic series sum using Gauss's formula in O(1) time.
  - *Depends on:* An integer `n` passed as a parameter.
  - *Connects to:* Called by the verification loop.
  - *Shape:* An internal utility function in our lesson script.
- **`factorial`**
  - *What it is:* A recursive mathematical function that computes the product of all positive integers less than or equal to n.
  - *Implementation:* `def factorial(n): ...`
  - *Its use:* Used to demonstrate how inductive proofs perfectly mirror the structure of recursive code.
  - *Type:* A free function.
  - *Responsibility:* Computes the factorial of `n` recursively.
  - *Depends on:* An integer `n` >= 0 passed as a parameter.
  - *Connects to:* Calls itself recursively with `n-1`.
  - *Shape:* An internal utility function.
- **`find_max`**
  - *What it is:* A function that finds the largest element in a list.
  - *Implementation:* `def find_max(lst): ...`
  - *Its use:* Used to demonstrate a simple loop invariant in practice.
  - *Type:* A free function.
  - *Responsibility:* Iterates through a list and maintains the running maximum value.
  - *Depends on:* A non-empty list `lst`.
  - *Connects to:* Uses Python's built-in len() and list indexing.
  - *Shape:* An internal utility function.
- **`binary_search`**
  - *What it is:* An efficient algorithm for finding an item from a sorted list of items.
  - *Implementation:* `def binary_search(lst, target): ...`
  - *Its use:* Used to demonstrate proving a complex algorithm correct using loop invariants.
  - *Type:* A free function.
  - *Responsibility:* Locates the index of `target` in a sorted `lst` by repeatedly halving the search space.
  - *Depends on:* A sorted list `lst` and a `target` value.
  - *Connects to:* Returns an integer index to the caller.
  - *Shape:* An internal utility function.
- **`average`**
  - *What it is:* A function that computes the arithmetic mean of a list.
  - *Implementation:* `def average(lst): ...`
  - *Its use:* Used to show the dangers of implicit contracts and what happens when preconditions are violated.
  - *Type:* A free function.
  - *Responsibility:* Sums the list and divides by the length.
  - *Depends on:* A non-empty list of numeric values.
  - *Connects to:* Uses len().
  - *Shape:* An internal utility function.

## Concept Unit: Mathematical induction — the structure

### The Problem
How do we mathematically prove that a program or a formula is correct for *every* possible input? Testing can show the presence of bugs, but not their absence. If we have an infinite number of possible inputs, we cannot test them all. 

### Introduce the concept in isolation
Mathematical induction is a proof technique. We prove that a property $P(n)$ is true for all $n$ in two steps:
1. **BASE CASE**: Prove $P(0)$ or $P(1)$ is true.
2. **INDUCTIVE STEP**: Assume $P(k)$ is true (this is the inductive hypothesis), and prove $P(k+1)$ is true.

If we can do both, the statement is true for all $n \ge$ the base case. 

Let's prove the formula: `sum(1..n) = n(n+1)/2`
```
Base case: n=1. sum(1..1) = 1. 1*(1+1)/2 = 1. TRUE.
Inductive step: assume sum(1..k) = k(k+1)/2.
Prove: sum(1..k+1) = (k+1)(k+2)/2.
sum(1..k+1) = sum(1..k) + (k+1)
             = k(k+1)/2 + (k+1)      [by inductive hypothesis]
             = (k+1)(k/2 + 1)
             = (k+1)(k+2)/2           [algebra]
QED.
```

Let's verify this behavior empirically with throwaway code using Python's `assert` and a `for` loop.

```python
def sum_to_n(n):
    return n * (n + 1) // 2

# Verify for several values:
for n in range(1, 11):
    assert sum(range(1, n+1)) == sum_to_n(n), f'Failed at n={n}'
print('Formula verified for n=1..10')
```
Output:
```text
Formula verified for n=1..10
```
This empirical test verifies the formula for the first 10 integers. The formal induction proved it for all positive integers. 

### Discard the throwaway example
The verification script is deleted and will not appear in the project again.

### Project Change
No reference counterpart — this is a from-scratch addition because we are demonstrating fundamental algorithmic correctness.
Files affected: `math_algorithms.py` (created)
Change type: add
Location: top of file

### The New Code
```python
def sum_to_n(n):
    return n * (n + 1) // 2
```

### The Updated Project
```python
# 1: def sum_to_n(n):
# 2:     return n * (n + 1) // 2
```
This function provides a proven $O(1)$ implementation of an arithmetic sum.

### Mechanical walkthrough
- `def sum_to_n(n):` defines a function taking parameter `n`.
- `return` yields the calculated value back to the caller.
- `n * (n + 1) // 2` evaluates the formula. `//` performs integer division to ensure the return type is an integer. 

### CS/SE Lens
Mathematical induction is the foundation of computer science. It guarantees that our loops and recursive calls will eventually terminate and produce correct results, even for inputs we have never explicitly tested.

### Connect the Pieces
We used mathematical induction to prove a mathematical formula. Next, we will use it to prove a recursive function.

## Concept Unit: Induction on recursive functions — proving factorial correct

### The Problem
How do we prove a recursive function works without attempting to trace every single recursive call in our heads? 

### Introduce the concept in isolation
We can use mathematical induction to prove recursive functions. Let's write a recursive factorial function and prove it computes $n!$.

```python
def factorial_lab(n):
    if n == 0:
        return 1
    return n * factorial_lab(n - 1)

print(f"factorial_lab(5) = {factorial_lab(5)}")
```
Output:
```text
factorial_lab(5) = 120
```

Proof that `factorial_lab(n) = n!` for all $n \ge 0$:
```
Base case: n=0. factorial_lab(0) = 1 = 0!. TRUE.
Inductive step: assume factorial_lab(k) = k! for some k >= 0.
Prove: factorial_lab(k+1) = (k+1)!
factorial_lab(k+1) = (k+1) * factorial_lab(k)   [by the code]
                   = (k+1) * k!                 [by inductive hypothesis]
                   = (k+1)!                     [by definition of factorial]
QED.
```
This proves that the function perfectly computes $n!$. The recursive proof's structure MIRRORS the recursive code.

### Discard the throwaway example
The lab script `factorial_lab` is deleted and will not appear in the project again.

### Project Change
No reference counterpart — this is a from-scratch addition.
Files affected: `math_algorithms.py` (modified)
Change type: add
Location: after `sum_to_n`

### The New Code
```python
def factorial(n):
    if n == 0:
        return 1
    return n * factorial(n - 1)
```

### The Updated Project
```python
# 1: def sum_to_n(n):
# 2:     return n * (n + 1) // 2
# 3:
# 4: def factorial(n):           # ← new
# 5:     if n == 0:              # ← new
# 6:         return 1            # ← new
# 7:     return n * factorial(n - 1) # ← new
```
This adds the proven recursive factorial function to our algorithms collection.

### Mechanical walkthrough
- `def factorial(n):` defines a function taking parameter `n`.
- `if n == 0:` evaluates if we have reached the **Base case** — the first step of an inductive proof, giving the chain a starting point.
- `return 1` returns the evaluated result of the base case.
- `return n * factorial(n - 1)` performs the recursive call. This perfectly matches the **Inductive step** — showing that if the statement holds for $k$ (here $n-1$), it holds for $k+1$ (here $n$).

### CS/SE Lens
The key insight here is structural equivalence: a recursive function *is* an inductive proof written in code. If you cannot write down the base case and the inductive step for your recursive algorithm, the algorithm is likely flawed.

### Connect the Pieces
Recursion is deeply tied to induction. But what about iterative code? For loops, we use the equivalent concept: the loop invariant.

## Concept Unit: Loop invariants — the iterative equivalent

### The Problem
How do we prove that an iterative loop (like a `for` loop or `while` loop) actually computes the correct answer? We can't use simple recursion, because the state mutates over time.

### Introduce the concept in isolation
A **Loop invariant** is a predicate $P(i)$ that is true before every iteration of a loop. A valid invariant must be:
1. **ESTABLISHED**: true before the loop begins.
2. **MAINTAINED**: if true at the start of iteration $i$, it is still true at the start of iteration $i+1$.
3. **USEFUL**: when the loop terminates, the invariant gives you exactly what you need to prove the algorithm correct.

Let's look at `find_max` with a throwaway example.
```python
def find_max_lab(lst):
    best = lst[0]
    for i in range(1, len(lst)):
        # INVARIANT: best = max(lst[0..i-1])
        if lst[i] > best:
            best = lst[i]
    return best

print(find_max_lab([3, 1, 4, 1, 5, 9]))
```
Output:
```text
9
```
Invariant: `best = max(lst[0..i-1])` at the START of each iteration.
- **Established**: before the loop begins, `i=1`. `best = lst[0] = max(lst[0..0])`. TRUE.
- **Maintained**: at the start of iteration $i$, `best = max(lst[0..i-1])`. After the body: if `lst[i] > best`, `best` becomes `lst[i]`; else `best` is unchanged. Either way, at the end of the iteration, `best = max(lst[0..i])`. TRUE for the start of iteration $i+1$.
- **Useful**: when the loop ends (`i=len(lst)`), `best = max(lst[0..len(lst)-1]) = max(lst)`. DONE.

### Discard the throwaway example
The lab function is deleted and will not appear in the project again.

### Project Change
No reference counterpart — this is a from-scratch addition.
Files affected: `list_algorithms.py` (created)
Change type: add
Location: top of file

### The New Code
```python
def find_max(lst):
    best = lst[0]
    for i in range(1, len(lst)):
        if lst[i] > best:
            best = lst[i]
    return best
```

### The Updated Project
```python
# 1: def find_max(lst):
# 2:     best = lst[0]
# 3:     for i in range(1, len(lst)):
# 4:         if lst[i] > best:
# 5:             best = lst[i]
# 6:     return best
```
This is a standard iterative algorithm verified by a loop invariant.

### Mechanical walkthrough
- `best = lst[0]` initializes the state. This explicitly **ESTABLISHES** the loop invariant before the loop begins.
- `for i in range(1, len(lst)):` is a **for loop** — a construct that iterates over a sequence, binding a variable `i` to each index.
- `if lst[i] > best: best = lst[i]` updates the state. This step explicitly **MAINTAINS** the loop invariant.
- `return best` returns the final answer, relying on the loop being **USEFUL** upon termination.

### CS/SE Lens
A loop invariant is just mathematical induction in disguise. The "Established" step is the base case. The "Maintained" step is the inductive step.

### Connect the Pieces
A linear scan like `find_max` is easy to eyeball. Let's use loop invariants to prove something notoriously difficult to get right: binary search.

## Concept Unit: Proving binary search correct with a loop invariant

### The Problem
Binary search is famous for off-by-one errors (infinite loops, skipping elements, out-of-bounds index errors). How do we write it perfectly on the first try?

### Introduce the concept in isolation
We will construct a binary search using a loop invariant to guarantee its correctness.

```python
def binary_search_lab(lst, target):
    low, high = 0, len(lst) - 1
    # INVARIANT: if target is in lst, it is in lst[low..high]
    while low <= high:
        mid = (low + high) // 2
        if lst[mid] == target:
            return mid
        elif lst[mid] < target:
            low = mid + 1    # target not in lst[low..mid], narrow
        else:
            high = mid - 1   # target not in lst[mid..high], narrow
    return -1

print(f"Index of 4: {binary_search_lab([1, 3, 4, 5, 9], 4)}")
print(f"Index of 7: {binary_search_lab([1, 3, 4, 5, 9], 7)}")
```
Output:
```text
Index of 4: 2
Index of 7: -1
```

Proof of invariant:
- **Established**: before the loop, `low=0`, `high=len-1`. If target is in the list, it is in `lst[0..len-1]`. TRUE.
- **Maintained**: if `lst[mid] < target`, the target cannot be in `lst[low..mid]` (because the list is sorted). So we safely set `low = mid + 1`. If `lst[mid] > target`, it cannot be in `lst[mid..high]`, so we set `high = mid - 1`. The invariant is perfectly maintained.
- **Useful**: when `low > high`, the search range is completely empty. By the invariant, if the target were in the list, it would be in `lst[low..high]`. Since that range is empty, the target is definitely not present. Returning `-1` is undeniably correct.

### Discard the throwaway example
The throwaway lab is deleted and will not appear in the project again.

### Project Change
No reference counterpart — this is a from-scratch addition.
Files affected: `list_algorithms.py` (modified)
Change type: add
Location: after `find_max`

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
# 7:  
# 8: def binary_search(lst, target): # ← new
# 9:     low, high = 0, len(lst) - 1 # ← new
# 10:    while low <= high:          # ← new
# 11:        mid = (low + high) // 2 # ← new
# 12:        if lst[mid] == target:  # ← new
# 13:            return mid          # ← new
# 14:        elif lst[mid] < target: # ← new
# 15:            low = mid + 1       # ← new
# 16:        else:                   # ← new
# 17:            high = mid - 1      # ← new
# 18:    return -1                   # ← new
```
We now have an algorithm mathematically proven to contain zero off-by-one errors.

### Mechanical walkthrough
- `low, high = 0, len(lst) - 1` establishes the boundary.
- `while low <= high:` is a **while loop** — a construct that repeatedly executes a block as long as a condition remains true. It ensures we continue searching as long as the search space is not empty.
- `mid = (low + high) // 2` computes the midpoint.
- `if lst[mid] == target: return mid` handles the success case.
- `elif lst[mid] < target: low = mid + 1` narrows the boundary.
- `else: high = mid - 1` narrows the boundary from the other side.
- `return -1` returns when the loop condition evaluates to false, correctly implementing the "Useful" property of our invariant.

### CS/SE Lens
A wrong algorithm cannot be debugged into correctness. By designing the loop invariant first, the code trivially flows from it. 

### Connect the Pieces
But wait — the invariant stated: "if `lst[mid] < target`, the target cannot be in `lst[low..mid]` (because the list is sorted)". What if the list is NOT sorted?

## Concept Unit: Preconditions and postconditions (design by contract)

### The Problem
Who is responsible if `binary_search` is passed an unsorted list and returns the wrong answer? Is it a bug in `binary_search`, or a bug in the code that called it?

### Introduce the concept in isolation
We formalize this relationship using **Design by contract**. The contract consists of a **Precondition** (what the caller promises) and a **Postcondition** (what the function guarantees).

```python
def binary_search_lab2(lst: list, target) -> int:
    """
    Precondition: lst is sorted in non-decreasing order.
    Postcondition: returns i such that lst[i] == target,
                   or -1 if target is not in lst.
    """
    # Enforce the precondition explicitly:
    assert lst == sorted(lst), 'Precondition violated: lst must be sorted'
    
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

try:
    binary_search_lab2([5, 1, 4], 4)
except AssertionError as e:
    print(e)
```
Output:
```text
Precondition violated: lst must be sorted
```

A **Precondition** relieves the function from handling nonsensical inputs. A **Postcondition** holds the function accountable for producing the correct result. Violating the precondition is the CALLER'S bug. Violating the postcondition is the IMPLEMENTER'S bug.

### Discard the throwaway example
The lab is deleted and will not appear in the project again.

### Project Change
No reference counterpart — modifying our existing implementation.
Files affected: `list_algorithms.py` (modified)
Change type: configure
Location: inside `binary_search`

### The New Code
```python
def binary_search(lst: list, target) -> int:
    """
    Precondition: lst is sorted in non-decreasing order.
    Postcondition: returns i such that lst[i] == target,
                   or -1 if target is not in lst.
    """
    assert lst == sorted(lst), 'Precondition violated: lst must be sorted'
```

### The Updated Project
```python
# 7:  
# 8: def binary_search(lst: list, target) -> int:
# 9:     """                                                                     # ← new
# 10:    Precondition: lst is sorted in non-decreasing order.                    # ← new
# 11:    Postcondition: returns i such that lst[i] == target,                    # ← new
# 12:                   or -1 if target is not in lst.                           # ← new
# 13:    """                                                                     # ← new
# 14:    assert lst == sorted(lst), 'Precondition violated: lst must be sorted'  # ← new
# 15:    low, high = 0, len(lst) - 1 
# 16:    while low <= high:          
# 17:        mid = (low + high) // 2 
# 18:        if lst[mid] == target:  
# 19:            return mid          
# 20:        elif lst[mid] < target: 
# 21:            low = mid + 1       
# 22:        else:                   
# 23:            high = mid - 1      
# 24:    return -1                   
```

### Mechanical walkthrough
- `""" Precondition... """` adds documentation defining the **Design by contract**.
- `assert` is a Python keyword that evaluates the condition `lst == sorted(lst)`. If false, it throws an `AssertionError`.
- `lst == sorted(lst)` explicitly verifies the **Precondition**. If this line passes, the function is now obligated to fulfill its **Postcondition**.

### CS/SE Lens
By defining the contract explicitly, we resolve arguments about whose fault a crash is. The function explicitly states what it requires to function safely.

### Connect the Pieces
But there is a major problem with putting `assert lst == sorted(lst)` inside `binary_search`. What is it?

## Concept Unit: Defensive programming vs trust

### The Problem
If we use **Defensive programming** (checking inputs at runtime) in `binary_search`, we guarantee correctness. But `binary_search` is an $O(\log n)$ algorithm, and `sorted(lst)` is an $O(n)$ check. We just ruined the performance of our algorithm. 

### Introduce the concept in isolation
There is a tradeoff between defensive programming and trust. Let's compare three ways to enforce a precondition:

```python
# Defensive: check precondition at runtime (kills performance)
def binary_search_safe(lst, target):
    if not all(lst[i] <= lst[i+1] for i in range(len(lst)-1)):
        raise ValueError('Input list must be sorted')
    return -1 # ...

# Trusting: assert (disabled with python -O, cheap in dev)
def binary_search_assert(lst, target):
    assert all(lst[i] <= lst[i+1] for i in range(len(lst)-1))
    return -1 # ...

# Production: document contract and trust caller (maximum performance)
def binary_search_fast(lst, target):
    """Precondition: lst is sorted."""
    return -1 # ...

print("Concepts isolated without execution (confidence in Python's handling of these statements).")
```
Output:
```text
Concepts isolated without execution (confidence in Python's handling of these statements).
```

The $O(n)$ sorted check destroys the $O(\log n)$ benefit. In production code (like the standard library), the precondition is merely documented, and the caller is trusted. `assert` provides a middle ground: it is active in development to catch bugs, but disabled in production by running Python with the `-O` flag.

### Discard the throwaway example
The lab code is deleted and will not appear in the project again.

### Project Change
No reference counterpart.
Files affected: `list_algorithms.py` (modified)
Change type: modify
Location: inside `binary_search`

### The New Code
```python
def binary_search(lst: list, target) -> int:
    """
    Precondition: lst is sorted in non-decreasing order.
    Postcondition: returns i such that lst[i] == target,
                   or -1 if target is not in lst.
    """
    # assert lst == sorted(lst) # Removed for performance
```

### The Updated Project
```python
# 7:  
# 8: def binary_search(lst: list, target) -> int:
# 9:     """                                                                     
# 10:    Precondition: lst is sorted in non-decreasing order.                    
# 11:    Postcondition: returns i such that lst[i] == target,                    
# 12:                   or -1 if target is not in lst.                           
# 13:    """                                                                     
# 14:    low, high = 0, len(lst) - 1 
# 15:    while low <= high:          
# 16:        mid = (low + high) // 2 
# 17:        if lst[mid] == target:  
# 18:            return mid          
# 19:        elif lst[mid] < target: 
# 20:            low = mid + 1       
# 21:        else:                   
# 22:            high = mid - 1      
# 23:    return -1                   
```
We remove the runtime `assert` because performance requires us to simply trust the caller to honor the **Precondition**.

### Mechanical walkthrough
- The `assert` statement was deleted. We rely entirely on the docstring to express our **Design by contract**.

### CS/SE Lens
Defensive programming is excellent when crossing boundaries (e.g., accepting user input or web requests). Inside a tight algorithmic loop, it is often a fatal performance flaw. 

### Connect the Pieces
If we don't think about these contracts, our programs harbor silent edge cases that cause production failures.

## Concept Unit: Why correctness reasoning matters in practice

### The Problem
What happens if we write code without explicitly defining preconditions or postconditions? 

### Introduce the concept in isolation
Every function has implicit pre- and post-conditions. Let's look at a subtle bug when they aren't explicit.

```python
def average_lab(lst):
    # CLAIM: returns the arithmetic mean of lst
    total = 0
    for x in lst:
        total = total + x
    return total / len(lst)

try:
    average_lab([])
except Exception as e:
    print(f"{type(e).__name__}: {e}")
```
Output:
```text
ZeroDivisionError: division by zero
```

What if `lst` is empty? `ZeroDivisionError` — postcondition not met! What if `lst` contains strings? `TypeError`.

The contract *should* be:
- **Precondition**: `lst` is a non-empty list of numeric values.
- **Postcondition**: returns `sum(lst)/len(lst)` as a float.

Making these explicit forces you to think about edge cases BEFORE running the program. This is John Guttag's central point: rigorous specification leads to fewer bugs.

### Discard the throwaway example
The lab is deleted and will not appear in the project again.

### Project Change
No reference counterpart.
Files affected: `list_algorithms.py` (modified)
Change type: add
Location: bottom of file

### The New Code
```python
def average(lst):
    """
    Precondition: lst is a non-empty list of numeric values
    Postcondition: returns the arithmetic mean of lst as a float
    """
    total = 0
    for x in lst:
        total = total + x
    return total / len(lst)
```

### The Updated Project
```python
# 24:
# 25: def average(lst):                                                           # ← new
# 26:     """                                                                     # ← new
# 27:     Precondition: lst is a non-empty list of numeric values                 # ← new
# 28:     Postcondition: returns the arithmetic mean of lst as a float            # ← new
# 29:     """                                                                     # ← new
# 30:     total = 0                                                               # ← new
# 31:     for x in lst:                                                           # ← new
# 32:         total = total + x                                                   # ← new
# 33:     return total / len(lst)                                                 # ← new
```

### Mechanical walkthrough
- `""" Precondition: ... """` forces us to codify exactly what is expected, making our **Precondition** explicitly documented.
- `for x in lst:` is a **for loop** — a construct that iterates over a sequence, binding a variable `x` to each element in turn, unpacking the list.
- `total = total + x` maintains an implicit loop invariant (total is the sum of items up to the current iteration).
- `return total / len(lst)` calculates the final mean and fulfills our **Postcondition**.

### CS/SE Lens
Correctness reasoning is not an academic exercise. Specifying exactly what a function needs and exactly what it promises forces you to design edge cases out of existence.

### Connect the Pieces
Loop invariants and induction are the core tools for reasoning about correctness. In the next lesson, we'll encounter problems where subproblems overlap, requiring a completely different technique.

---
**Next Lesson:** Lesson 34 covers dynamic programming — the technique for algorithms where subproblems OVERLAP. Exercises: use induction to prove that your merge_sort is correct (prove the merge function is correct first, then use it); write the loop invariant for bubble sort.
