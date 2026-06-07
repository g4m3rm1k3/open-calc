# 🧱 The Complete Python Software Patterns Guide
## From Messy Code to Maintainable Systems — Everything You Need to Know

> **How to use this guide:** Each pattern shows you the *problem first*, then the solution, then how it connects to a real system. Run every example. Break things. Ask yourself "what goes wrong if I skip this?" — that question is how patterns stick.

---

## Table of Contents

- [What Are Patterns?](#what-are-patterns)
- [The System We're Building](#the-system-were-building)
- [Part 1 — Structuring Data](#part-1--structuring-data)
  - [1. Rich Domain Model vs Anemic Model](#1-rich-domain-model-vs-anemic-model)
  - [2. Value Objects](#2-value-objects)
  - [3. Immutability](#3-immutability)
- [Part 2 — Structuring Storage](#part-2--structuring-storage)
  - [4. Repository Pattern](#4-repository-pattern)
  - [5. Unit of Work](#5-unit-of-work)
- [Part 3 — Structuring Logic](#part-3--structuring-logic)
  - [6. Service Layer](#6-service-layer)
  - [7. Command Pattern](#7-command-pattern)
  - [8. Strategy Pattern](#8-strategy-pattern)
- [Part 4 — Structuring Communication](#part-4--structuring-communication)
  - [9. Observer / Event System](#9-observer--event-system)
  - [10. Dependency Injection](#10-dependency-injection)
  - [11. Facade Pattern](#11-facade-pattern)
- [Part 5 — Structuring Failure](#part-5--structuring-failure)
  - [12. Guard Clauses / Fail Fast](#12-guard-clauses--fail-fast)
  - [13. Result Type](#13-result-type)
  - [14. Validation Objects](#14-validation-objects)
- [Part 6 — Putting It All Together](#part-6--putting-it-all-together)
- [Summary Table](#summary-table)

---

## What Are Patterns?

A pattern is not a piece of code you copy. It is a *named solution to a recurring problem*. The name matters almost as much as the solution — once you know "this is a Repository" or "this is a Strategy", you can communicate entire ideas to other developers in one word.

But this guide goes beyond named patterns. Experienced engineers carry dozens of *unnamed* habits: where to put validation, how to handle failure, when to use a class vs a function, how to keep things from coupling together. Those habits are what this guide is really teaching.

**The three questions every pattern answers:**

1. What *problem* does this solve?
2. What does it *look like* in code?
3. What *breaks* if you skip it?

---

## The System We're Building

Every pattern in this guide connects to the same application: a **Task Manager**. Simple enough to understand completely, real enough that the patterns genuinely matter.

The system will manage tasks with titles, statuses, priorities, and due dates. Users can create, update, complete, and delete tasks. As we add each pattern, the system gets more structured — without getting more complicated to use.

By the end you will have seen every layer of a real backend system: domain, storage, logic, communication, and error handling.

---

## Part 1 — Structuring Data

---

### 1. Rich Domain Model vs Anemic Model

#### The Problem

The most common beginner mistake in OOP is writing objects that are just bags of data — fields with no behavior. All the logic ends up scattered in functions outside the class. This is called an **Anemic Domain Model**, and it leads to the same logic being duplicated in multiple places, and no single location where the rules actually live.

```python
# ============================================================
# THE ANEMIC MODEL — What most beginners write
# ============================================================
# The object is just a container. Logic lives outside it.
# This seems fine at first. It causes problems at scale.

class Task:
    def __init__(self, id, title, status, priority):
        self.id = id
        self.title = title
        self.status = status   # just a string: "todo", "done", etc.
        self.priority = priority

# All the "rules" end up scattered in random functions:

def complete_task(task):
    task.status = "done"      # No rule preventing re-completion

def start_task(task):
    task.status = "in_progress"  # No check that it was "todo" first

def is_overdue(task, due_date):
    from datetime import datetime
    return datetime.now() > due_date and task.status != "done"


# What goes wrong:
t = Task("1", "Buy milk", "todo", "high")
complete_task(t)
complete_task(t)  # Works. No error. Double-completing is allowed.
start_task(t)     # Works. We just "un-completed" a done task.
                  # The object had no opinion about any of this.
```

```python
# ============================================================
# THE RICH DOMAIN MODEL — What experienced engineers write
# ============================================================
# The object owns its own rules. You can't put it in a bad state
# without it telling you.

from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from typing import Optional


class TaskStatus(Enum):
    TODO        = "todo"
    IN_PROGRESS = "in_progress"
    DONE        = "done"


class Priority(Enum):
    LOW    = 1
    MEDIUM = 2
    HIGH   = 3


@dataclass
class Task:
    id:         str
    title:      str
    status:     TaskStatus = TaskStatus.TODO
    priority:   Priority   = Priority.MEDIUM
    created_at: datetime   = field(default_factory=datetime.now)
    due_date:   Optional[datetime] = None

    # ---- BEHAVIOR — the rules live HERE, on the object ----

    def start(self):
        """Move task to in-progress. Only valid from TODO."""
        if self.status != TaskStatus.TODO:
            raise ValueError(
                f"Cannot start a task that is already '{self.status.value}'. "
                f"Only TODO tasks can be started."
            )
        self.status = TaskStatus.IN_PROGRESS

    def complete(self):
        """Mark task as done. Can't complete an already-done task."""
        if self.status == TaskStatus.DONE:
            raise ValueError("Task is already complete.")
        self.status = TaskStatus.DONE

    def reprioritize(self, new_priority: Priority):
        """Change priority. Can't reprioritize a completed task."""
        if self.status == TaskStatus.DONE:
            raise ValueError("Cannot change priority of a completed task.")
        self.priority = new_priority

    @property
    def is_overdue(self) -> bool:
        """The rule for 'overdue' lives here, not in some utility function."""
        if self.due_date is None:
            return False
        return datetime.now() > self.due_date and self.status != TaskStatus.DONE

    @property
    def is_active(self) -> bool:
        return self.status in (TaskStatus.TODO, TaskStatus.IN_PROGRESS)

    def __str__(self):
        overdue = " [OVERDUE]" if self.is_overdue else ""
        return f"[{self.status.value.upper()}] {self.title} ({self.priority.name}){overdue}"


# ---- What this gives you ----

task = Task(id="1", title="Buy milk")

task.start()
print(task)   # [IN_PROGRESS] Buy milk (MEDIUM)

task.complete()
print(task)   # [DONE] Buy milk (MEDIUM)

# Try to break the rules:
try:
    task.complete()   # Already done
except ValueError as e:
    print(f"Caught: {e}")
    # Caught: Task is already complete.

try:
    task.start()      # Done tasks can't go backward
except ValueError as e:
    print(f"Caught: {e}")
    # Caught: Cannot start a task that is already 'done'.

# The object protects its own state. It's impossible to put it
# in an invalid state without Python raising an error.
```

#### Why This Matters

With an anemic model, you will eventually find the same rule written in three different places — in the API handler, in the background job, and in the test helper. When the rule changes, you update two of them and forget the third. With a rich model, the rule has exactly one home.

**The test is also simpler:**

```python
# You can test business rules with zero infrastructure:
task = Task(id="x", title="Test")
task.start()
task.complete()
assert task.status == TaskStatus.DONE

# No database. No server. No setup. Just Python.
```

---

### 2. Value Objects

#### The Problem

Primitive values like strings and numbers carry no meaning by themselves. When you pass a `str` called `email` around, nothing stops someone from passing a phone number where an email is expected. When you compute a `float` called `amount`, nothing tracks whether it's dollars or euros. This is called **Primitive Obsession**.

```python
# ============================================================
# PRIMITIVE OBSESSION — The problem
# ============================================================

def send_invoice(email: str, amount: float, currency: str):
    pass

# All of these "work" from Python's perspective:
send_invoice("not-an-email", 100.0, "USD")   # Bad email, no error
send_invoice("bob@co.com", -50.0, "USD")      # Negative amount, no error
send_invoice("bob@co.com", 100.0, "ZIMBABWEAN_DOLLHAIRS")  # Fake currency, no error

# The function receives three meaningless primitives.
# It has to do all validation itself, every time.
```

```python
# ============================================================
# VALUE OBJECTS — The solution
# ============================================================
# A Value Object is a small class that:
# - Wraps a primitive and gives it meaning
# - Validates on creation — you can't have an invalid one
# - Is IMMUTABLE — you don't change it, you create a new one
# - Compares by VALUE, not identity (two Emails with the same
#   address are equal, just like two ints with value 5 are equal)

import re
from dataclasses import dataclass


@dataclass(frozen=True)   # frozen=True makes it immutable
class Email:
    """An email address. Always valid — can't be created invalid."""
    value: str

    def __post_init__(self):
        # Validation happens at construction time
        pattern = r'^[\w\.-]+@[\w\.-]+\.\w{2,}$'
        if not re.match(pattern, self.value):
            raise ValueError(f"Invalid email address: '{self.value}'")
        # frozen=True means we can't do self.value = ..., so we
        # use object.__setattr__ to set the normalized value
        object.__setattr__(self, 'value', self.value.lower().strip())

    def __str__(self):
        return self.value


@dataclass(frozen=True)
class Money:
    """A monetary amount with currency. Always non-negative."""
    amount: float
    currency: str

    def __post_init__(self):
        if self.amount < 0:
            raise ValueError(f"Money amount cannot be negative: {self.amount}")
        valid_currencies = {"USD", "EUR", "GBP", "CAD"}
        if self.currency not in valid_currencies:
            raise ValueError(f"Unknown currency: '{self.currency}'")

    def add(self, other: "Money") -> "Money":
        """Adding money returns NEW money — we don't mutate."""
        if self.currency != other.currency:
            raise ValueError(
                f"Cannot add {self.currency} and {other.currency}"
            )
        return Money(self.amount + other.amount, self.currency)

    def __str__(self):
        return f"{self.currency} {self.amount:.2f}"


@dataclass(frozen=True)
class TaskTitle:
    """A task title. Always non-empty, always trimmed, max 200 chars."""
    value: str

    def __post_init__(self):
        cleaned = self.value.strip()
        if not cleaned:
            raise ValueError("Task title cannot be empty.")
        if len(cleaned) > 200:
            raise ValueError(f"Task title too long ({len(cleaned)} chars, max 200).")
        object.__setattr__(self, 'value', cleaned)

    def __str__(self):
        return self.value


# ---- What this gives you ----

# These fail immediately — invalid objects can't exist
try:
    e = Email("not-an-email")
except ValueError as e:
    print(f"Caught: {e}")   # Caught: Invalid email address: 'not-an-email'

try:
    m = Money(-100, "USD")
except ValueError as e:
    print(f"Caught: {e}")   # Caught: Money amount cannot be negative: -100

# These work fine
e = Email("Bob@Company.COM")
print(e)           # bob@company.com  (normalized)
print(e.value)     # bob@company.com

m1 = Money(50.00, "USD")
m2 = Money(25.00, "USD")
m3 = m1.add(m2)
print(m3)          # USD 75.00
print(m1)          # USD 50.00  — unchanged (immutable)

# Value comparison works naturally (frozen dataclass handles __eq__)
print(Email("alice@co.com") == Email("alice@co.com"))   # True
print(Email("alice@co.com") == Email("bob@co.com"))     # False

# Now our Task can use these:
@dataclass
class Task:
    id:    str
    title: TaskTitle    # Can't have a bad title
    # ...

task = Task(id="1", title=TaskTitle("  Buy milk  "))
print(task.title)   # Buy milk  (trimmed automatically)

try:
    Task(id="2", title=TaskTitle(""))  # Empty title
except ValueError as e:
    print(f"Caught: {e}")   # Caught: Task title cannot be empty.
```

#### The Key Insight

Value Objects shift validation *earlier*. Instead of checking "is this email valid?" in every function that receives one, you check once at creation. After that, if you have an `Email` object, you know it's valid. The type itself is the guarantee.

---

### 3. Immutability

#### The Problem

Mutable shared state is one of the most common sources of bugs. When multiple parts of your code can change the same object, the question "who changed this, and when?" becomes very hard to answer.

```python
# ============================================================
# MUTABLE STATE — The bug this creates
# ============================================================

from dataclasses import dataclass
from typing import List


@dataclass
class TaskList:
    tasks: List[str]   # A mutable list


my_list = TaskList(tasks=["buy milk", "walk dog"])

def process(task_list: TaskList):
    # This function has no obvious reason to modify the list,
    # but it can — and does, accidentally
    for i, task in enumerate(task_list.tasks):
        task_list.tasks[i] = task.upper()  # Oops — mutated the original

process(my_list)
print(my_list.tasks)   # ['BUY MILK', 'WALK DOG']  — original is changed!

# Now imagine 'process' is called from three different places,
# and one of them starts mutating when it shouldn't. Good luck
# finding the bug.
```

```python
# ============================================================
# IMMUTABILITY PATTERNS — Three approaches
# ============================================================

# ---- APPROACH 1: frozen dataclass ----
# The simplest way. Python prevents mutation at the attribute level.

from dataclasses import dataclass, field
from typing import Tuple

@dataclass(frozen=True)
class ImmutableTask:
    id:     str
    title:  str
    status: str = "todo"

t = ImmutableTask(id="1", title="Buy milk")

try:
    t.status = "done"   # Can't do this
except Exception as e:
    print(f"Caught: {type(e).__name__}: {e}")
    # Caught: FrozenInstanceError: cannot assign to field 'status'

# To "change" an immutable object, you create a new one:
# dataclasses.replace() creates a copy with some fields changed
import dataclasses

t2 = dataclasses.replace(t, status="done")
print(t.status)    # todo  — original unchanged
print(t2.status)   # done  — new object


# ---- APPROACH 2: Return new objects from methods ----
# Methods don't change self — they return a modified copy.
# This is the pattern used by Python's str, datetime, etc.

@dataclass(frozen=True)
class Task:
    id:     str
    title:  str
    status: str = "todo"

    def complete(self) -> "Task":
        """Returns a NEW completed task. Does not change self."""
        if self.status == "done":
            raise ValueError("Already complete.")
        return dataclasses.replace(self, status="done")

    def start(self) -> "Task":
        """Returns a NEW in-progress task."""
        if self.status != "todo":
            raise ValueError("Can only start a TODO task.")
        return dataclasses.replace(self, status="in_progress")


original = Task(id="1", title="Buy milk")
started  = original.start()
done     = started.complete()

print(original.status)   # todo       — never changed
print(started.status)    # in_progress
print(done.status)       # done

# This is exactly how Python's datetime works:
from datetime import datetime, timedelta
now   = datetime.now()
later = now + timedelta(hours=1)   # now is unchanged, later is new
print(now == later)   # False — two separate objects


# ---- APPROACH 3: Immutable collections ----
# tuples instead of lists when the collection shouldn't change.

from typing import Tuple

@dataclass(frozen=True)
class TaskFilter:
    """A query for filtering tasks. Immutable — safe to pass around."""
    statuses:   Tuple[str, ...] = ("todo", "in_progress")
    priorities: Tuple[str, ...] = ("high", "medium", "low")
    max_results: int = 50

    def with_status(self, *statuses: str) -> "TaskFilter":
        """Return a filter that only matches these statuses."""
        return dataclasses.replace(self, statuses=tuple(statuses))

    def with_limit(self, n: int) -> "TaskFilter":
        return dataclasses.replace(self, max_results=n)


# Method chaining works beautifully with immutable objects
f = TaskFilter().with_status("todo").with_limit(10)
print(f.statuses)     # ('todo',)
print(f.max_results)  # 10

base_filter = TaskFilter()
high_only   = base_filter.with_status("high")
urgent      = high_only.with_limit(5)

# base_filter is unchanged — safe to reuse
print(base_filter.statuses)   # ('todo', 'in_progress')
```

#### Why This Matters

Immutable objects are **safe to share**. You can pass them between functions, store them in caches, or use them across threads without worrying about who changed what. Python's own types — `str`, `int`, `tuple`, `datetime` — are all immutable for exactly this reason.

---

## Part 2 — Structuring Storage

---

### 4. Repository Pattern

#### The Problem

When business logic reaches directly into a database, two bad things happen. First, the logic becomes untestable without a real database. Second, if you ever switch databases, you have to hunt down SQL scattered everywhere in your code.

```python
# ============================================================
# NO REPOSITORY — Logic and storage mixed together
# ============================================================

import sqlite3
from datetime import datetime


class TaskService:
    def __init__(self, db_path: str):
        self.conn = sqlite3.connect(db_path)

    def complete_task(self, task_id: str):
        # Business logic and SQL are fused together.
        # To test this, you need a real SQLite file.
        # To switch to PostgreSQL, you rewrite this entire method.
        cursor = self.conn.cursor()
        cursor.execute("SELECT status FROM tasks WHERE id = ?", (task_id,))
        row = cursor.fetchone()
        if not row:
            raise ValueError(f"Task {task_id} not found")
        if row[0] == "done":
            raise ValueError("Already complete")
        cursor.execute(
            "UPDATE tasks SET status = ?, completed_at = ? WHERE id = ?",
            ("done", datetime.now(), task_id)
        )
        self.conn.commit()
```

```python
# ============================================================
# THE REPOSITORY PATTERN — Storage hidden behind an interface
# ============================================================
# A Repository is a class that *looks like a collection* to the
# rest of your code, but handles all database operations internally.
#
# The key insight: your business logic doesn't know or care
# whether data is stored in SQLite, PostgreSQL, or a dict in memory.

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from datetime import datetime
from typing import List, Optional
import uuid


# ---- Our domain object ----

@dataclass
class Task:
    title:      str
    id:         str            = field(default_factory=lambda: str(uuid.uuid4())[:8])
    status:     str            = "todo"
    created_at: datetime       = field(default_factory=datetime.now)
    due_date:   Optional[datetime] = None

    def complete(self):
        if self.status == "done":
            raise ValueError("Already complete.")
        self.status = "done"

    def start(self):
        if self.status != "todo":
            raise ValueError("Can only start a TODO task.")
        self.status = "in_progress"


# ---- The Repository interface ----
# This is a CONTRACT. Anything that implements it can be used
# as storage — database, memory, files, a remote API.

class TaskRepository(ABC):

    @abstractmethod
    def add(self, task: Task) -> None:
        """Save a new task."""
        pass

    @abstractmethod
    def get(self, task_id: str) -> Optional[Task]:
        """Find a task by ID. Returns None if not found."""
        pass

    @abstractmethod
    def list_all(self) -> List[Task]:
        """Return all tasks."""
        pass

    @abstractmethod
    def update(self, task: Task) -> None:
        """Persist changes to an existing task."""
        pass

    @abstractmethod
    def delete(self, task_id: str) -> None:
        """Remove a task."""
        pass

    @abstractmethod
    def find_by_status(self, status: str) -> List[Task]:
        """Return all tasks with a given status."""
        pass


# ---- In-Memory implementation (great for testing and development) ----

class InMemoryTaskRepository(TaskRepository):
    """Stores tasks in a plain dictionary. No database needed."""

    def __init__(self):
        self._store: dict = {}

    def add(self, task: Task) -> None:
        if task.id in self._store:
            raise ValueError(f"Task '{task.id}' already exists.")
        self._store[task.id] = task

    def get(self, task_id: str) -> Optional[Task]:
        return self._store.get(task_id)

    def list_all(self) -> List[Task]:
        return list(self._store.values())

    def update(self, task: Task) -> None:
        if task.id not in self._store:
            raise ValueError(f"Task '{task.id}' not found.")
        self._store[task.id] = task

    def delete(self, task_id: str) -> None:
        if task_id not in self._store:
            raise ValueError(f"Task '{task_id}' not found.")
        del self._store[task_id]

    def find_by_status(self, status: str) -> List[Task]:
        return [t for t in self._store.values() if t.status == status]


# ---- SQLite implementation (for real storage) ----

import sqlite3
import json

class SQLiteTaskRepository(TaskRepository):
    """Stores tasks in an SQLite database."""

    def __init__(self, db_path: str = ":memory:"):
        self.conn = sqlite3.connect(db_path, check_same_thread=False)
        self._create_table()

    def _create_table(self):
        self.conn.execute("""
            CREATE TABLE IF NOT EXISTS tasks (
                id         TEXT PRIMARY KEY,
                title      TEXT NOT NULL,
                status     TEXT NOT NULL,
                created_at TEXT NOT NULL,
                due_date   TEXT
            )
        """)
        self.conn.commit()

    def _row_to_task(self, row) -> Task:
        id, title, status, created_at, due_date = row
        return Task(
            id=id,
            title=title,
            status=status,
            created_at=datetime.fromisoformat(created_at),
            due_date=datetime.fromisoformat(due_date) if due_date else None,
        )

    def add(self, task: Task) -> None:
        self.conn.execute(
            "INSERT INTO tasks VALUES (?, ?, ?, ?, ?)",
            (task.id, task.title, task.status,
             task.created_at.isoformat(),
             task.due_date.isoformat() if task.due_date else None)
        )
        self.conn.commit()

    def get(self, task_id: str) -> Optional[Task]:
        cursor = self.conn.execute(
            "SELECT * FROM tasks WHERE id = ?", (task_id,)
        )
        row = cursor.fetchone()
        return self._row_to_task(row) if row else None

    def list_all(self) -> List[Task]:
        cursor = self.conn.execute("SELECT * FROM tasks")
        return [self._row_to_task(row) for row in cursor.fetchall()]

    def update(self, task: Task) -> None:
        self.conn.execute(
            "UPDATE tasks SET title=?, status=?, due_date=? WHERE id=?",
            (task.title, task.status,
             task.due_date.isoformat() if task.due_date else None,
             task.id)
        )
        self.conn.commit()

    def delete(self, task_id: str) -> None:
        self.conn.execute("DELETE FROM tasks WHERE id = ?", (task_id,))
        self.conn.commit()

    def find_by_status(self, status: str) -> List[Task]:
        cursor = self.conn.execute(
            "SELECT * FROM tasks WHERE status = ?", (status,)
        )
        return [self._row_to_task(row) for row in cursor.fetchall()]


# ---- Using it — the business logic doesn't know which storage is used ----

def demo_repository(repo: TaskRepository):
    """This function works with ANY repository implementation."""
    t1 = Task(title="Buy milk")
    t2 = Task(title="Walk the dog")
    t3 = Task(title="Write tests")

    repo.add(t1)
    repo.add(t2)
    repo.add(t3)

    # Fetch and change
    task = repo.get(t1.id)
    task.start()
    repo.update(task)

    # Query
    in_progress = repo.find_by_status("in_progress")
    print(f"In progress: {[t.title for t in in_progress]}")

    # Works with both implementations
    print(f"All tasks: {len(repo.list_all())}")


# Swap storage with one line change:
print("=== In-Memory ===")
demo_repository(InMemoryTaskRepository())

print("=== SQLite ===")
demo_repository(SQLiteTaskRepository(":memory:"))
```

#### Why This Matters

The Repository pattern gives you:

**Testability** — use `InMemoryTaskRepository` in tests. No database setup, no cleanup, full speed.

**Replaceability** — want to switch from SQLite to PostgreSQL? Write a `PostgreSQLTaskRepository` and change one line where you wire it up. Nothing else changes.

**A clean boundary** — your business logic never sees a SQL query or a database cursor. It only sees Python objects.

---

### 5. Unit of Work

#### The Problem

When an operation involves multiple changes — add a task, update a counter, write a log entry — what happens if step two fails? You have a partial update, and your data is now inconsistent.

```python
# ============================================================
# THE PROBLEM — Partial updates leave bad state
# ============================================================

repo = InMemoryTaskRepository()

def transfer_task(from_list_id, to_list_id, task_id, repo):
    task = repo.get(task_id)
    # Step 1: remove from source
    repo.delete(task_id)
    # --- Something goes wrong here ---
    raise RuntimeError("Network error!")
    # Step 2: add to destination — NEVER RUNS
    # The task is now deleted from source and not in destination.
    # It's gone. Data is inconsistent.
    repo.add(task)
```

```python
# ============================================================
# UNIT OF WORK — All changes succeed together, or none do
# ============================================================
# The Unit of Work pattern collects all changes made during
# an operation and either commits them all at once, or rolls
# back all of them if something goes wrong.

from typing import List, Dict


class UnitOfWork:
    """
    Tracks all changes made during a business operation.
    Either commits all of them (commit) or discards all of them (rollback).

    Works with our InMemoryTaskRepository by wrapping it.
    """

    def __init__(self, repo: TaskRepository):
        self._repo = repo
        self._new:     List[Task] = []
        self._updated: List[Task] = []
        self._deleted: List[str]  = []

    def register_new(self, task: Task):
        """Track a task to be added."""
        self._new.append(task)

    def register_updated(self, task: Task):
        """Track a task to be updated."""
        self._updated.append(task)

    def register_deleted(self, task_id: str):
        """Track a task to be deleted."""
        self._deleted.append(task_id)

    def commit(self):
        """Apply all tracked changes. If any step fails, raise and do nothing."""
        # In a real database this would be a transaction.
        # Here we simulate all-or-nothing by doing everything at once.
        try:
            for task in self._new:
                self._repo.add(task)
            for task in self._updated:
                self._repo.update(task)
            for task_id in self._deleted:
                self._repo.delete(task_id)
        except Exception:
            # In production: issue ROLLBACK to the database
            self._clear()
            raise

        self._clear()

    def rollback(self):
        """Discard all tracked changes without applying them."""
        self._clear()
        print("All changes rolled back.")

    def _clear(self):
        self._new.clear()
        self._updated.clear()
        self._deleted.clear()


# ---- Context manager version — cleaner to use ----
# The 'with' statement auto-commits on success, auto-rolls-back on error.

class ManagedUnitOfWork:
    """Unit of Work as a context manager."""

    def __init__(self, repo: TaskRepository):
        self._repo = repo
        self._uow  = UnitOfWork(repo)

    def __enter__(self) -> UnitOfWork:
        return self._uow

    def __exit__(self, exc_type, exc_val, exc_tb):
        if exc_type is None:
            # No exception — commit everything
            self._uow.commit()
            print("Changes committed.")
        else:
            # An exception occurred — rollback everything
            self._uow.rollback()
        return False   # Don't suppress the exception


# ---- Using it ----

repo = InMemoryTaskRepository()
task1 = Task(title="Task A")
task2 = Task(title="Task B")
repo.add(task1)
repo.add(task2)

# SUCCESS CASE — both changes committed together
with ManagedUnitOfWork(repo) as uow:
    task1.start()
    uow.register_updated(task1)
    new_task = Task(title="Task C")
    uow.register_new(new_task)

print("After success:", [t.title for t in repo.list_all()])
# After success: ['Task A', 'Task B', 'Task C']

# FAILURE CASE — error causes rollback, nothing changes
try:
    with ManagedUnitOfWork(repo) as uow:
        task1.complete()
        uow.register_updated(task1)
        raise RuntimeError("Something went wrong mid-operation!")
        # The update to task1 is never applied
except RuntimeError:
    pass   # Expected

# task1.status might be "done" in memory, but the repo was not updated
print("task1 in repo:", repo.get(task1.id).status)   # in_progress (unchanged)
```

---

## Part 3 — Structuring Logic

---

### 6. Service Layer

#### The Problem

Without a dedicated place for business logic, it ends up in one of two wrong places: in the controller/API handler (so it can't be reused without an HTTP request), or in the domain object (which then needs to know about storage, email, and other infrastructure).

```python
# ============================================================
# WHERE LOGIC GOES WRONG — Two common mistakes
# ============================================================

# MISTAKE 1: Logic in the API handler
# Now you can't run this logic without making an HTTP request.
def api_complete_task(request):
    task_id = request.params["task_id"]
    db = get_db_connection()
    task = db.query("SELECT * FROM tasks WHERE id=?", task_id)
    if task["status"] == "done":
        return error_response("Already done")
    db.execute("UPDATE tasks SET status='done' WHERE id=?", task_id)
    send_email(task["owner_email"], "Your task is done!")
    return success_response()


# MISTAKE 2: Logic in the domain object
# Now the Task knows about databases, email, and HTTP — too much.
class Task:
    def complete(self, db_conn, email_service, notification_bus):
        self.status = "done"
        db_conn.save(self)             # Domain touching infrastructure
        email_service.send(...)        # Domain sending email
        notification_bus.publish(...)  # Domain publishing events
```

```python
# ============================================================
# THE SERVICE LAYER — The right place for business logic
# ============================================================
# A Service coordinates between:
# - The domain (Task objects and their rules)
# - The repository (storage)
# - Other services (email, notifications)
#
# It's the "use case" layer — each method is one thing the
# application can do.

from typing import Optional, List


class TaskNotFoundError(Exception):
    pass

class TaskAlreadyCompleteError(Exception):
    pass


class TaskService:
    """
    All use cases for the task manager live here.
    The API calls this. Background jobs call this. Tests call this.
    Nothing calls the repository directly except this class.
    """

    def __init__(self, repository: TaskRepository):
        # We receive the repository — we don't create it.
        # This is Dependency Injection (covered in detail soon).
        self._repo = repository

    def create_task(self, title: str, due_date: Optional[datetime] = None) -> Task:
        """Create and persist a new task."""
        task = Task(title=title.strip(), due_date=due_date)
        self._repo.add(task)
        return task

    def start_task(self, task_id: str) -> Task:
        """Move a task to in-progress."""
        task = self._get_or_raise(task_id)
        task.start()           # Domain rule enforced here
        self._repo.update(task)
        return task

    def complete_task(self, task_id: str) -> Task:
        """Mark a task as done."""
        task = self._get_or_raise(task_id)
        try:
            task.complete()    # Domain enforces the rule
        except ValueError as e:
            raise TaskAlreadyCompleteError(str(e))
        self._repo.update(task)
        return task

    def delete_task(self, task_id: str) -> None:
        """Remove a task."""
        self._get_or_raise(task_id)   # Verify it exists first
        self._repo.delete(task_id)

    def get_task(self, task_id: str) -> Task:
        """Fetch a single task."""
        return self._get_or_raise(task_id)

    def list_tasks(self, status: Optional[str] = None) -> List[Task]:
        """List tasks, optionally filtered by status."""
        if status:
            return self._repo.find_by_status(status)
        return self._repo.list_all()

    def get_overdue_tasks(self) -> List[Task]:
        """Return all tasks that are past their due date and not done."""
        all_tasks = self._repo.list_all()
        return [t for t in all_tasks if t.is_overdue]

    # ---- Private helpers ----

    def _get_or_raise(self, task_id: str) -> Task:
        """Fetch a task or raise TaskNotFoundError."""
        task = self._repo.get(task_id)
        if not task:
            raise TaskNotFoundError(f"Task '{task_id}' not found.")
        return task


# ---- Using it ----

repo    = InMemoryTaskRepository()
service = TaskService(repo)

# Create
t1 = service.create_task("Write the report")
t2 = service.create_task("Review pull requests")

# Use
service.start_task(t1.id)
service.complete_task(t1.id)

# Query
active = service.list_tasks(status="in_progress")
print(f"Active: {[t.title for t in active]}")

# Error handling is clean
try:
    service.complete_task("nonexistent-id")
except TaskNotFoundError as e:
    print(f"Not found: {e}")

try:
    service.complete_task(t1.id)   # Already done
except TaskAlreadyCompleteError as e:
    print(f"Already done: {e}")
```

#### The Layered Picture

```
API / CLI / Background Job
        ↓  calls
  TaskService  (business logic lives here)
        ↓  uses
  TaskRepository  (storage abstraction)
        ↓  implements
  SQLiteTaskRepository / InMemoryTaskRepository
```

Each layer only knows about the layer directly below it. The API never touches the repository. The repository never touches the service. This is called **layered architecture**, and it's the most common structure for backend applications.

---

### 7. Command Pattern

#### The Problem

As your service grows, you may need: undo/redo, audit logging of every action, queuing operations for later, or replaying a sequence of operations. With plain method calls, none of these are easy to add.

```python
# ============================================================
# THE COMMAND PATTERN — Wrap operations as objects
# ============================================================
# Instead of calling service.complete_task(id) directly,
# you create a CompleteTaskCommand object and execute it.
#
# The command object:
# - Carries the data needed for the operation
# - Knows how to execute itself
# - Can (optionally) know how to undo itself
# - Can be stored, queued, logged, or replayed

from abc import ABC, abstractmethod
from dataclasses import dataclass
from datetime import datetime
from typing import List


class Command(ABC):
    """Base class for all commands."""

    @abstractmethod
    def execute(self) -> None:
        pass

    def undo(self) -> None:
        """Override in subclasses that support undo."""
        raise NotImplementedError(f"{type(self).__name__} does not support undo.")


@dataclass
class CreateTaskCommand(Command):
    """Command to create a new task."""
    title:    str
    service:  "TaskService"
    due_date: Optional[datetime] = None
    # The result is stored here after execution
    created_task: Optional[Task] = field(default=None, init=False, repr=False)

    def execute(self) -> None:
        self.created_task = self.service.create_task(
            self.title, self.due_date
        )

    def undo(self) -> None:
        if self.created_task:
            self.service.delete_task(self.created_task.id)
            print(f"Undo: deleted task '{self.created_task.title}'")


@dataclass
class CompleteTaskCommand(Command):
    """Command to complete a task."""
    task_id:       str
    service:       "TaskService"
    _previous_status: str = field(default="", init=False, repr=False)

    def execute(self) -> None:
        task = self.service.get_task(self.task_id)
        self._previous_status = task.status
        self.service.complete_task(self.task_id)

    def undo(self) -> None:
        # In a real system, you'd restore the previous status
        print(f"Undo: restoring task '{self.task_id}' to '{self._previous_status}'")
        task = self.service.get_task(self.task_id)
        task.status = self._previous_status
        self.service._repo.update(task)


@dataclass
class DeleteTaskCommand(Command):
    task_id:       str
    service:       "TaskService"
    _deleted_task: Optional[Task] = field(default=None, init=False, repr=False)

    def execute(self) -> None:
        self._deleted_task = self.service.get_task(self.task_id)
        self.service.delete_task(self.task_id)

    def undo(self) -> None:
        if self._deleted_task:
            self.service._repo.add(self._deleted_task)
            print(f"Undo: restored task '{self._deleted_task.title}'")


# ---- Command History — enables undo/redo and audit logging ----

class CommandHistory:
    """Executes commands and keeps a history for undo."""

    def __init__(self):
        self._history:  List[Command] = []
        self._log:      List[dict]    = []

    def execute(self, command: Command) -> None:
        command.execute()
        self._history.append(command)
        self._log.append({
            "command": type(command).__name__,
            "time":    datetime.now().isoformat(),
        })
        print(f"Executed: {type(command).__name__}")

    def undo_last(self) -> None:
        if not self._history:
            print("Nothing to undo.")
            return
        command = self._history.pop()
        command.undo()

    def audit_log(self) -> List[dict]:
        return list(self._log)


# ---- Using it ----

repo     = InMemoryTaskRepository()
service  = TaskService(repo)
history  = CommandHistory()

# Execute commands through history
create_cmd = CreateTaskCommand(title="Buy milk", service=service)
history.execute(create_cmd)

task_id = create_cmd.created_task.id

complete_cmd = CompleteTaskCommand(task_id=task_id, service=service)
history.execute(complete_cmd)

print(f"Status: {service.get_task(task_id).status}")   # done

# Undo the completion
history.undo_last()
print(f"After undo: {service.get_task(task_id).status}")   # in_progress (or todo)

# Audit trail
print("\nAudit log:")
for entry in history.audit_log():
    print(f"  {entry['time']} — {entry['command']}")
```

---

### 8. Strategy Pattern

#### The Problem

When behavior needs to be swappable — different sorting algorithms, different notification methods, different export formats — the temptation is to use `if/elif` chains. This works for two options but becomes unmaintainable at five.

```python
# ============================================================
# IF/ELIF HELL — The problem
# ============================================================

def sort_tasks(tasks, method):
    if method == "by_priority":
        return sorted(tasks, key=lambda t: t.priority.value, reverse=True)
    elif method == "by_due_date":
        return sorted(tasks, key=lambda t: t.due_date or datetime.max)
    elif method == "by_title":
        return sorted(tasks, key=lambda t: t.title)
    elif method == "by_created":
        return sorted(tasks, key=lambda t: t.created_at)
    # Adding a new method means editing this function.
    # Every new option adds another branch.
    # Testing means testing the whole function every time.
    else:
        raise ValueError(f"Unknown sort method: {method}")
```

```python
# ============================================================
# STRATEGY PATTERN — Swappable algorithms as objects
# ============================================================
# Each strategy is its own class with a standard interface.
# Adding a new strategy means adding a new class — not editing
# existing ones. (This is the Open/Closed Principle in action.)

from abc import ABC, abstractmethod
from typing import List, Callable


class TaskSortStrategy(ABC):
    """Interface that all sort strategies must implement."""

    @abstractmethod
    def sort(self, tasks: List[Task]) -> List[Task]:
        pass

    @property
    @abstractmethod
    def name(self) -> str:
        pass


class SortByPriority(TaskSortStrategy):
    def sort(self, tasks):
        return sorted(tasks, key=lambda t: t.priority.value, reverse=True)

    @property
    def name(self):
        return "priority (high → low)"


class SortByDueDate(TaskSortStrategy):
    def sort(self, tasks):
        return sorted(tasks, key=lambda t: t.due_date or datetime.max)

    @property
    def name(self):
        return "due date (soonest first)"


class SortByTitle(TaskSortStrategy):
    def sort(self, tasks):
        return sorted(tasks, key=lambda t: t.title.lower())

    @property
    def name(self):
        return "title (A → Z)"


class SortByCreatedDate(TaskSortStrategy):
    def sort(self, tasks):
        return sorted(tasks, key=lambda t: t.created_at)

    @property
    def name(self):
        return "created date (oldest first)"


# New strategy added without touching any existing code:
class SortByStatus(TaskSortStrategy):
    STATUS_ORDER = {"in_progress": 0, "todo": 1, "done": 2}

    def sort(self, tasks):
        return sorted(tasks, key=lambda t: self.STATUS_ORDER.get(t.status, 99))

    @property
    def name(self):
        return "status (active first)"


# ---- TaskSorter — the Context that uses strategies ----

class TaskSorter:
    """Sorts tasks using whichever strategy is set."""

    def __init__(self, strategy: TaskSortStrategy = None):
        self._strategy = strategy or SortByCreatedDate()

    @property
    def strategy(self) -> TaskSortStrategy:
        return self._strategy

    @strategy.setter
    def strategy(self, strategy: TaskSortStrategy):
        self._strategy = strategy

    def sort(self, tasks: List[Task]) -> List[Task]:
        print(f"Sorting by: {self._strategy.name}")
        return self._strategy.sort(tasks)


# ---- Strategy Registry — look up strategies by name ----
# Useful when strategy comes from user input or config.

SORT_STRATEGIES = {
    "priority":   SortByPriority(),
    "due_date":   SortByDueDate(),
    "title":      SortByTitle(),
    "created":    SortByCreatedDate(),
    "status":     SortByStatus(),
}

def get_sort_strategy(name: str) -> TaskSortStrategy:
    strategy = SORT_STRATEGIES.get(name)
    if not strategy:
        raise ValueError(f"Unknown sort: '{name}'. Options: {list(SORT_STRATEGIES)}")
    return strategy


# ---- Using it ----

from datetime import timedelta

repo    = InMemoryTaskRepository()
service = TaskService(repo)

t1 = service.create_task("Buy milk")
t1.priority = Priority.LOW
repo.update(t1)

t2 = service.create_task("Walk the dog")
t2.priority = Priority.HIGH
repo.update(t2)

t3 = service.create_task("Write tests")
t3.priority = Priority.MEDIUM
repo.update(t3)

tasks   = service.list_tasks()
sorter  = TaskSorter()

# Switch strategies at runtime
sorter.strategy = SortByPriority()
for t in sorter.sort(tasks):
    print(f"  {t.priority.name}: {t.title}")

sorter.strategy = SortByTitle()
for t in sorter.sort(tasks):
    print(f"  {t.title}")

# From string (e.g., from an API request)
sorter.strategy = get_sort_strategy("priority")
sorter.sort(tasks)
```

---

## Part 4 — Structuring Communication

---

### 9. Observer / Event System

#### The Problem

When one action should trigger several side effects — completing a task might send a notification, update a counter, write an audit log, and refresh a cache — the naive solution is to put all of that in the service method. Now the service knows about notifications, counters, logs, and caches. It becomes a god object.

```python
# ============================================================
# THE GOD METHOD — Everything crammed in one place
# ============================================================

def complete_task(self, task_id):
    task = self._get_or_raise(task_id)
    task.complete()
    self._repo.update(task)
    # What follows does not belong in a task service:
    self._email_service.send(task.owner_email, "Task done!")
    self._metrics.increment("tasks_completed")
    self._audit_log.write(f"Task {task_id} completed")
    self._cache.invalidate(f"task:{task_id}")
    self._websocket.broadcast({"event": "task_completed", "id": task_id})
    # Adding one more side-effect means editing this method.
```

```python
# ============================================================
# OBSERVER / EVENT SYSTEM — Side effects subscribe to events
# ============================================================
# The service fires an event ("task was completed").
# Anything that cares about that event registers as a listener.
# The service doesn't know or care who is listening.

from typing import Callable, Dict, List, Any
from dataclasses import dataclass
import inspect


# ---- The Event Bus ----

class EventBus:
    """
    A central hub for publishing and subscribing to events.
    Publishers fire events. Subscribers react to them.
    They never talk directly to each other.
    """

    def __init__(self):
        self._listeners: Dict[str, List[Callable]] = {}

    def subscribe(self, event_name: str, handler: Callable) -> None:
        """Register a function to be called when event_name is published."""
        if event_name not in self._listeners:
            self._listeners[event_name] = []
        self._listeners[event_name].append(handler)
        print(f"  [EventBus] '{handler.__name__}' subscribed to '{event_name}'")

    def on(self, event_name: str):
        """Decorator version of subscribe."""
        def decorator(func: Callable) -> Callable:
            self.subscribe(event_name, func)
            return func
        return decorator

    def publish(self, event_name: str, **data) -> None:
        """Fire an event. All registered handlers are called with data."""
        handlers = self._listeners.get(event_name, [])
        if not handlers:
            return
        for handler in handlers:
            handler(**data)

    def unsubscribe(self, event_name: str, handler: Callable) -> None:
        if event_name in self._listeners:
            self._listeners[event_name].remove(handler)


# ---- Event-aware Task Service ----

class EventAwareTaskService(TaskService):
    """
    TaskService extended to publish events.
    The service does its job, then announces what happened.
    It doesn't care who's listening.
    """

    def __init__(self, repository: TaskRepository, event_bus: EventBus):
        super().__init__(repository)
        self._bus = event_bus

    def create_task(self, title: str, due_date=None) -> Task:
        task = super().create_task(title, due_date)
        self._bus.publish("task.created", task=task)
        return task

    def complete_task(self, task_id: str) -> Task:
        task = super().complete_task(task_id)
        self._bus.publish("task.completed", task=task)
        return task

    def delete_task(self, task_id: str) -> None:
        task = self.get_task(task_id)   # Fetch before deleting
        super().delete_task(task_id)
        self._bus.publish("task.deleted", task=task)


# ---- Listeners — each one is a separate, focused piece ----

class AuditLogger:
    def __init__(self):
        self.log: List[str] = []

    def on_task_created(self, task: Task):
        entry = f"[AUDIT] CREATED '{task.title}' (id={task.id})"
        self.log.append(entry)
        print(entry)

    def on_task_completed(self, task: Task):
        entry = f"[AUDIT] COMPLETED '{task.title}' (id={task.id})"
        self.log.append(entry)
        print(entry)

    def on_task_deleted(self, task: Task):
        entry = f"[AUDIT] DELETED '{task.title}' (id={task.id})"
        self.log.append(entry)
        print(entry)


class MetricsCollector:
    def __init__(self):
        self.counts: Dict[str, int] = {}

    def increment(self, key: str):
        self.counts[key] = self.counts.get(key, 0) + 1

    def on_task_created(self, task: Task):
        self.increment("tasks_created")

    def on_task_completed(self, task: Task):
        self.increment("tasks_completed")


class NotificationService:
    def on_task_completed(self, task: Task):
        # In production: send email, push notification, etc.
        print(f"[NOTIFY] Task '{task.title}' is complete! Well done.")


# ---- Wiring it all together ----

bus     = EventBus()
repo    = InMemoryTaskRepository()
service = EventAwareTaskService(repo, bus)
audit   = AuditLogger()
metrics = MetricsCollector()
notify  = NotificationService()

# Register listeners
bus.subscribe("task.created",   audit.on_task_created)
bus.subscribe("task.completed", audit.on_task_completed)
bus.subscribe("task.deleted",   audit.on_task_deleted)
bus.subscribe("task.created",   metrics.on_task_created)
bus.subscribe("task.completed", metrics.on_task_completed)
bus.subscribe("task.completed", notify.on_task_completed)

# Use the service normally
print("\n--- Creating tasks ---")
t = service.create_task("Buy milk")

print("\n--- Completing task ---")
service.complete_task(t.id)

print("\n--- Metrics ---")
print(metrics.counts)
# {'tasks_created': 1, 'tasks_completed': 1}

# To add a new side-effect (e.g., update a dashboard), you add
# a new listener and one subscribe() call.
# The service code doesn't change at all.
```

---

### 10. Dependency Injection

#### The Problem

When a class creates its own dependencies, you can't replace them. You can't use a fake database in tests. You can't swap the email provider. You can't test how the class behaves when the database is slow.

```python
# ============================================================
# HARD-CODED DEPENDENCIES — The problem
# ============================================================

class BadTaskService:
    def __init__(self):
        # This creates its own dependencies. You can't swap them.
        self._repo = SQLiteTaskRepository("production.db")  # Hard-coded!
        self._email = SmtpEmailService("smtp.gmail.com")    # Hard-coded!
        self._logger = FileLogger("/var/log/tasks.log")     # Hard-coded!

    # Testing this class requires a real SQLite file, a real SMTP
    # server, and write access to /var/log. In CI? Good luck.
```

```python
# ============================================================
# DEPENDENCY INJECTION — Receive dependencies, don't create them
# ============================================================
# "Don't call us, we'll call you."
# The class declares what it needs. Something else provides it.
# This is the single most important pattern for testability.

# ---- Interfaces (what we depend on, not implementations) ----

from abc import ABC, abstractmethod


class EmailService(ABC):
    @abstractmethod
    def send(self, to: str, subject: str, body: str) -> None:
        pass


class Logger(ABC):
    @abstractmethod
    def info(self, message: str) -> None:
        pass

    @abstractmethod
    def error(self, message: str) -> None:
        pass


# ---- Multiple implementations of each interface ----

class SmtpEmailService(EmailService):
    def __init__(self, host: str, port: int = 587):
        self.host = host
        self.port = port

    def send(self, to, subject, body):
        print(f"[SMTP → {self.host}] To: {to} | {subject}")


class ConsoleEmailService(EmailService):
    """Prints emails to console instead of sending them. Great for dev."""
    def send(self, to, subject, body):
        print(f"[EMAIL CONSOLE] To: {to}\nSubject: {subject}\n{body}")


class NullEmailService(EmailService):
    """Does nothing. Use in tests where emails don't matter."""
    def send(self, to, subject, body):
        pass   # Intentionally empty


class PrintLogger(Logger):
    def info(self, message): print(f"[INFO]  {message}")
    def error(self, message): print(f"[ERROR] {message}")


class NullLogger(Logger):
    """Silent logger. Use in tests to suppress noise."""
    def info(self, message): pass
    def error(self, message): pass


class CapturingLogger(Logger):
    """Stores log entries. Use in tests to assert on log output."""
    def __init__(self):
        self.entries: List[dict] = []

    def info(self, message):
        self.entries.append({"level": "INFO", "message": message})

    def error(self, message):
        self.entries.append({"level": "ERROR", "message": message})


# ---- The Service — receives everything it needs ----

class FullTaskService:
    """
    Every dependency is injected. This class creates nothing itself.
    Swap any dependency by passing a different implementation.
    """

    def __init__(
        self,
        repository: TaskRepository,
        email:      EmailService,
        logger:     Logger,
    ):
        self._repo   = repository
        self._email  = email
        self._logger = logger

    def create_task(self, title: str) -> Task:
        task = Task(title=title)
        self._repo.add(task)
        self._logger.info(f"Created task: '{title}' (id={task.id})")
        return task

    def complete_task(self, task_id: str, notify_email: str = None) -> Task:
        task = self._repo.get(task_id)
        if not task:
            self._logger.error(f"Task not found: {task_id}")
            raise TaskNotFoundError(task_id)
        task.complete()
        self._repo.update(task)
        self._logger.info(f"Completed task: '{task.title}'")
        if notify_email:
            self._email.send(
                to=notify_email,
                subject=f"Task Complete: {task.title}",
                body=f"Your task '{task.title}' has been completed."
            )
        return task


# ---- Wiring: production vs test ----

# PRODUCTION — real implementations
production_service = FullTaskService(
    repository = SQLiteTaskRepository("production.db"),
    email      = SmtpEmailService("smtp.company.com"),
    logger     = PrintLogger(),
)

# DEVELOPMENT — fake email so we don't send real messages
dev_service = FullTaskService(
    repository = InMemoryTaskRepository(),
    email      = ConsoleEmailService(),
    logger     = PrintLogger(),
)

# TESTING — in-memory everything, capture logs to assert on
logger_spy = CapturingLogger()

test_service = FullTaskService(
    repository = InMemoryTaskRepository(),
    email      = NullEmailService(),
    logger     = logger_spy,
)

# Use test service
t = test_service.create_task("Write unit tests")
test_service.complete_task(t.id)

# Assert on captured log entries
assert any("Created task" in e["message"] for e in logger_spy.entries)
assert any("Completed task" in e["message"] for e in logger_spy.entries)
print("All assertions passed.")
print(f"Log entries: {logger_spy.entries}")
```

#### The Pattern In One Sentence

"Depend on abstractions (interfaces). Receive concrete implementations from the outside. Never create dependencies inside your class."

---

### 11. Facade Pattern

#### The Problem

A complex subsystem with many classes and many steps is hard to use correctly. Every caller has to know the right sequence of operations. When you refactor the internals, every caller breaks.

```python
# ============================================================
# NO FACADE — Callers deal with the full complexity
# ============================================================

# To do one user-facing action (archive a project), callers need to:
repo     = InMemoryTaskRepository()
bus      = EventBus()
service  = EventAwareTaskService(repo, bus)
audit    = AuditLogger()
metrics  = MetricsCollector()
bus.subscribe("task.completed", audit.on_task_completed)
bus.subscribe("task.completed", metrics.on_task_completed)

# Every caller needs to know all of this. Every caller duplicates it.
# When you add a new service, you update every caller.
```

```python
# ============================================================
# FACADE PATTERN — One simple interface over complex subsystems
# ============================================================
# The Facade class wires everything together and exposes a
# clean, simple API. Callers deal with the Facade only.
# The Facade deals with the complexity.

class TaskManagerFacade:
    """
    The single entry point for the task manager application.
    Hides all internal wiring — services, repositories, event buses.

    Callers only need to know this class.
    """

    def __init__(self, db_path: str = ":memory:"):
        # Internal wiring — callers never see this
        self._repo    = SQLiteTaskRepository(db_path)
        self._bus     = EventBus()
        self._service = EventAwareTaskService(self._repo, self._bus)
        self._audit   = AuditLogger()
        self._metrics = MetricsCollector()
        self._logger  = PrintLogger()

        # Wire up events
        self._bus.subscribe("task.created",   self._audit.on_task_created)
        self._bus.subscribe("task.completed", self._audit.on_task_completed)
        self._bus.subscribe("task.deleted",   self._audit.on_task_deleted)
        self._bus.subscribe("task.created",   self._metrics.on_task_created)
        self._bus.subscribe("task.completed", self._metrics.on_task_completed)

    # ---- The public API — simple verbs ----

    def add_task(self, title: str, due_date=None) -> Task:
        return self._service.create_task(title, due_date)

    def start_task(self, task_id: str) -> Task:
        return self._service.start_task(task_id)

    def finish_task(self, task_id: str) -> Task:
        return self._service.complete_task(task_id)

    def remove_task(self, task_id: str) -> None:
        self._service.delete_task(task_id)

    def get_task(self, task_id: str) -> Task:
        return self._service.get_task(task_id)

    def all_tasks(self, status: str = None) -> List[Task]:
        return self._service.list_tasks(status)

    def stats(self) -> dict:
        return {
            **self._metrics.counts,
            "total": len(self._service.list_tasks()),
        }

    def audit_log(self) -> List[str]:
        return list(self._audit.log)


# ---- Using it — clean and simple ----

app = TaskManagerFacade()

t1 = app.add_task("Buy milk")
t2 = app.add_task("Walk the dog")
t3 = app.add_task("Write the report")

app.start_task(t1.id)
app.finish_task(t1.id)
app.start_task(t3.id)

print("\nAll tasks:")
for task in app.all_tasks():
    print(f"  {task}")

print("\nStats:", app.stats())

print("\nAudit log:")
for entry in app.audit_log():
    print(f"  {entry}")
```

---

## Part 5 — Structuring Failure

---

### 12. Guard Clauses / Fail Fast

#### The Problem

Deeply nested `if` statements push the happy path deep into indentation and make code hard to read. The rule: check for problems *first*, at the top, and return/raise early.

```python
# ============================================================
# DEEPLY NESTED — Hard to follow the happy path
# ============================================================

def process_task(task_id, user_id, new_title):
    user = get_user(user_id)
    if user is not None:
        if user.is_active:
            task = get_task(task_id)
            if task is not None:
                if task.owner_id == user_id:
                    if new_title and len(new_title.strip()) > 0:
                        if task.status != "done":
                            task.title = new_title.strip()
                            save(task)
                            return task
                        else:
                            raise ValueError("Task is done")
                    else:
                        raise ValueError("Title is empty")
                else:
                    raise PermissionError("Not your task")
            else:
                raise ValueError("Task not found")
        else:
            raise ValueError("User is inactive")
    else:
        raise ValueError("User not found")
    # The happy path is buried 7 levels deep.
```

```python
# ============================================================
# GUARD CLAUSES — Check preconditions first, exit early
# ============================================================
# "Fail fast, return early."
# Each guard handles one failure condition and exits immediately.
# The happy path stays at the top level — easy to read.

def process_task(task_id: str, user_id: str, new_title: str) -> Task:
    # ---- Guards first ----
    user = get_user(user_id)
    if not user:
        raise ValueError(f"User '{user_id}' not found.")

    if not user.is_active:
        raise PermissionError(f"User '{user_id}' is inactive.")

    task = get_task(task_id)
    if not task:
        raise ValueError(f"Task '{task_id}' not found.")

    if task.owner_id != user_id:
        raise PermissionError("You don't own this task.")

    if task.status == "done":
        raise ValueError("Cannot edit a completed task.")

    if not new_title or not new_title.strip():
        raise ValueError("Title cannot be empty.")

    # ---- Happy path — no indentation, clean and obvious ----
    task.title = new_title.strip()
    save(task)
    return task


# ---- Guard clause helper — assert_* functions ----
# A useful pattern: extract repeated guard logic into helpers.

def assert_task_exists(repo: TaskRepository, task_id: str) -> Task:
    """Fetch task or raise TaskNotFoundError."""
    task = repo.get(task_id)
    if not task:
        raise TaskNotFoundError(f"Task '{task_id}' not found.")
    return task

def assert_task_is_editable(task: Task) -> None:
    """Raise if task cannot be edited."""
    if task.status == "done":
        raise ValueError(f"Task '{task.id}' is complete and cannot be edited.")

def assert_non_empty_string(value: str, field_name: str) -> str:
    """Validate and return a non-empty, stripped string."""
    if not value or not value.strip():
        raise ValueError(f"'{field_name}' cannot be empty.")
    return value.strip()


# Now service methods are readable at a glance:
def rename_task(self, task_id: str, new_title: str) -> Task:
    title = assert_non_empty_string(new_title, "title")
    task  = assert_task_exists(self._repo, task_id)
    assert_task_is_editable(task)

    task.title = title
    self._repo.update(task)
    return task
```

---

### 13. Result Type

#### The Problem

Exceptions are powerful but they're invisible in the function signature. Looking at `def complete_task(id)`, you can't tell what errors it might raise without reading the body. And if you forget to catch an exception, it unwinds the call stack unexpectedly.

The **Result type** makes success and failure explicit return values.

```python
# ============================================================
# RESULT TYPE — Make success and failure explicit
# ============================================================
# A Result is either Ok(value) or Err(error).
# The caller is forced to handle both cases.
# The function signature tells the full story.

from dataclasses import dataclass
from typing import TypeVar, Generic, Union, Callable

T = TypeVar("T")   # The success type
E = TypeVar("E")   # The error type


@dataclass(frozen=True)
class Ok(Generic[T]):
    """Represents a successful result carrying a value."""
    value: T

    @property
    def is_ok(self) -> bool:
        return True

    @property
    def is_err(self) -> bool:
        return False

    def map(self, func: Callable) -> "Ok":
        """Apply a function to the value, return a new Ok."""
        return Ok(func(self.value))

    def unwrap(self) -> T:
        return self.value

    def unwrap_or(self, default) -> T:
        return self.value


@dataclass(frozen=True)
class Err(Generic[E]):
    """Represents a failure carrying an error."""
    error: E

    @property
    def is_ok(self) -> bool:
        return False

    @property
    def is_err(self) -> bool:
        return True

    def map(self, func: Callable) -> "Err":
        """Mapping over an Err does nothing — passes through."""
        return self

    def unwrap(self):
        raise RuntimeError(f"Called unwrap() on Err: {self.error}")

    def unwrap_or(self, default):
        return default


# Type alias for Result
Result = Union[Ok[T], Err[str]]


# ---- Task service using Result ----

class SafeTaskService:
    """Returns Result objects instead of raising exceptions."""

    def __init__(self, repository: TaskRepository):
        self._repo = repository

    def create_task(self, title: str) -> Result:
        if not title or not title.strip():
            return Err("Title cannot be empty.")
        if len(title.strip()) > 200:
            return Err("Title too long (max 200 characters).")
        task = Task(title=title.strip())
        self._repo.add(task)
        return Ok(task)

    def complete_task(self, task_id: str) -> Result:
        task = self._repo.get(task_id)
        if not task:
            return Err(f"Task '{task_id}' not found.")
        if task.status == "done":
            return Err(f"Task '{task_id}' is already complete.")
        task.complete()
        self._repo.update(task)
        return Ok(task)

    def get_task(self, task_id: str) -> Result:
        task = self._repo.get(task_id)
        if not task:
            return Err(f"Task '{task_id}' not found.")
        return Ok(task)


# ---- Using it ----

repo    = InMemoryTaskRepository()
service = SafeTaskService(repo)

# Creating tasks
result = service.create_task("Buy milk")

if result.is_ok:
    print(f"Created: {result.value.title}")
else:
    print(f"Error: {result.error}")

# Chaining with map
task_id = result.value.id

# Complete it — check result
complete_result = service.complete_task(task_id)
if complete_result.is_ok:
    print(f"Completed: {complete_result.value.title}")
else:
    print(f"Error: {complete_result.error}")

# Double-complete — Result makes the failure explicit
double_complete = service.complete_task(task_id)
print(f"is_ok: {double_complete.is_ok}")        # False
print(f"error: {double_complete.error}")         # Task '...' is already complete.

# Invalid input
bad_result = service.create_task("")
print(f"is_ok: {bad_result.is_ok}")             # False
print(f"error: {bad_result.error}")             # Title cannot be empty.

# Using unwrap_or for safe defaults
task = service.get_task("nonexistent").unwrap_or(None)
print(f"Task: {task}")   # None
```

---

### 14. Validation Objects

#### The Problem

When creating or updating an object, there might be many validation rules. Raising the first error you find means the user fixes one problem, submits again, hits another error. They have to go back and forth. Better: collect all errors at once.

```python
# ============================================================
# VALIDATION OBJECTS — Collect all errors, report at once
# ============================================================

from dataclasses import dataclass, field
from typing import List, Dict


@dataclass
class ValidationError:
    field:   str
    message: str

    def __str__(self):
        return f"{self.field}: {self.message}"


class ValidationResult:
    """Collects validation errors. Can be checked for validity."""

    def __init__(self):
        self._errors: List[ValidationError] = []

    def add_error(self, field: str, message: str) -> "ValidationResult":
        self._errors.append(ValidationError(field, message))
        return self   # Allows chaining

    @property
    def is_valid(self) -> bool:
        return len(self._errors) == 0

    @property
    def errors(self) -> List[ValidationError]:
        return list(self._errors)

    @property
    def error_messages(self) -> List[str]:
        return [str(e) for e in self._errors]

    def raise_if_invalid(self) -> None:
        """Raise a single exception containing all errors."""
        if not self.is_valid:
            messages = "\n".join(f"  - {e}" for e in self._errors)
            raise ValueError(f"Validation failed:\n{messages}")

    def __bool__(self):
        return self.is_valid

    def __repr__(self):
        if self.is_valid:
            return "ValidationResult(valid)"
        return f"ValidationResult(errors={self._errors})"


# ---- Validator class — the rules in one place ----

class TaskValidator:
    """All validation rules for creating or updating a Task."""

    MAX_TITLE_LENGTH = 200

    @classmethod
    def validate_create(cls, title: str, due_date=None) -> ValidationResult:
        """Validate data for creating a new task."""
        result = ValidationResult()

        # Title checks
        if not title or not title.strip():
            result.add_error("title", "Title is required.")
        elif len(title.strip()) > cls.MAX_TITLE_LENGTH:
            result.add_error(
                "title",
                f"Title is too long ({len(title.strip())} chars, max {cls.MAX_TITLE_LENGTH})."
            )

        # Due date checks
        if due_date is not None:
            if not isinstance(due_date, datetime):
                result.add_error("due_date", "Due date must be a datetime object.")
            elif due_date < datetime.now():
                result.add_error("due_date", "Due date cannot be in the past.")

        return result

    @classmethod
    def validate_update(cls, task: Task, title: str = None, due_date=None) -> ValidationResult:
        """Validate data for updating an existing task."""
        result = ValidationResult()

        if task.status == "done":
            result.add_error("status", "Cannot update a completed task.")

        if title is not None:
            if not title.strip():
                result.add_error("title", "Title cannot be set to empty.")
            elif len(title.strip()) > cls.MAX_TITLE_LENGTH:
                result.add_error("title", f"Title too long (max {cls.MAX_TITLE_LENGTH} chars).")

        if due_date is not None and due_date < datetime.now():
            result.add_error("due_date", "Due date cannot be in the past.")

        return result


# ---- Using it in the service ----

class ValidatingTaskService(TaskService):
    """TaskService that validates before acting."""

    def create_task(self, title: str, due_date=None) -> Task:
        validation = TaskValidator.validate_create(title, due_date)
        validation.raise_if_invalid()   # Raises with ALL errors if invalid
        return super().create_task(title, due_date)

    def update_task(self, task_id: str, title: str = None, due_date=None) -> Task:
        task       = self._get_or_raise(task_id)
        validation = TaskValidator.validate_update(task, title, due_date)
        validation.raise_if_invalid()

        if title:
            task.title = title.strip()
        if due_date:
            task.due_date = due_date
        self._repo.update(task)
        return task


# ---- Using it ----

repo    = InMemoryTaskRepository()
service = ValidatingTaskService(repo)

# Good data — works fine
t = service.create_task("Buy milk")

# Bad data — all errors at once
try:
    service.create_task(
        title    = "",              # empty
        due_date = datetime(2000, 1, 1)  # in the past
    )
except ValueError as e:
    print(e)
    # Validation failed:
    #   - title: Title is required.
    #   - due_date: Due date cannot be in the past.

# Using ValidationResult directly (without raising):
result = TaskValidator.validate_create(title="", due_date=datetime(2000,1,1))
print(f"Valid: {result.is_valid}")
for error in result.errors:
    print(f"  {error.field}: {error.message}")

# Conditional — ValidationResult is truthy when valid
if result:
    print("All good!")
else:
    print(f"Fix {len(result.errors)} error(s) before continuing.")
```

---

## Part 6 — Putting It All Together

Here is the complete task manager with every pattern connected:

```python
# ============================================================
# THE COMPLETE SYSTEM
# All patterns working together through the Facade.
# ============================================================

from datetime import datetime, timedelta


def build_app(db_path: str = ":memory:") -> TaskManagerFacade:
    """
    Factory function — builds the full application.
    Swap implementations here without touching anything else.
    """
    return TaskManagerFacade(db_path)


def demo():
    print("=" * 50)
    print("  Task Manager — Complete Pattern Demo")
    print("=" * 50)

    app = build_app()

    # --- Create tasks ---
    print("\n[CREATE]")
    t1 = app.add_task("Write the project proposal")
    t2 = app.add_task("Schedule team review meeting")
    t3 = app.add_task("Deploy to staging server",
                      due_date=datetime.now() + timedelta(days=2))
    t4 = app.add_task("Update documentation")

    # --- Progress some tasks ---
    print("\n[PROGRESS]")
    app.start_task(t1.id)
    app.start_task(t3.id)
    app.finish_task(t1.id)

    # --- Query ---
    print("\n[ALL TASKS]")
    for task in app.all_tasks():
        print(f"  {task}")

    print("\n[IN PROGRESS]")
    for task in app.all_tasks(status="in_progress"):
        print(f"  {task}")

    # --- Stats ---
    print("\n[STATS]")
    print(app.stats())

    # --- Audit log ---
    print("\n[AUDIT LOG]")
    for entry in app.audit_log():
        print(f"  {entry}")

    # --- Error handling ---
    print("\n[ERROR HANDLING]")
    try:
        app.finish_task(t1.id)   # Already done
    except Exception as e:
        print(f"  Caught expected error: {e}")

    try:
        app.get_task("nonexistent-id")
    except TaskNotFoundError as e:
        print(f"  Caught expected error: {e}")


demo()
```

---

## Summary Table

| Pattern | Problem it solves | Key idea |
|---|---|---|
| **Rich Domain Model** | Rules scattered everywhere | Business rules live on the object |
| **Value Objects** | Primitives with no meaning | Small immutable types that validate themselves |
| **Immutability** | Mutable shared state causes bugs | Return new objects instead of mutating |
| **Repository** | Logic tangled with storage | Storage hidden behind an interface |
| **Unit of Work** | Partial updates leave bad state | All changes commit together or not at all |
| **Service Layer** | Logic in wrong layer | One class per use case, one method per action |
| **Command Pattern** | Can't undo, log, or queue actions | Wrap operations as objects |
| **Strategy Pattern** | if/elif chains for swappable behavior | Each algorithm is its own class |
| **Observer / Events** | God methods with too many side effects | Publish events; subscribers react independently |
| **Dependency Injection** | Hard-coded deps can't be tested or swapped | Receive dependencies, don't create them |
| **Facade** | Complex subsystem is hard to use | One simple interface hides all the wiring |
| **Guard Clauses** | Deeply nested conditionals | Check preconditions first, exit early |
| **Result Type** | Exceptions are invisible in signatures | Success and failure are explicit return values |
| **Validation Objects** | Users see one error at a time | Collect all errors before raising |

---

> **What to practice next:** Pick any pattern from this guide and apply it to something you have already written. You don't need to start fresh — refactoring toward a pattern in existing code teaches it better than any new example. Ask yourself after each one: "What would have gone wrong without this?"

---

*🧱 Happy building. The best patterns are the ones you reach for without thinking because you have felt the pain of not having them.*
