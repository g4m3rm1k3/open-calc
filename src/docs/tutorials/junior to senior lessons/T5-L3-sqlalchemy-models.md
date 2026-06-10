# Junior to Senior — T5·L3 — SQLAlchemy 2: Models and Relationships

**Prerequisites:** T5·L2 (FastAPI Dependency Injection). You have working endpoints
with an in-memory store and a database session dependency. This lesson replaces the
in-memory store with a real SQLite database using SQLAlchemy 2.

**What this lab adds:**
- `DeclarativeBase` and mapped classes: defining database tables as Python classes
- `Mapped[T]` and `mapped_column`: typed column declarations
- `relationship()`: declaring foreign key navigation
- `AsyncSession` operations: `session.add()`, `await session.commit()`, `await session.refresh()`
- `expire_on_commit=False`: why this parameter is required for async code

**Time:** 60–90 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. What is the difference between a SQLAlchemy mapped class (like `TaskModel`)
>    and the domain `Task` class from earlier lessons?
> 2. `await session.commit()` succeeds. You access `task.id` immediately after.
>    Will it have the database-assigned value without `expire_on_commit=False`?
> 3. `projects` and `tasks` tables. Each task belongs to one project.
>    Which table holds the foreign key column?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

Two SQLAlchemy models with a relationship, and a repository that uses them:

```python
# In the database, automatically created:
# Table: projects — id (PK), name, created_at
# Table: tasks    — id (PK), title, priority, done, project_id (FK → projects.id)

# Usage:
project = ProjectModel(name='Backend work')
task    = TaskModel(title='Write tests', priority='high', project=project)
session.add(project)   # session tracks both (cascade)
await session.commit() # writes to DB — assigns integer IDs
await session.refresh(task)
task.id       # → 1 (DB-assigned)
```

---

### Concept: SQLAlchemy Mapped Classes

**What it is:** A SQLAlchemy mapped class is a Python class decorated with `DeclarativeBase`
that represents a database table. Each class attribute annotated with `Mapped[T]`
represents a column.

**The problem before (writing SQL by hand):**

```python
async def create_task(session, title: str, priority: str) -> dict:
    await session.execute(
        'INSERT INTO tasks (title, priority, done) VALUES ($1, $2, $3)',
        (title, priority, False)
    )
    row = await session.fetchone('SELECT id, title, priority, done FROM tasks WHERE ...')
    return dict(row)
```

Problems: manual SQL strings (error-prone, no autocomplete), no type checking,
every change requires updating raw SQL and Python code separately.

**The solution — mapped classes:**

```python
class TaskModel(Base):
    __tablename__ = 'tasks'
    id:       Mapped[int]  = mapped_column(primary_key=True)
    title:    Mapped[str]
    priority: Mapped[str]  = mapped_column(default='medium')
    done:     Mapped[bool] = mapped_column(default=False)
```

SQLAlchemy generates all SQL from the class definition. Adding a column means
adding one line to the class — no SQL to update elsewhere.

**What it hides:** SQL generation, column name/type mapping, primary key handling,
and connection pooling. You write Python classes; SQLAlchemy translates them to SQL.

**The invariant SQLAlchemy protects:** The Python class and the database table stay
in sync — any access to `task.title` reads from the correct column.

**Canonical example:** A filing cabinet. The `TaskModel` class is the folder template
(defines what goes in each folder). Each `TaskModel` instance is one folder (one row).
SQLAlchemy is the filing system that puts folders in the right cabinet (database).

**Project application:** `TaskModel` and `ProjectModel` are the database representations
of tasks and projects. The FastAPI routes will use repositories that translate between
domain `Task` objects and `TaskModel` database rows.

**Smallest possible example:**

```python
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column

class Base(DeclarativeBase):
    pass

class Item(Base):
    __tablename__ = 'items'

    id:   Mapped[int] = mapped_column(primary_key=True)   # auto-increment PK
    name: Mapped[str]                                      # NOT NULL VARCHAR by default
    qty:  Mapped[int] = mapped_column(default=0)
```

**You will see this again in:**
- Every SQLAlchemy ORM project — this is the modern SQLAlchemy 2 declarative style
- Django ORM: `class Task(models.Model): title = models.CharField(max_length=200)` — same concept
- TypeScript: TypeORM's `@Entity()` and `@Column()` decorators are the equivalent

**Watch for:** `Mapped[str | None]` vs `Mapped[str]`. `str` means the column is NOT NULL.
`str | None` means the column is nullable. SQLAlchemy infers nullability from the type hint.
For nullable columns you must use `str | None` — not `str` with `nullable=True`.

---

## Step 1 — Create the Database Foundation

Create `src/infrastructure/database.py`:

```python
# src/infrastructure/database.py
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from sqlalchemy.orm          import DeclarativeBase
from src.config              import config

# Create the async engine — one per application:
engine = create_async_engine(
    config.database_url,
    echo=config.debug,   # echo=True logs all SQL to the console in debug mode
)

# Session factory — creates new sessions on demand:
SessionLocal = async_sessionmaker(
    engine,
    expire_on_commit=False,   # explained in the concept block below
)


class Base(DeclarativeBase):
    """All mapped classes inherit from this base."""
    pass


async def init_db() -> None:
    """Creates all tables that don't exist yet. Call once at startup."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
```

### SAVE AND TRY

```bash
python -c "
from src.infrastructure.database import Base, engine
print('Base created:', Base.__name__)
print('Engine dialect:', engine.dialect.name)
"
```

**You should see:**
```
Base created: Base
Engine dialect: sqlite
```

---

### Concept: `expire_on_commit=False` — Required for Async

**What it is:** By default, SQLAlchemy "expires" all object attributes after a commit.
The next access to any attribute triggers a new SELECT query to reload the value.
In async code, this implicit SQL query breaks the async contract.

**The problem before (without `expire_on_commit=False`):**

```python
task = TaskModel(title='Write tests', priority='high')
session.add(task)
await session.commit()   # task.title is now "expired"
print(task.title)        # ← triggers a NEW SQL query — but we're not in an async context!
# → MissingGreenlet error: no running event loop to await the query
```

**The solution:**

```python
SessionLocal = async_sessionmaker(engine, expire_on_commit=False)
# After commit, attribute values are RETAINED — no implicit queries needed
```

**What it hides:** The session's identity map expiry system. Normally, expiring ensures
you always read fresh data from the database. With `expire_on_commit=False`, you read
the cached value from before the commit. For async code, this is the correct approach —
you explicitly call `await session.refresh(obj)` when you need fresh data.

**Canonical example:** A post office that handles your mail. Normally, after you pick up
your mail (commit), all your mailboxes are cleared (expired) and you must re-request.
`expire_on_commit=False` is like keeping copies of your mail after pickup — you can
still read them without going back.

**Project application:** Every `create_task` operation adds a task, commits, and then
needs to return the task's database-assigned ID. `expire_on_commit=False` ensures
`task.id` is accessible after commit without a second query.

**You will see this again in:**
- Every production async SQLAlchemy project uses `expire_on_commit=False`
- Synchronous SQLAlchemy code can use the default (expiry) because sync implicit queries are fine
- The pattern: set `expire_on_commit=False`, call `await session.refresh(obj)` explicitly
  when fresh data is required

**Watch for:** Setting `expire_on_commit=False` means your object MAY have stale data
after a concurrent database update. For correctness-critical scenarios, call
`await session.refresh(task)` after commit to fetch the latest values from the database.

---

## Step 2 — Build the Models — One Column at a Time

Create `src/infrastructure/models.py`. Build it incrementally.

First, just the projects table:

```python
# src/infrastructure/models.py
from __future__ import annotations
from datetime import datetime
from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from src.infrastructure.database import Base


class ProjectModel(Base):
    __tablename__ = 'projects'

    id:         Mapped[int]      = mapped_column(primary_key=True)
    name:       Mapped[str]      = mapped_column(String(200))
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)
```

### SAVE AND TRY

```bash
python -c "
from src.infrastructure.models import ProjectModel
from src.infrastructure.database import Base

# Check the table definition:
table = Base.metadata.tables['projects']
print('Table:', table.name)
for col in table.columns:
    print(f'  {col.name}: {col.type}  nullable={col.nullable}')
"
```

**You should see:**
```
Table: projects
  id: INTEGER  nullable=False
  name: VARCHAR(200)  nullable=False
  created_at: DATETIME  nullable=False
```

Now add the tasks table with a foreign key:

```python
# src/infrastructure/models.py
from __future__ import annotations
from datetime import datetime, date
from sqlalchemy import String, ForeignKey, Text         # ← add Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from src.infrastructure.database import Base


class ProjectModel(Base):
    __tablename__ = 'projects'

    id:         Mapped[int]      = mapped_column(primary_key=True)
    name:       Mapped[str]      = mapped_column(String(200))
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)

    tasks: Mapped[list['TaskModel']] = relationship(     # ← add this relationship
        'TaskModel',
        back_populates='project',
        cascade='all, delete-orphan',   # deleting a project deletes its tasks
    )


class TaskModel(Base):                                   # ← add this class
    __tablename__ = 'tasks'

    id:          Mapped[int]          = mapped_column(primary_key=True)
    title:       Mapped[str]          = mapped_column(String(200))
    priority:    Mapped[str]          = mapped_column(String(20), default='medium')
    done:        Mapped[bool]         = mapped_column(default=False)
    created_at:  Mapped[datetime]     = mapped_column(default=datetime.utcnow)
    due_date:    Mapped[date | None]  = mapped_column(nullable=True)
    project_id:  Mapped[int | None]   = mapped_column(ForeignKey('projects.id'), nullable=True)

    project: Mapped['ProjectModel | None'] = relationship(  # ← add this
        'ProjectModel',
        back_populates='tasks',
    )
```

### SAVE AND TRY

```bash
python -c "
from src.infrastructure.models import ProjectModel, TaskModel
from src.infrastructure.database import Base

tasks_table = Base.metadata.tables['tasks']
print('Tasks columns:')
for col in tasks_table.columns:
    print(f'  {col.name}: {col.type}  nullable={col.nullable}')

# Check the foreign key:
for fk in tasks_table.foreign_keys:
    print(f'FK: {fk.column} -> {fk.parent}')
"
```

**You should see:**
```
Tasks columns:
  id: INTEGER  nullable=False
  title: VARCHAR(200)  nullable=False
  priority: VARCHAR(20)  nullable=False
  done: BOOLEAN  nullable=False
  created_at: DATETIME  nullable=False
  due_date: DATE  nullable=True
  project_id: INTEGER  nullable=True
FK: projects.id -> tasks.project_id
```

---

### Concept: `relationship()` — Navigation Between Tables

**What it is:** `relationship()` declares a Python-level link between two mapped classes.
After loading a project, `project.tasks` gives you all associated tasks —
SQLAlchemy generates the SQL JOIN automatically.

**The problem before:**

```python
# Without relationship — manual JOIN:
project = await session.get(ProjectModel, project_id)
tasks   = await session.scalars(
    select(TaskModel).where(TaskModel.project_id == project_id)
)
```

**With relationship:**

```python
project = await session.get(ProjectModel, project_id)
await session.refresh(project, ['tasks'])
tasks = project.tasks   # ← automatically fetched via relationship
```

**What it hides:** The SQL JOIN generation. You express the relationship once in
the class definition; SQLAlchemy generates the appropriate query every time you
navigate it.

**`cascade='all, delete-orphan'`:** This means:
- `all`: all operations (insert, update, delete) cascade from parent to children
- `delete-orphan`: if a task is removed from `project.tasks`, it is also deleted from the database

**The `back_populates` parameter:** Both sides of the relationship must reference
each other. `ProjectModel.tasks` points to `TaskModel`, and `TaskModel.project` points
back to `ProjectModel`. `back_populates` tells SQLAlchemy to keep both sides in sync.

**Project application:** `project.tasks` lets you navigate from a project to all its tasks.
`task.project` lets you navigate from a task to its project. No SQL needed for either.

**Smallest possible example:**

```python
class Author(Base):
    books: Mapped[list['Book']] = relationship('Book', back_populates='author')

class Book(Base):
    author_id: Mapped[int]       = mapped_column(ForeignKey('authors.id'))
    author:    Mapped['Author']  = relationship('Author', back_populates='books')

# After loading:
author = await session.get(Author, 1)
author.books   # → [Book(...), Book(...)]  — joined automatically
```

**You will see this again in:**
- Every multi-table SQLAlchemy schema uses `relationship()`
- Django ORM: `models.ForeignKey` with `related_name` is the equivalent
- TypeORM: `@OneToMany()` and `@ManyToOne()` decorators

**Watch for:** Accessing a relationship attribute triggers a SQL query. In async code,
never access a relationship outside of an async context — use `await session.refresh(obj, ['attr'])`.
Alternatively, use `selectinload` or `joinedload` when querying to load the relationship eagerly.

---

## Step 3 — Build the Task Repository

Create `src/infrastructure/task_repository.py`:

```python
# src/infrastructure/task_repository.py
from __future__ import annotations
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy               import select
from src.infrastructure.models import TaskModel
from src.api.models            import CreateTaskRequest


class SQLAlchemyTaskRepository:
    """
    Translates between API request objects and database rows.
    Each instance uses one AsyncSession for its lifetime.
    """

    def __init__(self, session: AsyncSession) -> None:
        self.session = session
```

### SAVE AND TRY

```bash
python -c "
from src.infrastructure.task_repository import SQLAlchemyTaskRepository
print('Repository class created:', SQLAlchemyTaskRepository.__name__)
"
```

Add the `create` method:

```python
    async def create(self, body: CreateTaskRequest) -> TaskModel:   # ← add this
        task = TaskModel(
            title    = body.title,
            priority = body.priority,
            due_date = body.due_date,
        )
        self.session.add(task)    # stage for INSERT — not in DB yet
        await self.session.commit()       # execute INSERT — assigns task.id
        await self.session.refresh(task)  # reload from DB (needed after commit)
        return task
```

### SAVE AND TRY (requires a test database)

```bash
python -c "
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from src.infrastructure.database import Base
from src.infrastructure.task_repository import SQLAlchemyTaskRepository
from src.api.models import CreateTaskRequest

async def test():
    engine = create_async_engine('sqlite+aiosqlite:///:memory:')
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    Session = async_sessionmaker(engine, expire_on_commit=False)
    async with Session() as session:
        repo = SQLAlchemyTaskRepository(session)
        body = CreateTaskRequest(title='Write tests', priority='high')
        task = await repo.create(body)
        print('Created task id:', task.id, 'title:', task.title)

asyncio.run(test())
"
```

**You should see:** `Created task id: 1 title: Write tests`

Now add `get_by_id`, `list_all`, and `delete`:

```python
    async def get_by_id(self, task_id: int) -> TaskModel | None:     # ← add
        return await self.session.get(TaskModel, task_id)
        # session.get() checks the identity map first (O(1)), then the DB

    async def list_all(                                               # ← add
        self,
        priority: str | None = None,
        done:     bool | None = None,
    ) -> list[TaskModel]:
        stmt = select(TaskModel)
        if priority is not None:
            stmt = stmt.where(TaskModel.priority == priority)
        if done is not None:
            stmt = stmt.where(TaskModel.done == done)
        result = await self.session.scalars(stmt)
        return list(result.all())

    async def delete(self, task_id: int) -> bool:                    # ← add
        task = await self.get_by_id(task_id)
        if task is None:
            return False
        await self.session.delete(task)
        await self.session.commit()
        return True
```

---

## Step 4 — Write the Tests

```bash
pip install aiosqlite pytest-asyncio
```

Create `tests/test_task_repository.py`:

```python
# tests/test_task_repository.py
import pytest
import pytest_asyncio
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from src.infrastructure.database        import Base
from src.infrastructure.task_repository import SQLAlchemyTaskRepository
from src.api.models                     import CreateTaskRequest

TEST_DB_URL = 'sqlite+aiosqlite:///:memory:'


@pytest_asyncio.fixture
async def session() -> AsyncSession:
    """Provides a fresh in-memory SQLite session for each test."""
    engine = create_async_engine(TEST_DB_URL, echo=False)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)     # create tables
    Session = async_sessionmaker(engine, expire_on_commit=False)
    async with Session() as s:
        yield s
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)       # clean up
    await engine.dispose()


class TestSQLAlchemyTaskRepository:

    @pytest.mark.asyncio
    async def test_create_assigns_database_id(self, session: AsyncSession) -> None:
        repo = SQLAlchemyTaskRepository(session)
        body = CreateTaskRequest(title='Write tests', priority='high')

        task = await repo.create(body)

        assert task.id is not None    # DB assigned an integer ID
        assert task.title    == 'Write tests'
        assert task.priority == 'high'
        assert task.done     is False

    @pytest.mark.asyncio
    async def test_get_by_id_returns_saved_task(self, session: AsyncSession) -> None:
        repo    = SQLAlchemyTaskRepository(session)
        created = await repo.create(CreateTaskRequest(title='Write tests'))

        found = await repo.get_by_id(created.id)

        assert found is not None
        assert found.title == 'Write tests'

    @pytest.mark.asyncio
    async def test_get_by_id_returns_none_for_unknown(self, session: AsyncSession) -> None:
        repo  = SQLAlchemyTaskRepository(session)
        found = await repo.get_by_id(9999)
        assert found is None

    @pytest.mark.asyncio
    async def test_list_all_returns_all_tasks(self, session: AsyncSession) -> None:
        repo = SQLAlchemyTaskRepository(session)
        await repo.create(CreateTaskRequest(title='A'))
        await repo.create(CreateTaskRequest(title='B'))

        tasks = await repo.list_all()
        assert len(tasks) == 2

    @pytest.mark.asyncio
    async def test_list_all_filters_by_priority(self, session: AsyncSession) -> None:
        repo = SQLAlchemyTaskRepository(session)
        await repo.create(CreateTaskRequest(title='High', priority='high'))
        await repo.create(CreateTaskRequest(title='Low',  priority='low'))

        high_tasks = await repo.list_all(priority='high')
        assert len(high_tasks) == 1
        assert high_tasks[0].priority == 'high'

    @pytest.mark.asyncio
    async def test_delete_removes_task(self, session: AsyncSession) -> None:
        repo    = SQLAlchemyTaskRepository(session)
        created = await repo.create(CreateTaskRequest(title='Write tests'))

        result = await repo.delete(created.id)

        assert result is True
        assert await repo.get_by_id(created.id) is None

    @pytest.mark.asyncio
    async def test_delete_returns_false_for_nonexistent(self, session: AsyncSession) -> None:
        repo   = SQLAlchemyTaskRepository(session)
        result = await repo.delete(9999)
        assert result is False
```

### SAVE AND TRY

```bash
pytest tests/test_task_repository.py -v
```

**You should see:**
```
tests/test_task_repository.py::TestSQLAlchemyTaskRepository::test_create_assigns_database_id PASSED
tests/test_task_repository.py::TestSQLAlchemyTaskRepository::test_get_by_id_returns_saved_task PASSED
...
tests/test_task_repository.py::TestSQLAlchemyTaskRepository::test_delete_returns_false_for_nonexistent PASSED

7 passed
```

**Change something:** Remove `await session.refresh(task)` from the `create` method.
Rerun the `test_create_assigns_database_id` test. Expected: with `expire_on_commit=False`
it still passes (because the ID is available in-memory). This shows why
`expire_on_commit=False` matters for the default case.

---

## 🎯 Challenge: Add a `ProjectRepository`

**You know:** SQLAlchemy mapped classes, `session.add()`, `session.commit()`,
`session.get()`, `select()`.

**Task:** Build `SQLAlchemyProjectRepository` with:
- `create(name: str) -> ProjectModel`
- `get_by_id(project_id: int) -> ProjectModel | None`
- `list_tasks(project_id: int) -> list[TaskModel]`

Write 3 tests before implementing. Use the same in-memory SQLite fixture.

---

<details>
<summary>▶ Show Solution</summary>

```python
class SQLAlchemyProjectRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def create(self, name: str) -> ProjectModel:
        project = ProjectModel(name=name)
        self.session.add(project)
        await self.session.commit()
        await self.session.refresh(project)
        return project

    async def get_by_id(self, project_id: int) -> ProjectModel | None:
        return await self.session.get(ProjectModel, project_id)

    async def list_tasks(self, project_id: int) -> list[TaskModel]:
        stmt   = select(TaskModel).where(TaskModel.project_id == project_id)
        result = await self.session.scalars(stmt)
        return list(result.all())
```

**Tests:**
```python
@pytest.mark.asyncio
async def test_create_project(session) -> None:
    repo    = SQLAlchemyProjectRepository(session)
    project = await repo.create('Backend')
    assert project.id is not None
    assert project.name == 'Backend'

@pytest.mark.asyncio
async def test_list_tasks_for_project(session) -> None:
    p_repo  = SQLAlchemyProjectRepository(session)
    t_repo  = SQLAlchemyTaskRepository(session)
    project = await p_repo.create('Backend')
    await t_repo.create(CreateTaskRequest(title='A'))  # no project_id
    # Add task directly with project_id:
    task = TaskModel(title='B', project_id=project.id)
    session.add(task)
    await session.commit()
    tasks = await p_repo.list_tasks(project.id)
    assert len(tasks) == 1

@pytest.mark.asyncio
async def test_list_tasks_only_returns_that_project_tasks(session) -> None:
    p_repo  = SQLAlchemyProjectRepository(session)
    p1      = await p_repo.create('Project 1')
    p2      = await p_repo.create('Project 2')
    task    = TaskModel(title='P2 task', project_id=p2.id)
    session.add(task)
    await session.commit()
    tasks = await p_repo.list_tasks(p1.id)
    assert len(tasks) == 0
```

</details>

---

## Final Check

| Concept | What to verify |
|---|---|
| `Mapped[T]` type inference | `Mapped[str]` → NOT NULL; `Mapped[str | None]` → nullable |
| `mapped_column(primary_key=True)` | auto-increment, not provided on create |
| `expire_on_commit=False` | `task.id` accessible after commit without refresh |
| `relationship()` | `project.tasks` navigates to associated tasks |
| `cascade='all, delete-orphan'` | Deleting project deletes its tasks |
| `session.get()` uses identity map | Two `session.get()` calls for same ID return same object |

---

## Quick Check Answers

**1. SQLAlchemy `TaskModel` vs domain `Task` — what is the difference?**

`TaskModel` is an infrastructure concern — it knows about the database (table name,
column types, foreign keys, relationships). `Task` is a domain concern — it knows about
business rules (`complete()`, validation, priority constraints). The infrastructure layer
converts between them. Keeping them separate means the database schema can change without
affecting business logic, and vice versa. In a simple project, they might be the same
class — but separating them is the correct architecture.

**2. `await session.commit()` — access `task.id` immediately — value available without `expire_on_commit=False`?**

No. Without `expire_on_commit=False`, SQLAlchemy expires all attributes after commit.
The next access to `task.id` would trigger a new SELECT query. In async code, that
implicit query needs an event loop — accessing `task.id` outside of an async context
raises `MissingGreenlet`. With `expire_on_commit=False`, attribute values are retained
from before the commit. Use `await session.refresh(task)` when you need the absolutely
latest values from the database.

**3. `projects` and `tasks` — which table holds the foreign key?**

`tasks`. The "many" side of a one-to-many relationship holds the foreign key.
Many tasks can belong to one project — so `tasks.project_id` points to `projects.id`.
The `projects` table has no reference to `tasks`. This is the standard relational
database normalisation rule: foreign keys go on the "many" side.
