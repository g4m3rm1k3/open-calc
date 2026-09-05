# Lesson 19: Closures and Decorators

What you will build: The reader understands closures (a function that captures variables from its enclosing scope) and decorators (`@` syntax, wrapping functions to add behavior). The transferable insight: a decorator is a function that takes a function and returns a new function. `@decorator` is just syntactic sugar for `func = decorator(func)`. This pattern enables cross-cutting concerns (logging, timing, caching, auth) to be added to any function without modifying it.

What you need to know first: Lessons 00-18.

## Terms used in this lesson

- **First-class function** — A function that can be treated like any other object (assigned to variables, passed as arguments, returned from other functions), because it is fundamentally just a value in memory, allowing functions to operate on functions.
- **Closure** — A function that remembers and has access to variables from its enclosing scope even after that outer scope has finished executing, because it captures those variables in a hidden data structure (`__closure__`), solving the problem of maintaining state without global variables or classes.
- **Enclosing scope** — The local namespace of an outer function that surrounds an inner function, because lexical scoping dictates that inner functions can read variables defined outside them.
- **Decorator** — A design pattern and syntax (`@`) for taking a function, wrapping it in another function to add behavior, and returning the new function, because it allows separating cross-cutting concerns (like timing or caching) from core business logic.
- **Syntactic sugar** — Syntax designed to make things easier to read or express, because `@decorator` is just a shorthand for `func = decorator(func)`, not a fundamentally new capability.
- **`*args` and `**kwargs`** — Syntax used in function definitions to accept an arbitrary number of positional and keyword arguments respectively, because a wrapper function must be able to accept whatever arguments the original function takes and forward them perfectly.

## Objects and methods used

**`type`**
- *What it is:* A built-in Python function that returns the type/class of an object.
- *Implementation:* `class type(object)`
- *Its use:* To prove that a function is actually an object of class `function`.
- *Type:* Built-in class/function.
- *Responsibility:* Returns the type of the given object.
- *Depends on:* An object passed as an argument.
- *Connects to:* Called by our script, prints the type.
- *Shape:* A fundamental inspection tool in Python's core.

**`str.upper`**
- *What it is:* A string method that returns a copy of the string with all characters uppercase.
- *Implementation:* `def upper(self) -> str`
- *Its use:* Passed as a function object to demonstrate first-class functions.
- *Type:* Instance method of the `str` class.
- *Responsibility:* Creates an uppercase version of a string.
- *Depends on:* The string object it is called on (or passed to it as `self`).
- *Connects to:* Passed into our `apply` function.
- *Shape:* A standard library string manipulation method.

**`time.perf_counter`**
- *What it is:* A function from the `time` module that returns a high-resolution time counter.
- *Implementation:* `def perf_counter() -> float`
- *Its use:* To measure the execution time of a wrapped function by taking a start and end timestamp.
- *Type:* Function in the `time` module.
- *Responsibility:* Provides a high-resolution clock for short-duration timing.
- *Depends on:* The system's underlying high-resolution clock.
- *Connects to:* Called before and after the original function in the decorator wrapper.
- *Shape:* A standard library timing utility.

**`sum`**
- *What it is:* A built-in function that sums an iterable.
- *Implementation:* `def sum(iterable, /, start=0) -> number`
- *Its use:* To create a slow mathematical operation we can time.
- *Type:* Built-in function.
- *Responsibility:* Computes the arithmetic sum of an iterable of numbers.
- *Depends on:* An iterable (like a range or list) of numbers.
- *Connects to:* Called inside `slow_sum`.
- *Shape:* A standard built-in reduction function.

**`range`**
- *What it is:* A built-in type that represents an immutable sequence of numbers.
- *Implementation:* `class range(stop)`
- *Its use:* To generate a large sequence of numbers for `sum` to process.
- *Type:* Built-in class/type.
- *Responsibility:* Generates a sequence of integers efficiently without storing them all in memory.
- *Depends on:* An integer `stop` value (and optional `start` and `step`).
- *Connects to:* Fed into the `sum` function.
- *Shape:* A standard built-in sequence generator.

**`functools.wraps`**
- *What it is:* A decorator from the `functools` module used for creating well-behaved decorators.
- *Implementation:* `def wraps(wrapped, assigned=..., updated=...)`
- *Its use:* Applied to the `wrapper` function inside a decorator to copy metadata from the original function.
- *Type:* Function/decorator in the `functools` module.
- *Responsibility:* Preserves the identity (like `__name__` and `__doc__`) of the original function when it is wrapped.
- *Depends on:* The original function being wrapped.
- *Connects to:* Decorates the inner `wrapper` function.
- *Shape:* A utility decorator provided by the standard library.

**`functools.lru_cache`**
- *What it is:* A standard library decorator that caches the return values of a function.
- *Implementation:* `def lru_cache(maxsize=128, typed=False)`
- *Its use:* To demonstrate a production-ready, built-in decorator for memoization.
- *Type:* Function/decorator in the `functools` module.
- *Responsibility:* Caches function results to avoid redundant computation (memoization).
- *Depends on:* The function it decorates and the arguments passed to that function (which must be hashable).
- *Connects to:* Wraps our recursive `fib2` function.
- *Shape:* A powerful performance optimization decorator in the standard library.

## Concept Unit: First-class functions

### The Problem

How do we write code that manipulates or extends the behavior of existing functions without copying their source code?
If a function is just an instruction set, can we pass it around like a variable?
What would happen if you tried to assign a function to a variable, without calling it?
Pause and imagine what `my_var = print` might do. How would you then use `my_var`?

### Introduce the concept in isolation

```python
def greet(name):
    return f'Hello, {name}!'

# Functions are objects:
print(type(greet))      
print(greet)            

# Assign to a variable:
say_hi = greet          
print(say_hi('Alice'))  

# Pass as argument:
def apply(func, value):
    return func(value)

print(apply(greet, 'Bob'))   
print(apply(str.upper, 'hello'))  
```

Predicted confidently:
```
<class 'function'>
<function greet at 0x...>
Hello, Alice!
Hello, Bob!
HELLO
```

This proves that functions are objects in Python, meaning they have a type (`<class 'function'>`) and can be assigned to variables, passed into other functions, and invoked through those variables. This is called a **first-class function**. 

### Discard the throwaway

This throwaway code is discarded and will not appear in the project again.

### Project Change

- **Reference Source**: No reference counterpart — this is a from-scratch addition because we are demonstrating Python's function objects.
- **Files affected**: `examples/functions.py` (created)
- **Change type**: add
- **Location**: Entire file.
- **Dependencies**: None.

### The New Code

```python
def apply(func, value):
    return func(value)
```

### The Updated Project

```python
1: def apply(func, value): # ← new
2:     return func(value)  # ← new
```

The file now defines a function `apply` that takes another function `func` and a `value`, and returns the result of calling `func` with `value`.

### Mechanical walkthrough

- `def apply(func, value):`: Defines a new function named `apply` that takes two parameters: `func` (expected to be a callable object) and `value`.
- `return func(value)`: Calls the `func` object passing `value` as its argument, and returns the result back to the caller.

### CS lens

First-class functions are a foundational concept in functional programming languages (like Lisp, Scheme, Haskell) and modern multi-paradigm languages (JavaScript, Python, Go). They allow for higher-order functions (functions that take or return other functions). Real-world applications include passing callback functions to event listeners in UI programming, providing sorting keys to sorting algorithms, passing map/filter operations to data processing pipelines, and structuring strategy patterns without needing heavy class hierarchies.

### SE lens

The design principle here is treating behavior as data. The alternative NOT chosen is passing strings or enums that tell a switch-statement which hardcoded behavior to run. The tradeoff is that passing functions directly is highly flexible and decoupled, but can make the code harder to trace statically because you don't always know exactly which function will be passed at runtime until it executes.

### Commands needed

None for this unit.

### Run it

Predicted confidently: nothing happens until `apply` is called.

### One sentence connecting to previous unit

Now that we know functions can be passed as arguments, we need to understand how functions behave when they are returned from other functions.

## Concept Unit: Closures

### The Problem

If a function is returned from another function, what happens to the local variables of the outer function once it finishes executing?
Normally, local variables are destroyed when a function returns. If an inner function needs them, how can it survive?
If you create two different inner functions from the same outer function, do they share variables or get their own?
Pause and sketch a function that returns another function. How would the inner one use a parameter from the outer one?

### Introduce the concept in isolation

```python
def make_multiplier(n):
    def inner(x):
        return x * n    
    return inner        

double = make_multiplier(2)
triple = make_multiplier(3)

print(double(5))   
print(triple(5))   
print(double(7))   

print(double.__closure__[0].cell_contents)  
print(triple.__closure__[0].cell_contents)  
```

Predicted confidently:
```
10
15
14
2
3
```

This proves that the inner function captures and remembers the variables from its enclosing scope (like `n`), even after the outer function `make_multiplier` has returned. Each instance gets its own independent snapshot of those variables. This is called a **closure**.

### Discard the throwaway

This throwaway code is discarded and will not appear in the project again.

### Project Change

- **Reference Source**: No reference counterpart — this is a from-scratch addition because we are explaining closures.
- **Files affected**: `examples/closures.py` (created)
- **Change type**: add
- **Location**: Entire file.
- **Dependencies**: None.

### The New Code

```python
def make_multiplier(n):
    def inner(x):
        return x * n
    return inner
```

### The Updated Project

```python
1: def make_multiplier(n):      # ← new
2:     def inner(x):            # ← new
3:         return x * n         # ← new
4:     return inner             # ← new
```

The file defines `make_multiplier`, a function factory that creates and returns new `inner` functions, each uniquely remembering its own `n` value.

### Mechanical walkthrough

- `def make_multiplier(n):`: Defines the outer function taking parameter `n`.
- `def inner(x):`: Defines an inner function taking parameter `x`.
- `return x * n`: Multiplies `x` by `n`. Because `n` is not defined in `inner`, Python looks at the enclosing scope (`make_multiplier`) and captures `n` in a closure.
- `return inner`: Returns the `inner` function object itself (without calling it).

### CS lens

A closure is a record storing a function together with an environment (a mapping associating each free variable of the function with the value or reference to which the name was bound when the closure was created). Real-world applications include state encapsulation (simulating private object fields), function currying/partial application, callback handlers in asynchronous code that need to remember request IDs, and decorator implementations.

### SE lens

The design principle is encapsulation of state without requiring a full class definition. The alternative NOT chosen is defining a class with an `__init__` method to store `n` and a `__call__` method to perform the multiplication. The real tradeoff is that closures are lightweight and concise for simple single-method state, but classes scale better when you need multiple methods or complex shared state manipulation.

### Commands needed

None for this unit.

### Run it

Predicted confidently: defining the function produces no output.

### One sentence connecting to previous unit

Since functions can be passed as objects and can capture state via closures, we can combine these ideas to create functions that wrap and modify other functions.

## Concept Unit: Writing a decorator manually

### The Problem

If we want to time how long several different functions take to run, how can we add timing code without copying and pasting `time.perf_counter()` into every single function?
How can we use first-class functions and closures to intercept a function call, do something before it, call it, and do something after?
If the wrapper function replaces the original, how does it handle the original function's arguments?
Pause and think: write a function `timer(func)` that returns a new function. What should that new function do?

### Introduce the concept in isolation

```python
import time

def timer(func):
    def wrapper(*args, **kwargs):
        start = time.perf_counter()
        result = func(*args, **kwargs)   
        end = time.perf_counter()
        print(f'{func.__name__} took {end-start:.6f}s')
        return result
    return wrapper

def slow_sum(n):
    return sum(range(n))

slow_sum = timer(slow_sum)
print(slow_sum(1_000_000))
```

Predicted confidently (time may vary):
```
slow_sum took 0.034521s
499999500000
```

This proves that we can write a function `timer` that takes `slow_sum`, creates a `wrapper` closure capturing `func`, and returns that `wrapper`. Assigning `slow_sum = timer(slow_sum)` completely replaces the original function with the wrapper, automatically adding timing logic. This pattern is called a **decorator**.

### Discard the throwaway

This throwaway code is discarded and will not appear in the project again.

### Project Change

- **Reference Source**: No reference counterpart — this is a from-scratch addition because we are teaching decorators manually.
- **Files affected**: `examples/manual_decorator.py` (created)
- **Change type**: add
- **Location**: Entire file.
- **Dependencies**: None.

### The New Code

```python
import time

def timer(func):
    def wrapper(*args, **kwargs):
        start = time.perf_counter()
        result = func(*args, **kwargs)
        end = time.perf_counter()
        print(f'{func.__name__} took {end-start:.6f}s')
        return result
    return wrapper
```

### The Updated Project

```python
1: import time                                         # ← new
2:                                                     # ← new
3: def timer(func):                                    # ← new
4:     def wrapper(*args, **kwargs):                   # ← new
5:         start = time.perf_counter()                 # ← new
6:         result = func(*args, **kwargs)              # ← new
7:         end = time.perf_counter()                   # ← new
8:         print(f'{func.__name__} took {end-start:.6f}s') # ← new
9:         return result                               # ← new
10:     return wrapper                                 # ← new
```

The file now defines a `timer` function that takes any function and returns a new `wrapper` function that times its execution.

### Mechanical walkthrough

- `import time`: Imports the time module.
- `def timer(func):`: Defines the outer function that takes a target `func` to be wrapped.
- `def wrapper(*args, **kwargs):`: Defines the inner closure. `*args` and `**kwargs` catch any positional or keyword arguments so this wrapper can wrap functions with any signature.
- `start = time.perf_counter()`: Records the high-resolution start time.
- `result = func(*args, **kwargs)`: Calls the original `func` (captured via closure) passing along all arguments, and stores the return value.
- `end = time.perf_counter()`: Records the end time.
- `print(f'{func.__name__} took {end-start:.6f}s')`: Prints the original function's name and elapsed time.
- `return result`: Returns the result from the original function call so the wrapper behaves exactly like the original.
- `return wrapper`: Returns the inner function object.

### CS lens

The decorator pattern is a structural design pattern that allows behavior to be added to an individual object, statically or dynamically, without affecting the behavior of other objects from the same class. Real-world applications include Aspect-Oriented Programming (AOP), adding authentication checks to web routes, adding logging/telemetry, and transaction management in database layers.

### SE lens

The design principle is the Open/Closed Principle and separation of concerns: the core function remains unchanged (closed for modification), while the new behavior is added from the outside (open for extension). The alternative NOT chosen is modifying the source code of `slow_sum` directly to add `perf_counter` calls. The real tradeoff is that decorators keep the core business logic clean, but they add layers of indirection that can make stack traces deeper and debugging slightly harder.

### Commands needed

None for this unit.

### Run it

Predicted confidently: defining the function produces no output.

### One sentence connecting to previous unit

Manually typing `slow_sum = timer(slow_sum)` works, but Python provides a built-in, cleaner syntax to do exactly the same thing.

## Concept Unit: The @ decorator syntax

### The Problem

Writing `my_func = decorator(my_func)` after every function definition is repetitive and detaches the wrapping from the definition itself.
How can we tell Python to apply the decorator immediately when the function is defined?
If we replace the original function with `wrapper`, what happens to metadata like the function's name (`__name__`) or docstring?
Pause and consider: what if you need to inspect the function later and it says its name is "wrapper"? How would you fix it?

### Introduce the concept in isolation

```python
import time
import functools

def timer(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        start = time.perf_counter()
        result = func(*args, **kwargs)
        elapsed = time.perf_counter() - start
        print(f'{func.__name__}({args}, {kwargs}) -> {elapsed:.4f}s')
        return result
    return wrapper

@timer               
def slow_sum(n):
    return sum(range(n))

@timer
def greet(name, greeting='Hello'):
    return f'{greeting}, {name}!'

print(slow_sum(100_000))
print(greet('Alice'))
```

Predicted confidently (time varies):
```
slow_sum((100000,), {}) -> 0.0031s
4999950000
greet(('Alice',), {}) -> 0.0000s
Hello, Alice!
```

This proves that placing `@timer` directly above the function definition automatically passes the function to `timer` and replaces it with the returned wrapper. `functools.wraps` copies the original function's name to the wrapper. The `@` syntax is called **syntactic sugar** for the decorator pattern.

### Discard the throwaway

This throwaway code is discarded and will not appear in the project again.

### Project Change

- **Reference Source**: No reference counterpart — this is a from-scratch addition to demonstrate decorator syntax.
- **Files affected**: `examples/sugar_decorator.py` (created)
- **Change type**: add
- **Location**: Entire file.
- **Dependencies**: None.

### The New Code

```python
@timer
def slow_sum(n):
    return sum(range(n))
```

### The Updated Project

```python
1: @timer                       # ← new
2: def slow_sum(n):             # ← new
3:     return sum(range(n))     # ← new
```

The file defines `slow_sum`, using the `@timer` syntax to automatically wrap it.

### Mechanical walkthrough

- `@timer`: Syntactic sugar placed on the line immediately preceding a function definition. At load time, Python evaluates `def slow_sum(n): ...`, creates the function object, then immediately calls `timer(slow_sum)`, and assigns the returned wrapper back to the name `slow_sum`.
- `def slow_sum(n):`: Defines the original function.
- `return sum(range(n))`: The body of the original function.

### CS lens

Syntactic sugar describes language features that do not add new functionality but make the language sweeter for humans to read and write. Real-world applications include `+=` instead of `x = x + 1`, list comprehensions instead of loops, `async`/`await` instead of manual promise chaining, and `@decorator` syntax in Python/TypeScript.

### SE lens

The design principle is readability and declarative programming. The alternative NOT chosen is leaving the manual `slow_sum = timer(slow_sum)` at the bottom of the file. The real tradeoff is that `@decorator` makes it immediately obvious to the reader that the function is wrapped, right where the function is declared, but it hides the explicit function call and reassignment, which can confuse beginners about what is actually happening at runtime.

### Commands needed

None for this unit.

### Run it

Predicted confidently: defining the function produces no output.

### One sentence connecting to previous unit

Now that we have the elegant `@` syntax, we can use decorators to solve complex performance problems transparently.

## Concept Unit: Practical decorators — memoize

### The Problem

If a function performs an expensive calculation (like recursive Fibonacci) and is called with the same arguments repeatedly, how can we avoid re-doing the work?
How can a decorator maintain state (like a dictionary of saved results) that persists across multiple calls to the wrapper?
Is there a built-in way to do this in Python?
Pause and think: write a `cache = {}` inside a decorator. When should the wrapper check the cache, and when should it call the original function?

### Introduce the concept in isolation

```python
import functools

def memoize(func):
    cache = {}   
    @functools.wraps(func)
    def wrapper(*args):
        if args not in cache:
            cache[args] = func(*args)
        return cache[args]
    return wrapper

@memoize
def fib(n):
    if n <= 1:
        return n
    return fib(n-1) + fib(n-2)

print(fib(50))  

from functools import lru_cache

@lru_cache(maxsize=None)
def fib2(n):
    if n <= 1:
        return n
    return fib2(n-1) + fib2(n-2)

print(fib2(100))  
```

Predicted confidently:
```
12586269025
354224848179261915075
```

This proves that the closure in `memoize` captures the `cache` dictionary. Because dictionaries are mutable, the `wrapper` can read and write to it across multiple calls. If the result is already in the cache, it returns instantly instead of recursing exponentially. This specific caching technique is called **memoization**.

### Discard the throwaway

This throwaway code is discarded and will not appear in the project again.

### Project Change

- **Reference Source**: No reference counterpart — this is a from-scratch addition because we are demonstrating memoization.
- **Files affected**: `examples/memoize.py` (created)
- **Change type**: add
- **Location**: Entire file.
- **Dependencies**: None.

### The New Code

```python
from functools import lru_cache

@lru_cache(maxsize=None)
def fib2(n):
    if n <= 1:
        return n
    return fib2(n-1) + fib2(n-2)
```

### The Updated Project

```python
1: from functools import lru_cache     # ← new
2:                                     # ← new
3: @lru_cache(maxsize=None)            # ← new
4: def fib2(n):                        # ← new
5:     if n <= 1:                      # ← new
6:         return n                    # ← new
7:     return fib2(n-1) + fib2(n-2)    # ← new
```

The file defines `fib2`, wrapped in Python's standard library `lru_cache` to automatically cache its recursive results.

### Mechanical walkthrough

- `from functools import lru_cache`: Imports the built-in decorator for caching.
- `@lru_cache(maxsize=None)`: Applies the decorator. `maxsize=None` tells it to cache an unlimited number of arguments. Note that `lru_cache` is a decorator factory (a function that returns a decorator), which is why it has `()`.
- `def fib2(n):`: Defines the recursive Fibonacci function.
- `if n <= 1: return n`: The base case for the recursion.
- `return fib2(n-1) + fib2(n-2)`: The recursive step.

### CS lens

Memoization is an optimization technique used primarily to speed up computer programs by storing the results of expensive function calls and returning the cached result when the same inputs occur again. Real-world applications include Dynamic Programming algorithms, rendering engines skipping UI repaints for unchanged components, database query result caching, and HTTP proxy caching.

### SE lens

The design principle is cross-cutting concerns and the single responsibility principle. The alternative NOT chosen is modifying `fib2` to manually pass a `cache` dictionary around in its arguments. The real tradeoff is that decorators keep the core math logic absolutely pure and readable, while caching is handled externally, but decorators can mask performance characteristics—a reader looking only at `fib2` without noticing the `@` might incorrectly assume it runs in exponential time.

### Commands needed

None for this unit.

### Run it

Predicted confidently: defining the function produces no output.

### One sentence connecting to previous unit

By layering closures and first-class functions together, decorators offer a powerful way to add capabilities like timing and caching with just one line of code.

## Closing

### Connect the pieces

Let's trace how the `@timer` decorator applies to `slow_sum` from start to finish, using all the concepts we learned:

1. **First-class functions**: When Python reads `def slow_sum(n):`, it creates a function object in memory. Because functions are first-class, this object can be passed around.
2. **The @ decorator syntax**: Python sees `@timer` above `slow_sum`. This is syntactic sugar. Instead of just assigning `slow_sum` to the new function object, Python immediately executes `timer(slow_sum)`.
3. **Closures**: Inside `timer`, a new `wrapper` function is defined. This `wrapper` needs access to the original `slow_sum` function, so it captures it in a closure. Even though `timer` finishes executing and returns, `wrapper` permanently remembers the original `slow_sum`.
4. **Returning the wrapper**: The `timer` function returns the `wrapper` function object.
5. **Reassignment**: Python takes the returned `wrapper` and assigns it to the name `slow_sum`. The original function object still exists in memory (inside the closure), but the name `slow_sum` now points to the wrapper.
6. **Execution**: When you call `slow_sum(100)`, you are actually calling `wrapper(100)`. The wrapper records the start time, uses its closure to call the original `func(100)`, records the end time, prints the duration, and returns the result. The caller receives the correct sum and never even realizes the function was wrapped.
