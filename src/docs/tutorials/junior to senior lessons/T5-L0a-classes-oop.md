# Junior to Senior — T5·L0a — Classes and OOP in Python

**Prerequisites:** T5·L0 (Python Environment). You have Python and pytest running.
You know what a function is and what a dictionary is. This lesson teaches Python's
class system — the foundation for every domain object, service, and model in the backend.

**What this lab adds:**
- `class` with `__init__`: define a reusable blueprint for objects with their own data
- Instance attributes vs class attributes: per-object data vs shared data
- Inheritance: `class Dog(Animal)` — reuse behaviour without rewriting it
- `super().__init__()`: calling the parent's setup when extending a class
- `isinstance(obj, ClassName)`: confirming what kind of object you have at runtime

**Time:** 60–90 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. You have 50 tasks. Each needs a `title`, a `priority`, and a `done` flag. Right
>    now you store each as a plain dict: `{'title': '...', 'priority': '...', 'done': False}`.
>    What problem appears when you try to add a `complete()` operation to a task?
> 2. `class Counter: count = 0`. Two counters are created. Counter A increments
>    `count`. Does Counter B's `count` change too?
> 3. `class RecurringTask(Task)` — you write `__init__` but forget to call
>    `super().__init__()`. What breaks?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

A `Task` class and a `RecurringTask` subclass that work like this at the end of the lesson:

```python
>>> task = Task(title='Write tests', priority='high')
>>> task.title
'Write tests'
>>> task.done
False
>>> task.complete()
>>> task.done
True

>>> recurring = RecurringTask(title='Weekly review', priority='medium', interval_days=7)
>>> isinstance(recurring, Task)  # RecurringTask IS-A Task
True
>>> recurring.describe()
'Weekly review [medium] — repeats every 7 days'
```

---

### Concept: The Problem With Plain Dicts

**What it is:** A plain dictionary stores data but has no built-in behaviour.
To add operations, you write functions that take the dict as an argument —
which scatters the logic and lets any code modify the data any way it wants.

**The problem before:**

```python
# A task as a plain dict:
task = {'title': 'Write tests', 'priority': 'high', 'done': False}

# To "complete" the task, you need a separate function:
def complete_task(task_dict):
    task_dict['done'] = True

complete_task(task)   # works — but nothing stops this:
task['done'] = 'maybe'   # valid Python — corrupts the data silently
task['typo_field'] = True  # no error — you can add anything

# After 10 tasks in a list, this appears:
tasks[3]['prioirty'] = 'high'   # typo in field name — silent bug
```

**The solution:** A `class` bundles data and operations together, enforces a fixed
shape, and prevents arbitrary mutation.

**What it hides:**
- The raw version: separate functions and dicts everywhere, no enforcement, silent corruption
- The invariant it protects: once a `Task` is created, `task.title` is always a stripped,
  non-empty string (if you enforce it in `__init__`). No external code can bypass the
  constructor.

**Canonical example:**
A class is like a cookie cutter. The cutter (the class) defines the shape.
Each cookie (each instance) is a separate object made with that shape. The cutter
can be used to make 1,000 cookies — each one is independent.

```python
class Cookie:
    def __init__(self, flavor):  # __init__ runs when you bake a cookie
        self.flavor = flavor     # self is THIS cookie, not all cookies

chocolate = Cookie('chocolate')
vanilla   = Cookie('vanilla')
print(chocolate.flavor)  # → 'chocolate'
print(vanilla.flavor)    # → 'vanilla' — different object, different data
```

**Project application:** Every domain object in the task API — `Task`, `User`,
`Project` — is a class. Each instance is one item in the database.

**Smallest possible example:**

```python
class Point:
    def __init__(self, x, y):
        self.x = x          # instance attribute: belongs to THIS point
        self.y = y

    def distance_to_origin(self):
        return (self.x ** 2 + self.y ** 2) ** 0.5

p = Point(3, 4)
p.distance_to_origin()  # → 5.0
```

**Why it matters here:** Our `Task` objects need: stored data (title, priority, done),
enforced rules (title cannot be empty), and operations (`complete()`). Only a class
provides all three in one place.

**You will see this again in:**
- Every SQLAlchemy model: `class Task(Base): __tablename__ = 'tasks'`
- Every Pydantic model: `class TaskRequest(BaseModel): title: str`
- FastAPI's `APIRouter`, pytest fixtures, `dataclasses.dataclass` — all Python classes
- Every object-oriented language: TypeScript `class`, Java `class`, C# `class` use this exact mental model

**Watch for:** Forgetting `self` as the first parameter of every method.
`def complete():` instead of `def complete(self):` → `TypeError: complete() takes 0 positional arguments but 1 was given`.

---

## Step 1 — One Task, Runnable Immediately

Create the file `src/domain/task.py`. Start with the absolute minimum — just the constructor and one attribute:

```python
# src/domain/task.py

class Task:
    def __init__(self, title: str) -> None:
        self.title = title   # ← instance attribute: belongs to this specific task
```

That is the entire file for now.

Open a Python interactive session in the `task-api` directory:

```bash
python
```

```python
>>> from src.domain.task import Task
>>> t = Task('Write tests')
>>> t.title
'Write tests'
>>> t2 = Task('Deploy')
>>> t2.title
'Deploy'
>>> t.title == t2.title   # independent objects
False
```

### SAVE AND TRY

```bash
python -c "from src.domain.task import Task; t = Task('Write tests'); print(t.title)"
```

**You should see:**
```
Write tests
```

**Change something:** Create two tasks with the same title. Do they affect each other?

```bash
python -c "
from src.domain.task import Task
a = Task('Same title')
b = Task('Same title')
b.title = 'Changed'
print(a.title)   # should still be 'Same title'
"
```

**Expected:** `Same title` — changing `b` did not affect `a`. Each instance is independent.

Change it back: leave `task.py` as written above.

---

### Concept: Instance Attributes vs Class Attributes

**What it is:** An instance attribute is set on `self` — it belongs to one specific
object. A class attribute is defined directly in the class body — all instances share it.

**The problem before (the trap):**

```python
class Task:
    # WRONG — this is a class attribute, not an instance attribute:
    title = 'default'

a = Task()
b = Task()
Task.title = 'changed'   # changes it for EVERY instance
print(a.title)  # → 'changed'
print(b.title)  # → 'changed' — both changed!
```

**The solution:** Always set instance data on `self` inside `__init__`:

```python
class Task:
    def __init__(self, title: str) -> None:
        self.title = title  # instance attribute — belongs to self only
```

**What it hides:** The distinction between per-object data (`self.x`) and
shared data (`Class.x`). Once you always use `self.attribute = value` for data
that differs between instances, you never hit the shared-data trap.

**Canonical example:** A class attribute is like a factory setting. Every car
from a factory starts with `wheels = 4` (class attribute). But the `owner` name
is different on each car (instance attribute — set per object).

```python
class Car:
    wheels = 4   # class attribute — all Cars have 4 wheels (shared)

    def __init__(self, owner: str) -> None:
        self.owner = owner   # instance attribute — different per car

car1 = Car('Alice')
car2 = Car('Bob')
print(car1.wheels)   # → 4 (from class)
print(car2.wheels)   # → 4 (same shared value)
car1.wheels = 3      # creates an INSTANCE attribute on car1, shadows the class attribute
print(car1.wheels)   # → 3 (instance attribute)
print(car2.wheels)   # → 4 (class attribute unchanged)
print(Car.wheels)    # → 4 (class attribute unchanged)
```

**Project application:** The `default_priority` on `Task` will be a class attribute —
every task uses `'medium'` unless you say otherwise.

**Smallest possible example:**

```python
class Counter:
    total = 0  # class attribute — shared

    def __init__(self, name: str) -> None:
        self.name = name  # instance attribute — unique per counter
```

**Why it matters here:** The next step adds `done = False` and `priority`. These must be
instance attributes so each task has its own independent state.

**You will see this again in:**
- SQLAlchemy: `__tablename__ = 'tasks'` is a class attribute; `id`, `title` are instance attributes
- `dataclasses.dataclass`: all fields in the class body become instance attributes automatically
- Class-level constants (tax rates, max retries, default ports) are class attributes in every codebase

**Watch for:** Using a mutable class attribute (list, dict) as if it were per-instance.
`class Task: tags = []` — ALL tasks share ONE list. Appending to one task's tags appends to all.

---

## Step 2 — Add More Attributes and a Method

Update `task.py` to add `priority`, `done`, and a `complete()` method. Add ONE thing at a time:

```python
# src/domain/task.py

class Task:
    def __init__(self, title: str, priority: str = 'medium') -> None:
        self.title    = title.strip()     # ← strip whitespace — enforced here, nowhere else
        self.priority = priority          # ← 'low', 'medium', or 'high'
        self.done     = False             # ← all tasks start not done
```

### SAVE AND TRY

```bash
python -c "
from src.domain.task import Task
t = Task('  Write tests  ', priority='high')
print(t.title)      # should be 'Write tests' (stripped)
print(t.priority)   # should be 'high'
print(t.done)       # should be False
"
```

**You should see:**
```
Write tests
high
False
```

**Change something:** Create a task with `priority='high'` and one with the default.

```bash
python -c "
from src.domain.task import Task
t1 = Task('Task A', priority='high')
t2 = Task('Task B')            # uses default
print(t1.priority, t2.priority)
"
```

**Expected:** `high medium`

Now add the `complete()` method. Add it to the class body, below `__init__`:

```python
# src/domain/task.py

class Task:
    def __init__(self, title: str, priority: str = 'medium') -> None:
        self.title    = title.strip()
        self.priority = priority
        self.done     = False

    def complete(self) -> None:    # ← add this method
        self.done = True           # ← mutates this specific task's done flag
```

### SAVE AND TRY

```bash
python -c "
from src.domain.task import Task
t = Task('Write tests')
print('before:', t.done)
t.complete()
print('after:', t.done)
"
```

**You should see:**
```
before: False
after: True
```

**Change something:** Call `complete()` on one task. Does it affect another task?

```bash
python -c "
from src.domain.task import Task
a = Task('Task A')
b = Task('Task B')
a.complete()
print(a.done, b.done)   # should be: True False
"
```

**Expected:** `True False` — `complete()` only affects the task it was called on.

---

### Concept: Inheritance — Reusing Behaviour

**What it is:** A subclass inherits all methods and attributes of its parent class.
It adds or replaces behaviour without rewriting what already exists.

**The problem before:**

```python
# Without inheritance — copy-pasting everything:
class Task:
    def __init__(self, title, priority='medium'):
        self.title    = title.strip()
        self.priority = priority
        self.done     = False

    def complete(self):
        self.done = True

class RecurringTask:   # complete duplicate of Task — any fix requires two edits:
    def __init__(self, title, priority='medium', interval_days=7):
        self.title         = title.strip()   # duplicated
        self.priority      = priority        # duplicated
        self.done          = False           # duplicated
        self.interval_days = interval_days

    def complete(self):   # duplicated
        self.done = True
```

A bug fix in `Task.complete()` must be applied in two places. At 50 classes, this is unmaintainable.

**The solution:** `class RecurringTask(Task):` — the subclass inherits everything from `Task`.
Only the new or different behaviour needs to be written.

**What it hides:** Duplication. Once you inherit, every change to the parent
automatically applies to all subclasses. The invariant it protects: "the complete
logic is defined in one place and cannot diverge between Task types."

**Canonical example:** A vehicle manufacturer makes a base `Vehicle` with `start_engine()`,
`accelerate()`, `brake()`. A `Car(Vehicle)` inherits all of those and adds `open_sunroof()`.
The car does not reimplement `brake()` — it gets it for free.

```python
class Animal:
    def __init__(self, name: str) -> None:
        self.name = name

    def speak(self) -> str:
        return '...'   # generic fallback

class Dog(Animal):      # Dog inherits Animal's __init__ and speak()
    def speak(self) -> str:
        return 'Woof!'  # overrides — replaces the parent version

d = Dog('Rex')
print(d.name)    # → 'Rex' (inherited __init__ set this)
print(d.speak()) # → 'Woof!' (Dog's version)
```

**Project application:** `RecurringTask` extends `Task` with an `interval_days` attribute
and a `next_due()` method. It inherits `complete()`, `title`, `priority`, and `done` for free.

**Smallest possible example:**

```python
class Vehicle:
    def __init__(self, speed: int) -> None:
        self.speed = speed

    def describe(self) -> str:
        return f'Vehicle going {self.speed}mph'

class Car(Vehicle):
    def describe(self) -> str:
        return f'Car going {self.speed}mph'  # speed is inherited

c = Car(60)
print(c.speed)     # → 60 (from Vehicle.__init__)
print(c.describe()) # → 'Car going 60mph' (Car's version)
```

**Why it matters here:** `RecurringTask` is still a `Task` — it can be added to a task
list, completed, and stored the same way. But it has extra behaviour.

**You will see this again in:**
- SQLAlchemy: `class Task(Base)` — inheriting from `Base` gives `Task` all the ORM machinery
- Pydantic: `class CreateTaskRequest(BaseModel)` — inheriting validation, serialisation
- FastAPI exceptions: `class TaskNotFoundError(HTTPException)`
- Every framework you will use inherits base classes to get built-in behaviour

**Watch for:** Forgetting to call `super().__init__()` when you write your own `__init__`
in the subclass. Without it, the parent's setup never runs — all parent attributes are missing.

---

### Concept: `super().__init__()` — Calling the Parent's Setup

**What it is:** `super()` returns the parent class. `super().__init__(...)` runs
the parent's constructor before (or instead of) writing the subclass's own setup.

**The problem before:**

```python
class RecurringTask(Task):
    def __init__(self, title: str, priority: str, interval_days: int) -> None:
        # WRONG — parent's __init__ is NEVER called:
        self.interval_days = interval_days
        # self.title is never set! self.done is never set! self.priority is never set!

r = RecurringTask('Weekly review', 'medium', 7)
print(r.title)   # → AttributeError: 'RecurringTask' object has no attribute 'title'
```

**The solution:** Call `super().__init__()` first:

```python
class RecurringTask(Task):
    def __init__(self, title: str, priority: str, interval_days: int) -> None:
        super().__init__(title, priority)  # ← runs Task.__init__ — sets title, priority, done
        self.interval_days = interval_days  # ← then adds the new attribute
```

**What it hides:** The ordering rule: parent setup runs first, child setup runs second.
Without `super()`, the parent's invariants are never established.

**Canonical example:** A part-time employee form inherits from the employee form. The
employee form sets `name`, `id`, and `start_date`. The part-time form adds `hours_per_week`.
Filling out the part-time form MUST fill in all the base employee fields first — you call
`super().__init__()` to do that automatically.

**Project application:** `RecurringTask.__init__` must set `title`, `priority`, and `done`
(from `Task`) AND `interval_days` (unique to `RecurringTask`). `super().__init__(title, priority)`
handles the first three.

**Smallest possible example:**

```python
class Base:
    def __init__(self, x: int) -> None:
        self.x = x

class Child(Base):
    def __init__(self, x: int, y: int) -> None:
        super().__init__(x)  # sets self.x
        self.y = y            # then adds self.y

c = Child(1, 2)
print(c.x, c.y)  # → 1 2
```

**Why it matters here:** `RecurringTask` needs everything `Task` provides, plus `interval_days`.
`super().__init__()` ensures the task is fully initialised before we add the extra field.

**You will see this again in:**
- Every time you extend `BaseModel` in Pydantic and add custom validators
- Every time you extend `Base` in SQLAlchemy and add relationships
- Every class hierarchy in Python, Java, TypeScript — `super()` is universal

**Watch for:** `super().__init__()` with wrong argument count. If `Task.__init__` takes
`(title, priority)`, you must pass both: `super().__init__(title, priority)`. Missing `priority`
→ `TypeError: Task.__init__() missing 1 required positional argument`.

---

## Step 3 — Add `RecurringTask`

Add `RecurringTask` to `task.py` below the `Task` class. Build it incrementally.

First, add just the constructor with `super()`:

```python
# src/domain/task.py
# (existing Task class above — do not change it)

from datetime import date, timedelta   # ← add this import at the top of the file

class RecurringTask(Task):                              # ← add this class
    def __init__(
        self,
        title:         str,
        priority:      str = 'medium',
        interval_days: int = 7,
    ) -> None:
        super().__init__(title, priority)              # ← call Task's __init__ first
        self.interval_days = interval_days            # ← then add the new attribute
```

### SAVE AND TRY

```bash
python -c "
from src.domain.task import Task, RecurringTask
r = RecurringTask('Weekly review', priority='low', interval_days=7)
print(r.title)         # inherited from Task
print(r.priority)      # inherited from Task
print(r.done)          # inherited from Task
print(r.interval_days) # new attribute
"
```

**You should see:**
```
Weekly review
low
False
7
```

**Change something:** Try removing the `super().__init__(title, priority)` line temporarily.

```bash
python -c "
from src.domain.task import RecurringTask
r = RecurringTask('Weekly review')
print(r.title)
"
```

**Expected:** `AttributeError: 'RecurringTask' object has no attribute 'title'` — this is the
error you get when `super().__init__()` is missing. Now put it back.

Now add `next_due()` and override `describe()`:

```python
class RecurringTask(Task):
    def __init__(self, title, priority='medium', interval_days=7):
        super().__init__(title, priority)
        self.interval_days = interval_days

    def next_due(self) -> date:                        # ← add this method
        return date.today() + timedelta(days=self.interval_days)

    def describe(self) -> str:                         # ← add this method
        return f'{self.title} [{self.priority}] — repeats every {self.interval_days} days'
```

### SAVE AND TRY

```bash
python -c "
from src.domain.task import RecurringTask
r = RecurringTask('Weekly review', interval_days=7)
print(r.describe())
print(r.next_due())   # today's date + 7 days
"
```

**You should see:**
```
Weekly review [medium] — repeats every 7 days
2026-05-28   (the actual date will be 7 days from today)
```

---

### Concept: `isinstance()` — Checking What Kind of Object You Have

**What it is:** `isinstance(obj, ClassName)` returns `True` if `obj` is an instance
of `ClassName` OR any of its subclasses.

**The problem before:**

```python
# Without isinstance — manual type checking:
def process_task(task):
    if type(task).__name__ == 'RecurringTask':   # fragile string comparison
        print('recurring')
    elif type(task).__name__ == 'Task':
        print('regular')
```

Using `type(obj).__name__` breaks when you rename a class. It also fails when
a subclass's name is checked: `type(recurring_task).__name__` returns `'RecurringTask'`,
not `'Task'` — so you cannot check "is this any kind of Task?"

**The solution:** `isinstance` checks the full inheritance chain:

```python
t = Task('Write tests')
r = RecurringTask('Weekly review', interval_days=7)

isinstance(t, Task)           # True
isinstance(r, Task)           # True — RecurringTask IS-A Task
isinstance(r, RecurringTask)  # True
isinstance(t, RecurringTask)  # False — Task is NOT a RecurringTask
```

**What it hides:** The inheritance chain lookup. You do not need to know the full
hierarchy — `isinstance` traverses it for you.

**Canonical example:** Asking "Is this vehicle a car?" covers all kinds of cars
(sedan, SUV, convertible). `isinstance(vehicle, Car)` returns True for any `Car`
subclass, not just the exact `Car` class.

**Project application:** When processing a list of mixed `Task` and `RecurringTask`
objects, `isinstance(task, RecurringTask)` tells you which ones need the extra
`next_due()` handling.

**Smallest possible example:**

```python
class Animal: pass
class Dog(Animal): pass

d = Dog()
isinstance(d, Dog)     # True
isinstance(d, Animal)  # True — Dog IS-A Animal
```

**Why it matters here:** A task list can contain both `Task` and `RecurringTask` objects.
`isinstance` lets you handle them polymorphically.

**You will see this again in:**
- FastAPI: internally uses `isinstance` to check if a response is a `Response` object
- Python's `json` module: checks `isinstance(obj, dict)` to decide how to serialise
- Test assertions: `assert isinstance(result, Task)` to verify return types
- Every Python codebase that uses inheritance

**Watch for:** `isinstance` with a string: `isinstance(obj, 'Task')` → `TypeError`.
Always pass the class itself, not its name as a string.

---

## Step 4 — Write the Tests

Create `tests/test_task.py`:

```python
# tests/test_task.py
from datetime import date, timedelta
import pytest
from src.domain.task import Task, RecurringTask


class TestTask:

    def test_creates_task_with_title_and_default_priority(self) -> None:
        task = Task('Write tests')
        assert task.title    == 'Write tests'
        assert task.priority == 'medium'      # default
        assert task.done     is False

    def test_strips_leading_and_trailing_whitespace_from_title(self) -> None:
        task = Task('  Write tests  ')
        assert task.title == 'Write tests'    # stripped in __init__

    def test_complete_sets_done_to_true(self) -> None:
        task = Task('Write tests')
        task.complete()
        assert task.done is True

    def test_completing_one_task_does_not_affect_another(self) -> None:
        task_a = Task('Task A')
        task_b = Task('Task B')
        task_a.complete()
        assert task_b.done is False   # task_b is independent


class TestRecurringTask:

    def test_recurring_task_is_an_instance_of_task(self) -> None:
        r = RecurringTask('Weekly review', interval_days=7)
        assert isinstance(r, Task)    # subclass IS-A parent

    def test_inherits_complete_from_task(self) -> None:
        r = RecurringTask('Weekly review', interval_days=7)
        r.complete()
        assert r.done is True         # complete() is inherited — not redefined

    def test_describe_includes_title_and_interval(self) -> None:
        r = RecurringTask('Weekly review', interval_days=7)
        assert 'Weekly review' in r.describe()
        assert '7'             in r.describe()

    def test_next_due_returns_a_future_date(self) -> None:
        r = RecurringTask('Weekly review', interval_days=7)
        assert r.next_due() > date.today()
        assert r.next_due() == date.today() + timedelta(days=7)
```

### SAVE AND TRY

```bash
pytest tests/test_task.py -v
```

**You should see:**
```
tests/test_task.py::TestTask::test_creates_task_with_title_and_default_priority PASSED
tests/test_task.py::TestTask::test_strips_leading_and_trailing_whitespace_from_title PASSED
tests/test_task.py::TestTask::test_complete_sets_done_to_true PASSED
tests/test_task.py::TestTask::test_completing_one_task_does_not_affect_another PASSED
tests/test_task.py::TestRecurringTask::test_recurring_task_is_an_instance_of_task PASSED
tests/test_task.py::TestRecurringTask::test_inherits_complete_from_task PASSED
tests/test_task.py::TestRecurringTask::test_describe_includes_title_and_interval PASSED
tests/test_task.py::TestRecurringTask::test_next_due_returns_a_future_date PASSED

8 passed
```

**Change something:** In `task.py`, remove the `.strip()` from `self.title = title.strip()`.
Rerun the tests. Expected: `test_strips_leading_and_trailing_whitespace_from_title` fails.
Put `.strip()` back.

---

## 🎯 Challenge: Add `UrgentTask`

**You know:** Inheritance, `super().__init__()`, method override, `isinstance`.

**Task:** Create `UrgentTask(Task)` in `task.py` with these rules:
- Priority is always `'high'` — the caller cannot change it
- Has a required `deadline: date` attribute
- `is_overdue()` returns `True` when `date.today() >= self.deadline`
  (today counts as overdue — it must be done before today, not on today)
- `describe()` returns `'URGENT: [title] [high]'`

Write these four tests first (they should all fail). Then implement.

```python
from datetime import date, timedelta
from src.domain.task import UrgentTask

def test_priority_is_always_high():
    t = UrgentTask('Fix critical bug', deadline=date.today())
    assert t.priority == 'high'

def test_is_overdue_when_deadline_is_today():
    t = UrgentTask('Fix critical bug', deadline=date.today())
    assert t.is_overdue() is True

def test_is_not_overdue_when_deadline_is_tomorrow():
    t = UrgentTask('Fix', deadline=date.today() + timedelta(days=1))
    assert t.is_overdue() is False

def test_describe_has_urgent_prefix():
    t = UrgentTask('Fix', deadline=date.today())
    assert t.describe().startswith('URGENT:')
```

Try for at least 10 minutes before revealing the solution.

---

<details>
<summary>▶ Show Solution</summary>

Add to `task.py`, below `RecurringTask`:

```python
class UrgentTask(Task):
    def __init__(self, title: str, deadline: date) -> None:
        super().__init__(title, priority='high')  # ← hardcode 'high' — caller cannot override
        self.deadline = deadline

    def is_overdue(self) -> bool:
        return date.today() >= self.deadline   # >= means today counts as overdue

    def describe(self) -> str:
        base = super().describe()              # ← calls Task.describe() for the base text
        return f'URGENT: {base}'
```

**Key insight:** Hardcoding `priority='high'` in the `super().__init__()` call means
the subclass controls the value — the constructor signature does not even accept `priority`
as a parameter, so the caller cannot accidentally override it. Calling `super().describe()`
reuses the parent's format without duplicating it.

</details>

---

## Final Check

| What to verify | How to verify | Expected result |
|---|---|---|
| `Task` stores title and priority | `t.title`, `t.priority` | Match what was passed |
| Title is stripped | `Task('  test  ').title` | `'test'` (no spaces) |
| `complete()` sets done | `t.complete(); t.done` | `True` |
| Instance isolation | Complete A, check B | B.done is still `False` |
| Inheritance: `isinstance` | `isinstance(RecurringTask(...), Task)` | `True` |
| `super().__init__` required | Remove it, run tests | `AttributeError` on `title` |
| `describe()` override | `RecurringTask(...).describe()` | Contains interval |
| All tests pass | `pytest tests/test_task.py -v` | 8 passed |

---

## Quick Check Answers

**1. Tasks as plain dicts — what problem with `complete()`?**

You write a standalone function `complete_task(task_dict)` that sets `task_dict['done'] = True`.
But nothing enforces that callers use it — any code can do `task['done'] = 'oops'` directly,
or `task['done'] = None`, or simply forget to call the function. The operation is separated
from the data it operates on. A `class` fixes this by putting `complete()` on the object
itself: you call `task.complete()` and the implementation is right there, unavoidable.

**2. `class Counter: count = 0`. Counter A increments. Does Counter B's `count` change?**

It depends on HOW Counter A increments. If it does `Counter.count += 1` (modifying
the class attribute directly), then yes — Counter B sees the change, because the class
attribute is shared. If it does `self.count += 1`, Python creates a NEW instance attribute
named `count` on Counter A only (shadowing the class attribute). Counter B's `count`
remains 0 (the class attribute). This is the trap from the concept block above.

**3. `RecurringTask.__init__` without `super().__init__()` — what breaks?**

`self.title`, `self.priority`, and `self.done` are never set, because those lines only
exist in `Task.__init__`. Any access to `recurring_task.title` raises
`AttributeError: 'RecurringTask' object has no attribute 'title'`. All tests that touch
inherited attributes fail immediately. `super().__init__()` is not optional — it is
how you run the parent's setup code from the child.
