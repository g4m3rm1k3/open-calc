# FOUNDATIONS — LAB-044 — Python: Context Managers

**Series:** FOUNDATIONS — Part VIII: Python Features
**Environment:** Python REPL (`python3`)
**Time:** 40–55 minutes.

---

## What You Will Build

A context manager using `__enter__` and `__exit__`, a context manager using `@contextmanager`, a timing context manager, and a connection-pool-style resource manager. After this lab you will understand why the `with` statement guarantees teardown even when exceptions occur, and what RAII means.

---

## What You Need to Know First

**From LAB-043 (Generators):** The `@contextmanager` decorator uses `yield`. The code before `yield` is setup; the code after is teardown.

**From LAB-009 (Error Handling):** `try/finally` guarantees execution of cleanup code. Context managers implement this guarantee behind a clean interface.

---

> **Quick Check — try to answer before reading:**
>
> 1. If an exception occurs inside a `with` block, does `__exit__` still run?
> 2. What happens if you open a file with `open()` and an exception occurs before `f.close()`?
> 3. What is RAII and what programming language invented it?
>
> *(Answers at the end of this lab)*

---

## The Lesson

---

### Step 1 — The Problem Context Managers Solve

```python
# Without a context manager — fragile:
file_handle = open('data.txt', 'w')
file_handle.write('hello')
# If anything above raises an exception, close() never runs:
# The file handle stays open, potentially corrupting the file or leaking OS resources
file_handle.close()

# With a context manager — guaranteed cleanup:
with open('data.txt', 'w') as file_handle:
    file_handle.write('hello')
# __exit__ is called here automatically, even if an exception occurred inside
```

**The walkthrough:** The `with` statement calls `file_handle.__enter__()` on entry (which returns the file object). When the block exits — normally or via exception — the `with` statement calls `file_handle.__exit__(exc_type, exc_val, exc_tb)`. For file objects, `__exit__` calls `close()` unconditionally.

**The CS lens — RAII:** Resource Acquisition Is Initialisation (RAII) is a C++ idiom: acquire a resource in the constructor, release it in the destructor, and the destructor runs deterministically when the object goes out of scope. Python's `with` statement provides the same guarantee without requiring the RAII object model: the `with` block IS the scope, and `__exit__` IS the destructor.

---

### Step 2 — Implementing `__enter__` and `__exit__`

```python
class DatabaseConnection:
    def __init__(self, host: str, port: int) -> None:
        self.host = host
        self.port = port
        self.connection = None

    def __enter__(self) -> 'DatabaseConnection':
        print(f"Connecting to {self.host}:{self.port}...")
        self.connection = f"conn://{self.host}:{self.port}"  # simulated
        print("Connected.")
        return self   # the value assigned to the 'as' variable

    def __exit__(self, exc_type, exc_val, exc_tb) -> bool:
        print("Closing connection...")
        self.connection = None
        print("Connection closed.")

        if exc_type is not None:
            print(f"Exception occurred: {exc_type.__name__}: {exc_val}")
            # Return False to re-raise the exception (normal behaviour)
            # Return True to suppress the exception (rarely correct)
        return False  # do not suppress exceptions

# Usage:
with DatabaseConnection('localhost', 5432) as db:
    print(f"Using: {db.connection}")
    # Simulated query...
    # If this raises, __exit__ still runs

# Output:
# Connecting to localhost:5432...
# Connected.
# Using: conn://localhost:5432
# Closing connection...
# Connection closed.
```

**The walkthrough — `__exit__` parameters:**

- `exc_type`: the exception class (e.g., `ValueError`) if an exception occurred, else `None`
- `exc_val`: the exception instance, else `None`
- `exc_tb`: the traceback object, else `None`

Returning `False` (or `None`) from `__exit__` means "let the exception propagate." Returning `True` suppresses the exception — the `with` block appears to complete normally. Suppressing is almost always wrong and confusing; it is only appropriate in specific error-handling contexts.

---

### Step 3 — `@contextmanager` from `contextlib`

Writing `__enter__` and `__exit__` is boilerplate-heavy. The `@contextmanager` decorator creates a context manager from a generator function: code before `yield` is setup (`__enter__`); code after `yield` is teardown (`__exit__`).

```python
from contextlib import contextmanager
import time

@contextmanager
def timed_operation(operation_name: str):
    """Measure and print the duration of the block."""
    start_time = time.perf_counter()
    print(f"Starting: {operation_name}")
    try:
        yield   # the 'with' block executes here
    except Exception as error:
        print(f"Failed: {operation_name} — {error}")
        raise   # re-raise the exception
    finally:
        elapsed = (time.perf_counter() - start_time) * 1000
        print(f"Completed: {operation_name} in {elapsed:.1f}ms")

# Usage:
with timed_operation("database query"):
    time.sleep(0.1)   # simulate work
    print("Executing query...")

# Output:
# Starting: database query
# Executing query...
# Completed: database query in 100.3ms
```

**The walkthrough — why `try/finally` in the generator:**

The `yield` suspends the generator while the `with` block executes. If the block raises an exception, Python throws it INTO the generator at the `yield` point. The `try/except` catches it for logging, then `raise` re-raises it. The `finally` block runs regardless — this ensures the timer always prints.

Without `try/finally`, a raised exception in the `with` block would terminate the generator after `yield`, skipping the timing print. The `@contextmanager` decorator handles the protocol; the generator handles the logic.

---

### Step 4 — Common Context Manager Patterns

```python
# Temporarily change working directory:
import os
from contextlib import contextmanager

@contextmanager
def change_directory(path: str):
    original = os.getcwd()
    os.chdir(path)
    try:
        yield
    finally:
        os.chdir(original)  # always restore, even on exception

# Suppress specific exceptions:
from contextlib import suppress

with suppress(FileNotFoundError):
    os.remove('file_that_might_not_exist.txt')
# No error if the file does not exist — exception silently suppressed

# Redirect stdout temporarily:
import io
from contextlib import redirect_stdout

captured_output = io.StringIO()
with redirect_stdout(captured_output):
    print("This goes to the StringIO, not stdout")
print(f"Captured: {captured_output.getvalue()!r}")
```

**The SE lens — context managers enforce invariants:** Every context manager enforces an invariant: "between `__enter__` and `__exit__`, this resource is available and properly initialised." The invariant is machine-enforceable — the programmer cannot forget to release the resource because the language mechanism handles it. This is the same principle as the finally block in LAB-009, elevated to a reusable abstraction.

---

### Step 5 — Nesting Context Managers

```python
# Before Python 3.10: stacking with blocks
with open('input.txt', 'r') as reader:
    with open('output.txt', 'w') as writer:
        for line in reader:
            writer.write(line.upper())

# Python 3.1+ shorthand — single with, multiple managers:
with open('input.txt', 'r') as reader, open('output.txt', 'w') as writer:
    for line in reader:
        writer.write(line.upper())

# Both files are guaranteed to close even if an exception occurs mid-copy.
```

---

## Connect the Pieces

- **SQLAlchemy sessions** use context managers: `with session_factory() as session`. The session commits on success, rolls back on exception, and closes unconditionally.
- **Python's `threading.Lock`** is a context manager: `with lock:` acquires the lock, `__exit__` releases it. Without `with`, a crash inside the locked section would leave the lock acquired forever — a deadlock.
- **`tempfile.NamedTemporaryFile`** as a context manager creates the temp file on entry and deletes it on exit.
- **pytest fixtures** use `yield` in the same way `@contextmanager` does — setup before yield, teardown after.

---

## What Breaks Without This

**Forgetting `close()` on a file:**

```python
def read_config():
    file_handle = open('config.json', 'r')
    data = json.load(file_handle)
    return data
    # BUG: close() is never called — file_handle lives until GC
    # In CPython (the standard Python), GC is reference-counted so this is usually OK
    # In PyPy (alternative Python), GC is non-deterministic — the file might stay open for minutes
```

The file handle is only released when the garbage collector runs and collects `file_handle`. In CPython this is usually immediate (reference counting), but in other Python implementations and in resource-constrained environments, this can exhaust file descriptor limits or cause data corruption (write buffering). Using `with` makes the release immediate and explicit.

---

## Definition of Done

- [ ] `DatabaseConnection.__enter__` and `__exit__` both run — verify by checking console output
- [ ] Exception inside `with DatabaseConnection` — `__exit__` still runs (connection still closes)
- [ ] `@timed_operation` — timing print appears even if the block raises
- [ ] `with suppress(FileNotFoundError)` — removing a non-existent file produces no error
- [ ] You can explain the difference between `return False` and `return True` in `__exit__`

**Git commit:**

```
git add src/
git commit -m "LAB-044: Python context managers — RAII pattern guarantees teardown; @contextmanager uses yield to split setup and teardown in a generator"
```

---

## Quick Check Answers

1. **Yes.** This is the entire point of context managers. The `with` statement is implemented as `try/finally` internally. `__exit__` runs in the `finally` block — unconditionally.
2. **The file handle leaks.** `close()` never runs. The OS file descriptor remains open until CPython's reference counter reaches zero (usually soon after) or the process exits. In production with many concurrent requests, this can exhaust OS file descriptor limits and crash the server.
3. **RAII (Resource Acquisition Is Initialisation) was invented in C++ by Bjarne Stroustrup.** It ties resource lifetime to object lifetime: acquire in the constructor (initialisation), release in the destructor. C++ destructors run deterministically when objects go out of scope. Python's `with` statement provides the same guarantee for a defined code block, without requiring C++'s ownership model.
