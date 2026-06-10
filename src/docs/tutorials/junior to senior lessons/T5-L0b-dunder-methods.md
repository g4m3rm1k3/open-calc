# Junior to Senior — T5·L0b — Dunder Methods

**Prerequisites:** T5·L0a (Classes and OOP). You can write Python classes with
inheritance. You know what `self` is and what `__init__` does. This lesson covers
dunder ("double underscore") methods — the protocol that makes your objects
behave like built-in Python types.

**What this lab adds:**
- `__repr__` and `__str__`: what appears when you print or inspect an object
- `__eq__` and `__hash__`: making `==` work and enabling use in sets and dicts
- `__len__` and `__contains__`: `len(obj)` and `item in obj`
- `__iter__`: making an object usable in `for` loops and comprehensions
- `@functools.total_ordering`: getting all comparison operators from two

**Time:** 60–90 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. `print(task)` shows `<src.domain.task.Task object at 0x7f...>`. How do you
>    change what it shows without changing any call sites?
> 2. `task_a = Task('Write tests')` and `task_b = Task('Write tests')` — is
>    `task_a == task_b` True by default? Should it be?
> 3. You add `__eq__` to `Task`. Python sets `__hash__` to `None` automatically.
>    What breaks, and why?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

A `TaskList` collection class that behaves like a built-in Python type:

```python
>>> tasks = TaskList()
>>> tasks.add(Task('Write tests'))
>>> tasks.add(Task('Deploy'))
>>> len(tasks)
2
>>> Task('Write tests') in tasks   # uses __contains__
True
>>> for t in tasks:                # uses __iter__
...     print(t)
Task(○ 'Write tests' [medium])
Task(○ 'Deploy' [medium])
>>> bool(TaskList())               # uses __len__
False
>>> bool(tasks)
True
```

---

### Concept: What a "Dunder" Is

**What it is:** A dunder (short for "double underscore") is a method whose name
starts and ends with two underscores: `__repr__`, `__str__`, `__eq__`, `__len__`.
Python calls these methods automatically when you use built-in operators and
functions on your object.

**The problem before:**

```python
task = Task('Write tests')
print(task)
# → <src.domain.task.Task object at 0x7fc3b2>
# That address is useless. You cannot tell what this task is.

tasks = [Task('A'), Task('B')]
print(tasks)
# → [<...Task object at 0x...>, <...Task object at 0x...>]
# Same problem — completely unreadable.
```

**The solution:** Define dunder methods so Python knows how to represent,
compare, and iterate your objects.

**What it hides:** The protocol lookup. When Python executes `print(task)`,
it calls `task.__str__()`. When it executes `len(tasks)`, it calls `tasks.__len__()`.
You do not call these methods directly — Python calls them for you based on the
operation. This means: implement the right dunder, and standard Python syntax
works with your class.

**Canonical example:** Think of dunders as "electrical sockets." Built-in Python
operations (print, len, in, ==, for) are appliances. The dunder methods are the
plugs. If your class has the right plug (`__str__`), the appliance (`print`) works.

**You will see this again in:**
- Every Python library you use defines these: `datetime.__repr__`, `list.__len__`, `dict.__contains__`
- Pydantic's `BaseModel` defines `__repr__`, `__eq__`, and more automatically
- SQLAlchemy model instances use `__repr__` for debugging in the REPL
- Standard Python interview question: "What is `__str__` vs `__repr__`?"

**Watch for:** The naming. `__repr__` has two underscores on each side, not one.
`_repr_` (one underscore each side) is just a regular private method — Python will
not call it automatically.

---

### Concept: `__repr__` and `__str__`

**What it is:**
- `__repr__` returns a developer-readable string. Python calls it in the REPL,
  in `repr(obj)`, and when printing collections (like lists of tasks).
- `__str__` returns a human-readable string. Python calls it via `print(obj)` and `str(obj)`.
  If `__str__` is not defined, Python falls back to `__repr__`.

**The problem before:**

```python
task = Task('Write tests', priority='high')
print(task)           # → <src.domain.task.Task object at 0x7fc3b2>  ← useless
repr(task)            # → <src.domain.task.Task object at 0x7fc3b2>  ← useless
[task]                # → [<src.domain.task.Task object at 0x7fc3b2>] ← useless in debugger
```

**The solution:**

```python
def __repr__(self) -> str:
    status = '✓' if self.done else '○'
    return f"Task({status} {self.title!r} [{self.priority}])"
    # !r applies repr() to self.title — adds quotes around the string value
```

**Canonical example:**
- `__repr__` is for developers: `Task(○ 'Write tests' [medium])` — unambiguous, copyable
- `__str__` is for users: `○ Write tests` — cleaner display

```python
import datetime
dt = datetime.date(2024, 1, 15)
repr(dt)  # → "datetime.date(2024, 1, 15)"  ← shows constructor args
str(dt)   # → "2024-01-15"                  ← clean human format
```

**Project application:** In the task API, `__repr__` makes tasks readable in
pytest output when a test fails, and in the Python REPL during development.

**Smallest possible example:**

```python
class Temperature:
    def __init__(self, celsius: float) -> None:
        self.celsius = celsius

    def __repr__(self) -> str:
        return f'Temperature({self.celsius}°C)'

    def __str__(self) -> str:
        return f'{self.celsius}°C'

t = Temperature(100)
repr(t)   # → 'Temperature(100°C)'
str(t)    # → '100°C'
print(t)  # → 100°C   (calls __str__)
```

**Why it matters here:** `TaskList` printing tasks in a loop must show useful output.
`__repr__` on `Task` makes every print call informative.

**You will see this again in:**
- Python's `logging` module calls `repr()` on objects it logs
- pytest failure messages show `repr()` of expected vs actual values
- The Python REPL (and Jupyter notebooks) call `__repr__` after every expression

**Watch for:** `!r` in f-strings. `f"{self.title!r}"` applies `repr()` to the value —
for a string this adds quotes. Without `!r`: `Task(Write tests [high])` — looks like
`Write tests` might be code. With `!r`: `Task('Write tests' [high])` — clearly a string.

---

## Step 1 — Add `__repr__` to `Task`

Open `src/domain/task.py`. Add `__repr__` below the existing methods:

```python
class Task:
    def __init__(self, title: str, priority: str = 'medium') -> None:
        self.title    = title.strip()
        self.priority = priority
        self.done     = False

    def complete(self) -> None:
        self.done = True

    def __repr__(self) -> str:                              # ← add this
        status = '✓' if self.done else '○'                 # ✓ for done, ○ for not done
        return f"Task({status} {self.title!r} [{self.priority}])"
```

### SAVE AND TRY

```bash
python -c "
from src.domain.task import Task
t = Task('Write tests', priority='high')
print(repr(t))
print(t)          # also calls __repr__ since no __str__ defined
t.complete()
print(t)          # should now show ✓
"
```

**You should see:**
```
Task(○ 'Write tests' [high])
Task(○ 'Write tests' [high])
Task(✓ 'Write tests' [high])
```

**Change something:** Create a list of tasks and print it:

```bash
python -c "
from src.domain.task import Task
tasks = [Task('A'), Task('B', priority='high')]
print(tasks)
"
```

**Expected:** `[Task(○ 'A' [medium]), Task(○ 'B' [high])]` — readable even inside a list.

---

### Concept: `__eq__` and `__hash__`

**What it is:**
- `__eq__` defines what `==` means for your objects.
- `__hash__` defines the hash value used when objects appear in a `set` or as `dict` keys.

**The problem before:**

```python
a = Task('Write tests')
b = Task('Write tests')

a == b   # → False (default: compares object identity, not content)
         # Two tasks with the same title are NOT equal by default.
         # This breaks set deduplication and dict lookups.
```

**The Python rule:** If you define `__eq__`, Python automatically sets `__hash__ = None`
(making the object unhashable). This is because equality and hash must be consistent:
if `a == b`, then `hash(a)` must equal `hash(b)`. Since you changed what equality
means, Python refuses to guess at a hash — you must define both.

**The solution:** Define both:

```python
def __eq__(self, other: object) -> bool:
    if not isinstance(other, Task):
        return NotImplemented   # let Python handle comparison with non-Task types
    return self.title == other.title and self.priority == other.priority

def __hash__(self) -> int:
    return hash((self.title, self.priority))   # hash based on the same fields as __eq__
```

**What it hides:** The hash table implementation inside `set` and `dict`.
When Python checks `task in my_set`, it computes `hash(task)`, jumps to that bucket,
and uses `__eq__` to confirm the match. This is O(1). Without a proper `__hash__`,
sets and dicts refuse to store your object.

**Canonical example:** Two passport photos of the same person. The passport office
uses photo (hash) to quickly find the right drawer, then checks the face (`__eq__`)
for exact confirmation.

```python
class Passport:
    def __init__(self, name: str, number: str) -> None:
        self.name   = name
        self.number = number

    def __eq__(self, other: object) -> bool:
        if not isinstance(other, Passport):
            return NotImplemented
        return self.number == other.number   # same passport number = same person

    def __hash__(self) -> int:
        return hash(self.number)   # hash based on the same field as __eq__

p1 = Passport('Alice', 'P-001')
p2 = Passport('Alice', 'P-001')
p1 == p2                  # → True
{p1, p2}                  # → {Passport} — deduplicated (set works!)
{p1: 'valid'}[p2]         # → 'valid' (dict lookup works!)
```

**Project application:** When a `Task` is stored in a `set` (e.g., "already processed
tasks"), `__eq__` and `__hash__` ensure that two tasks with the same title and priority
are treated as the same task, preventing duplicates.

**Smallest possible example:**

```python
class Tag:
    def __init__(self, name: str) -> None:
        self.name = name

    def __eq__(self, other: object) -> bool:
        if not isinstance(other, Tag):
            return NotImplemented
        return self.name == other.name

    def __hash__(self) -> int:
        return hash(self.name)

{Tag('python'), Tag('python')}   # → {Tag} — one entry
```

**Why it matters here:** `TaskList.__contains__` (the `in` operator) will rely on
`__eq__` to find matching tasks. Without it, `task in tasks` compares memory addresses,
not task content.

**You will see this again in:**
- Pydantic models: `BaseModel` defines `__eq__` to compare field values
- SQLAlchemy: mapped objects define `__eq__` based on primary key
- Python `dataclasses.dataclass`: auto-generates `__eq__` (and `__hash__` when `frozen=True`)
- Standard interview topic: "When do you need `__hash__`?"

**Watch for:** Returning `False` instead of `NotImplemented` when the types don't match.
`return False` means "they're not equal" — fair. `return NotImplemented` means "I don't know,
Python should ask the other side." The difference matters when comparing with subclasses
or custom comparison types.

---

## Step 2 — Add `__eq__` and `__hash__` to `Task`

Add below `__repr__` in `task.py`:

```python
    def __repr__(self) -> str:
        status = '✓' if self.done else '○'
        return f"Task({status} {self.title!r} [{self.priority}])"

    def __eq__(self, other: object) -> bool:               # ← add this
        if not isinstance(other, Task):
            return NotImplemented
        return self.title == other.title and self.priority == other.priority

    def __hash__(self) -> int:                             # ← add this
        return hash((self.title, self.priority))           # tuple hash based on same fields as __eq__
```

### SAVE AND TRY

```bash
python -c "
from src.domain.task import Task
a = Task('Write tests')
b = Task('Write tests')
c = Task('Deploy')
print(a == b)    # True — same title and priority
print(a == c)    # False — different title
print({a, b})    # {Task(○ 'Write tests' [medium])} — deduplicated
"
```

**You should see:**
```
True
False
{Task(○ 'Write tests' [medium])}
```

**Change something:** Remove `__hash__` temporarily. Try creating a set:

```bash
python -c "
from src.domain.task import Task
# after removing __hash__:
t = Task('Write tests')
{t}
"
```

**Expected:** `TypeError: unhashable type: 'Task'`. Put `__hash__` back.

---

### Concept: `__len__` and `__contains__`

**What it is:**
- `__len__` enables `len(obj)`. It also controls `bool(obj)` — an object with
  `__len__` returning 0 is `False`; anything else is `True`.
- `__contains__` enables `item in obj`.

**The problem before:**

```python
class TaskList:
    def __init__(self):
        self._tasks = []

    def add(self, task):
        self._tasks.append(task)

tasks = TaskList()
tasks.add(Task('A'))

len(tasks)          # → TypeError: object of type 'TaskList' has no len()
if tasks:           # → TypeError: cannot determine truth value
Task('A') in tasks  # → TypeError: argument of type 'TaskList' is not iterable
```

**The solution:** Add `__len__` and `__contains__`:

```python
def __len__(self) -> int:
    return len(self._tasks)

def __contains__(self, item: object) -> bool:
    return item in self._tasks
```

**What it hides:** The protocol checks Python performs. When Python evaluates
`if tasks_list:`, it first checks for `__bool__`. If missing, it checks `__len__`.
If `__len__` returns 0, the object is falsy. This lets empty collections behave
as `False` and non-empty collections as `True` without any extra code.

**Canonical example:** A bag with items. `len(bag)` asks "how many?" `'key' in bag` asks
"is this in there?" Both are natural English operations. Your class gains them by defining
two short methods.

**Project application:** `if task_list:` before iterating prevents trying to process
an empty list. `task in task_list` enables membership checks without exposing `_tasks`.

**Smallest possible example:**

```python
class Bag:
    def __init__(self):
        self._items = []

    def add(self, item):
        self._items.append(item)

    def __len__(self) -> int:
        return len(self._items)

    def __contains__(self, item: object) -> bool:
        return item in self._items

b = Bag()
len(b)         # → 0
bool(b)        # → False (len returns 0)
b.add('key')
bool(b)        # → True
'key' in b     # → True
```

**Why it matters here:** `TaskList` needs these to work with `if task_list:` checks
and `task in task_list` membership tests in the API layer.

**You will see this again in:**
- Every Python container: `list`, `dict`, `set`, `str` all implement `__len__` and `__contains__`
- Django QuerySets: `__len__` triggers a DB query; avoid it in templates
- pandas DataFrames: `len(df)` returns row count via `__len__`
- Any custom collection class in every Python project

**Watch for:** `__len__` must return a non-negative integer. Returning a float or a
negative number → `TypeError: __len__ returned non-int` or `ValueError: __len__ returned negative`.

---

### Concept: `__iter__` — Making Objects Iterable

**What it is:** `__iter__` makes your object usable in `for` loops, list
comprehensions, `sum()`, `any()`, `all()`, and any function that consumes sequences.
It must return an iterator — an object with a `__next__` method.

**The problem before:**

```python
tasks = TaskList()
tasks.add(Task('A'))
tasks.add(Task('B'))

for task in tasks:    # → TypeError: 'TaskList' object is not iterable
    print(task)
```

**The solution:** Delegate to the internal list's iterator:

```python
def __iter__(self):
    return iter(self._tasks)   # iter() returns the list's own iterator
```

**What it hides:** The iterator protocol. Python's `for` loop desugars to:
`_iter = iter(tasks); while True: item = next(_iter); ...`. Defining `__iter__`
means `iter(tasks)` works, which means the `for` loop works.

**Canonical example:** A book has pages. Telling Python "you can iterate a book"
means Python can turn pages one at a time in a `for` loop.

```python
class Book:
    def __init__(self, pages):
        self._pages = pages

    def __iter__(self):
        return iter(self._pages)   # delegate to list iterator

for page in Book(['page 1', 'page 2', 'page 3']):
    print(page)
# → page 1
# → page 2
# → page 3
```

**Project application:** `TaskList.__iter__` enables `for task in task_list:`,
`[t.title for t in task_list]` comprehensions, and `any(t.done for t in task_list)` checks.

**Smallest possible example:**

```python
class NumberRange:
    def __init__(self, start, end):
        self._start = start
        self._end   = end

    def __iter__(self):
        return iter(range(self._start, self._end))

for n in NumberRange(1, 4):
    print(n)   # → 1, 2, 3
```

**Why it matters here:** All task processing in the API layer uses iteration.
`for task in task_list:` must work.

**You will see this again in:**
- Every Python container you create
- Generator functions: `def __iter__(self): yield from self._items` (yields lazily)
- Django QuerySets implement `__iter__` to execute the SQL query on demand
- `itertools.chain(a, b)` works on any iterable — your class included

**Watch for:** Modifying the collection inside a `for` loop using its own iterator.
`for task in task_list: task_list.add(Task('new'))` → RuntimeError (list changed size during iteration).
Iterate a copy: `for task in list(task_list):` if you must modify while iterating.

---

## Step 3 — Build `TaskList`

Create `src/domain/task_list.py`:

```python
# src/domain/task_list.py
from __future__ import annotations
from typing import Iterator
from .task import Task       # . means "from the same package (domain)"


class TaskList:
    """An ordered collection of Task objects with value-based membership testing."""

    def __init__(self) -> None:
        self._tasks: list[Task] = []    # internal storage — private

    def add(self, task: Task) -> None:
        self._tasks.append(task)

    def remove(self, task: Task) -> None:
        self._tasks.remove(task)        # raises ValueError if not present
```

### SAVE AND TRY

```bash
python -c "
from src.domain.task import Task
from src.domain.task_list import TaskList
tl = TaskList()
tl.add(Task('Write tests'))
print(tl._tasks)   # internal — just to verify it worked
"
```

**You should see:** `[Task(○ 'Write tests' [medium])]` — the task is stored.

Now add the dunder methods. Add them one at a time, testing after each:

```python
class TaskList:
    def __init__(self) -> None:
        self._tasks: list[Task] = []

    def add(self, task: Task) -> None:
        self._tasks.append(task)

    def remove(self, task: Task) -> None:
        self._tasks.remove(task)

    def __len__(self) -> int:           # ← add this
        return len(self._tasks)
```

### SAVE AND TRY

```bash
python -c "
from src.domain.task import Task
from src.domain.task_list import TaskList
tl = TaskList()
print(len(tl))     # → 0
print(bool(tl))    # → False (len returns 0)
tl.add(Task('A'))
print(len(tl))     # → 1
print(bool(tl))    # → True
"
```

**You should see:**
```
0
False
1
True
```

Add `__contains__`:

```python
    def __len__(self) -> int:
        return len(self._tasks)

    def __contains__(self, item: object) -> bool:  # ← add this
        return item in self._tasks                  # uses Task.__eq__ we defined earlier
```

### SAVE AND TRY

```bash
python -c "
from src.domain.task import Task
from src.domain.task_list import TaskList
tl = TaskList()
t  = Task('Write tests')
tl.add(t)
print(t in tl)                   # → True (same object)
print(Task('Write tests') in tl) # → True (equal value — uses __eq__)
print(Task('Deploy') in tl)      # → False
"
```

**You should see:**
```
True
True
False
```

Add `__iter__`:

```python
    def __contains__(self, item: object) -> bool:
        return item in self._tasks

    def __iter__(self) -> Iterator[Task]:   # ← add this
        return iter(self._tasks)             # delegate to list's iterator
```

### SAVE AND TRY

```bash
python -c "
from src.domain.task import Task
from src.domain.task_list import TaskList
tl = TaskList()
tl.add(Task('Write tests'))
tl.add(Task('Deploy'))
for t in tl:
    print(t)
"
```

**You should see:**
```
Task(○ 'Write tests' [medium])
Task(○ 'Deploy' [medium])
```

Add `__repr__` and `__eq__`:

```python
    def __iter__(self) -> Iterator[Task]:
        return iter(self._tasks)

    def __repr__(self) -> str:                          # ← add this
        if not self._tasks:
            return 'TaskList(empty)'
        return f'TaskList({len(self._tasks)} tasks: {self._tasks!r})'

    def __eq__(self, other: object) -> bool:            # ← add this
        if not isinstance(other, TaskList):
            return NotImplemented
        return self._tasks == other._tasks
```

---

## Step 4 — Write the Tests

Create `tests/test_task_list.py`:

```python
# tests/test_task_list.py
import pytest
from src.domain.task      import Task, Priority
from src.domain.task_list import TaskList


class TestTaskListProtocol:

    def test_len_of_empty_list_is_zero(self) -> None:
        assert len(TaskList()) == 0

    def test_len_after_adding_tasks(self) -> None:
        tl = TaskList()
        tl.add(Task('A'))
        tl.add(Task('B'))
        assert len(tl) == 2

    def test_empty_list_is_falsy(self) -> None:
        assert not TaskList()

    def test_non_empty_list_is_truthy(self) -> None:
        tl = TaskList()
        tl.add(Task('A'))
        assert tl

    def test_contains_returns_true_for_added_task(self) -> None:
        tl   = TaskList()
        task = Task('Write tests')
        tl.add(task)
        assert task in tl

    def test_contains_uses_eq_not_identity(self) -> None:
        tl = TaskList()
        tl.add(Task('Write tests'))
        # A NEW Task object with the same values:
        assert Task('Write tests') in tl   # different object, same value — uses __eq__

    def test_contains_returns_false_for_absent_task(self) -> None:
        tl = TaskList()
        tl.add(Task('Write tests'))
        assert Task('Deploy') not in tl

    def test_iteration_visits_all_tasks_in_order(self) -> None:
        tl = TaskList()
        tl.add(Task('A'))
        tl.add(Task('B'))
        titles = [t.title for t in tl]
        assert titles == ['A', 'B']

    def test_list_comprehension_works(self) -> None:
        tl = TaskList()
        tl.add(Task('A'))
        tl.add(Task('B', priority='high'))
        high = [t for t in tl if t.priority == 'high']
        assert len(high) == 1


class TestTaskListEquality:

    def test_two_empty_lists_are_equal(self) -> None:
        assert TaskList() == TaskList()

    def test_lists_with_same_tasks_are_equal(self) -> None:
        tl1 = TaskList(); tl1.add(Task('Write tests'))
        tl2 = TaskList(); tl2.add(Task('Write tests'))
        assert tl1 == tl2

    def test_lists_with_different_tasks_are_not_equal(self) -> None:
        tl1 = TaskList(); tl1.add(Task('A'))
        tl2 = TaskList(); tl2.add(Task('B'))
        assert tl1 != tl2
```

### SAVE AND TRY

```bash
pytest tests/test_task_list.py -v
```

**You should see:**
```
tests/test_task_list.py::TestTaskListProtocol::test_len_of_empty_list_is_zero PASSED
tests/test_task_list.py::TestTaskListProtocol::test_len_after_adding_tasks PASSED
...
tests/test_task_list.py::TestTaskListEquality::test_two_empty_lists_are_equal PASSED
...
12 passed
```

**Change something:** Remove `__contains__` from `TaskList` temporarily.
Run the `test_contains_uses_eq_not_identity` test. Expected: it fails — without
`__contains__`, Python falls back to iterating the list, which still works via
`__iter__`. But remove `__iter__` too and it will fail. This shows the fallback
chain Python uses.

---

### Concept: `@functools.total_ordering` — All Comparisons From Two

**What it is:** A decorator in the `functools` module. Define `__eq__` and ONE of
`__lt__`, `__le__`, `__gt__`, `__ge__`, and `total_ordering` generates the
remaining three automatically.

**The problem before:**

```python
class Priority:
    def __init__(self, level: int) -> None:
        self.level = level

    def __eq__(self, other):
        return self.level == other.level

    # To make all comparisons work, you'd need ALL of these:
    def __lt__(self, other): return self.level <  other.level
    def __le__(self, other): return self.level <= other.level
    def __gt__(self, other): return self.level >  other.level
    def __ge__(self, other): return self.level >= other.level
    # Four methods, all expressing the same idea four ways.
```

**The solution:**

```python
from functools import total_ordering

@total_ordering
class Priority:
    def __init__(self, level: int) -> None:
        self.level = level

    def __eq__(self, other: object) -> bool:
        if not isinstance(other, Priority):
            return NotImplemented
        return self.level == other.level

    def __lt__(self, other: 'Priority') -> bool:
        return self.level < other.level
    # total_ordering generates: __le__, __gt__, __ge__

low    = Priority(1)
high   = Priority(3)
low < high    # → True
high > low    # → True
sorted([high, low])  # → [low, high]
```

**What it hides:** The algebraic relationships between comparisons.
If you know `a < b`, you can derive that `b > a` and `not (a >= b)`. `total_ordering`
performs these derivations so you don't repeat the logic.

**Project application:** If `Priority` values need to be sorted or compared, `total_ordering`
lets you define the ordering once and get all operators for free.

**Smallest possible example:**

```python
from functools import total_ordering

@total_ordering
class Version:
    def __init__(self, major: int, minor: int) -> None:
        self.major = major
        self.minor = minor

    def __eq__(self, other):
        return (self.major, self.minor) == (other.major, other.minor)

    def __lt__(self, other):
        return (self.major, self.minor) < (other.major, other.minor)

v1 = Version(1, 0)
v2 = Version(2, 0)
v1 < v2   # → True
v2 > v1   # → True (generated by total_ordering)
```

**You will see this again in:**
- Python standard library: `datetime.date` uses a similar approach
- Any value object that needs to be sorted (prices, dates, version numbers, priorities)
- `dataclasses.dataclass(order=True)` does the same thing automatically

**Watch for:** `total_ordering` requires BOTH `__eq__` and at least one comparison method.
Missing `__eq__` → `TypeError: Cannot make a totally ordered type without defining __eq__`.

---

## 🎯 Challenge: Add `__getitem__` and Sorting Support

**You know:** All dunder methods taught in this lesson.

**Task:** Add two more dunders to `TaskList`:

1. `__getitem__(self, index: int) -> Task` — makes `task_list[0]` work like a list index
2. Make `TaskList` sortable: `sorted(task_list)` should sort tasks by priority
   (high first), then by title alphabetically. You will need to add `__lt__` to
   `Task` (and use `@total_ordering`).

The priority ordering (for sorting): `high` (3) > `medium` (2) > `low` (1).

Write 3 tests before implementing:
- `task_list[0]` returns the first task
- `task_list[99]` raises `IndexError`
- `sorted(task_list)` returns high-priority tasks first

---

<details>
<summary>▶ Show Solution</summary>

**Add to `TaskList`:**
```python
def __getitem__(self, index: int) -> Task:
    return self._tasks[index]   # list already raises IndexError for out-of-range
```

**Add to `Task` (in task.py):**
```python
from functools import total_ordering

_PRIORITY_LEVEL = {'high': 3, 'medium': 2, 'low': 1}

@total_ordering   # add this decorator above the class definition
class Task:
    # ... existing code ...

    def __lt__(self, other: 'Task') -> bool:
        # Higher priority sorts first (negate), then title alphabetically:
        self_key  = (-_PRIORITY_LEVEL.get(self.priority, 0),  self.title)
        other_key = (-_PRIORITY_LEVEL.get(other.priority, 0), other.title)
        return self_key < other_key
```

**Tests:**
```python
def test_getitem_returns_task_at_index() -> None:
    tl = TaskList()
    tl.add(Task('A'))
    tl.add(Task('B'))
    assert tl[0].title == 'A'

def test_getitem_raises_index_error_for_out_of_range() -> None:
    with pytest.raises(IndexError):
        TaskList()[0]

def test_sorted_orders_by_priority_then_title() -> None:
    tl = TaskList()
    tl.add(Task('Deploy',      priority='low'))
    tl.add(Task('Write tests', priority='high'))
    tl.add(Task('Review PR',   priority='medium'))
    ordered = sorted(tl)
    assert ordered[0].title == 'Write tests'   # high first
    assert ordered[2].title == 'Deploy'        # low last
```

**Key insight:** `(-_PRIORITY_LEVEL[...], title)` as the sort key uses Python's
tuple comparison: tuples compare element by element. Negating the level means
high (3 → -3) sorts before medium (2 → -2) sorts before low (1 → -1). The title
is the tiebreaker — alphabetical within the same priority level.

</details>

---

## Final Check

| Dunder | Python operation that calls it | What to test |
|---|---|---|
| `__repr__` | `repr(obj)`, `print(obj)`, REPL display | Output contains title and status |
| `__eq__` | `a == b` | Two tasks with same values are equal |
| `__hash__` | `{task}`, `{task: value}` | Task can be added to a set |
| `__len__` | `len(obj)`, `bool(obj)` | Empty list → 0 → False; one item → 1 → True |
| `__contains__` | `item in obj` | True for added item, False for absent |
| `__iter__` | `for x in obj`, comprehensions | Visits all tasks in order |

---

## Quick Check Answers

**1. `print(task)` shows the memory address — how do you change it?**

Define `__str__` or `__repr__` on the class. Python calls `str(task)` when you
`print(task)`. If `__str__` is not defined, it falls back to `__repr__`. By adding
`__repr__` to `Task`, every `print(task)` automatically uses your format — no changes
at call sites, no arguments to pass. This is what the protocol pattern achieves:
one method definition, everywhere it applies.

**2. Are two Tasks with the same title equal by default? Should they be?**

No, they are not equal by default. Python's default `__eq__` compares object identity
(`a is b`). Two separately created `Task('Write tests')` objects are different objects,
so `a == b` returns `False`. Whether they *should* be equal depends on your domain.
If a task is identified by its content (title + priority), then `__eq__` comparing those
fields is correct. If tasks have unique IDs (like database rows), equality should compare
IDs instead.

**3. You define `__eq__`. Python sets `__hash__ = None`. What breaks?**

Anything that needs to store your object in a `set` or use it as a `dict` key breaks
with `TypeError: unhashable type: 'Task'`. This is Python's safety measure: if you
change what "equal" means, the old hash may be inconsistent with the new equality —
which would corrupt sets and dicts. You must define `__hash__` to use the same fields
as `__eq__`, ensuring that equal objects always produce the same hash.
