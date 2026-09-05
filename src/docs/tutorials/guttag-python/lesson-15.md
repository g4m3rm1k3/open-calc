# Lesson 15: Exceptions — try, except, raise, finally

**What you will build**
The reader understands Python's exception mechanism: try/except/else/finally, raising exceptions with raise, defining custom exception classes, and the difference between EAFP (Easier to Ask Forgiveness than Permission) vs. LBYL (Look Before You Leap). The transferable insight: exceptions are not just for errors — they are Python's mechanism for communicating unexpected conditions between caller and callee. Raising an exception unwinds the call stack until a matching except clause catches it.

**What you need to know first**
Lessons 00-14.

**Terms used in this lesson**
- **Exception** — Python's mechanism for handling errors and unexpected conditions during execution, allowing the program to respond rather than crash.
- **EAFP (Easier to Ask Forgiveness than Permission)** — A coding style in Python where you assume valid keys or attributes exist and catch exceptions if the assumption proves false.
- **LBYL (Look Before You Leap)** — A coding style where you explicitly check for pre-conditions before making calls or lookups.

**Objects and methods used**
- **Exception (class)**
  - *What it is:* The base class for all built-in, non-system-exiting exceptions.
  - *Implementation:* `class Exception(BaseException): pass`
  - *Its use:* Used as the base class when defining custom exceptions.
  - *Type:* Class
  - *Responsibility:* Provides a common root for all regular error types, allowing broad except clauses to catch user-level errors without catching system exits.
  - *Depends on:* Nothing explicitly, inherits from BaseException.
  - *Connects to:* Subclassed by ValueError, TypeError, and custom exceptions.
  - *Shape:* A standard library base class.

- **ValueError (class)**
  - *What it is:* An exception raised when an operation or function receives an argument that has the right type but an inappropriate value.
  - *Implementation:* `class ValueError(Exception): pass`
  - *Its use:* Raised or caught when validating data, like string to int conversions.
  - *Type:* Class
  - *Responsibility:* Signals a mismatch in expected value ranges or formatting.
  - *Depends on:* Inherits from Exception.
  - *Connects to:* Python's parsing functions like `int()`.
  - *Shape:* Standard library exception.

- **TypeError (class)**
  - *What it is:* An exception raised when an operation or function is applied to an object of inappropriate type.
  - *Implementation:* `class TypeError(Exception): pass`
  - *Its use:* Raised or caught to guard against wrong types being passed to logic.
  - *Type:* Class
  - *Responsibility:* Prevents operations on incompatible types.
  - *Depends on:* Inherits from Exception.
  - *Connects to:* Type-checking logic or built-in functions.
  - *Shape:* Standard library exception.

- **ZeroDivisionError (class)**
  - *What it is:* An exception raised when the second argument of a division or modulo operation is zero.
  - *Implementation:* `class ZeroDivisionError(ArithmeticError): pass`
  - *Its use:* Caught to handle attempts to divide by zero safely.
  - *Type:* Class
  - *Responsibility:* Prevents the program from crashing on illegal arithmetic.
  - *Depends on:* Inherits from ArithmeticError.
  - *Connects to:* The `/` and `%` operators.
  - *Shape:* Standard library exception.

- **FileNotFoundError (class)**
  - *What it is:* An exception raised when a file or directory is requested but doesn't exist.
  - *Implementation:* `class FileNotFoundError(OSError): pass`
  - *Its use:* Caught when attempting to open a file for reading.
  - *Type:* Class
  - *Responsibility:* Signals that the OS cannot locate the specified path.
  - *Depends on:* Inherits from OSError.
  - *Connects to:* The `open()` built-in function.
  - *Shape:* Standard library exception.

- **isinstance()**
  - *What it is:* A built-in function that returns True if the specified object is of the specified type.
  - *Implementation:* `def isinstance(obj, class_or_tuple, /): ...`
  - *Its use:* Used to explicitly check type before proceeding.
  - *Type:* Built-in function
  - *Responsibility:* Determines if an object matches a given class or tuple of classes.
  - *Depends on:* The object to check, and the class to check against.
  - *Connects to:* Type validation branches (LBYL).
  - *Shape:* Global built-in.

- **open()**
  - *What it is:* A built-in function to open a file and return a corresponding file object.
  - *Implementation:* `def open(file, mode='r', ...): ...`
  - *Its use:* Used to read a file from the filesystem.
  - *Type:* Built-in function
  - *Responsibility:* Interfaces with the OS to provide a stream to a file.
  - *Depends on:* File path string and mode string.
  - *Connects to:* File objects, filesystem.
  - *Shape:* Global built-in.

- **int()**
  - *What it is:* A built-in function to convert a number or string to an integer.
  - *Implementation:* `class int(x=0): ...`
  - *Its use:* Parsing strings to integer types.
  - *Type:* Built-in class/function
  - *Responsibility:* Parses base-10 numerical representations into actual integer values.
  - *Depends on:* A string or numeric argument.
  - *Connects to:* `ValueError` on failure.
  - *Shape:* Global built-in.

## Concept Unit: try / except — catching exceptions

### The Problem
When performing division, what happens if the denominator is zero? Does the program crash entirely? How can we handle this error gracefully without halting execution completely?

### Introduce the concept in isolation
```python
try:
    print(10 / 0)
except ZeroDivisionError:
    print('Caught a division by zero!')
```
This is called a **try/except block**. Output: `Caught a division by zero!`. This PROVES that dividing by zero raises an exception, which the `except` block catches, preventing a crash.

### Discard the throwaway
The throwaway example above is discarded and will not appear in the project.

### Project Change
- **Reference Source**: No reference counterpart — this is a from-scratch addition because we are illustrating basic error handling.
- **Files affected**: `math_utils.py` (created)
- **Change type**: add
- **Location**: Top of file
- **Dependencies**: None

### The New Code
```python
def safe_divide(a, b):
    try:
        result = a / b          # may raise ZeroDivisionError
        return result
    except ZeroDivisionError:
        print('Cannot divide by zero')
        return None
```

### The Updated Project
```python
1: def safe_divide(a, b):
2:     try: # ← new
3:         result = a / b          # ← new
4:         return result           # ← new
5:     except ZeroDivisionError:   # ← new
6:         print('Cannot divide by zero') # ← new
7:         return None             # ← new
```
This structure creates a function that wraps a division in a try block, returning a safe default if a specific error is encountered.

### Mechanical walkthrough
- `def safe_divide(a, b):` defines a new function taking two arguments.
- `try:` opens a block of code that might raise an exception.
- `result = a / b` performs the division. If `b` is 0, execution immediately halts here and jumps to the except block.
- `return result` returns the answer if no exception occurred.
- `except ZeroDivisionError:` catches specifically the ZeroDivisionError type.
- `print('Cannot divide by zero')` outputs a user-friendly error message.
- `return None` provides a fallback value instead of crashing.

### CS lens
**Exception Handling**. This pattern appears in database connections (handling timeouts), network requests (handling dropped packets), and file parsing (handling corrupted formats).

### SE lens
**Graceful Degradation**. By returning None instead of crashing, we allow the caller to decide what to do next. The alternative (letting the program crash) forces the user out of the application entirely.

### Commands needed
`None for this unit.`

### Run it
Predicted confidently: 
`print(safe_divide(10, 2))` returns `5.0`. 
`print(safe_divide(10, 0))` prints `Cannot divide by zero` and returns `None`.

### One sentence connecting to previous unit
Now that we can catch one error, let's look at handling multiple possible errors from the same operation.

## Concept Unit: Multiple except clauses and exception hierarchy

### The Problem
What if a single operation can fail in multiple different ways? If a user passes a string instead of a number, or an invalid string format, how do we distinguish between these distinct failure modes?

### Introduce the concept in isolation
```python
try:
    int(None)
except ValueError:
    print('ValueError')
except TypeError:
    print('TypeError')
```
This is called **multiple except clauses**. Output: `TypeError`. This PROVES that Python evaluates except clauses top-to-bottom and executes only the first one that matches the exception type raised.

### Discard the throwaway
The throwaway example above is discarded and will not appear in the project.

### Project Change
- **Reference Source**: No reference counterpart — this is a from-scratch addition because we are illustrating exception hierarchies.
- **Files affected**: `math_utils.py` (modified)
- **Change type**: add
- **Location**: Bottom of file
- **Dependencies**: None

### The New Code
```python
def parse_int(s):
    try:
        return int(s)
    except ValueError:
        print(f'Not a valid integer: {s!r}')
        return None
    except TypeError:
        print(f'Expected string, got {type(s).__name__}')
        return None
```

### The Updated Project
```python
1: def safe_divide(a, b):
...
8: 
9: def parse_int(s): # ← new
10:     try: # ← new
11:         return int(s) # ← new
12:     except ValueError: # ← new
13:         print(f'Not a valid integer: {s!r}') # ← new
14:         return None # ← new
15:     except TypeError: # ← new
16:         print(f'Expected string, got {type(s).__name__}') # ← new
17:         return None # ← new
```
This function safely attempts to convert an input to an integer, catching distinct errors separately.

### Mechanical walkthrough
- `def parse_int(s):` defines a function taking a string `s`.
- `try:` begins the block to attempt conversion.
- `return int(s)` attempts to convert `s` to an integer. This can raise `ValueError` (for invalid formats like `'abc'`) or `TypeError` (for wrong types like `None`).
- `except ValueError:` catches format errors.
- `print(f'Not a valid integer: {s!r}')` logs the formatting issue.
- `return None` handles the failure gracefully.
- `except TypeError:` catches invalid data types.
- `print(f'Expected string, got {type(s).__name__}')` logs the type error dynamically.
- `return None` also handles this failure gracefully.

### CS lens
**Exception Hierarchy**. In Python, `Exception` acts as the base class for `ValueError` and `TypeError`. Catching an exception higher up the hierarchy catches all its subclasses. Always catch specific exceptions (leaf nodes) before generic ones.

### SE lens
**Specificity in Error Handling**. By explicitly catching `ValueError` and `TypeError` instead of a bare `except:`, we ensure we don't accidentally swallow unrelated errors like `KeyboardInterrupt` (Ctrl+C), which could make the program un-killable.

### Commands needed
`None for this unit.`

### Run it
Predicted confidently:
`print(parse_int('42'))` returns `42`.
`print(parse_int('abc'))` prints `Not a valid integer: 'abc'` and returns `None`.
`print(parse_int(None))` prints `Expected string, got NoneType` and returns `None`.

### One sentence connecting to previous unit
We've seen how to catch exceptions raised by built-in Python functions, but what if our own logic detects an invalid condition?

## Concept Unit: raise — signalling errors from your own code

### The Problem
If a function receives arguments that are valid types but violate business logic (like a negative age), how can the function forcibly halt its execution and alert the caller to the invalid state?

### Introduce the concept in isolation
```python
age = -5
if age < 0:
    raise ValueError("Age cannot be negative")
```
This is called **raising an exception**. Output: `ValueError: Age cannot be negative`. This PROVES that we can manually trigger the exception mechanism from our own code using the `raise` keyword.

### Discard the throwaway
The throwaway example above is discarded and will not appear in the project.

### Project Change
- **Reference Source**: No reference counterpart — this is a from-scratch addition because we are illustrating raising exceptions.
- **Files affected**: `math_utils.py` (modified)
- **Change type**: add
- **Location**: Bottom of file
- **Dependencies**: None

### The New Code
```python
def set_age(age):
    if not isinstance(age, int):
        raise TypeError(f'age must be int, got {type(age).__name__}')
    if age < 0 or age > 150:
        raise ValueError(f'age must be 0-150, got {age}')
    return age
```

### The Updated Project
```python
17:         return None
18: 
19: def set_age(age): # ← new
20:     if not isinstance(age, int): # ← new
21:         raise TypeError(f'age must be int, got {type(age).__name__}') # ← new
22:     if age < 0 or age > 150: # ← new
23:         raise ValueError(f'age must be 0-150, got {age}') # ← new
24:     return age # ← new
```
This logic explicitly rejects bad data by raising built-in exception types with custom messages.

### Mechanical walkthrough
- `def set_age(age):` defines a function taking a single argument.
- `if not isinstance(age, int):` checks if the provided argument is an integer type.
- `raise TypeError(...)` halts execution and throws a type error up the call stack if it's not an int.
- `if age < 0 or age > 150:` applies business logic bounds checking to the integer value.
- `raise ValueError(...)` halts execution and throws a value error up the call stack if bounds are exceeded.
- `return age` executes only if all checks pass.

### CS lens
**Fail-Fast Design**. Raising an error immediately upon discovering invalid state prevents bad data from persisting and causing confusing side-effects later on.

### SE lens
**LBYL vs EAFP**. Here we use LBYL (Look Before You Leap) to explicitly validate arguments before proceeding, returning precise exceptions. Python often prefers EAFP (Easier to Ask Forgiveness than Permission), but LBYL is appropriate for guarding business rules that don't trigger built-in operations.

### Commands needed
`None for this unit.`

### Run it
Predicted confidently:
`try: set_age(-5)` catches `ValueError: age must be 0-150, got -5`.
`try: set_age('old')` catches `TypeError: age must be int, got str`.

### One sentence connecting to previous unit
Sometimes, whether an exception occurs or not, there are cleanup tasks that must unconditionally happen.

## Concept Unit: finally and else

### The Problem
If a function opens a file, it must close that file when finished. If an exception happens while reading, how do we guarantee the file is closed, since a raised exception immediately halts normal block execution?

### Introduce the concept in isolation
```python
try:
    print('Trying')
except Exception:
    print('Failed')
finally:
    print('Cleanup')
```
This is called the **finally block**. Output: `Trying\nCleanup`. This PROVES that the code inside a `finally` block runs unconditionally, even when no exception occurs (and even if one does).

### Discard the throwaway
The throwaway example above is discarded and will not appear in the project.

### Project Change
- **Reference Source**: No reference counterpart — this is a from-scratch addition because we are illustrating finally blocks.
- **Files affected**: `file_utils.py` (created)
- **Change type**: add
- **Location**: Top of file
- **Dependencies**: None

### The New Code
```python
def read_file(path):
    f = None
    try:
        f = open(path, 'r')
        content = f.read()
        return content
    except FileNotFoundError:
        print(f'File not found: {path}')
        return None
    else:
        print('File read successfully')
    finally:
        if f is not None:
            f.close()
        print('Cleanup done')
```

### The Updated Project
```python
1: def read_file(path): # ← new
2:     f = None # ← new
3:     try: # ← new
4:         f = open(path, 'r') # ← new
5:         content = f.read() # ← new
6:         return content # ← new
7:     except FileNotFoundError: # ← new
8:         print(f'File not found: {path}') # ← new
9:         return None # ← new
10:     else: # ← new
11:         print('File read successfully') # ← new
12:     finally: # ← new
13:         if f is not None: # ← new
14:             f.close() # ← new
15:         print('Cleanup done') # ← new
```
This handles opening a file, returning its content on success, and guaranteeing the file handle is closed regardless of outcome.

### Mechanical walkthrough
- `f = None` initializes the variable so the `finally` block can safely check it.
- `try:` starts the block where file operations happen.
- `f = open(path, 'r')` attempts to open the file. This may raise `FileNotFoundError`.
- `content = f.read()` reads the file contents into memory.
- `return content` returns the string on success.
- `except FileNotFoundError:` catches the error if `open()` fails.
- `print(...)` and `return None` handle the missing file gracefully.
- `else:` executes **only if** the try block completes successfully without raising any exceptions.
- `print('File read successfully')` logs success (though note: standard `return` inside `try` bypasses `else`).
- `finally:` executes unconditionally.
- `if f is not None: f.close()` ensures we release system resources safely.

### CS lens
**Resource Management**. Operating systems have strict limits on open file handles or network sockets. Unconditionally releasing them using `finally` prevents resource leaks.

### SE lens
**The `else` Clause Tradeoff**. The `else` clause in Python's try/except is relatively rare. It makes the distinction between "code that might raise" (in `try`) and "code that should only run if the try succeeded" (in `else`) explicit.

### Commands needed
`None for this unit.`

### Run it
Predicted confidently:
`read_file('missing.txt')` traces: open() raises FileNotFoundError -> except FileNotFoundError catches -> else is skipped -> finally runs -> returns None.

### One sentence connecting to previous unit
When built-in errors aren't descriptive enough, we can define our own custom exception types to convey specific business logic failures.

## Concept Unit: Custom exception classes

### The Problem
If a bank account attempts an invalid withdrawal, raising a standard `ValueError` conveys that something was wrong, but how do we bundle the context (balance vs amount) into the error itself?

### Introduce the concept in isolation
```python
class MyError(Exception):
    pass

try:
    raise MyError()
except MyError:
    print('Caught custom error!')
```
This is called a **Custom exception class**. Output: `Caught custom error!`. This PROVES that we can define our own exceptions by subclassing `Exception` and use them in try/except flows exactly like built-in ones.

### Discard the throwaway
The throwaway example above is discarded and will not appear in the project.

### Project Change
- **Reference Source**: No reference counterpart — this is a from-scratch addition because we are illustrating custom exceptions.
- **Files affected**: `bank.py` (created)
- **Change type**: add
- **Location**: Top of file
- **Dependencies**: None

### The New Code
```python
class InsufficientFundsError(Exception):
    def __init__(self, balance, amount):
        self.balance = balance
        self.amount = amount
        super().__init__(f'Cannot withdraw {amount}: balance is {balance}')

class BankAccount:
    def __init__(self, balance):
        self.balance = balance

    def withdraw(self, amount):
        if amount > self.balance:
            raise InsufficientFundsError(self.balance, amount)
        self.balance -= amount
        return self.balance
```

### The Updated Project
```python
1: class InsufficientFundsError(Exception): # ← new
2:     def __init__(self, balance, amount): # ← new
3:         self.balance = balance # ← new
4:         self.amount = amount # ← new
5:         super().__init__(f'Cannot withdraw {amount}: balance is {balance}') # ← new
6: 
7: class BankAccount: # ← new
8:     def __init__(self, balance): # ← new
9:         self.balance = balance # ← new
10: 
11:     def withdraw(self, amount): # ← new
12:         if amount > self.balance: # ← new
13:             raise InsufficientFundsError(self.balance, amount) # ← new
14:         self.balance -= amount # ← new
15:         return self.balance # ← new
```
This creates a robust data model where specific domain errors are treated as their own identifiable class types.

### Mechanical walkthrough
- `class InsufficientFundsError(Exception):` creates a custom error inheriting from the base `Exception`.
- `def __init__(self, balance, amount):` allows the exception to accept specific context.
- `self.balance = balance` and `self.amount = amount` save context as properties on the exception object.
- `super().__init__(...)` delegates to the parent `Exception` class to set the main string message.
- `class BankAccount:` sets up the consumer of the error.
- `if amount > self.balance:` checks the business logic rule.
- `raise InsufficientFundsError(self.balance, amount)` instantiates the custom error and raises it immediately, halting normal execution.

### CS lens
**Domain-Driven Exceptions**. By subclassing `Exception`, you create errors that speak the language of the business domain ("Insufficient Funds") rather than the language of the runtime ("Value Error").

### SE lens
**Exception Payloads**. Storing attributes like `.balance` and `.amount` directly on the exception instance allows the calling `except` block to programmatically react to the error (e.g., dynamically prompting the user for a top-up) without parsing string messages.

### Commands needed
`None for this unit.`

### Run it
Predicted confidently:
`acc = BankAccount(100)`
`try: acc.withdraw(150)`
`except InsufficientFundsError as e:` -> catches error, `e.balance` is `100`, `e.amount` is `150`.

### One sentence connecting to previous unit
With all the exception tools at our disposal, we can now trace exactly how Python resolves errors at runtime.

## Closing

### Connect the pieces
When tracking how exceptions bubble up and are resolved, let's trace `safe_divide(10, 0)` from the start of the lesson through its entire lifecycle:
- Python enters the `try` block and attempts the expression `10 / 0`.
- The division operation immediately fails; Python intercepts the fault and instantiates a `ZeroDivisionError` object.
- Normal line-by-line execution halts instantly; the remainder of the `try` block is abandoned.
- Python looks for a matching `except` clause. It finds `except ZeroDivisionError`.
- Execution jumps into this block. If we had a `finally` block here, Python would execute it immediately after the `except` block concluded.
- The `except` block returns `None`, safely bypassing the error and returning control to the original caller without crashing the program.
