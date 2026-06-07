# Building a Todo App — From Messy Script to Clean Architecture

## A Python Code-Along Series

> **How this series works:** Every episode builds on the last. We start with the ugliest possible solution that works, and we improve it one problem at a time. Each improvement has a name — that name is a pattern. By the end you will have built a real command-line application and you will have felt *why* every pattern exists, not just seen it.
>
> **What you need:** Python 3.10 or later. A terminal. A code editor. Nothing else.

---

# Episode 1 — Just Make It Work

## What we're building

A todo list you can use from the terminal. You can add tasks, list them, and mark them done. That's it.

## Before we write any code — what is the simplest possible thing?

The simplest possible todo app is a script. No classes, no functions, no structure. Just Python running top to bottom. We are going to write that first, on purpose, because the problems it creates are exactly the problems patterns solve. You can't appreciate the solution until you've felt the problem.

## The flat script

Read every line. Run it. Use it. Notice what annoys you.

```python
# todo_v1.py
# The simplest possible todo app.
# No classes. No functions. Just a list and some if/elif.

import sys

# Our data is just a list of dictionaries.
# Each task is a dict with a title and a done flag.
tasks = []

# We read what the user typed on the command line.
# sys.argv is a list of strings: ["todo_v1.py", "add", "Buy milk"]
# sys.argv[0] is always the script name.
# sys.argv[1] is the command ("add", "list", "done").
# sys.argv[2] onwards is the rest of the input.

if len(sys.argv) < 2:
    print("Usage: python todo_v1.py [add|list|done] [args]")
    sys.exit(1)

command = sys.argv[1]

if command == "add":
    if len(sys.argv) < 3:
        print("Usage: python todo_v1.py add <title>")
        sys.exit(1)
    title = sys.argv[2]
    task = {"id": len(tasks) + 1, "title": title, "done": False}
    tasks.append(task)
    print(f"Added: {title}")

elif command == "list":
    if not tasks:
        print("No tasks yet.")
    for task in tasks:
        status = "✓" if task["done"] else "○"
        print(f"  {task['id']}. [{status}] {task['title']}")

elif command == "done":
    if len(sys.argv) < 3:
        print("Usage: python todo_v1.py done <id>")
        sys.exit(1)
    task_id = int(sys.argv[2])
    for task in tasks:
        if task["id"] == task_id:
            task["done"] = True
            print(f"Marked done: {task['title']}")
            break
    else:
        print(f"No task with id {task_id}")

else:
    print(f"Unknown command: {command}")
```

## Try it

Run these commands one at a time in your terminal:

```
python todo_v1.py add "Buy milk"
python todo_v1.py add "Walk the dog"
python todo_v1.py list
python todo_v1.py done 1
python todo_v1.py list
```

## What you will notice

Every time you run the script, `tasks = []` runs again. The list resets. Your tasks are gone. The app has no memory.

This is the first problem we will solve — but not yet. Right now, notice *all* the problems:

- Tasks disappear when the script ends (no persistence)
- The data is a raw dictionary — nothing stops you from making a task with no title, or a `"done"` value of `"maybe"`
- The command handling is a big if/elif block — adding a new command means editing that block
- There is no clear separation between "what a task is" and "what you can do with tasks" and "how you show tasks to the user"

These are not small complaints. On a script this size they don't matter. On anything real, they become the reason the codebase becomes impossible to change.

## What we learned

A flat script is fine for a throwaway tool. The moment you need to *extend* it, the lack of structure costs you. Every episode in this series solves one of those problems, deliberately, one at a time.

---

# Episode 2 — Give the Data a Home

## The problem we are solving

In Episode 1, a task was a plain dictionary:

```python
{"id": 1, "title": "Buy milk", "done": False}
```

A dictionary has no rules. Nothing stops this:

```python
task = {"id": "banana", "title": "", "done": "maybe", "colour": "purple"}
```

Python will not complain. Your code will silently do the wrong thing, and you will spend an hour debugging something that should have been impossible.

The fix is to give your data a *home* — a class that owns the data and enforces the rules. This is called a **domain model**. The word "domain" just means "the thing your program is actually about" — in our case, tasks.

## Two kinds of domain model

There is a weak version and a strong version.

**The weak version (Anemic Model)** is a class that is just a dictionary with dot notation. It holds data but has no behavior. All the logic lives in functions outside the class.

**The strong version (Rich Domain Model)** is a class where the rules live *on the object*. The object knows what state it is allowed to be in and refuses invalid transitions.

We are building the strong version.

## Introducing enums

Before we write the Task class, we need to talk about status values. In Episode 1 we used the strings `"done"` and `False`. That is fragile — a typo like `"Done"` or `"dne"` causes silent bugs.

An **Enum** is a type that can only be one of a fixed set of values. It is impossible to have an invalid status when status is an Enum.

```python
# enums.py
# Run this file to see how enums work.

from enum import Enum

class TaskStatus(Enum):
    TODO        = "todo"
    IN_PROGRESS = "in_progress"
    DONE        = "done"

# An enum value is accessed like this:
print(TaskStatus.TODO)          # TaskStatus.TODO
print(TaskStatus.TODO.value)    # todo
print(TaskStatus.TODO.name)     # TODO

# Comparison works naturally:
status = TaskStatus.TODO
print(status == TaskStatus.TODO)   # True
print(status == TaskStatus.DONE)   # False

# You cannot accidentally create an invalid status:
try:
    bad = TaskStatus("dne")
except ValueError as e:
    print(f"Caught: {e}")   # 'dne' is not a valid TaskStatus

# Iterating all values:
for s in TaskStatus:
    print(s.value)
```

## The Task class

Now we build the Task. Read every comment — each one explains a decision.

```python
# task.py
# The Task class. The heart of the application.
# This is our domain model.

from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from typing import Optional
import uuid


class TaskStatus(Enum):
    TODO        = "todo"
    IN_PROGRESS = "in_progress"
    DONE        = "done"


# @dataclass automatically generates __init__, __repr__, and __eq__
# based on the fields you define. It saves a lot of boilerplate.
# Think of it as Python doing the boring parts for you.

@dataclass
class Task:
    # ---- Fields ----
    # These are the things a Task knows about itself.

    title: str

    # field(default_factory=...) means: call this function to get
    # the default value. We use a factory (not a plain default) for
    # anything mutable or that should be unique per instance.
    id: str = field(default_factory=lambda: str(uuid.uuid4())[:8])

    status: TaskStatus = TaskStatus.TODO

    # datetime.now is called once per task creation, not once for all tasks.
    created_at: datetime = field(default_factory=datetime.now)

    # Optional[datetime] means "a datetime or None"
    due_date: Optional[datetime] = None

    # ---- Behavior ----
    # These are the things a Task can DO.
    # Rules live here — on the object that owns the data.

    def start(self) -> None:
        """Move the task to in-progress. Only valid from TODO."""
        if self.status != TaskStatus.TODO:
            raise ValueError(
                f"Cannot start a task with status '{self.status.value}'. "
                "Only TODO tasks can be started."
            )
        self.status = TaskStatus.IN_PROGRESS

    def complete(self) -> None:
        """Mark the task as done. Cannot complete an already-done task."""
        if self.status == TaskStatus.DONE:
            raise ValueError("This task is already complete.")
        self.status = TaskStatus.DONE

    def reopen(self) -> None:
        """Put a completed task back to TODO."""
        if self.status != TaskStatus.DONE:
            raise ValueError("Only completed tasks can be reopened.")
        self.status = TaskStatus.TODO

    # ---- Computed properties ----
    # These are things we can *derive* from the data.
    # We use @property so they look like attributes, not method calls.
    # task.is_overdue, not task.is_overdue()

    @property
    def is_overdue(self) -> bool:
        """True if the task has a due date that has passed and is not done."""
        if self.due_date is None:
            return False
        if self.status == TaskStatus.DONE:
            return False
        return datetime.now() > self.due_date

    @property
    def is_active(self) -> bool:
        """True if the task still needs work."""
        return self.status in (TaskStatus.TODO, TaskStatus.IN_PROGRESS)

    # ---- String representation ----
    # __str__ is what Python uses when you print() an object.
    # We make it human-readable.

    def __str__(self) -> str:
        icons = {
            TaskStatus.TODO:        "○",
            TaskStatus.IN_PROGRESS: "◑",
            TaskStatus.DONE:        "✓",
        }
        icon    = icons[self.status]
        overdue = " [OVERDUE]" if self.is_overdue else ""
        due     = f" (due {self.due_date.strftime('%Y-%m-%d')})" if self.due_date else ""
        return f"[{icon}] {self.id} — {self.title}{due}{overdue}"
```

## Using the Task class

```python
# episode2_demo.py
# Run this to see the Task class in action.

from task import Task, TaskStatus
from datetime import datetime, timedelta

# Create a task — only title is required, everything else has a default
t = Task(title="Buy milk")
print(t)
# [○] a3f2b1c4 — Buy milk

# Move it through its lifecycle
t.start()
print(t)
# [◑] a3f2b1c4 — Buy milk

t.complete()
print(t)
# [✓] a3f2b1c4 — Buy milk

# The rules are enforced — you cannot do invalid things
try:
    t.complete()    # Already done
except ValueError as e:
    print(f"Caught: {e}")
    # Caught: This task is already complete.

# Overdue detection
overdue_task = Task(
    title    = "Write the report",
    due_date = datetime.now() - timedelta(days=1)  # Yesterday
)
print(overdue_task.is_overdue)   # True
print(overdue_task)
# [○] b7e3a1f2 — Write the report (due 2024-11-30) [OVERDUE]

# A task with a future due date is not overdue
future_task = Task(
    title    = "Plan the party",
    due_date = datetime.now() + timedelta(days=7)
)
print(future_task.is_overdue)   # False

# Tasks are equal if they have the same id
# (dataclass generates __eq__ based on all fields by default)
t1 = Task(title="Same title")
t2 = Task(title="Same title")
print(t1 == t2)   # False — different ids
```

## What we learned

A class is not just a way to bundle data. It is a way to bundle data *with the rules that govern that data*. The Task class cannot be in an invalid state — Python raises an error before that happens.

This is the **Rich Domain Model** pattern. Your domain objects own their own rules.

**The test for whether you have a rich model:** can you write a test for a business rule without touching a database or a web server? If yes, you have a rich model.

```python
# This test needs nothing. No database. No server. No setup.
task = Task(title="Test task")
task.start()
task.complete()
assert task.status == TaskStatus.DONE
print("Test passed.")
```

---

# Episode 3 — Separate Storage from Logic

## The problem we are solving

Our tasks still disappear when the script ends. We need to save them somewhere. The obvious move is to add file-reading and file-writing code directly to our service logic. That is a trap.

Here is why. Imagine you write this:

```python
# The trap — storage mixed into logic

def complete_task(task_id):
    # Load from file
    with open("tasks.json") as f:
        tasks = json.load(f)

    # Find and update
    for task in tasks:
        if task["id"] == task_id:
            task["done"] = True

    # Save back to file
    with open("tasks.json", "w") as f:
        json.dump(tasks, f)
```

Now your business logic (`mark as done`) is fused with your storage logic (`read and write JSON`). To test whether the "mark as done" rule works, you need a real file on disk. To switch from JSON to SQLite, you rewrite this function. To switch from SQLite to PostgreSQL, you rewrite it again.

The fix is the **Repository pattern**. A Repository is a class that looks like a simple collection — add, get, list, update, delete — but handles all storage internally. Your logic never touches a file or a database directly. It only talks to the Repository.

## The Repository interface

We define what a Repository must be able to do, using an abstract base class. This is the *contract*.

```python
# repository.py
# The Repository interface — the contract all storage must follow.

from abc import ABC, abstractmethod
from typing import List, Optional
from task import Task


class TaskRepository(ABC):
    """
    An abstract base class is a class you cannot instantiate directly.
    It exists only to define an interface — a list of methods that
    any concrete implementation must provide.

    ABC = Abstract Base Class (from Python's abc module)
    @abstractmethod = this method MUST be overridden in subclasses
    """

    @abstractmethod
    def add(self, task: Task) -> None:
        """Save a new task. Raises ValueError if id already exists."""
        pass

    @abstractmethod
    def get(self, task_id: str) -> Optional[Task]:
        """
        Find a task by id.
        Returns the Task if found, None if not found.
        Returning None (instead of raising) is a design choice —
        it says "not found is a normal outcome, not an error."
        """
        pass

    @abstractmethod
    def list_all(self) -> List[Task]:
        """Return all tasks."""
        pass

    @abstractmethod
    def update(self, task: Task) -> None:
        """Persist changes to an existing task. Raises if not found."""
        pass

    @abstractmethod
    def delete(self, task_id: str) -> None:
        """Remove a task. Raises if not found."""
        pass

    @abstractmethod
    def find_by_status(self, status: str) -> List[Task]:
        """Return all tasks with the given status string."""
        pass
```

## The in-memory implementation

The first implementation stores everything in a Python dictionary. No files, no databases. This is perfect for development and testing.

```python
# memory_repository.py
# Stores tasks in memory. Fast. Simple. Great for tests.
# Inherits from TaskRepository — must implement all abstract methods.

from typing import List, Optional
from task import Task, TaskStatus
from repository import TaskRepository


class InMemoryTaskRepository(TaskRepository):
    """
    Stores tasks in a plain Python dictionary.
    The key is the task id. The value is the Task object.
    Data does not survive when the program ends.
    """

    def __init__(self):
        # The underscore prefix on _store is a convention meaning
        # "this is internal — don't touch it from outside the class."
        self._store: dict[str, Task] = {}

    def add(self, task: Task) -> None:
        if task.id in self._store:
            raise ValueError(f"Task with id '{task.id}' already exists.")
        self._store[task.id] = task

    def get(self, task_id: str) -> Optional[Task]:
        # dict.get() returns None if the key is missing — perfect.
        return self._store.get(task_id)

    def list_all(self) -> List[Task]:
        # We return a copy of the values, not the dict itself.
        # This prevents outside code from modifying our internal store.
        return list(self._store.values())

    def update(self, task: Task) -> None:
        if task.id not in self._store:
            raise ValueError(f"Task '{task.id}' not found. Cannot update.")
        self._store[task.id] = task

    def delete(self, task_id: str) -> None:
        if task_id not in self._store:
            raise ValueError(f"Task '{task_id}' not found. Cannot delete.")
        del self._store[task_id]

    def find_by_status(self, status: str) -> List[Task]:
        # We compare against the enum value string, e.g. "todo"
        return [
            task for task in self._store.values()
            if task.status.value == status
        ]

    def count(self) -> int:
        """Convenience method — not in the interface, but useful."""
        return len(self._store)
```

## The JSON file implementation

Now the same interface backed by a JSON file. Notice that the business logic will not change at all — we are only swapping out the storage layer.

```python
# json_repository.py
# Stores tasks in a JSON file on disk.
# Implements the same interface as InMemoryTaskRepository.

import json
import os
from datetime import datetime
from typing import List, Optional
from task import Task, TaskStatus
from repository import TaskRepository


class JSONTaskRepository(TaskRepository):
    """
    Stores tasks in a JSON file.
    Loads on every read, saves on every write.
    Simple and reliable for a small CLI app.
    """

    def __init__(self, file_path: str = "tasks.json"):
        self.file_path = file_path
        # Create the file if it does not exist yet
        if not os.path.exists(file_path):
            self._save([])

    # ---- Private helpers ----

    def _load(self) -> List[Task]:
        """Read tasks from the JSON file and return a list of Task objects."""
        with open(self.file_path, "r") as f:
            data = json.load(f)
        return [self._dict_to_task(d) for d in data]

    def _save(self, tasks: List[Task]) -> None:
        """Write a list of Task objects to the JSON file."""
        with open(self.file_path, "w") as f:
            json.dump([self._task_to_dict(t) for t in tasks], f, indent=2)

    def _task_to_dict(self, task: Task) -> dict:
        """Convert a Task object to a plain dictionary for JSON storage."""
        return {
            "id":         task.id,
            "title":      task.title,
            "status":     task.status.value,        # Store the string, not the Enum
            "created_at": task.created_at.isoformat(),
            "due_date":   task.due_date.isoformat() if task.due_date else None,
        }

    def _dict_to_task(self, data: dict) -> Task:
        """Convert a plain dictionary back into a Task object."""
        return Task(
            id         = data["id"],
            title      = data["title"],
            status     = TaskStatus(data["status"]),  # String → Enum
            created_at = datetime.fromisoformat(data["created_at"]),
            due_date   = datetime.fromisoformat(data["due_date"]) if data["due_date"] else None,
        )

    # ---- Interface implementation ----

    def add(self, task: Task) -> None:
        tasks = self._load()
        if any(t.id == task.id for t in tasks):
            raise ValueError(f"Task '{task.id}' already exists.")
        tasks.append(task)
        self._save(tasks)

    def get(self, task_id: str) -> Optional[Task]:
        tasks = self._load()
        for task in tasks:
            if task.id == task_id:
                return task
        return None

    def list_all(self) -> List[Task]:
        return self._load()

    def update(self, task: Task) -> None:
        tasks = self._load()
        for i, t in enumerate(tasks):
            if t.id == task.id:
                tasks[i] = task
                self._save(tasks)
                return
        raise ValueError(f"Task '{task.id}' not found. Cannot update.")

    def delete(self, task_id: str) -> None:
        tasks = self._load()
        original_count = len(tasks)
        tasks = [t for t in tasks if t.id != task_id]
        if len(tasks) == original_count:
            raise ValueError(f"Task '{task_id}' not found. Cannot delete.")
        self._save(tasks)

    def find_by_status(self, status: str) -> List[Task]:
        return [t for t in self._load() if t.status.value == status]
```

## Seeing the power of the interface

```python
# episode3_demo.py
# The same code works with both repositories.

from task import Task, TaskStatus
from memory_repository import InMemoryTaskRepository
from json_repository import JSONTaskRepository


def demo(repo):
    """
    This function has no idea what kind of repository it is using.
    It only knows the interface. This is the whole point.
    """
    # Add tasks
    t1 = Task(title="Buy milk")
    t2 = Task(title="Walk the dog")
    t3 = Task(title="Write tests")

    repo.add(t1)
    repo.add(t2)
    repo.add(t3)

    # Retrieve and modify
    task = repo.get(t1.id)
    task.start()
    repo.update(task)

    # Query
    active = repo.find_by_status("in_progress")
    print(f"In progress: {[t.title for t in active]}")

    # Delete
    repo.delete(t2.id)
    print(f"Remaining: {len(repo.list_all())} tasks")


# Works identically with either implementation
print("--- In-Memory ---")
demo(InMemoryTaskRepository())

print("--- JSON File ---")
demo(JSONTaskRepository("demo_tasks.json"))
```

## What we learned

The Repository pattern separates *what you do with data* from *where you store it*. Your business logic talks to an interface. Storage talks to the interface. They never talk to each other directly.

The payoff:

- **Testing:** use `InMemoryTaskRepository` — no files, no cleanup, fast
- **Switching storage:** write a new class implementing `TaskRepository` — nothing else changes
- **Reading the code:** when you see `repo.add(task)`, you know exactly what it does, regardless of what is behind it

---

# Episode 4 — Give It a Brain

## The problem we are solving

We have a Task that knows its own rules. We have a Repository that knows how to store tasks. But something is missing — the code that *coordinates* them.

Right now, if you want to complete a task you have to:

1. Ask the repository for the task
2. Call `task.complete()`
3. Ask the repository to save the updated task

That is three steps that belong together. If you forget step 3, the change is lost. If step 1 returns `None` (task not found), step 2 crashes with an unhelpful `AttributeError`.

These three steps are a *use case* — a single thing the application can do. The **Service Layer** is where use cases live.

## What a Service does

A Service is a class where each method is one action the application can perform. It:

- Calls the repository to get data
- Calls the domain object to enforce rules
- Calls the repository to save changes
- Raises clear, named errors when things go wrong

It does not know about files, databases, HTTP requests, or the terminal. It only knows about Tasks and the Repository interface.

## Custom exceptions first

Before writing the service, we define our own exception types. This lets callers distinguish between "task not found" and "task already done" without parsing error message strings.

```python
# exceptions.py
# Custom exceptions for the todo app.
# Small but important — named errors make error handling readable.

class TodoError(Exception):
    """Base exception for all todo app errors."""
    pass

class TaskNotFoundError(TodoError):
    """Raised when a task id does not exist in the repository."""
    def __init__(self, task_id: str):
        self.task_id = task_id
        super().__init__(f"Task '{task_id}' not found.")

class TaskAlreadyCompleteError(TodoError):
    """Raised when trying to complete an already-complete task."""
    def __init__(self, task_id: str):
        self.task_id = task_id
        super().__init__(f"Task '{task_id}' is already complete.")

class InvalidTaskDataError(TodoError):
    """Raised when provided data is invalid."""
    pass
```

## The Service class

```python
# service.py
# The TaskService — where use cases live.
# This is the brain of the application.

from datetime import datetime
from typing import List, Optional

from task import Task, TaskStatus
from repository import TaskRepository
from exceptions import TaskNotFoundError, TaskAlreadyCompleteError, InvalidTaskDataError


class TaskService:
    """
    Each method in this class is one thing the user can do.
    The service coordinates between the domain (Task) and storage (Repository).

    It receives a repository — it does not create one.
    This is called Dependency Injection, and we will talk about it more
    in a later episode. For now: the service does not care what kind of
    repository it gets. It just uses the interface.
    """

    def __init__(self, repository: TaskRepository):
        self._repo = repository

    # ---- Use cases ----

    def create_task(self, title: str, due_date: Optional[datetime] = None) -> Task:
        """
        Create a new task and save it.
        Validates the title before creating anything.
        """
        # Guard clause — check the precondition first, exit early if invalid.
        # This keeps the happy path at the top level, unindented.
        title = title.strip() if title else ""
        if not title:
            raise InvalidTaskDataError("Task title cannot be empty.")
        if len(title) > 200:
            raise InvalidTaskDataError("Task title is too long (max 200 characters).")

        task = Task(title=title, due_date=due_date)
        self._repo.add(task)
        return task

    def get_task(self, task_id: str) -> Task:
        """Fetch a task by id. Raises TaskNotFoundError if missing."""
        task = self._repo.get(task_id)
        if task is None:
            raise TaskNotFoundError(task_id)
        return task

    def list_tasks(self, status: Optional[str] = None) -> List[Task]:
        """
        Return all tasks, optionally filtered by status.
        status should be "todo", "in_progress", or "done".
        """
        if status:
            return self._repo.find_by_status(status)
        return self._repo.list_all()

    def start_task(self, task_id: str) -> Task:
        """Move a task to in-progress."""
        task = self._get_or_raise(task_id)
        task.start()                 # Domain rule enforced on the Task object
        self._repo.update(task)      # Persist the change
        return task

    def complete_task(self, task_id: str) -> Task:
        """Mark a task as done."""
        task = self._get_or_raise(task_id)
        try:
            task.complete()
        except ValueError:
            # The Task raised a ValueError. We translate it into our
            # own named exception so callers get something meaningful.
            raise TaskAlreadyCompleteError(task_id)
        self._repo.update(task)
        return task

    def reopen_task(self, task_id: str) -> Task:
        """Put a completed task back to TODO."""
        task = self._get_or_raise(task_id)
        task.reopen()
        self._repo.update(task)
        return task

    def delete_task(self, task_id: str) -> None:
        """Delete a task permanently."""
        self._get_or_raise(task_id)   # Verify it exists before deleting
        self._repo.delete(task_id)

    def rename_task(self, task_id: str, new_title: str) -> Task:
        """Change a task's title."""
        new_title = new_title.strip() if new_title else ""
        if not new_title:
            raise InvalidTaskDataError("New title cannot be empty.")

        task = self._get_or_raise(task_id)

        if task.status == TaskStatus.DONE:
            raise InvalidTaskDataError("Cannot rename a completed task.")

        task.title = new_title
        self._repo.update(task)
        return task

    def get_overdue_tasks(self) -> List[Task]:
        """Return all tasks that are past their due date."""
        return [t for t in self._repo.list_all() if t.is_overdue]

    # ---- Private helpers ----

    def _get_or_raise(self, task_id: str) -> Task:
        """
        Fetch a task or raise TaskNotFoundError.
        This helper removes the repeated "get then check for None"
        pattern from every use case method.
        """
        task = self._repo.get(task_id)
        if task is None:
            raise TaskNotFoundError(task_id)
        return task
```

## Using the service

```python
# episode4_demo.py
# The service in action.

from memory_repository import InMemoryTaskRepository
from service import TaskService
from exceptions import TaskNotFoundError, TaskAlreadyCompleteError

# Build the service with an in-memory repository
# (We will switch to JSON in the next episode)
repo    = InMemoryTaskRepository()
service = TaskService(repo)

# --- Create ---
t1 = service.create_task("Buy milk")
t2 = service.create_task("Walk the dog")
t3 = service.create_task("Write tests")

print(f"Created {len(service.list_tasks())} tasks")

# --- Work through the lifecycle ---
service.start_task(t1.id)
service.complete_task(t1.id)

# --- List filtered ---
active = service.list_tasks(status="todo")
print(f"Still todo: {len(active)}")

done = service.list_tasks(status="done")
print(f"Done: {len(done)}")

# --- Error handling ---
try:
    service.complete_task(t1.id)    # Already done
except TaskAlreadyCompleteError as e:
    print(f"Expected error: {e}")

try:
    service.get_task("made-up-id")
except TaskNotFoundError as e:
    print(f"Expected error: {e}")

# --- The layered picture ---
# service.create_task()           <- we call this
#   Task(title=...)               <- service creates a domain object
#   repo.add(task)                <- service asks repository to save it
#     self._store[task.id] = task <- repository does the actual storage
```

## What we learned

The **Service Layer** is where use cases live. One method per action. The service coordinates, but does not implement the rules (the Task does that) and does not implement storage (the Repository does that).

The layers so far:

```
You (the user)
     ↓ calls
TaskService (business logic — "what can the user do?")
     ↓ uses
TaskRepository (storage interface — "how do we save things?")
     ↓ implemented by
InMemoryTaskRepository / JSONTaskRepository
```

Each layer only knows about the layer directly below it. The service never reads from a file. The repository never enforces business rules.

---

# Episode 5 — Save It to Disk

## The problem we are solving

Our tasks still disappear when the program ends. We built `JSONTaskRepository` in Episode 3 — now we connect it to the service. This episode is short because the Repository pattern already did the hard work. Switching storage is one line.

## Connecting JSON storage

```python
# episode5_demo.py
# Switching from in-memory to JSON storage.
# Notice: the service code does not change at all.

from json_repository import JSONTaskRepository
from service import TaskService
from exceptions import TaskNotFoundError

# This is the only line that changes compared to Episode 4.
# The service does not know or care what changed.
repo    = JSONTaskRepository("my_tasks.json")
service = TaskService(repo)

# Create some tasks (run this once, then comment it out)
t1 = service.create_task("Buy milk")
t2 = service.create_task("Walk the dog")
print(f"Created tasks with ids: {t1.id}, {t2.id}")

# Now run the script again. The tasks are still there.
tasks = service.list_tasks()
print(f"Tasks loaded from file: {len(tasks)}")
for task in tasks:
    print(f"  {task}")
```

## A closer look at serialization

When we save a Task to JSON we have to convert it to a plain dictionary. When we load it back we have to convert the dictionary back to a Task. This is called **serialization** (object → storable format) and **deserialization** (storable format → object).

The conversion lives inside `JSONTaskRepository`, which is exactly right. The rest of the app never thinks about JSON — it only thinks about Tasks.

```python
# serialization_demo.py
# Understanding what happens when tasks are saved and loaded.

import json
from json_repository import JSONTaskRepository
from task import Task, TaskStatus
from datetime import datetime, timedelta

repo = JSONTaskRepository("serialization_demo.json")

# Create a task with a due date
task = Task(
    title    = "Prepare presentation",
    due_date = datetime.now() + timedelta(days=3)
)
repo.add(task)

# Look at the raw JSON file content
with open("serialization_demo.json") as f:
    raw = json.load(f)

print("Raw JSON:")
print(json.dumps(raw, indent=2))
# [
#   {
#     "id": "a1b2c3d4",
#     "title": "Prepare presentation",
#     "status": "todo",
#     "created_at": "2024-12-01T14:23:11.405123",
#     "due_date": "2024-12-04T14:23:11.405131"
#   }
# ]

# Load it back — we get a proper Task object with enum status
loaded = repo.get(task.id)
print(f"\nLoaded task type:   {type(loaded)}")
print(f"Status type:        {type(loaded.status)}")
print(f"Status value:       {loaded.status}")
print(f"is_overdue works:   {loaded.is_overdue}")
```

## What we learned

Persistence was one line. That is what the Repository pattern buys you — you can change *how* data is stored without changing *anything else* in the application. The service did not change. The Task did not change. Only the repository implementation changed.

This is called the **Open/Closed Principle** in action: open for extension (add a new repository implementation), closed for modification (don't change existing code that works).

---

# Episode 6 — A Real Command Line Interface

## The problem we are solving

Right now, to use the app you have to write Python. We need a proper command line interface — one that reads commands and arguments from the terminal and routes them to the service.

We also have a design problem: if we put all the command-line parsing and output formatting directly next to the service calls, we mix three concerns in one place:

- **Parsing** — reading what the user typed
- **Calling the service** — doing the actual work
- **Displaying** — printing results back to the user

The **Facade pattern** gives us a clean boundary. The CLI talks to the Facade. The Facade talks to everything else. The CLI never touches the repository or the task objects directly.

## The Facade

```python
# facade.py
# The single entry point for the application.
# Hides all internal wiring behind a clean, simple interface.

from datetime import datetime
from typing import List, Optional

from json_repository import JSONTaskRepository
from service import TaskService
from task import Task
from exceptions import TodoError


class TodoApp:
    """
    The Facade for the entire todo application.

    Callers (the CLI, tests, a future web API) only need this class.
    They never import the repository, the service, or the Task directly.

    The Facade:
    - Wires up all the internal components
    - Exposes a clean, simple set of actions
    - Translates between the CLI's world (strings) and the app's world (objects)
    - Handles and formats errors consistently
    """

    def __init__(self, data_file: str = "tasks.json"):
        # Internal wiring — callers never see this
        self._repo    = JSONTaskRepository(data_file)
        self._service = TaskService(self._repo)

    # ---- Actions — one per thing the user can do ----

    def add(self, title: str, due_date_str: Optional[str] = None) -> str:
        """
        Add a new task. Returns a human-readable result string.
        due_date_str should be "YYYY-MM-DD" if provided.
        """
        due_date = None
        if due_date_str:
            try:
                due_date = datetime.strptime(due_date_str, "%Y-%m-%d")
            except ValueError:
                return f"Error: '{due_date_str}' is not a valid date. Use YYYY-MM-DD."

        try:
            task = self._service.create_task(title, due_date)
            return f"Added [{task.id}]: {task.title}"
        except TodoError as e:
            return f"Error: {e}"

    def list_tasks(self, status: Optional[str] = None) -> str:
        """
        List tasks. Returns a formatted string ready to print.
        """
        try:
            tasks = self._service.list_tasks(status)
        except TodoError as e:
            return f"Error: {e}"

        if not tasks:
            label = f"'{status}'" if status else "any"
            return f"No {label} tasks found."

        lines = []
        for task in sorted(tasks, key=lambda t: t.created_at):
            lines.append(str(task))

        header = f"Tasks ({status or 'all'}):"
        return header + "\n" + "\n".join(f"  {line}" for line in lines)

    def start(self, task_id: str) -> str:
        try:
            task = self._service.start_task(task_id)
            return f"Started: {task.title}"
        except TodoError as e:
            return f"Error: {e}"

    def done(self, task_id: str) -> str:
        try:
            task = self._service.complete_task(task_id)
            return f"Completed: {task.title}"
        except TodoError as e:
            return f"Error: {e}"

    def reopen(self, task_id: str) -> str:
        try:
            task = self._service.reopen_task(task_id)
            return f"Reopened: {task.title}"
        except TodoError as e:
            return f"Error: {e}"

    def delete(self, task_id: str) -> str:
        try:
            self._service.delete_task(task_id)
            return f"Deleted task {task_id}."
        except TodoError as e:
            return f"Error: {e}"

    def rename(self, task_id: str, new_title: str) -> str:
        try:
            task = self._service.rename_task(task_id, new_title)
            return f"Renamed to: {task.title}"
        except TodoError as e:
            return f"Error: {e}"

    def overdue(self) -> str:
        tasks = self._service.get_overdue_tasks()
        if not tasks:
            return "No overdue tasks. Great work."
        lines = [str(t) for t in tasks]
        return "Overdue tasks:\n" + "\n".join(f"  {line}" for line in lines)
```

## The CLI entry point

```python
# todo.py
# The command-line interface.
# This file is what the user runs: python todo.py add "Buy milk"
#
# Its only job: read what the user typed and call the Facade.
# All actual work happens in the Facade and below.

import sys
from facade import TodoApp

# The help text — shown when the user types python todo.py or --help
HELP = """
Usage: python todo.py <command> [arguments]

Commands:
  add <title> [--due YYYY-MM-DD]   Add a new task
  list [--status todo|in_progress|done]  List tasks
  start <id>                        Start a task
  done <id>                         Complete a task
  reopen <id>                       Reopen a completed task
  delete <id>                       Delete a task
  rename <id> <new title>           Rename a task
  overdue                           Show overdue tasks

Examples:
  python todo.py add "Buy milk"
  python todo.py add "Submit report" --due 2024-12-15
  python todo.py list
  python todo.py list --status todo
  python todo.py done a1b2c3d4
""".strip()


def main():
    app  = TodoApp()
    args = sys.argv[1:]   # Everything after "todo.py"

    # No arguments — show help
    if not args or args[0] in ("--help", "-h", "help"):
        print(HELP)
        return

    command = args[0]

    if command == "add":
        if len(args) < 2:
            print("Usage: python todo.py add <title> [--due YYYY-MM-DD]")
            return
        # Join all parts of the title (handles multi-word titles)
        # But stop at --due if it appears
        title_parts = []
        due_date    = None
        i = 1
        while i < len(args):
            if args[i] == "--due" and i + 1 < len(args):
                due_date = args[i + 1]
                i += 2
            else:
                title_parts.append(args[i])
                i += 1
        title = " ".join(title_parts)
        print(app.add(title, due_date))

    elif command == "list":
        status = None
        if "--status" in args:
            idx = args.index("--status")
            if idx + 1 < len(args):
                status = args[idx + 1]
        print(app.list_tasks(status))

    elif command == "start":
        if len(args) < 2:
            print("Usage: python todo.py start <id>")
            return
        print(app.start(args[1]))

    elif command == "done":
        if len(args) < 2:
            print("Usage: python todo.py done <id>")
            return
        print(app.done(args[1]))

    elif command == "reopen":
        if len(args) < 2:
            print("Usage: python todo.py reopen <id>")
            return
        print(app.reopen(args[1]))

    elif command == "delete":
        if len(args) < 2:
            print("Usage: python todo.py delete <id>")
            return
        print(app.delete(args[1]))

    elif command == "rename":
        if len(args) < 3:
            print("Usage: python todo.py rename <id> <new title>")
            return
        task_id   = args[1]
        new_title = " ".join(args[2:])
        print(app.rename(task_id, new_title))

    elif command == "overdue":
        print(app.overdue())

    else:
        print(f"Unknown command: '{command}'")
        print("Run 'python todo.py --help' for usage.")


# This check means: only run main() if this file is run directly.
# If it is imported by another file, main() does not run.
# This is important for testing — tests import this module without
# triggering the CLI.
if __name__ == "__main__":
    main()
```

## Try the full app

```
python todo.py add "Buy milk"
python todo.py add "Submit the report" --due 2024-12-15
python todo.py add "Walk the dog"
python todo.py list
python todo.py start a1b2c3d4
python todo.py list --status in_progress
python todo.py done a1b2c3d4
python todo.py list
python todo.py overdue
```

## What we learned

The **Facade pattern** gives you a clean single entry point. The CLI does not need to know about repositories, services, or Task objects. It just calls the Facade and prints the result.

The full picture now:

```
python todo.py add "Buy milk"
        ↓
todo.py (CLI — parses arguments)
        ↓
TodoApp (Facade — routes to the right action)
        ↓
TaskService (Service — business logic)
        ↓
TaskRepository (Interface)
        ↓
JSONTaskRepository (saves to tasks.json)
```

---

# Episode 7 — Don't Trust the User

## The problem we are solving

Right now, bad input causes ugly crashes. Try this:

```
python todo.py add ""
python todo.py done not-a-real-id
python todo.py add "Buy milk" --due yesterday
```

We need to handle these gracefully — tell the user what went wrong clearly, without a stack trace, without crashing.

We also have a subtler problem: as the app grows, the same validation logic gets duplicated. "Title must not be empty" appears in the service, in the CLI, maybe in a future web API. When the rule changes, you have to find all three places.

The solution is a dedicated **Validator** — one place where all the rules about valid input live. The Service uses it. The CLI uses it. The future web API will use it. There is exactly one place to update when a rule changes.

## Guard clauses — the micro-pattern

Before we build the full validator, notice the pattern inside every validation check: check for a problem, exit early if found.

```python
# guard_clauses_demo.py
# Two ways to write the same validation. One is much easier to read.

# --- WITHOUT guard clauses ---
# The happy path is buried at the bottom of nested ifs.
# You have to read the whole thing to find what actually happens.

def process_without_guards(title, due_date, user_id):
    if title:
        if len(title) <= 200:
            if user_id:
                if due_date is None or due_date > datetime.now():
                    # Finally, the actual work — buried 4 levels deep
                    return create_task(title, due_date, user_id)
                else:
                    raise ValueError("Due date is in the past")
            else:
                raise ValueError("User id is required")
        else:
            raise ValueError("Title too long")
    else:
        raise ValueError("Title is required")


# --- WITH guard clauses ---
# Each problem is handled at the top and exits immediately.
# The happy path stays at the same indentation level as the guards.
# You read top to bottom: all the "what can go wrong", then "what happens".

def process_with_guards(title, due_date, user_id):
    if not title:
        raise ValueError("Title is required.")
    if len(title) > 200:
        raise ValueError("Title is too long (max 200 characters).")
    if not user_id:
        raise ValueError("User id is required.")
    if due_date is not None and due_date <= datetime.now():
        raise ValueError("Due date must be in the future.")

    # Happy path — clean, obvious, unindented
    return create_task(title, due_date, user_id)
```

## The Validator — collect all errors at once

Raising one error at a time means the user fixes one problem, submits again, hits the next one. A better experience: collect *all* the problems and report them together.

```python
# validator.py
# Validation objects — collect all errors, report at once.

from dataclasses import dataclass, field
from datetime import datetime
from typing import List, Optional


@dataclass
class ValidationError:
    """One validation failure. Has a field name and a message."""
    field:   str
    message: str

    def __str__(self):
        return f"{self.field}: {self.message}"


class ValidationResult:
    """
    Collects validation errors.
    Acts like a boolean — True means valid, False means invalid.
    """

    def __init__(self):
        self._errors: List[ValidationError] = []

    def add_error(self, field: str, message: str) -> "ValidationResult":
        """Add an error. Returns self so you can chain calls."""
        self._errors.append(ValidationError(field, message))
        return self

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
        """If there are errors, raise a ValueError listing all of them."""
        if not self.is_valid:
            messages = "\n".join(f"  • {e}" for e in self._errors)
            raise ValueError(f"Validation failed:\n{messages}")

    # Making ValidationResult behave like a boolean:
    # if result: means "if result is valid"
    def __bool__(self) -> bool:
        return self.is_valid

    def __repr__(self) -> str:
        if self.is_valid:
            return "ValidationResult(valid)"
        return f"ValidationResult({len(self._errors)} error(s))"


class TaskValidator:
    """
    All validation rules for tasks in one place.
    This is the single source of truth for what makes valid task data.
    """

    MAX_TITLE_LENGTH = 200

    @classmethod
    def validate_create(
        cls,
        title:    str,
        due_date: Optional[datetime] = None
    ) -> ValidationResult:
        """Validate data for creating a new task."""
        result = ValidationResult()

        # Title checks
        if not title or not title.strip():
            result.add_error("title", "Title is required.")
        elif len(title.strip()) > cls.MAX_TITLE_LENGTH:
            result.add_error(
                "title",
                f"Title is too long ({len(title.strip())} characters, max {cls.MAX_TITLE_LENGTH})."
            )

        # Due date checks
        if due_date is not None:
            if not isinstance(due_date, datetime):
                result.add_error("due_date", "Due date must be a datetime object.")
            elif due_date < datetime.now():
                result.add_error("due_date", "Due date cannot be in the past.")

        return result

    @classmethod
    def validate_rename(cls, new_title: str) -> ValidationResult:
        """Validate a new title for an existing task."""
        result = ValidationResult()

        if not new_title or not new_title.strip():
            result.add_error("title", "New title cannot be empty.")
        elif len(new_title.strip()) > cls.MAX_TITLE_LENGTH:
            result.add_error(
                "title",
                f"Title too long (max {cls.MAX_TITLE_LENGTH} characters)."
            )

        return result
```

## Updating the service to use the validator

```python
# service_v2.py
# TaskService updated to use TaskValidator.
# The service no longer contains any validation logic itself.

from datetime import datetime
from typing import List, Optional

from task import Task, TaskStatus
from repository import TaskRepository
from exceptions import TaskNotFoundError, TaskAlreadyCompleteError, InvalidTaskDataError
from validator import TaskValidator


class TaskService:

    def __init__(self, repository: TaskRepository):
        self._repo = repository

    def create_task(self, title: str, due_date: Optional[datetime] = None) -> Task:
        # One line of validation — all rules in TaskValidator
        TaskValidator.validate_create(title, due_date).raise_if_invalid()

        task = Task(title=title.strip(), due_date=due_date)
        self._repo.add(task)
        return task

    def rename_task(self, task_id: str, new_title: str) -> Task:
        TaskValidator.validate_rename(new_title).raise_if_invalid()

        task = self._get_or_raise(task_id)
        if task.status == TaskStatus.DONE:
            raise InvalidTaskDataError("Cannot rename a completed task.")

        task.title = new_title.strip()
        self._repo.update(task)
        return task

    # ... (all other methods remain the same as Episode 4)

    def _get_or_raise(self, task_id: str) -> Task:
        task = self._repo.get(task_id)
        if task is None:
            raise TaskNotFoundError(task_id)
        return task
```

## Seeing validation in action

```python
# episode7_demo.py

from validator import TaskValidator
from datetime import datetime, timedelta

# --- Single error ---
result = TaskValidator.validate_create(title="")
print(result)           # ValidationResult(1 error(s))
print(result.is_valid)  # False

# --- Multiple errors at once ---
result = TaskValidator.validate_create(
    title    = "",
    due_date = datetime(2000, 1, 1)   # Way in the past
)
for error in result.errors:
    print(error)
# title: Title is required.
# due_date: Due date cannot be in the past.

# --- Raising all errors together ---
try:
    result.raise_if_invalid()
except ValueError as e:
    print(e)
# Validation failed:
#   • title: Title is required.
#   • due_date: Due date cannot be in the past.

# --- Valid input ---
result = TaskValidator.validate_create(
    title    = "Buy milk",
    due_date = datetime.now() + timedelta(days=3)
)
print(result)           # ValidationResult(valid)
print(bool(result))     # True

if result:
    print("All good — proceed.")
```

## What we learned

**Guard clauses** keep validation readable by checking preconditions first and exiting early. The happy path stays clean and unindented.

**Validation objects** collect all errors before reporting, giving users a complete picture of what needs to be fixed. The `ValidationResult` class makes "is this valid?" a first-class concept that can be passed around, inspected, and acted on.

**Single source of truth** — all validation rules for tasks live in `TaskValidator`. Nothing else needs to know the rules.

---

# Episode 8 — Things That Happen Automatically

## The problem we are solving

When a task is completed, we might want to: print a congratulation message, log the event, update a counter, send a notification. Right now we would have to put all of that inside `complete_task` in the service. The service would grow into a massive method that knows about logging, notifications, metrics, and printing.

The **Observer pattern** (also called an Event System) solves this. The service fires an event — "a task was completed". Anything that cares about that event registers as a listener. The service does not know or care who is listening.

This is the same idea as how a button in a UI works: the button does not know what happens when you click it. It just fires a "clicked" event. Multiple listeners react independently.

## The Event Bus

```python
# events.py
# A simple event system.
# Publishers fire events. Subscribers react to them.
# They never talk to each other directly.

from typing import Callable, Dict, List, Any


class EventBus:
    """
    A central hub for publishing and subscribing to named events.

    Think of it like a radio tower:
    - Publishers broadcast on a frequency (event name)
    - Subscribers tune in to frequencies they care about
    - The tower does not know or care who is broadcasting or listening
    """

    def __init__(self):
        # A dictionary mapping event names to lists of handler functions
        self._listeners: Dict[str, List[Callable]] = {}

    def subscribe(self, event_name: str, handler: Callable) -> None:
        """
        Register a function to be called when event_name is published.
        The handler will be called with keyword arguments matching
        whatever was passed to publish().
        """
        if event_name not in self._listeners:
            self._listeners[event_name] = []
        self._listeners[event_name].append(handler)

    def on(self, event_name: str) -> Callable:
        """
        Decorator version of subscribe.
        Use this to register a function as a listener elegantly.

        @bus.on("task.completed")
        def my_handler(task):
            ...
        """
        def decorator(func: Callable) -> Callable:
            self.subscribe(event_name, func)
            return func
        return decorator

    def publish(self, event_name: str, **data) -> None:
        """
        Fire an event. All registered handlers are called with data
        as keyword arguments.
        If no one is listening, nothing happens — no error.
        """
        handlers = self._listeners.get(event_name, [])
        for handler in handlers:
            handler(**data)

    def unsubscribe(self, event_name: str, handler: Callable) -> None:
        """Remove a specific handler from an event."""
        if event_name in self._listeners:
            try:
                self._listeners[event_name].remove(handler)
            except ValueError:
                pass  # Handler was not registered — that's fine


# ---- Predefined event names ----
# Using constants instead of strings prevents typos.
# "task.created" vs "task.craeted" — constants catch this at import time.

class TaskEvents:
    CREATED   = "task.created"
    STARTED   = "task.started"
    COMPLETED = "task.completed"
    DELETED   = "task.deleted"
    OVERDUE   = "task.overdue"
```

## Updating the service to publish events

```python
# service_v3.py
# TaskService that publishes events when things happen.
# The service does its job, then announces what happened.
# It does not know or care who is listening.

from datetime import datetime
from typing import List, Optional

from task import Task, TaskStatus
from repository import TaskRepository
from exceptions import TaskNotFoundError, TaskAlreadyCompleteError, InvalidTaskDataError
from validator import TaskValidator
from events import EventBus, TaskEvents


class TaskService:

    def __init__(self, repository: TaskRepository, event_bus: EventBus = None):
        self._repo = repository
        # If no event bus is provided, create a silent one.
        # This means all existing code that doesn't use events still works.
        self._bus  = event_bus or EventBus()

    def create_task(self, title: str, due_date: Optional[datetime] = None) -> Task:
        TaskValidator.validate_create(title, due_date).raise_if_invalid()
        task = Task(title=title.strip(), due_date=due_date)
        self._repo.add(task)
        # Announce that a task was created.
        # We pass the task as a keyword argument.
        # Listeners receive it as: def handler(task): ...
        self._bus.publish(TaskEvents.CREATED, task=task)
        return task

    def start_task(self, task_id: str) -> Task:
        task = self._get_or_raise(task_id)
        task.start()
        self._repo.update(task)
        self._bus.publish(TaskEvents.STARTED, task=task)
        return task

    def complete_task(self, task_id: str) -> Task:
        task = self._get_or_raise(task_id)
        try:
            task.complete()
        except ValueError:
            raise TaskAlreadyCompleteError(task_id)
        self._repo.update(task)
        self._bus.publish(TaskEvents.COMPLETED, task=task)
        return task

    def delete_task(self, task_id: str) -> None:
        task = self._get_or_raise(task_id)
        self._repo.delete(task_id)
        self._bus.publish(TaskEvents.DELETED, task=task)

    # ... other methods unchanged

    def _get_or_raise(self, task_id: str) -> Task:
        task = self._repo.get(task_id)
        if task is None:
            raise TaskNotFoundError(task_id)
        return task
```

## Listeners — each one focused on one thing

```python
# listeners.py
# Side effects as focused, independent listeners.
# Each listener does exactly one thing.
# None of them know about each other.

from task import Task
from typing import List
from datetime import datetime


class AuditLog:
    """Records every significant action with a timestamp."""

    def __init__(self):
        self.entries: List[str] = []

    def on_created(self, task: Task) -> None:
        self._record(f"CREATED  '{task.title}' (id={task.id})")

    def on_started(self, task: Task) -> None:
        self._record(f"STARTED  '{task.title}' (id={task.id})")

    def on_completed(self, task: Task) -> None:
        self._record(f"COMPLETED '{task.title}' (id={task.id})")

    def on_deleted(self, task: Task) -> None:
        self._record(f"DELETED  '{task.title}' (id={task.id})")

    def _record(self, message: str) -> None:
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        entry     = f"[{timestamp}] {message}"
        self.entries.append(entry)
        print(entry)   # Also print to console for now


class Motivator:
    """
    Prints encouraging messages when tasks are completed.
    Completely optional — can be removed without affecting anything.
    """

    MESSAGES = [
        "Great work! Keep it up.",
        "One down. You're on a roll.",
        "That's the way. Progress!",
        "Done and dusted. Nice.",
    ]
    _index = 0

    def on_completed(self, task: Task) -> None:
        msg = self.MESSAGES[self._index % len(self.MESSAGES)]
        self.__class__._index += 1
        print(f"  ✨ {msg}")


class OverdueChecker:
    """
    Checks for overdue tasks when the app starts up.
    Could also be run on a schedule.
    """

    def __init__(self, service):
        self._service = service

    def check(self) -> None:
        overdue = self._service.get_overdue_tasks()
        if overdue:
            print(f"\n⚠️  You have {len(overdue)} overdue task(s):")
            for task in overdue:
                print(f"   {task}")
            print()
```

## The updated Facade — wiring it all together

```python
# facade_v2.py
# TodoApp updated to use the event system.

from datetime import datetime
from typing import Optional

from json_repository import JSONTaskRepository
from service_v3 import TaskService
from events import EventBus, TaskEvents
from listeners import AuditLog, Motivator, OverdueChecker
from exceptions import TodoError


class TodoApp:
    """
    The Facade. Now wires up the event system too.
    Callers still only see this class — nothing else changed from their perspective.
    """

    def __init__(self, data_file: str = "tasks.json"):
        # Set up the event bus
        self._bus = EventBus()

        # Set up listeners
        self._audit    = AuditLog()
        self._motivator = Motivator()

        # Subscribe listeners to events they care about
        self._bus.subscribe(TaskEvents.CREATED,   self._audit.on_created)
        self._bus.subscribe(TaskEvents.STARTED,   self._audit.on_started)
        self._bus.subscribe(TaskEvents.COMPLETED, self._audit.on_completed)
        self._bus.subscribe(TaskEvents.COMPLETED, self._motivator.on_completed)
        self._bus.subscribe(TaskEvents.DELETED,   self._audit.on_deleted)

        # Set up storage and service
        self._repo    = JSONTaskRepository(data_file)
        self._service = TaskService(self._repo, self._bus)

        # Check for overdue tasks on startup
        checker = OverdueChecker(self._service)
        checker.check()

    def add(self, title: str, due_date_str: Optional[str] = None) -> str:
        due_date = None
        if due_date_str:
            try:
                due_date = datetime.strptime(due_date_str, "%Y-%m-%d")
            except ValueError:
                return f"Error: '{due_date_str}' is not a valid date. Use YYYY-MM-DD."
        try:
            task = self._service.create_task(title, due_date)
            return f"Added [{task.id}]: {task.title}"
        except TodoError as e:
            return f"Error: {e}"

    def done(self, task_id: str) -> str:
        try:
            task = self._service.complete_task(task_id)
            return f"Completed: {task.title}"
        except TodoError as e:
            return f"Error: {e}"

    def list_tasks(self, status: Optional[str] = None) -> str:
        try:
            tasks = self._service.list_tasks(status)
        except TodoError as e:
            return f"Error: {e}"
        if not tasks:
            return "No tasks found."
        lines = [str(t) for t in sorted(tasks, key=lambda t: t.created_at)]
        return "\n".join(f"  {line}" for line in lines)

    def audit(self) -> str:
        if not self._audit.entries:
            return "No audit entries yet."
        return "\n".join(self._audit.entries)
```

## Seeing it all work together

```python
# episode8_demo.py

from facade_v2 import TodoApp

app = TodoApp()

# Add tasks
app.add("Buy milk")
app.add("Write tests")
t = app.add("Submit the report")

# Work through them
task_id = t.split("[")[1].split("]")[0]  # Parse id from "Added [a1b2c3]: ..."

app.done(task_id)

# List everything
print("\n--- All tasks ---")
print(app.list_tasks())

# Audit trail
print("\n--- Audit log ---")
print(app.audit())

# Adding a new side effect is one new listener + one subscribe() call.
# The service code does not change at all.
```

## What we learned

The **Observer pattern** (event system) decouples causes from effects. When a task is completed, the service says "task completed" — it does not say "log this, notify the user, update the counter". Each of those concerns is a separate listener that reacts independently.

Adding a new side effect means writing a new listener and adding one `subscribe()` call. Nothing else changes. This is as clean as it gets for handling side effects.

---

# Where We Are — The Full Picture

You have built a complete, layered command-line application. Here is every file and what it does:

```
task.py              The domain model — what a Task is and what it can do
repository.py        The storage interface — what any storage must provide
memory_repository.py In-memory storage — for development and tests
json_repository.py   File-based storage — for real persistence
exceptions.py        Named error types — for readable error handling
validator.py         Validation rules — one place, used everywhere
events.py            The event system — publish/subscribe
listeners.py         Side effects — each one independent and focused
service.py           Use cases — one method per action the user can do
facade.py            The entry point — hides all internal wiring
todo.py              The CLI — reads arguments, calls the Facade, prints results
```

And the layered architecture:

```
todo.py (CLI)
    ↓ calls
TodoApp (Facade — single entry point)
    ↓ uses
TaskService (Service — business logic and use cases)
    ↓ uses                          ↓ publishes to
TaskRepository (Interface)      EventBus
    ↓ implemented by                ↓ notifies
JSONTaskRepository          AuditLog, Motivator, OverdueChecker
```

Each arrow represents a dependency. Each layer only depends on the layer below it. The CLI never touches the repository. The repository never calls the service. Side effects never call each other.

---

# What Comes Next — Series 2 Preview

In Series 2 we take this exact same application and add a web API using FastAPI. Almost nothing changes — and that is the lesson. When your architecture is clean, adding a new interface (HTTP instead of CLI) means:

- Writing route handlers that call the Facade (same as the CLI calling the Facade)
- Adding request/response models (FastAPI's version of argument parsing)
- Running a server instead of a script

The domain, service, repository, and events are untouched. You built them once. They work everywhere.

That is what good architecture actually feels like.
