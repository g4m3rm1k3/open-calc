# Lesson 19: Closures and Decorators — Functions That Wrap Functions

What you will build: The reader will understand closures (functions that capture variables from their enclosing scope), write decorators manually, and use the `@decorator` syntax for timing, logging, and memoization. The transferable problems: (1) a closure is a function that remembers the environment in which it was created — it carries its captured variables with it; (2) a decorator is a higher-order function that takes a function and returns a modified version of it — `@decorator` is syntactic sugar for `f = decorator(f)`; (3) `functools.wraps` preserves the wrapped function's metadata so `help()` and introspection still work.

What you need to know first: Lessons 0–18.

**Terms used in this lesson**
- **Closure** — A function that remembers the environment in which it was created. It carries its captured variables with it, solving the problem of maintaining state across function calls without using global variables or object-oriented classes.
- **Decorator** — A higher-order function that takes a function and returns a modified version of it. It solves the problem of extending or altering the behavior of existing functions without modifying their source code directly.
- **Syntactic sugar** — Syntax within a programming language that is designed to make things easier to read or to express. It does not add new functionality but provides a more convenient way to write existing functionality.
- **Scope** — The region of a program where a particular variable name is valid and can be accessed. It solves the problem of naming collisions by keeping variables isolated to specific contexts.
- **Variable** — A named storage location in a program's memory. It solves the problem of needing to store, update, and retrieve data dynamically during execution.
- **Function** — A reusable block of code that takes inputs, performs a computation, and returns an output. It solves the problem of code duplication.
- **`@` (Decorator Syntax)** — Syntactic sugar in Python for applying a decorator. It solves the problem of making function wrapping readable by placing the transformation directly above the function definition.
- **`!r` (Format specifier)** — Syntactic sugar in f-strings to call `repr()` on the value instead of `str()`. It solves the problem of needing to clearly distinguish types like strings (which gain quotes) in formatted output.

**Objects and methods used**

- **`nonlocal`**
  - *What it is:* A keyword used in nested functions to declare that a variable refers to a previously bound variable in the closest enclosing scope.
  - *Implementation:* `nonlocal variable_name`
  - *Its use:* To allow an inner function to reassign a variable defined in an outer function's scope.
  - *Type:* Language keyword.
  - *Responsibility:* Binds a local variable name to a variable in an enclosing non-global scope, allowing reassignment.
  - *Depends on:* An existing variable in an enclosing scope.
  - *Connects to:* Modifies the state of variables in outer functions.
  - *Shape:* Internal implementation detail within nested functions.

- **`functools.wraps`**
  - *What it is:* A decorator from the standard library used when writing other decorators.
  - *Implementation:* `@functools.wraps(wrapped_function)`
  - *Its use:* To preserve the metadata (like `__name__` and `__doc__`) of the original function being decorated.
  - *Type:* Function decorator.
  - *Responsibility:* Copies attributes from the wrapped function to the wrapper function.
  - *Depends on:* The original function being decorated.
  - *Connects to:* Updates the metadata of the returned wrapper function.
  - *Shape:* A decorator applied to the inner wrapper function within a decorator factory.

- **`time.time`**
  - *What it is:* A standard library function that returns the current time.
  - *Implementation:* `time.time() -> float`
  - *Its use:* To record start and end times for measuring execution duration.
  - *Type:* Free function in the `time` module.
  - *Responsibility:* Provides the current time in seconds since the Epoch.
  - *Depends on:* The system clock.
  - *Connects to:* Used by profiling and timing code.
  - *Shape:* A standard library utility function.

- **`functools.lru_cache`**
  - *What it is:* A standard library decorator for memoization.
  - *Implementation:* `@functools.lru_cache(maxsize=None)`
  - *Its use:* To cache the results of expensive function calls based on their arguments.
  - *Type:* Function decorator factory.
  - *Responsibility:* Caches function return values to avoid redundant computations.
  - *Depends on:* A target function whose arguments are hashable.
  - *Connects to:* Intercepts function calls and returns cached values when possible.
  - *Shape:* A public API surface for performance optimization.

- **Everything else in the file, not this lesson's subject but still explained:**

- **`sum`**
  - *What it is:* A built-in function that adds the items of an iterable.
  - *Implementation:* `sum(iterable, start=0) -> number`
  - *Its use:* Used in our example to create a slow-running computation.
  - *Type:* Built-in function.
  - *Responsibility:* Calculates the sum of a sequence of numbers.
  - *Depends on:* An iterable containing numbers.
  - *Connects to:* Returns the aggregated sum.
  - *Shape:* Utility function.

- **`range`**
  - *What it is:* A built-in type that represents an immutable sequence of numbers.
  - *Implementation:* `range(stop) -> range object`
  - *Its use:* Generates a large sequence of numbers for our timing example.
  - *Type:* Built-in class.
  - *Responsibility:* Yields sequential integers efficiently.
  - *Depends on:* Integer bounds.
  - *Connects to:* Often used as an iterable in loops or functions like `sum`.
  - *Shape:* Utility sequence generator.

- **`str`**
  - *What it is:* A built-in type representing a text string.
  - *Implementation:* `str(object) -> string`
  - *Its use:* Converts results to strings for manipulation.
  - *Type:* Built-in class.
  - *Responsibility:* Represents and converts objects to human-readable string formats.
  - *Depends on:* Any object.
  - *Connects to:* Used for output formatting.
  - *Shape:* Core data type.

- **`repr`**
  - *What it is:* A built-in function that returns a printable representation of an object.
  - *Implementation:* `repr(object) -> string`
  - *Its use:* Used to format arguments safely for logging.
  - *Type:* Built-in function.
  - *Responsibility:* Provides a string representation of an object, ideally one that could recreate the object.
  - *Depends on:* Any object.
  - *Connects to:* Diagnostic output and logging.
  - *Shape:* Utility function.

- **`filter`**
  - *What it is:* A built-in function that constructs an iterator from elements of an iterable for which a function returns true.
  - *Implementation:* `filter(function or None, iterable) -> filter object`
  - *Its use:* Used to filter out empty strings when constructing log messages.
  - *Type:* Built-in class.
  - *Responsibility:* Filters elements of a sequence based on a condition.
  - *Depends on:* A filtering condition (or `None` for truthy values) and an iterable.
  - *Connects to:* Feeds filtered data to other functions like `join`.
  - *Shape:* Utility sequence processor.

- **`str.join`**
  - *What it is:* A string method that concatenates strings from an iterable.
  - *Implementation:* `separator.join(iterable) -> string`
  - *Its use:* Combines lists of string arguments into a single comma-separated string.
  - *Type:* Instance method of `str`.
  - *Responsibility:* Joins multiple strings using the calling string as a separator.
  - *Depends on:* An iterable of strings.
  - *Connects to:* Produces composite string outputs.
  - *Shape:* String manipulation utility.

- **`str.upper`**
  - *What it is:* A string method that returns a copy of the string converted to uppercase.
  - *Implementation:* `string.upper() -> string`
  - *Its use:* Used in our manual decorator example to modify a function's string output.
  - *Type:* Instance method of `str`.
  - *Responsibility:* Converts all lowercase characters in a string to uppercase.
  - *Depends on:* The calling string instance.
  - *Connects to:* Returns a new transformed string.
  - *Shape:* String manipulation utility.

---

## Concept Unit: Closures — functions that remember their environment

### The Problem

If we want to keep track of how many times a function has been called, we might normally use a global variable. But global variables can be modified by any part of the program, leading to unpredictable behavior. How can we give a function its own private, persistent state without creating a whole class just to hold one counter?

### Introduce the concept in isolation

```python
def make_counter():
    count = 0
    def counter():
        nonlocal count
        count += 1
        return count
    return counter

c1 = make_counter()
c2 = make_counter()
print(c1())
print(c1())
print(c1())
print(c2())
print(c1())
```
**Output:**
```
1
2
3
1
4
```
This demonstrates a **closure**. Each time we call `make_counter()`, it creates a new scope with its own `count` variable. The inner function `counter` is returned, and it *closes over* (remembers) that specific `count` variable. The `nonlocal` keyword allows the inner function to reassign the `count` variable from the outer scope.

### Discard the throwaway example

This specific counter example is a throwaway demonstration of closures and is discarded. It will not appear in the project again.

### Project Change

No reference counterpart — this is a from-scratch addition to demonstrate closures, as this lesson focuses on isolated concept mastery rather than an ongoing project build.

### The New Code

```python
def make_counter():
    count = 0
    def counter():
        nonlocal count
        count += 1
        return count
    return counter
```

### The Updated Project

```python
# 1: def make_counter():
# 2:     count = 0
# 3:     def counter():
# 4:         nonlocal count
# 5:         count += 1
# 6:         return count
# 7:     return counter
```
The entire snippet represents the new structure. It defines a function that returns another function with attached state.

### Mechanical walkthrough

- `def make_counter():`
  - Defines the outer function that acts as a factory.
- `count = 0`
  - Initializes a local variable `count` in the scope of `make_counter`.
- `def counter():`
  - Defines an inner function nested within `make_counter`. This is the function that will become the closure.
- `nonlocal count`
  - The `nonlocal` keyword declares that assignments to `count` inside this inner function should modify the `count` variable defined in the closest enclosing scope (`make_counter`), rather than creating a new local variable named `count` inside `counter`.
- `count += 1`
  - Increments the captured `count` variable by 1.
- `return count`
  - Returns the updated integer value.
- `return counter`
  - The outer function returns the inner function object itself, not the result of calling it. The returned `counter` function carries its captured environment (the `count` variable) with it.

---

## Concept Unit: Closure with parameters — the factory pattern

### The Problem

We often need functions that perform similar tasks but with slight variations. For example, we might want one function that doubles a number, another that triples it, and another that squares it. Writing separate functions for every variation is repetitive. How can we generate customized functions dynamically?

### Introduce the concept in isolation

```python
def make_multiplier(n):
    def multiply(x):
        return x * n
    return multiply

double = make_multiplier(2)
triple = make_multiplier(3)
print(double(7))
print(triple(7))
print(double(triple(4)))

def make_power(exp):
    return lambda x: x ** exp

square = make_power(2)
cube   = make_power(3)
print(square(5))
print(cube(3))
```
**Output:**
```
14
21
24
25
27
```
This demonstrates the **factory pattern** using closures. `make_multiplier` creates specialized functions on demand. Each returned function carries its own captured value of `n`. For `double(triple(4))`, `triple(4)` evaluates to 12, and then `double(12)` evaluates to 24.

### Discard the throwaway example

This multiplier and power generation example is discarded. It serves only to teach function factories.

### Project Change

No reference counterpart.

### The New Code

```python
def make_multiplier(n):
    def multiply(x):
        return x * n
    return multiply
```

### The Updated Project

```python
# 1: def make_multiplier(n):
# 2:     def multiply(x):
# 3:         return x * n
# 4:     return multiply
```
This structure represents a function factory that leverages parameters to create customized closures.

### Mechanical walkthrough

- `def make_multiplier(n):`
  - Defines the outer factory function, accepting a parameter `n`.
- `def multiply(x):`
  - Defines the inner function, accepting a parameter `x`.
- `return x * n`
  - The inner function multiplies its own argument `x` by the captured environment variable `n`. `n` is remembered from when `make_multiplier` was called.
- `return multiply`
  - Returns the customized inner function.

---

## Concept Unit: What a decorator is — manually

### The Problem

Suppose we have a set of existing functions, and we want to modify their behavior slightly—perhaps to format their output, log their calls, or check permissions—without rewriting the functions themselves. How can we wrap an existing function inside another function to alter what it does?

### Introduce the concept in isolation

```python
def shout(func):
    def wrapper(*args, **kwargs):
        result = func(*args, **kwargs)
        return str(result).upper()
    return wrapper

def greet(name):
    return f'Hello, {name}'

greet = shout(greet)
print(greet('Alice'))
```
**Output:**
```
HELLO, ALICE
```
This demonstrates a **decorator** applied manually. `shout` is a higher-order function that receives the `greet` function and returns a new function `wrapper`. We then reassign the name `greet` to point to this new `wrapper`. When we call `greet('Alice')`, it executes the wrapper, which calls the original function and uppercases the result.

### Discard the throwaway example

This manual decoration example is discarded to make way for the proper syntax.

### Project Change

No reference counterpart.

### The New Code

```python
def shout(func):
    def wrapper(*args, **kwargs):
        result = func(*args, **kwargs)
        return str(result).upper()
    return wrapper
```

### The Updated Project

```python
# 1: def shout(func):
# 2:     def wrapper(*args, **kwargs):
# 3:         result = func(*args, **kwargs)
# 4:         return str(result).upper()
# 5:     return wrapper
```
This is the structure of a basic decorator function.

### Mechanical walkthrough

- `def shout(func):`
  - Defines the decorator function, which takes a target function `func` as its argument.
- `def wrapper(*args, **kwargs):`
  - Defines the inner closure. `*args` and `**kwargs` capture any positional and keyword arguments passed to the function, making this wrapper highly generic.
- `result = func(*args, **kwargs)`
  - Calls the original captured function `func` with whatever arguments were provided, storing the return value.
- `return str(result).upper()`
  - Converts the result to a string (using the `str` class), calls the `upper` method on that string instance, and returns the modified string.
- `return wrapper`
  - Returns the new wrapper function, which now serves as a substitute for the original function.

---

## Concept Unit: The `@` syntax — syntactic sugar

### The Problem

Writing `greet = shout(greet)` after every function definition is repetitive and detaches the modification from the function signature itself. It's easy to miss. How can we express this decoration more cleanly and visibly?

### Introduce the concept in isolation

```python
def shout(func):
    def wrapper(*args, **kwargs):
        result = func(*args, **kwargs)
        return str(result).upper()
    return wrapper

@shout
def greet(name):
    return f'Hello, {name}'

print(greet('Bob'))
```
**Output:**
```
HELLO, BOB
```
This demonstrates the **`@` decorator syntax**. Placing `@shout` immediately above the `def greet` line is **syntactic sugar** that Python transforms precisely into `greet = shout(greet)` behind the scenes.

### Discard the throwaway example

This `@` syntax example is discarded to move on to practical decorators.

### Project Change

No reference counterpart.

### The New Code

```python
@shout
def greet(name):
    return f'Hello, {name}'
```

### The Updated Project

```python
# 1: @shout
# 2: def greet(name):
# 3:     return f'Hello, {name}'
```
This illustrates the standard way to apply a decorator in Python.

### Mechanical walkthrough

- `@shout`
  - The `@` syntactic sugar instructs Python to pass the function defined on the next line as an argument to `shout`, and bind the function's name to whatever `shout` returns.
- `def greet(name):`
  - Defines the function. Because of the decorator, the name `greet` is immediately rebound to the wrapper returned by `shout`.

---

## Concept Unit: A timing decorator — measuring execution time

### The Problem

We want to measure how long a function takes to execute, but adding timer code inside every function we want to measure pollutes their logic. Furthermore, when we wrap a function with a decorator, the returned wrapper replaces the original, losing its original name and docstring (e.g., `help(greet)` would show information for `wrapper`). How can we time functions transparently while preserving their identity?

### Introduce the concept in isolation

```python
import time
import functools

def timer(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        start = time.time()
        result = func(*args, **kwargs)
        end = time.time()
        print(f'{func.__name__} took {end - start:.4f}s')
        return result
    return wrapper

@timer
def slow_sum(n):
    return sum(range(n))

print(slow_sum(10_000_000))
```
**Output:**
```
slow_sum took 0.2341s
49999995000000
```
This demonstrates a practical **timing decorator** that uses `functools.wraps`. The `wraps` decorator copies the `__name__` and `__doc__` attributes from `func` to `wrapper`. Without it, `slow_sum.__name__` would incorrectly report as `'wrapper'`.

### Discard the throwaway example

This timing decorator is discarded.

### Project Change

No reference counterpart.

### The New Code

```python
def timer(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        start = time.time()
        result = func(*args, **kwargs)
        end = time.time()
        print(f'{func.__name__} took {end - start:.4f}s')
        return result
    return wrapper
```

### The Updated Project

```python
# 1: def timer(func):
# 2:     @functools.wraps(func)
# 3:     def wrapper(*args, **kwargs):
# 4:         start = time.time()
# 5:         result = func(*args, **kwargs)
# 6:         end = time.time()
# 7:         print(f'{func.__name__} took {end - start:.4f}s')
# 8:         return result
# 9:     return wrapper
```
This structure represents a complete, metadata-preserving decorator.

### Mechanical walkthrough

- `def timer(func):`
  - Defines the outer decorator.
- `@functools.wraps(func)`
  - Applies the `wraps` decorator from the `functools` module to the `wrapper` function, instructing it to copy metadata from the captured `func`.
- `def wrapper(*args, **kwargs):`
  - Defines the inner closure.
- `start = time.time()`
  - Calls `time.time()` to record the current timestamp before execution.
- `result = func(*args, **kwargs)`
  - Executes the wrapped function.
- `end = time.time()`
  - Records the timestamp after execution.
- `print(f'{func.__name__} took {end - start:.4f}s')`
  - Calculates the difference and prints it. It accesses the original function's name via `func.__name__`.
- `return result`
  - Returns the computed result.

---

## Concept Unit: A logging decorator

### The Problem

We want to trace function calls, seeing exactly what arguments they were called with and what they returned. Printing this manually inside the function is tedious. How can a decorator automatically log function inputs and outputs?

### Introduce the concept in isolation

```python
import functools

def log_calls(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        arg_str = ', '.join(repr(a) for a in args)
        kwarg_str = ', '.join(f'{k}={v!r}' for k, v in kwargs.items())
        all_args = ', '.join(filter(None, [arg_str, kwarg_str]))
        print(f'Calling {func.__name__}({all_args})')
        result = func(*args, **kwargs)
        print(f'{func.__name__} returned {result!r}')
        return result
    return wrapper

@log_calls
def add(a, b):
    return a + b

add(3, 4)
add(1, b=10)
```
**Output:**
```
Calling add(3, 4)
add returned 7
Calling add(1, b=10)
add returned 11
```
This demonstrates a **logging decorator**. It constructs a string representing all passed arguments and prints it before the function executes, then prints the result afterward. The `!r` format specifier is used to render string representations (like `repr()`) so that types are clear.

### Discard the throwaway example

This logging decorator is discarded.

### Project Change

No reference counterpart.

### The New Code

```python
def log_calls(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        arg_str = ', '.join(repr(a) for a in args)
        kwarg_str = ', '.join(f'{k}={v!r}' for k, v in kwargs.items())
        all_args = ', '.join(filter(None, [arg_str, kwarg_str]))
        print(f'Calling {func.__name__}({all_args})')
        result = func(*args, **kwargs)
        print(f'{func.__name__} returned {result!r}')
        return result
    return wrapper
```

### The Updated Project

```python
# 1: def log_calls(func):
# 2:     @functools.wraps(func)
# 3:     def wrapper(*args, **kwargs):
# 4:         arg_str = ', '.join(repr(a) for a in args)
# 5:         kwarg_str = ', '.join(f'{k}={v!r}' for k, v in kwargs.items())
# 6:         all_args = ', '.join(filter(None, [arg_str, kwarg_str]))
# 7:         print(f'Calling {func.__name__}({all_args})')
# 8:         result = func(*args, **kwargs)
# 9:         print(f'{func.__name__} returned {result!r}')
# 10:        return result
# 11:    return wrapper
```
This is a decorator that inspects and logs arguments and return values.

### Mechanical walkthrough

- `arg_str = ', '.join(repr(a) for a in args)`
  - Iterates over positional arguments, converting each to its representation via the `repr` function, and calls the `join` method on a comma string to concatenate them.
- `kwarg_str = ', '.join(f'{k}={v!r}' for k, v in kwargs.items())`
  - Iterates over keyword arguments. The `!r` format specifier inside the f-string acts as syntactic sugar for calling `repr(v)`.
- `all_args = ', '.join(filter(None, [arg_str, kwarg_str]))`
  - Places both strings in a list and uses the `filter` built-in function to remove empty strings (if there were no args or kwargs). It then joins the remaining strings.
- `print(f'Calling {func.__name__}({all_args})')`
  - Outputs the traced call signature.
- `result = func(*args, **kwargs)`
  - Executes the wrapped function.
- `print(f'{func.__name__} returned {result!r}')`
  - Logs the formatted result.

---

## Concept Unit: A memoization decorator

### The Problem

Some functions perform expensive calculations (like a deep recursive Fibonacci sequence). If called repeatedly with the same arguments, they waste time recomputing known results. How can we cache the output of a function so subsequent calls with identical arguments return instantly?

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

print(fib(40))
print(fib(50))

@functools.lru_cache(maxsize=None)
def fib_std(n):
    if n <= 1:
        return n
    return fib_std(n-1) + fib_std(n-2)
```
**Output:**
```
102334155
12586269025
```
This demonstrates a **memoization decorator**. The manual `memoize` uses a closure over a `cache` dictionary to remember previous inputs and outputs. Calling `fib(40)` evaluates instantly because overlapping recursive branches fetch values from the cache instead of recalculating them. Python's standard library provides the exact same functionality robustly via `functools.lru_cache`.

### Discard the throwaway example

This memoization example is discarded.

### Project Change

No reference counterpart.

### The New Code

```python
def memoize(func):
    cache = {}
    @functools.wraps(func)
    def wrapper(*args):
        if args not in cache:
            cache[args] = func(*args)
        return cache[args]
    return wrapper
```

### The Updated Project

```python
# 1: def memoize(func):
# 2:     cache = {}
# 3:     @functools.wraps(func)
# 4:     def wrapper(*args):
# 5:         if args not in cache:
# 6:             cache[args] = func(*args)
# 7:         return cache[args]
# 8:     return wrapper
```
This structure implements basic caching as a decorator.

### Mechanical walkthrough

- `cache = {}`
  - Initializes a dictionary in the outer scope to serve as the cache.
- `def wrapper(*args):`
  - Defines the inner closure. Note it only accepts positional `*args` to ensure they are hashable dictionary keys (tuples).
- `if args not in cache:`
  - Checks if the current sequence of arguments (a tuple) exists as a key in the `cache` dictionary.
- `cache[args] = func(*args)`
  - If not found, calls the original function, computes the result, and stores it in the `cache` under the key `args`.
- `return cache[args]`
  - Returns the cached value, bypassing the computation on future calls with the same arguments.
- `@functools.lru_cache(maxsize=None)`
  - (From the isolated example) Uses the built-in decorator factory from the `functools` module to achieve the same caching behavior. `maxsize=None` configures it to hold an unbounded number of cached items, exactly matching our custom `memoize` logic.

---

**Closing:** Closures and decorators are one of Python's most expressive features. They are used throughout major frameworks: Flask uses `@app.route`, Django uses `@login_required`, and pytest uses `@pytest.fixture`. Lesson 20 covers iterators and generators. 

**Exercises:** 
1. Write a `retry(n)` decorator that retries a failing function up to n times before re-raising.
2. Write a `validate_positive` decorator that raises ValueError if any argument is negative.
