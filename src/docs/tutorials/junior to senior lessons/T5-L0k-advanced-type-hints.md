# Junior to Senior — T5·L0k — Advanced Type Hints

**Prerequisites:** T5·L0j (`functools`, `itertools`, `collections`). You have broad
standard library coverage. This lesson covers the Python type system features you
will see throughout FastAPI, SQLAlchemy, and Pydantic code — and which appear
constantly in professional Python projects.

**What this lab adds:**
- `TypeVar('T')`: a placeholder type for generics — "some consistent type"
- `Generic[T]`: parameterised classes: `class Stack(Generic[T]):`
- `Callable[[ArgType], ReturnType]`: the type of a function
- `TypedDict`: a dictionary with typed keys
- `TYPE_CHECKING`: avoiding circular imports while keeping full type annotations

**Time:** 45–60 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. `def first(items: list) -> ???`. What return type annotation ensures the
>    return type matches the element type of the list — without using `Any`?
> 2. A function accepts a callback: `process(data, on_complete)`. The callback
>    takes a `Task` and returns `None`. What is the type of `on_complete`?
> 3. You need to annotate a function that returns `{'title': str, 'priority': str}`.
>    Which typing construct is more specific than `dict[str, str]`?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

A generic `Result[T]` type and a typed API schema using `TypedDict`:

```python
>>> result: Result[Task] = Result.ok(task)
>>> result.value
Task(○ 'Write tests' [medium])
>>> result.is_ok
True

>>> failed: Result[Task] = Result.failure('Title is required')
>>> failed.is_ok
False
>>> failed.error_message
'Title is required'
```

---

### Concept: `TypeVar` — The "Some Consistent Type" Placeholder

**What it is:** `TypeVar('T')` declares a type variable — a placeholder that says
"there is some type here, and it will be consistent throughout this usage." The
type checker infers what `T` is at each call site.

**The problem before:**

```python
def first(items: list) -> ???:
    return items[0]

# Without TypeVar, you'd use 'Any':
def first(items: list) -> Any:
    return items[0]

tasks: list[Task] = [...]
t = first(tasks)   # t has type 'Any' — type checker cannot check anything about t
t.title             # no type checker support — no autocomplete, no error detection
```

**The solution:**

```python
from typing import TypeVar

T = TypeVar('T')   # T is a placeholder for "some consistent type"

def first(items: list[T]) -> T:   # input list[T], returns T — same type
    return items[0]

tasks: list[Task] = [...]
t = first(tasks)   # type checker infers: t is Task
t.title             # type checker: correct — Task has title
t.nonexistent      # type checker: error — Task has no nonexistent attribute
```

**What it hides:** The type inference computation. The type checker substitutes the
actual type for `T` at each call site — `T = Task` when you call `first(task_list)`.
You write one function; the type checker validates it against every concrete use.

**Canonical example:** A function that wraps any gift. `def wrap(gift: T) -> T` says
"whatever you give me, I return the same type." The wrapping paper doesn't change
what's inside. The type variable `T` is the "any type of gift."

**Project application:** `Result[T]` — a success wraps a value of type `T`; a failure
wraps an error. The type checker knows `Result[Task].value` returns `Task`, not `Any`.

**Smallest possible example:**

```python
from typing import TypeVar

T = TypeVar('T')

def identity(value: T) -> T:   # returns the same type it receives
    return value

identity('hello')   # type: str
identity(42)        # type: int
identity(Task('x')) # type: Task — type checker knows this
```

**You will see this again in:**
- `list[T]`, `dict[K, V]` — Python's built-in generics use TypeVar internally
- SQLAlchemy: `Mapped[T]` uses TypeVar to type column values
- Every generic container class in a professional Python codebase
- TypeScript's `T` in generics is conceptually identical

**Watch for:** `TypeVar` is defined once at module level, not inside a function.
`T = TypeVar('T')` at the top of the file. Using a different `TypeVar` for each
function gives the type checker per-function type information.

---

## Step 1 — See TypeVar in Action

```bash
python -c "
from typing import TypeVar

T = TypeVar('T')

def first(items: list[T]) -> T:
    return items[0]

# The type of 'result' is inferred from the argument:
result = first([1, 2, 3])
print(type(result).__name__)   # int — matches the list element type

result2 = first(['hello', 'world'])
print(type(result2).__name__)  # str
"
```

**You should see:**
```
int
str
```

The runtime behavior is correct. The type checker would also infer `result: int`
and `result2: str` statically.

---

### Concept: `Generic[T]` — Parameterised Classes

**What it is:** `Generic[T]` makes a class accept a type parameter. `class Result(Generic[T])`
means `Result[Task]` and `Result[User]` are distinct types with different `.value` types.

**The problem before:**

```python
class Result:
    def __init__(self, value: Any, error: str | None) -> None:
        self._value = value
        self._error = error

    @property
    def value(self) -> Any:   # 'Any' — no type checking for callers
        return self._value

r: Result = Result.ok(Task('Write tests'))
r.value.title   # no type error — but what if r.value is a User? Same 'Any' type
```

**The solution:**

```python
from typing import Generic, TypeVar

T = TypeVar('T')

class Result(Generic[T]):
    def value(self) -> T:   # the type checker knows the concrete type at each use
        ...

r: Result[Task] = Result.ok(Task('Write tests'))
r.value.title   # type checker: correct — value is Task, Task has title
r.value.email   # type checker: error — Task has no email attribute
```

**What it hides:** The type parameter binding. When you write `Result[Task]`, the
type checker replaces every `T` in `Result` with `Task`. The runtime class is the same
`Result` object — `Generic[T]` only affects static analysis.

**Canonical example:** A sealed envelope. `Envelope[Task]` can only contain a `Task`.
`Envelope[User]` can only contain a `User`. The envelope shape is the same, but the
contents' type is tracked.

**Project application:** `Result[T]` is the return type for any operation that might
fail — `create_task() -> Result[Task]`. Callers know `result.value` is a `Task`.

**Smallest possible example:**

```python
from typing import Generic, TypeVar

T = TypeVar('T')

class Box(Generic[T]):
    def __init__(self, contents: T) -> None:
        self._contents = contents

    def unwrap(self) -> T:
        return self._contents

int_box = Box(42)
str_box = Box('hello')

int_box.unwrap()   # type: int
str_box.unwrap()   # type: str
```

**You will see this again in:**
- SQLAlchemy: `Mapped[str]`, `Mapped[int | None]` are `Generic[T]` uses
- Python standard library: `list[T]`, `dict[K, V]`, `Optional[T]` all use TypeVar
- FastAPI: `response_model=list[TaskResponse]` uses Generic internally

**Watch for:** Generic classes are the SAME class at runtime — `Box[int]` and `Box[str]`
are both just `Box` at runtime. `isinstance(box, Box[int])` raises `TypeError` — use
`isinstance(box, Box)` for runtime checks.

---

## Step 2 — Build `Result[T]`

Create `src/domain/result.py`:

```python
# src/domain/result.py
from __future__ import annotations
from typing import Generic, TypeVar

T = TypeVar('T')


class Result(Generic[T]):
    """
    A value that is either a success (with a value of type T) or a failure
    (with an error message). Replaces try/except for expected failure modes.
    """

    def __init__(
        self,
        *,
        value: T | None = None,
        error: str | None = None,
    ) -> None:
        self._value = value
        self._error = error

    @classmethod
    def ok(cls, value: T) -> 'Result[T]':             # ← success factory
        return cls(value=value)

    @classmethod
    def failure(cls, error: str) -> 'Result[T]':      # ← failure factory
        return cls(error=error)

    @property
    def is_ok(self) -> bool:
        return self._error is None

    @property
    def value(self) -> T:
        if not self.is_ok:
            raise ValueError(f'Cannot get value of failed result: {self._error}')
        return self._value   # type: ignore[return-value]

    @property
    def error_message(self) -> str:
        if self.is_ok:
            raise ValueError('Cannot get error message of successful result')
        return self._error   # type: ignore[return-value]

    def __repr__(self) -> str:
        if self.is_ok:
            return f'Result.ok({self._value!r})'
        return f'Result.failure({self._error!r})'
```

### SAVE AND TRY

```bash
python -c "
from src.domain.task   import Task
from src.domain.result import Result

# Success:
t      = Task('Write tests')
result = Result.ok(t)
print(result.is_ok)       # True
print(result.value)       # Task(○ 'Write tests' [medium])

# Failure:
failed = Result.failure('Title is required')
print(failed.is_ok)           # False
print(failed.error_message)   # 'Title is required'
try:
    failed.value
except ValueError as e:
    print('blocked:', e)
"
```

**You should see:**
```
True
Task(○ 'Write tests' [medium])
False
Title is required
blocked: Cannot get value of failed result: Title is required
```

---

### Concept: `Callable` — The Type of a Function

**What it is:** `Callable[[ArgType1, ArgType2], ReturnType]` is the type annotation
for a function or any callable object. The list gives the argument types; the second
element gives the return type.

**The problem before:**

```python
def process_tasks(tasks: list[Task], on_complete) -> None:
    # ↑ on_complete has type 'Any' — no type checking on how it's called
    for task in tasks:
        on_complete(task)   # type checker cannot verify this call
```

**The solution:**

```python
from typing import Callable

def process_tasks(
    tasks:       list[Task],
    on_complete: Callable[[Task], None],  # ← a function that takes Task, returns None
) -> None:
    for task in tasks:
        on_complete(task)   # type checker: correct — Task matches parameter type
```

**What it hides:** Function signature tracking. The type checker substitutes the
concrete function's type for `Callable[[Task], None]` and verifies compatibility.

**Canonical example:** A job application form with a skill requirement: "must be able
to drive a truck." The type is `Callable[[Truck], None]`. Any driver who can accept
a `Truck` and operate it satisfies the requirement.

**Project application:** `on_progress: Callable[[int], None]` — a callback that
receives a percent integer and returns nothing. Used in the job runner from T11-L3.

**Smallest possible example:**

```python
from typing import Callable

def apply(value: int, transform: Callable[[int], int]) -> int:
    return transform(value)

apply(5, lambda x: x * 2)   # → 10 (type checker: int → int)
apply(5, str)                # type checker: error — str returns str, not int
```

**You will see this again in:**
- FastAPI middleware: `Callable[[Request, Callable], Response]` — the ASGI protocol
- Event handlers: `EventBus.on(event_name, handler: Callable[[EventPayload], None])`
- Dependency injection: `Depends(factory: Callable[..., T])` in FastAPI

**Watch for:** `Callable[..., ReturnType]` (with `...` as the argument list) means
"a callable with ANY arguments that returns ReturnType." Use this when you don't
care about the argument types — only the return type matters.

---

### Concept: `TypedDict` — Dictionaries With Typed Keys

**What it is:** `TypedDict` describes a dictionary where specific keys have specific
types. More precise than `dict[str, Any]`.

**The problem before:**

```python
def create_task_from_request(body: dict[str, Any]) -> Task:
    # body might be: {'title': '...', 'priority': '...'}
    # Or it might have no 'title' key at all — no type checking
    return Task(title=body['title'], priority=body.get('priority', 'medium'))
```

**The solution:**

```python
from typing import TypedDict

class CreateTaskBody(TypedDict):
    title:    str
    priority: str           # required key

class UpdateTaskBody(TypedDict, total=False):   # total=False: all keys optional
    title:    str
    priority: str
    done:     bool

def create_task_from_request(body: CreateTaskBody) -> Task:
    return Task(title=body['title'], priority=body.get('priority', 'medium'))
    # type checker: 'title' is definitely present — str
    # type checker: 'priority' is optional — str if present
```

**What it hides:** The key validation. The type checker ensures code that creates
a `CreateTaskBody` includes all required keys with the right types. Code that reads
from it knows which keys exist and what types they are.

**Project application:** API request bodies are often dicts. `TypedDict` gives them
specific shapes for documentation and type checking without the overhead of Pydantic.

**Smallest possible example:**

```python
from typing import TypedDict

class Point(TypedDict):
    x: float
    y: float

def distance(p: Point) -> float:
    return (p['x']**2 + p['y']**2) ** 0.5

distance({'x': 3.0, 'y': 4.0})   # type checker: correct
distance({'x': 3.0})             # type checker: error — missing 'y'
```

**You will see this again in:**
- FastAPI: when you need dict-typed request bodies without full Pydantic validation
- pytest: `TypedDict` for typed test fixture dictionaries
- Configuration: `class AppConfig(TypedDict): host: str; port: int`

**Watch for:** `TypedDict` is a type — instances are plain `dict` objects at runtime.
`isinstance(d, CreateTaskBody)` is `isinstance(d, dict)` — it does NOT check key presence.
TypedDict enforcement is static only.

---

### Concept: `TYPE_CHECKING` — Import-Only-For-Types

**What it is:** `TYPE_CHECKING` is a constant that is `False` at runtime but `True`
during static analysis. Code inside `if TYPE_CHECKING:` runs only for the type checker.
This prevents circular imports while keeping full type annotations.

**The problem before:**

```python
# task.py imports Project to annotate a relationship:
from src.domain.project import Project   # ← circular: project.py imports Task

class Task:
    def __init__(self, project: Project | None = None) -> None:
        self.project = project

# At runtime:
# task.py imports project.py
# project.py imports task.py
# task.py is not finished importing yet
# → ImportError: cannot import name 'Task' from partially initialized module
```

**The solution:**

```python
from __future__ import annotations   # makes ALL annotations lazy strings at runtime
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from src.domain.project import Project  # only imported by the type checker

class Task:
    def __init__(self, project: 'Project | None' = None) -> None:
        # At runtime: 'Project' is a string — no import needed
        # At type-check time: Project was imported above
        self.project = project
```

**What it hides:** The deferred import. `from __future__ import annotations` makes all
annotations into lazy strings at runtime — they're never evaluated, so no import is
needed. The type checker evaluates them and resolves the import from `TYPE_CHECKING`.

**Project application:** `TaskRepository` imports `Task`; `Task` might reference
`Project`. With `TYPE_CHECKING`, both can refer to each other in annotations without
circular runtime imports.

**Smallest possible example:**

```python
# a.py:
from __future__ import annotations
from typing import TYPE_CHECKING
if TYPE_CHECKING:
    from b import B

class A:
    def process(self, other: B) -> None: ...   # 'B' is a string at runtime

# b.py:
from __future__ import annotations
from typing import TYPE_CHECKING
if TYPE_CHECKING:
    from a import A

class B:
    def respond(self, caller: A) -> None: ...  # 'A' is a string at runtime
```

**You will see this again in:**
- Every large Python codebase with many interconnected modules
- SQLAlchemy relationships: `Mapped[list['Task']]` — the string avoids circular imports
- FastAPI models that reference each other (`User` has `list[Task]`, `Task` has `User`)

**Watch for:** `from __future__ import annotations` affects ALL annotations in the
file. After adding it, annotations are strings at runtime even when not needed.
`get_type_hints(func)` can still resolve them at runtime.

---

## Step 3 — Build the API Schemas

Create `src/api/schemas.py`:

```python
# src/api/schemas.py
from typing import TypedDict


class CreateTaskBody(TypedDict):
    """Required keys for creating a task — all must be present."""
    title:    str
    priority: str


class UpdateTaskBody(TypedDict, total=False):
    """All keys are optional — PATCH request body."""
    title:    str
    priority: str
    done:     bool


class TaskResponse(TypedDict):
    """Shape of a task in an API response."""
    id:       str
    title:    str
    priority: str
    done:     bool
    due_date: str | None
    tags:     list[str]
```

### SAVE AND TRY

```bash
python -c "
from src.api.schemas import CreateTaskBody, UpdateTaskBody

# A valid CreateTaskBody:
body: CreateTaskBody = {'title': 'Write tests', 'priority': 'high'}
print(body['title'])

# UpdateTaskBody allows partial updates:
update: UpdateTaskBody = {'done': True}   # only 'done' — valid (total=False)
print(update)
"
```

**You should see:**
```
Write tests
{'done': True}
```

---

## Step 4 — Write the Tests

Create `tests/test_result.py`:

```python
# tests/test_result.py
import pytest
from src.domain.task   import Task
from src.domain.result import Result


class TestResult:

    def test_ok_result_is_ok(self) -> None:
        result: Result[int] = Result.ok(42)
        assert result.is_ok is True

    def test_ok_result_holds_value(self) -> None:
        task   = Task('Write tests')
        result: Result[Task] = Result.ok(task)
        assert result.value is task

    def test_failure_result_is_not_ok(self) -> None:
        result: Result[int] = Result.failure('something went wrong')
        assert result.is_ok is False

    def test_failure_result_holds_error_message(self) -> None:
        result: Result[int] = Result.failure('validation failed')
        assert result.error_message == 'validation failed'

    def test_getting_value_from_failure_raises(self) -> None:
        result: Result[int] = Result.failure('error')
        with pytest.raises(ValueError, match='Cannot get value'):
            _ = result.value

    def test_getting_error_from_success_raises(self) -> None:
        result: Result[int] = Result.ok(42)
        with pytest.raises(ValueError, match='Cannot get error'):
            _ = result.error_message

    def test_repr_shows_ok_result(self) -> None:
        result = Result.ok(42)
        assert 'Result.ok' in repr(result)

    def test_repr_shows_failure_result(self) -> None:
        result = Result.failure('bad input')
        assert 'Result.failure' in repr(result)
```

### SAVE AND TRY

```bash
pytest tests/test_result.py -v
```

**You should see:**
```
tests/test_result.py::TestResult::test_ok_result_is_ok PASSED
...
tests/test_result.py::TestResult::test_repr_shows_failure_result PASSED

8 passed
```

---

## 🎯 Challenge: Add `map` and `flat_map` to `Result`

**You know:** `Generic[T]`, `TypeVar`, `Callable`, `Result[T]`.

**Task:** Add two transformation methods:

```python
T = TypeVar('T')
U = TypeVar('U')

class Result(Generic[T]):
    def map(self, fn: Callable[[T], U]) -> 'Result[U]':
        """Apply fn to the value if ok; propagate failure unchanged."""

    def flat_map(self, fn: Callable[[T], 'Result[U]']) -> 'Result[U]':
        """Chain operations that might fail; propagates failure automatically."""
```

Example:
```python
Result.ok(5).map(lambda x: x * 2)         # → Result.ok(10)
Result.failure('err').map(lambda x: x*2)  # → Result.failure('err')
Result.ok('Write tests').flat_map(
    lambda title: Result.ok(Task(title)) if title else Result.failure('empty')
)
```

Write 4 tests first.

---

<details>
<summary>▶ Show Solution</summary>

```python
U = TypeVar('U')   # add at module level alongside T

class Result(Generic[T]):
    # ... existing code ...

    def map(self, fn: 'Callable[[T], U]') -> 'Result[U]':
        from typing import Callable
        if not self.is_ok:
            return Result.failure(self._error)   # type: ignore[arg-type]
        return Result.ok(fn(self._value))        # type: ignore[arg-type]

    def flat_map(self, fn: 'Callable[[T], Result[U]]') -> 'Result[U]':
        from typing import Callable
        if not self.is_ok:
            return Result.failure(self._error)   # type: ignore[arg-type]
        return fn(self._value)                   # type: ignore[arg-type]
```

**Tests:**
```python
def test_map_transforms_ok_value() -> None:
    result = Result.ok(5).map(lambda x: x * 2)
    assert result.value == 10

def test_map_propagates_failure_unchanged() -> None:
    result: Result[int] = Result.failure('error').map(lambda x: x * 2)
    assert result.is_ok is False
    assert result.error_message == 'error'

def test_flat_map_chains_successful_results() -> None:
    result = Result.ok(5).flat_map(lambda x: Result.ok(str(x)))
    assert result.value == '5'

def test_flat_map_propagates_inner_failure() -> None:
    result = Result.ok(5).flat_map(lambda _: Result.failure('inner error'))
    assert result.error_message == 'inner error'
```

**Key insight:** `Result.map` and `Result.flat_map` are the `fmap` and `bind`
operations of the Maybe/Option monad from functional programming. They let you
chain fallible operations without nested `if not result.is_ok:` checks.

</details>

---

## Final Check

| Feature | What it enables |
|---|---|
| `TypeVar('T')` | Return type tracks input type: `first(list[Task]) -> Task` |
| `Generic[T]` | Parameterised class: `Result[Task]` vs `Result[User]` |
| `Callable[[Task], None]` | Type-safe callback parameters |
| `TypedDict` | Typed dict with specific keys — more precise than `dict[str, Any]` |
| `TYPE_CHECKING` | Import-for-types only — prevents circular imports |

---

## Quick Check Answers

**1. `first(items: list) -> ???` — return type matching element type?**

`T = TypeVar('T')` then `def first(items: list[T]) -> T`. The type variable `T` is
inferred at each call site. `first([1, 2, 3])` returns `int`; `first(['a'])` returns
`str`. Without `TypeVar`, you'd use `Any` — losing all type-safety for the return value.

**2. Callback `on_complete` takes `Task`, returns `None` — its type annotation?**

`Callable[[Task], None]`. The `Callable` generic takes a list of argument types and
the return type: `Callable[[ArgType1, ArgType2], ReturnType]`. For one argument returning
None: `Callable[[Task], None]`. For no arguments: `Callable[[], None]`.

**3. Function returns `{'title': str, 'priority': str}` — what's more specific than `dict[str, str]`?**

`TypedDict`. Define `class TaskBody(TypedDict): title: str; priority: str`. The type
checker then knows exactly which keys exist and their types — `body['title']` is `str`,
and accessing `body['nonexistent']` is flagged as an error. `dict[str, str]` only says
"string keys and string values" without specifying which keys.
