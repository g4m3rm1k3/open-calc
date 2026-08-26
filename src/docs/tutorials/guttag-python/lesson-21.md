# Lesson 21: Program Structure — Decomposition and Style

The reader will learn to structure programs using decomposition (splitting into small, focused functions), write docstrings and type hints, follow PEP 8 style, and organise a multi-file project. The transferable problems: (1) decomposition — each function should do ONE thing and do it well; long functions that do many things are hard to test, debug, and reuse; (2) docstrings and type hints are not decoration — they are a contract between the function and its callers; (3) PEP 8 is not about aesthetics — consistent style makes code readable by any Python developer.

What you need to know first
Lessons 0–20

Terms used in this lesson
- **Decomposition** — breaking a large, complex problem or function into smaller, manageable, and independent parts. This exists so that each part can be understood, tested, and modified without needing to hold the entire system in your head at once.
- **Single-responsibility principle** — a software engineering design principle stating that a function, module, or class should have one, and only one, reason to change. It solves the problem of entangled logic where changing how data is read accidentally breaks how data is printed.
- **Docstring** — a string literal specified as the first statement in a module, function, class, or method definition. It exists to provide a formal contract and documentation that tools like `help()` can extract, explaining what the code does rather than how it does it.
- **Type hint** — annotations added to function parameters and return values that declare the expected types of variables. They solve the problem of implicit contracts by making expectations explicit for developers and static analysis tools (like mypy or IDEs), even though Python does not enforce them at runtime.
- **PEP 8** — the official style guide for Python code. It solves the problem of cognitive friction when reading other people's code by establishing a universal aesthetic and formatting standard across all Python projects.
- **Module** — a single file containing Python code. It exists to group related functions, variables, and classes together, keeping the global namespace clean and allowing reuse across different scripts.
- **Package** — a directory containing multiple modules. It exists to organise large codebases into a hierarchical structure.

Objects and methods used

- **`open`**
  - *What it is:* a built-in Python function that opens a file and returns a corresponding file object.
  - *Implementation:* `open(file, mode='r', buffering=-1, encoding=None, errors=None, newline=None, closefd=True, opener=None)`
  - *Its use:* used here to read lines from a text file containing numbers.
  - *Type:* built-in function.
  - *Responsibility:* manages the OS-level request to open a file descriptor and provides an interface to read from or write to it.
  - *Depends on:* a file path (string or path-like object).
  - *Connects to:* called by application code, communicates with the operating system's file system, and returns an iterable file object.
  - *Shape:* standard library API boundary between the application and the host operating system.

- **`sum`**
  - *What it is:* a built-in Python function that adds the items of an iterable.
  - *Implementation:* `sum(iterable, /, start=0)`
  - *Its use:* used to calculate the total of a list of numbers for statistical analysis.
  - *Type:* built-in function.
  - *Responsibility:* computes the mathematical sum of all numeric elements in a collection, starting with an optional initial value.
  - *Depends on:* an iterable containing numeric values (integers or floats).
  - *Connects to:* called by statistical functions; reads from lists or generators.
  - *Shape:* standard library utility function.

- **`len`**
  - *What it is:* a built-in Python function that returns the number of items in a container.
  - *Implementation:* `len(s)`
  - *Its use:* used to count the number of elements in our parsed data list to calculate the mean.
  - *Type:* built-in function.
  - *Responsibility:* retrieves the size (length) of a collection.
  - *Depends on:* a sequence (like a string, tuple, list, or range) or a collection (like a dictionary, set, or frozen set).
  - *Connects to:* called by application code; interacts with the object's `__len__` magic method.
  - *Shape:* standard library utility function.

- **`help`**
  - *What it is:* a built-in Python function for invoking the interactive help system.
  - *Implementation:* `help([object])`
  - *Its use:* used to demonstrate how docstrings are extracted and displayed to developers.
  - *Type:* built-in function.
  - *Responsibility:* reads the `__doc__` attribute of an object and prints it in a formatted, paginated way for human consumption.
  - *Depends on:* any Python object (module, class, function, or keyword).
  - *Connects to:* called interactively by developers; reads object metadata and writes to standard output.
  - *Shape:* diagnostic tool used at the top-level REPL or console.

- **`dict.get`**
  - *What it is:* a method on Python dictionary objects that retrieves a value for a key if it exists, or a default value if it does not.
  - *Implementation:* `dict.get(key, default=None)`
  - *Its use:* used to safely attempt to retrieve a user by ID without risking a `KeyError`.
  - *Type:* instance method on `dict`.
  - *Responsibility:* provides safe dictionary access that returns a fallback value instead of raising an exception for missing keys.
  - *Depends on:* a dictionary instance and a key to look up.
  - *Connects to:* called by application logic querying data dictionaries.
  - *Shape:* core data structure query method.

- **`sys.argv`**
  - *What it is:* a list in the `sys` module containing the command-line arguments passed to a Python script.
  - *Implementation:* `sys.argv` (a `list` of `str`)
  - *Its use:* used to read the filename passed by the user when running the script from the terminal.
  - *Type:* module-level list attribute.
  - *Responsibility:* stores the raw string arguments from the OS invocation of the script, where the first element is the script name itself.
  - *Depends on:* the Python interpreter's startup initialization from the OS.
  - *Connects to:* read by the application's main entry point to determine inputs.
  - *Shape:* input boundary between the host OS shell and the Python application.

- **`sys.exit`**
  - *What it is:* a function in the `sys` module that exits Python.
  - *Implementation:* `sys.exit([arg])`
  - *Its use:* used to terminate the script with a non-zero exit code if the user provides the wrong number of arguments.
  - *Type:* module-level function.
  - *Responsibility:* raises a `SystemExit` exception to signal the interpreter to shut down, passing an optional exit status to the OS.
  - *Depends on:* an integer status code (0 for success, non-zero for error) or an error message string.
  - *Connects to:* called by application error handling; communicates termination status back to the calling shell.
  - *Shape:* output boundary for process lifecycle management.

- **`argparse.ArgumentParser`**
  - *What it is:* a class in the standard library for parsing command-line options, arguments, and sub-commands.
  - *Implementation:* `class argparse.ArgumentParser(prog=None, usage=None, description=None, epilog=None, ...)`
  - *Its use:* used to build a robust, self-documenting command-line interface for the project.
  - *Type:* standard library class.
  - *Responsibility:* defines what arguments the program requires, figures out how to parse those out of `sys.argv`, and automatically generates help and usage messages.
  - *Depends on:* configuration parameters (like a description string).
  - *Connects to:* instantiated by the application entry point; parses `sys.argv`.
  - *Shape:* standard library tool handling input parsing at the application boundary.

- **`argparse.ArgumentParser.add_argument`**
  - *What it is:* a method to define how a single command-line argument should be parsed.
  - *Implementation:* `ArgumentParser.add_argument(name or flags..., [action], [nargs], [const], [default], [type], [choices], [required], [help], [metavar], [dest])`
  - *Its use:* used to register positional arguments like `filename` and optional flags like `--verbose`.
  - *Type:* instance method on `ArgumentParser`.
  - *Responsibility:* registers a specific argument rule, detailing its type, default value, and help text.
  - *Depends on:* an `ArgumentParser` instance, argument flags (e.g., `'-v'`), and parsing options.
  - *Connects to:* called during CLI setup; modifies the parser's internal schema.
  - *Shape:* configuration method for the CLI parser.

- **`argparse.ArgumentParser.parse_args`**
  - *What it is:* a method that converts argument strings into objects and assigns them as attributes of the namespace.
  - *Implementation:* `ArgumentParser.parse_args(args=None, namespace=None)`
  - *Its use:* used to execute the parse and retrieve the structured argument namespace.
  - *Type:* instance method on `ArgumentParser`.
  - *Responsibility:* inspects the command line, converts strings to the specified types, and enforces required arguments.
  - *Depends on:* an `ArgumentParser` instance and implicitly `sys.argv`.
  - *Connects to:* called by the application entry point; returns an `argparse.Namespace` object containing the parsed data.
  - *Shape:* execution trigger for CLI parsing, crossing from configuration to populated data.


## Concept Unit: Decomposition

### The Problem

As programs grow, writing all your logic in a single function becomes unmanageable. Consider a task that reads a file of numbers, ignores invalid lines, computes basic statistics, and prints a report. If you write this as one function, it does everything at once:

```python
def process(filename):
    # reads file, cleans data, computes stats, prints report -- all in one
    f = open(filename)
    lines = f.readlines()
    f.close()
    numbers = []
    for line in lines:
        line = line.strip()
        if line:
            try:
                numbers.append(float(line))
            except ValueError:
                pass
    total = sum(numbers)
    mean = total / len(numbers) if numbers else 0
    print(f'Count: {len(numbers)}')
    print(f'Total: {total}')
    print(f'Mean:  {mean}')
```

If you want to test just the math part, you can't — you must provide a real file. If you want to reuse the parsing logic for a different calculation, you can't — it's glued to the printing logic. How do we break this apart so each piece does exactly one thing? 

> How would you split `process` into separate functions? What should each function take as input and return as output? Try sketching out the function names before continuing.

### Introduce the concept in isolation

We can split a monolithic task into independent functions. This is called **decomposition**, and it follows the **single-responsibility principle**.

```python
# Throwaway lab: Demonstrating decomposition
def get_greeting(name):
    return f"Hello, {name}!"

def print_message(message):
    print(message)

def run():
    msg = get_greeting("Alice")
    print_message(msg)

run()
```
Output:
```
Hello, Alice!
```
This proves that we can separate the logic that *computes* a value (`get_greeting`) from the logic that *consumes* or outputs it (`print_message`), coordinating them through a main runner function.

### Discard the throwaway example
We will discard this greeting example; it will not appear in our project.

### Project Change
- **Reference Source**: None (from scratch).
- **Files affected**: `stats.py` (created).
- **Change type**: add.
- **Location**: whole file.
- **Dependencies**: None.

### The New Code

```python
def read_numbers(filename):
    with open(filename) as f:
        return [line.strip() for line in f if line.strip()]

def parse_numbers(lines):
    result = []
    for line in lines:
        try:
            result.append(float(line))
        except ValueError:
            pass
    return result

def compute_stats(numbers):
    if not numbers:
        return {'count': 0, 'total': 0.0, 'mean': 0.0}
    return {
        'count': len(numbers),
        'total': sum(numbers),
        'mean': sum(numbers) / len(numbers)
    }

def print_report(stats):
    print(f"Count: {stats['count']}")
    print(f"Total: {stats['total']}")
    print(f"Mean:  {stats['mean']:.2f}")

def process(filename):
    lines   = read_numbers(filename)
    numbers = parse_numbers(lines)
    stats   = compute_stats(numbers)
    print_report(stats)
```

### The Updated Project

```python
1: def read_numbers(filename):
2:     with open(filename) as f:
3:         return [line.strip() for line in f if line.strip()]
4: 
5: def parse_numbers(lines):
6:     result = []
7:     for line in lines:
8:         try:
9:             result.append(float(line))
10:         except ValueError:
11:             pass
12:     return result
13: 
14: def compute_stats(numbers):
15:     if not numbers:
16:         return {'count': 0, 'total': 0.0, 'mean': 0.0}
17:     return {
18:         'count': len(numbers),
19:         'total': sum(numbers),
20:         'mean': sum(numbers) / len(numbers)
21:     }
22: 
23: def print_report(stats):
24:     print(f"Count: {stats['count']}")
25:     print(f"Total: {stats['total']}")
26:     print(f"Mean:  {stats['mean']:.2f}")
27: 
28: def process(filename):
29:     lines   = read_numbers(filename)
30:     numbers = parse_numbers(lines)
31:     stats   = compute_stats(numbers)
32:     print_report(stats)
```
The monolithic `process` function is now a coordinator that calls four specialized, independently testable functions.

### Mechanical walkthrough

- `read_numbers(filename)` reads raw lines from the disk. It handles the file resource but performs no mathematical operations.
- `parse_numbers(lines)` takes a list of strings and converts them to floats. It handles errors (bad data) but doesn't care where the strings came from.
- `compute_stats(numbers)` performs pure math. It takes a list of valid numbers and returns a dictionary of results. It relies on the built-in `sum()` function to compute the total, and `len()` to count the elements.
- `print_report(stats)` handles formatting and output. It uses formatted string literals (`f"..."`) to display the statistics to the terminal.
- `process(filename)` orchestrates the pipeline, passing the return value of one function as the argument to the next.

Each function now adheres to the **single-responsibility principle**. You can test `compute_stats` by just passing it `[1.0, 2.0]` without needing a text file on disk.


## Concept Unit: Docstrings

### The Problem

Our functions are small and focused, but looking just at `def compute_stats(numbers):`, another developer doesn't know what `numbers` should contain (Strings? Floats?) or what the function returns (A tuple? A dictionary?). How do we formalize the contract of a function so that tools and humans understand its exact behavior?

> If someone else wrote `compute_stats`, how would you expect them to tell you what it returns?

### Introduce the concept in isolation

We can attach formal documentation directly to a function using a **docstring**.

```python
# Throwaway lab: Demonstrating docstrings
def multiply(a, b):
    """
    Multiply two numbers together.
    
    Returns the mathematical product of a and b.
    """
    return a * b

print(multiply.__doc__)
```
Output:
```
    Multiply two numbers together.
    
    Returns the mathematical product of a and b.
```
This proves that a string literal placed immediately after a function definition is stored as the function's `__doc__` attribute, making it programmatically accessible.

### Discard the throwaway example
We will discard this multiply example; it will not appear in our project.

### Project Change
- **Reference Source**: None.
- **Files affected**: `stats.py` (modified).
- **Change type**: replace.
- **Location**: Inside `compute_stats`.
- **Dependencies**: None.

### The New Code

```python
def compute_stats(numbers):
    """
    Compute basic statistics for a list of numbers.

    Args:
        numbers (list[float]): A non-empty list of numeric values.

    Returns:
        dict: A dictionary with keys 'count' (int), 'total' (float),
              and 'mean' (float).

    Raises:
        (returns zero stats for empty input rather than raising)

    Examples:
        >>> compute_stats([1.0, 2.0, 3.0])
        {'count': 3, 'total': 6.0, 'mean': 2.0}
        >>> compute_stats([])
        {'count': 0, 'total': 0.0, 'mean': 0.0}
    """
    if not numbers:
        return {'count': 0, 'total': 0.0, 'mean': 0.0}
    return {
        'count': len(numbers),
        'total': sum(numbers),
        'mean': sum(numbers) / len(numbers)
    }
```

### The Updated Project

```python
1: def compute_stats(numbers):
2:     """
3:     Compute basic statistics for a list of numbers.
4: 
5:     Args:
6:         numbers (list[float]): A non-empty list of numeric values.
7: 
8:     Returns:
9:         dict: A dictionary with keys 'count' (int), 'total' (float),
10:               and 'mean' (float).
11: 
12:     Raises:
13:         (returns zero stats for empty input rather than raising)
14: 
15:     Examples:
16:         >>> compute_stats([1.0, 2.0, 3.0])
17:         {'count': 3, 'total': 6.0, 'mean': 2.0}
18:         >>> compute_stats([])
19:         {'count': 0, 'total': 0.0, 'mean': 0.0}
20:     """
21:     if not numbers:
22:         return {'count': 0, 'total': 0.0, 'mean': 0.0}
23:     return {
24:         'count': len(numbers),
25:         'total': sum(numbers),
26:         'mean': sum(numbers) / len(numbers)
27:     }
```
The `compute_stats` function now explicitly documents its inputs, outputs, and edge cases.

### Mechanical walkthrough

- `""" ... """` denotes a multi-line string. Because it is the first statement in the function body, Python registers it as a **docstring**.
- The `Args:` section specifies the expected parameters.
- The `Returns:` section specifies the output structure (a dictionary with specific keys).
- The `Raises:` section documents any exceptions the function might intentionally throw (in this case, none, but it clarifies the behavior on empty inputs).
- The `Examples:` section provides REPL-style usage examples. Tools like `doctest` can automatically run these examples to ensure the function works as documented.
- If a user runs `help(compute_stats)` in the interactive interpreter, this exact string is formatted and displayed to them. A function without a docstring has no explicit contract.


## Concept Unit: Type Hints

### The Problem

Docstrings are great for humans, but what about IDEs or automated checkers? A docstring is just text. If a developer accidentally passes a string instead of a list of floats to `parse_numbers`, they won't know until the program crashes at runtime. How can we make these expectations readable by tooling?

> How could an editor like VS Code know that `lines` should be a list of strings?

### Introduce the concept in isolation

We can annotate variables, parameters, and return values with **type hints**.

```python
# Throwaway lab: Demonstrating type hints
def repeat_word(word: str, times: int) -> str:
    return word * times

print(repeat_word("hi", 3))
```
Output:
```
hihihi
```
This proves that adding `: type` after a parameter and `-> type` after the parameter list specifies expected types. Notably, Python ignores these at runtime; they are metadata for external tools.

### Discard the throwaway example
We will discard this type hint example; it will not appear in our project.

### Project Change
- **Reference Source**: None.
- **Files affected**: `stats.py` (modified).
- **Change type**: replace.
- **Location**: Inside `parse_numbers`.
- **Dependencies**: None.

### The New Code

```python
def parse_numbers(lines: list[str]) -> list[float]:
    result: list[float] = []
    for line in lines:
        try:
            result.append(float(line))
        except ValueError:
            pass
    return result
```

### The Updated Project

```python
1: def parse_numbers(lines: list[str]) -> list[float]:
2:     result: list[float] = []
3:     for line in lines:
4:         try:
5:             result.append(float(line))
6:         except ValueError:
7:             pass
8:     return result
```
The function signature now formally declares its inputs and outputs using type hints.

### Mechanical walkthrough

- `lines: list[str]` specifies that the `lines` parameter must be a list containing strings.
- `-> list[float]` indicates that the function returns a list containing floats.
- `result: list[float] = []` annotates a local variable. This is often optional but helps static type checkers (like `mypy`) understand empty lists.
- **Type hints are NOT enforced at runtime.** If you call `parse_numbers(42)`, Python will try to run it (and crash with a `TypeError` when it tries to iterate over an integer). Type hints are read by type checkers and IDEs to warn developers of errors *before* the code runs.


## Concept Unit: PEP 8

### The Problem

If ten different developers write Python, they might format it ten different ways. Some use tabs, some use spaces. Some use `CamelCase`, others `snake_case`. This makes jumping between codebases jarring and error-prone. How do we ensure all Python code looks consistent?

> Look at this badly styled code: `def calc(x,y,z=10): A=x+y; return True if A>z else False`. What makes it hard to read?

### Introduce the concept in isolation

We adhere to **PEP 8**, the official Python style guide.

```python
# Throwaway lab: Demonstrating PEP 8 rules
# BAD:
def calc(x,y,z=10):
    A=x+y
    if A>z: return True
    else:
        return False

# GOOD (PEP 8):
def calc(x, y, z=10):
    total = x + y
    if total > z:
        return True
    return False

print(calc(5, 6))
```
Output:
```
True
```
This proves that logic remains identical, but adding whitespace and proper naming makes code vastly more readable.

### Discard the throwaway example
We will discard this styling example; it will not appear in our project.

### Project Change
- **Reference Source**: None.
- **Files affected**: None.
- **Change type**: configure.
- **Location**: N/A.
- **Dependencies**: None.

### The New Code
No new code is added to our project in this step; instead, we apply the following formatting rules to everything we write.

### The Updated Project
*(No change to project files, just an applied standard.)*

### Mechanical walkthrough

Key **PEP 8** rules applied throughout our project:
- **Indentation:** use 4 spaces per indentation level. Never use tabs.
- **Naming conventions:** use `snake_case` for variables and functions (e.g., `compute_stats`); use `CamelCase` for classes; use `ALL_CAPS` for constants.
- **Whitespace:** surround assignment operators (`=`) and mathematical operators (`+`, `-`) with a single space (`x = 1 + 2`). Do *not* put spaces around `=` when used to indicate a keyword argument or default parameter value (`def f(key=value)`).
- **Line length:** limit all lines to a maximum of 79 characters (or 99 in modern environments).
- **Blank lines:** surround top-level function and class definitions with two blank lines.
- **Imports:** put imports at the very top of the file, on separate lines, grouped by standard library, third-party libraries, and local application imports.


## Concept Unit: The `if __name__ == '__main__'` pattern

### The Problem

If we import `stats.py` into another file to reuse `compute_stats`, Python executes every top-level statement in `stats.py` during the import. If `stats.py` ends with a bare `process("data.txt")` call, that call runs every time someone imports the file! How do we make a script executable from the command line, but safe to import as a library?

> How does Python know if a script is being run directly vs being imported?

### Introduce the concept in isolation

We can use the `if __name__ == '__main__':` execution guard.

```python
# Throwaway lab: Demonstrating __name__
# Normally this would be in a file. If run directly, __name__ is '__main__'.
print(f"My name is: {__name__}")
```
Output:
```
My name is: __main__
```
This proves that when Python runs a script directly, the special built-in variable `__name__` is assigned the string `'__main__'`. If the script is imported, `__name__` is set to the module's name instead.

### Discard the throwaway example
We will discard this print statement; it will not appear in our project.

### Project Change
- **Reference Source**: None.
- **Files affected**: `stats.py` (modified).
- **Change type**: add.
- **Location**: Bottom of the file.
- **Dependencies**: None.

### The New Code

```python
def main():
    import sys
    if len(sys.argv) != 2:
        print('Usage: python stats.py <filename>')
        sys.exit(1)
    filename = sys.argv[1]
    lines = read_numbers(filename)
    numbers = parse_numbers(lines)
    stats = compute_stats(numbers)
    print_report(stats)

if __name__ == '__main__':
    main()
```

### The Updated Project

```python
1: def compute_stats(numbers):
2:     ...
3: 
4: def print_report(stats):
5:     ...
6: 
7: def process(filename):
8:     ...
9: 
10: def main():
11:     import sys
12:     if len(sys.argv) != 2:
13:         print('Usage: python stats.py <filename>')
14:         sys.exit(1)
15:     filename = sys.argv[1]
16:     lines = read_numbers(filename)
17:     numbers = parse_numbers(lines)
18:     stats = compute_stats(numbers)
19:     print_report(stats)
20: 
21: if __name__ == '__main__':
22:     main()
```
The file now has a safe entry point that parses command-line arguments and coordinates the run.

### Mechanical walkthrough

- `def main():` defines a central entry point function. This is a convention, not a language requirement, but it keeps variables out of the global scope.
- `import sys` brings in the `sys` module, providing access to system-level parameters.
- `sys.argv` is a list where index 0 is the script name (`stats.py`) and index 1 is the first argument passed by the user (the filename).
- `sys.exit(1)` stops the program immediately. The `1` is a non-zero exit code, signaling to the OS shell that the program failed.
- `if __name__ == '__main__':` is a conditional block. It evaluates to `True` *only* if the file is being run directly (e.g., `python stats.py`). If the file is imported (e.g., `import stats`), the block evaluates to `False`, and `main()` is never called, making the file safe to use as a library.


## Concept Unit: Multi-file project layout

### The Problem

Putting all code into `stats.py` works for small scripts, but what if we have 50 functions? File IO, statistics calculations, and CLI logic all mixed together violate the single-responsibility principle at the file level. How should a Python codebase be organised into multiple files?

> Where would you place tests? Where would you put the file reading logic?

### Introduce the concept in isolation

We can structure our code into a **module** and **package** hierarchy.

*(Code execution exempt: File system directory trees cannot be meaningfully run in isolation here. We state the structural pattern directly.)*

A standard Python project layout:
```text
my_project/
    main.py
    stats.py
    io_utils.py
```
This pattern allows us to separate concerns. `main.py` handles execution, `io_utils.py` handles disk operations, and `stats.py` handles math.

### Discard the throwaway example
We will discard this abstract layout tree; it will not appear in our project.

### Project Change
- **Reference Source**: None.
- **Files affected**: `io_utils.py` (created), `main.py` (created), `stats.py` (modified).
- **Change type**: refactor.
- **Location**: Creating new files and splitting logic.
- **Dependencies**: None.

### The New Code

```python
# main.py
from stats import compute_stats, print_report
from io_utils import read_numbers, parse_numbers
import sys

def main():
    if len(sys.argv) != 2:
        print('Usage: python main.py <filename>')
        sys.exit(1)
    filename = sys.argv[1]
    lines = read_numbers(filename)
    numbers = parse_numbers(lines)
    stats = compute_stats(numbers)
    print_report(stats)

if __name__ == '__main__':
    main()
```

### The Updated Project

```text
1: my_project/
2:     main.py           <- entry point
3:     stats.py          <- statistics functions
4:     io_utils.py       <- file reading/writing
5:     tests/
6:         test_stats.py
7:         test_io.py
8:     data/
9:         numbers.txt
10:     README.md
```
The codebase is now split. `io_utils.py` holds `read_numbers` and `parse_numbers`. `stats.py` holds `compute_stats` and `print_report`. `main.py` glues them together.

### Mechanical walkthrough

- Each **module** (file) is responsible for one area of functionality.
- `from stats import compute_stats` reaches into `stats.py` and makes the `compute_stats` function available in the current namespace.
- `tests/` is a dedicated folder for automated testing code.
- `data/` safely isolates non-code artifacts.
- `README.md` documents the project for other developers.
- `main.py` acts as the single entry point. A user runs `python main.py`, which pulls dependencies from the other modules.


## Concept Unit: Using `argparse`

### The Problem

Handling `sys.argv` manually is error-prone. What if we want optional arguments like a `--verbose` flag? What if the user types `--help`? Writing custom logic to parse flags, handle defaults, and generate help text is tedious. How do we parse command-line arguments cleanly?

> How would you modify `sys.argv` checks to support `--output result.txt`?

### Introduce the concept in isolation

We can use the built-in `argparse` library.

```python
# Throwaway lab: Demonstrating argparse
import argparse

parser = argparse.ArgumentParser(description="Echo a word.")
parser.add_argument("word", help="The word to echo")
parser.add_argument("-upper", action="store_true", help="Uppercase it")

# We simulate sys.argv with a list of strings
args = parser.parse_args(["hello", "-upper"])
if args.upper:
    print(args.word.upper())
else:
    print(args.word)
```
Output:
```
HELLO
```
This proves that `argparse` takes declarative rules and automatically converts command-line strings into a structured object (`args`) where arguments are attributes.

### Discard the throwaway example
We will discard this echo parser; it will not appear in our project.

### Project Change
- **Reference Source**: None.
- **Files affected**: `main.py` (modified).
- **Change type**: replace.
- **Location**: Inside `main()`.
- **Dependencies**: `argparse` standard library.

### The New Code

```python
import argparse

def main():
    parser = argparse.ArgumentParser(description='Compute stats from a file')
    parser.add_argument('filename', help='Path to the input file')
    parser.add_argument('-v', '--verbose', action='store_true',
                        help='Print verbose output')
    parser.add_argument('-o', '--output', default=None,
                        help='Output file path (default: stdout)')
    args = parser.parse_args()

    print(args.filename)  # the positional argument
    print(args.verbose)   # True if -v was passed
    print(args.output)    # None or a file path
```

### The Updated Project

```python
1: from stats import compute_stats, print_report
2: from io_utils import read_numbers, parse_numbers
3: import argparse
4: import sys
5: 
6: def main():
7:     parser = argparse.ArgumentParser(description='Compute stats from a file')
8:     parser.add_argument('filename', help='Path to the input file')
9:     parser.add_argument('-v', '--verbose', action='store_true',
10:                         help='Print verbose output')
11:     parser.add_argument('-o', '--output', default=None,
12:                         help='Output file path (default: stdout)')
13:     args = parser.parse_args()
14: 
15:     print(args.filename)  
16:     print(args.verbose)   
17:     print(args.output)    
18: 
19: if __name__ == '__main__':
20:     main()
```
The manual `sys.argv` inspection has been replaced by a robust command-line parser.

### Mechanical walkthrough

- `argparse.ArgumentParser(description=...)` creates a parser object configured with a description of the program.
- `parser.add_argument('filename', ...)` registers a required *positional* argument.
- `parser.add_argument('-v', '--verbose', action='store_true', ...)` registers an optional flag. If passed, the flag is stored as `True` (due to `action='store_true'`).
- `parser.add_argument('-o', '--output', default=None)` registers an optional argument that expects an accompanying value (e.g., `-o out.txt`).
- `args = parser.parse_args()` reads from `sys.argv`, applies the rules, and returns a namespace object.
- If the user runs `python main.py --help`, `argparse` intercepts the call, automatically prints a formatted usage guide derived from the `help=` text, and gracefully exits.

Module 2 is complete. The reader can now handle exceptions, write tests, debug systematically, work with files, use closures and generators, and structure multi-file programs. Module 3 covers object-oriented programming. 

Exercises: refactor the word-frequency counter from Lesson 18 into a properly structured multi-file project with `main.py`, `io_utils.py`, `analysis.py`, and a `tests/` directory.
