# Lesson 13: Recursion — The Function That Calls Itself

What you will build
In this lesson, you will build a suite of recursive algorithms in a new `recursion_lab.py` file to understand the mechanics of recursion. You will understand how a recursive function operates by identifying the base case and the recursive case, how the call stack grows and shrinks during execution, how execution traces work, and the key insight that a recursive function's structure naturally mirrors the structure of its data. The transferable problems solved here include preventing infinite recursion (`RecursionError`) by enforcing base cases, managing the overhead of the call stack, and traversing recursively structured data like nested lists and trees.

What you need to know first
- Lessons 0–12 (REPL, all types, variables, conditionals, iteration, functions, higher-order functions, comprehensions).

Terms used in this lesson
- **Recursion** — A programming technique where a function calls itself to solve a smaller instance of the same problem. It exists to break complex problems into simpler, self-similar sub-problems.
- **Base case** — The condition under which a recursive function returns a value without making a subsequent recursive call. It exists to stop the recursion and prevent an infinite loop.
- **Recursive case** — The condition under which a recursive function calls itself with a modified, simpler input. It exists to progress the problem one step closer to the base case.
- **Call stack** — A stack data structure that stores information about the active subroutines of a computer program. It exists to keep track of where each function should return its result.
- **Recursion depth** — The number of active, unresolved recursive calls on the call stack at any given time. It exists to measure the memory overhead of a recursive process.
- **Tree recursion** — A pattern where a function makes more than one recursive call within its body, branching out like a tree. It exists to solve problems that divide into multiple independent sub-problems.
- **Memoization** — A technique to speed up execution by storing the results of expensive function calls and returning the cached result when the same inputs occur again. Mentioned here as a concept for solving exponential time complexity in tree recursion.
- **Exponential time complexity (O(2^n))** — A growth rate where the time required doubles with each addition to the input size. It exists to describe the performance characteristics of naive tree recursion.
- **Call tree** — A diagrammatic representation of the recursive calls made by a function. It exists to visualize the branching factor and total number of calls in tree recursion.

Objects and methods used
- **`sys.getrecursionlimit()`**
  - *What it is:* A built-in function in the `sys` module that retrieves the maximum recursion depth allowed by the Python interpreter.
  - *Implementation:* `def getrecursionlimit() -> int:`
  - *Its use:* Used to demonstrate why infinite recursion raises an error instead of crashing the operating system.
  - *Type:* Free function in the `sys` module.
  - *Responsibility:* Returns the current limit on the depth of the Python interpreter stack.
  - *Depends on:* Nothing (takes no arguments).
  - *Connects to:* Called by the user, returns an `int` to the caller.
  - *Shape:* A diagnostic utility in the standard library.

- **`RecursionError`**
  - *What it is:* A built-in Python exception raised when the maximum recursion depth has been exceeded.
  - *Implementation:* `class RecursionError(RuntimeError): ...`
  - *Its use:* Encountered when demonstrating what happens if a recursive function lacks a base case.
  - *Type:* Built-in exception class.
  - *Responsibility:* Signals that the call stack has grown beyond the interpreter's safety limit.
  - *Depends on:* Raised by the Python runtime environment.
  - *Connects to:* Handled by `except RecursionError` or halts the program.
  - *Shape:* An error boundary in the Python runtime.

- **`len(s)`**
  - *What it is:* A built-in function that returns the number of items in an object.
  - *Implementation:* `def len(obj: Sized) -> int:`
  - *Its use:* Used to check if a list is empty (`len(lst) == 0`) as a base case for list recursion.
  - *Type:* Built-in function.
  - *Responsibility:* Returns the length (the number of items) of an object.
  - *Depends on:* An object that implements `__len__`, such as a list.
  - *Connects to:* Called by the user, returns an `int`.
  - *Shape:* A standard library built-in.

- **`isinstance(obj, class_or_tuple)`**
  - *What it is:* A built-in function that checks if an object is an instance or subclass of a class.
  - *Implementation:* `def isinstance(obj: object, class_or_tuple: type | tuple) -> bool:`
  - *Its use:* Used to determine if an item within a nested list is itself a list, deciding whether to recurse or hit the base case.
  - *Type:* Built-in function.
  - *Responsibility:* Evaluates type membership at runtime.
  - *Depends on:* An object to check, and a type to check against.
  - *Connects to:* Called by the user, returns a `bool`.
  - *Shape:* A standard library built-in.

- **`list.extend(iterable)`**
  - *What it is:* A list method that appends items from an iterable to the end of the list.
  - *Implementation:* `def extend(self, iterable: Iterable) -> None:`
  - *Its use:* Used to unpack the results of a recursive call back into the flattened result list.
  - *Type:* Instance method on the `list` class.
  - *Responsibility:* Mutates the list in-place by adding all elements from the provided iterable.
  - *Depends on:* A list instance and an iterable object.
  - *Connects to:* Called on a list, consumes an iterable, returns `None`.
  - *Shape:* A standard collection mutation method.

- **`list.append(object)`**
  - *What it is:* A list method that adds a single item to the end of the list.
  - *Implementation:* `def append(self, object: Any) -> None:`
  - *Its use:* Used to add a non-list item to the flattened result list in the base case.
  - *Type:* Instance method on the `list` class.
  - *Responsibility:* Mutates the list in-place by appending one object.
  - *Depends on:* A list instance and a single object.
  - *Connects to:* Called on a list, consumes an object, returns `None`.
  - *Shape:* A standard collection mutation method.

## Concept Unit: The structure of a recursive function

### The Problem
Mathematical definitions are often defined in terms of themselves. The factorial of a number `n` (written as `n!`) is `n` multiplied by the factorial of `n - 1`, with the special rule that `0!` is `1`. How do we express a function that calls itself to compute a result, without getting stuck in an infinite loop?

### Introduce the concept in isolation
We will define a small throwaway function that calls itself, just to see it work. 

```python
def countdown(n):
    if n == 0:
        print("Done!")
    else:
        print(n)
        countdown(n - 1)

countdown(3)
```

Output:
```
3
2
1
Done!
```

This output proves that a function can invoke its own name (`countdown` calls `countdown`). The recursion stops because the input gets smaller each time (`n - 1`), eventually hitting the condition `n == 0`. This technique is called **recursion**.

### Discard the throwaway example
The `countdown` function is deleted. It existed only to prove that functions can call themselves, and will not be used in our project.

### Project Change
- **Reference Source:** No reference counterpart — this is a from-scratch addition.
- **Files affected:** `recursion_lab.py` (created).
- **Change type:** Add.
- **Location:** At the top of the file.
- **Dependencies:** None.

### The New Code — type it yourself
```python
def factorial(n):
    if n == 0:          # base case
        return 1
    else:               # recursive case
        return n * factorial(n - 1)

print(factorial(5))
print(factorial(0))
print(factorial(1))
```

### The Updated Project
```python
# recursion_lab.py
def factorial(n):               # ← new
    if n == 0:                  # ← new
        return 1                # ← new
    else:                       # ← new
        return n * factorial(n - 1) # ← new

print(factorial(5))             # ← new
print(factorial(0))             # ← new
print(factorial(1))             # ← new
```
This new file defines the `factorial` function and tests it with a few inputs. It prints `120`, `1`, and `1`.

### Mechanical walkthrough
- `def factorial(n):` defines a function named `factorial` that takes one argument, `n`.
- `if n == 0:` checks if `n` is exactly zero. This is the **base case**. A **base case** is the condition under which a recursive function returns a value without making a subsequent recursive call. It exists to stop the recursion.
- `return 1` is executed if `n == 0`. It returns `1` immediately, stopping the function.
- `else:` begins the block that executes if `n` is not zero. This is the **recursive case**. A **recursive case** is the condition under which a recursive function calls itself with a modified, simpler input. It exists to progress the problem one step closer to the base case.
- `return n * factorial(n - 1)` computes the result by multiplying `n` by the result of calling `factorial(n - 1)`. The function invokes itself with a smaller input.

Execution trace for `factorial(4)`:
- `factorial(4)`: 4 != 0, returns `4 * factorial(3)`
- `factorial(3)`: 3 != 0, returns `3 * factorial(2)`
- `factorial(2)`: 2 != 0, returns `2 * factorial(1)`
- `factorial(1)`: 1 != 0, returns `1 * factorial(0)`
- `factorial(0)`: 0 == 0, returns `1` (BASE CASE)
- Unwind: `1 -> 1*1=1 -> 2*1=2 -> 3*2=6 -> 4*6=24`. 
Every recursive function has these two parts. The base case stops it, and the recursive case breaks it down.

## Concept Unit: What happens without a base case — RecursionError

### The Problem
If a recursive function calls itself to solve a smaller problem, what happens if we forget to tell it when to stop? Does the program freeze forever, or does Python step in?

### Introduce the concept in isolation
Let's deliberately write a throwaway recursive function that never stops.

```python
import sys

def infinite_loop(n):
    return infinite_loop(n + 1)

print(sys.getrecursionlimit())
try:
    infinite_loop(0)
except RecursionError as e:
    print(f"RecursionError: {e}")
```

Output:
```
1000
RecursionError: maximum recursion depth exceeded
```

This output proves two things. First, Python limits the maximum recursion depth (default is typically 1000, shown by `sys.getrecursionlimit()`). Second, if a recursive function never hits a base case, it hits this limit and raises a **`RecursionError`**.

### Discard the throwaway example
The `infinite_loop` code is deleted. It existed only to prove what happens during runaway recursion and will not remain in the project.

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** `recursion_lab.py` (modified).
- **Change type:** Add.
- **Location:** Appended to the bottom of the file.
- **Dependencies:** None.

### The New Code — type it yourself
```python
def bad_factorial(n):
    return n * bad_factorial(n - 1)  # no base case!

try:
    bad_factorial(5)
except Exception as e:
    print(f"{type(e).__name__}: {e}")
```

### The Updated Project
```python
# recursion_lab.py
def factorial(n):
    if n == 0:
        return 1
    else:
        return n * factorial(n - 1)

print(factorial(5))
print(factorial(0))
print(factorial(1))

def bad_factorial(n):                # ← new
    return n * bad_factorial(n - 1)  # ← new

try:                                 # ← new
    bad_factorial(5)                 # ← new
except Exception as e:               # ← new
    print(f"{type(e).__name__}: {e}") # ← new
```
This adds `bad_factorial`, a broken version of factorial, and catches the resulting error to prevent crashing the script. It prints `RecursionError: maximum recursion depth exceeded`.

### Mechanical walkthrough
- `def bad_factorial(n):` defines a new function.
- `return n * bad_factorial(n - 1)` calls itself with `n - 1`. However, there is no `if` statement to check for a base case.
- `bad_factorial(5)` initiates the call. It asks for `bad_factorial(4)`, which asks for `3`, then `2`, then `1`, then `0`, then `-1`, `-2`, and so on indefinitely.
- Because the function never returns a concrete value without calling itself, Python's call stack fills up.
- A **`RecursionError`** is raised. A **`RecursionError`** is a built-in Python exception raised when the maximum recursion depth has been exceeded. It exists to signal that the call stack has grown beyond the interpreter's safety limit. This is the recursive equivalent of an infinite loop.

## Concept Unit: The call stack for recursive calls

### The Problem
When `factorial(3)` calls `factorial(2)`, the computer cannot forget that it still needs to multiply the result by `3` before returning. How does the computer remember all the partially completed function calls that are waiting for answers?

### Introduce the concept in isolation
We will use a throwaway function that prints a message before and after its recursive call to reveal what is waiting in memory.

```python
def inspect_stack(n):
    if n == 0:
        print("  Reached base case 0")
        return
    print(f"Pausing {n}, calling {n-1}")
    inspect_stack(n - 1)
    print(f"Resuming and finishing {n}")

inspect_stack(3)
```

Output:
```
Pausing 3, calling 2
Pausing 2, calling 1
Pausing 1, calling 0
  Reached base case 0
Resuming and finishing 1
Resuming and finishing 2
Resuming and finishing 3
```

This output proves that the function calls are "paused" in memory. The last function to be paused (`1`) is the first one to resume after the base case is reached. This Last-In-First-Out memory structure is called the **call stack**.

### Discard the throwaway example
The `inspect_stack` function is deleted. It existed only to reveal how paused functions resolve in reverse order, and will not remain in the project.

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** None (this unit provides an execution diagram to be read, no code added).
- **Change type:** Concept explanation.
- **Location:** None.
- **Dependencies:** None.

### The New Code — type it yourself
*(No code added. Review the stack diagram below.)*

```text
Call stack at deepest point:
[factorial(0)] <- top (currently executing)
[factorial(1)] <- waiting for factorial(0)
[factorial(2)] <- waiting for factorial(1)
[factorial(3)] <- waiting for factorial(2)
[main]         <- bottom
```

### The Updated Project
*(No changes to `recursion_lab.py`.)*

### Mechanical walkthrough
- The **call stack** is a stack data structure that stores information about the active subroutines of a computer program. It exists to keep track of where each function should return its result.
- Each time a recursive call is made (e.g., `factorial(3)` calls `factorial(2)`), a new "frame" is pushed onto the top of the stack.
- The **recursion depth** is the number of active, unresolved recursive calls on the call stack at any given time. It exists to measure the memory overhead of a recursive process. For `factorial(3)`, the depth reaches 4 (including the base case call).
- When `factorial(0)` returns `1`, its frame is popped off the stack. Then `factorial(1)` resumes, completes its multiplication, and is popped, and so on.
- The maximum stack depth equals the recursion depth. For `factorial(1000)`, this requires 1000 frames — which is exactly why Python's default limit (from `sys.getrecursionlimit()`) is ~1000, to prevent the stack from consuming all available RAM.

## Concept Unit: Fibonacci — tree recursion

### The Problem
Sometimes a problem requires a function to invoke itself more than once to find the answer. The Fibonacci sequence (0, 1, 1, 2, 3, 5, 8...) defines each number as the sum of the two preceding ones. How do we model a recursion that branches in two directions at once?

### Introduce the concept in isolation
We will write a throwaway function that makes two recursive calls and prints whenever it is executed.

```python
def double_call(n):
    if n <= 0:
        return
    print(f"Processing {n}")
    double_call(n - 1)
    double_call(n - 1)

double_call(2)
```

Output:
```
Processing 2
Processing 1
Processing 1
```

This output proves that a single call to `double_call(2)` branches out and results in `double_call(1)` being executed twice. This pattern of branching recursive calls is called **tree recursion**.

### Discard the throwaway example
The `double_call` function is deleted. It existed only to prove branching execution and will not remain in the project.

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** `recursion_lab.py` (modified).
- **Change type:** Add.
- **Location:** Appended to the bottom of the file.
- **Dependencies:** None.

### The New Code — type it yourself
```python
def fib(n):
    if n <= 1:
        return n
    return fib(n-1) + fib(n-2)

print(fib(0))
print(fib(1))
print(fib(10))
print(fib(30))
```

### The Updated Project
```python
# recursion_lab.py
# ... previous code unchanged ...

def fib(n):                     # ← new
    if n <= 1:                  # ← new
        return n                # ← new
    return fib(n-1) + fib(n-2)  # ← new

print(fib(0))                   # ← new
print(fib(1))                   # ← new
print(fib(10))                  # ← new
print(fib(30))                  # ← new
```
This adds the `fib` function and tests it. The output will print `0`, `1`, `55`, and `832040`. You will notice that `fib(30)` takes noticeably longer to compute than the others.

### Mechanical walkthrough
- `def fib(n):` defines the function.
- `if n <= 1: return n` is the **base case**. For 0, it returns 0. For 1, it returns 1.
- `return fib(n-1) + fib(n-2)` is the **recursive case**. It performs **tree recursion**. **Tree recursion** is a pattern where a function makes more than one recursive call within its body, branching out like a tree. It exists to solve problems that divide into multiple independent sub-problems.
- A **call tree** for `fib(4)` visualizes this branching:
```text
            fib(4)
           /      \
       fib(3)    fib(2)
       /    \    /    \
   fib(2) fib(1) fib(1) fib(0)
   /    \
 fib(1) fib(0)
```
- A **call tree** is a diagrammatic representation of the recursive calls made by a function. It exists to visualize the branching factor and total number of calls in tree recursion.
- As seen in the tree, `fib(2)` is computed entirely from scratch twice. `fib(1)` is computed three times.
- This creates **exponential time complexity (O(2^n))**. **Exponential time complexity (O(2^n))** is a growth rate where the time required doubles with each addition to the input size. It exists to describe the performance characteristics of naive tree recursion.
- To fix this slowness for large numbers (like `fib(30)`), programmers use **memoization** (taught in Lesson 34) or write an iterative version using loops. **Memoization** is a technique to speed up execution by storing the results of expensive function calls.

## Concept Unit: Recursion on lists — the structure mirrors the data

### The Problem
Recursion is not just for math. If we have a list of numbers, how can we use recursion to sum them, rather than using a `for` loop?

### Introduce the concept in isolation
We will write a throwaway function that uses recursion to print every element in a list by looking at the first element and then passing the rest of the list to itself.

```python
def print_list(lst):
    if len(lst) == 0:
        return
    print(lst[0])
    print_list(lst[1:])

print_list(['a', 'b', 'c'])
```

Output:
```
a
b
c
```

This output proves that a list can be recursively broken down by separating the first item (`lst[0]`) from the rest of the list (`lst[1:]`). This mirrors the recursive structure of the list itself.

### Discard the throwaway example
The `print_list` function is deleted. It existed only to prove recursive list traversal and will not remain in the project.

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** `recursion_lab.py` (modified).
- **Change type:** Add.
- **Location:** Appended to the bottom of the file.
- **Dependencies:** None.

### The New Code — type it yourself
```python
def my_sum(lst):
    if len(lst) == 0:      # base case: empty list
        return 0
    return lst[0] + my_sum(lst[1:])  # recursive case

print(my_sum([1, 2, 3, 4]))
print(my_sum([]))
```

### The Updated Project
```python
# recursion_lab.py
# ... previous code unchanged ...

def my_sum(lst):                         # ← new
    if len(lst) == 0:                    # ← new
        return 0                         # ← new
    return lst[0] + my_sum(lst[1:])      # ← new

print(my_sum([1, 2, 3, 4]))              # ← new
print(my_sum([]))                        # ← new
```
This adds the `my_sum` function, which prints `10` and `0`.

### Mechanical walkthrough
- `def my_sum(lst):` defines the function.
- `if len(lst) == 0:` is the **base case**. `len(s)` is a built-in function that returns the number of items in an object. It exists to evaluate the size of collections. If the list is empty, it returns `0`.
- `return lst[0] + my_sum(lst[1:])` is the **recursive case**. The list `[1, 2, 3]` has a structure: a head (`1`) and a tail (`[2, 3]`). The function mirrors this data structure: it handles the head (`lst[0]`), and recurses on the tail (`lst[1:]`).
- Full trace for `my_sum([1, 2, 3])`:
  - `my_sum([1, 2, 3])`: returns `1 + my_sum([2, 3])`
  - `my_sum([2, 3])`: returns `2 + my_sum([3])`
  - `my_sum([3])`: returns `3 + my_sum([])`
  - `my_sum([])`: returns `0` (base case)
  - Unwind: `0 -> 3 -> 5 -> 6`.
- The insight here is identical to the First Commandment from *The Little Schemer*: when working with lists, ask two questions — is it empty? (base case), or what do I do with the first element and the rest? (recursive case).

## Concept Unit: Flattening a nested list — recursion on recursive data

### The Problem
A standard loop can easily iterate over `[1, 2, 3]`. But what if a list contains other lists, which contain other lists: `[1, [2, 3], [4, [5, 6]], 7]`? Because the nesting depth is unknown, a simple `for` loop isn't enough. How can we write a function to handle arbitrarily deep lists?

### Introduce the concept in isolation
We will write a throwaway code snippet to test how Python can distinguish a regular item from a nested list.

```python
item1 = 5
item2 = [6, 7]

print(isinstance(item1, list))
print(isinstance(item2, list))
```

Output:
```
False
True
```

This output proves that `isinstance(obj, type)` can correctly identify when an element is a sub-list. This check is necessary to know when we need to dive deeper into a nested list.

### Discard the throwaway example
The `isinstance` check is deleted. It existed only to prove type checking behavior.

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** `recursion_lab.py` (modified).
- **Change type:** Add.
- **Location:** Appended to the bottom of the file.
- **Dependencies:** None.

### The New Code — type it yourself
```python
def flatten(lst):
    result = []
    for item in lst:
        if isinstance(item, list):
            result.extend(flatten(item))  # recurse on nested list
        else:
            result.append(item)           # base case: not a list
    return result

print(flatten([1, [2, 3], [4, [5, 6]], 7]))
```

### The Updated Project
```python
# recursion_lab.py
# ... previous code unchanged ...

def flatten(lst):                                    # ← new
    result = []                                      # ← new
    for item in lst:                                 # ← new
        if isinstance(item, list):                   # ← new
            result.extend(flatten(item))             # ← new
        else:                                        # ← new
            result.append(item)                      # ← new
    return result                                    # ← new

print(flatten([1, [2, 3], [4, [5, 6]], 7]))          # ← new
```
This adds the `flatten` function, which prints `[1, 2, 3, 4, 5, 6, 7]`.

### Mechanical walkthrough
- `def flatten(lst):` defines the function.
- `result = []` creates a new, empty list to accumulate values.
- `for item in lst:` iterates through each element at the current level of the list.
- `if isinstance(item, list):` checks if the current `item` is a list. **`isinstance(obj, class_or_tuple)`** is a built-in function that checks if an object is an instance or subclass of a class. It evaluates type membership at runtime.
- `result.extend(flatten(item))` is the **recursive case**. Because the data is recursive (lists containing lists), the function is recursive. It calls `flatten` on the inner list, and then uses `list.extend(iterable)`. **`list.extend(iterable)`** is a list method that appends items from an iterable to the end of the list. It adds all the items from the flattened sub-list into our `result`.
- `else:` defines the **base case** for an individual item. The recursion stops branching downwards because the item is a normal value, not a list.
- `result.append(item)` is executed. **`list.append(object)`** is a list method that adds a single item to the end of the list.
- `return result` returns the accumulated list back to the previous caller. The structure of the data directly dictates the structure of the solution.

## Concept Unit: The Tower of Hanoi

### The Problem
The Tower of Hanoi is a mathematical puzzle where three pegs exist, and rings of decreasing size are stacked on the first peg. The goal is to move the entire stack to the last peg, moving one disk at a time, never placing a larger disk on a smaller one. Solving this puzzle with iterative loops is notoriously complex. Can recursion make it elegant?

### Introduce the concept in isolation
We will write a small throwaway function that uses string formatting to print a single move command, showing how pegs can be designated.

```python
def single_move(disk, start, end):
    print(f"Move disk {disk} from {start} to {end}")

single_move(1, 'A', 'C')
```

Output:
```
Move disk 1 from A to C
```

This output proves we can issue commands by passing string identifiers for our pegs. We will use this to build our complete solution.

### Discard the throwaway example
The `single_move` function is deleted. It existed only to prove string formatting for moves.

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** `recursion_lab.py` (modified).
- **Change type:** Add.
- **Location:** Appended to the bottom of the file.
- **Dependencies:** None.

### The New Code — type it yourself
```python
def hanoi(n, source, target, aux):
    if n == 1:
        print(f'Move disk 1 from {source} to {target}')
        return
    hanoi(n-1, source, aux, target)   # move n-1 disks to aux
    print(f'Move disk {n} from {source} to {target}')
    hanoi(n-1, aux, target, source)   # move n-1 disks from aux to target

hanoi(3, 'A', 'C', 'B')
```

### The Updated Project
```python
# recursion_lab.py
# ... previous code unchanged ...

def hanoi(n, source, target, aux):                    # ← new
    if n == 1:                                        # ← new
        print(f'Move disk 1 from {source} to {target}') # ← new
        return                                        # ← new
    hanoi(n-1, source, aux, target)                   # ← new
    print(f'Move disk {n} from {source} to {target}') # ← new
    hanoi(n-1, aux, target, source)                   # ← new

hanoi(3, 'A', 'C', 'B')                               # ← new
```
This adds the `hanoi` solver. The output perfectly executes the 7 moves needed to solve the puzzle for 3 disks:
```text
Move disk 1 from A to C
Move disk 2 from A to B
Move disk 1 from C to B
Move disk 3 from A to C
Move disk 1 from B to A
Move disk 2 from B to C
Move disk 1 from A to C
```

### Mechanical walkthrough
- `def hanoi(n, source, target, aux):` takes the number of disks `n`, the starting peg `source`, the destination peg `target`, and the spare peg `aux`.
- `if n == 1:` is the **base case**. If there is only one disk to move, it can simply be moved directly to the target peg.
- `print(f'Move disk 1 from {source} to {target}')` issues the command.
- `return` stops the execution of this frame.
- `hanoi(n-1, source, aux, target)` is the first **recursive case**. To move `n` disks to the target, the algorithm logically states: "First, move the entire stack of `n-1` disks sitting on top out of the way, placing them on the auxiliary peg."
- `print(f'Move disk {n} from {source} to {target}')` moves the single largest disk from the bottom of the source peg to the empty target peg.
- `hanoi(n-1, aux, target, source)` is the second **recursive case**. Now that the largest disk is at the target, the algorithm states: "Move the `n-1` disks from the auxiliary peg onto the target peg, on top of the largest disk."
- The Hanoi problem has a recursive solution that is almost impossible to derive iteratively, but beautifully simple recursively. Solving for `n=3` takes 7 moves; the total number of moves scales as `2^n - 1`.

---

Recursion is not just a technique — it is a way of thinking about problems by breaking them into a smaller version of themselves. Module 1 is complete. Lesson 14 wraps up Module 1 with modules and packages, then Module 2 begins. 

**Exercises:** 
1. Write `power(base, exp)` recursively without using `**`.
2. Write `count(lst, item)` that counts occurrences of an item in a list recursively.
3. Write `binary_to_decimal(s)` that converts a binary string to a decimal integer recursively.
