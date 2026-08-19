# Lesson 15: Exceptions — `try`, `except`, `raise`, `finally`

**What you will build**
In this lesson, we will build several small robust functions that use Python's exception handling system to deal with runtime errors gracefully. You will learn the transferable problem of dealing with abnormal conditions: an exception is an object representing an error, propagating up the call stack until caught or crashing the program. You will learn why catching the RIGHT exception type is essential to avoid hiding bugs, and how to use `finally` for guaranteed cleanup like releasing resources.

**What you need to know first**
- Lessons 0–14 (all prior Python through modules).
- **Function definition** (`def`, `return`) — used to encapsulate code blocks.
- **Control flow** (`if`, `else`) — used for conditional logic.

**Terms used in this lesson**
- **Exception** — An object representing an abnormal condition or error that occurred during program execution. It propagates up the call stack until caught.
- **Traceback** — The report of the active call stack at the point where an exception occurred, showing the sequence of function calls that led to the error.
- **Catching** — Intercepting an exception using a `try`/`except` block to prevent it from crashing the program and to handle the error gracefully.
- **Raising** — The act of generating and throwing an exception object when an error condition is detected using the `raise` keyword.
- **Base class** — The parent class from which other classes inherit. Used heavily in the exception hierarchy.

**Objects and methods used**

- **`ZeroDivisionError`**
  - *What it is:* A built-in exception class representing an arithmetic division by zero.
  - *Implementation:* `class ZeroDivisionError(ArithmeticError)`
  - *Its use:* Raised and caught when division operations fail due to a zero denominator.
  - *Type:* Class.
  - *Responsibility:* Represents a math error where the second argument to a division or modulo operation is zero.
  - *Depends on:* Nothing (instantiated automatically by the Python runtime).
  - *Connects to:* Subclass of `ArithmeticError`, inherits from `Exception`.
  - *Shape:* Standard library built-in exception.

- **`ValueError`**
  - *What it is:* A built-in exception class representing an operation receiving an argument with the right type but inappropriate value.
  - *Implementation:* `class ValueError(Exception)`
  - *Its use:* Raised and caught when functions like `int()` receive unparseable strings.
  - *Type:* Class.
  - *Responsibility:* Signals that a value is unacceptable for an operation, despite being the correct type.
  - *Depends on:* An error message string describing the invalid value.
  - *Connects to:* Subclass of `Exception`.
  - *Shape:* Standard library built-in exception.

- **`TypeError`**
  - *What it is:* A built-in exception class representing an operation applied to an object of inappropriate type.
  - *Implementation:* `class TypeError(Exception)`
  - *Its use:* Raised and caught when operations are applied to wrong types (e.g., concatenating a string with an integer).
  - *Type:* Class.
  - *Responsibility:* Signals that an operation or function was applied to an incompatible type.
  - *Depends on:* An error message string describing the type mismatch.
  - *Connects to:* Subclass of `Exception`.
  - *Shape:* Standard library built-in exception.

- **`KeyError`**
  - *What it is:* A built-in exception class representing a missing key in a dictionary lookup.
  - *Implementation:* `class KeyError(LookupError)`
  - *Its use:* Raised and caught when accessing a dictionary with a key that does not exist.
  - *Type:* Class.
  - *Responsibility:* Signals a failed dictionary lookup.
  - *Depends on:* The missing key that caused the lookup to fail.
  - *Connects to:* Subclass of `LookupError`, inherits from `Exception`.
  - *Shape:* Standard library built-in exception.

- **`IndexError`**
  - *What it is:* A built-in exception class representing an out-of-range sequence index.
  - *Implementation:* `class IndexError(LookupError)`
  - *Its use:* Raised and caught when accessing a list or sequence with an invalid index.
  - *Type:* Class.
  - *Responsibility:* Signals a failed sequence lookup due to range limits.
  - *Depends on:* An error message string.
  - *Connects to:* Subclass of `LookupError`, inherits from `Exception`.
  - *Shape:* Standard library built-in exception.

- **`FileNotFoundError`**
  - *What it is:* A built-in exception class representing a failed attempt to open a non-existent file or directory.
  - *Implementation:* `class FileNotFoundError(OSError)`
  - *Its use:* Raised and caught when file I/O operations fail to find the requested path.
  - *Type:* Class.
  - *Responsibility:* Signals an OS-level failure to locate a file.
  - *Depends on:* The file path requested.
  - *Connects to:* Subclass of `OSError`, inherits from `Exception`.
  - *Shape:* Standard library built-in exception.

- **`Exception`**
  - *What it is:* The base class for all standard, catchable exceptions in Python.
  - *Implementation:* `class Exception(BaseException)`
  - *Its use:* Used as a base class for custom exceptions and to catch all standard errors.
  - *Type:* Class.
  - *Responsibility:* Serves as the root type for all standard errors in Python programs.
  - *Depends on:* Tuple of arguments (`self.args`), usually an error message.
  - *Connects to:* Subclass of `BaseException`.
  - *Shape:* Root of the standard exception hierarchy.

- **`BaseException`**
  - *What it is:* The absolute root class of the Python exception hierarchy.
  - *Implementation:* `class BaseException(object)`
  - *Its use:* Root hierarchy; generally not caught directly to avoid swallowing system exits.
  - *Type:* Class.
  - *Responsibility:* Root for all exception objects, including system-exiting ones.
  - *Depends on:* Tuple of arguments.
  - *Connects to:* Subclasses include `Exception`, `SystemExit`, and `KeyboardInterrupt`.
  - *Shape:* Top of the exception hierarchy.

- **`KeyboardInterrupt`**
  - *What it is:* A built-in exception class raised when the user hits the interrupt key (Ctrl+C).
  - *Implementation:* `class KeyboardInterrupt(BaseException)`
  - *Its use:* Signals that the program should terminate due to user intervention.
  - *Type:* Class.
  - *Responsibility:* Handle user interruption signals cleanly without being swallowed by broad `Exception` handlers.
  - *Depends on:* OS signal from the user.
  - *Connects to:* Subclass of `BaseException`, bypassing `Exception`.
  - *Shape:* System exception.

---

## Concept Unit: What an exception is

### The Problem

When Python encounters an operation that is impossible to perform — like dividing a number by zero or attempting to open a file that does not exist — it needs a way to signal this failure to the rest of the program.

If you are asked to divide a number by zero, what should the result be? If Python just returned `0` or `None`, you would have to check the result of every single division to ensure it was valid, and worse, `0` or `None` might be a perfectly valid result in other contexts, making it ambiguous. How can Python definitively stop the current sequence of events and say "something went wrong"?

### Introduce the concept in isolation

We can observe what happens when we intentionally try to perform an impossible mathematical operation.

```python
# Predicted output without execution:
>>> 1 / 0
Traceback (most recent call last):
  File "<stdin>", line 1, in <module>
ZeroDivisionError: division by zero
```

This output proves that Python does not silently fail or return a garbage value. Instead, it creates an object representing the error, halts normal execution, and prints a detailed report. This object is called an **Exception**.

### Discard the throwaway example

The REPL example above is discarded; we will not divide by zero on purpose in our project code.

### Project Change

No reference counterpart — this is a from-scratch addition because we are starting a new script to demonstrate various error states.

- **Files affected:** `errors.py` (created)
- **Change type:** Add
- **Location:** The entire file.
- **Dependencies:** None.

### The New Code

```python
int('abc')
[1, 2, 3][10]
{'a': 1}['b']
'hello' + 5
open('nonexistent.txt')
```

### The Updated Project

```python
# errors.py
# (Running any one of these lines in isolation produces an error)

int('abc')
# ValueError: invalid literal for int() with base 10: 'abc'

[1, 2, 3][10]
# IndexError: list index out of range

{'a': 1}['b']
# KeyError: 'b'

'hello' + 5
# TypeError: can only concatenate str (not "int") to str

open('nonexistent.txt')
# FileNotFoundError: [Errno 2] No such file or directory: 'nonexistent.txt'
```

Running any of these lines causes the program to crash immediately and display an error.

### Mechanical walkthrough

When Python encounters an error, it creates an exception object and **raises** it. If no code explicitly catches it, the exception propagates up the entire call stack, printing a traceback, and terminates the program.

- **`int('abc')`** calls the built-in integer conversion function with a string that contains no numbers. It raises a **`ValueError`**, an exception signaling that the type is right (a string) but the value is inappropriate.
- **`[1, 2, 3][10]`** attempts to access the 11th element of a 3-element list. It raises an **`IndexError`**, signaling an out-of-bounds sequence access.
- **`{'a': 1}['b']`** attempts to look up the key `'b'` in a dictionary that only contains `'a'`. It raises a **`KeyError`**, signaling a missing dictionary key.
- **`'hello' + 5`** attempts to concatenate a string and an integer. It raises a **`TypeError`**, signaling that the operation is invalid for these specific types.
- **`open('nonexistent.txt')`** asks the operating system for a file that is not there. It raises a **`FileNotFoundError`**, signaling an I/O path failure.

In every case, the traceback shows the full call stack at the moment of the exception. You read it from bottom to top to understand exactly what failed and what line of your code caused it.

---

## Concept Unit: `try`/`except` — catching exceptions

### The Problem

If an exception stops execution and crashes the program by default, how do we prevent the crash? Often, an error is entirely predictable and manageable — a user typing a letter instead of a number, or a network request failing for a moment.

If you have a function that divides two numbers, and you suspect the denominator might sometimes be zero, how can you intercept the error before it crashes the script and handle it on your own terms?

### Introduce the concept in isolation

We can use a new block structure to "listen" for errors and jump to a fallback plan if they occur.

```python
# Predicted output without execution:
try:
    print(1 / 0)
except ZeroDivisionError:
    print("Intercepted!")

# Output:
# Intercepted!
```

This proves that by wrapping risky code in a special block, we can intercept the exception object as it flies by. Execution jumps to the fallback block and the program survives. This structure is called a **`try`/`except` block**.

### Discard the throwaway example

The isolated print example is discarded; we will use it in a real function structure instead.

### Project Change

No reference counterpart — this is a from-scratch addition because we are expanding our script with a safe utility function.

- **Files affected:** `errors.py` (modified)
- **Change type:** Add
- **Location:** At the top of the file.
- **Dependencies:** None.

### The New Code

```python
def safe_divide(a, b):
    try:
        result = a / b
        return result
    except ZeroDivisionError:
        print('Error: division by zero')
        return None
```

### The Updated Project

```python
# errors.py
def safe_divide(a, b):
    try:
        result = a / b
        return result
    except ZeroDivisionError:
        print('Error: division by zero')
        return None

# ← new
print(safe_divide(10, 2))
print(safe_divide(10, 0))
```

This adds a function that safely divides two numbers and falls back to `None` if division fails, then tests it with two inputs.

### Mechanical walkthrough

- **`try:`** defines a block of code to attempt. Python watches for exceptions raised inside this block.
- **`result = a / b`** performs the division. If `b` is `2`, this evaluates to `5.0`. No exception is raised. The `except` block is skipped entirely, and `5.0` is returned.
- When `safe_divide(10, 0)` is called, **`a / b`** attempts to divide by zero and raises a **`ZeroDivisionError`**.
- Execution immediately aborts the `try` block. The `return result` line is never reached.
- **`except ZeroDivisionError:`** catches the exact exception type named. Because the raised exception is a `ZeroDivisionError`, Python jumps into this block.
- **`print('Error: division by zero')`** outputs a friendly message to the user instead of a traceback.
- **`return None`** safely exits the function, allowing the program to continue running normally.

---

## Concept Unit: Catching multiple exception types

### The Problem

A block of code might fail in more than one way. If you read user input and try to convert it to an integer, it might fail because the input is completely empty, or because it contains letters.

If your `try` block could raise a `ValueError` in one place and a `TypeError` in another, how do you provide different fallback plans for each distinct error without catching them all blindly?

### Introduce the concept in isolation

We can define multiple fallback plans by stacking them.

```python
# Predicted output without execution:
try:
    int(None)
except ValueError:
    print("Value issue")
except TypeError:
    print("Type issue")

# Output:
# Type issue
```

This proves that Python checks handlers from top to bottom and runs the first one that matches the exception type raised.

### Discard the throwaway example

The isolated type-checking example is discarded.

### Project Change

No reference counterpart — this is a from-scratch addition because we are adding a flexible parsing function to our file.

- **Files affected:** `errors.py` (modified)
- **Change type:** Add
- **Location:** Below `safe_divide`.
- **Dependencies:** None.

### The New Code

```python
def parse_int(s):
    try:
        return int(s)
    except ValueError:
        print(f'Cannot convert {s!r} to int')
        return None
    except TypeError:
        print(f'Expected a string, got {type(s).__name__}')
        return None
```

### The Updated Project

```python
# errors.py
def parse_int(s):
    try:
        return int(s)
    except ValueError:
        print(f'Cannot convert {s!r} to int')
        return None
    except TypeError:
        print(f'Expected a string, got {type(s).__name__}')
        return None

# ← new tests
print(parse_int('42'))     # 42
print(parse_int('abc'))    # Cannot convert 'abc' to int\nNone
print(parse_int(None))     # Expected a string, got NoneType\nNone
```

This function attempts to parse a string into an integer and provides tailored error messages for two different failure modes.

### Mechanical walkthrough

- **`try:`** opens the block.
- **`return int(s)`** attempts the conversion.
- **`except ValueError:`** is the first handler. If `s` is `'abc'`, `int()` raises a **`ValueError`**. Execution jumps here.
- **`print(f'Cannot convert {s!r} to int')`** uses an f-string to display the exact string that failed.
- **`except TypeError:`** is the second handler. If `s` is `None`, `int()` raises a **`TypeError`** because it expects a string or number, not `NoneType`. Execution skips the `ValueError` block entirely and jumps here.
- **`print(f'Expected a string, got {type(s).__name__}')`** prints the actual type passed in.

Multiple `except` clauses are evaluated in order; the first matching one runs, and the rest are ignored. You can also catch multiple exception types in a single clause using a tuple, such as `except (ValueError, EOFError):`, which catches either of those types using the exact same fallback code.

---

## Concept Unit: Accessing the exception object with `as`

### The Problem

When you catch an exception, you know its type, but you might not know the specifics of what went wrong. A `FileNotFoundError` tells you a file is missing, but *which* file?

How can we look inside the exception object to retrieve the specific data (like the filename or the exact error message) that the runtime packed into it when the error occurred?

### Introduce the concept in isolation

We can bind a variable to the flying exception object to inspect it.

```python
# Predicted output without execution:
try:
    1 / 0
except ZeroDivisionError as err:
    print(err)

# Output:
# division by zero
```

This proves that the exception itself is a real object containing data, and we can capture it into a local variable to read that data.

### Discard the throwaway example

The isolated print is discarded.

### Project Change

No reference counterpart — this is a from-scratch addition because we are exploring exception object inspection.

- **Files affected:** `errors.py` (modified)
- **Change type:** Add
- **Location:** Below `parse_int`.
- **Dependencies:** None.

### The New Code

```python
try:
    open('missing.txt')
except FileNotFoundError as e:
    print(e.filename)
    print(e.strerror)
    print(e.errno)
```

### The Updated Project

```python
# errors.py
try:
    open('missing.txt')
except FileNotFoundError as e:
    print(e.filename)    # missing.txt
    print(e.strerror)    # No such file or directory
    print(e.errno)       # 2
```

This code catches a file error and prints three distinct pieces of information from the error object itself.

### Mechanical walkthrough

- **`except FileNotFoundError as e:`** intercepts the exception and assigns the actual exception object to the local variable `e`. The keyword `as` binds the object so we can interact with it.
- **`e.filename`** accesses the `filename` attribute on the exception object. Built-in OS errors store the exact path that failed here.
- **`e.strerror`** accesses the human-readable string description from the operating system ("No such file or directory").
- **`e.errno`** accesses the raw integer error code provided by the underlying system (in this case, 2 for ENOENT).

Exception objects carry attributes that provide context. Even for simpler errors without custom attributes, printing `str(e)` or examining `e.args` will reveal the message that was passed when the error was created.

---

## Concept Unit: `raise` — signaling errors from your own code

### The Problem

If someone calls a function you wrote, but passes completely invalid arguments — like a negative age for a user profile — you need a way to reject the input. Returning `None` or `False` is ambiguous.

How can you leverage Python's exception system to stop execution and throw an error yourself, using the exact same mechanism the built-in functions use?

### Introduce the concept in isolation

We can generate and throw an exception object manually.

```python
# Predicted output without execution:
# raise ValueError("That is not a valid choice.")
# Output: ValueError: That is not a valid choice.
```

This proves that exceptions are not just magical language features; they are regular objects we can instantiate and throw using a specific keyword.

### Discard the throwaway example

The manual `raise` is discarded.

### Project Change

No reference counterpart — this is a from-scratch addition because we are adding input validation logic to our file.

- **Files affected:** `errors.py` (modified)
- **Change type:** Add
- **Location:** Below the file reading block.
- **Dependencies:** None.

### The New Code

```python
def set_age(age):
    if not isinstance(age, int):
        raise TypeError(f'age must be an int, got {type(age).__name__}')
    if age < 0 or age > 150:
        raise ValueError(f'age must be between 0 and 150, got {age}')
    return age
```

### The Updated Project

```python
# errors.py
def set_age(age):
    if not isinstance(age, int):
        raise TypeError(f'age must be an int, got {type(age).__name__}')
    if age < 0 or age > 150:
        raise ValueError(f'age must be between 0 and 150, got {age}')
    return age

# ← new tests
# set_age(25)    # Returns 25
# set_age(-1)    # ValueError: age must be between 0 and 150, got -1
# set_age('25')  # TypeError: age must be an int, got str
```

This function strictly validates its input and deliberately throws standard exceptions if the input is unacceptable.

### Mechanical walkthrough

- **`raise`** is the keyword that actually throws an exception object up the call stack, immediately halting the current function just like a built-in error would.
- **`TypeError(...)`** instantiates a new **`TypeError`** object. We pass it a formatted string explaining exactly what went wrong. We choose `TypeError` because the first validation checks if the argument is an integer.
- **`ValueError(...)`** instantiates a new **`ValueError`** object. We choose `ValueError` because in the second check, the type is correct (it's an int), but the value itself (-1) is semantically invalid.

Your code should always raise the same built-in exception types (`ValueError`, `TypeError`, `KeyError`) that standard Python uses for similar situations. This makes your code predictable to other developers.

---

## Concept Unit: `finally` — always runs

### The Problem

When an exception occurs inside a `try` block, execution jumps to the `except` block. This means any code at the end of the `try` block is skipped entirely.

If you opened a file, and an error happened while reading it, the function might crash or return early without ever closing the file. How do you guarantee that a cleanup step runs no matter what — whether an exception occurred, whether it was caught, or whether the function returned normally?

### Introduce the concept in isolation

We can add a block that executes no matter the outcome.

```python
# Predicted output without execution:
try:
    print("Trying")
finally:
    print("Cleaning up")

# Output:
# Trying
# Cleaning up
```

This proves that `finally` blocks execute even if no error occurs at all.

### Discard the throwaway example

The isolated `finally` test is discarded.

### Project Change

No reference counterpart — this is a from-scratch addition because we are adding a file reader that requires guaranteed resource cleanup.

- **Files affected:** `errors.py` (modified)
- **Change type:** Add
- **Location:** Below `set_age`.
- **Dependencies:** None.

### The New Code

```python
def read_file(path):
    f = None
    try:
        f = open(path, 'r')
        return f.read()
    except FileNotFoundError as e:
        print(f'File not found: {e.filename}')
        return None
    finally:
        print('finally block runs!')
        if f is not None:
            f.close()
```

### The Updated Project

```python
# errors.py
def read_file(path):
    f = None
    try:
        f = open(path, 'r')
        return f.read()
    except FileNotFoundError as e:
        print(f'File not found: {e.filename}')
        return None
    finally:
        print('finally block runs!')
        if f is not None:
            f.close()

# ← new tests
read_file('existing.txt')    # reads file; finally runs
read_file('missing.txt')     # catches error; finally STILL runs
```

This function safely opens a file, attempts to read it, and guarantees the file handle is closed whether it succeeds or fails.

### Mechanical walkthrough

- **`f = None`** initializes the variable before the `try` block, ensuring it exists in the function scope even if `open()` crashes immediately.
- **`finally:`** defines a block of code that is guaranteed to execute unconditionally when the `try` (and `except`) blocks finish.
- If **`open()`** succeeds, **`return f.read()`** schedules an exit from the function. Before actually returning the data, execution pauses, jumps down to the `finally` block, executes it, and *then* returns.
- If **`open()`** fails, the **`except`** block catches it and schedules a `return None`. Execution pauses, jumps down to the `finally` block, executes it, and *then* returns.
- **`f.close()`** is called safely because of the `if f is not None` check.

The `finally` block is the correct place for all cleanup: closing files, releasing network connections, or freeing locks. Note that in Python, the `with` statement (which you will see in Lesson 18) is a more modern shorthand for this exact `try...finally` pattern when dealing with files.

---

## Concept Unit: Custom exception classes

### The Problem

Built-in exceptions like `ValueError` and `TypeError` cover the basics, but sometimes your application has domain-specific errors. A banking application might need to signal an overdrawn account.

If you just raise a generic `ValueError("Insufficient funds")`, the calling code has to inspect the string message to figure out what happened. How do you create a brand-new, strongly-typed exception that carries custom data, like the actual account balance?

### Introduce the concept in isolation

We can define a new class that inherits from `Exception`.

```python
# Predicted output without execution:
class MyError(Exception):
    pass

# raise MyError("Something custom broke")
# Output: MyError: Something custom broke
```

This proves that custom exceptions are just standard Python classes that inherit from the built-in `Exception` base class.

### Discard the throwaway example

The empty exception class is discarded.

### Project Change

No reference counterpart — this is a from-scratch addition because we are defining domain-specific logic.

- **Files affected:** `errors.py` (modified)
- **Change type:** Add
- **Location:** Below `read_file`.
- **Dependencies:** None.

### The New Code

```python
class InsufficientFundsError(Exception):
    def __init__(self, amount, balance):
        self.amount = amount
        self.balance = balance
        super().__init__(
            f'Cannot withdraw {amount}: balance is only {balance}'
        )

def withdraw(balance, amount):
    if amount > balance:
        raise InsufficientFundsError(amount, balance)
    return balance - amount
```

### The Updated Project

```python
# errors.py
class InsufficientFundsError(Exception):
    def __init__(self, amount, balance):
        self.amount = amount
        self.balance = balance
        super().__init__(
            f'Cannot withdraw {amount}: balance is only {balance}'
        )

def withdraw(balance, amount):
    if amount > balance:
        raise InsufficientFundsError(amount, balance)
    return balance - amount

# ← new tests
try:
    withdraw(100, 150)
except InsufficientFundsError as e:
    print(e)            # Cannot withdraw 150: balance is only 100
    print(e.amount)     # 150
    print(e.balance)    # 100
```

This creates a custom exception class specifically for banking logic, carrying detailed properties about the failed transaction.

### Mechanical walkthrough

- **`class InsufficientFundsError(Exception):`** defines a new class that inherits directly from **`Exception`**. This makes it a legal exception object that can be raised and caught.
- **`def __init__(self, amount, balance):`** overrides the constructor to accept specific context about the error.
- **`self.amount = amount`** saves the requested amount to an instance variable.
- **`super().__init__(...)`** calls the parent `Exception` class constructor, passing it the formatted, human-readable error string. This ensures `print(e)` works perfectly.
- **`raise InsufficientFundsError(amount, balance)`** throws the new custom exception object, passing the required data.
- **`except InsufficientFundsError as e:`** catches only this specific banking error. It ignores other exceptions like `TypeError`. Callers can cleanly catch the specific type, which is the standard pattern used by all major Python libraries.

---

## Concept Unit: Exception hierarchy and the danger of bare `except`

### The Problem

When writing a quick script, it is tempting to catch absolutely every error to prevent crashes by just writing `except:`.

If you write a blanket `except:` clause, you don't just catch math and file errors — you also catch the system signal that tries to shut down the program when the user presses `Ctrl+C`. How do exceptions relate to one another, and why is catching *everything* dangerous?

### Introduce the concept in isolation

We can look at the inheritance tree of built-in exceptions to see how they group together.

```python
# The hierarchy (partial):
# BaseException
#   Exception
#     ValueError
#     TypeError
#     KeyError
#     IndexError
#     OSError
#       FileNotFoundError
#   KeyboardInterrupt
#   SystemExit
```

This tree proves that `Exception` is not the absolute top. `BaseException` is the root, and critical system events like `KeyboardInterrupt` subclass `BaseException` directly, bypassing `Exception`.

### Discard the throwaway example

The text-based hierarchy tree is discarded.

### Project Change

No reference counterpart — this is a from-scratch addition showing what NOT to do.

- **Files affected:** `errors.py` (modified)
- **Change type:** Add
- **Location:** At the bottom of the file.
- **Dependencies:** None.

### The New Code

```python
# BAD: bare except catches everything including KeyboardInterrupt!
try:
    risky_code()
except:           # AVOID
    pass          # swallows ALL errors silently

# BETTER: catch only what you expect
try:
    risky_code()
except (ValueError, KeyError) as e:
    handle(e)
```

### The Updated Project

```python
# errors.py
# (At the bottom of the file)

# BAD: bare except catches everything including KeyboardInterrupt!
# try:
#     risky_code()
# except:           # AVOID
#     pass          # swallows ALL errors silently

# BETTER: catch only what you expect
# try:
#     risky_code()
# except (ValueError, KeyError) as e:
#     handle(e)
```

This documents the best practice for targeting exception types.

### Mechanical walkthrough

- **`except:`** without any named type is called a "bare except." It acts as a catch-all for absolutely every object that inherits from **`BaseException`**. This catches your `ValueError`, but it also catches **`KeyboardInterrupt`** (Ctrl+C) and `SystemExit`, making your program incredibly difficult to interrupt or shut down cleanly. It also hides typos and syntax errors.
- **`except Exception:`** catches all standard errors (like `TypeError` and `KeyError`) but correctly ignores `KeyboardInterrupt` because it only catches objects that subclass **`Exception`**. This is safer, but still generally discouraged because it can hide unexpected bugs.
- **`except (ValueError, KeyError) as e:`** is the correct, safe pattern. Always specify the exact exception types you expect and are prepared to handle. If an error occurs that you didn't anticipate, the program *should* crash so you can fix the underlying bug.

---

## Next Steps

Exceptions are the standard error-handling mechanism in Python, allowing you to intercept predictable failures and define safe fallbacks. Lesson 16 covers testing — how to verify that your code handles both the happy path and these exact error cases correctly.

### Exercises
1. Write a `safe_sqrt(x)` function that returns the square root of a number, but explicitly raises a `ValueError` for negative input before doing any math.
2. Write a function that reads a configuration file using the `json` module. Wrap the operation to handle both `FileNotFoundError` if the file doesn't exist, and `json.JSONDecodeError` if the file contains invalid JSON data.
3. Implement a basic `Stack` class with `push()`, `pop()`, and `peek()` methods. Make sure that calling `pop()` or `peek()` on an empty stack raises a standard `IndexError`.
