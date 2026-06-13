# FOUNDATIONS — LAB-041 — Python: Type Hints

**Series:** FOUNDATIONS — Part VIII: Python Features
**Environment:** Python REPL (`python3` in terminal) and `mypy` for static checking. Python 3.10+ recommended.
**Time:** 45–60 minutes.

---

## What You Will Build

Annotated Python functions with parameter and return type hints, Optional types, Union types, and a mypy static analysis run that catches type errors before runtime. After this lab you will understand gradual typing, why Python's type hints are not enforced at runtime, and how mypy acts as a TypeScript-like checker for Python.

---

## What You Need to Know First

**From LAB-034 (TypeScript Interfaces):** Type hints in Python serve the same purpose as TypeScript type annotations — they document types and enable static checking. The key difference: Python ignores type hints at runtime; TypeScript strips them at compile time.

**Python basics assumed:** You know Python functions, classes, and variables. This lab introduces the type hint layer.

---

> **Quick Check — try to answer before reading:**
>
> 1. If you annotate a Python function with wrong types, what happens when you run the code?
> 2. What tool checks Python type hints statically?
> 3. What is the difference between `Optional[str]` and `str | None`?
>
> *(Answers at the end of this lab)*

---

## The Lesson

---

### Step 1 — Basic Function Annotations

```python
# Without annotations (valid Python, no type information)
def add(a, b):
    return a + b

# With annotations
def add_typed(a: int, b: int) -> int:
    return a + b

# Annotations on variables
user_count: int = 0
username: str = "alice"
prices: list[float] = [9.99, 19.99, 4.99]

# Python does NOT enforce these at runtime:
result = add_typed("hello", "world")  # runs fine — returns "helloworld"
print(result)  # "helloworld" — no error at runtime!
```

**The walkthrough:** `a: int` annotates the parameter `a` with type `int`. `-> int` annotates the return type. Python's runtime completely ignores these annotations — they are stored in `__annotations__` and accessible by tools, but not checked when the function runs.

The call `add_typed("hello", "world")` succeeds at runtime and returns `"helloworld"`. This is Python's dynamic typing at work — the annotations are documentation, not enforcement.

**The CS lens — gradual typing:** Python uses gradual typing — you can add type hints to some functions and leave others unannotated. The unannotated parts are treated as `Any` by mypy (the static checker). You can migrate an existing codebase incrementally: add hints to the most critical functions first, then expand coverage over time.

---

### Step 2 — Installing and Running mypy

```bash
# Install mypy (the static type checker for Python)
pip install mypy

# Create a file to check:
# save as type_example.py

# Run mypy:
mypy type_example.py
```

`mypy` reads Python source files, follows type annotations, and reports type errors — exactly like TypeScript's `tsc`. Unlike TypeScript, mypy is an external tool, not part of the Python runtime.

**What mypy reports:**

```python
# type_example.py
def greet(name: str) -> str:
    return f"Hello, {name}"

result: int = greet("Alice")  # Type error: str assigned to int
greet(42)                      # Type error: int argument where str expected
```

Running `mypy type_example.py` produces:
```
type_example.py:4: error: Incompatible types in assignment (expression has type "str", variable has type "int")
type_example.py:5: error: Argument 1 to "greet" has incompatible type "int"; expected "str"
Found 2 errors in 1 file
```

These errors appear before running — the same benefit as TypeScript.

---

### Step 3 — Optional and Union Types

```python
from typing import Optional  # Python < 3.10
# In Python 3.10+, use: str | None directly (no import needed)

# Optional[str] means str or None — the field may be absent
def find_user(user_id: int) -> Optional[str]:
    users = {1: "Alice", 2: "Bob"}
    return users.get(user_id)  # returns None if not found

# Calling code must handle None:
user = find_user(99)
# mypy error if you do:
print(user.upper())  # Error: Item "None" of "str | None" has no attribute "upper"

# Correct approach — narrow before use:
if user is not None:
    print(user.upper())  # OK — user is str here

# Union types (Python 3.10+ syntax)
def process_id(identifier: int | str) -> str:
    if isinstance(identifier, int):
        return f"id:{identifier}"
    return identifier.upper()
```

**The walkthrough:** `Optional[str]` is equivalent to `str | None`. mypy knows `find_user` can return `None`. If you call `.upper()` on the result without checking for `None` first, mypy reports an error because `None` does not have `.upper()`.

The `isinstance(identifier, int)` check narrows the type from `int | str` to `int` inside the block — identical to TypeScript's type narrowing. mypy performs the same flow analysis.

---

### Step 4 — Collections and Generics

```python
from typing import List, Dict, Tuple, Set  # Python < 3.9
# In Python 3.9+: use built-in generics directly: list[str], dict[str, int]

def calculate_average(numbers: list[float]) -> float:
    if not numbers:
        return 0.0
    return sum(numbers) / len(numbers)

# Dict with typed keys and values
def count_words(text: str) -> dict[str, int]:
    word_counts: dict[str, int] = {}
    for word in text.split():
        word_counts[word] = word_counts.get(word, 0) + 1
    return word_counts

# Tuple with fixed positions and types
def get_user_info(user_id: int) -> tuple[str, int, str]:
    # Returns (name, age, email)
    return ("Alice", 30, "alice@example.com")

name, age, email = get_user_info(1)
# mypy knows: name is str, age is int, email is str
```

**The walkthrough:** `list[float]` is a generic type — it is a list where every element is a float. `dict[str, int]` maps string keys to integer values. `tuple[str, int, str]` is a fixed-length tuple with specific types at each position. mypy verifies that functions only receive and return collections of the declared element types.

---

### Step 5 — TypeVar and Generic Functions

```python
from typing import TypeVar, Callable

T = TypeVar('T')  # T can be any type — like TypeScript's <T>

def first_or_default(items: list[T], default: T) -> T:
    """Return first item if list is non-empty, otherwise return default."""
    return items[0] if items else default

# mypy infers T:
first_or_default([1, 2, 3], 0)          # T = int, returns int
first_or_default(["a", "b"], "default") # T = str, returns str
first_or_default([1, 2], "x")           # mypy error: T cannot be both int and str

# Callable type for function arguments:
def apply_twice(function: Callable[[int], int], value: int) -> int:
    return function(function(value))

apply_twice(lambda x: x * 2, 5)   # returns 20
apply_twice(str, 5)               # mypy error: str returns str, not int
```

**The walkthrough:** `TypeVar('T')` creates a type variable — the same concept as TypeScript's generic `<T>`. Python's `Callable[[int], int]` is the type of a function that takes an `int` and returns an `int` — equivalent to TypeScript's `(n: number) => number`.

---

## Connect the Pieces

- **Django and FastAPI** use Python type hints extensively. FastAPI auto-generates API documentation and validates request bodies from Pydantic models (LAB-045) which use type hints.
- **mypy in CI:** Adding `mypy --strict src/` to the CI pipeline catches type errors before code is deployed — the same role as TypeScript's `tsc --noEmit`.
- **Pyright** (from Microsoft, the engine behind Pylance in VS Code) is a faster alternative to mypy with similar capabilities.
- **Python's `dataclasses`** (LAB-045) use field type annotations to generate `__init__` automatically.

---

## What Breaks Without This

**The classic None bug:**

```python
def get_user_name(user_id: int):  # No type hint
    users = {1: "Alice"}
    return users.get(user_id)  # might return None

name = get_user_name(99)
name.upper()  # Runtime: AttributeError: 'NoneType' object has no attribute 'upper'
```

This bug is invisible until it runs in production. With type hints and mypy:
- `get_user_name` returns `str | None`
- mypy flags `name.upper()` without a `None` check
- The bug is caught before deployment

---

## Definition of Done

- [ ] Annotate three Python functions with parameter and return types
- [ ] mypy reports an error when you pass the wrong type to a typed function
- [ ] `Optional[str]` — mypy reports an error when you use the value without checking for `None`
- [ ] `list[int]` — mypy reports an error when you append a string to a typed list
- [ ] You can explain why Python type hints have zero runtime overhead

**Git commit:**

```
git add src/
git commit -m "LAB-041: Python type hints and mypy — gradual typing explained; Optional[T] forces None-handling; runtime has zero type enforcement"
```

---

## Quick Check Answers

1. **Nothing happens.** Python ignores type hints at runtime. The code runs exactly as if the annotations were not there. Type errors only appear if you run a static checker like mypy or Pyright.
2. **mypy** (or Pyright, Pylance). These are external tools separate from the Python interpreter. Running `mypy file.py` checks types without executing the code.
3. **They mean exactly the same thing.** `Optional[str]` is `typing.Optional[str]` which is defined as `Union[str, None]` which in Python 3.10+ is written `str | None`. The `Optional` name is older syntax; `str | None` is the modern equivalent. Both tell mypy that the value can be a string or absent (None).
