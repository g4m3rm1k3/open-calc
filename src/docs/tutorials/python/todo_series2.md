# Building a Todo Web App — From Scratch to Full Stack

## A Python Code-Along Series

> **How this series works:** We build a complete web application from nothing — a FastAPI backend, a PostgreSQL database, and a plain HTML/JavaScript frontend. Every episode introduces one new concept and explains *why* it exists, not just how to use it. No frameworks are assumed. No magic is hidden.
>
> **What you need:** Python 3.10+, PostgreSQL installed locally, a terminal, a code editor, and a browser.
>
> **What you will build:** A todo app with a REST API that saves to a real database, served to a browser frontend that talks to it over HTTP.

---

# Episode 1 — What Is a Web API and Why Do We Need One?

## Before we write any code

In Series 1 we built a command-line todo app. The user typed `python todo.py add "Buy milk"` and the app responded. That worked, but it has limits:

- Only one person can use it at a time
- Only works on the machine where the files are
- A phone or browser can't use it
- Other programs can't talk to it

A **web API** solves all of these. Instead of reading command-line arguments, it listens for HTTP requests — the same kind your browser makes when you visit a website. Any device that can make an HTTP request can use it. That means browsers, phones, other servers, and other programs.

## What HTTP actually is

HTTP is a protocol — a set of rules for how computers talk to each other over a network. When you type a URL into a browser, the browser sends an HTTP **request** to a server. The server sends back an HTTP **response**.

A request has:
- A **method** — what kind of action (`GET`, `POST`, `PUT`, `DELETE`)
- A **path** — what resource (`/tasks`, `/tasks/a1b2c3`)
- A **body** — optional data sent with the request (usually JSON)
- **Headers** — metadata (content type, authentication tokens, etc.)

A response has:
- A **status code** — what happened (`200 OK`, `404 Not Found`, `422 Unprocessable Entity`)
- A **body** — the data being returned (usually JSON)
- **Headers** — metadata

## What REST means

REST is a style for designing APIs. The key idea: **resources are nouns, methods are verbs**.

```
GET    /tasks          → list all tasks
POST   /tasks          → create a new task
GET    /tasks/{id}     → get one task
PUT    /tasks/{id}     → update a task
DELETE /tasks/{id}     → delete a task
```

You don't have URLs like `/completeTask` or `/getTaskById`. You have resources (`/tasks`) and you use the HTTP method to say what you want to do with them.

## What FastAPI is

FastAPI is a Python library for building web APIs. It:
- Reads incoming HTTP requests and routes them to the right Python function
- Validates request data automatically (using type hints)
- Serializes Python objects to JSON for responses
- Generates interactive documentation automatically

It is not magic — it is a library that handles the boring HTTP plumbing so you can focus on your application logic.

## Setting up the project

```bash
# Create a project folder
mkdir todo_api
cd todo_api

# Create a virtual environment
# A virtual environment is an isolated Python installation for this project.
# It keeps your project's dependencies separate from other projects.
python -m venv venv

# Activate it
# On Mac/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install dependencies
pip install fastapi uvicorn[standard] psycopg2-binary python-dotenv

# fastapi        — the web framework
# uvicorn        — the server that runs FastAPI (ASGI server)
# psycopg2-binary — PostgreSQL driver for Python
# python-dotenv  — loads environment variables from a .env file
```

## Project structure — the plan

```
todo_api/
├── .env                  # Environment variables (secrets, database URL)
├── .env.example          # Template showing what variables are needed
├── requirements.txt      # List of dependencies
├── main.py               # FastAPI app — the entry point
├── database.py           # Database connection
├── models/
│   ├── task.py           # The Task domain object
│   └── schemas.py        # Request/response shapes for the API
├── repositories/
│   ├── base.py           # The Repository interface
│   └── postgres.py       # PostgreSQL implementation
├── services/
│   └── task_service.py   # Business logic
├── routers/
│   └── tasks.py          # API route handlers
└── frontend/
    ├── index.html        # The web interface
    ├── style.css         # Styles
    └── app.js            # JavaScript that talks to the API
```

This structure separates concerns into folders instead of files. The idea is the same as Series 1 — each layer only knows about the layer below it.

## The simplest possible FastAPI app

Before we build anything real, let's see FastAPI working.

```python
# hello.py
# The smallest possible FastAPI application.
# Run it with: uvicorn hello:app --reload

from fastapi import FastAPI

# Create the app — this is the central object FastAPI uses to
# route requests and generate documentation.
app = FastAPI(title="Hello API")

# @app.get("/") is a decorator that says:
# "When a GET request comes in for the path '/', call this function."
# The function's return value becomes the JSON response body.
@app.get("/")
def root():
    return {"message": "Hello, world!"}

@app.get("/greet/{name}")
def greet(name: str):
    # {name} in the path is a path parameter.
    # FastAPI reads it from the URL and passes it to the function.
    return {"message": f"Hello, {name}!"}
```

```bash
# Run it
uvicorn hello:app --reload

# --reload means: restart the server whenever you save a file.
# Great for development. Don't use it in production.
```

```
# Test it — open these URLs in your browser or use curl:
http://localhost:8000/
http://localhost:8000/greet/Alice
http://localhost:8000/docs        ← Interactive documentation, auto-generated!
```

## What we learned

A web API listens for HTTP requests and returns HTTP responses. FastAPI handles the plumbing — routing, validation, serialization — so we can focus on the application logic. The project structure separates concerns into layers, just like Series 1.

---

# Episode 2 — The Domain Model

## The problem we are solving

Before we touch the database or the API, we need to define what a Task *is*. This is the domain model — the heart of the application. It should have no knowledge of HTTP, databases, or JSON. It is just Python.

If you build the domain model first, the rest of the application has something solid to build on. If you build the database first, your application ends up shaped around your database schema instead of around your actual problem.

## Enums — fixed sets of values

A task has a status. The status can only be one of a small set of values: todo, in progress, done. An **Enum** enforces this — it is impossible to have a status that is not one of the allowed values.

```python
# models/task.py
# The Task domain model.
# No databases. No HTTP. Just Python objects and rules.

from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from typing import Optional
import uuid


class TaskStatus(Enum):
    """
    An Enum is a type that can only be one of a fixed set of values.
    This prevents bugs like status = "doen" (a typo) silently passing through.

    We store the string value (e.g., "todo") because that is what
    we will put in the database and send in JSON responses.
    """
    TODO        = "todo"
    IN_PROGRESS = "in_progress"
    DONE        = "done"


class Priority(Enum):
    LOW    = "low"
    MEDIUM = "medium"
    HIGH   = "high"


@dataclass
class Task:
    """
    The Task domain object.

    @dataclass automatically generates __init__, __repr__, and __eq__
    from the fields we define. We get a proper constructor, a readable
    string representation, and equality comparison for free.

    This class knows what a task IS and what rules govern it.
    It does not know how tasks are stored or how they are sent over HTTP.
    """

    # ---- Fields ----

    title: str

    # field(default_factory=...) means: call this function to produce
    # the default value. We need a factory (not a plain default) for
    # anything that should be unique per instance.
    id: str = field(default_factory=lambda: str(uuid.uuid4()))

    status:     TaskStatus     = TaskStatus.TODO
    priority:   Priority       = Priority.MEDIUM
    created_at: datetime       = field(default_factory=datetime.utcnow)
    updated_at: datetime       = field(default_factory=datetime.utcnow)
    due_date:   Optional[datetime] = None

    # ---- Business rules ----
    # These methods enforce what state transitions are allowed.
    # The rules live HERE — on the object that owns the data.
    # This is called a Rich Domain Model.

    def start(self) -> None:
        """Move the task to in-progress. Only valid from TODO."""
        if self.status != TaskStatus.TODO:
            raise ValueError(
                f"Cannot start a task with status '{self.status.value}'. "
                "Only TODO tasks can be started."
            )
        self.status     = TaskStatus.IN_PROGRESS
        self.updated_at = datetime.utcnow()

    def complete(self) -> None:
        """Mark the task as done."""
        if self.status == TaskStatus.DONE:
            raise ValueError("This task is already complete.")
        self.status     = TaskStatus.DONE
        self.updated_at = datetime.utcnow()

    def reopen(self) -> None:
        """Put a completed task back to TODO."""
        if self.status != TaskStatus.DONE:
            raise ValueError("Only completed tasks can be reopened.")
        self.status     = TaskStatus.TODO
        self.updated_at = datetime.utcnow()

    def rename(self, new_title: str) -> None:
        """Change the task title."""
        if not new_title or not new_title.strip():
            raise ValueError("Title cannot be empty.")
        if self.status == TaskStatus.DONE:
            raise ValueError("Cannot rename a completed task.")
        self.title      = new_title.strip()
        self.updated_at = datetime.utcnow()

    # ---- Computed properties ----
    # Derived facts about the task. @property makes them look like
    # attributes (task.is_overdue) rather than method calls (task.is_overdue()).

    @property
    def is_overdue(self) -> bool:
        """True if the task has a due date that has passed and is not done."""
        if self.due_date is None:
            return False
        if self.status == TaskStatus.DONE:
            return False
        return datetime.utcnow() > self.due_date

    @property
    def is_active(self) -> bool:
        return self.status in (TaskStatus.TODO, TaskStatus.IN_PROGRESS)

    def __str__(self) -> str:
        icons = {
            TaskStatus.TODO:        "○",
            TaskStatus.IN_PROGRESS: "◑",
            TaskStatus.DONE:        "✓",
        }
        overdue = " [OVERDUE]" if self.is_overdue else ""
        return f"[{icons[self.status]}] {self.title}{overdue}"
```

## Schemas — the API's view of a Task

Here is an important distinction. The domain model (`Task`) is the internal representation — it has all the business logic. But when we send a task over HTTP or receive one in a request, we need a different shape — a **schema**.

A schema defines exactly what the API accepts and returns. It is separate from the domain model because:

- The API might not expose all fields (e.g., internal IDs, audit timestamps)
- The API might accept different fields for creation vs update
- Validation for API input is different from domain rules

FastAPI uses **Pydantic** models for schemas. Pydantic validates data automatically based on type hints.

```python
# models/schemas.py
# API schemas — the shapes of data coming in and going out.
# These are separate from the domain model (Task).

from pydantic import BaseModel, Field, validator
from datetime import datetime
from typing import Optional
from models.task import TaskStatus, Priority


# ---- Request schemas (data coming IN to the API) ----

class CreateTaskRequest(BaseModel):
    """
    The shape of data the client sends when creating a task.
    Pydantic validates this automatically — if 'title' is missing
    or 'priority' is not a valid Priority value, FastAPI returns
    a 422 error before our code even runs.
    """
    title:    str      = Field(..., min_length=1, max_length=200,
                               description="The task title")
    priority: Priority = Field(Priority.MEDIUM, description="Task priority")
    due_date: Optional[datetime] = Field(None, description="Optional due date")

    # Pydantic validators — extra rules beyond type checking
    @validator("title")
    def title_must_not_be_blank(cls, v):
        if not v.strip():
            raise ValueError("Title cannot be blank.")
        return v.strip()   # Return the cleaned value


class UpdateTaskRequest(BaseModel):
    """
    The shape of data for updating a task.
    All fields are Optional — the client only sends what they want to change.
    This is called a partial update.
    """
    title:    Optional[str]      = Field(None, min_length=1, max_length=200)
    priority: Optional[Priority] = None
    due_date: Optional[datetime] = None

    @validator("title")
    def title_must_not_be_blank(cls, v):
        if v is not None and not v.strip():
            raise ValueError("Title cannot be blank.")
        return v.strip() if v else v


# ---- Response schemas (data going OUT from the API) ----

class TaskResponse(BaseModel):
    """
    The shape of a task as returned by the API.
    This is what the client receives — a plain JSON object.

    Note: this does not include internal fields we don't want to expose.
    """
    id:         str
    title:      str
    status:     TaskStatus
    priority:   Priority
    created_at: datetime
    updated_at: datetime
    due_date:   Optional[datetime]
    is_overdue: bool

    # This tells Pydantic: "it is okay to create this from
    # an object with attributes, not just a dictionary."
    # Without this, Pydantic only works with dicts.
    class Config:
        from_attributes = True   # Pydantic v2 (use orm_mode = True for Pydantic v1)

    @classmethod
    def from_task(cls, task) -> "TaskResponse":
        """Convert a domain Task object into a TaskResponse."""
        return cls(
            id         = task.id,
            title      = task.title,
            status     = task.status,
            priority   = task.priority,
            created_at = task.created_at,
            updated_at = task.updated_at,
            due_date   = task.due_date,
            is_overdue = task.is_overdue,
        )


class TaskListResponse(BaseModel):
    """A list of tasks with a count."""
    tasks: list[TaskResponse]
    count: int

    @classmethod
    def from_tasks(cls, tasks: list) -> "TaskListResponse":
        return cls(
            tasks = [TaskResponse.from_task(t) for t in tasks],
            count = len(tasks),
        )
```

## Testing the domain model in isolation

The most important thing about the domain model: you can test every business rule without a database, without a server, without any setup.

```python
# test_domain.py
# Tests for the Task domain model.
# Run with: python test_domain.py

from models.task import Task, TaskStatus, Priority
from datetime import datetime, timedelta

def test_new_task_defaults():
    task = Task(title="Buy milk")
    assert task.status   == TaskStatus.TODO
    assert task.priority == Priority.MEDIUM
    assert task.is_overdue == False
    assert task.is_active  == True
    print("✓ New task has correct defaults")

def test_task_lifecycle():
    task = Task(title="Buy milk")

    task.start()
    assert task.status == TaskStatus.IN_PROGRESS

    task.complete()
    assert task.status == TaskStatus.DONE

    task.reopen()
    assert task.status == TaskStatus.TODO
    print("✓ Task lifecycle works correctly")

def test_cannot_complete_twice():
    task = Task(title="Buy milk")
    task.complete()
    try:
        task.complete()
        assert False, "Should have raised ValueError"
    except ValueError as e:
        assert "already complete" in str(e)
    print("✓ Cannot complete a task twice")

def test_overdue_detection():
    past = datetime.utcnow() - timedelta(days=1)
    task = Task(title="Overdue task", due_date=past)
    assert task.is_overdue == True

    task.complete()
    assert task.is_overdue == False   # Done tasks are never overdue
    print("✓ Overdue detection works correctly")

def test_cannot_rename_completed_task():
    task = Task(title="Original")
    task.complete()
    try:
        task.rename("New title")
        assert False, "Should have raised ValueError"
    except ValueError:
        pass
    print("✓ Cannot rename a completed task")

# Run all tests
test_new_task_defaults()
test_task_lifecycle()
test_cannot_complete_twice()
test_overdue_detection()
test_cannot_rename_completed_task()
print("\nAll tests passed.")
```

## What we learned

Build the domain model first. It is the heart of the application. Everything else — the database, the API, the frontend — exists to serve it.

The domain model and the API schemas are separate things. The domain model owns the business rules. The schemas define what the API accepts and returns. They have different jobs.

---

# Episode 3 — The Database

## What PostgreSQL is

PostgreSQL is a relational database. Data is stored in **tables** — think spreadsheets with rows and columns. Each row is one record (one task). Each column is one field (id, title, status, etc.).

SQL is the language for talking to PostgreSQL. We will use Python to generate and send SQL — but understanding the SQL is important. When something goes wrong, you need to know what the database is actually doing.

## Setting up PostgreSQL

```bash
# Create a database for our app
# (assuming PostgreSQL is installed and running)
psql -U postgres

# In the PostgreSQL prompt:
CREATE DATABASE todo_app;
CREATE USER todo_user WITH PASSWORD 'todo_password';
GRANT ALL PRIVILEGES ON DATABASE todo_app TO todo_user;
\q
```

## Environment variables

We never put secrets (passwords, API keys, database URLs) directly in code. If the code ends up on GitHub, the secrets are exposed. Instead, we put them in a `.env` file that is never committed to version control.

```bash
# .env
# This file is listed in .gitignore — it never goes to GitHub.
DATABASE_URL=postgresql://todo_user:todo_password@localhost:5432/todo_app
APP_ENV=development
SECRET_KEY=change-this-in-production
```

```bash
# .env.example
# This file IS committed to GitHub.
# It shows what variables are needed without revealing their values.
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
APP_ENV=development
SECRET_KEY=your-secret-key-here
```

```bash
# .gitignore
.env
venv/
__pycache__/
*.pyc
```

## The database connection

```python
# database.py
# Database connection management.
# All database connection logic lives here — nowhere else.

import os
import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv
from contextlib import contextmanager

# load_dotenv() reads the .env file and puts the values into
# os.environ so we can access them with os.getenv().
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise RuntimeError(
        "DATABASE_URL environment variable is not set. "
        "Copy .env.example to .env and fill in your database details."
    )


def get_connection():
    """
    Create and return a new database connection.
    The caller is responsible for closing it.
    Use get_db() (below) instead — it handles closing automatically.
    """
    return psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor)
    # RealDictCursor means query results come back as dictionaries
    # ({"id": "...", "title": "..."}) instead of plain tuples.
    # Much easier to work with.


@contextmanager
def get_db():
    """
    A context manager for database connections.
    Use with 'with get_db() as conn:' — the connection is automatically
    closed when the block ends, even if an exception occurs.

    This is the pattern we use everywhere in the app.
    """
    conn = get_connection()
    try:
        yield conn
        conn.commit()    # If no exception, commit the transaction
    except Exception:
        conn.rollback()  # If an exception, undo all changes
        raise
    finally:
        conn.close()     # Always close the connection


def create_tables():
    """
    Create the database tables if they don't exist.
    We call this once when the app starts.
    """
    with get_db() as conn:
        with conn.cursor() as cursor:
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS tasks (
                    id         TEXT        PRIMARY KEY,
                    title      TEXT        NOT NULL,
                    status     TEXT        NOT NULL DEFAULT 'todo',
                    priority   TEXT        NOT NULL DEFAULT 'medium',
                    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                    due_date   TIMESTAMPTZ
                )
            """)
    print("Database tables ready.")
```

## Understanding the SQL

Let's look at what each column means and why we chose those types:

```sql
-- The tasks table
CREATE TABLE IF NOT EXISTS tasks (
    -- TEXT PRIMARY KEY: a text string that uniquely identifies each row.
    -- We use UUIDs (long random strings) rather than auto-incrementing
    -- integers because UUIDs are safe to generate in Python before saving.
    id         TEXT        PRIMARY KEY,

    -- TEXT NOT NULL: a text string that must always have a value.
    title      TEXT        NOT NULL,

    -- TEXT NOT NULL DEFAULT 'todo': a text string with a default.
    -- CHECK would enforce valid values, but we handle that in Python.
    status     TEXT        NOT NULL DEFAULT 'todo',
    priority   TEXT        NOT NULL DEFAULT 'medium',

    -- TIMESTAMPTZ: a timestamp with timezone. Always store UTC times.
    -- NOW() is a PostgreSQL function that returns the current time.
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- No NOT NULL: due_date is optional (NULL = no due date)
    due_date   TIMESTAMPTZ
);
```

## What we learned

The database stores data. Python connects to it via `psycopg2`. We use environment variables for secrets — never hardcode them. The `get_db()` context manager ensures connections are always closed and transactions are committed or rolled back cleanly.

---

# Episode 4 — The Repository Pattern

## The problem we are solving

If we write SQL directly in our business logic, two bad things happen. First, it becomes impossible to test without a real database. Second, if we ever change databases, we have to hunt down SQL scattered everywhere.

The **Repository pattern** solves this by hiding all database access behind a simple interface. Your business logic talks to the interface. The database is behind the interface. They never meet directly.

## The Repository interface

```python
# repositories/base.py
# The Repository interface — the contract all storage must follow.

from abc import ABC, abstractmethod
from typing import List, Optional
from models.task import Task, TaskStatus


class TaskRepository(ABC):
    """
    An Abstract Base Class defines an interface.
    You cannot instantiate it directly — it only exists to define
    what methods any real implementation must provide.

    ABC = Abstract Base Class
    @abstractmethod = subclasses MUST implement this method
    """

    @abstractmethod
    def add(self, task: Task) -> None:
        """Save a new task to storage."""
        pass

    @abstractmethod
    def get(self, task_id: str) -> Optional[Task]:
        """
        Find a task by id.
        Returns the Task if found, None if not found.
        Returning None (not raising) is intentional:
        "not found" is a normal outcome, not an error.
        """
        pass

    @abstractmethod
    def list_all(self) -> List[Task]:
        """Return all tasks, newest first."""
        pass

    @abstractmethod
    def update(self, task: Task) -> None:
        """Persist changes to an existing task."""
        pass

    @abstractmethod
    def delete(self, task_id: str) -> None:
        """Remove a task permanently."""
        pass

    @abstractmethod
    def find_by_status(self, status: TaskStatus) -> List[Task]:
        """Return all tasks with the given status."""
        pass
```

## The in-memory implementation

Always write an in-memory implementation first. It has no dependencies — it is just a Python dictionary. We use it in tests and during development before the database is set up.

```python
# repositories/memory.py
# In-memory task storage. No database needed.
# Use this for testing and development.

from typing import List, Optional
from models.task import Task, TaskStatus
from repositories.base import TaskRepository


class InMemoryTaskRepository(TaskRepository):
    """
    Stores tasks in a Python dictionary.
    Key = task id. Value = Task object.
    Data is lost when the program ends.
    Perfect for tests — fast, zero setup, zero cleanup.
    """

    def __init__(self):
        self._store: dict[str, Task] = {}

    def add(self, task: Task) -> None:
        if task.id in self._store:
            raise ValueError(f"Task '{task.id}' already exists.")
        self._store[task.id] = task

    def get(self, task_id: str) -> Optional[Task]:
        return self._store.get(task_id)

    def list_all(self) -> List[Task]:
        tasks = list(self._store.values())
        return sorted(tasks, key=lambda t: t.created_at, reverse=True)

    def update(self, task: Task) -> None:
        if task.id not in self._store:
            raise ValueError(f"Task '{task.id}' not found.")
        self._store[task.id] = task

    def delete(self, task_id: str) -> None:
        if task_id not in self._store:
            raise ValueError(f"Task '{task_id}' not found.")
        del self._store[task_id]

    def find_by_status(self, status: TaskStatus) -> List[Task]:
        return [t for t in self._store.values() if t.status == status]
```

## The PostgreSQL implementation

Now the real database implementation. It has the same interface — every method does the same thing, just with SQL instead of a dictionary.

```python
# repositories/postgres.py
# PostgreSQL task storage.
# Implements the same interface as InMemoryTaskRepository.

from typing import List, Optional
from datetime import datetime
from models.task import Task, TaskStatus, Priority
from repositories.base import TaskRepository
from database import get_db


class PostgreSQLTaskRepository(TaskRepository):
    """
    Stores tasks in a PostgreSQL database.
    Uses the get_db() context manager for all database access.

    Notice: the interface is identical to InMemoryTaskRepository.
    The service that uses this will never know the difference.
    """

    # ---- Private helpers ----

    def _row_to_task(self, row: dict) -> Task:
        """
        Convert a database row (a dictionary from psycopg2) into a Task object.
        This is called deserialization — converting stored data back into
        the Python objects our application works with.
        """
        return Task(
            id         = row["id"],
            title      = row["title"],
            status     = TaskStatus(row["status"]),     # string → Enum
            priority   = Priority(row["priority"]),     # string → Enum
            created_at = row["created_at"],
            updated_at = row["updated_at"],
            due_date   = row["due_date"],
        )

    # ---- Interface implementation ----

    def add(self, task: Task) -> None:
        """Insert a new task row into the database."""
        with get_db() as conn:
            with conn.cursor() as cursor:
                cursor.execute(
                    """
                    INSERT INTO tasks (id, title, status, priority, created_at, updated_at, due_date)
                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                    """,
                    # We always use %s placeholders — never string formatting.
                    # String formatting with SQL = SQL injection vulnerability.
                    # %s with psycopg2 = safe, parameterized query.
                    (
                        task.id,
                        task.title,
                        task.status.value,     # Enum → string for storage
                        task.priority.value,
                        task.created_at,
                        task.updated_at,
                        task.due_date,
                    )
                )

    def get(self, task_id: str) -> Optional[Task]:
        """Fetch one task by id."""
        with get_db() as conn:
            with conn.cursor() as cursor:
                cursor.execute(
                    "SELECT * FROM tasks WHERE id = %s",
                    (task_id,)
                )
                row = cursor.fetchone()
                return self._row_to_task(row) if row else None

    def list_all(self) -> List[Task]:
        """Return all tasks, newest first."""
        with get_db() as conn:
            with conn.cursor() as cursor:
                cursor.execute("SELECT * FROM tasks ORDER BY created_at DESC")
                rows = cursor.fetchall()
                return [self._row_to_task(row) for row in rows]

    def update(self, task: Task) -> None:
        """Update an existing task row."""
        with get_db() as conn:
            with conn.cursor() as cursor:
                cursor.execute(
                    """
                    UPDATE tasks
                    SET title      = %s,
                        status     = %s,
                        priority   = %s,
                        updated_at = %s,
                        due_date   = %s
                    WHERE id = %s
                    """,
                    (
                        task.title,
                        task.status.value,
                        task.priority.value,
                        task.updated_at,
                        task.due_date,
                        task.id,
                    )
                )
                if cursor.rowcount == 0:
                    raise ValueError(f"Task '{task.id}' not found.")

    def delete(self, task_id: str) -> None:
        """Delete a task row."""
        with get_db() as conn:
            with conn.cursor() as cursor:
                cursor.execute(
                    "DELETE FROM tasks WHERE id = %s",
                    (task_id,)
                )
                if cursor.rowcount == 0:
                    raise ValueError(f"Task '{task_id}' not found.")

    def find_by_status(self, status: TaskStatus) -> List[Task]:
        """Return all tasks with the given status."""
        with get_db() as conn:
            with conn.cursor() as cursor:
                cursor.execute(
                    "SELECT * FROM tasks WHERE status = %s ORDER BY created_at DESC",
                    (status.value,)
                )
                rows = cursor.fetchall()
                return [self._row_to_task(row) for row in rows]
```

## SQL injection — why we use %s

This deserves its own section because it is a critical security concept.

```python
# sql_injection_demo.py
# Understanding why parameterized queries matter.

# DANGEROUS — string formatting with SQL
# If task_id comes from user input and a user sends:
# task_id = "'; DROP TABLE tasks; --"
# This query becomes:
# SELECT * FROM tasks WHERE id = ''; DROP TABLE tasks; --'
# Which deletes your entire tasks table.
task_id = "user_input_here"
dangerous_query = f"SELECT * FROM tasks WHERE id = '{task_id}'"

# SAFE — parameterized query with %s
# psycopg2 handles the escaping. The value is never interpreted as SQL.
# No matter what the user sends, it cannot become part of the SQL command.
cursor.execute("SELECT * FROM tasks WHERE id = %s", (task_id,))

# Rule: ALWAYS use parameterized queries.
# NEVER use string formatting or concatenation to build SQL.
```

## What we learned

The Repository pattern separates storage from logic. The interface defines *what* can be done. The implementation defines *how*. Swap the implementation without touching anything else.

Always use parameterized queries (`%s`) — never build SQL with string formatting.

---

# Episode 5 — The Service Layer

## The problem we are solving

We have a Task that knows its own rules. We have a Repository that knows how to store tasks. We need something to coordinate them — to implement the actual *use cases* of the application.

A **use case** is one thing the user can do: "create a task", "complete a task", "list all overdue tasks". The Service Layer is where use cases live.

## Custom exceptions

Before writing the service, we define our own error types. This lets callers handle different errors differently without parsing error message strings.

```python
# exceptions.py
# Named exceptions for the todo API.

class TodoError(Exception):
    """Base exception for all application errors."""
    pass

class TaskNotFoundError(TodoError):
    """Raised when a task id does not exist."""
    def __init__(self, task_id: str):
        self.task_id = task_id
        super().__init__(f"Task '{task_id}' not found.")

class TaskAlreadyCompleteError(TodoError):
    """Raised when trying to complete an already-done task."""
    def __init__(self, task_id: str):
        super().__init__(f"Task '{task_id}' is already complete.")

class InvalidTaskDataError(TodoError):
    """Raised when input data fails validation."""
    pass
```

## The Service

```python
# services/task_service.py
# The TaskService — one method per use case.

from datetime import datetime
from typing import List, Optional

from models.task import Task, TaskStatus, Priority
from repositories.base import TaskRepository
from exceptions import (
    TaskNotFoundError,
    TaskAlreadyCompleteError,
    InvalidTaskDataError,
)


class TaskService:
    """
    The brain of the application. Each method is one use case.

    The service:
    - Validates input (guard clauses at the top of each method)
    - Calls the repository to fetch data
    - Calls domain methods to enforce rules
    - Calls the repository to save changes
    - Raises clear, named exceptions when things go wrong

    The service does NOT know about:
    - HTTP requests or responses
    - SQL or database connections
    - JSON serialization
    - The terminal or any user interface

    It only knows about Tasks and the Repository interface.
    This is called Dependency Injection: the service receives
    its dependencies (the repository) rather than creating them.
    """

    def __init__(self, repository: TaskRepository):
        self._repo = repository

    # ---- Use cases ----

    def create_task(
        self,
        title:    str,
        priority: Priority          = Priority.MEDIUM,
        due_date: Optional[datetime] = None,
    ) -> Task:
        """Create a new task and save it."""
        # Guard clauses — check preconditions first, exit early if invalid.
        # This keeps the happy path clean and unindented.
        title = title.strip() if title else ""
        if not title:
            raise InvalidTaskDataError("Task title cannot be empty.")
        if len(title) > 200:
            raise InvalidTaskDataError("Title too long (max 200 characters).")
        if due_date and due_date < datetime.utcnow():
            raise InvalidTaskDataError("Due date cannot be in the past.")

        task = Task(title=title, priority=priority, due_date=due_date)
        self._repo.add(task)
        return task

    def get_task(self, task_id: str) -> Task:
        """Fetch a task by id. Raises TaskNotFoundError if missing."""
        return self._get_or_raise(task_id)

    def list_tasks(self, status: Optional[TaskStatus] = None) -> List[Task]:
        """Return all tasks, optionally filtered by status."""
        if status:
            return self._repo.find_by_status(status)
        return self._repo.list_all()

    def start_task(self, task_id: str) -> Task:
        """Move a task to in-progress."""
        task = self._get_or_raise(task_id)
        task.start()               # Domain rule enforced on the Task object
        self._repo.update(task)    # Persist the change
        return task

    def complete_task(self, task_id: str) -> Task:
        """Mark a task as done."""
        task = self._get_or_raise(task_id)
        try:
            task.complete()
        except ValueError:
            raise TaskAlreadyCompleteError(task_id)
        self._repo.update(task)
        return task

    def reopen_task(self, task_id: str) -> Task:
        """Put a completed task back to TODO."""
        task = self._get_or_raise(task_id)
        task.reopen()
        self._repo.update(task)
        return task

    def update_task(
        self,
        task_id:  str,
        title:    Optional[str]      = None,
        priority: Optional[Priority] = None,
        due_date: Optional[datetime] = None,
    ) -> Task:
        """Update task fields. Only provided fields are changed."""
        task = self._get_or_raise(task_id)

        if title is not None:
            task.rename(title)   # Domain method handles validation

        if priority is not None:
            if task.status == TaskStatus.DONE:
                raise InvalidTaskDataError("Cannot change priority of a completed task.")
            task.priority   = priority
            task.updated_at = datetime.utcnow()

        if due_date is not None:
            if due_date < datetime.utcnow():
                raise InvalidTaskDataError("Due date cannot be in the past.")
            task.due_date   = due_date
            task.updated_at = datetime.utcnow()

        self._repo.update(task)
        return task

    def delete_task(self, task_id: str) -> None:
        """Delete a task permanently."""
        self._get_or_raise(task_id)   # Verify it exists
        self._repo.delete(task_id)

    def get_overdue_tasks(self) -> List[Task]:
        """Return all tasks that are past their due date."""
        return [t for t in self._repo.list_all() if t.is_overdue]

    # ---- Private helpers ----

    def _get_or_raise(self, task_id: str) -> Task:
        """Fetch a task or raise TaskNotFoundError."""
        task = self._repo.get(task_id)
        if task is None:
            raise TaskNotFoundError(task_id)
        return task
```

## Testing the service with the in-memory repository

```python
# test_service.py
# Tests for the TaskService.
# Uses InMemoryTaskRepository — no database needed.

from models.task import Task, TaskStatus, Priority
from repositories.memory import InMemoryTaskRepository
from services.task_service import TaskService
from exceptions import TaskNotFoundError, TaskAlreadyCompleteError, InvalidTaskDataError

def make_service():
    """Create a fresh service with empty in-memory storage."""
    return TaskService(InMemoryTaskRepository())

def test_create_task():
    service = make_service()
    task    = service.create_task("Buy milk")
    assert task.title  == "Buy milk"
    assert task.status == TaskStatus.TODO
    print("✓ create_task works")

def test_create_task_empty_title():
    service = make_service()
    try:
        service.create_task("   ")
        assert False, "Should have raised"
    except InvalidTaskDataError:
        pass
    print("✓ Empty title is rejected")

def test_complete_task():
    service = make_service()
    task    = service.create_task("Buy milk")
    service.complete_task(task.id)
    fetched = service.get_task(task.id)
    assert fetched.status == TaskStatus.DONE
    print("✓ complete_task works")

def test_cannot_complete_twice():
    service = make_service()
    task    = service.create_task("Buy milk")
    service.complete_task(task.id)
    try:
        service.complete_task(task.id)
        assert False, "Should have raised"
    except TaskAlreadyCompleteError:
        pass
    print("✓ Double completion raises TaskAlreadyCompleteError")

def test_task_not_found():
    service = make_service()
    try:
        service.get_task("nonexistent")
        assert False, "Should have raised"
    except TaskNotFoundError:
        pass
    print("✓ Missing task raises TaskNotFoundError")

def test_list_by_status():
    service = make_service()
    t1 = service.create_task("Task 1")
    t2 = service.create_task("Task 2")
    t3 = service.create_task("Task 3")
    service.complete_task(t1.id)

    done   = service.list_tasks(TaskStatus.DONE)
    active = service.list_tasks(TaskStatus.TODO)
    assert len(done)   == 1
    assert len(active) == 2
    print("✓ list_tasks filtering works")

test_create_task()
test_create_task_empty_title()
test_complete_task()
test_cannot_complete_twice()
test_task_not_found()
test_list_by_status()
print("\nAll service tests passed.")
```

## What we learned

The Service Layer is the use case layer. Each method is one action. It coordinates the domain (Task) and storage (Repository) without knowing about HTTP or databases.

Guard clauses check preconditions first and exit early — the happy path stays clean. Custom exceptions give callers something meaningful to catch.

---

# Episode 6 — The API Routes

## The problem we are solving

We have a service that implements all our use cases. Now we need to expose it over HTTP so a browser or another program can call it. This is what the route handlers do — they translate between HTTP and the service.

A route handler:
1. Receives an HTTP request
2. Extracts the data (path params, query params, request body)
3. Calls the service
4. Returns an HTTP response

That is all. Route handlers should be thin. Business logic belongs in the service.

## Dependency injection with FastAPI

FastAPI has a built-in system for providing dependencies to route handlers. We use it to give every route handler a pre-built service instance.

```python
# dependencies.py
# Provides dependencies to route handlers.
# FastAPI calls these functions automatically when a route needs them.

from repositories.postgres import PostgreSQLTaskRepository
from repositories.memory import InMemoryTaskRepository
from services.task_service import TaskService
import os


def get_task_service() -> TaskService:
    """
    Create and return a TaskService.
    FastAPI calls this for every request that needs a TaskService.

    In production: use PostgreSQL.
    In testing: swap this function for one that returns InMemoryTaskRepository.
    That is the entire point of the Repository pattern.
    """
    env = os.getenv("APP_ENV", "production")
    if env == "testing":
        repo = InMemoryTaskRepository()
    else:
        repo = PostgreSQLTaskRepository()
    return TaskService(repo)
```

## The route handlers

```python
# routers/tasks.py
# HTTP route handlers for the tasks API.
# Each function handles one HTTP endpoint.

from fastapi import APIRouter, Depends, HTTPException, Query, status
from typing import Optional

from models.task import TaskStatus
from models.schemas import (
    CreateTaskRequest,
    UpdateTaskRequest,
    TaskResponse,
    TaskListResponse,
)
from services.task_service import TaskService
from exceptions import (
    TaskNotFoundError,
    TaskAlreadyCompleteError,
    InvalidTaskDataError,
)
from dependencies import get_task_service

# APIRouter groups related routes together.
# We include this router in main.py with a prefix of "/tasks".
router = APIRouter(prefix="/tasks", tags=["tasks"])


@router.get("", response_model=TaskListResponse)
def list_tasks(
    status:  Optional[TaskStatus] = Query(None, description="Filter by status"),
    service: TaskService          = Depends(get_task_service),
):
    """
    GET /tasks
    GET /tasks?status=todo
    GET /tasks?status=done

    Depends(get_task_service) tells FastAPI: call get_task_service()
    and pass the result as the 'service' argument. This is dependency injection.
    """
    tasks = service.list_tasks(status)
    return TaskListResponse.from_tasks(tasks)


@router.post("", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
def create_task(
    body:    CreateTaskRequest,
    service: TaskService       = Depends(get_task_service),
):
    """
    POST /tasks
    Body: {"title": "Buy milk", "priority": "high"}

    FastAPI automatically validates the request body against
    CreateTaskRequest and returns a 422 error if it is invalid.
    status_code=201 means "Created" — the standard code for successful creation.
    """
    try:
        task = service.create_task(
            title    = body.title,
            priority = body.priority,
            due_date = body.due_date,
        )
        return TaskResponse.from_task(task)
    except InvalidTaskDataError as e:
        # 422 Unprocessable Entity — the request was valid JSON but
        # failed our business rules.
        raise HTTPException(status_code=422, detail=str(e))


@router.get("/{task_id}", response_model=TaskResponse)
def get_task(
    task_id: str,
    service: TaskService = Depends(get_task_service),
):
    """
    GET /tasks/{task_id}

    {task_id} in the path is a path parameter.
    FastAPI extracts it from the URL and passes it to the function.
    """
    try:
        task = service.get_task(task_id)
        return TaskResponse.from_task(task)
    except TaskNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.patch("/{task_id}", response_model=TaskResponse)
def update_task(
    task_id: str,
    body:    UpdateTaskRequest,
    service: TaskService       = Depends(get_task_service),
):
    """
    PATCH /tasks/{task_id}
    Body: {"title": "New title"} or {"priority": "high"} or any combination

    PATCH (not PUT) because we do partial updates —
    only the fields provided in the body are changed.
    PUT would replace the entire resource.
    """
    try:
        task = service.update_task(
            task_id  = task_id,
            title    = body.title,
            priority = body.priority,
            due_date = body.due_date,
        )
        return TaskResponse.from_task(task)
    except TaskNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except InvalidTaskDataError as e:
        raise HTTPException(status_code=422, detail=str(e))


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(
    task_id: str,
    service: TaskService = Depends(get_task_service),
):
    """
    DELETE /tasks/{task_id}
    204 No Content — the standard response for successful deletion.
    No body is returned.
    """
    try:
        service.delete_task(task_id)
    except TaskNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.post("/{task_id}/start", response_model=TaskResponse)
def start_task(
    task_id: str,
    service: TaskService = Depends(get_task_service),
):
    """
    POST /tasks/{task_id}/start
    Move a task to in-progress.

    This uses a sub-resource action path (/start) rather than
    a PATCH because "start" is a specific state transition,
    not a generic field update. It reads more clearly.
    """
    try:
        task = service.start_task(task_id)
        return TaskResponse.from_task(task)
    except TaskNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))


@router.post("/{task_id}/complete", response_model=TaskResponse)
def complete_task(
    task_id: str,
    service: TaskService = Depends(get_task_service),
):
    """POST /tasks/{task_id}/complete"""
    try:
        task = service.complete_task(task_id)
        return TaskResponse.from_task(task)
    except TaskNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except TaskAlreadyCompleteError as e:
        raise HTTPException(status_code=422, detail=str(e))


@router.post("/{task_id}/reopen", response_model=TaskResponse)
def reopen_task(
    task_id: str,
    service: TaskService = Depends(get_task_service),
):
    """POST /tasks/{task_id}/reopen"""
    try:
        task = service.reopen_task(task_id)
        return TaskResponse.from_task(task)
    except TaskNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))


@router.get("/overdue/list", response_model=TaskListResponse)
def get_overdue(service: TaskService = Depends(get_task_service)):
    """GET /tasks/overdue/list"""
    tasks = service.get_overdue_tasks()
    return TaskListResponse.from_tasks(tasks)
```

## What we learned

Route handlers are thin — they receive HTTP input, call the service, return HTTP output. They translate between the HTTP world and the application world. Business logic stays in the service.

FastAPI's `Depends()` system handles dependency injection — it builds the service and passes it in. This makes route handlers easy to test by swapping out the dependency.

---

# Episode 7 — The Main App

## Wiring everything together

```python
# main.py
# The FastAPI application. The entry point.
# Wires together all the pieces and starts the server.

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import os

from database import create_tables
from routers.tasks import router as tasks_router


# The lifespan context manager runs code on startup and shutdown.
# We use it to create database tables when the server starts.
@asynccontextmanager
async def lifespan(app: FastAPI):
    # --- Startup ---
    print("Starting up...")
    create_tables()
    print("Ready.")
    yield
    # --- Shutdown ---
    print("Shutting down.")


app = FastAPI(
    title       = "Todo API",
    description = "A simple todo list API built with FastAPI and PostgreSQL.",
    version     = "1.0.0",
    lifespan    = lifespan,
)


# CORS — Cross-Origin Resource Sharing
# When a browser loads a page from one origin (e.g., localhost:5500)
# and that page makes a fetch() request to a different origin
# (e.g., localhost:8000), the browser blocks it by default.
# CORS middleware tells the browser: "it is okay, allow these origins."
app.add_middleware(
    CORSMiddleware,
    allow_origins  = ["*"],   # In production: list specific domains
    allow_methods  = ["*"],
    allow_headers  = ["*"],
)


# Register the tasks router.
# All routes defined in routers/tasks.py are now available,
# prefixed with /api (in addition to their own /tasks prefix).
app.include_router(tasks_router, prefix="/api")


# Serve the frontend as static files.
# Any file in the frontend/ folder is served directly.
# index.html is served at /.
app.mount("/", StaticFiles(directory="frontend", html=True), name="frontend")


@app.get("/health")
def health_check():
    """
    A health check endpoint.
    Load balancers and monitoring tools call this to verify the server is up.
    Returns 200 OK if everything is fine.
    """
    return {"status": "ok"}
```

## The requirements file

```
# requirements.txt
# Pin versions in production. For learning, latest is fine.
fastapi
uvicorn[standard]
psycopg2-binary
python-dotenv
pydantic
```

```bash
# Install everything
pip install -r requirements.txt

# Run the server
uvicorn main:app --reload

# Visit the auto-generated docs
open http://localhost:8000/docs
```

## Testing the API manually

With the server running, open `http://localhost:8000/docs`. FastAPI generates an interactive API explorer automatically. You can create tasks, complete them, and delete them right in the browser without writing any frontend code.

You can also use curl:

```bash
# Create a task
curl -X POST http://localhost:8000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "Buy milk", "priority": "high"}'

# List all tasks
curl http://localhost:8000/api/tasks

# Complete a task (replace TASK_ID with the id from the create response)
curl -X POST http://localhost:8000/api/tasks/TASK_ID/complete

# List only done tasks
curl http://localhost:8000/api/tasks?status=done

# Delete a task
curl -X DELETE http://localhost:8000/api/tasks/TASK_ID
```

## What we learned

`main.py` is the assembly point — it creates the app, registers routes, adds middleware, and starts the database. CORS middleware lets the browser talk to the API from a different origin. The lifespan handler runs startup and shutdown logic.

---

# Episode 8 — The Frontend

## What the frontend is

The frontend is a web page that runs in the browser. It makes HTTP requests to our API using JavaScript's `fetch()` function, and updates the page based on the responses.

We are not using React, Vue, or any framework. We are using plain HTML, CSS, and JavaScript. This is important — understanding what a frontend actually *is* before a framework abstracts it away makes you a much better developer.

## The HTML

```html
<!-- frontend/index.html -->
<!-- The structure of the page. Just HTML — no JavaScript yet. -->

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Todo App</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>

    <div class="container">
        <header>
            <h1>Todo</h1>
            <p class="subtitle" id="task-count">Loading...</p>
        </header>

        <!-- Form to add a new task -->
        <section class="add-task">
            <input
                type="text"
                id="new-task-input"
                placeholder="What needs to be done?"
                autocomplete="off"
            >
            <select id="priority-select">
                <option value="low">Low</option>
                <option value="medium" selected>Medium</option>
                <option value="high">High</option>
            </select>
            <button id="add-btn">Add</button>
        </section>

        <!-- Filter buttons -->
        <section class="filters">
            <button class="filter-btn active" data-status="">All</button>
            <button class="filter-btn" data-status="todo">Todo</button>
            <button class="filter-btn" data-status="in_progress">In Progress</button>
            <button class="filter-btn" data-status="done">Done</button>
        </section>

        <!-- Error message area -->
        <div id="error-banner" class="error-banner hidden"></div>

        <!-- Task list — populated by JavaScript -->
        <ul id="task-list" class="task-list">
            <li class="loading">Loading tasks...</li>
        </ul>
    </div>

    <script src="app.js"></script>
</body>
</html>
```

## The CSS

```css
/* frontend/style.css */

*, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    background: #f5f5f5;
    color: #333;
    min-height: 100vh;
    padding: 2rem 1rem;
}

.container {
    max-width: 640px;
    margin: 0 auto;
}

header {
    margin-bottom: 2rem;
}

h1 {
    font-size: 2rem;
    font-weight: 700;
    color: #1a1a1a;
}

.subtitle {
    color: #888;
    margin-top: 0.25rem;
    font-size: 0.9rem;
}

/* Add task form */
.add-task {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1rem;
}

.add-task input {
    flex: 1;
    padding: 0.6rem 0.8rem;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 1rem;
}

.add-task input:focus {
    outline: none;
    border-color: #6366f1;
}

.add-task select,
.add-task button {
    padding: 0.6rem 0.8rem;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 0.9rem;
    cursor: pointer;
}

.add-task button {
    background: #6366f1;
    color: white;
    border-color: #6366f1;
    font-weight: 600;
}

.add-task button:hover {
    background: #4f46e5;
}

/* Filters */
.filters {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1.5rem;
}

.filter-btn {
    padding: 0.4rem 0.8rem;
    border: 1px solid #ddd;
    border-radius: 20px;
    background: white;
    cursor: pointer;
    font-size: 0.85rem;
    color: #555;
}

.filter-btn.active {
    background: #6366f1;
    color: white;
    border-color: #6366f1;
}

/* Error banner */
.error-banner {
    background: #fee2e2;
    color: #991b1b;
    padding: 0.8rem 1rem;
    border-radius: 6px;
    margin-bottom: 1rem;
    font-size: 0.9rem;
}

.hidden { display: none; }

/* Task list */
.task-list {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.loading {
    color: #888;
    text-align: center;
    padding: 2rem;
}

/* Task item */
.task-item {
    background: white;
    border: 1px solid #e5e5e5;
    border-radius: 8px;
    padding: 0.8rem 1rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    transition: opacity 0.2s;
}

.task-item.done {
    opacity: 0.6;
}

.task-item.overdue {
    border-left: 3px solid #ef4444;
}

.task-check {
    width: 20px;
    height: 20px;
    border: 2px solid #ddd;
    border-radius: 50%;
    cursor: pointer;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
    color: white;
}

.task-check.checked {
    background: #6366f1;
    border-color: #6366f1;
}

.task-body {
    flex: 1;
    min-width: 0;
}

.task-title {
    font-size: 0.95rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.task-item.done .task-title {
    text-decoration: line-through;
    color: #999;
}

.task-meta {
    font-size: 0.75rem;
    color: #aaa;
    margin-top: 0.2rem;
}

.task-meta .overdue-label {
    color: #ef4444;
    font-weight: 600;
}

.priority-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
}
.priority-dot.high   { background: #ef4444; }
.priority-dot.medium { background: #f59e0b; }
.priority-dot.low    { background: #6ee7b7; }

.task-actions {
    display: flex;
    gap: 0.4rem;
    opacity: 0;
    transition: opacity 0.15s;
}

.task-item:hover .task-actions {
    opacity: 1;
}

.action-btn {
    background: none;
    border: 1px solid #e5e5e5;
    border-radius: 4px;
    padding: 0.2rem 0.5rem;
    font-size: 0.75rem;
    cursor: pointer;
    color: #666;
}

.action-btn:hover {
    background: #f5f5f5;
}

.action-btn.danger:hover {
    background: #fee2e2;
    color: #991b1b;
    border-color: #fca5a5;
}
```

## The JavaScript

```javascript
// frontend/app.js
// The frontend application.
// Plain JavaScript — no framework.
// Uses fetch() to talk to the API.

// ============================================================
// CONFIGURATION
// ============================================================

const API_BASE = "http://localhost:8000/api";

// ============================================================
// STATE
// All application state lives here in one place.
// When state changes, we re-render.
// ============================================================

let state = {
    tasks:         [],    // Array of task objects from the API
    activeFilter:  "",    // Current status filter: "" | "todo" | "in_progress" | "done"
    loading:       true,
    error:         null,
};

// ============================================================
// API FUNCTIONS
// Each function makes one API call and returns the result.
// They throw errors on failure — the calling code handles errors.
// ============================================================

async function apiRequest(method, path, body = null) {
    /**
     * A generic function for making API requests.
     * method: "GET", "POST", "PATCH", "DELETE"
     * path:   "/tasks", "/tasks/abc123/complete", etc.
     * body:   an object to send as JSON (for POST/PATCH)
     *
     * Returns the parsed JSON response, or null for 204 responses.
     * Throws an Error if the request fails.
     */
    const options = {
        method,
        headers: { "Content-Type": "application/json" },
    };
    if (body) {
        options.body = JSON.stringify(body);
    }

    const response = await fetch(`${API_BASE}${path}`, options);

    // 204 No Content — successful deletion, no body
    if (response.status === 204) return null;

    const data = await response.json();

    if (!response.ok) {
        // The API returns {"detail": "..."} for errors
        throw new Error(data.detail || "Something went wrong.");
    }

    return data;
}

async function fetchTasks(status = "") {
    const path = status ? `/tasks?status=${status}` : "/tasks";
    return apiRequest("GET", path);
}

async function createTask(title, priority) {
    return apiRequest("POST", "/tasks", { title, priority });
}

async function completeTask(taskId) {
    return apiRequest("POST", `/tasks/${taskId}/complete`);
}

async function reopenTask(taskId) {
    return apiRequest("POST", `/tasks/${taskId}/reopen`);
}

async function deleteTask(taskId) {
    return apiRequest("DELETE", `/tasks/${taskId}`);
}

// ============================================================
// RENDER FUNCTIONS
// These functions read state and update the DOM.
// We re-render from scratch on every state change.
// This is the same idea React is built on — just manual.
// ============================================================

function render() {
    renderTaskList();
    renderTaskCount();
    renderError();
}

function renderTaskList() {
    const list = document.getElementById("task-list");

    if (state.loading) {
        list.innerHTML = '<li class="loading">Loading...</li>';
        return;
    }

    if (state.tasks.length === 0) {
        list.innerHTML = '<li class="loading">No tasks yet. Add one above.</li>';
        return;
    }

    // Build the HTML for each task and join them together
    list.innerHTML = state.tasks.map(taskHTML).join("");

    // After setting innerHTML, attach event listeners
    attachTaskListeners();
}

function taskHTML(task) {
    /**
     * Returns an HTML string for one task item.
     * data-id is a custom HTML attribute — we use it to know
     * which task was clicked without searching the array.
     */
    const isDone    = task.status === "done";
    const isOverdue = task.is_overdue;
    const classes   = [
        "task-item",
        isDone    ? "done"    : "",
        isOverdue ? "overdue" : "",
    ].filter(Boolean).join(" ");

    const checkClass   = isDone ? "task-check checked" : "task-check";
    const checkContent = isDone ? "✓" : "";

    const overdueLabel = isOverdue
        ? '<span class="overdue-label"> · Overdue</span>'
        : "";

    const toggleLabel = isDone ? "Reopen" : "Done";
    const toggleClass = isDone ? "action-btn" : "action-btn";

    return `
        <li class="${classes}" data-id="${task.id}">
            <div class="${checkClass}" data-action="toggle">
                ${checkContent}
            </div>
            <div class="task-body">
                <div class="task-title">${escapeHTML(task.title)}</div>
                <div class="task-meta">
                    ${task.status.replace("_", " ")}${overdueLabel}
                </div>
            </div>
            <div class="priority-dot ${task.priority}"></div>
            <div class="task-actions">
                <button class="${toggleClass}" data-action="toggle">
                    ${toggleLabel}
                </button>
                <button class="action-btn danger" data-action="delete">
                    Delete
                </button>
            </div>
        </li>
    `;
}

function attachTaskListeners() {
    /**
     * Attach click handlers to all task action elements.
     * We do this after render because the elements are recreated each time.
     */
    document.querySelectorAll("[data-action]").forEach(el => {
        el.addEventListener("click", async (event) => {
            event.stopPropagation();
            const action = el.dataset.action;
            const taskId = el.closest("[data-id]").dataset.id;
            const task   = state.tasks.find(t => t.id === taskId);

            if (action === "toggle") {
                await handleToggle(task);
            } else if (action === "delete") {
                await handleDelete(taskId);
            }
        });
    });
}

function renderTaskCount() {
    const count   = state.tasks.length;
    const active  = state.tasks.filter(t => t.status !== "done").length;
    const el      = document.getElementById("task-count");
    el.textContent = `${active} remaining · ${count} total`;
}

function renderError() {
    const banner = document.getElementById("error-banner");
    if (state.error) {
        banner.textContent = state.error;
        banner.classList.remove("hidden");
    } else {
        banner.classList.add("hidden");
    }
}

function escapeHTML(str) {
    /**
     * Prevent XSS — never put user input directly into HTML.
     * This converts special characters to HTML entities.
     * "Buy <script>" becomes "Buy &lt;script&gt;" — safe to display.
     */
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
}

// ============================================================
// EVENT HANDLERS
// These handle user interactions, call the API, update state.
// ============================================================

async function handleAddTask() {
    const input    = document.getElementById("new-task-input");
    const priority = document.getElementById("priority-select").value;
    const title    = input.value.trim();

    if (!title) {
        setState({ error: "Please enter a task title." });
        return;
    }

    try {
        setState({ error: null });
        const newTask = await createTask(title, priority);
        input.value   = "";
        // Add the new task to the top of the list
        setState({ tasks: [newTask, ...state.tasks] });
    } catch (err) {
        setState({ error: err.message });
    }
}

async function handleToggle(task) {
    try {
        setState({ error: null });
        let updated;
        if (task.status === "done") {
            updated = await reopenTask(task.id);
        } else {
            updated = await completeTask(task.id);
        }
        // Replace the old task in the array with the updated one
        setState({
            tasks: state.tasks.map(t => t.id === task.id ? updated : t)
        });
    } catch (err) {
        setState({ error: err.message });
    }
}

async function handleDelete(taskId) {
    try {
        setState({ error: null });
        await deleteTask(taskId);
        setState({ tasks: state.tasks.filter(t => t.id !== taskId) });
    } catch (err) {
        setState({ error: err.message });
    }
}

async function handleFilterChange(status) {
    setState({ activeFilter: status, loading: true, error: null });

    // Update active button styling
    document.querySelectorAll(".filter-btn").forEach(btn => {
        btn.classList.toggle("active", btn.dataset.status === status);
    });

    try {
        const data = await fetchTasks(status);
        setState({ tasks: data.tasks, loading: false });
    } catch (err) {
        setState({ error: err.message, loading: false });
    }
}

// ============================================================
// STATE MANAGEMENT
// setState merges new values into state and re-renders.
// This is a simplified version of what React's setState does.
// ============================================================

function setState(updates) {
    state = { ...state, ...updates };
    render();
}

// ============================================================
// INITIALISATION
// Wire up event listeners and load initial data.
// ============================================================

async function init() {
    // Add task on button click
    document.getElementById("add-btn").addEventListener("click", handleAddTask);

    // Add task on Enter key
    document.getElementById("new-task-input").addEventListener("keydown", e => {
        if (e.key === "Enter") handleAddTask();
    });

    // Filter buttons
    document.querySelectorAll(".filter-btn").forEach(btn => {
        btn.addEventListener("click", () => handleFilterChange(btn.dataset.status));
    });

    // Load initial tasks
    try {
        const data = await fetchTasks();
        setState({ tasks: data.tasks, loading: false });
    } catch (err) {
        setState({ error: "Could not connect to the API.", loading: false });
    }
}

// Run init when the page is ready
document.addEventListener("DOMContentLoaded", init);
```

## What we learned

A frontend is a web page that makes HTTP requests. `fetch()` is the browser's built-in function for making HTTP requests. The result is JSON, which JavaScript can work with natively.

The pattern in the JavaScript mirrors the pattern in the Python: state is separate from rendering, API calls are separate from event handling, and every function has one job.

---

# Episode 9 — Running the Complete Application

## Starting everything

```bash
# 1. Make sure PostgreSQL is running
# On Mac with Homebrew:
brew services start postgresql

# 2. Activate the virtual environment
source venv/bin/activate

# 3. Make sure the .env file exists and has the correct DATABASE_URL
cat .env

# 4. Start the server
uvicorn main:app --reload

# Server starts at http://localhost:8000
# API explorer at http://localhost:8000/docs
# Frontend at http://localhost:8000 (after the mount in main.py)
```

## The complete file structure

```
todo_api/
├── .env                          ← Your secrets (never commit this)
├── .env.example                  ← Template (commit this)
├── .gitignore                    ← Ignores .env, venv/, __pycache__/
├── requirements.txt              ← pip install -r requirements.txt
│
├── main.py                       ← FastAPI app, CORS, routing, startup
├── database.py                   ← Connection, get_db(), create_tables()
├── dependencies.py               ← FastAPI dependency injection
├── exceptions.py                 ← TaskNotFoundError, etc.
│
├── models/
│   ├── task.py                   ← Task dataclass, TaskStatus, Priority enums
│   └── schemas.py                ← Pydantic request/response models
│
├── repositories/
│   ├── base.py                   ← TaskRepository abstract interface
│   ├── memory.py                 ← InMemoryTaskRepository
│   └── postgres.py               ← PostgreSQLTaskRepository
│
├── services/
│   └── task_service.py           ← TaskService — all use cases
│
├── routers/
│   └── tasks.py                  ← HTTP route handlers
│
└── frontend/
    ├── index.html                ← Page structure
    ├── style.css                 ← Styles
    └── app.js                    ← JavaScript, fetch(), state, rendering
```

## The full layered picture

```
Browser (index.html + app.js)
    ↓  HTTP requests via fetch()
FastAPI (main.py + routers/tasks.py)
    ↓  validates with Pydantic schemas (schemas.py)
    ↓  calls via Depends()
TaskService (services/task_service.py)
    ↓  enforces rules via domain methods
Task (models/task.py)
    ↓  persists via
TaskRepository interface (repositories/base.py)
    ↓  implemented by
PostgreSQLTaskRepository (repositories/postgres.py)
    ↓  SQL via psycopg2
PostgreSQL database
```

Each arrow is a dependency. Each layer only knows about the layer directly below it:
- The browser does not know about Python
- The routes do not know about SQL
- The service does not know about HTTP
- The repository does not know about business rules

This is **separation of concerns**. Each layer has one job. You can change any layer without touching the others.

## Common things that go wrong

```bash
# "Connection refused" from psycopg2
# → PostgreSQL is not running, or DATABASE_URL is wrong
brew services start postgresql   # Mac
sudo service postgresql start    # Linux
psql -U todo_user todo_app       # Test the connection manually

# "Module not found" errors
# → Virtual environment is not activated, or pip install wasn't run
source venv/bin/activate
pip install -r requirements.txt

# CORS error in the browser console
# → The CORS middleware in main.py is not configured correctly
# → Make sure allow_origins includes your frontend's origin

# 422 Unprocessable Entity
# → Request body failed Pydantic validation
# → Check the error response body — it tells you exactly which field failed
# → Visit /docs and use the interactive explorer to test

# Tasks not saving between restarts
# → You are using InMemoryTaskRepository instead of PostgreSQLTaskRepository
# → Check the APP_ENV variable in .env
```

---

# Where We Are — What You Have Built

You have built a complete full-stack web application:

- A **domain model** that owns its own rules
- A **repository pattern** that hides database details
- A **service layer** that implements use cases
- A **FastAPI backend** that exposes the service over HTTP
- A **PostgreSQL database** for persistent storage
- A **plain JavaScript frontend** that talks to the API

And you have seen exactly how all of it connects — no magic, no hidden frameworks doing things behind your back.

---

# What Comes Next

**Series 3 — Authentication and Users**
Add user accounts. Each user has their own tasks. Learn about JWT tokens, password hashing, and how authentication middleware works.

**Series 4 — Testing Properly**
Write a real test suite using pytest. Learn how to test each layer in isolation. Mock dependencies. Test the API with a test client.

**Series 5 — Going to Production**
Docker, environment configuration, running behind nginx, basic deployment to a cloud server.

**Series 6 — STEM and Data**
Add MongoDB for a document store (tasks with rich metadata). Connect to a linear algebra library. Build a data pipeline. The same patterns — repositories, services, events — apply to data science work too.

The patterns you have learned in Series 1 and 2 are the foundation for all of it. Every production codebase you will ever read uses these same ideas. The names might differ, the frameworks will differ, but the separation of concerns, the repository pattern, the service layer, and the event system are everywhere.
