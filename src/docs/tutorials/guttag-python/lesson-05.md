# Lesson 05: Functions — def, Parameters, return, and Scope

What you will build: The reader understands Python functions: def syntax, parameters vs. arguments, positional vs. keyword arguments, default values, return values, and scope (local vs. global, LEGB rule). The transferable insight: a function is an abstraction that names a computation. It takes inputs (parameters), performs work, and produces an output (return value). Every function call creates a new local scope; names inside don't leak out.

What you need to know first: Lessons 00-04.

Terms used in this lesson:
- **Function** — A reusable block of code that performs a specific task. Functions abstract away the implementation details of a computation, allowing you to name it and use it multiple times without duplicating code.
- **Parameter** — A named variable in a function's definition that acts as a placeholder for the data the function will receive when it is called.
- **Argument** — The actual value passed to a function's parameter when the function is called.
- **Scope** — The region of a program where a specific name (like a variable or function name) is valid and can be accessed. It prevents name collisions and encapsulates data.
- **LEGB Rule** — The order in which Python resolves names: Local, Enclosing, Global, and Built-in. It defines how Python looks up the value associated with a name.
- **Positional argument** — An argument matched to a parameter based on its position (left to right) in the function call.
- **Keyword argument** — An argument matched to a parameter by explicitly stating the parameter's name in the function call (e.g., `x=1`), order-independent.
- **Default value** — A value provided in the function definition that is used if the caller does not supply an argument for that parameter.
- **Docstring** — A string literal appearing as the first statement in a function body, used to document what the function does.
- **First-class object** — An entity that can be dynamically created, destroyed, passed to a function, returned as a value, and assigned to a variable. In Python, functions are first-class objects.
- **def** — A language keyword used to define a new function. It binds a function object to a name.
- **return** — A language keyword used to exit a function and specify the value to send back to the caller.
- **global** — A language keyword used inside a function to declare that a variable name refers to a globally scoped variable, not a local one.

Objects and methods used:

**`print`**
- *What it is:* A built-in function that outputs data to the console.
- *Implementation:* `print(*objects, sep=' ', end='\n', file=sys.stdout, flush=False)`
- *Its use:* To display the results of our function calls and trace execution flow.
- *Type:* Built-in function.
- *Responsibility:* Converts its arguments to strings and writes them to a standard output stream.
- *Depends on:* The values passed as `*objects`.
- *Connects to:* Called by our script, calls the `__str__` method of the objects passed to it.
- *Shape:* An API boundary between the Python script and the standard output console.

**`help`**
- *What it is:* A built-in utility function to invoke the interactive help system or display documentation for an object.
- *Implementation:* `help([object])`
- *Its use:* To retrieve and display the docstring of a function.
- *Type:* Built-in function.
- *Responsibility:* Formats and displays the documentation (`__doc__` attribute) of a given object.
- *Depends on:* An object (like a function) passed to it.
- *Connects to:* Called by our script, reads the `__doc__` attribute of the target object.
- *Shape:* An introspective diagnostic tool used at the development layer.

**`id`**
- *What it is:* A built-in function that returns the unique identifier (memory address in CPython) of an object.
- *Implementation:* `id(object)`
- *Its use:* To demonstrate that functions are distinct objects in memory.
- *Type:* Built-in function.
- *Responsibility:* Returns an integer representing the identity of an object, guaranteed to be unique and constant for this object during its lifetime.
- *Depends on:* An object passed to it.
- *Connects to:* Called by our script, accesses the internal memory representation of the runtime.
- *Shape:* A runtime introspection utility.

**`type`**
- *What it is:* A built-in function that returns the type of an object.
- *Implementation:* `type(object)`
- *Its use:* To prove that a function is an object of type `function`.
- *Type:* Built-in function.
- *Responsibility:* Retrieves and returns the type object corresponding to the given instance.
- *Depends on:* An object passed to it.
- *Connects to:* Called by our script, accesses the internal type metadata of an object.
- *Shape:* A runtime introspection utility.

## Concept Unit: def and return — defining and calling a function
### The Problem
If we have a block of code that computes something useful, and we want to perform that exact same computation multiple times in different parts of our program, we would have to copy and paste the code. How can we group this code together, give it a name, and invoke it on demand? What happens if that computation needs to give us an answer back?

### Introduce the concept in isolation
```python
def get_greeting():
    return "Hello, World!"

result = get_greeting()
print(result)
```
Output:
```
Hello, World!
```
This output proves that the function `get_greeting` was executed when called, and the string it evaluated to was handed back to the caller and stored in `result`. This is called a **function definition**.

### Discard the throwaway
This throwaway example is discarded and will not appear in the project again.

### Project Change
- **Reference Source:** No reference counterpart — this is a from-scratch addition because we are starting our open-calc project's function module.
- **Files affected:** `calculator.py` (created)
- **Change type:** add
- **Location:** At the top of the new file.
- **Dependencies:** None.

### The New Code
```python
def add_two_numbers():
    return 2 + 2
```

### The Updated Project
```python
# ← new
1: def add_two_numbers():
2:     return 2 + 2
```
This structure creates a new function named `add_two_numbers` that, when called, evaluates the addition and returns the result.

### Mechanical walkthrough
- `def`: A language keyword that begins a function definition, telling Python to create a new function object.
- `add_two_numbers`: The name assigned to the newly created function object.
- `()`: Parentheses that enclose the function's parameters. Here, they are empty, meaning the function takes no inputs.
- `:`: A colon indicating the start of the function's body (a new indented block).
- `return`: A language keyword that immediately terminates the function call and specifies the value to be sent back to the caller.
- `2`: An integer literal.
- `+`: The addition operator.
- `2`: Another integer literal.

### CS lens
This is a **subroutine** or **procedure**. In computer science, abstracting instructions into a named subroutine is the fundamental building block of modular programming. Real-world places it appears:
- Database stored procedures.
- OS system calls.
- Command-line aliases.

### SE lens
**Abstraction**. The principle of hiding implementation details behind a clear interface. The alternative not chosen is inline code duplication (copy-pasting). The tradeoff is that a function call introduces a small performance overhead compared to inline code, but it dramatically improves maintainability.

### Commands needed
`python3 calculator.py`

### Run it
Predicted confidently: Nothing will print because we defined the function but did not call it yet.

### One sentence connecting to previous unit
Now that we have a named function, we need a way to pass specific values into it so it doesn't just compute `2 + 2` every time.

## Concept Unit: Parameters and arguments
### The Problem
Our `add_two_numbers` function always adds 2 and 2. How can we make it flexible so it can add *any* two numbers? If we want to pass multiple values, how does the function know which is which?

### Introduce the concept in isolation
```python
def greet_person(name, punctuation="!"):
    return "Hello, " + name + punctuation

print(greet_person("Alice"))
print(greet_person(punctuation=".", name="Bob"))
```
Output:
```
Hello, Alice!
Hello, Bob.
```
This output proves that arguments can be matched to parameters by position ("Alice" to `name`) or explicitly by keyword (`name="Bob"`), and that a parameter (`punctuation`) can provide a fallback value if omitted. This is called **parameter binding**.

### Discard the throwaway
This throwaway example is discarded and will not appear in the project again.

### Project Change
- **Reference Source:** No reference counterpart — this is a from-scratch addition because we are expanding our calculator.
- **Files affected:** `calculator.py` (modified)
- **Change type:** replace
- **Location:** Replacing the original `add_two_numbers` function.
- **Dependencies:** None.

### The New Code
```python
def add_two_numbers(a, b=0):
    return a + b
```

### The Updated Project
```python
1: def add_two_numbers(a, b=0): # ← new
2:     return a + b             # ← new
```
This structure redefines `add_two_numbers` to accept two inputs, `a` and `b`, where `b` defaults to 0 if not provided, making the computation flexible.

### Mechanical walkthrough
- `def`: A language keyword that begins a function definition.
- `add_two_numbers`: The name of the function.
- `(`: Opens the parameter list.
- `a`: A parameter name. This is a positional argument by default.
- `,`: Separates parameters in the list.
- `b`: Another parameter name.
- `=`: Assignment operator used here to denote a default value.
- `0`: Integer literal serving as the default value for `b`.
- `)`: Closes the parameter list.
- `:`: Begins the function body.
- `return`: Exits the function and outputs the evaluated expression.
- `a`: Evaluates to the argument passed for `a`.
- `+`: Addition operator.
- `b`: Evaluates to the argument passed for `b`.

### CS lens
This is **parameter passing**. Real-world places it appears:
- HTTP request query parameters (`?q=search`).
- Command-line flags (`ls -l`).
- Configuration files supplying dynamic inputs to an application.

### SE lens
**API Design (Default Arguments)**. The principle of making the most common use case easy while allowing customization. The alternative not chosen is forcing the caller to always supply two arguments, or writing two separate functions `add_one_number(a)` and `add_two_numbers(a, b)`. The tradeoff is that default arguments can sometimes hide errors if the caller forgets an argument they intended to pass.

### Commands needed
None for this unit.

### Run it
Predicted confidently: Nothing prints as we only redefined the function.

### One sentence connecting to previous unit
With inputs handled, we must understand where these parameters live and whether they can accidentally overwrite variables outside the function.

## Concept Unit: Scope and the LEGB rule
### The Problem
If we have a variable named `a` outside our function, and a parameter named `a` inside our function, do they conflict? When we type `a` inside the function, which one does Python use?

### Introduce the concept in isolation
```python
x = 10

def print_x():
    x = 5
    print(x)

print_x()
print(x)
```
Output:
```
5
10
```
This output proves that the assignment `x = 5` inside the function created a new local variable that shadowed the global `x`, leaving the global `x` unmodified. This is called **local scope**.

### Discard the throwaway
This throwaway example is discarded and will not appear in the project again.

### Project Change
- **Reference Source:** No reference counterpart — this is a from-scratch addition because we are demonstrating scope.
- **Files affected:** `calculator.py` (modified)
- **Change type:** add
- **Location:** Below the existing `add_two_numbers` function.
- **Dependencies:** None.

### The New Code
```python
multiplier = 2

def multiply_and_add(a, b):
    product = a * multiplier
    return product + b
```

### The Updated Project
```python
1: def add_two_numbers(a, b=0):
2:     return a + b
3:
4: multiplier = 2 # ← new
5:
6: def multiply_and_add(a, b): # ← new
7:     product = a * multiplier # ← new
8:     return product + b # ← new
```
This structure defines a global variable `multiplier` and a new function `multiply_and_add` that accesses both its local parameters (`a`, `b`, `product`) and the globally scoped `multiplier`.

### Mechanical walkthrough
- `multiplier`: A global variable name.
- `=`: Assignment operator.
- `2`: Integer literal.
- `def multiply_and_add(a, b):`: Defines a function with two parameters.
- `product`: A new local variable created inside the function's scope.
- `=`: Assignment operator.
- `a`: Resolves to the local parameter `a` (Local in LEGB).
- `*`: Multiplication operator.
- `multiplier`: Resolves to the global variable `multiplier` because it was not found in the local scope (Global in LEGB).
- `return`: Exits and returns a value.
- `product`: Resolves to the local variable.
- `+`: Addition operator.
- `b`: Resolves to the local parameter.

### CS lens
This is **lexical scoping** and **name resolution**. Real-world places it appears:
- Directory paths in a file system (local vs. absolute).
- DNS resolution (local cache vs. root servers).
- Environment variables overriding system defaults.

### SE lens
**Encapsulation and Information Hiding**. The principle of keeping a function's internal state private. The alternative not chosen is using global variables for all intermediate calculations. The real tradeoff is that relying on global variables (like `multiplier`) makes the function's behavior dependent on external state, making it harder to test and reason about, even though it saves passing an extra parameter.

### Commands needed
None for this unit.

### Run it
Predicted confidently: No output; this only defines variables and functions.

### One sentence connecting to previous unit
Now that we know how data enters a function and where it lives, we need to explore how a function can send complex data back out.

## Concept Unit: Return values and multiple returns
### The Problem
Our functions currently return a single number. What if a computation naturally produces two distinct pieces of information, like both the sum and the difference of two numbers? Can a function hand back more than one thing?

### Introduce the concept in isolation
```python
def sum_and_diff(x, y):
    if x < 0 or y < 0:
        return None
    return x + y, x - y

result = sum_and_diff(10, 3)
print(result)
```
Output:
```
(13, 7)
```
This output proves that a function can return a single `None` object as an early exit, or it can return multiple comma-separated values, which Python automatically packs into a single tuple object. This is called **multiple returns**.

### Discard the throwaway
This throwaway example is discarded and will not appear in the project again.

### Project Change
- **Reference Source:** No reference counterpart — this is a from-scratch addition.
- **Files affected:** `calculator.py` (modified)
- **Change type:** add
- **Location:** At the bottom of the file.
- **Dependencies:** None.

### The New Code
```python
def calculate_stats(a, b):
    if type(a) is not int or type(b) is not int:
        return None, None
    return a + b, a * b
```

### The Updated Project
```python
7:     product = a * multiplier
8:     return product + b
9: 
10: def calculate_stats(a, b): # ← new
11:     if type(a) is not int or type(b) is not int: # ← new
12:         return None, None # ← new
13:     return a + b, a * b # ← new
```
This structure adds a function that acts as a guard clause returning `None` if inputs are invalid, or returns both the sum and the product packed in a tuple.

### Mechanical walkthrough
- `def calculate_stats(a, b):`: Defines the function.
- `if`: A language keyword that begins a conditional block.
- `type`: A built-in function that returns the type of its argument.
- `(`: Opens function call.
- `a`: The local parameter.
- `)`: Closes function call.
- `is not`: Identity comparison operator checking if the types do not match.
- `int`: The built-in integer type object.
- `or`: Logical operator.
- `type(b) is not int`: Repeats the check for `b`.
- `:`: Begins the conditional body.
- `return`: Exits the function early.
- `None`: The built-in null object in Python.
- `,`: Separator indicating multiple return values (forming a tuple).
- `None`: Another instance of the null object.
- `return a + b, a * b`: The final return statement, outputting two expressions separated by a comma, which Python packs into a tuple.

### CS lens
This is **guard clauses** and **compound data types**. Real-world places it appears:
- Network requests returning both a status code and a response body.
- Security checkpoints halting execution early if credentials fail.
- Geographic coordinates (latitude, longitude) returned together.

### SE lens
**Fail Fast**. The principle of aborting an operation immediately when invalid conditions are detected. The alternative not chosen is a deeply nested `if-else` block. The tradeoff is multiple exit points in a function, which can make control flow harder to follow, but it heavily flattens indentation and improves readability for the "happy path".

### Commands needed
None for this unit.

### Run it
Predicted confidently: No output; only defining the function.

### One sentence connecting to previous unit
Functions are useful, but as they grow more complex, we need a way to document them and treat them like any other data in our program.

## Concept Unit: Docstrings and function as object
### The Problem
How do we tell other developers (or our future selves) what `calculate_stats` expects and returns without them having to read the source code? Furthermore, if a function is just a named computation, can we pass that computation around like a variable?

### Introduce the concept in isolation
```python
def my_func():
    """This function does nothing but has a docstring."""
    pass

print(my_func.__doc__)
print(type(my_func))
```
Output:
```
This function does nothing but has a docstring.
<class 'function'>
```
This output proves that a string immediately following the `def` statement is attached to the function object as its `__doc__` attribute, and that the function itself is a first-class object of type `function`. This is called a **docstring** and **first-class functions**.

### Discard the throwaway
This throwaway example is discarded and will not appear in the project again.

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** `calculator.py` (modified)
- **Change type:** add/replace
- **Location:** Updating `calculate_stats` and adding executable code at the bottom.
- **Dependencies:** None.

### The New Code
```python
def calculate_stats(a, b):
    """
    Computes the sum and product of two integers.
    Returns (None, None) if inputs are not integers.
    """
    if type(a) is not int or type(b) is not int:
        return None, None
    return a + b, a * b

operation = calculate_stats
```

### The Updated Project
```python
10: def calculate_stats(a, b):
11:     """ # ← new
12:     Computes the sum and product of two integers. # ← new
13:     Returns (None, None) if inputs are not integers. # ← new
14:     """ # ← new
15:     if type(a) is not int or type(b) is not int:
16:         return None, None
17:     return a + b, a * b
18:
19: operation = calculate_stats # ← new
```
This structure adds documentation to the function and assigns the function object itself to a new variable named `operation`.

### Mechanical walkthrough
- `def calculate_stats(a, b):`: Defines the function.
- `"""`: Opens a multi-line string literal.
- `Computes the sum and product of two integers.`: Documentation text.
- `Returns (None, None) if inputs are not integers.`: Documentation text.
- `"""`: Closes the multi-line string literal. Because it is the first statement, Python assigns it to the function's `__doc__` attribute.
- `operation`: A new variable name.
- `=`: Assignment operator.
- `calculate_stats`: A reference to the function object itself, *without* parentheses, meaning we are assigning the object, not calling it.

### CS lens
This is **metadata** and **first-class functions / higher-order functions**. Real-world places it appears:
- HTML `<meta>` tags describing a webpage.
- Passing a callback function to a UI button click event.
- Sorting algorithms that accept a custom comparison function.

### SE lens
**Self-Documenting Code vs. Explicit Documentation**. The principle of embedding usage instructions directly alongside the code. The alternative not chosen is maintaining a separate wiki or text file for documentation. The tradeoff is that inline docstrings clutter the source file slightly, but they guarantee the documentation lives with the code and is accessible via introspection tools like `help()`.

### Commands needed
None for this unit.

### Run it
Predicted confidently: No output; only defining a docstring and assigning a variable.

### One sentence connecting to previous unit
With all the pieces in place, we can now see how parameters, scope, execution, and return values flow together in a complete program.

## Closing
### Connect the pieces
When we execute a function call like `greet('Alice', greeting='Hi')`, the entire life cycle of a function comes into play. First, Python looks up the name `greet` (using the **LEGB rule**) to find the function object (a **first-class object** with a **docstring**). Next, it creates a new **local scope** for this specific call. It performs **parameter binding**, matching the **positional argument** `'Alice'` to the first parameter, and the **keyword argument** `'greeting='Hi'` to the second, overriding its **default value**. As the body executes, any variables created live only in that local scope. Finally, the function reaches a `return` statement, ending the local scope's execution and sending the computed output (the **return value**) back to the caller to be used in the rest of the program.
