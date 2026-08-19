# Lesson 5: Functions — `def`, Parameters, `return`, and Scope

What you will build: The reader will define and call functions, understand the difference between `return` and `print`, trace the call stack, understand local vs global scope, and use default parameter values. The transferable problems: (1) a function is a named, reusable computation — it takes inputs (parameters), does work, and produces an output (return value); (2) `return` terminates the function and gives a value back to the caller; `print` is a side effect that does NOT give a value back; (3) local variables exist only inside the function — they are created when the function is called and destroyed when it returns.

What you need to know first: Lessons 0–4 (REPL, types, variables, conditionals, iteration).

## Terms used in this lesson

- **Function** — a named, reusable sequence of statements that performs a specific computation. Functions solve the problem of writing the same code multiple times, allowing you to package logic into a single callable unit.
- **`def`** — the Python keyword used to define a new function. It introduces a function definition block, binding a name to the function object.
- **Parameter** — a local variable listed in a function definition that receives a value passed by the caller. It acts as the input to the function's computation.
- **Argument** — the actual value passed into a function call, which gets assigned to the corresponding parameter.
- **`return`** — the Python keyword used to terminate a function's execution and specify the value to give back to the caller. It solves the problem of getting computed data out of a function so it can be used elsewhere.
- **Call stack** — the internal mechanism Python uses to keep track of active function calls. It solves the problem of knowing where to return control (and data) after a function finishes execution.
- **Frame** — a block of memory on the call stack allocated for a single function call, containing its local variables. It is created when the function is called and destroyed when it returns.
- **Scope** — the region of a program where a specific variable name is valid and accessible. It solves the problem of name collisions by keeping local variables isolated from the rest of the program.
- **Local variable** — a variable assigned inside a function. It belongs exclusively to that function's scope and cannot be seen from outside.
- **Global variable** — a variable assigned at the top level of a script or module, accessible from anywhere in the file.
- **Default parameter** — a parameter given a fallback value in the function definition, making the corresponding argument optional for the caller. It solves the problem of requiring repetitive arguments for common use cases.
- **Tuple** — an immutable sequence of values in Python. Used implicitly when a function returns multiple comma-separated values.
- **Tuple unpacking** — the syntax for assigning individual elements of a tuple to multiple distinct variables in a single statement.
- **Docstring** — a string literal appearing as the first statement within a function, used to document its purpose, parameters, and return value. It solves the problem of making code self-documenting and accessible to tools like `help()`.

## Objects and methods used

- **`print`**
  - *What it is:* A built-in Python function that outputs data to the console.
  - *Implementation:* `print(*objects, sep=' ', end='\n', file=sys.stdout, flush=False)`. Returns `None`.
  - *Its use:* Used in this lesson to display function outputs and side effects, and to demonstrate the critical difference between printing to the screen and returning a value.
  - *Type:* Built-in function.
  - *Responsibility:* Converts given objects to strings and writes them to a standard output stream, appending a newline by default.
  - *Depends on:* The objects passed to it as arguments.
  - *Connects to:* Calls `__str__` on objects to format them, writes to `sys.stdout`.
  - *Shape:* A global built-in utility used at the application boundary for human-readable output.

- **`help`**
  - *What it is:* A built-in Python utility for querying documentation.
  - *Implementation:* `help([object])`. Returns `None`.
  - *Its use:* Used to demonstrate how docstrings are accessed by developers to understand a function's contract.
  - *Type:* Built-in function.
  - *Responsibility:* Retrieves and formats the interactive help text or docstring for a given object, module, or function.
  - *Depends on:* The object passed to it (which should have a `__doc__` attribute).
  - *Connects to:* Reads the `__doc__` attribute of the target, outputs formatted text to the console.
  - *Shape:* A global built-in utility used for developer tooling and introspection.

---

## Concept Unit: Defining and calling a function

### The Problem
If we want to square a number, we can write `5 * 5`. But what if we need to square numbers in fifty different places in our program? Repeating the multiplication logic every time is tedious and error-prone. We need a way to package this computation under a reusable name.

### Introduce the concept in isolation
Let's see the basic mechanism of creating a reusable block by defining a simple greeter.

```python
def greet():
    return "Hi"

print(greet())
```

Output:
```text
Hi
```
This proves that we can encapsulate a value-returning statement inside a reusable block called a **function**.

### Discard the throwaway example
This throwaway code is discarded. It will not appear in the project again.

### Project Change
No reference counterpart — this is a from-scratch addition.
- **Files affected**: `math_utils.py` (created)
- **Change type**: add
- **Location**: new file
- **Dependencies**: none

### The New Code
```python
def square(x):
    return x * x
```

### The Updated Project
```python
# ← new
def square(x):
    return x * x

result = square(5)
print(result)
print(square(3) + square(4))
```
This gives us a named operation that computes a square, which we can call repeatedly with different inputs.

Output of the updated project:
```text
25
25
```

### Mechanical Walkthrough
- `def`: This keyword introduces a function definition.
- `square`: This is the name we chose for our function.
- `(x)`: `x` is the parameter — a local variable that receives the value passed by the caller.
- `return`: This keyword computes `x * x` and gives that value back to the caller.
- `square(5)`: The function call binds the argument `5` to the parameter `x`, runs the body, and returns `25`.
- `result = square(5)`: This binds the returned value to the variable `result`.

---

## Concept Unit: The call stack

### The Problem
When we run `square(3) + square(4)`, how does Python keep track of which `square` is which, and where the results should go while computing the total?

### Introduce the concept in isolation
Let's trace a simple nested call.

```python
def one():
    return 1

def two():
    return one() + 1

print(two())
```

Output:
```text
2
```
This proves that Python can pause the execution of one function to go execute another, keeping track of where it left off. This mechanism is called the **call stack**.

### Discard the throwaway example
This throwaway code is discarded.

### Project Change
No reference counterpart.
- **Files affected**: `math_utils.py`
- **Change type**: trace
- **Location**: none
- **Dependencies**: none

### The New Code
```python
square(3) + square(4)
```

### The Updated Project
```python
def square(x):
    return x * x

result = square(5)
print(result)
# ← trace target
print(square(3) + square(4))
```
This evaluates two separate function calls and adds their results.

### Mechanical Walkthrough
Trace `square(3) + square(4)`:
- Step 1: Python evaluates `square(3)`. It pushes a frame for `square` onto the call stack with `x=3`. It evaluates `x * x` (which is `9`), returns `9`, and pops the frame off the stack.
- Step 2: Python evaluates `square(4)`. It pushes a new frame for `square` onto the call stack with `x=4`. It evaluates `x * x` (which is `16`), returns `16`, and pops the frame off the stack.
- Step 3: Python evaluates `9 + 16` to yield `25`.

When a function calls another function, frames stack up. When a function returns, its frame is popped.

---

## Concept Unit: `return` vs `print`

### The Problem
If our function just needs to show a result to the user, we might be tempted to use `print` inside the function instead of `return`. What happens if we try to use the result of a function that only prints?

### Introduce the concept in isolation
Let's define a function that prints instead of returning.

```python
def say_hello():
    print("Hello")

val = say_hello()
print(val)
```

Output:
```text
Hello
None
```
This proves that `print` only displays text to the screen and causes the function to implicitly return **`None`**. 

### Discard the throwaway example
This throwaway code is discarded.

### Project Change
No reference counterpart.
- **Files affected**: `math_utils.py`
- **Change type**: add
- **Location**: bottom of file
- **Dependencies**: none

### The New Code
```python
def square_print(x):
    print(x * x)

def square_return(x):
    return x * x
```

### The Updated Project
```python
def square_print(x):
    print(x * x)

def square_return(x):
    return x * x

# square_return can be composed:
result = square_return(5) + 1
print(result)

# square_print can't be composed:
# result_bad = square_print(5) + 1 # This would crash
```
Output:
```text
26
```
This demonstrates that only returned values can be used in further calculations.

### Mechanical Walkthrough
- `square_print(x)`: Evaluates `x * x` and passes it to `print`. `print` is for human-readable output — it writes to the screen and returns `None`. Because the function has no explicit `return`, it also returns `None`.
- `result = square_print(5) + 1`: `square_print(5)` prints `25` to the screen and evaluates to `None`. The expression becomes `None + 1`, which crashes with `TypeError: unsupported operand type(s) for +: 'NoneType' and 'int'`.
- `square_return(x)`: Evaluates `x * x` and uses `return` to give the value back to the caller.
- `result = square_return(5) + 1`: `square_return(5)` evaluates to `25`. The expression becomes `25 + 1`, which evaluates to `26`.

ALWAYS use `return` in functions that compute values so the result can be used in further computation. Use `print` only at the top level or in functions specifically meant to display output.

---

## Concept Unit: Multiple `return` statements

### The Problem
Sometimes the value a function should return depends on a condition. Can a function have more than one `return` keyword?

### Introduce the concept in isolation
Let's use an `if` statement to return different strings based on a boolean.

```python
def check(val):
    if val:
        return "Yes"
    return "No"

print(check(True))
```

Output:
```text
Yes
```
This proves that a function can contain multiple `return` keywords, and execution stops as soon as the first one is hit.

### Discard the throwaway example
This throwaway code is discarded.

### Project Change
No reference counterpart.
- **Files affected**: `math_utils.py`
- **Change type**: add
- **Location**: bottom of file
- **Dependencies**: none

### The New Code
```python
def abs_val(x):
    if x >= 0:
        return x
    else:
        return -x
```

### The Updated Project
```python
# ← new
def abs_val(x):
    if x >= 0:
        return x
    else:
        return -x

print(abs_val(5))
print(abs_val(-3))
print(abs_val(0))
```

Output:
```text
5
3
0
```
This provides a function that returns the absolute value of a number using conditional returns.

### Mechanical Walkthrough
Trace for `abs_val(-3)`:
- `abs_val(-3)` is called, binding `-3` to `x`.
- `if x >= 0:` evaluates `if -3 >= 0:`, which is `False`.
- Execution jumps to the `else:` block.
- `return -x` evaluates `-(-3)`, which is `3`.
- The function returns `3` and terminates immediately.

A function can have multiple `return` statements. The first one reached terminates the function. Code after a `return` that is always reached is dead code — it never runs.

---

## Concept Unit: Local scope

### The Problem
If we define a variable inside a function, can we use it outside the function? What happens if a variable inside a function has the same name as a variable outside?

### Introduce the concept in isolation
Let's assign a variable inside a function and try to print it outside.

```python
def do_something():
    y = 5
    return y

print(do_something())
# print(y)  # This would cause a NameError
```

Output:
```text
5
```
This proves that variables created inside a function are private to that function. This isolation is called **local scope**.

### Discard the throwaway example
This throwaway code is discarded.

### Project Change
No reference counterpart.
- **Files affected**: `math_utils.py`
- **Change type**: add
- **Location**: bottom of file
- **Dependencies**: none

### The New Code
```python
def compute():
    local_var = 42
    return local_var

x = 10  # global

def show_x():
    print(x)  # can READ a global

def modify_x_wrong():
    x = 99    # creates a NEW local x, does NOT modify the global
    print(x)
```

### The Updated Project
```python
# ← new
def compute():
    local_var = 42
    return local_var

print(compute())
# print(local_var)   # NameError: name 'local_var' is not defined

x = 10  # global

def show_x():
    print(x)  # can READ a global

def modify_x_wrong():
    x = 99    # creates a NEW local x, does NOT modify the global
    print(x)  # 99

show_x()
modify_x_wrong()
print(x)
```

Output:
```text
42
10
99
10
```
This demonstrates the difference between local and global variables, and how variable assignment inside a function creates a new local variable rather than updating a global one.

### Mechanical Walkthrough
- `local_var = 42`: Inside `compute`, this creates a local variable. When `compute()` finishes returning, `local_var` is destroyed. Attempting to print it globally results in `NameError`.
- `x = 10`: This creates a global variable `x` at the top level of the file.
- `show_x()`: When it calls `print(x)`, Python looks for a local `x`, doesn't find one, and falls back to reading the global `x` (which is `10`).
- `modify_x_wrong()`: When evaluating `x = 99`, Python does not update the global `x`. Instead, it creates a new local variable also named `x` that shadows the global one.
- `print(x)` inside `modify_x_wrong`: This prints the local `x` (`99`).
- `print(x)` at the very end: This prints the global `x`, which is still `10`.

A function can READ a global variable, but assigning to a name inside a function creates a LOCAL variable. To modify a global, you need the `global` keyword (but this is generally bad practice — prefer passing values as parameters and returning results).

---

## Concept Unit: Default parameter values

### The Problem
Sometimes a function requires an argument that is almost always the same value. Forcing the caller to provide it every time is repetitive. Can we make an argument optional?

### Introduce the concept in isolation
Let's give a parameter a fallback value.

```python
def echo(msg="default"):
    return msg

print(echo())
print(echo("hello"))
```

Output:
```text
default
hello
```
This proves that parameters can have a default value, making them optional for the caller. These are called **default parameters**.

### Discard the throwaway example
This throwaway code is discarded.

### Project Change
No reference counterpart.
- **Files affected**: `math_utils.py`
- **Change type**: add
- **Location**: bottom of file
- **Dependencies**: none

### The New Code
```python
def greet(name, greeting='Hello'):
    return f'{greeting}, {name}!'
```

### The Updated Project
```python
# ← new
def greet(name, greeting='Hello'):
    return f'{greeting}, {name}!'

print(greet('Alice'))
print(greet('Bob', 'Hi'))
print(greet('Carol', greeting='Hey'))
```

Output:
```text
Hello, Alice!
Hi, Bob!
Hey, Carol!
```
This gives us a flexible function that can be customized when needed but remains simple to call in the common case.

### Mechanical Walkthrough
- `greeting='Hello'`: In the function definition, this assigns a default value of `'Hello'` to the parameter `greeting`.
- `greet('Alice')`: The caller omits the second argument. `name` is bound to `'Alice'`, and `greeting` falls back to `'Hello'`.
- `greet('Bob', 'Hi')`: The caller provides both arguments based on their position. `greeting` is bound to `'Hi'`.
- `greet('Carol', greeting='Hey')`: The caller explicitly passes the second argument by its name. This is a keyword argument.

Parameters with defaults are optional — callers can omit them. Parameters without defaults are required. Required parameters must come BEFORE optional ones in the function signature. Keyword arguments can be passed in any order.

---

## Concept Unit: Multiple parameters and multiple return values

### The Problem
Sometimes a computation naturally produces more than one distinct result (like the quotient and remainder of a division). How can a function give back multiple values?

### Introduce the concept in isolation
Let's see what happens when we return comma-separated values.

```python
def pair():
    return 1, 2

a, b = pair()
print(a)
```

Output:
```text
1
```
This proves that a function can return multiple values combined into a single structure, which can then be assigned to separate variables. This structure is a **tuple**.

### Discard the throwaway example
This throwaway code is discarded.

### Project Change
No reference counterpart.
- **Files affected**: `math_utils.py`
- **Change type**: add
- **Location**: bottom of file
- **Dependencies**: none

### The New Code
```python
def divide_with_remainder(a, b):
    quotient = a // b
    remainder = a % b
    return quotient, remainder
```

### The Updated Project
```python
# ← new
def divide_with_remainder(a, b):
    quotient = a // b
    remainder = a % b
    return quotient, remainder

q, r = divide_with_remainder(17, 5)
print(q, r)

# Or capture the whole tuple:
result = divide_with_remainder(17, 5)
print(result)
print(result[0])
```

Output:
```text
3 2
(3, 2)
3
```
This provides a function that accurately reports both the quotient and the remainder in one call.

### Mechanical Walkthrough
Trace for `divide_with_remainder(17, 5)`:
- `a` is bound to `17`, `b` is bound to `5`.
- `quotient = 17 // 5` evaluates to `3`.
- `remainder = 17 % 5` evaluates to `2`.
- `return quotient, remainder` evaluates to `return 3, 2`. This returns a **tuple**.
- `q, r = divide_with_remainder(...)`: This is **tuple unpacking**. The tuple `(3, 2)` is unpacked so that `3` binds to `q` and `2` binds to `r`.
- `result = divide_with_remainder(...)`: The whole tuple `(3, 2)` binds to `result`. We can access elements via indexing, e.g., `result[0]`.

This is Python's idiom for returning multiple values — many built-in functions use it.

---

## Concept Unit: Docstrings

### The Problem
When we look at a function named `celsius_to_fahrenheit`, we might guess what it does. But how do we explicitly document a function's parameters, return type, and purpose so other developers (and tooling like IDEs) can understand its contract without reading its body?

### Introduce the concept in isolation
Let's place a string immediately under a function definition.

```python
def dummy():
    """Does nothing."""
    pass

print(dummy.__doc__)
```

Output:
```text
Does nothing.
```
This proves that a string at the start of a function is stored as metadata on the function itself. This is called a **docstring**.

### Discard the throwaway example
This throwaway code is discarded.

### Project Change
No reference counterpart.
- **Files affected**: `math_utils.py`
- **Change type**: add
- **Location**: bottom of file
- **Dependencies**: none

### The New Code
```python
def celsius_to_fahrenheit(c):
    '''Convert a temperature from Celsius to Fahrenheit.

    Args:
        c (float): Temperature in degrees Celsius.

    Returns:
        float: Temperature in degrees Fahrenheit.
    '''
    return c * 9/5 + 32
```

### The Updated Project
```python
# ← new
def celsius_to_fahrenheit(c):
    '''Convert a temperature from Celsius to Fahrenheit.

    Args:
        c (float): Temperature in degrees Celsius.

    Returns:
        float: Temperature in degrees Fahrenheit.
    '''
    return c * 9/5 + 32

print(celsius_to_fahrenheit(100))
print(celsius_to_fahrenheit(0))
help(celsius_to_fahrenheit)
```

Output:
```text
212.0
32.0
Help on function celsius_to_fahrenheit in module __main__:

celsius_to_fahrenheit(c)
    Convert a temperature from Celsius to Fahrenheit.
    
    Args:
        c (float): Temperature in degrees Celsius.
        
    Returns:
        float: Temperature in degrees Fahrenheit.
```
This provides a fully documented function whose contract is accessible dynamically via `help`.

### Mechanical Walkthrough
- `'''Convert a temperature...'''`: A string literal placed as the very first statement inside a function definition becomes its **docstring**.
- `c * 9/5 + 32`: The body of the function executes normally when called.
- `help(celsius_to_fahrenheit)`: Python's built-in `help` function reads the docstring and displays it to the developer in a formatted way.

This is how Python's own documentation works — `help(print)`, `help(len)` etc. Every function you write should have a docstring.

---

Module 0 is complete. The reader can now open the Python REPL, work with all basic types, write conditional and iterative programs, and define reusable functions. Module 1 covers Python's data structures — lists, tuples, dicts, sets — the building blocks of real programs. 

Exercises: 
- Write `is_palindrome(s)` that returns True if string s reads the same forwards and backwards.
- Write `count_vowels(s)` that counts the number of vowels in a string.
- Write `collatz(n)` that prints the Collatz sequence starting from n until it reaches 1.
