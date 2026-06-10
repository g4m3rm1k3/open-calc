# Junior to Senior — T5·L0d — `@property`, `@staticmethod`, `@classmethod`

**Prerequisites:** T5·L0c (Decorators). You understand how decorators work —
`@decorator` is `func = decorator(func)`. This lesson covers the three built-in
method decorators that appear in almost every real Python class.

**What this lab adds:**
- `@property`: a method that behaves like an attribute — `task.label` not `task.get_label()`
- `@property.setter`: validating assignment: `task.priority = 'high'` goes through a method
- `@staticmethod`: utility functions that conceptually belong to a class but need neither `self` nor `cls`
- `@classmethod`: receives the class (`cls`) — used for alternative constructors like `Task.from_dict(data)`

**Time:** 45–60 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. `task.priority = 'invalid'` should raise `ValueError`. Does adding
>    `@property` to `priority` alone achieve this?
> 2. `Event.from_dict(data)` creates an Event from a dictionary. Which decorator
>    does `from_dict` use — `@staticmethod` or `@classmethod`? Why?
> 3. `Task._validate_title(title)` does not use `self` or `cls`. Which decorator?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

An updated `Task` class where attributes are validated on assignment and alternative
constructors are provided:

```python
# @property: read as attribute, validates on write
>>> task = Task('Write tests')
>>> task.priority = 'invalid'
ValueError: Priority must be low, medium, or high. Got 'invalid'.
>>> task.priority = 'high'  # fine
>>> task.full_label
'[HIGH] Write tests'

# @classmethod: alternative constructor
>>> task = Task.from_dict({'title': 'Deploy', 'priority': 'high'})
>>> task.title
'Deploy'

# @staticmethod: utility without instance
>>> Task.is_valid_priority('high')
True
```

---

### Concept: `@property` — Computed Attributes and Validation

**What it is:** `@property` turns a method into an attribute access. The method
runs when you write `obj.attribute` (without parentheses). The `@attribute.setter`
companion runs when you write `obj.attribute = value`.

**The problem before:**

```python
class Task:
    def __init__(self, title):
        self.title    = title
        self.priority = 'medium'    # nothing stops: task.priority = 'garbage'

task = Task('Write tests')
task.priority = 999          # silent — stored as an integer
task.priority = 'URGENT'     # silent — stored as a string, but not a valid priority
# Later, the API serialises this and the frontend receives 'URGENT' — crash
```

There's no enforcement. Any code can write any value to `priority`.

**The solution:**

```python
class Task:
    def __init__(self, title):
        self._priority = 'medium'   # _prefix: convention for "managed internally"
        self.title = title

    @property
    def priority(self) -> str:          # getter: called on task.priority
        return self._priority

    @priority.setter
    def priority(self, value: str) -> None:   # setter: called on task.priority = 'high'
        valid = {'low', 'medium', 'high'}
        if value not in valid:
            raise ValueError(f'Priority must be one of {valid}. Got {value!r}.')
        self._priority = value

task = Task('Write tests')
task.priority = 'invalid'    # → ValueError: Priority must be one of...
task.priority = 'high'       # fine
task.priority                # → 'high'  (no parentheses — looks like an attribute)
```

**What it hides:** The method call. From the caller's perspective, `task.priority` looks
exactly like reading a plain attribute. The validation machinery is invisible. This means
you can add validation to an existing attribute later without changing ANY call site —
callers who already write `task.priority = 'high'` don't have to change to `task.set_priority('high')`.

**Canonical example:** A thermostat. You read and set the temperature directly: `thermostat.temp = 72`.
Internally, the thermostat validates that 72 is within a safe range and sends a signal
to the heating unit. The user never sees the internal mechanism — they just read and write a number.

**Project application:** `Task.priority` will be validated on every assignment —
from `__init__`, from API request handlers, from database loading. One setter, enforced everywhere.

**Smallest possible example:**

```python
class Circle:
    def __init__(self, radius: float) -> None:
        self.radius = radius   # uses the setter below

    @property
    def radius(self) -> float:
        return self._radius

    @radius.setter
    def radius(self, value: float) -> None:
        if value <= 0:
            raise ValueError('Radius must be positive')
        self._radius = value

    @property
    def area(self) -> float:            # read-only computed property
        import math
        return math.pi * self._radius ** 2

c = Circle(5)
c.area              # → 78.54  (no parentheses — computed on demand)
c.radius = -1       # → ValueError: Radius must be positive
c.area = 100        # → AttributeError: can't set attribute (no setter)
```

**Why it matters here:** `Task.priority` accepts only `'low'`, `'medium'`, `'high'`.
This invariant must hold everywhere — the property setter is the single enforcement point.

**You will see this again in:**
- SQLAlchemy: mapped columns use `@hybrid_property` for computed SQL expressions
- Pydantic: `@computed_field @property` for fields derived from other fields
- Python `dataclasses.dataclass`: `@cached_property` from `functools` caches the first result
- Every domain model class where attributes have invariants

**Watch for:** The private attribute convention. When you add a setter for `priority`, the
actual stored value must use a different name (`_priority`) — otherwise the setter calls
itself recursively: `self.priority = value` → calls the setter → `self.priority = value` → ...
→ `RecursionError`. Use `self._priority` for the stored value.

---

## Step 1 — Add `@property` and `@priority.setter` to `Task`

First, see the problem. In `task.py`, `priority` is currently a plain attribute:

```bash
python -c "
from src.domain.task import Task
t = Task('Write tests')
t.priority = 'garbage'   # no error — BAD
print(t.priority)
"
```

**You should see:** `garbage` — stored without validation.

Now fix it. Update `src/domain/task.py`. The changes are:
1. Rename `self.priority = priority` to `self._priority = 'medium'` (internal storage)
2. Add `@property` getter and `@priority.setter`
3. Change `__init__` to use the setter for validation

```python
# src/domain/task.py
from __future__ import annotations
from datetime import date, timedelta

_VALID_PRIORITIES = frozenset({'low', 'medium', 'high'})   # ← add this constant


class Task:
    def __init__(self, title: str, priority: str = 'medium') -> None:
        self.title    = title.strip()
        self._priority = 'medium'           # ← internal storage (setter not yet called)
        self.priority  = priority           # ← calls the setter — validates 'medium' or whatever was passed
        self.done      = False

    @property
    def priority(self) -> str:              # ← add this getter
        return self._priority

    @priority.setter
    def priority(self, value: str) -> None:  # ← add this setter
        if value not in _VALID_PRIORITIES:
            raise ValueError(
                f'Priority must be one of {sorted(_VALID_PRIORITIES)}. Got {value!r}.'
            )
        self._priority = value

    def complete(self) -> None:
        self.done = True

    def __repr__(self) -> str:
        status = '✓' if self.done else '○'
        return f"Task({status} {self.title!r} [{self.priority}])"

    def __eq__(self, other: object) -> bool:
        if not isinstance(other, Task):
            return NotImplemented
        return self.title == other.title and self.priority == other.priority

    def __hash__(self) -> int:
        return hash((self.title, self.priority))
```

### SAVE AND TRY

```bash
python -c "
from src.domain.task import Task
t = Task('Write tests')
t.priority = 'high'   # valid — fine
print(t.priority)
t.priority = 'garbage'
"
```

**You should see:**
```
high
Traceback (most recent call last):
  ...
ValueError: Priority must be one of ['high', 'low', 'medium']. Got 'garbage'.
```

**Change something:** Try creating a task with an invalid priority:

```bash
python -c "
from src.domain.task import Task
Task('Write tests', priority='URGENT')
"
```

**Expected:** Same `ValueError` — validation happens in `__init__` because
`self.priority = priority` calls the setter.

---

### Concept: `@property` for Computed, Read-Only Attributes

**What it is:** A `@property` with no setter is read-only. Trying to assign to it
raises `AttributeError`. It is used for values computed from other fields.

**The problem before:**

```python
task.full_label   # → AttributeError: 'Task' object has no attribute 'full_label'
# You have to call a method: task.get_full_label()
# But callers must know it's a method, not an attribute.
```

**The solution:**

```python
@property
def full_label(self) -> str:
    return f'[{self.priority.upper()}] {self.title}'
```

```python
task.full_label   # → '[MEDIUM] Write tests'  (no parentheses)
task.full_label = 'override'   # → AttributeError: can't set attribute (no setter defined)
```

**What it hides:** Whether the value is stored or computed. Callers write `task.full_label`
either way. You can change the implementation (stored vs computed) without changing callers.

**Project application:** `Task.full_label` is always derived from `title` and `priority`.
It should not be stored separately (redundant data). A computed property is correct.

**Smallest possible example:**

```python
class Rectangle:
    def __init__(self, width: float, height: float) -> None:
        self.width  = width
        self.height = height

    @property
    def area(self) -> float:
        return self.width * self.height   # computed, not stored

r = Rectangle(4, 5)
r.area        # → 20.0
r.area = 100  # → AttributeError: can't set attribute
```

**You will see this again in:**
- Django models: `@property` for derived fields (full name from first + last)
- Pydantic: `@computed_field` (a property that's included in serialisation)
- React equivalent: derived state computed in the render function (not stored in state)

**Watch for:** Putting expensive computation in a `@property`. Properties are called
on every access — if `task.report` runs a database query, every `task.report` is a
new query. Use `@functools.cached_property` instead for expensive computed values.

---

## Step 2 — Add `full_label` Property

Add below `priority.setter` in `task.py`:

```python
    @priority.setter
    def priority(self, value: str) -> None:
        if value not in _VALID_PRIORITIES:
            raise ValueError(
                f'Priority must be one of {sorted(_VALID_PRIORITIES)}. Got {value!r}.'
            )
        self._priority = value

    @property
    def full_label(self) -> str:             # ← add this read-only property
        return f'[{self.priority.upper()}] {self.title}'
```

### SAVE AND TRY

```bash
python -c "
from src.domain.task import Task
t = Task('Write tests', priority='high')
print(t.full_label)     # computed — no parentheses needed
t.priority = 'low'      # change priority
print(t.full_label)     # recomputed automatically from new priority
"
```

**You should see:**
```
[HIGH] Write tests
[LOW] Write tests
```

---

### Concept: `@staticmethod` — Utility Functions on the Class

**What it is:** A `@staticmethod` is a regular function that lives in the class's
namespace. It receives neither `self` (the instance) nor `cls` (the class). It cannot
access or modify instance or class state.

**The problem before:**

```python
# This validation function doesn't need self or cls — it only inspects the value:
def is_valid_priority(value: str) -> bool:
    return value in {'low', 'medium', 'high'}

# But it conceptually belongs to Task. As a module function, it's disconnected:
is_valid_priority('high')          # called from anywhere — no association with Task
Task.is_valid_priority('high')     # AttributeError — doesn't exist on Task
```

**The solution:**

```python
@staticmethod
def is_valid_priority(value: str) -> bool:
    return value in {'low', 'medium', 'high'}

Task.is_valid_priority('high')   # True  — called on the class
task.is_valid_priority('high')   # True  — can also call on an instance
```

**What it hides:** Nothing — `@staticmethod` is about namespace, not abstraction.
It is a signal: "this function belongs to the class conceptually, but does not
touch instance or class state."

**Canonical example:** A `MathUtils.clamp(value, min, max)` static method. Clamping
has nothing to do with any specific MathUtils instance — it's a pure computation.
It belongs to `MathUtils` by subject matter, not by state.

**Project application:** `Task.is_valid_priority(value)` is a helper for validating
input before attempting to create a task. FastAPI route handlers can call this to
validate query parameters without needing a `Task` instance.

**Smallest possible example:**

```python
class Converter:
    @staticmethod
    def celsius_to_fahrenheit(celsius: float) -> float:
        return celsius * 9/5 + 32   # no self, no cls — pure computation

Converter.celsius_to_fahrenheit(100)   # → 212.0  (class call)
c = Converter()
c.celsius_to_fahrenheit(0)             # → 32.0   (instance call — also works)
```

**Why it matters here:** `is_valid_priority` and `_normalise_title` are pure functions
that logically belong to `Task` but need no instance.

**You will see this again in:**
- Python's `datetime.date.today()` is actually a `@classmethod`, but static methods appear in — `str.maketrans()`, `bytes.fromhex()`, `int.from_bytes()`
- Every utility/helper method that belongs to a class but doesn't need `self`
- TypeScript equivalent: `static` methods that don't use `this`

**Watch for:** Using `@staticmethod` when you need `@classmethod`. If the method
needs to call other class methods or create new instances using the class (`cls(...)`),
use `@classmethod`. If it truly doesn't need the class at all, use `@staticmethod`.

---

### Concept: `@classmethod` — Alternative Constructors

**What it is:** A `@classmethod` receives the class itself as the first argument
(`cls` instead of `self`). It can access class-level data and, most importantly,
create instances using `cls(...)` — which respects inheritance.

**The problem before:**

```python
# A task is coming in from an API request as a dict.
# You need to convert it. Options:
task = Task(title=data['title'], priority=data.get('priority', 'medium'))
# This logic is scattered wherever Tasks are created from dicts.
# Change the constructor signature? Update every call site.
```

**The solution — a named constructor on the class:**

```python
@classmethod
def from_dict(cls, data: dict) -> 'Task':
    return cls(
        title    = data['title'],
        priority = data.get('priority', 'medium'),
    )

# All creation from dicts goes through one place:
task = Task.from_dict({'title': 'Deploy', 'priority': 'high'})
```

**Why `cls` instead of `Task`?** If `UrgentTask` inherits this method, `cls` is
`UrgentTask` — so `UrgentTask.from_dict(data)` creates an `UrgentTask`, not a `Task`.
If you hardcode `Task(...)`, the subclass always creates a `Task`, breaking polymorphism.

**What it hides:** The construction details. All the knowledge about which dict keys
to read and what the defaults are lives in `from_dict`. Callers just pass a dict.

**Canonical example:** A pizza order system. `Pizza.from_order_form(form_data)` is a
classmethod — it reads the form's `size`, `toppings`, and `crust_type` keys and
constructs the Pizza. One place to change if the form adds a new field.

**Project application:** `Task.from_dict(body.model_dump())` in the FastAPI route handler
creates a Task from the validated request body. `Task.urgent(title)` creates a high-priority
Task without callers knowing the default value.

**Smallest possible example:**

```python
class Temperature:
    def __init__(self, celsius: float) -> None:
        self.celsius = celsius

    @classmethod
    def from_fahrenheit(cls, fahrenheit: float) -> 'Temperature':
        celsius = (fahrenheit - 32) * 5 / 9
        return cls(celsius)   # cls is Temperature — creates a Temperature

t = Temperature.from_fahrenheit(212)
t.celsius   # → 100.0
```

**You will see this again in:**
- `datetime.date.fromisoformat('2024-01-15')` — classmethod on `date`
- `Enum('Choice', ['A', 'B', 'C'])` — classmethod-based construction
- Pydantic: `Task.model_validate(data)` — classmethod that creates a model from a dict
- SQLAlchemy: `Task.from_orm(db_row)` pattern

**Watch for:** The inheritance benefit is lost if you hardcode the class name.
`return Task(...)` inside a classmethod means subclasses always get a `Task`, not
themselves. Always use `return cls(...)`.

---

## Step 3 — Add `@staticmethod` and `@classmethod` to `Task`

Add below `full_label` in `task.py`:

```python
    @property
    def full_label(self) -> str:
        return f'[{self.priority.upper()}] {self.title}'

    @staticmethod
    def is_valid_priority(value: str) -> bool:     # ← add this utility
        """Returns True if value is a valid priority string."""
        return value in _VALID_PRIORITIES

    @classmethod
    def from_dict(cls, data: dict) -> 'Task':       # ← add this constructor
        """Creates a Task from a dictionary (e.g., an API request body)."""
        return cls(
            title    = data['title'],
            priority = data.get('priority', 'medium'),
        )

    @classmethod
    def urgent(cls, title: str) -> 'Task':          # ← add this convenience constructor
        """Creates a high-priority Task."""
        return cls(title=title, priority='high')
```

### SAVE AND TRY

```bash
python -c "
from src.domain.task import Task

# @staticmethod:
print(Task.is_valid_priority('high'))     # True
print(Task.is_valid_priority('urgent'))   # False

# @classmethod:
t1 = Task.from_dict({'title': 'Deploy', 'priority': 'high'})
print(t1.title, t1.priority)

t2 = Task.urgent('Fix critical bug')
print(t2.title, t2.priority)
"
```

**You should see:**
```
True
False
Deploy high
Fix critical bug high
```

**Change something:** Verify that `from_dict` with an invalid priority raises:

```bash
python -c "
from src.domain.task import Task
Task.from_dict({'title': 'Test', 'priority': 'WRONG'})
"
```

**Expected:** `ValueError: Priority must be one of...` — the setter validates even
when constructing via `from_dict`, because `from_dict` calls `cls(...)` which calls
`__init__` which calls the setter.

---

## Step 4 — Write the Tests

Create or update `tests/test_task_properties.py`:

```python
# tests/test_task_properties.py
import pytest
from datetime import date
from src.domain.task import Task


class TestPropertyGetters:

    def test_full_label_combines_uppercase_priority_and_title(self) -> None:
        task = Task('Write tests', priority='high')
        assert task.full_label == '[HIGH] Write tests'

    def test_full_label_updates_when_priority_changes(self) -> None:
        task = Task('Write tests', priority='medium')
        task.priority = 'low'
        assert task.full_label == '[LOW] Write tests'

    def test_full_label_is_read_only(self) -> None:
        task = Task('Write tests')
        with pytest.raises(AttributeError):
            task.full_label = 'override'   # no setter defined


class TestPrioritySetter:

    def test_setter_accepts_valid_priorities(self) -> None:
        task = Task('Write tests')
        for valid in ('low', 'medium', 'high'):
            task.priority = valid   # should not raise
            assert task.priority == valid

    def test_setter_rejects_invalid_priority(self) -> None:
        task = Task('Write tests')
        with pytest.raises(ValueError, match='Priority must be'):
            task.priority = 'urgent'

    def test_init_uses_setter_for_validation(self) -> None:
        with pytest.raises(ValueError):
            Task('Write tests', priority='INVALID')


class TestStaticMethods:

    def test_is_valid_priority_returns_true_for_valid_values(self) -> None:
        assert Task.is_valid_priority('high')   is True
        assert Task.is_valid_priority('medium') is True
        assert Task.is_valid_priority('low')    is True

    def test_is_valid_priority_returns_false_for_invalid_values(self) -> None:
        assert Task.is_valid_priority('urgent')  is False
        assert Task.is_valid_priority('')        is False
        assert Task.is_valid_priority('HIGH')    is False   # case-sensitive

    def test_can_call_on_instance_or_class(self) -> None:
        task = Task('Write tests')
        assert task.is_valid_priority('high') == Task.is_valid_priority('high')


class TestClassMethods:

    def test_from_dict_creates_task_with_all_fields(self) -> None:
        task = Task.from_dict({'title': 'Deploy', 'priority': 'high'})
        assert task.title    == 'Deploy'
        assert task.priority == 'high'

    def test_from_dict_uses_medium_as_default_priority(self) -> None:
        task = Task.from_dict({'title': 'Deploy'})
        assert task.priority == 'medium'

    def test_from_dict_raises_for_invalid_priority(self) -> None:
        with pytest.raises(ValueError):
            Task.from_dict({'title': 'Deploy', 'priority': 'INVALID'})

    def test_urgent_creates_high_priority_task(self) -> None:
        task = Task.urgent('Fix critical bug')
        assert task.priority == 'high'
        assert task.title    == 'Fix critical bug'
```

### SAVE AND TRY

```bash
pytest tests/test_task_properties.py -v
```

**You should see:**
```
tests/test_task_properties.py::TestPropertyGetters::test_full_label_combines_uppercase_priority_and_title PASSED
...
tests/test_task_properties.py::TestClassMethods::test_urgent_creates_high_priority_task PASSED

11 passed
```

**Change something:** Add `@property.deleter` to see what happens when you try
`del task.priority`. First write a failing test, then add the deleter:

```python
def test_delete_priority_raises_attribute_error(self) -> None:
    task = Task('Write tests')
    with pytest.raises(AttributeError):
        del task.priority   # no deleter defined — should raise
```

Expected: passes without adding a deleter, because Python raises `AttributeError`
automatically when no `@priority.deleter` is defined.

---

## 🎯 Challenge: Add `ProjectStats` With `@cached_property`

**You know:** `@property`, `@staticmethod`, `@classmethod`.

**Task:** Build a `ProjectStats` class that computes statistics from a list of tasks.
Use `@cached_property` from `functools` for expensive computations (computed once,
then stored):

```python
from src.domain.stats import ProjectStats
stats = ProjectStats(tasks)
stats.total          # int — total task count
stats.done_count     # int — completed tasks
stats.completion_rate  # float — done_count / total (0.0 if total is 0)
stats.by_priority    # dict mapping priority → list[Task]
```

Each statistic should be a `@cached_property` — computed on first access,
then stored and reused on subsequent accesses.

Write 4 tests before implementing.

---

<details>
<summary>▶ Show Solution</summary>

```python
# src/domain/stats.py
from __future__ import annotations
from collections import defaultdict
from functools import cached_property
from src.domain.task import Task


class ProjectStats:
    def __init__(self, tasks: list[Task]) -> None:
        self._tasks = tasks

    @cached_property
    def total(self) -> int:
        return len(self._tasks)

    @cached_property
    def done_count(self) -> int:
        return sum(1 for t in self._tasks if t.done)

    @cached_property
    def completion_rate(self) -> float:
        if self.total == 0:
            return 0.0
        return self.done_count / self.total

    @cached_property
    def by_priority(self) -> dict[str, list[Task]]:
        result: dict[str, list[Task]] = defaultdict(list)
        for task in self._tasks:
            result[task.priority].append(task)
        return dict(result)
```

**Tests:**
```python
def test_total_matches_task_count() -> None:
    stats = ProjectStats([Task('A'), Task('B'), Task('C')])
    assert stats.total == 3

def test_completion_rate_is_zero_for_empty_list() -> None:
    assert ProjectStats([]).completion_rate == 0.0

def test_completion_rate_when_all_done() -> None:
    tasks = [Task('A'), Task('B')]
    for t in tasks: t.complete()
    assert ProjectStats(tasks).completion_rate == 1.0

def test_by_priority_groups_tasks_correctly() -> None:
    tasks = [Task('A', 'high'), Task('B', 'low'), Task('C', 'high')]
    stats = ProjectStats(tasks)
    assert len(stats.by_priority['high']) == 2
    assert len(stats.by_priority['low'])  == 1
```

**Key insight:** `@cached_property` computes the value on first access and stores it
as an instance attribute (same name). Subsequent accesses return the stored value without
re-running the method. This is an optimisation pattern — use it when computation is
expensive, not for every property. Unlike `@property`, `@cached_property` is not
thread-safe without a lock.

</details>

---

## Final Check

| Decorator | Called as | Receives | Use when |
|---|---|---|---|
| `@property` (getter) | `obj.attr` | `self` | Reading computed/validated values |
| `@attr.setter` | `obj.attr = val` | `self`, `val` | Enforcing invariants on write |
| `@staticmethod` | `Class.method()` or `obj.method()` | Nothing | Utility with no instance/class state |
| `@classmethod` | `Class.method()` or `obj.method()` | `cls` | Alternative constructors |

---

## Quick Check Answers

**1. `task.priority = 'invalid'` should raise. Does `@property` alone achieve this?**

No. `@property` alone makes the attribute read-only (no setter). Assigning raises
`AttributeError: can't set attribute` — not a `ValueError` with a meaningful message.
To allow setting with validation, you need `@priority.setter`. The setter receives
the new value and can raise `ValueError` for values that fail validation.

**2. `Event.from_dict(data)` — `@staticmethod` or `@classmethod`?**

`@classmethod`. Two reasons: (1) it creates a new instance using the class
(`cls(...)`). If you inherit `from_dict` in a subclass, `cls` is the subclass —
you get an instance of the subclass, not the parent. (2) A `@staticmethod` does
not receive `cls`, so it cannot call `cls(...)` — it would have to hardcode `Event(...)`,
breaking subclasses.

**3. `_validate_title(title)` uses neither `self` nor `cls`. Which decorator?**

`@staticmethod`. The method needs no access to instance data (`self`) or the class
itself (`cls`). It is a pure utility function that happens to belong to `Task` by
subject matter. A `@staticmethod` signals this clearly: "this function is part of the
class namespace, but operates only on its explicit arguments."
