# Lesson 33: Recursion and Induction — Proving Programs Correct

What you will build: The reader understands the correspondence between mathematical induction and recursive programs: the base case of induction corresponds to the base case of recursion; the inductive step corresponds to the recursive case. They learn to reason about program correctness using loop invariants and induction. The transferable insight: a correct recursive program is a proof by induction. The base case proves the simplest input. The inductive step assumes the recursive call is correct and shows the whole function is correct. This mental model catches bugs before you even run the code.

What you need to know first: Lessons 00-32.

**Terms used in this lesson**
- **Mathematical induction** — A mathematical proof technique. It exists to prove that a property holds for all natural numbers by proving it for a base case and proving that if it holds for $k$, it holds for $k+1$.
- **Base case** — The condition under which a recursive function returns a value without making any subsequent recursive calls. It exists to stop the recursion and provide a foundational value.
- **Inductive step** — The part of a mathematical proof or recursive function that relies on the assumption that a smaller instance of the problem is already solved. It exists to build the solution for size $n$ from size $n-1$.
- **Loop invariant** — A property that is true before a loop begins, at the end of each iteration, and after the loop terminates. It exists to formally prove the correctness of iterative algorithms.
- **Structural induction** — A generalization of mathematical induction that inducts on the structure of data (like lists or trees) rather than just integers. It exists to prove properties about functions that operate on recursive data structures.
- **Precondition** — A condition that must be true before a function is called. It exists to explicitly define the expected state or inputs, relieving the function from handling invalid data.
- **Postcondition** — A condition that is guaranteed to be true after a function finishes execution, provided its preconditions were met. It exists to define the function's contract with its caller.
- **Termination** — The guarantee that a program or function will eventually finish executing. It exists to prevent infinite loops and unbounded recursion.

**Objects and methods used**
- **`print`**
  - *What it is:* A built-in function to output data.
  - *Implementation:* `print(*objects, sep=' ', end='\n', file=sys.stdout, flush=False)`
  - *Its use:* To display traced output for verifying recursive and iterative steps.
  - *Type:* Built-in function.
  - *Responsibility:* Writes the string representation of objects to the standard output stream.
  - *Depends on:* The objects passed to it to have a string representation.
  - *Connects to:* Calls `__str__` on objects and outputs to `sys.stdout`.
  - *Shape:* A standard output boundary tool used for visibility.
- **`range`**
  - *What it is:* A built-in class for generating a sequence of numbers.
  - *Implementation:* `range(stop)` or `range(start, stop[, step])`
  - *Its use:* To generate inputs for iterating through tests.
  - *Type:* Built-in type/class.
  - *Responsibility:* Generates an immutable sequence of numbers based on start, stop, and step.
  - *Depends on:* Integer arguments.
  - *Connects to:* Provides an iterable for loops.
  - *Shape:* A fundamental iterative building block.
- **`len`**
  - *What it is:* A built-in function to get the number of items in a container.
  - *Implementation:* `len(s)`
  - *Its use:* To calculate the size of lists for binary search and termination bounds.
  - *Type:* Built-in function.
  - *Responsibility:* Returns the length of an object.
  - *Depends on:* The object having a `__len__` method.
  - *Connects to:* Interrogates lists and strings.
  - *Shape:* A standard measurement tool for data structures.
- **`assert`**
  - *What it is:* A keyword used for debugging purposes.
  - *Implementation:* `assert condition, message`
  - *Its use:* To explicitly check loop invariants and preconditions at runtime.
  - *Type:* Language keyword.
  - *Responsibility:* Raises an `AssertionError` if the specified condition evaluates to false.
  - *Depends on:* A boolean expression.
  - *Connects to:* The runtime exception handling system.
  - *Shape:* An internal diagnostic mechanism.
- **`sorted`**
  - *What it is:* A built-in function to return a new sorted list from an iterable.
  - *Implementation:* `sorted(iterable, *, key=None, reverse=False)`
  - *Its use:* To assert that an input list meets a precondition of being sorted.
  - *Type:* Built-in function.
  - *Responsibility:* Produces a new list containing all items from the iterable in ascending order.
  - *Depends on:* Comparable elements in the iterable.
  - *Connects to:* Returns a new list to the caller without mutating the original.
  - *Shape:* A data transformation utility.

## Concept Unit: Induction and recursion — the correspondence

### The Problem
How can we be absolutely certain that a function calling itself will always produce the correct result without manually tracing every possible input? If a recursive function is a chain of deferred operations, what mathematical principle guarantees the final answer is right? What would happen if we didn't have a solid mathematical underpinning for recursion?

### Introduce the concept in isolation
Here is the concept of **mathematical induction** mirroring a recursive program.

```python
# Mathematical induction:
# 1. Base case: prove P(0) is true
# 2. Inductive step: if P(k) is true, prove P(k+1) is true
# 3. Conclusion: P(n) is true for all n >= 0

# Recursive program mirrors this exactly:
def factorial(n):
    # CLAIM: factorial(n) returns n! for all n >= 0
    # BASE CASE (n=0): returns 1 = 0! ✓
    if n == 0:
        return 1
    # INDUCTIVE STEP: assume factorial(n-1) returns (n-1)!
    # (the inductive hypothesis)
    # Then: n * factorial(n-1) = n * (n-1)! = n! ✓
    return n * factorial(n - 1)

for i in range(6):
    print(f'factorial({i}) = {factorial(i)}')
```

**Output:**
```
factorial(0) = 1
factorial(1) = 1
factorial(2) = 2
factorial(3) = 6
factorial(4) = 24
factorial(5) = 120
```

This output proves the direct correspondence. Trace the correspondence: base case `n=0`: return `1=0!`. Inductive step: IF `factorial(n-1)=(n-1)!` THEN `n*factorial(n-1)=n*(n-1)!=n!`. By induction, the function is correct for all $n \ge 0$. The structure of the code *is* the proof.

### Discard the throwaway
This throwaway example is discarded and will not appear in the project again.

### Project Change
No reference counterpart — this is a standalone theory lesson because we are proving program correctness conceptually.
- **Files affected:** None.
- **Change type:** N/A.
- **Location:** N/A.
- **Dependencies:** None.

### The New Code
```python
def factorial(n):
    if n == 0:
        return 1
    return n * factorial(n - 1)
```

### The Updated Project
```python
1: def factorial(n): # ← new
2:     if n == 0: # ← new
3:         return 1 # ← new
4:     return n * factorial(n - 1) # ← new
```
This complete function demonstrates the recursive implementation of factorial.

### Mechanical walkthrough
- `def factorial(n):`: Defines a new function named `factorial` taking a single argument `n`.
- `if n == 0:`: Checks the equality operator to see if `n` is exactly `0`. This is the base case check.
- `return 1`: Returns the integer `1`. This resolves the base case without further recursion.
- `return n * factorial(n - 1)`: Multiplies `n` by the result of the recursive call `factorial(n - 1)`. The multiplication operator `*` combines the current step with the inductive hypothesis.

### CS lens
The CS concept is **Induction and Recursion Equivalence**. Mathematical induction is the formal tool used to prove the correctness of recursive algorithms. Real-world places it appears: proving compiler correctness, validating recursive descent parsers, formal verification of cryptographic protocols, and type checking systems.

### SE lens
Design principle: **Correctness by Construction**. By writing the code to explicitly map to the mathematical proof, we avoid off-by-one errors. Alternative NOT chosen: unstructured iterative state. The real tradeoff is that recursion maps cleaner to the proof but can consume stack space (stack overflow), whereas iteration is memory-efficient but requires a loop invariant to prove.

### Commands needed
None for this unit.

### Run it
Predicted confidently: `factorial(5)` returns `120`.

### One sentence connecting to previous unit
Having established that mathematical induction maps perfectly to recursion, we will now explore how to prove iterative loops using invariants.

## Concept Unit: Loop invariants — reasoning about iterative programs

### The Problem
If recursion uses induction for proof, how do we prove an iterative `while` or `for` loop is correct? How can we know that mutable state updating on every cycle eventually converges to the right answer? What property remains constant while the variables change?

### Introduce the concept in isolation
Here is the concept of a **loop invariant** in isolation.

```python
def factorial(n):
    if n == 0: return 1
    return n * factorial(n-1)

def factorial_iter_traced(n):
    result, i = 1, 1
    print(f'Init: result={result} (should be 0!=1)')
    while i <= n:
        result *= i
        print(f'After i={i}: result={result} (should be {i}!={factorial(i)})')
        assert result == factorial(i), 'Invariant violated!'
        i += 1
    return result

factorial_iter_traced(4)
```

**Output:**
```
Init: result=1 (should be 0!=1)
After i=1: result=1 (should be 1!=1)
After i=2: result=2 (should be 2!=2)
After i=3: result=6 (should be 3!=6)
After i=4: result=24 (should be 4!=24)
```

This output proves the invariant holds throughout. Trace `factorial_iter_traced(4)`: Init: `result=1=0!`. `i=1`: `result=1=1!`. `i=2`: `result=2=2!`. `i=3`: `result=6=3!`. `i=4`: `result=24=4!`. Loop exits when `i=5`: return `24`.

### Discard the throwaway
This throwaway example is discarded and will not appear in the project again.

### Project Change
No reference counterpart — this is a standalone theory lesson.
- **Files affected:** None.
- **Change type:** N/A.
- **Location:** N/A.
- **Dependencies:** None.

### The New Code
```python
def factorial_iter(n):
    result = 1
    i = 1
    while i <= n:
        result *= i
        i += 1
    return result
```

### The Updated Project
```python
1: def factorial_iter(n): # ← new
2:     result = 1 # ← new
3:     i = 1 # ← new
4:     while i <= n: # ← new
5:         result *= i # ← new
6:         i += 1 # ← new
7:     return result # ← new
```
This iterative function calculates the factorial while maintaining the loop invariant that `result == (i-1)!`.

### Mechanical walkthrough
- `def factorial_iter(n):`: Defines the function.
- `result = 1`: Initializes the accumulator variable to `1`.
- `i = 1`: Initializes the loop counter to `1`.
- `while i <= n:`: Evaluates the loop condition. The loop continues as long as `i` is less than or equal to `n`.
- `result *= i`: Multiplies `result` by `i` and assigns it back to `result`. This maintains the invariant.
- `i += 1`: Increments the loop counter `i` by `1`.
- `return result`: Returns the final accumulated result.

### CS lens
The CS concept is **Loop Invariants**. An invariant is a condition that is true before and after every execution of a block of code. Real-world places it appears: Hoare logic for program verification, loop unrolling optimizations in compilers, proving sorting algorithm correctness (like Quicksort partitions), and database transaction isolation proofs.

### SE lens
Design principle: **Defensive Programming with Assertions**. Using an explicit `assert` in development to check the invariant ensures the loop logic is flawless. Alternative NOT chosen: relying entirely on unit tests. Real tradeoff: assertions run continuously during execution and can incur a performance penalty, whereas unit tests only run at build time, but assertions catch internal state corruption instantly.

### Commands needed
None for this unit.

### Run it
Predicted confidently: `factorial_iter(5)` returns `120`.

### One sentence connecting to previous unit
Just as loop invariants prove properties over integers iterating through a loop, we can generalize mathematical induction to prove properties over data structures.

## Concept Unit: Recursive correctness — structural induction on lists

### The Problem
Mathematical induction works beautifully on natural numbers ($0, 1, 2, ...$), but how do we prove correctness for functions that process lists, trees, or graphs? What is the equivalent of $n=0$ for a list? What represents $n-1$ when dealing with a sequence of items?

### Introduce the concept in isolation
Here is the concept of **structural induction** in isolation.

```python
# Structural induction: induct on the STRUCTURE of data, not just integers
# Base case: empty list []
# Inductive step: non-empty list [head] + tail
#   assume correct for tail, prove correct for [head]+tail

def sum_list(lst):
    # CLAIM: sum_list(lst) returns sum of elements in lst
    # BASE CASE (lst=[]): returns 0 = sum([]) ✓
    if not lst:
        return 0
    # INDUCTIVE STEP: assume sum_list(lst[1:]) = sum(lst[1:])
    # Then: lst[0] + sum_list(lst[1:]) = lst[0] + sum(lst[1:]) = sum(lst) ✓
    return lst[0] + sum_list(lst[1:])

def reverse_list(lst):
    # BASE CASE: [] reversed is []
    if not lst:
        return []
    # INDUCTIVE STEP: assume reverse_list(lst[1:]) reverses the tail
    # Then: reverse_list(lst[1:]) + [lst[0]] reverses the whole list
    return reverse_list(lst[1:]) + [lst[0]]

print(sum_list([1,2,3,4,5]))
print(reverse_list([1,2,3,4]))
```

**Output:**
```
15
[4, 3, 2, 1]
```

This output proves the structural inductive steps. Trace `sum_list([1,2,3])`: `lst=[1,2,3]` not empty. `lst[0]=1`. `sum_list([2,3])=5` (by inductive hypothesis). Return `1+5=6`. Trace: `sum_list([2,3]) = 2 + sum_list([3]) = 2 + 3 + sum_list([]) = 2 + 3 + 0 = 5`.

### Discard the throwaway
This throwaway example is discarded and will not appear in the project again.

### Project Change
No reference counterpart — this is a standalone theory lesson.
- **Files affected:** None.
- **Change type:** N/A.
- **Location:** N/A.
- **Dependencies:** None.

### The New Code
```python
def sum_list(lst):
    if not lst:
        return 0
    return lst[0] + sum_list(lst[1:])
```

### The Updated Project
```python
1: def sum_list(lst): # ← new
2:     if not lst: # ← new
3:         return 0 # ← new
4:     return lst[0] + sum_list(lst[1:]) # ← new
```
This recursive function structural induction to sum a list by separating the head from the tail.

### Mechanical walkthrough
- `def sum_list(lst):`: Defines the function taking a single list argument.
- `if not lst:`: Evaluates the truthiness of the list. An empty list is false, so `not lst` checks the base case.
- `return 0`: Returns `0` if the list is empty.
- `return lst[0] + sum_list(lst[1:])`: Accesses the first element `lst[0]` and adds it to the result of recursively calling `sum_list` on the slice `lst[1:]` (the rest of the list).

### CS lens
The CS concept is **Structural Induction**. It is a proof technique used in mathematical logic and computer science to prove propositions about recursively defined structures. Real-world places it appears: proving properties of abstract syntax trees in compilers, validating JSON parsing rules, formalizing database query equivalence, and verifying tree traversal algorithms.

### SE lens
Design principle: **Recursive Data Transformation**. Code structurally mimics the data it processes. Alternative NOT chosen: a standard `for` loop over indices. Real tradeoff: slicing `lst[1:]` in Python creates a new list copy on each recursive call, causing $O(N^2)$ time complexity and memory overhead, whereas an iterative approach modifies state in-place for $O(N)$ speed.

### Commands needed
None for this unit.

### Run it
Predicted confidently: `sum_list([1, 2, 3])` returns `6`.

### One sentence connecting to previous unit
Understanding how induction proves internal logic naturally leads us to explicitly define the promises a function makes to the outside world through preconditions and postconditions.

## Concept Unit: Preconditions and postconditions

### The Problem
How can a function guarantee it works if the caller passes garbage data? If a binary search requires a sorted list, is it the function's job to sort it, or the caller's job to guarantee it? How do we formalize these expectations?

### Introduce the concept in isolation
Here is the concept of **preconditions and postconditions** in isolation.

```python
def binary_search(sorted_lst, target):
    '''
    Precondition: sorted_lst is sorted in ascending order.
    Postcondition: returns index i where sorted_lst[i] == target,
                   or -1 if target not in sorted_lst.
    '''
    # Assert precondition in debug mode:
    assert sorted_lst == sorted(sorted_lst), 'Precondition violated: not sorted'

    lo, hi = 0, len(sorted_lst) - 1
    # Invariant: target is in sorted_lst[lo..hi] if it exists
    while lo <= hi:
        mid = (lo + hi) // 2
        if sorted_lst[mid] == target:
            return mid   # postcondition satisfied
        elif sorted_lst[mid] < target:
            lo = mid + 1  # invariant maintained: target in [mid+1..hi]
        else:
            hi = mid - 1  # invariant maintained: target in [lo..mid-1]
    return -1  # postcondition: -1 because lo > hi (no elements remain)

print(binary_search([1,3,5,7,9], 7))
print(binary_search([1,3,5,7,9], 4))
```

**Output:**
```
3
-1
```

This output proves the function meets its postcondition. Trace invariant: Initially target in `lst[0..4]` if present. `mid=2`: `lst[2]=5<7` -> `lo=3`. Invariant: target in `lst[3..4]`. `mid=3`: `lst[3]=7==7`. Found. Invariant maintained at each step.

### Discard the throwaway
This throwaway example is discarded and will not appear in the project again.

### Project Change
No reference counterpart — this is a standalone theory lesson.
- **Files affected:** None.
- **Change type:** N/A.
- **Location:** N/A.
- **Dependencies:** None.

### The New Code
```python
def binary_search(sorted_lst, target):
    assert sorted_lst == sorted(sorted_lst), 'Precondition violated'
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
1: def binary_search(sorted_lst, target): # ← new
2:     assert sorted_lst == sorted(sorted_lst), 'Precondition violated' # ← new
3:     lo, hi = 0, len(sorted_lst) - 1 # ← new
4:     while lo <= hi: # ← new
5:         mid = (lo + hi) // 2 # ← new
6:         if sorted_lst[mid] == target: # ← new
7:             return mid # ← new
8:         elif sorted_lst[mid] < target: # ← new
9:             lo = mid + 1 # ← new
10:         else: # ← new
11:             hi = mid - 1 # ← new
12:     return -1 # ← new
```
This implementation searches a sorted list, explicitly validating its precondition and ensuring the postcondition upon exit.

### Mechanical walkthrough
- `def binary_search(sorted_lst, target):`: Defines the binary search function with two parameters.
- `assert sorted_lst == sorted(sorted_lst)`: Checks the precondition that the list is already sorted.
- `lo, hi = 0, len(sorted_lst) - 1`: Initializes the two pointer bounds representing the search space.
- `while lo <= hi:`: Loops as long as the search space is valid.
- `mid = (lo + hi) // 2`: Calculates the midpoint index using integer division.
- `if sorted_lst[mid] == target:`: Checks if the target is found at the midpoint.
- `return mid`: Satisfies the postcondition by returning the successful index.
- `elif sorted_lst[mid] < target:`: Narrows the search to the right half if the target is larger.
- `lo = mid + 1`: Updates the lower bound.
- `else:`: Handles the case where the target is smaller.
- `hi = mid - 1`: Updates the upper bound.
- `return -1`: Satisfies the postcondition by returning `-1` when the target is not found.

### CS lens
The CS concept is **Design by Contract**. Software components should have clear, formal, and verifiable interfaces. Real-world places it appears: standard library API specifications, Eiffel programming language features, formal verification tools (like Dafny), and REST API OpenAPI schemas validating inputs before processing.

### SE lens
Design principle: **Fail Fast**. Asserting preconditions at the top boundary prevents corrupt state from propagating deep into the program. Alternative NOT chosen: quietly returning `-1` if the list is unsorted. Real tradeoff: adding assertions or validation adds runtime cost on every call; trusting the caller avoids overhead but risks subtle, impossible-to-debug logic failures later.

### Commands needed
None for this unit.

### Run it
Predicted confidently: `binary_search([1, 2, 3], 2)` returns `1`.

### One sentence connecting to previous unit
Even if an invariant holds and conditions are correct, a loop or recursive function must guarantee it eventually stops, which brings us to termination.

## Concept Unit: Termination — proving a program stops

### The Problem
How do we mathematically prove that our recursive functions or while loops don't run forever? What prevents a while loop condition from remaining perpetually true? How do we establish a "decreasing measure" to ensure finality?

### Introduce the concept in isolation
Here is the concept of a **termination** proof in isolation.

```python
# Termination requires a DECREASING MEASURE that is bounded below
# For factorial(n): measure = n. Each call: n decreases by 1.
# When n=0 (base case): stops.

# For binary_search: measure = hi - lo + 1 (number of candidates)
# Each iteration: either found (stop) or range halved -> measure decreases
# When lo > hi: measure = 0 or negative -> loop exits

# Termination proof for collatz (harder: not proven for all n!):
def collatz(n, steps=0):
    print(f'{n}', end=' ')
    if n == 1:
        print(f'\n{steps} steps')
        return steps
    if n % 2 == 0:
        return collatz(n // 2, steps + 1)   # n decreases
    else:
        return collatz(3 * n + 1, steps + 1)  # n may INCREASE!

collatz(6)
```

**Output:**
```
6 3 10 5 16 8 4 2 1 
8 steps
```

This output proves the function halted for input 6, but does not prove it for all inputs. Trace `collatz(6)`: `6` even -> `collatz(3)`. `3` odd -> `collatz(10)`. `10` even -> `collatz(5)`. `5` odd -> `collatz(16)`. `16 -> 8 -> 4 -> 2 -> 1`. Stop. 8 steps. No one has proven collatz terminates for ALL $n$ (Collatz conjecture, unsolved).

### Discard the throwaway
This throwaway example is discarded and will not appear in the project again.

### Project Change
No reference counterpart — this is a standalone theory lesson.
- **Files affected:** None.
- **Change type:** N/A.
- **Location:** N/A.
- **Dependencies:** None.

### The New Code
```python
def collatz(n):
    if n == 1:
        return True
    if n % 2 == 0:
        return collatz(n // 2)
    else:
        return collatz(3 * n + 1)
```

### The Updated Project
```python
1: def collatz(n): # ← new
2:     if n == 1: # ← new
3:         return True # ← new
4:     if n % 2 == 0: # ← new
5:         return collatz(n // 2) # ← new
6:     else: # ← new
7:         return collatz(3 * n + 1) # ← new
```
This function highlights the difficulty of proving termination when the progression toward the base case isn't strictly monotonic.

### Mechanical walkthrough
- `def collatz(n):`: Defines the function testing the Collatz conjecture.
- `if n == 1:`: The base case check.
- `return True`: Stops the recursion if the value reaches `1`.
- `if n % 2 == 0:`: Evaluates whether `n` is even using the modulo operator.
- `return collatz(n // 2)`: Calls the function recursively with `n // 2`. The state decreases.
- `else:`: The fallback condition if `n` is odd.
- `return collatz(3 * n + 1)`: Calls the function recursively with `3 * n + 1`. The state *increases*.

### CS lens
The CS concept is **Program Termination and the Halting Problem**. Alan Turing proved that no general algorithm can determine whether every possible program will eventually halt. Real-world places it appears: static analyzers verifying timeout conditions, type systems with bounded recursion (like Total Functional Programming languages such as Idris), infinite loop detection in CI/CD, and smart contract gas limits in blockchain.

### SE lens
Design principle: **Guaranteed Progress**. Every loop iteration or recursive call must measurably move closer to the exit condition. Alternative NOT chosen: relying on arbitrary timeouts. Real tradeoff: adding strict monotonicity checks requires extra variables and arithmetic that can complicate the code, but without it, the program is vulnerable to hanging under edge-case data.

### Commands needed
None for this unit.

### Run it
Predicted confidently: `collatz(16)` returns `True`.

### One sentence connecting to previous unit
Combining invariants, induction, and termination, we arrive at a full proof of correctness.

## Closing
### Connect the pieces
Let's trace proving `factorial(n)` correct by induction through ALL concept units discussed today:
1. **Induction & Recursion:** The structure explicitly mirrors a formal mathematical proof.
2. **Loop Invariants:** The iterative version holds a continuous property `result = i!` proving it handles every single step perfectly.
3. **Structural Induction:** Not explicitly applicable to integer sequences, but confirms the logic extends to arrays.
4. **Preconditions & Postconditions:** The assumption $n \ge 0$ is the precondition, and returning $n!$ is the postcondition, sealing the contract.
5. **Termination:** The decreasing measure is $n$. Because $n$ starts $\ge 0$ and decreases by exactly 1 each call, it absolutely must hit the base case $0$, guaranteeing it will never hang. 

By applying all these principles, we can definitively prove a program is mathematically correct without having to execute it for every conceivable integer.
