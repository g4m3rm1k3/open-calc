# Junior to Senior — T5·L0g — Enums

**Prerequisites:** T5·L0f (Abstract Classes and Protocol). You have the repository
interface. This lesson covers Python enums — the tool that replaces string
constants with named values that have IDE support, typo detection, and clean serialisation.

**What this lab adds:**
- `enum.Enum`: named members with values; NOT equal to plain strings by default
- `enum.StrEnum` (Python 3.11+): members ARE strings — serialise cleanly to JSON and databases
- `enum.IntEnum`: members are integers — usable in comparisons and sorting
- `enum.Flag`: combinable bit-flag enums for permissions
- `auto()` and custom methods on enum members

**Time:** 45–60 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. `STATUS = 'active'` vs `Status.ACTIVE`. Name two specific things that go wrong
>    with the string constant that the enum prevents.
> 2. Your task statuses are stored in the database as `'active'`, `'done'`, `'on_hold'`.
>    Which Python enum class serialises directly to those strings?
> 3. A user has permissions: READ, WRITE, ADMIN. They can have combinations like
>    READ + WRITE but not ADMIN. Which enum type handles combined permissions?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

Three enums for the task API, each demonstrating a different use case:

```python
>>> TaskStatus.ACTIVE
<TaskStatus.ACTIVE: 'active'>
>>> TaskStatus.ACTIVE == 'active'     # StrEnum — True
True
>>> TaskStatus.ON_HOLD.label
'On Hold'
>>> TaskStatus.DONE.is_terminal
True

>>> Permission.READ | Permission.WRITE    # Flag — combinable
<Permission.READ|WRITE: 3>
>>> Permission.ADMIN in (Permission.READ | Permission.WRITE | Permission.ADMIN)
True
```

---

### Concept: The Problem With String Constants

**What it is:** Using string literals for domain states works until code grows.
Then typos corrupt data silently, IDEs offer no autocomplete, and you cannot list
all valid values programmatically.

**The problem before:**

```python
# String constants — all these bugs are silent:
task = Task('Write tests')
task.status = 'actuve'     # typo — stored as 'actuve', breaks all comparisons
task.status = 'Active'     # wrong case — breaks all 'active' checks
task.status = 'done '      # trailing space — breaks all 'done' checks

if task.status == 'activee':   # typo in comparison — always False, silently wrong
    send_reminder()

# You cannot list all valid statuses without reading the whole codebase:
STATUSES = ['active', 'done', 'on_hold', 'cancelled']   # maintained manually, drifts
```

**The solution:**

```python
from enum import StrEnum

class TaskStatus(StrEnum):
    ACTIVE    = 'active'
    DONE      = 'done'
    ON_HOLD   = 'on_hold'
    CANCELLED = 'cancelled'

task.status = TaskStatus.ACTUVE   # → AttributeError: ACTUVE is not a TaskStatus member
task.status = TaskStatus.ACTIVE   # only valid way
list(TaskStatus)                  # → all valid statuses — authoritative list
```

**What it hides:** The set of valid values. The enum IS the authoritative list.
New statuses are added by adding members — the list cannot drift from the code.

**Canonical example:** Traffic lights. The valid states are RED, YELLOW, GREEN.
A string `'redd'` is silently accepted by the system. A `TrafficLight.REDD` raises
`AttributeError` immediately at development time.

**Project application:** `TaskStatus` replaces all `'active'`, `'done'` strings in
the task API. The database stores the string values (via `StrEnum`); Python code uses
the enum names.

**You will see this again in:**
- Every web framework stores status codes as enums (FastAPI's `status.HTTP_200_OK`)
- SQLAlchemy: `Column(Enum(TaskStatus))` stores enum values in the database
- REST APIs: all valid values documented once in the enum definition
- Standard interview topic: "Why use an enum instead of string constants?"

**Watch for:** `TaskStatus('active')` — the single-argument call — looks up a member
by its VALUE. `TaskStatus.ACTIVE` — dot notation — accesses a member by NAME.
Both give `<TaskStatus.ACTIVE: 'active'>`, but the call syntax raises `ValueError`
for invalid values while dot notation raises `AttributeError`.

---

## Step 1 — See the Problem First

```bash
python -c "
status = 'actve'   # typo — silent
if status == 'active':
    print('task is active')   # never prints — wrong silently
else:
    print('status:', repr(status))
"
```

**You should see:** `status: 'actve'` — stored and compared without error. No warning.

---

### Concept: `Enum` vs `StrEnum`

**What it is:**
- `Enum`: members have a name and a value. Members are NOT equal to plain strings.
  `TaskStatus.ACTIVE == 'active'` → `False`
- `StrEnum` (Python 3.11+): members ARE strings. `TaskStatus.ACTIVE == 'active'` → `True`

**The difference matters for:**
- JSON serialisation: `StrEnum` members serialise to `'active'` automatically
- SQLAlchemy: `StrEnum` members store as their string value without configuration
- Database queries: `WHERE status = 'active'` works with `StrEnum`; requires `.value` with plain `Enum`

**When to use `Enum`:** When you want strict separation — a `TaskStatus` should never
accidentally compare equal to a raw string.

**When to use `StrEnum`:** When the enum values must be stored in a database, sent in
JSON, or compared with strings from external sources (API requests, config files).

**The project rule:** Use `StrEnum` for all status/type fields in the task API —
they flow to the database and JSON responses where string equality matters.

**Smallest possible example:**

```python
from enum import Enum, StrEnum

class PlainStatus(Enum):
    ACTIVE = 'active'

class StringStatus(StrEnum):
    ACTIVE = 'active'

PlainStatus.ACTIVE == 'active'   # → False  (not equal to string)
StringStatus.ACTIVE == 'active'  # → True   (IS a string)
str(StringStatus.ACTIVE)         # → 'active'
f'status: {StringStatus.ACTIVE}' # → 'status: active'  (no .value needed)
```

**You will see this again in:**
- FastAPI automatically serialises `StrEnum` response model fields to their string values
- Pydantic validates `str` fields against `StrEnum` values automatically
- `StrEnum` was added in Python 3.11; before that, `class X(str, Enum)` was the equivalent

---

## Step 2 — Build `TaskStatus` and `Priority`

Create `src/domain/enums.py`:

```python
# src/domain/enums.py
from enum import StrEnum, IntEnum, Flag, auto
```

### SAVE AND TRY

```bash
python -c "from src.domain.enums import *; print('imports OK')"
```

**You should see:** `imports OK`

Now add `TaskStatus`:

```python
# src/domain/enums.py
from enum import StrEnum, IntEnum, Flag, auto


class TaskStatus(StrEnum):
    ACTIVE    = 'active'
    ON_HOLD   = 'on_hold'
    DONE      = 'done'
    CANCELLED = 'cancelled'
```

### SAVE AND TRY

```bash
python -c "
from src.domain.enums import TaskStatus

print(TaskStatus.ACTIVE)             # <TaskStatus.ACTIVE: 'active'>
print(TaskStatus.ACTIVE == 'active') # True — StrEnum
print(str(TaskStatus.ON_HOLD))       # 'on_hold'
print(list(TaskStatus))              # all four members
print(TaskStatus('done'))            # lookup by value
"
```

**You should see:**
```
active
True
on_hold
[<TaskStatus.ACTIVE: 'active'>, <TaskStatus.ON_HOLD: 'on_hold'>, <TaskStatus.DONE: 'done'>, <TaskStatus.CANCELLED: 'cancelled'>]
TaskStatus.done
```

**Change something:** Try looking up an invalid value:

```bash
python -c "from src.domain.enums import TaskStatus; TaskStatus('invalid')"
```

**Expected:** `ValueError: 'invalid' is not a valid TaskStatus`

---

### Concept: Methods on Enum Members

**What it is:** Enum members can have methods. Each method is called on a specific
member (like an instance method — `self` is the member).

**The problem before:**

```python
# Scattered logic for enum behaviour:
def get_status_label(status: str) -> str:
    return status.replace('_', ' ').title()

def is_terminal_status(status: str) -> bool:
    return status in {'done', 'cancelled'}

# Usage:
if is_terminal_status(task.status):
    ...
label = get_status_label(task.status)
```

The logic is separated from the enum. Anyone can call `get_status_label('random string')`.

**The solution — methods belong on the enum:**

```python
class TaskStatus(StrEnum):
    ACTIVE    = 'active'
    DONE      = 'done'
    CANCELLED = 'cancelled'

    @property
    def label(self) -> str:
        return self.value.replace('_', ' ').title()

    @property
    def is_terminal(self) -> bool:
        return self in (TaskStatus.DONE, TaskStatus.CANCELLED)

TaskStatus.DONE.is_terminal     # → True  (on the member — correct home)
TaskStatus.ACTIVE.label         # → 'Active'
```

**What it hides:** The logic lives with the data. You can't accidentally call
`is_terminal` on an arbitrary string — it only exists on `TaskStatus` members.

**Project application:** `TaskStatus.ON_HOLD.label` returns a human-readable string
for the API response. `TaskStatus.DONE.is_terminal` determines whether further
status transitions are allowed.

**Smallest possible example:**

```python
from enum import StrEnum

class Colour(StrEnum):
    RED   = 'red'
    GREEN = 'green'
    BLUE  = 'blue'

    @property
    def hex_code(self) -> str:
        return {'red': '#FF0000', 'green': '#00FF00', 'blue': '#0000FF'}[self.value]

Colour.RED.hex_code   # → '#FF0000'
```

**You will see this again in:**
- Django: `TextChoices` enum subclass with `label` property for form display
- SQLAlchemy: enum members with `as_sql()` methods
- Every enum that needs display labels, groupings, or computed properties

**Watch for:** `self` in an enum method refers to the member (the enum value),
not a normal instance. `self.value` gives the raw stored value (`'active'`).
`self.name` gives the Python identifier (`'ACTIVE'`).

---

## Step 3 — Add Methods to `TaskStatus`

Update `src/domain/enums.py`:

```python
# src/domain/enums.py
from enum import StrEnum, IntEnum, Flag, auto


class TaskStatus(StrEnum):
    ACTIVE    = 'active'
    ON_HOLD   = 'on_hold'
    DONE      = 'done'
    CANCELLED = 'cancelled'

    @property
    def label(self) -> str:
        return self.value.replace('_', ' ').title()   # 'on_hold' → 'On Hold'

    @property
    def is_terminal(self) -> bool:
        return self in (TaskStatus.DONE, TaskStatus.CANCELLED)

    @property
    def can_transition_to(self) -> frozenset['TaskStatus']:
        _transitions: dict['TaskStatus', frozenset['TaskStatus']] = {
            TaskStatus.ACTIVE:    frozenset({TaskStatus.ON_HOLD, TaskStatus.DONE, TaskStatus.CANCELLED}),
            TaskStatus.ON_HOLD:   frozenset({TaskStatus.ACTIVE,  TaskStatus.CANCELLED}),
            TaskStatus.DONE:      frozenset(),
            TaskStatus.CANCELLED: frozenset(),
        }
        return _transitions[self]
```

### SAVE AND TRY

```bash
python -c "
from src.domain.enums import TaskStatus
print(TaskStatus.ON_HOLD.label)        # 'On Hold'
print(TaskStatus.DONE.is_terminal)     # True
print(TaskStatus.ACTIVE.is_terminal)   # False
print(TaskStatus.ACTIVE.can_transition_to)   # frozenset of valid next statuses
print(TaskStatus.DONE.can_transition_to)     # frozenset() — no valid transitions
"
```

**You should see:**
```
On Hold
True
False
frozenset({<TaskStatus.ON_HOLD: 'on_hold'>, <TaskStatus.DONE: 'done'>, <TaskStatus.CANCELLED: 'cancelled'>})
frozenset()
```

---

### Concept: `Flag` — Combinable Permissions

**What it is:** `Flag` enum members can be combined with `|` (bitwise OR).
The result is a new `Flag` value representing the combination.

**The problem before:**

```python
# Representing combinations with strings:
user_permissions = 'read,write'   # parse on every check — fragile
if 'read' in user_permissions.split(','):   # string operations — error-prone
    ...
if user_permissions == 'admin':   # doesn't handle combinations
    ...
```

**The solution:**

```python
from enum import Flag, auto

class Permission(Flag):
    READ   = auto()   # auto() assigns 1
    WRITE  = auto()   # auto() assigns 2
    ADMIN  = auto()   # auto() assigns 4

user_perms = Permission.READ | Permission.WRITE   # → Permission.READ|WRITE (value=3)

Permission.READ  in user_perms   # → True
Permission.ADMIN in user_perms   # → False
```

**What it hides:** Bit manipulation. `auto()` assigns powers of 2 (1, 2, 4, 8...).
Combining with `|` (bitwise OR) creates combinations: `1 | 2 = 3` represents READ+WRITE.
Checking with `in` uses `&` (bitwise AND) internally. You never write `& 0b01` — the
`Flag` class manages the bit arithmetic.

**Canonical example:** A Unix file permissions mask: r=4, w=2, x=1. A file can be
readable+writable (`6 = r|w`) or readable+executable (`5 = r|x`). Each combination
is a different permission set. `Flag` is Python's implementation of this pattern.

**Project application:** A task API user might have READ permission (can view tasks)
and WRITE permission (can create/edit), but not ADMIN (cannot delete all tasks).
`Permission.READ | Permission.WRITE` encodes this combination in one value.

**Smallest possible example:**

```python
from enum import Flag, auto

class Access(Flag):
    READ    = auto()
    WRITE   = auto()
    EXECUTE = auto()

perms = Access.READ | Access.WRITE
Access.READ  in perms    # → True
Access.WRITE in perms    # → True
Access.EXECUTE in perms  # → False
```

**You will see this again in:**
- Python standard library: `re.IGNORECASE | re.MULTILINE` — regex flags are an `IntFlag`
- Operating system file permissions: readable, writable, executable
- Bitfield database columns: storing multiple boolean flags in one integer

**Watch for:** `Permission.READ | Permission.WRITE` creates a COMBINATION — it is NOT
`Permission.READ` and NOT `Permission.WRITE`. It is `Permission.READ|WRITE`.
`str(Permission.READ | Permission.WRITE)` → `'Permission.READ|WRITE'`.

---

## Step 4 — Add `Permission` and `Priority`

Add to `src/domain/enums.py`:

```python
class Priority(StrEnum):                                    # ← add this
    LOW    = 'low'
    MEDIUM = 'medium'
    HIGH   = 'high'

    @property
    def numeric_value(self) -> int:
        return {'low': 1, 'medium': 2, 'high': 3}[self.value]


class Permission(Flag):                                     # ← add this
    READ   = auto()
    WRITE  = auto()
    DELETE = auto()
    ADMIN  = auto()

    @classmethod
    def read_write(cls) -> 'Permission':
        return cls.READ | cls.WRITE

    @classmethod
    def all_permissions(cls) -> 'Permission':
        return cls.READ | cls.WRITE | cls.DELETE | cls.ADMIN
```

### SAVE AND TRY

```bash
python -c "
from src.domain.enums import Priority, Permission

print(Priority.HIGH.numeric_value)   # 3

perms = Permission.READ | Permission.WRITE
print(perms)                          # Permission.READ|WRITE
print(Permission.READ  in perms)      # True
print(Permission.ADMIN in perms)      # False
print(Permission.read_write())        # Permission.READ|WRITE
"
```

**You should see:**
```
3
Permission.READ|WRITE
True
False
Permission.READ|WRITE
```

---

## Step 5 — Write the Tests

Create `tests/test_enums.py`:

```python
# tests/test_enums.py
import pytest
from src.domain.enums import TaskStatus, Priority, Permission


class TestTaskStatus:

    def test_is_str_enum_equal_to_its_string_value(self) -> None:
        assert TaskStatus.ACTIVE == 'active'    # StrEnum equality

    def test_label_replaces_underscore_and_capitalises_words(self) -> None:
        assert TaskStatus.ON_HOLD.label == 'On Hold'
        assert TaskStatus.ACTIVE.label  == 'Active'

    def test_done_is_terminal(self) -> None:
        assert TaskStatus.DONE.is_terminal      is True

    def test_cancelled_is_terminal(self) -> None:
        assert TaskStatus.CANCELLED.is_terminal is True

    def test_active_is_not_terminal(self) -> None:
        assert TaskStatus.ACTIVE.is_terminal    is False

    def test_active_can_transition_to_done(self) -> None:
        assert TaskStatus.DONE in TaskStatus.ACTIVE.can_transition_to

    def test_done_has_no_allowed_transitions(self) -> None:
        assert len(TaskStatus.DONE.can_transition_to) == 0

    def test_lookup_by_value_string(self) -> None:
        assert TaskStatus('active') == TaskStatus.ACTIVE

    def test_invalid_value_raises_value_error(self) -> None:
        with pytest.raises(ValueError):
            TaskStatus('unknown')


class TestPriority:

    def test_numeric_value_ordering(self) -> None:
        assert Priority.HIGH.numeric_value   > Priority.MEDIUM.numeric_value
        assert Priority.MEDIUM.numeric_value > Priority.LOW.numeric_value

    def test_sorted_by_numeric_value(self) -> None:
        priorities = [Priority.HIGH, Priority.LOW, Priority.MEDIUM]
        sorted_p   = sorted(priorities, key=lambda p: p.numeric_value)
        assert sorted_p == [Priority.LOW, Priority.MEDIUM, Priority.HIGH]


class TestPermission:

    def test_combining_two_permissions(self) -> None:
        perms = Permission.READ | Permission.WRITE
        assert Permission.READ  in perms
        assert Permission.WRITE in perms
        assert Permission.ADMIN not in perms

    def test_all_permissions_contains_every_member(self) -> None:
        all_p = Permission.all_permissions()
        assert Permission.READ   in all_p
        assert Permission.WRITE  in all_p
        assert Permission.DELETE in all_p
        assert Permission.ADMIN  in all_p

    def test_read_write_excludes_admin(self) -> None:
        rw = Permission.read_write()
        assert Permission.ADMIN not in rw
```

### SAVE AND TRY

```bash
pytest tests/test_enums.py -v
```

**You should see:**
```
tests/test_enums.py::TestTaskStatus::test_is_str_enum_equal_to_its_string_value PASSED
...
tests/test_enums.py::TestPermission::test_read_write_excludes_admin PASSED

13 passed
```

---

## 🎯 Challenge: Add a State Machine to `Task`

**You know:** `TaskStatus`, `can_transition_to`, `is_terminal`.

**Task:** Update `Task` in `task.py` to use `TaskStatus` and enforce valid state
transitions with a `transition_to(new_status)` method:

```python
task = Task('Write tests')
task.status                                    # TaskStatus.ACTIVE
task.transition_to(TaskStatus.DONE)            # valid — changes status
task.transition_to(TaskStatus.ACTIVE)          # ValueError — DONE is terminal
task.transition_to(TaskStatus.ON_HOLD)         # ValueError — DONE is terminal
```

Write 4 tests first, then implement.

---

<details>
<summary>▶ Show Solution</summary>

**Tests:**
```python
def test_initial_status_is_active() -> None:
    task = Task('Write tests')
    assert task.status == TaskStatus.ACTIVE

def test_valid_transition_changes_status() -> None:
    task = Task('Write tests')
    task.transition_to(TaskStatus.DONE)
    assert task.status == TaskStatus.DONE

def test_transition_from_terminal_raises() -> None:
    task = Task('Write tests')
    task.transition_to(TaskStatus.DONE)
    with pytest.raises(ValueError, match='terminal'):
        task.transition_to(TaskStatus.ACTIVE)

def test_invalid_transition_raises() -> None:
    task = Task('Write tests')
    task.transition_to(TaskStatus.ON_HOLD)
    with pytest.raises(ValueError):
        task.transition_to(TaskStatus.DONE)   # ON_HOLD can only go to ACTIVE or CANCELLED
```

**Add to `task.py`:**
```python
from src.domain.enums import TaskStatus

class Task:
    def __init__(self, title: str, priority: str = 'medium') -> None:
        # ... existing code ...
        self._status: TaskStatus = TaskStatus.ACTIVE

    @property
    def status(self) -> TaskStatus:
        return self._status

    def transition_to(self, new_status: TaskStatus) -> None:
        if self._status.is_terminal:
            raise ValueError(
                f'Cannot transition from {self._status.label!r} — status is terminal'
            )
        if new_status not in self._status.can_transition_to:
            raise ValueError(
                f'Invalid transition: {self._status.label!r} → {new_status.label!r}'
            )
        self._status = new_status
```

**Key insight:** The allowed transitions are encoded IN the enum member. `Task.transition_to`
delegates the business rules (`is_terminal`, `can_transition_to`) entirely to the enum.
When a new transition rule is added, only the enum changes — `Task` is untouched.
This is the Open/Closed Principle in practice.

</details>

---

## Final Check

| Enum type | Members equal to raw value? | Combinable? | Use case |
|---|---|---|---|
| `Enum` | No | No | Strict type-safe constants |
| `StrEnum` | Yes (strings) | No | Database/JSON fields |
| `IntEnum` | Yes (integers) | No | Integer comparisons and ordering |
| `Flag` | No | Yes (`|`) | Permissions, feature flags, bitmasks |

---

## Quick Check Answers

**1. String constants vs enum — two specific problems the enum prevents:**

(1) Typos at definition time: `TaskStatus.ACTUVE` raises `AttributeError` immediately.
`task.status = 'actuve'` stores without error and fails silently later.
(2) The set of valid values is authoritative: `list(TaskStatus)` gives all members.
A manual `STATUSES = ['active', 'done', ...]` list must be maintained separately and
can drift from the actual code that checks `status == 'active'`.

**2. Statuses stored as strings in the database — which Python enum class?**

`StrEnum`. Members ARE strings: `str(TaskStatus.ACTIVE)` returns `'active'` and
`TaskStatus.ACTIVE == 'active'` is `True`. SQLAlchemy, Pydantic, and FastAPI all handle
`StrEnum` members as their string values automatically, without extra configuration.

**3. Permissions that can be combined — which enum type?**

`Flag`. `Flag` members are powers of 2 (set by `auto()`: 1, 2, 4, 8...). The `|`
operator combines members into a new `Flag` value representing all combined permissions.
Membership is checked with `in`: `Permission.READ in user_perms` is `True` if READ
is part of the combined permission value.
