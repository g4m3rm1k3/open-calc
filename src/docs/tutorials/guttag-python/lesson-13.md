# Lesson 13: Recursion — The Function That Calls Itself

**What you will build**
This lesson introduces recursion by building and analyzing several functions that call themselves. We will compute factorials, explore Python's recursion limits, trace execution depth, flatten nested recursive data structures, and compare recursive and iterative approaches.

**What you need to know first**
- Lesson 12: Iteration and Loops

**Terms used in this lesson**
- **Recursion**: 
  - *What it is*: A programming technique where a function calls itself.
  - *Implementation*: A function body containing a call to the same function name.
  - *Its use*: To break down complex problems into identical, smaller sub-problems.
  - *Type*: Concept.
  - *Responsibility*: Solve a problem by reducing it until it reaches a trivial state.
  - *Depends on*: A base case to stop execution.
  - *Connects to*: The call stack.
  - *Shape*: Algorithmic pattern.
- **Base Case**: 
  - *What it is*: The condition that stops the recursion.
  - *Implementation*: An `if` statement returning a hardcoded or simple value without recursing.
  - *Its use*: To prevent infinite loops.
  - *Type*: Logic branch.
  - *Responsibility*: Provide an immediate answer for the simplest input.
  - *Depends on*: The function's input parameters.
  - *Connects to*: The recursive step that builds towards it.
  - *Shape*: Leaf nodes in a recursive tree.
- **Recursive Case**: 
  - *What it is*: The part of the function that executes the self-call.
  - *Implementation*: A `return` statement involving the function itself with modified arguments.
  - *Its use*: To step closer to the base case.
  - *Type*: Logic branch.
  - *Responsibility*: Reduce the problem size.
  - *Depends on*: The base case acting as a backstop.
  - *Connects to*: The next frame on the call stack.
  - *Shape*: Intermediate nodes in a recursive tree.
- **Call Stack**: 
  - *What it is*: A stack data structure storing information about active subroutines.
  - *Implementation*: Maintained implicitly by Python.
  - *Its use*: To track where each function returns when finished.
  - *Type*: System resource.
  - *Responsibility*: Manage function execution contexts.
  - *Depends on*: Memory limits.
  - *Connects to*: Function calls.
  - *Shape*: LIFO stack.

**Objects and methods used**
- **`sys.getrecursionlimit()`**: 
  - *What it is*: A standard library method from the `sys` module.
  - *Implementation*: `sys.getrecursionlimit()` returning an integer.
  - *Its use*: To view the interpreter's built-in maximum recursion depth.
  - *Type*: Function.
  - *Responsibility*: Expose recursion configuration.
  - *Depends on*: Importing `sys`.
  - *Connects to*: Python execution environment.
  - *Shape*: Global configuration accessor.
- **`isinstance()`**: 
  - *What it is*: A built-in function to check variable types.
  - *Implementation*: `isinstance(object, type)` returning a boolean.
  - *Its use*: To determine if an item is a list or a primitive.
  - *Type*: Built-in function.
  - *Responsibility*: Runtime type checking.
  - *Depends on*: An object and a type to check against.
  - *Connects to*: Conditional branches.
  - *Shape*: Type boundary guard.
- **`list.extend()`**: 
  - *What it is*: A list method that merges an iterable into the list.
  - *Implementation*: `my_list.extend(iterable)` returning `None`.
  - *Its use*: To combine flattened sub-lists.
  - *Type*: Instance method.
  - *Responsibility*: Concatenate multiple elements in-place.
  - *Depends on*: An iterable.
  - *Connects to*: The list object.
  - *Shape*: Mutation operation.
- **`list.append()`**: 
  - *What it is*: A list method that adds a single item.
  - *Implementation*: `my_list.append(item)` returning `None`.
  - *Its use*: To add non-list items to the final list.
  - *Type*: Instance method.
  - *Responsibility*: Add one element in-place.
  - *Depends on*: An item.
  - *Connects to*: The list object.
  - *Shape*: Mutation operation.

## Concept Unit: Base case and recursive case

### The Problem
How do we write a function that performs a repeated mathematical operation, like a factorial, without using a traditional `for` or `while` loop? What happens if a function tries to call itself? How would it ever know when to stop?

### Introduce the concept in isolation
```python
def simple_recurse(n):
    if n == 0:
        return "Done"
    return simple_recurse(n - 1)

print(simple_recurse(3))
```
**Output:**
```text
Done
```
This proves that a function can call itself and successfully complete as long as an `if` condition eventually halts the chain of calls. This is called a **recursive function**.

### Discard the throwaway
This throwaway example is discarded and will not appear in the project.

### Project Change
- **Reference Source**: No reference counterpart — this is a from-scratch addition because we are demonstrating mathematical recursion.
- **Files affected**: `lesson-13.py` (created)
- **Change type**: Add
- **Location**: Top of file
- **Dependencies**: None

### The New Code
```python
def factorial(n):
    if n == 0:               # base case: answer is known
        return 1
    return n * factorial(n - 1)  # recursive case: reduce problem

print(factorial(0))  # 1
print(factorial(1))  # 1
print(factorial(5))  # 120
```

### The Updated Project
```python
1: def factorial(n):  # <- new
2:     if n == 0:     # <- new
3:         return 1   # <- new
4:     return n * factorial(n - 1) # <- new
5: 
6: print(factorial(0)) # <- new
7: print(factorial(1)) # <- new
8: print(factorial(5)) # <- new
```
This structure creates a function that calculates the factorial of a number by recursively multiplying the number by the factorial of the number minus one, stopping when it reaches zero.

### Mechanical walkthrough
- `def factorial(n):`: Defines a new function named `factorial` taking one parameter `n`.
- `if n == 0:`: Evaluates whether `n` has reached the base case of `0`.
- `return 1`: Returns the constant `1` immediately without any further function calls if the base case is met.
- `return`: Instructs the function to output a calculated value.
- `n * factorial(n - 1)`: Multiplies the current `n` by the result of calling `factorial` again, but with `n - 1`.
- `print(...)`: Executes the function with arguments `0`, `1`, and `5`, printing the returned integers.

### CS lens
Recursion is a fundamental CS concept based on mathematical induction. Real-world applications include tree traversals, parsing expressions in compilers, divide-and-conquer algorithms like Quicksort, and fractal generation in graphics.

### SE lens
Design principle: Recursive logic is often more readable than maintaining a manual stack or complex iteration state for hierarchical data. The alternative not chosen is using a `while` loop with a local accumulator, which trades mathematical purity and readability for slight performance gains.

### Commands needed
`python3 lesson-13.py`

### Run it
```text
1
1
120
```
Trace: `factorial(5) = 5 * factorial(4) = 5 * 4 * factorial(3) = ... = 120`.

### One sentence connecting to previous unit
Now that we have a basic recursive function working, we must explore what happens behind the scenes when a function calls itself many times.

## Concept Unit: The call stack and Python's recursion limit

### The Problem
If a recursive function never reaches its base case, will it run forever like an infinite `while` loop? Does the computer keep track of every unresolved function call, and if so, is there a limit to how many it can remember?

### Introduce the concept in isolation
```python
def infinite(n):
    return infinite(n + 1)
```
If we run this, it eventually crashes with a `RecursionError`. This proves that every active function call consumes a finite system resource, and Python strictly limits how deep this can go.

### Discard the throwaway
This throwaway infinite recursion is discarded.

### Project Change
- **Reference Source**: No reference counterpart.
- **Files affected**: `lesson-13.py` (modified)
- **Change type**: Add
- **Location**: Below the `factorial` function.
- **Dependencies**: `sys` module

### The New Code
```python
import sys
print(sys.getrecursionlimit())  # 1000

def safe_count(n, limit):
    if n >= limit:
        return n          # base case
    return safe_count(n + 1, limit)  # recursive case

print(safe_count(0, 10))  # 10
```

### The Updated Project
```python
8: print(factorial(5)) 
9: 
10: import sys # <- new
11: print(sys.getrecursionlimit()) # <- new
12: 
13: def safe_count(n, limit): # <- new
14:     if n >= limit: # <- new
15:         return n # <- new
16:     return safe_count(n + 1, limit) # <- new
17: 
18: print(safe_count(0, 10)) # <- new
```
This adds an import to inspect Python's recursion depth limit and a safe counting function that explicitly stops recursing once it hits a given limit to prevent errors.

### Mechanical walkthrough
- `import sys`: Loads the built-in system module.
- `print(sys.getrecursionlimit())`: Calls the `getrecursionlimit()` function on the `sys` object and prints its integer return value.
- `def safe_count(n, limit):`: Defines a function with two parameters: the current count and the maximum allowed depth.
- `if n >= limit:`: Evaluates if the current state exceeds or equals the safe boundary.
- `return n`: Returns the count directly, stopping the recursion.
- `return safe_count(n + 1, limit)`: Recursively calls itself with an incremented `n`.

### CS lens
The Call Stack is the CS concept here. When a function calls another (or itself), a new "frame" is pushed onto the call stack. Real-world analogies include a stack of plates, a trail of breadcrumbs in a maze, browser history back buttons, or a pile of sticky notes reminding you to resume tasks.

### SE lens
Design principle: Fail-safes. Passing an explicit `limit` parameter protects against catastrophic resource exhaustion. The alternative not chosen is relying on the environment's global recursion limit to catch bugs, which results in hard application crashes (`RecursionError`) instead of graceful exits.

### Commands needed
`python3 lesson-13.py`

### Run it
```text
1000
10
```
Trace: Each call adds a frame to the Python call stack. At 1000 frames: `RecursionError`. Our limit of 10 stops the stack at 10 frames safely.

### One sentence connecting to previous unit
Understanding the limits of the call stack is crucial, but visualizing how it expands and contracts requires instrumenting our code.

## Concept Unit: Tracing recursion with instrumentation

### The Problem
How can we actually see the call stack growing and shrinking? When `factorial(4)` executes, exactly in what order do the recursive calls happen and when do they finally return their values?

### Introduce the concept in isolation
```python
def echo_trace(depth):
    print(f"{'  ' * depth}In at depth {depth}")
    if depth == 1:
        return
    echo_trace(depth + 1)
    print(f"{'  ' * depth}Out of depth {depth}")

echo_trace(0)
```
**Output:**
```text
In at depth 0
  In at depth 1
Out of depth 0
```
This proves that code placed *before* the recursive call executes on the way "down" (or "in"), and code placed *after* it executes on the way "up" (or "out"), in reverse order.

### Discard the throwaway
This throwaway string-formatting echo code is discarded.

### Project Change
- **Reference Source**: No reference counterpart.
- **Files affected**: `lesson-13.py` (modified)
- **Change type**: Add
- **Location**: Below the `safe_count` function.
- **Dependencies**: None

### The New Code
```python
def factorial_traced(n, depth=0):
    indent = '  ' * depth
    print(f'{indent}factorial({n}) called')
    if n == 0:
        print(f'{indent}base case -> returning 1')
        return 1
    result = n * factorial_traced(n - 1, depth + 1)
    print(f'{indent}factorial({n}) -> returning {result}')
    return result

factorial_traced(4)
```

### The Updated Project
```python
18: print(safe_count(0, 10))
19:
20: def factorial_traced(n, depth=0): # <- new
21:     indent = '  ' * depth # <- new
22:     print(f'{indent}factorial({n}) called') # <- new
23:     if n == 0: # <- new
24:         print(f'{indent}base case -> returning 1') # <- new
25:         return 1 # <- new
26:     result = n * factorial_traced(n - 1, depth + 1) # <- new
27:     print(f'{indent}factorial({n}) -> returning {result}') # <- new
28:     return result # <- new
29: 
30: factorial_traced(4) # <- new
```
This code creates a visually traced version of our factorial function, printing indented messages on the way down the call stack and on the way back up.

### Mechanical walkthrough
- `def factorial_traced(n, depth=0):`: Defines a function with a default parameter `depth` to track recursion level.
- `indent = '  ' * depth`: Creates a string of spaces proportional to the current stack depth via string multiplication.
- `print(f'{indent}factorial({n}) called')`: Evaluates an f-string to log execution before recursing.
- `if n == 0:`: Checks the base case.
- `print(...)`: Logs the base case discovery.
- `return 1`: Returns from the base case.
- `result = n * factorial_traced(n - 1, depth + 1)`: Assigns the value of the recursive call to a variable `result`, capturing it instead of returning it immediately.
- `print(f'{indent}factorial({n}) -> returning {result}')`: Logs the computed return value after the recursive call completes.
- `return result`: Finally returns the computed product up the stack.

### CS lens
Instrumentation is the CS concept of adding diagnostic code to a system to monitor its internal execution state. Real-world uses include performance profilers, logging middleware in web servers, debugging hooks in game engines, and telemetry in distributed microservices.

### SE lens
Design principle: Observability. By capturing the recursive result into a variable `result` before returning it, we gain a place to inject a `print` statement. The alternative not chosen is keeping the terse one-line return `return n * factorial(...)`, which is cleaner but fundamentally impossible to log halfway through.

### Commands needed
`python3 lesson-13.py`

### Run it
```text
factorial(4) called
  factorial(3) called
    factorial(2) called
      factorial(1) called
        factorial(0) called
        base case -> returning 1
      factorial(1) -> returning 1
    factorial(2) -> returning 2
  factorial(3) -> returning 6
factorial(4) -> returning 24
```

### One sentence connecting to previous unit
Now that we can clearly visualize how recursive functions dig down and bubble back up, we can apply them to complex hierarchical data shapes.

## Concept Unit: Recursive data structures (nested lists)

### The Problem
How can we process a list that contains other lists of varying depths, like `[1, [2, [3, 4]], 5]`? A simple `for` loop only reads the first level, leaving the inner lists intact. How do we extract every primitive item regardless of how deeply nested it is?

### Introduce the concept in isolation
```python
item = [1, 2]
if isinstance(item, list):
    print("It is a list!")
```
**Output:**
```text
It is a list!
```
This proves we can dynamically inspect whether an item is a standard value or another list at runtime, allowing us to branch our logic accordingly.

### Discard the throwaway
This throwaway `isinstance` check is discarded.

### Project Change
- **Reference Source**: No reference counterpart.
- **Files affected**: `lesson-13.py` (modified)
- **Change type**: Add
- **Location**: Below the `factorial_traced` function call.
- **Dependencies**: None

### The New Code
```python
def flatten(lst):
    result = []
    for item in lst:
        if isinstance(item, list):      # recursive case: item is a list
            result.extend(flatten(item))
        else:                           # base case: item is not a list
            result.append(item)
    return result

print(flatten([1, [2, [3, 4]], 5]))  # [1, 2, 3, 4, 5]
print(flatten([]))                   # []
print(flatten([1, 2, 3]))            # [1, 2, 3]
```

### The Updated Project
```python
30: factorial_traced(4)
31: 
32: def flatten(lst): # <- new
33:     result = [] # <- new
34:     for item in lst: # <- new
35:         if isinstance(item, list): # <- new
36:             result.extend(flatten(item)) # <- new
37:         else: # <- new
38:             result.append(item) # <- new
39:     return result # <- new
40: 
41: print(flatten([1, [2, [3, 4]], 5])) # <- new
42: print(flatten([])) # <- new
43: print(flatten([1, 2, 3])) # <- new
```
This adds a function capable of un-nesting lists of arbitrary and unknown depths by recursively traversing inner lists.

### Mechanical walkthrough
- `def flatten(lst):`: Defines a new function taking a single argument `lst`.
- `result = []`: Initializes an empty list to act as the accumulator for this specific frame.
- `for item in lst:`: Iterates over the items in the current list layer.
- `if isinstance(item, list):`: Checks the type of `item` to see if it is itself a list.
- `result.extend(...)`: Mutates the `result` list by adding all elements yielded by the expression inside.
- `flatten(item)`: The recursive call handling the inner nested list.
- `else:`: Executes when the item is a standard value (the base case for this branch).
- `result.append(item)`: Mutates `result` by attaching the single item directly.
- `return result`: Yields the fully flattened sub-list back up the stack.

### CS lens
Recursive Data Structures are constructs defined in terms of themselves. Real-world appearances include the Document Object Model (DOM) in web browsers, filesystem directory trees, JSON objects, and Abstract Syntax Trees (ASTs) in language compilers.

### SE lens
Design principle: Polymorphic handling. By dynamically checking types with `isinstance`, the function dynamically adapts its flow based on the data shape. The alternative not chosen is hardcoding multiple nested loops (`for x in item: for y in x...`), which catastrophically breaks as soon as the nesting depth exceeds the hardcoded limit.

### Commands needed
`python3 lesson-13.py`

### Run it
```text
[1, 2, 3, 4, 5]
[]
[1, 2, 3]
```
Trace `flatten([1, [2, [3,4]], 5])`: item=1 not list -> append 1. item=[2,[3,4]] is list -> recurse: `flatten([2,[3,4]])`: item=2 -> append 2; item=[3,4] -> recurse: `flatten([3,4])`: item=3->3, item=4->4. Returns `[3,4]`. Back: `[2,3,4]`. item=5 -> append 5. Result: `[1,2,3,4,5]`.

### One sentence connecting to previous unit
While recursion elegantly solves deeply nested structures, we must compare its performance against standard iterative loops for flat mathematical sequences.

## Concept Unit: Recursion vs. iteration

### The Problem
Are recursive functions always the best tool for the job? If a problem like computing Fibonacci numbers can be written recursively or iteratively, how do we decide which is better in terms of system memory and execution time?

### Introduce the concept in isolation
```python
a, b = 0, 1
a, b = b, a + b
print(a, b)
```
**Output:**
```text
1 1
```
This proves we can reassign multiple variables simultaneously in Python, effectively swapping or advancing state without needing a temporary third variable.

### Discard the throwaway
This throwaway tuple-assignment logic is discarded.

### Project Change
- **Reference Source**: No reference counterpart.
- **Files affected**: `lesson-13.py` (modified)
- **Change type**: Add
- **Location**: Bottom of the file.
- **Dependencies**: None

### The New Code
```python
# Recursive Fibonacci (naive - exponential time)
def fib_rec(n):
    if n <= 1:
        return n
    return fib_rec(n - 1) + fib_rec(n - 2)

# Iterative Fibonacci (linear time)
def fib_iter(n):
    if n <= 1:
        return n
    a, b = 0, 1
    for _ in range(n - 1):
        a, b = b, a + b
    return b

print(fib_rec(10))   # 55
print(fib_iter(10))  # 55
print(fib_iter(100)) # 354224848179261915075 (instant)
# fib_rec(50) would take minutes
```

### The Updated Project
```python
43: print(flatten([1, 2, 3]))
44:
45: def fib_rec(n): # <- new
46:     if n <= 1: # <- new
47:         return n # <- new
48:     return fib_rec(n - 1) + fib_rec(n - 2) # <- new
49: 
50: def fib_iter(n): # <- new
51:     if n <= 1: # <- new
52:         return n # <- new
53:     a, b = 0, 1 # <- new
54:     for _ in range(n - 1): # <- new
55:         a, b = b, a + b # <- new
56:     return b # <- new
57: 
58: print(fib_rec(10)) # <- new
59: print(fib_iter(10)) # <- new
60: print(fib_iter(100)) # <- new
```
This introduces two implementations of the Fibonacci sequence—one naive recursive approach that branches infinitely, and one iterative loop that scales predictably.

### Mechanical walkthrough
- `def fib_rec(n):`: Defines the recursive Fibonacci function.
- `if n <= 1: return n`: The base case, handling 0 and 1.
- `return fib_rec(n - 1) + fib_rec(n - 2)`: The recursive case firing two distinct function calls on the same stack frame and adding their results together.
- `def fib_iter(n):`: Defines the iterative function.
- `a, b = 0, 1`: Initializes two variables simultaneously using tuple unpacking.
- `for _ in range(n - 1):`: Iterates exactly `n - 1` times. The `_` signifies a throwaway loop counter.
- `a, b = b, a + b`: Reassigns `a` and `b` simultaneously on each iteration.
- `return b`: Returns the final accumulated value.

### CS lens
Algorithmic Time Complexity is fundamentally highlighted here. `fib_rec` runs in O(2^n) exponential time because the call tree doubles at every level. `fib_iter` runs in O(n) linear time, iterating a flat number of times. Space complexity also differs: `fib_rec` uses O(n) stack space, while `fib_iter` uses O(1) constant space. Real-world applications of algorithm optimization affect everything from database indexing speed to video rendering times.

### SE lens
Design principle: Performance vs. Expressiveness. The recursive approach closely mirrors the mathematical definition of Fibonacci, making it highly expressive. However, the alternative chosen (iteration) avoids stack overflows and exponential redundant calculations, illustrating that production software must respect hardware constraints over pure elegance.

### Commands needed
`python3 lesson-13.py`

### Run it
```text
55
55
354224848179261915075
```
Trace `fib_iter(5)`: `a=0,b=1`. Iter1: `a=1,b=1`. Iter2: `a=1,b=2`. Iter3: `a=2,b=3`. Iter4: `a=3,b=5`. Return 5. 
`fib_rec(5)`: Tree of calls, 2^5 = 32 maximum branches versus 4 simple iterations.

### One sentence connecting to previous unit
We have fully explored recursion's structural brilliance and its performance pitfalls.

## Closing
### Connect the pieces
Let's trace `factorial(4)` through everything we've learned today. The function evaluates if `n == 0` (the base case) and proceeds to `n * factorial(n - 1)` (the recursive case). Each subsequent call pushes a new frame onto the call stack, moving closer to the base case while safely staying under Python's recursion limit. Our instrumented trace showed exactly how `factorial(0)` finally returns `1`, causing the stack to unwind, resolving all pending math operations until `24` pops out at the top. While iteration is faster for flat numerical series like Fibonacci, recursion reigns supreme for deep nested structures like parsing trees or flattening multidimensional arrays.
