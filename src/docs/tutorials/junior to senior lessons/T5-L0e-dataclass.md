# Junior to Senior — T5·L0e — `@dataclass` in Depth

**Prerequisites:** T5·L0d (`@property`, `@staticmethod`, `@classmethod`). You can
write classes with validated properties and alternative constructors. This lesson
covers `@dataclass` — Python's code-generation tool that writes `__init__`,
`__repr__`, and `__eq__` for you from field declarations.

**What this lab adds:**
- `@dataclass`: auto-generates `__init__`, `__repr__`, `__eq__` from annotated fields
- `field(default_factory=list)`: the correct way to have a mutable default (a list or dict)
- `frozen=True`: immutable instances with auto-generated `__hash__` — value objects
- `__post_init__`: validation and computed fields run after the auto-generated `__init__`
- `order=True`: auto-generates comparison operators (`<`, `<=`, `>`, `>=`)

**Time:** 45–60 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. `@dataclass` with `tags: list[str] = []` — Python raises an error at class
>    definition time. Why? And what is the fix?
> 2. You want a dataclass that cannot be modified after creation (a value object).
>    Which parameter do you pass to `@dataclass`?
> 3. `frozen=True` blocks `self.computed_field = value` even in `__post_init__`.
>    What is the Python workaround?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

Two dataclasses: a `TaskEvent` value object (immutable) and a `TaskSnapshot` data
transfer object (mutable), with validation in `__post_init__`:

```python
>>> event = TaskEvent(task_id='t-1', event_type='created')
>>> event
TaskEvent(task_id='t-1', event_type='created', payload={})
>>> event.task_id = 'other'   # FrozenInstanceError — immutable

>>> snap = TaskSnapshot(title='Write tests', priority='high', tags=['backend'])
>>> snap.tag_count      # computed in __post_init__
1
>>> TaskSnapshot(title='')   # ValidationError via __post_init__
ValueError: title cannot be empty
```

---

### Concept: `@dataclass` — Eliminating Boilerplate

**What it is:** `@dataclass` reads the class body's type-annotated fields and
auto-generates `__init__`, `__repr__`, and `__eq__`. It eliminates the boilerplate
of writing these methods by hand.

**The problem before:**

```python
class TaskSnapshot:
    def __init__(
        self,
        title:    str,
        priority: str    = 'medium',
        done:     bool   = False,
    ) -> None:
        self.title    = title
        self.priority = priority
        self.done     = done

    def __repr__(self) -> str:
        return f'TaskSnapshot(title={self.title!r}, priority={self.priority!r}, done={self.done!r})'

    def __eq__(self, other: object) -> bool:
        if not isinstance(other, TaskSnapshot):
            return NotImplemented
        return (self.title, self.priority, self.done) == (other.title, other.priority, other.done)
```

This is 18 lines of mechanical code for 3 fields. With 10 fields, it grows to 50+ lines.
Any new field requires updating `__init__`, `__repr__`, AND `__eq__`.

**The solution:**

```python
from dataclasses import dataclass

@dataclass
class TaskSnapshot:
    title:    str
    priority: str  = 'medium'
    done:     bool = False

# Python generates the same __init__, __repr__, and __eq__ automatically
```

Three lines replace eighteen. Adding a field means adding one annotated line.

**What it hides:** The mechanical pattern of writing the same boilerplate for every
class. `@dataclass` knows that a class with annotated fields needs these three methods —
it writes them from your declarations. The invariant it protects: the generated `__eq__`
always compares all declared fields consistently (no field is accidentally omitted).

**Canonical example:** A mailing address form. The form declares five fields (name, street,
city, state, zip). Every address form needs the same operations (fill in, display, compare).
`@dataclass` is like a form-printing machine — give it the fields, get a complete form.

**Project application:** `TaskEvent` and `TaskSnapshot` in the task API are pure data
containers. `@dataclass` generates their boilerplate so we can focus on the few non-trivial
behaviours (`__post_init__` validation).

**Smallest possible example:**

```python
from dataclasses import dataclass

@dataclass
class Point:
    x: float
    y: float

p1 = Point(1.0, 2.0)
p2 = Point(1.0, 2.0)
repr(p1)   # → 'Point(x=1.0, y=2.0)'
p1 == p2   # → True (generated __eq__ compares x and y)
p1 is p2   # → False (different instances)
```

**Why it matters here:** `TaskEvent` needs `__eq__` and `__repr__` for tests and
debugging. `@dataclass` provides both from the field declarations.

**You will see this again in:**
- Pydantic's `BaseModel` provides similar auto-generation plus validation
- `attrs` library: predecessor to dataclasses, still used in many projects
- Every Python project with data transfer objects uses one of these three approaches
- TypeScript equivalent: interfaces + `type` aliases play the same role (but without auto-generation)

**Watch for:** `@dataclass` does NOT add `__hash__` by default (because it generates
`__eq__`, and as you learned in T5-L0b, Python sets `__hash__ = None` when `__eq__`
is defined). Use `@dataclass(frozen=True)` or `@dataclass(unsafe_hash=True)` if you
need instances in sets or as dict keys.

---

## Step 1 — A Plain Dataclass

Create `src/domain/events.py`:

```python
# src/domain/events.py
from dataclasses import dataclass


@dataclass
class TaskEvent:
    task_id:    str
    event_type: str
```

### SAVE AND TRY

```bash
python -c "
from src.domain.events import TaskEvent
e1 = TaskEvent(task_id='t-1', event_type='created')
e2 = TaskEvent(task_id='t-1', event_type='created')
print(repr(e1))      # __repr__ generated
print(e1 == e2)      # __eq__ generated — True
print(e1 is e2)      # False — different objects
"
```

**You should see:**
```
TaskEvent(task_id='t-1', event_type='created')
True
False
```

**Change something:** Try to add a field with a default that comes BEFORE a field
without a default:

```bash
python -c "
from dataclasses import dataclass

@dataclass
class Bad:
    with_default: str = 'x'
    no_default:   str         # ← after a default — error
"
```

**Expected:** `TypeError: non-default argument 'no_default' follows default argument`.
Same rule as Python function parameters: non-default fields must come before default fields.

---

### Concept: Mutable Defaults and `field(default_factory=...)`

**What it is:** If a field has a mutable default (list, dict, set), you cannot write
`tags: list[str] = []`. Python would share ONE list across ALL instances.
`field(default_factory=list)` creates a NEW list for each instance.

**The problem before:**

```python
@dataclass
class Task:
    tags: list[str] = []   # Python raises an error here

# Why the error? Without field():
# ALL tasks would share ONE list object:
# task1 = Task(); task2 = Task()
# task1.tags.append('backend')
# print(task2.tags)  → ['backend']  ← WRONG
```

Python actually catches this at class definition time and raises:
`ValueError: mutable default <class 'list'> for field tags is not allowed:
use default_factory`

**The solution:**

```python
from dataclasses import dataclass, field

@dataclass
class Task:
    tags: list[str] = field(default_factory=list)
    # field(default_factory=list) means: call list() for each new instance → fresh []

task1 = Task()
task2 = Task()
task1.tags.append('backend')
print(task2.tags)   # → []  — completely independent
```

**What it hides:** The object identity problem. `field(default_factory=list)` tells
Python "call `list()` every time a new instance is created, giving each its own list."
Without it, the default `[]` is one object shared by all instances.

**Canonical example:** A fresh notebook for each student. If every student shared one
notebook (`default = []`), one student's notes would appear in everyone's notebook.
`default_factory=list` gives each student a brand-new notebook.

**Project application:** `TaskEvent.payload` is a dict per event. `TaskSnapshot.tags`
is a list per snapshot. Both must be independent per instance.

**Smallest possible example:**

```python
from dataclasses import dataclass, field

@dataclass
class Person:
    name:     str
    hobbies:  list[str] = field(default_factory=list)   # NEW list per person

alice = Person('Alice')
bob   = Person('Bob')
alice.hobbies.append('reading')
print(bob.hobbies)   # → []  — bob has his OWN empty list
```

**Why it matters here:** `TaskEvent.payload` is a dict — mutable. `field(default_factory=dict)`
ensures each event gets its own empty dict.

**You will see this again in:**
- Every dataclass with list or dict fields in professional code
- Pydantic uses `Field(default_factory=list)` for the same reason
- Standard Python interview topic: "Why can't you use a mutable default in a function?"
  (Same root cause: the default is evaluated once, shared by all calls)

**Watch for:** `field(default_factory=list)` — no parentheses on `list`. You pass
the factory function itself, not a call to it. `field(default_factory=list())` would
call `list()` ONCE and pass the resulting empty list — the same shared-default problem.

---

## Step 2 — Add `payload` Field to `TaskEvent`

Update `src/domain/events.py`:

```python
# src/domain/events.py
from __future__ import annotations
from dataclasses import dataclass, field    # ← add field to imports


@dataclass
class TaskEvent:
    task_id:    str
    event_type: str
    payload:    dict = field(default_factory=dict)   # ← add this field
```

### SAVE AND TRY

```bash
python -c "
from src.domain.events import TaskEvent
e1 = TaskEvent('t-1', 'created')
e2 = TaskEvent('t-2', 'updated')
e1.payload['key'] = 'value'
print(e1.payload)   # → {'key': 'value'}
print(e2.payload)   # → {}  — independent dict
"
```

**You should see:**
```
{'key': 'value'}
{}
```

---

### Concept: `frozen=True` — Immutable Value Objects

**What it is:** `@dataclass(frozen=True)` makes all instances immutable. Any attempt
to set or delete an attribute after construction raises `FrozenInstanceError`.
Python also auto-generates `__hash__` based on all fields — making instances
usable in sets and as dict keys.

**The problem before:**

```python
@dataclass
class TaskEvent:
    task_id:    str
    event_type: str

event = TaskEvent('t-1', 'created')
event.event_type = 'deleted'   # silent mutation — an event should not change
# Events are historical facts. Once created, they must not change.
# But without frozen=True, nothing prevents this.
```

**The solution:**

```python
@dataclass(frozen=True)
class TaskEvent:
    task_id:    str
    event_type: str

event = TaskEvent('t-1', 'created')
event.event_type = 'deleted'   # → FrozenInstanceError: cannot assign to field 'event_type'
hash(event)                     # → works! (generated from task_id + event_type)
{event}                         # → works! (set)
{event: 'logged'}               # → works! (dict key)
```

**What it hides:** Thread safety for reads. A frozen instance can be shared between
threads without locks — no thread can modify it, so there are no race conditions
on the data.

**Canonical example:** A minted coin. Once struck, a coin's value, date, and denomination
cannot change. `frozen=True` mints the object — sets it in a permanent state.

**Project application:** `TaskEvent` represents something that happened — it cannot
be retroactively changed. `frozen=True` enforces this at the Python level.

**Smallest possible example:**

```python
from dataclasses import dataclass

@dataclass(frozen=True)
class Coordinate:
    latitude:  float
    longitude: float

c = Coordinate(51.5, -0.12)
c.latitude = 0   # → FrozenInstanceError
{c}              # works — __hash__ is generated
```

**Why it matters here:** Domain events are immutable facts — they describe what
happened and must not change after creation.

**You will see this again in:**
- Pydantic's `model_config = ConfigDict(frozen=True)` does the same thing
- Python's `typing.NamedTuple` — built-in immutable data container
- Functional programming: immutable data is the default in Haskell, Elm, Clojure

**Watch for:** `frozen=True` blocks mutations everywhere — including `__post_init__`.
If you need a computed field, use `object.__setattr__(self, 'field_name', value)` in
`__post_init__` to bypass the freeze guard.

---

## Step 3 — Make `TaskEvent` Frozen

Update `src/domain/events.py`:

```python
# src/domain/events.py
from __future__ import annotations
from dataclasses import dataclass, field


@dataclass(frozen=True)              # ← add frozen=True
class TaskEvent:
    task_id:    str
    event_type: str
    payload:    dict = field(default_factory=dict)
```

### SAVE AND TRY

```bash
python -c "
from dataclasses import FrozenInstanceError
from src.domain.events import TaskEvent
event = TaskEvent('t-1', 'created')
print(hash(event))      # works — frozen generates __hash__
events_set = {event}    # works — hashable
try:
    event.event_type = 'deleted'
except FrozenInstanceError as e:
    print('blocked:', e)
"
```

**You should see:**
```
<some integer hash>
blocked: cannot assign to field 'event_type'
```

**Change something:** Try adding an event to a set and dictionary:

```bash
python -c "
from src.domain.events import TaskEvent
e1 = TaskEvent('t-1', 'created')
e2 = TaskEvent('t-1', 'created')
print({e1, e2})           # deduplication — both equal, one entry
print({e1: 'processed'})  # dict key — works
"
```

**Expected:** One entry in the set, dict key works.

---

### Concept: `__post_init__` — Validation After Auto-Generated `__init__`

**What it is:** `__post_init__` is a method on a dataclass that runs automatically
after the auto-generated `__init__` finishes. Use it for validation and computed fields.

**The problem before:**

```python
@dataclass
class TaskSnapshot:
    title:    str
    priority: str = 'medium'
    # No validation! title could be '' or None.
    # Computed tag_count field not possible without __post_init__.
```

**The solution:**

```python
from dataclasses import dataclass, field

@dataclass
class TaskSnapshot:
    title:    str
    priority: str      = 'medium'
    tags:     list[str] = field(default_factory=list)
    tag_count: int     = field(init=False)   # init=False: excluded from __init__

    def __post_init__(self) -> None:
        if not self.title.strip():
            raise ValueError('title cannot be empty')
        # Computed field — runs after all fields are set:
        self.tag_count = len(self.tags)

snap = TaskSnapshot(title='Write tests', tags=['a', 'b'])
snap.tag_count   # → 2
TaskSnapshot(title='')   # → ValueError: title cannot be empty
```

**What it hides:** The ordering — `__post_init__` runs after all fields are initialised
from the constructor arguments. This means you can safely read all fields inside it.

**Canonical example:** A passport application that validates the photo after all fields
are filled in. You cannot validate the photo until you have all the information. `__post_init__`
is the validation step that runs when the "form" (the constructor) is complete.

**Project application:** `TaskSnapshot.__post_init__` validates that `title` is not empty
and computes `tag_count` from the `tags` list.

**Smallest possible example:**

```python
from dataclasses import dataclass, field

@dataclass
class PositiveNumber:
    value: float
    label: str = field(init=False)   # not in __init__

    def __post_init__(self) -> None:
        if self.value <= 0:
            raise ValueError(f'value must be positive, got {self.value}')
        self.label = f'#{self.value}'   # computed after validation

n = PositiveNumber(42)
n.label   # → '#42'
PositiveNumber(-1)   # → ValueError: value must be positive
```

**Why it matters here:** `TaskSnapshot` received from the API layer must have a
non-empty title. `__post_init__` enforces this once, at construction.

**You will see this again in:**
- Pydantic's `@model_validator(mode='after')` is the equivalent — runs after all fields are validated
- Django model's `clean()` method — validation after field assignment
- Every dataclass with business rules that span multiple fields

**Watch for:** With `frozen=True`, `self.field = value` in `__post_init__` raises
`FrozenInstanceError`. Use `object.__setattr__(self, 'field', value)` to bypass
the freeze for computed fields in frozen dataclasses.

---

## Step 4 — Build `TaskSnapshot` With `__post_init__`

Create `src/domain/snapshot.py`:

```python
# src/domain/snapshot.py
from __future__ import annotations
from dataclasses import dataclass, field


_VALID_PRIORITIES = frozenset({'low', 'medium', 'high'})


@dataclass
class TaskSnapshot:
    """A point-in-time view of a task's state — used for API responses."""
    title:     str
    priority:  str       = 'medium'
    done:      bool      = False
    tags:      list[str] = field(default_factory=list)
    tag_count: int       = field(init=False, repr=False)   # computed; excluded from repr

    def __post_init__(self) -> None:
        # Validation:
        if not self.title.strip():
            raise ValueError('title cannot be empty')
        if self.priority not in _VALID_PRIORITIES:
            raise ValueError(
                f'priority must be one of {sorted(_VALID_PRIORITIES)}, got {self.priority!r}'
            )
        # Computed field — derived from tags:
        self.tag_count = len(self.tags)
```

### SAVE AND TRY

```bash
python -c "
from src.domain.snapshot import TaskSnapshot
snap = TaskSnapshot(title='Write tests', tags=['backend', 'urgent'])
print(snap)             # tag_count excluded from repr (repr=False)
print(snap.tag_count)   # computed in __post_init__
"
```

**You should see:**
```
TaskSnapshot(title='Write tests', priority='medium', done=False, tags=['backend', 'urgent'])
2
```

**Change something:** Try creating a snapshot with an empty title:

```bash
python -c "
from src.domain.snapshot import TaskSnapshot
TaskSnapshot(title='')
"
```

**Expected:** `ValueError: title cannot be empty`

---

## Step 5 — Write the Tests

Create `tests/test_dataclasses.py`:

```python
# tests/test_dataclasses.py
import pytest
from dataclasses import replace
from src.domain.events   import TaskEvent
from src.domain.snapshot import TaskSnapshot


class TestTaskEvent:

    def test_creates_with_required_fields(self) -> None:
        event = TaskEvent(task_id='t-1', event_type='created')
        assert event.task_id    == 't-1'
        assert event.event_type == 'created'
        assert event.payload    == {}

    def test_two_identical_events_are_equal(self) -> None:
        e1 = TaskEvent('t-1', 'created')
        e2 = TaskEvent('t-1', 'created')
        assert e1 == e2

    def test_is_hashable_because_frozen(self) -> None:
        event = TaskEvent('t-1', 'created')
        event_set = {event}   # would raise TypeError if not hashable
        assert event in event_set

    def test_cannot_be_mutated(self) -> None:
        from dataclasses import FrozenInstanceError
        event = TaskEvent('t-1', 'created')
        with pytest.raises(FrozenInstanceError):
            event.task_id = 'different'   # type: ignore[misc]

    def test_replace_creates_new_instance_with_changed_fields(self) -> None:
        original = TaskEvent('t-1', 'created')
        updated  = replace(original, event_type='updated')   # dataclasses.replace
        assert updated.event_type == 'updated'
        assert original.event_type == 'created'   # original unchanged


class TestTaskSnapshot:

    def test_creates_with_defaults(self) -> None:
        snap = TaskSnapshot(title='Write tests')
        assert snap.priority == 'medium'
        assert snap.done     is False
        assert snap.tags     == []

    def test_tag_count_computed_from_tags(self) -> None:
        snap = TaskSnapshot(title='Write tests', tags=['a', 'b', 'c'])
        assert snap.tag_count == 3

    def test_raises_for_empty_title(self) -> None:
        with pytest.raises(ValueError, match='empty'):
            TaskSnapshot(title='')

    def test_raises_for_invalid_priority(self) -> None:
        with pytest.raises(ValueError, match='priority'):
            TaskSnapshot(title='Write tests', priority='urgent')

    def test_mutable_tags_do_not_share_between_instances(self) -> None:
        a = TaskSnapshot(title='A')
        b = TaskSnapshot(title='B')
        a.tags.append('backend')
        assert b.tags == []   # independent list
```

### SAVE AND TRY

```bash
pytest tests/test_dataclasses.py -v
```

**You should see:**
```
tests/test_dataclasses.py::TestTaskEvent::test_creates_with_required_fields PASSED
tests/test_dataclasses.py::TestTaskEvent::test_two_identical_events_are_equal PASSED
tests/test_dataclasses.py::TestTaskEvent::test_is_hashable_because_frozen PASSED
tests/test_dataclasses.py::TestTaskEvent::test_cannot_be_mutated PASSED
tests/test_dataclasses.py::TestTaskEvent::test_replace_creates_new_instance_with_changed_fields PASSED
tests/test_dataclasses.py::TestTaskSnapshot::test_creates_with_defaults PASSED
tests/test_dataclasses.py::TestTaskSnapshot::test_tag_count_computed_from_tags PASSED
tests/test_dataclasses.py::TestTaskSnapshot::test_raises_for_empty_title PASSED
tests/test_dataclasses.py::TestTaskSnapshot::test_raises_for_invalid_priority PASSED
tests/test_dataclasses.py::TestTaskSnapshot::test_mutable_tags_do_not_share_between_instances PASSED

10 passed
```

**Change something:** Remove `field(default_factory=list)` from `tags` and replace it
with `tags: list[str] = []`. Expected: `ValueError: mutable default <class 'list'> ...`
at class definition time. Put `field(default_factory=list)` back.

---

## 🎯 Challenge: Add an `Address` Frozen Dataclass

**You know:** `frozen=True`, `__post_init__`, `field(default_factory=...)`,
`object.__setattr__` for computed fields on frozen dataclasses.

**Task:** Build a frozen `Address` dataclass that represents a mailing address:

```python
@dataclass(frozen=True)
class Address:
    street:   str
    city:     str
    country:  str   # must be exactly 2 uppercase letters (ISO country code)
    postcode: str
    display:  str   # computed: "123 Main St\nLondon W1A 1AA\nGB"
```

Requirements:
- All fields non-empty
- `country` must match the pattern of exactly 2 uppercase ASCII letters
- `display` is computed in `__post_init__` using `object.__setattr__`
- `field(init=False)` for `display`

Write 5 tests first (all failing), then implement.

---

<details>
<summary>▶ Show Solution</summary>

```python
from dataclasses import dataclass, field
import re

@dataclass(frozen=True)
class Address:
    street:   str
    city:     str
    country:  str
    postcode: str
    display:  str = field(init=False, repr=False)

    def __post_init__(self) -> None:
        for attr_name, value in [
            ('street',   self.street),
            ('city',     self.city),
            ('postcode', self.postcode),
        ]:
            if not value.strip():
                raise ValueError(f'{attr_name} cannot be empty')

        if not re.match(r'^[A-Z]{2}$', self.country):
            raise ValueError(
                f'country must be a 2-letter uppercase ISO code, got {self.country!r}'
            )

        # frozen=True blocks self.display = ... so use object.__setattr__:
        object.__setattr__(
            self,
            'display',
            f'{self.street}\n{self.city} {self.postcode}\n{self.country}'
        )
```

**Tests:**
```python
def test_creates_valid_address() -> None:
    addr = Address('123 Main St', 'London', 'GB', 'W1A 1AA')
    assert addr.city == 'London'

def test_display_format() -> None:
    addr = Address('123 Main St', 'London', 'GB', 'W1A 1AA')
    assert addr.display == '123 Main St\nLondon W1A 1AA\nGB'

def test_raises_for_empty_street() -> None:
    with pytest.raises(ValueError, match='street'):
        Address('', 'London', 'GB', 'W1A 1AA')

def test_raises_for_invalid_country_code() -> None:
    with pytest.raises(ValueError, match='country'):
        Address('123 Main St', 'London', 'GBR', 'W1A 1AA')   # 3 letters

def test_is_hashable_and_usable_in_set() -> None:
    a = Address('123 Main St', 'London', 'GB', 'W1A 1AA')
    b = Address('123 Main St', 'London', 'GB', 'W1A 1AA')
    assert {a, b} == {a}   # deduplicated — equal objects, one set entry
```

**Key insight:** `object.__setattr__(self, 'display', value)` bypasses the frozen
guard because it calls the base `object`'s `__setattr__` directly, before the
frozen dataclass's override intercepts it. This is the only way to set computed
fields on a frozen dataclass in `__post_init__`.

</details>

---

## Final Check

| Feature | What to test |
|---|---|
| `@dataclass` generates `__repr__` | `repr(TaskEvent(...))` shows all fields |
| `@dataclass` generates `__eq__` | Two instances with same values are `==` |
| `field(default_factory=list)` | Two instances don't share the same list |
| `frozen=True` blocks mutation | `FrozenInstanceError` on assignment |
| `frozen=True` enables hashing | Instance can be added to a `set` |
| `__post_init__` validates | Empty title raises `ValueError` |
| `field(init=False)` for computed | `tag_count` not in constructor signature |

---

## Quick Check Answers

**1. `tags: list[str] = []` — why does Python raise an error?**

If this were allowed, all instances would share the same list object. When `Task()` is
called and `tags` is not passed, Python would use the DEFAULT `[]` — but that is ONE
specific list object created when the class was defined. Every instance would have the
same `tags` list. Appending to one instance's tags would appear in all other instances.
Python catches this at class definition time because it is always a bug. The fix:
`tags: list[str] = field(default_factory=list)` — calls `list()` freshly for each instance.

**2. Which parameter makes a dataclass immutable?**

`@dataclass(frozen=True)`. Every attribute assignment after construction raises
`FrozenInstanceError`. Python also automatically generates `__hash__` based on all
fields, making instances usable in `set` and as `dict` keys.

**3. `frozen=True` blocks `self.computed_field = value` in `__post_init__`. Workaround?**

`object.__setattr__(self, 'field_name', value)`. This calls the base `object` class's
`__setattr__` directly, bypassing the frozen dataclass's override that would raise
`FrozenInstanceError`. Use it only in `__post_init__` for computed fields — not as a
general way to mutate frozen instances (which defeats the purpose of `frozen=True`).
