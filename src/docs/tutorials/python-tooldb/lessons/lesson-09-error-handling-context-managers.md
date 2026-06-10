# Python Tool Database — LAB 09 — Error Handling and Context Managers

**Prerequisites:** Lab 08. You know classes, imports, and how modules work. `tooldb/tool_types.py` has `Tool`, `EndMill`, `Drill`.

**What this lab adds:**
- The difference between errors (expected) and bugs (unexpected)
- `try/except/finally` — controlled response to exceptions
- The exception hierarchy: why you catch specific types, not `Exception`
- `raise` — signaling an error condition explicitly
- Custom exception classes — named errors with domain meaning
- The `with` statement — guaranteed resource cleanup
- The context manager protocol: `__enter__` and `__exit__`
- A `load_tool_from_file(path)` function that reads a JSON tool record, built through Red-Green-Refactor

**Time:** 45–60 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. Without a `with` statement, what happens to an open file if an exception is raised while you are reading it? Does Python close it automatically?
> 2. Why is `except Exception` considered bad practice? What specific problem does it hide?
> 3. `finally` runs even when the code in `try` succeeds. What is a real-world scenario where you need code that runs in both the success case and the failure case?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

By the end of this lesson you will have a `load_tool_from_file(path)` function that reads a JSON file, validates the required fields, and raises a named exception when anything goes wrong:

```python
tool = load_tool_from_file("tools/endmill.json")
# Returns an EndMill instance if file is valid

tool = load_tool_from_file("tools/missing.json")
# Raises ToolFileNotFoundError: file 'tools/missing.json' does not exist

tool = load_tool_from_file("tools/bad.json")
# Raises ToolLoadError: missing required field 'diameter_inches' in tools/bad.json
```

---

## Step 1 — Errors vs Bugs

Before writing any code, the conceptual distinction:

**A bug** is code that does not do what the programmer intended. `calculate_sfm(0.5, 3820)` returning `-1000` instead of `1000` is a bug. Bugs should not happen. When they do, they indicate a flaw in the code that must be fixed.

**An error** is a condition the code anticipated and must handle gracefully. A file that does not exist is an error. Invalid user input is an error. A network connection timeout is an error. Errors are expected. Your code must not crash silently when they occur — it must detect them and respond appropriately.

**Why the distinction matters:** Bugs are fixed by changing the code. Errors are handled by `try/except`. Handling an error does not mean hiding it — it means communicating it clearly. A function that raises `ToolFileNotFoundError("tools/missing.json does not exist")` is communicating the error clearly. A function that returns `None` silently is hiding it.

---

## Step 2 — `try/except` — Controlled Response to Exceptions

In the REPL: `python`

```python
import json

text = '{"name": "EM-0500", "diameter_inches": 0.5}'   # valid JSON
data = json.loads(text)           # parse the JSON string into a Python dict
print(data["name"])               # → "EM-0500"
```

Now a broken JSON file:

```python
bad_text = '{"name": "EM-0500" "diameter_inches": 0.5}'   # missing comma — invalid JSON

try:
    data = json.loads(bad_text)   # this line raises JSONDecodeError
    print("Parsed:", data)        # this line DOES NOT run
except json.JSONDecodeError as error:
    print(f"JSON parse failed: {error}")   # this runs instead
```

**You should see:** `JSON parse failed: Expecting ',' delimiter: line 1 column 21 (char 20)`

The `try` block is where you attempt something that might fail. The `except` block runs only if the specified exception type is raised. The code after the `try/except` continues normally.

---

### Concept: `try/except` — Handling Exceptions

**What it is:** A control flow structure that lets you attempt an operation and specify what to do if it raises an exception, instead of crashing.

**The problem before:** Without `try/except`, any exception terminates the program:

```python
data = json.loads(bad_text)   # if this fails, the whole program crashes
print(data["name"])           # never reached
```

**The solution:**

```python
try:
    data = json.loads(bad_text)    # attempt the operation
except json.JSONDecodeError as error:
    print(f"Invalid JSON: {error}")  # handle this specific failure
    data = {}                      # provide a safe fallback if needed
```

**Exception types — catch specifically:**

Python has a hierarchy of exception types. `Exception` is the root; specific exceptions inherit from it:

```
BaseException
  Exception
    ValueError            (wrong value: "hello" where int expected)
    TypeError             (wrong type: calling a str like a function)
    KeyError              (dict key not found)
    FileNotFoundError     (file does not exist)
    json.JSONDecodeError  (invalid JSON — subclass of ValueError)
    AttributeError        (object has no such attribute)
    ImportError           (module not found)
```

**Always catch the most specific exception you expect:**

```python
# Good — catches exactly what can go wrong:
except json.JSONDecodeError:
    print("File is not valid JSON")

# Too broad — hides every possible error, including bugs:
except Exception:
    print("Something went wrong")   # what? you can't know
```

`except Exception` is dangerous because it also catches programmer errors: `NameError`, `AttributeError`, `TypeError`. These are bugs, not errors. By catching them silently, you hide bugs and make them impossible to find.

**Multiple `except` clauses:**

```python
try:
    with open(path) as file:
        data = json.load(file)
except FileNotFoundError:
    print(f"File not found: {path}")
except json.JSONDecodeError as error:
    print(f"Invalid JSON in {path}: {error}")
```

**`finally` — always runs:**

```python
file = open(path)
try:
    data = json.load(file)
except json.JSONDecodeError:
    print("Bad JSON")
finally:
    file.close()   # runs whether json.load succeeded or failed
```

**What `try/except` hides:** The call stack unwinding. When an exception is raised, Python walks back up the call stack looking for a matching `except` clause. When it finds one, it runs that block. The rest of the stack between the raise site and the catch site is unwound (those frames are discarded). This mechanism is invisible — you just write `try/except` and Python handles the unwinding.

**Canonical example (General):**

A form submission with validation. Attempt to parse the user's input. If the format is wrong (`ValueError`), show an error message and let them try again. If the required field is blank (`KeyError`), highlight the field. If the database is down (`ConnectionError`), show "service unavailable." Each case is a different kind of error with a different appropriate response.

**Project application:** `load_tool_from_file` attempts to open and parse a JSON file. `FileNotFoundError` and `json.JSONDecodeError` are both real possibilities, each with a different meaning and a different error message.

**You will see this again in:** Every I/O operation in Python. In Block 2 (SQL): `sqlite3.OperationalError` when a query fails. In Block 7 (Mastercam import): `sqlite3.DatabaseError` when the .tooldb file is corrupt. In Block 11 (FastAPI): HTTP errors are expressed as raised `HTTPException`.

**Watch for:** Re-raising an exception you caught is valid — `raise` with no arguments inside an `except` block re-raises the caught exception with its original traceback. Use this when you want to log the error but then propagate it upward.

---

### SAVE AND TRY

In the REPL:

```python
import json

def safe_parse(json_text):
    try:
        return json.loads(json_text)          # attempt to parse
    except json.JSONDecodeError as error:
        print(f"Parse error: {error}")
        return None                           # caller gets None instead of a crash

result_1 = safe_parse('{"name": "EM-0500"}')   # valid JSON
result_2 = safe_parse('{bad json}')             # invalid JSON

print(result_1)   # → {'name': 'EM-0500'}
print(result_2)   # → None  (after printing the parse error)
```

**You should see:** The parsed dict, then `None` (with a parse error message before it).

**Console test:** Try `safe_parse(None)`. **Expected:** An unhandled `TypeError` — `json.loads(None)` raises `TypeError`, which is not a `JSONDecodeError`, so our handler does not catch it. This is correct behavior: `None` is a programming error (a bug), not an expected condition.

**Change something:** Add `except TypeError: return None` to the function. Now `safe_parse(None)` returns `None` silently. Run it. Now notice you have hidden a bug. Change it back.

---

## Step 3 — `raise` and Custom Exceptions

You can raise your own exceptions to communicate domain-specific errors:

```python
class ToolLoadError(Exception):           # custom exception class
    pass                                  # inherits everything from Exception, adds nothing

raise ToolLoadError("missing required field 'name'")
```

The caller can then catch `ToolLoadError` specifically:

```python
try:
    tool = load_tool_from_file("bad.json")
except ToolLoadError as error:
    print(f"Could not load tool: {error}")
```

---

### Concept: Custom Exceptions — Named Domain Errors

**What it is:** An exception class that you define, inheriting from `Exception` or a more specific base.

**The problem before:** Without custom exceptions, you are limited to Python's built-ins:

```python
raise ValueError("missing field 'name'")   # too generic — ValueError means many things
```

The caller cannot distinguish "a required field is missing from a tool file" from "someone passed the wrong type to a function." Both are `ValueError`.

**The solution:**

```python
class ToolLoadError(ValueError):   # inherits from ValueError for the "wrong value" category
    pass

raise ToolLoadError("missing required field 'name'")
```

Now the caller can `except ToolLoadError` and know exactly what went wrong. They can still also `except ValueError` if they want to catch a broader category.

**Naming convention:** Exception classes always end in `Error` or `Exception`. `ToolLoadError`, `ToolFileNotFoundError`, `ValidationError`. This is a universal Python convention.

**What exceptions carry:** An exception carries a message (the string argument to `raise`) and a traceback (the call stack at the point where it was raised). Custom exceptions can also carry additional data:

```python
class ToolLoadError(ValueError):
    def __init__(self, message, field_name=None):
        super().__init__(message)               # store message for str(error)
        self.field_name = field_name            # extra data for programmatic handling
```

**Canonical example (General):**

A domain-specific error in a banking system: `InsufficientFundsError` vs `AccountNotFoundError`. Both could be `ValueError`, but naming them precisely lets the caller decide: display "your account number is wrong" vs "you don't have enough money."

**Project application:** `ToolLoadError` when a required field is missing. `ToolFileNotFoundError` when the file path is wrong. In Block 9 (validation): `ToolValidationError` with a list of field-level errors. In Block 7 (Mastercam import): `MastercamFormatError` when the .tooldb schema does not match expectations.

**You will see this again in:** Every production Python codebase. SQLAlchemy defines `NoResultFound`, `MultipleResultsFound`, `IntegrityError`. FastAPI defines `HTTPException`. Django defines `PermissionDenied`, `ObjectDoesNotExist`. Libraries define specific exception types so callers can handle them precisely.

**Watch for:** Exception class hierarchies. `ToolLoadError(ValueError)` means callers can catch either `ToolLoadError` (specific) or `ValueError` (broader). The hierarchy gives callers choice. Do not make all exceptions inherit from `Exception` directly if a more specific parent makes semantic sense.

---

## Step 4 — The `with` Statement and Context Managers

The file-close problem:

```python
file = open("tools.json")
data = json.load(file)       # if this raises, the file is never closed
file.close()                 # only reached if json.load succeeds
```

The `finally` fix is verbose:

```python
file = open("tools.json")
try:
    data = json.load(file)
finally:
    file.close()             # now always closes — but verbose
```

The clean solution:

```python
with open("tools.json") as file:
    data = json.load(file)   # file closes automatically when the with block exits
                             # even if json.load raises an exception
```

---

### Concept: The `with` Statement and Context Manager Protocol

**What it is:** A statement that ensures setup and teardown code runs in a pair, even if an exception occurs between them.

**What it hides:** The `try/finally` boilerplate for resource cleanup. Without `with`, every file open requires a matching `file.close()` in a `finally` block. With `with`, the language handles it.

**The invariant it protects:** The "resource is always released" guarantee. A file opened with `with open(...)` is always closed. A database transaction opened with `with session.begin()` is always committed or rolled back. The programmer cannot accidentally forget the cleanup.

**The protocol — `__enter__` and `__exit__`:**

Any object that defines `__enter__` and `__exit__` is a **context manager** and can be used with `with`:

```python
class Timer:
    def __enter__(self):
        import time
        self.start = time.time()        # setup: record start time
        return self                     # returned as the `as` variable

    def __exit__(self, exc_type, exc_val, exc_tb):
        import time
        elapsed = time.time() - self.start
        print(f"Elapsed: {elapsed:.3f}s")  # teardown: print elapsed time
        return False                    # False means: do not suppress exceptions

with Timer() as timer:
    result = sum(range(1_000_000))      # __enter__ ran; this block runs
# __exit__ runs here (after the block, even if an exception was raised)
```

**`exc_type`, `exc_val`, `exc_tb` in `__exit__`:** These are set to the exception information if an exception was raised inside the `with` block, or `None` if everything succeeded. Returning `True` suppresses the exception (swallows it); returning `False` lets it propagate.

**Canonical example (General):**

A self-closing safety valve. You open a gas line (`__enter__`), do the work, and when the work block ends — whether by normal completion or by a fault — the valve closes automatically (`__exit__`). You cannot forget to close it.

**Project application:** `with open(path) as file:` — file is always closed. In Block 2 (SQLite): `with sqlite3.connect("tools.db") as conn:` — connection is closed. In Block 5 (SQLAlchemy): `with session.begin():` — transaction is committed or rolled back.

**You will see this again in:** Every file I/O operation. In Block 2: SQLite connections. In Block 5: SQLAlchemy sessions. In tests: `with pytest.raises(ValueError):` is a context manager that expects an exception.

**Watch for:** `with` only catches exceptions if `__exit__` returns `True`. By default, `file.__exit__` returns `None` (falsy), so exceptions propagate. The `with` statement still closes the file — it does not suppress the exception. You still need `try/except` to handle the exception; `with` handles cleanup.

---

### SAVE AND TRY

In the REPL:

```python
import json

# Simulate reading a valid JSON tool file:
tool_json = '{"name": "EM-0500", "diameter_inches": 0.5, "flutes": 4}'

import io
fake_file = io.StringIO(tool_json)   # io.StringIO: a file-like object in memory (no disk needed)

with fake_file as file:
    data = json.load(file)           # parse JSON from the file-like object

print(data)   # → {'name': 'EM-0500', 'diameter_inches': 0.5, 'flutes': 4}
```

**You should see:** The parsed dict.

**Console test:** After the `with` block, try `file.read()`. **Expected:** An error like `ValueError: I/O operation on closed file` — the `with` block closed the file when it exited.

**Change something:** Try `json.load(io.StringIO("{bad json}"))` inside a `with` block. Does the `with` block still close the file? **Expected:** The `JSONDecodeError` propagates, but the file is closed. Wrap it in `try/except json.JSONDecodeError` to confirm you can catch the error while `with` still handles cleanup.

---

## Step 5 — Red: Write the Tests

Create a test JSON file for testing. First create the directory:

```powershell
New-Item -ItemType Directory -Path "python-tooldb\test_fixtures" -Force
```

Create `python-tooldb/test_fixtures/valid_endmill.json`:

```json
{
    "tool_type": "endmill",
    "name": "EM-0500",
    "diameter_inches": 0.5,
    "flutes": 4,
    "corner_radius_inches": 0.0
}
```

Create `python-tooldb/test_fixtures/missing_diameter.json`:

```json
{
    "tool_type": "endmill",
    "name": "EM-0500"
}
```

Now create `tests/test_file_loading.py`:

```python
import pytest
from pathlib import Path

from tooldb.file_loader import load_tool_from_file, ToolLoadError, ToolFileNotFoundError

FIXTURES = Path(__file__).parent.parent / "test_fixtures"   # path to test_fixtures/


def test_loads_valid_endmill():
    tool = load_tool_from_file(FIXTURES / "valid_endmill.json")
    assert tool.name == "EM-0500"
    assert tool.diameter_inches == 0.5


def test_raises_file_not_found():
    with pytest.raises(ToolFileNotFoundError):
        load_tool_from_file(FIXTURES / "does_not_exist.json")


def test_raises_load_error_for_missing_field():
    with pytest.raises(ToolLoadError):
        load_tool_from_file(FIXTURES / "missing_diameter.json")


def test_error_message_includes_field_name():
    with pytest.raises(ToolLoadError) as exc_info:
        load_tool_from_file(FIXTURES / "missing_diameter.json")
    assert "diameter_inches" in str(exc_info.value)   # error message names the missing field
```

Run:

```powershell
pytest tests/test_file_loading.py
```

**You should see:**

```
ModuleNotFoundError: No module named 'tooldb.file_loader'
```

Red.

---

## Step 6 — Green: Write the Loader

Create `tooldb/file_loader.py`:

```python
import json
from pathlib import Path    # pathlib.Path: cross-platform file path handling

from tooldb.tool_types import EndMill, Drill, Tool   # domain classes to construct


class ToolFileNotFoundError(FileNotFoundError):   # "the file path was wrong"
    pass


class ToolLoadError(ValueError):                  # "the file exists but the content is invalid"
    pass
```

Add the loader function:

```python
REQUIRED_FIELDS = ["tool_type", "name", "diameter_inches"]   # every tool record must have these


def load_tool_from_file(path) -> Tool:
    path = Path(path)                     # ensure path is a Path object regardless of input type

    if not path.exists():                 # check before opening — gives a clear error
        raise ToolFileNotFoundError(f"Tool file not found: {path}")

    with open(path, encoding="utf-8") as file:   # open — with ensures the file closes
        try:
            data = json.load(file)               # parse the JSON content
        except json.JSONDecodeError as error:
            raise ToolLoadError(f"Invalid JSON in {path}: {error}") from error
            # `from error` preserves the original JSONDecodeError as the cause

    for field in REQUIRED_FIELDS:               # validate required fields
        if field not in data:
            raise ToolLoadError(f"Missing required field {field!r} in {path}")

    return _build_tool(data, path)              # construct the domain object
```

Add the internal builder:

```python
def _build_tool(data: dict, source_path: Path) -> Tool:
    tool_type = data["tool_type"]               # "endmill", "drill", etc.

    if tool_type == "endmill":
        return EndMill(
            name=data["name"],
            diameter_inches=data["diameter_inches"],
            flutes=data.get("flutes", 4),               # default 4 if not specified
            corner_radius_inches=data.get("corner_radius_inches", 0.0),
        )
    elif tool_type == "drill":
        return Drill(
            name=data["name"],
            diameter_inches=data["diameter_inches"],
            point_angle_degrees=data.get("point_angle_degrees", 118),  # 118° is standard
        )
    else:
        raise ToolLoadError(f"Unknown tool_type {tool_type!r} in {source_path}")
```

Run:

```powershell
pytest tests/test_file_loading.py
```

**You should see:** 4 passed.

---

## Step 7 — Refactor: Full Suite

Run the full test suite:

```powershell
pytest tests/
```

**You should see:** All tests pass.

**Console test:**

```python
from tooldb.file_loader import load_tool_from_file, ToolFileNotFoundError, ToolLoadError
from pathlib import Path

try:
    tool = load_tool_from_file(Path("test_fixtures/valid_endmill.json"))
    print(tool.describe())
except ToolFileNotFoundError as error:
    print(f"File error: {error}")
except ToolLoadError as error:
    print(f"Load error: {error}")
```

**Expected:** A full `EndMill` description with `EM-0500` and `0.500"`.

**Change something:** Delete `"name"` from `valid_endmill.json`. Run pytest. The test `test_loads_valid_endmill` now fails with `ToolLoadError: Missing required field 'name'`. Restore the field.

---

## 🎯 Challenge: Add a Drill Fixture and Test

**You know:** `try/except`, custom exceptions, `with`, `raise`, JSON file reading.

**Task:**

1. Create `test_fixtures/valid_drill.json` with a valid drill record: `tool_type: "drill"`, `name: "DR-0250"`, `diameter_inches: 0.25`, `point_angle_degrees: 118`
2. Create `test_fixtures/unknown_tool_type.json` with `tool_type: "lathe_insert"` (an unknown type)
3. Add tests to `tests/test_file_loading.py`:
   - `test_loads_valid_drill` — confirm the loaded tool has the correct `point_angle_degrees`
   - `test_raises_load_error_for_unknown_tool_type` — confirm `ToolLoadError` is raised

Write the tests first.

---

<details>
<summary>▶ Show Solution</summary>

**`test_fixtures/valid_drill.json`:**

```json
{
    "tool_type": "drill",
    "name": "DR-0250",
    "diameter_inches": 0.25,
    "point_angle_degrees": 118
}
```

**`test_fixtures/unknown_tool_type.json`:**

```json
{
    "tool_type": "lathe_insert",
    "name": "INSERT-0500",
    "diameter_inches": 0.5
}
```

**Tests** (add to `tests/test_file_loading.py`):

```python
def test_loads_valid_drill():
    from tooldb.tool_types import Drill
    tool = load_tool_from_file(FIXTURES / "valid_drill.json")
    assert isinstance(tool, Drill)
    assert tool.name == "DR-0250"
    assert tool.point_angle_degrees == 118


def test_raises_load_error_for_unknown_tool_type():
    with pytest.raises(ToolLoadError) as exc_info:
        load_tool_from_file(FIXTURES / "unknown_tool_type.json")
    assert "lathe_insert" in str(exc_info.value)   # error names the bad tool type
```

**Key insight:** The two tests verify both success and failure paths. `test_loads_valid_drill` confirms the happy path — a well-formed file produces the right object with the right attributes. `test_raises_load_error_for_unknown_tool_type` confirms the error path — a bad `tool_type` raises `ToolLoadError` and the error message identifies the problem. Both paths need tests: an untested success path might work by accident; an untested error path might silently swallow the error or raise the wrong exception.

</details>

---

## Final Check

| Feature | How to verify |
|---|---|
| `load_tool_from_file` returns an `EndMill` for valid file | `test_loads_valid_endmill` passes |
| Raises `ToolFileNotFoundError` for missing file | `test_raises_file_not_found` passes |
| Raises `ToolLoadError` for missing field | `test_raises_load_error_for_missing_field` passes |
| Error message includes the missing field name | `test_error_message_includes_field_name` passes |
| All previous tests still pass | `pytest tests/` — no regressions |
| Can explain the `with` statement in one sentence | "Guarantees `__exit__` runs when the block ends, even if an exception is raised" |
| Can explain when to catch `Exception` vs a specific type | Never `Exception` for normal logic — always the most specific type expected |

---

## Quick Check Answers

**1. Without `with`, what happens to an open file when an exception occurs?**

The file stays open. Python does not automatically close files when exceptions are raised — the file handle holds a reference, and the garbage collector might close it eventually, but "eventually" is not immediate and not guaranteed in all Python implementations. In CPython (the standard implementation), reference counting usually closes files promptly. But it is still a resource leak — the file remains open until the garbage collector runs. With a `with` statement, `file.__exit__()` is guaranteed to call `file.close()` immediately when the block exits, whether by normal completion or exception.

**2. Why is `except Exception` bad practice?**

`except Exception` catches every exception that inherits from `Exception` — which includes programmer errors like `NameError`, `AttributeError`, `TypeError`, and `KeyError`. These are bugs, not expected conditions. If your code has a bug (accessing a nonexistent attribute, calling a function that does not exist), `except Exception` catches it silently, prints "something went wrong," and continues running. The bug is now invisible. You will spend hours debugging behavior that `except JSONDecodeError` and `except FileNotFoundError` would have exposed immediately.

**3. When does `finally` need to run in both success and failure cases?**

Classic example: database transactions. You open a transaction, run some operations, and then need to either commit (success) or rollback (failure). The commit/rollback must happen regardless:

```python
transaction = db.begin()
try:
    insert_tool(transaction, tool_data)
    transaction.commit()
except DatabaseError:
    transaction.rollback()
    raise
finally:
    transaction.close()   # must always close, whether we committed or rolled back
```

`finally` ensures `transaction.close()` runs whether the operations succeeded (and we committed) or failed (and we rolled back). Without `finally`, a successful commit would close the transaction, but a rollback exception might leave it open.
