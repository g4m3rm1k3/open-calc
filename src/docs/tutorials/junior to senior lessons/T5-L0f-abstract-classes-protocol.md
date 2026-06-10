# Junior to Senior — T5·L0f — Abstract Classes and Protocol

**Prerequisites:** T5·L0e (`@dataclass`). You can write Python data classes.
This lesson covers the two ways Python expresses interfaces: `ABC` (nominal typing,
requiring inheritance) and `Protocol` (structural typing, requiring only the right shape).

**What this lab adds:**
- `ABC` + `@abstractmethod`: subclasses MUST implement the method, or they cannot be instantiated
- `Protocol`: any class with the right methods satisfies it — no inheritance required
- When to use `ABC` vs `Protocol` — the concrete tradeoff
- `@runtime_checkable`: allowing `isinstance` checks against a Protocol
- Building the task repository with both approaches

**Time:** 45–60 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. You define `class Storage(ABC)` with `@abstractmethod save(item)`. What happens
>    if you try `Storage()`?
> 2. A third-party library returns objects with a `.save()` method. You want to
>    use them alongside your own classes. With ABC, what do you need from the library?
>    With Protocol, what do you need?
> 3. TypeScript uses `interface` for structural typing — a class satisfies an interface
>    if it has the right shape. Which Python feature works the same way?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

A `TaskRepository` interface defined two ways, with a `FakeTaskRepository` that
satisfies both:

```python
# ABC approach — explicit inheritance required:
class FakeTaskRepository(AbstractTaskRepository):
    ...

# Protocol approach — no inheritance needed:
def process_tasks(repo: TaskRepositoryProtocol) -> None:
    for task in repo.list_all():
        ...
# Any class with the right methods works — no inheritance required.
```

---

### Concept: The Problem ABC and Protocol Both Solve

**What it is:** Both `ABC` and `Protocol` let you write code that depends on a
behaviour (what an object can do) rather than a specific class (what an object IS).
This is the Dependency Inversion Principle — depend on abstractions, not concretions.

**The problem before:**

```python
def send_welcome_email(user_repo: SqlAlchemyUserRepository):
    # ↑ This function ONLY works with SqlAlchemy.
    # Changing to MongoDB? Rewrite every function that takes a repo.
    # Testing? Must use SQLAlchemy — slow, needs a database.
    user = user_repo.find_by_email(email)
    ...
```

**The solution (both ABC and Protocol get you here):**

```python
def send_welcome_email(user_repo: UserRepository):
    # ↑ Works with ANY class that has the right methods.
    # SQLAlchemy, MongoDB, in-memory fake — all work.
    user = user_repo.find_by_email(email)
    ...
```

**What it hides (for ABC):** The implementation details. Callers see `AbstractTaskRepository`
and know they can call `save()`, `get_by_id()`, etc. — without knowing whether it's
SQLAlchemy, MongoDB, or an in-memory fake.

**What it hides (for Protocol):** Even the inheritance requirement. The protocol checks
the shape — "does this object have the right methods?" — without caring about class ancestry.

---

### Concept: `ABC` — Nominal Typing With Enforcement

**What it is:** `ABC` (Abstract Base Class) defines a contract through explicit inheritance.
`@abstractmethod` marks methods that subclasses MUST implement. Trying to instantiate a
class that hasn't implemented all abstract methods raises `TypeError`.

**The problem before (duck typing with no enforcement):**

```python
class TaskRepository:
    def save(self, task):
        raise NotImplementedError   # only errors at runtime, not at class definition time

class BrokenRepository(TaskRepository):
    pass   # forgot to implement save() — no error until someone calls .save()

repo = BrokenRepository()   # no error — bad!
repo.save(task)              # → NotImplementedError — only fails when called
```

**The solution:**

```python
from abc import ABC, abstractmethod

class AbstractTaskRepository(ABC):
    @abstractmethod
    def save(self, task) -> None: ...

    @abstractmethod
    def get_by_id(self, task_id: str):  ...

class BrokenRepository(AbstractTaskRepository):
    pass   # forgot to implement save() and get_by_id()

repo = BrokenRepository()   # → TypeError: Can't instantiate abstract class BrokenRepository
                              #   with abstract methods get_by_id, save
# Fails IMMEDIATELY — before any method is ever called
```

**What it hides:** The incompleteness check. Instead of finding missing methods at
runtime when a method is called, the `ABC` mechanism catches it at instantiation time —
before any code can run.

**The invariant ABC protects:** Every instance of a concrete subclass has ALL abstract
methods implemented. This is guaranteed at instantiation, not at call time.

**Canonical example:** A building permit. An abstract "Contractor" ABC requires that
all contractors provide `build()` and `inspect()`. A contractor who hasn't passed the
inspection for these cannot be licensed (instantiated). The city (Python) checks the
permit before allowing work to start.

**Project application:** `AbstractTaskRepository` guarantees that any class claiming
to be a task repository can `save`, `get_by_id`, `list_all`, and `delete`.

**Smallest possible example:**

```python
from abc import ABC, abstractmethod

class Shape(ABC):
    @abstractmethod
    def area(self) -> float: ...

class Circle(Shape):
    def __init__(self, radius: float) -> None:
        self.radius = radius

    def area(self) -> float:
        import math
        return math.pi * self.radius ** 2

Shape()     # → TypeError: Can't instantiate abstract class Shape with abstract method area
Circle(5)   # → works — area() is implemented
```

**You will see this again in:**
- SQLAlchemy: `DeclarativeBase` is an ABC (sort of) — `__tablename__` is required
- Python standard library: `collections.abc.Sequence`, `collections.abc.Mapping`
- Every framework repository pattern: `UserRepository(ABC)` with abstract CRUD methods
- TypeScript: `abstract class` works identically

**Watch for:** ABCs also support concrete methods. `AbstractTaskRepository` can have a
`exists(id)` method that calls `get_by_id(id) is not None` — subclasses inherit this
for free. Not everything has to be abstract.

---

## Step 1 — Define `AbstractTaskRepository`

Create `src/domain/repositories.py`:

```python
# src/domain/repositories.py
from abc import ABC, abstractmethod
from src.domain.task import Task


class AbstractTaskRepository(ABC):
    """
    The task storage contract. Any class claiming to be a task repository
    must implement all these methods.
    """

    @abstractmethod
    def save(self, task: Task) -> Task: ...         # returns the saved task (may have DB-assigned id)

    @abstractmethod
    def get_by_id(self, task_id: str) -> Task | None: ...

    @abstractmethod
    def list_all(self) -> list[Task]: ...

    @abstractmethod
    def delete(self, task_id: str) -> bool: ...    # True if deleted, False if not found

    # Concrete method — all subclasses inherit this for free:
    def exists(self, task_id: str) -> bool:
        return self.get_by_id(task_id) is not None
```

### SAVE AND TRY

```bash
python -c "
from src.domain.repositories import AbstractTaskRepository

# Try to instantiate the abstract class:
AbstractTaskRepository()
"
```

**You should see:**
```
TypeError: Can't instantiate abstract class AbstractTaskRepository with abstract methods delete, get_by_id, list_all, save
```

```bash
python -c "
from src.domain.repositories import AbstractTaskRepository
from src.domain.task import Task

# A class that forgets to implement 'delete':
class IncompleteRepo(AbstractTaskRepository):
    def save(self, task): return task
    def get_by_id(self, id): return None
    def list_all(self): return []
    # delete is missing

IncompleteRepo()
"
```

**Expected:** `TypeError: Can't instantiate abstract class IncompleteRepo with abstract method delete`

---

### Concept: `Protocol` — Structural Typing

**What it is:** A `Protocol` (from `typing`) defines what methods an object must
have — without requiring inheritance. Any class with the right methods satisfies
the protocol, whether or not it inherits from it.

**The problem with ABC for third-party code:**

```python
class AbstractTaskRepository(ABC):
    @abstractmethod
    def save(self, task): ...

# A third-party library's repository class:
class LibraryTaskStorage:        # from some library you don't control
    def save(self, task): ...    # has the method!
    def get_by_id(self, id): ... # has the method!
    def list_all(self): ...
    def delete(self, id): ...

# But it doesn't inherit from AbstractTaskRepository.
# Python sees no relationship.
isinstance(LibraryTaskStorage(), AbstractTaskRepository)   # → False
def process(repo: AbstractTaskRepository) -> None: ...
process(LibraryTaskStorage())   # type checker: error — not a AbstractTaskRepository
```

With ABC, you would need to modify `LibraryTaskStorage` to inherit from your
`AbstractTaskRepository`. But you don't control library code.

**The solution — Protocol:**

```python
from typing import Protocol

class TaskRepositoryProtocol(Protocol):
    def save(self, task) -> Task: ...
    def get_by_id(self, id: str) -> Task | None: ...
    def list_all(self) -> list[Task]: ...
    def delete(self, id: str) -> bool: ...

# LibraryTaskStorage already has all these methods — it satisfies the Protocol.
# No inheritance required. The type checker accepts it.

def process(repo: TaskRepositoryProtocol) -> None:   # ← Protocol as type hint
    tasks = repo.list_all()   # type checker: safe — Protocol guarantees list_all exists
```

**What it hides:** The inheritance hierarchy. Protocol checks the object's shape
(what methods it has) rather than its ancestry (what it inherits from). This is
Python's version of "duck typing with type-checker support."

**Canonical example:** A restaurant accepts any chef who can `cook(meal)`, `plate(meal)`,
and `garnish(meal)`. They don't require chefs to have a specific culinary school pedigree
(ABC/inheritance). If you can do the job, you're hired. Protocol is the job description;
ABC is the diploma requirement.

**Project application:** `TaskRepositoryProtocol` lets the FastAPI route handlers accept
any repository class — including third-party implementations and test fakes — without
requiring them to inherit from a base class.

**Smallest possible example:**

```python
from typing import Protocol

class Drawable(Protocol):
    def draw(self) -> None: ...   # any class with draw() satisfies this

class Circle:
    def draw(self) -> None:       # no inheritance from Drawable
        print('drawing a circle')

def render(shape: Drawable) -> None:
    shape.draw()   # type checker: safe — Drawable guarantees draw() exists

render(Circle())   # works — Circle has draw()
```

**You will see this again in:**
- Python standard library: `typing.Iterable`, `typing.Callable`, `typing.Awaitable` are all protocols
- FastAPI: uses `Protocol` internally for request/response types
- TypeScript `interface` is structural (protocol-style) — this is the Python equivalent
- Go's implicit interfaces work the same way as Protocol

**Watch for:** Protocol methods are not real abstract methods — no error if you
instantiate a class that doesn't implement them. Protocol enforcement is static (type
checkers like mypy). For runtime enforcement, use `@runtime_checkable`.

---

### Concept: `@runtime_checkable` — `isinstance` With Protocol

**What it is:** Adding `@runtime_checkable` to a Protocol allows `isinstance` checks
at runtime. Without it, `isinstance` raises `TypeError`.

**The problem before:**

```python
from typing import Protocol

class TaskRepositoryProtocol(Protocol):
    def save(self, task): ...

repo = FakeTaskRepository()
isinstance(repo, TaskRepositoryProtocol)   # → TypeError: Protocols with non-method members don't support issubclass
```

**The solution:**

```python
from typing import Protocol, runtime_checkable

@runtime_checkable
class TaskRepositoryProtocol(Protocol):
    def save(self, task): ...

isinstance(repo, TaskRepositoryProtocol)   # → True if repo has save()
```

**What it hides:** The method presence check. `isinstance(obj, Protocol)` checks
that `obj` has all the methods defined in `Protocol`. It does NOT check signatures —
only method presence.

**Smallest possible example:**

```python
from typing import Protocol, runtime_checkable

@runtime_checkable
class Printable(Protocol):
    def print_info(self) -> None: ...

class Document:
    def print_info(self) -> None:
        print('Document info')

isinstance(Document(), Printable)   # → True
isinstance('a string', Printable)  # → False
```

**You will see this again in:**
- Testing: `assert isinstance(repo, TaskRepositoryProtocol)` to confirm a fake satisfies the protocol
- Framework internals that check method presence at runtime

**Watch for:** `@runtime_checkable` only checks method NAMES, not signatures.
A class with `def save(x, y, z): ...` still satisfies a protocol requiring `def save(task): ...`.
For full signature checking, use mypy or pyright — not `isinstance`.

---

## Step 2 — Add `TaskRepositoryProtocol`

Add to `src/domain/repositories.py`:

```python
# src/domain/repositories.py
from abc import ABC, abstractmethod
from typing import Protocol, runtime_checkable   # ← add this import
from src.domain.task import Task


class AbstractTaskRepository(ABC):
    # ... (existing code above) ...


@runtime_checkable                              # ← add this decorator
class TaskRepositoryProtocol(Protocol):
    """The task storage contract — structural typing (no inheritance required)."""

    def save(self, task: Task) -> Task: ...
    def get_by_id(self, task_id: str) -> Task | None: ...
    def list_all(self) -> list[Task]: ...
    def delete(self, task_id: str) -> bool: ...
```

---

## Step 3 — Build `FakeTaskRepository` Using ABC

Create `src/infrastructure/fake_task_repository.py`:

```python
# src/infrastructure/fake_task_repository.py
from src.domain.task         import Task
from src.domain.repositories import AbstractTaskRepository


class FakeTaskRepository(AbstractTaskRepository):
    """In-memory repository for tests. Inherits from the ABC."""

    def __init__(self) -> None:
        self._store: dict[str, Task] = {}
        self._next_id = 1

    def save(self, task: Task) -> Task:
        # Assign an id if the task doesn't have one yet:
        if not hasattr(task, '_id'):
            task._id = str(self._next_id)    # type: ignore[attr-defined]
            self._next_id += 1
        self._store[task._id] = task         # type: ignore[attr-defined]
        return task

    def get_by_id(self, task_id: str) -> Task | None:
        return self._store.get(task_id)

    def list_all(self) -> list[Task]:
        return list(self._store.values())

    def delete(self, task_id: str) -> bool:
        if task_id in self._store:
            del self._store[task_id]
            return True
        return False
```

### SAVE AND TRY

```bash
python -c "
from src.domain.repositories import AbstractTaskRepository, TaskRepositoryProtocol
from src.infrastructure.fake_task_repository import FakeTaskRepository
from src.domain.task import Task

repo = FakeTaskRepository()

# ABC check:
print(isinstance(repo, AbstractTaskRepository))  # True — inherits from it

# Protocol check:
print(isinstance(repo, TaskRepositoryProtocol))  # True — has all the methods

# concrete exists() method is inherited:
task = Task('Write tests')
repo.save(task)
print(repo.exists(task._id))     # True (inherited from AbstractTaskRepository)
print(repo.exists('nonexistent')) # False
"
```

**You should see:**
```
True
True
True
False
```

---

## Step 4 — Write the Tests

Create `tests/test_repositories.py`:

```python
# tests/test_repositories.py
import pytest
from src.domain.repositories              import AbstractTaskRepository, TaskRepositoryProtocol
from src.infrastructure.fake_task_repository import FakeTaskRepository
from src.domain.task import Task


class TestAbstractTaskRepository:

    def test_cannot_instantiate_abstract_repository(self) -> None:
        with pytest.raises(TypeError):
            AbstractTaskRepository()   # type: ignore[abstract]

    def test_concrete_subclass_can_be_instantiated(self) -> None:
        repo = FakeTaskRepository()
        assert isinstance(repo, AbstractTaskRepository)

    def test_exists_method_is_inherited(self) -> None:
        repo = FakeTaskRepository()
        task = repo.save(Task('Write tests'))
        assert repo.exists(task._id) is True    # type: ignore[attr-defined]

    def test_exists_returns_false_for_unknown_id(self) -> None:
        repo = FakeTaskRepository()
        assert repo.exists('nonexistent') is False


class TestProtocol:

    def test_fake_repo_satisfies_protocol(self) -> None:
        repo = FakeTaskRepository()
        assert isinstance(repo, TaskRepositoryProtocol)

    def test_class_without_inheritance_satisfies_protocol(self) -> None:
        """Protocol does not require inheritance — just the right methods."""
        class MinimalRepo:
            def save(self, task: Task) -> Task: return task
            def get_by_id(self, id: str): return None
            def list_all(self): return []
            def delete(self, id: str) -> bool: return False

        assert isinstance(MinimalRepo(), TaskRepositoryProtocol)

    def test_class_missing_method_fails_protocol(self) -> None:
        class Incomplete:
            def save(self, task: Task) -> Task: return task
            def get_by_id(self, id: str): return None
            def list_all(self): return []
            # delete is missing

        assert not isinstance(Incomplete(), TaskRepositoryProtocol)


class TestFakeTaskRepository:

    def test_save_and_retrieve_by_id(self) -> None:
        repo = FakeTaskRepository()
        task = Task('Write tests')
        saved = repo.save(task)
        assert repo.get_by_id(saved._id) is saved    # type: ignore[attr-defined]

    def test_get_by_id_returns_none_for_unknown(self) -> None:
        repo = FakeTaskRepository()
        assert repo.get_by_id('nonexistent') is None

    def test_list_all_returns_all_saved_tasks(self) -> None:
        repo = FakeTaskRepository()
        repo.save(Task('A'))
        repo.save(Task('B'))
        assert len(repo.list_all()) == 2

    def test_delete_removes_task_and_returns_true(self) -> None:
        repo  = FakeTaskRepository()
        task  = repo.save(Task('Write tests'))
        result = repo.delete(task._id)               # type: ignore[attr-defined]
        assert result is True
        assert repo.get_by_id(task._id) is None      # type: ignore[attr-defined]

    def test_delete_returns_false_for_unknown_id(self) -> None:
        repo = FakeTaskRepository()
        assert repo.delete('nonexistent') is False
```

### SAVE AND TRY

```bash
pytest tests/test_repositories.py -v
```

**You should see:**
```
tests/test_repositories.py::TestAbstractTaskRepository::test_cannot_instantiate_abstract_repository PASSED
...
tests/test_repositories.py::TestFakeTaskRepository::test_delete_returns_false_for_unknown_id PASSED

11 passed
```

**Change something:** Remove `delete` from `FakeTaskRepository` (don't delete the class —
just remove the `delete` method). Rerun. Expected: the instantiation of `FakeTaskRepository`
raises `TypeError` — the ABC catches the missing method immediately.

---

## 🎯 Challenge: Add a `NotificationSender` Protocol

**You know:** `Protocol`, `@runtime_checkable`, concrete implementations.

**Task:** Define a `NotificationSender` protocol and two implementations:
1. `LoggingNotificationSender` — logs to Python's `logging` module
2. `FakeNotificationSender` — records sent messages for test assertions

```python
@runtime_checkable
class NotificationSender(Protocol):
    def send(self, recipient: str, subject: str, body: str) -> bool: ...
```

Write 3 tests before implementing both classes.

---

<details>
<summary>▶ Show Solution</summary>

```python
# notification_sender.py
from typing import Protocol, runtime_checkable
import logging

logger = logging.getLogger(__name__)


@runtime_checkable
class NotificationSender(Protocol):
    def send(self, recipient: str, subject: str, body: str) -> bool: ...


class LoggingNotificationSender:
    """Production implementation — logs via Python's logging."""
    def send(self, recipient: str, subject: str, body: str) -> bool:
        logger.info('Notification to %s: %s', recipient, subject)
        return True


class FakeNotificationSender:
    """Test implementation — records all sent messages."""
    def __init__(self) -> None:
        self._sent: list[dict] = []

    def send(self, recipient: str, subject: str, body: str) -> bool:
        self._sent.append({'recipient': recipient, 'subject': subject, 'body': body})
        return True

    def get_sent(self) -> list[dict]:
        return list(self._sent)
```

**Tests:**
```python
def test_logging_sender_satisfies_protocol() -> None:
    assert isinstance(LoggingNotificationSender(), NotificationSender)

def test_fake_sender_records_sent_messages() -> None:
    sender = FakeNotificationSender()
    sender.send('alice@e.com', 'Hello', 'Body text')
    assert len(sender.get_sent()) == 1
    assert sender.get_sent()[0]['recipient'] == 'alice@e.com'

def test_object_without_send_fails_protocol() -> None:
    class NullSender:
        pass
    assert not isinstance(NullSender(), NotificationSender)
```

</details>

---

## Final Check

| | ABC | Protocol |
|---|---|---|
| Inheritance required | Yes | No |
| `isinstance` at runtime | Always works | Only with `@runtime_checkable` |
| Catches missing methods | At instantiation | At type-check time (mypy) |
| Concrete base methods | Yes (`exists()`) | No |
| Best for | Your own class hierarchy | Third-party or loose coupling |

---

## Quick Check Answers

**1. `class Storage(ABC)` with `@abstractmethod save()`. Try `Storage()` — what happens?**

`TypeError: Can't instantiate abstract class Storage with abstract method save`. Python
checks at instantiation time that all `@abstractmethod` methods are implemented by the
concrete class. The abstract class itself cannot be instantiated because it has
unimplemented methods. This error appears before any method is called — as early as possible.

**2. Third-party library class with the right methods. ABC requirement vs Protocol requirement?**

With ABC: the library class must inherit from your `AbstractTaskRepository`. Since
you don't control library code, you would need to create a wrapper or adapter that
inherits from your ABC and delegates to the library class. With Protocol: nothing.
The library class already has the right methods — the type checker sees it as compatible.
No code changes required to the library.

**3. TypeScript `interface` vs Python's structural typing equivalent?**

`Protocol` (from `typing`). TypeScript interfaces are structural — a class satisfies
an interface if it has the right methods, regardless of explicit `implements` declarations.
Python's `Protocol` works identically. Python's `ABC` is closer to TypeScript's
`abstract class` — both require explicit inheritance.
