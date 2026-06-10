# Junior to Senior — T5·L4 — SQLAlchemy 2: Queries

**Prerequisites:** T5·L3 (SQLAlchemy Models). You have mapped classes and a working
repository. This lesson covers the query API — selecting, filtering, ordering,
paginating, and bulk-updating records efficiently.

**What this lab adds:**
- `select(Model)` — building a SELECT statement step by step
- `where()` — filtering with column comparisons and `ilike` for case-insensitive search
- `session.scalars(stmt).all()` — executing a statement and materialising results
- `session.get(Model, id)` — primary key lookup that uses the identity map
- `order_by`, `limit`, `offset` — sorting and pagination
- `update()` — bulk updates without loading objects into memory

**Time:** 45–60 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. `session.scalars(stmt).one()` — what happens when the query matches two rows?
>    What happens when it matches zero rows?
> 2. `session.get(TaskModel, 99)` vs `select(TaskModel).where(TaskModel.id == 99)` —
>    when would the first be faster, and why?
> 3. You need to mark 500 tasks as `done=True` without loading them all into memory.
>    Which SQLAlchemy operation handles this in one SQL statement?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

A repository with search, pagination, and bulk-update capabilities:

```python
# Complex query with pagination:
result = await repo.search(TaskSearchParams(
    priority='high',
    done=False,
    title_contains='deploy',
    order_by='created_at',
    page=1,
    page_size=20,
))
print(result.total)          # total matching records
print(result.total_pages)    # number of pages
print(len(result.items))     # items on this page

# Bulk update:
updated = await repo.mark_all_done(project_id=5)
print(f'{updated} tasks marked done')
```

---

### Concept: Building Queries With `select()`

**What it is:** `select(Model)` creates a SQL SELECT statement. Calling `.where()`,
`.order_by()`, `.limit()`, `.offset()` on it builds up the query without executing it.
The query only runs when you pass it to `session.execute()` or `session.scalars()`.

**The problem before — building SQL strings:**

```python
async def list_tasks(priority=None, done=None):
    query = 'SELECT * FROM tasks WHERE 1=1'
    params = []
    if priority:
        query += ' AND priority = $1'
        params.append(priority)
    if done is not None:
        query += f' AND done = ${len(params)+1}'
        params.append(done)
    rows = await session.execute(query, params)
```

String concatenation is error-prone. SQL injection is possible if params are interpolated.
The type system knows nothing about these strings.

**The solution — composable query objects:**

```python
from sqlalchemy import select

stmt = select(TaskModel)

if priority is not None:
    stmt = stmt.where(TaskModel.priority == priority)   # ← adds AND priority = ?

if done is not None:
    stmt = stmt.where(TaskModel.done == done)           # ← adds AND done = ?

result = await session.scalars(stmt)
tasks   = result.all()   # list[TaskModel]
```

Each `.where()` call returns a NEW query object — the original is not modified.
SQLAlchemy generates parameterised SQL — SQL injection is impossible.

**What it hides:** Parameterised query construction, SQL escaping, and database-specific
SQL syntax. The same query object generates correct SQL for SQLite, PostgreSQL, and MySQL.

**Canonical example:** A query is like a search form. Filling in the "priority" field
adds one filter. Filling in "done" adds another. Submitting the form (executing the query)
sends all filled-in filters to the database at once.

**Project application:** `list_all` uses `select(TaskModel)` and chains `.where()` for
each active filter. The same pattern is used for pagination and search.

**Smallest possible example:**

```python
# Build the query:
stmt = select(TaskModel)
stmt = stmt.where(TaskModel.priority == 'high')
stmt = stmt.where(TaskModel.done     == False)
stmt = stmt.order_by(TaskModel.created_at.desc())
stmt = stmt.limit(10)

# Execute it:
result = await session.scalars(stmt)
tasks   = result.all()   # list[TaskModel]
```

**You will see this again in:**
- Django ORM: `Task.objects.filter(priority='high').order_by('-created_at')[:10]`
- SQL in every backend framework — the composable pattern is universal
- TypeORM: `createQueryBuilder().where('priority = :p', {p:'high'}).limit(10).getMany()`

**Watch for:** `stmt.where(...)` does NOT modify `stmt` in place — it returns a new query.
You must assign it: `stmt = stmt.where(...)`. Forgetting the assignment means the filter
is silently dropped.

---

## Step 1 — See the Query Composition

```bash
python -c "
from sqlalchemy import select
from src.infrastructure.models import TaskModel

# Build a query step by step:
stmt = select(TaskModel)
print('base:', str(stmt.compile()))

stmt = stmt.where(TaskModel.priority == 'high')
print('with priority filter:', str(stmt.compile()))

stmt = stmt.order_by(TaskModel.created_at.desc()).limit(5)
print('with order and limit:', str(stmt.compile()))
"
```

**You should see:** The SQL string being built up, showing how each method adds
to the query without executing it.

---

### Concept: Fetching Results — `all()`, `one()`, `one_or_none()`, `first()`

**What it is:** After executing a query with `session.scalars(stmt)`, the result
object has multiple methods for retrieving the rows:

| Method | Returns | Raises on 0 rows | Raises on 2+ rows |
|---|---|---|---|
| `.all()` | `list[Model]` | Empty list | Never |
| `.first()` | `Model | None` | `None` | Never (ignores extra) |
| `.one()` | `Model` | `NoResultFound` | `MultipleResultsFound` |
| `.one_or_none()` | `Model | None` | `None` | `MultipleResultsFound` |

**The problem before:**

```python
result = await session.scalars(stmt)
tasks = result.all()
if len(tasks) == 0:
    return None
if len(tasks) > 1:
    raise ValueError('Expected one result')
return tasks[0]
# 6 lines instead of 1
```

**The solution:**

```python
result = await session.scalars(stmt)
task   = result.one_or_none()   # None if not found, raises if multiple
```

**Project application:** `get_by_id` uses `session.get(Model, id)` (uses identity map).
`search` uses `.all()`. A "find by email" method uses `.one_or_none()`.

**Smallest possible example:**

```python
result = await session.scalars(select(TaskModel).where(TaskModel.id == 99))
task   = result.one_or_none()   # None if id 99 doesn't exist
```

**You will see this again in:**
- Django ORM: `.get()` raises `DoesNotExist` or `MultipleObjectsReturned`; `.filter()` returns a QuerySet
- Every ORM framework has these same retrieval modes

**Watch for:** `.one()` is strict. If your query could legitimately return zero rows,
use `.one_or_none()` instead. A `NoResultFound` exception from `.one()` indicates a
programming bug (you expected exactly one row but got none).

---

### Concept: `ilike()` — Case-Insensitive Search

**What it is:** `column.ilike('%term%')` generates a case-insensitive LIKE query.
`i` stands for "case-insensitive"; `%` is a wildcard (zero or more characters).

```python
stmt = stmt.where(TaskModel.title.ilike('%deploy%'))
# Matches: 'Deploy to production', 'DEPLOY', 'deploy app', 'Auto-deploy'
```

**vs `like()`:** `like('%deploy%')` is case-sensitive — 'DEPLOY' would not match.

**Project application:** Title search in the task API should match regardless of
how the user typed the search term.

**Smallest possible example:**

```python
stmt = select(TaskModel).where(TaskModel.title.ilike('%test%'))
# Matches: 'Write tests', 'Test the API', 'TEST', 'unit testing'
```

**Watch for:** `ilike` behaviour varies by database. On SQLite, `LIKE` is already
case-insensitive for ASCII characters — `ilike` has no effect. On PostgreSQL,
`ILIKE` is a distinct operator. Always test search queries against your target database.

---

### Concept: `func.count()` — Counting Without Loading

**What it is:** `select(func.count())` generates `SELECT COUNT(*)`. Executing it
returns a single integer — the number of matching rows — without loading any rows.

**The problem before:**

```python
all_tasks = await session.scalars(stmt)   # loads ALL tasks into memory
total     = len(all_tasks.all())          # just to count them
```

**The solution:**

```python
from sqlalchemy import func, select as sa_select

count_stmt = sa_select(func.count()).select_from(stmt.subquery())
total      = await session.scalar(count_stmt)   # single integer, no rows loaded
```

**Project application:** Pagination needs the total count AND the current page of
results — two separate queries, each efficient.

---

### Concept: `update()` — Bulk Updates

**What it is:** `update(Model).where(...).values(...)` generates an UPDATE SQL
statement that runs in the database without loading rows into Python.

**The problem before:**

```python
tasks = await session.scalars(select(TaskModel).where(TaskModel.project_id == 5))
for task in tasks.all():   # loads ALL tasks into memory
    task.done = True        # marks each one in Python
await session.commit()      # generates N UPDATE statements
```

For 500 tasks, this is 500 + 1 queries. Slow.

**The solution:**

```python
from sqlalchemy import update

stmt = (
    update(TaskModel)
    .where(TaskModel.project_id == 5)
    .values(done=True)
)
result = await session.execute(stmt)
await session.commit()
rows_updated = result.rowcount   # → 500 (one SQL UPDATE statement)
```

**What it hides:** The row-by-row iteration. One SQL UPDATE statement is orders of
magnitude faster than N Python iterations.

**Project application:** "Complete all tasks in a project" is a common operation.
`update()` handles it in one query.

---

## Step 2 — Build the Advanced Repository

Update `src/infrastructure/task_repository.py`:

```python
# src/infrastructure/task_repository.py
from __future__ import annotations
from dataclasses                  import dataclass
from sqlalchemy.ext.asyncio       import AsyncSession
from sqlalchemy                   import select, update, func
from sqlalchemy.sql.expression    import Select
from src.infrastructure.models    import TaskModel
from src.api.models               import CreateTaskRequest


@dataclass
class TaskSearchParams:
    priority:       str | None = None
    done:           bool | None = None
    title_contains: str | None = None
    order_by:       str        = 'id'
    order_desc:     bool       = False
    page:           int        = 1
    page_size:      int        = 20


@dataclass
class PaginatedResult:
    items:     list[TaskModel]
    total:     int
    page:      int
    page_size: int

    @property
    def total_pages(self) -> int:
        return max(1, (self.total + self.page_size - 1) // self.page_size)


class SQLAlchemyTaskRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    def _build_filter_stmt(self, params: TaskSearchParams) -> Select:
        """Builds a SELECT statement with all active filters applied."""
        stmt = select(TaskModel)

        if params.priority is not None:
            stmt = stmt.where(TaskModel.priority == params.priority)
        if params.done is not None:
            stmt = stmt.where(TaskModel.done == params.done)
        if params.title_contains is not None:
            stmt = stmt.where(TaskModel.title.ilike(f'%{params.title_contains}%'))

        return stmt

    async def search(self, params: TaskSearchParams) -> PaginatedResult:
        """Searches tasks with filters, pagination, and ordering."""
        # Count total matching rows (no pagination):
        filter_stmt = self._build_filter_stmt(params)
        count_stmt  = select(func.count()).select_from(filter_stmt.subquery())
        total       = await self.session.scalar(count_stmt) or 0

        # Fetch the requested page:
        col   = getattr(TaskModel, params.order_by, TaskModel.id)
        order = col.desc() if params.order_desc else col.asc()

        page_stmt = (
            filter_stmt
            .order_by(order)
            .offset((params.page - 1) * params.page_size)
            .limit(params.page_size)
        )
        items = list((await self.session.scalars(page_stmt)).all())

        return PaginatedResult(
            items=items, total=total, page=params.page, page_size=params.page_size
        )

    async def create(self, body: CreateTaskRequest) -> TaskModel:
        task = TaskModel(title=body.title, priority=body.priority, due_date=body.due_date)
        self.session.add(task)
        await self.session.commit()
        await self.session.refresh(task)
        return task

    async def get_by_id(self, task_id: int) -> TaskModel | None:
        return await self.session.get(TaskModel, task_id)

    async def list_all(
        self,
        priority: str | None = None,
        done:     bool | None = None,
    ) -> list[TaskModel]:
        result = await self.search(
            TaskSearchParams(priority=priority, done=done, page_size=1000)
        )
        return result.items

    async def mark_all_done(self, project_id: int) -> int:
        """Marks all undone tasks in a project as done. Returns count updated."""
        stmt = (
            update(TaskModel)
            .where(TaskModel.project_id == project_id)
            .where(TaskModel.done == False)
            .values(done=True)
        )
        result = await self.session.execute(stmt)
        await self.session.commit()
        return result.rowcount

    async def delete(self, task_id: int) -> bool:
        task = await self.get_by_id(task_id)
        if task is None:
            return False
        await self.session.delete(task)
        await self.session.commit()
        return True
```

---

## Step 3 — Write the Tests

Create `tests/test_task_queries.py`:

```python
# tests/test_task_queries.py
import pytest
import pytest_asyncio
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from src.infrastructure.database        import Base
from src.infrastructure.task_repository import SQLAlchemyTaskRepository, TaskSearchParams
from src.api.models                     import CreateTaskRequest

TEST_DB_URL = 'sqlite+aiosqlite:///:memory:'


@pytest_asyncio.fixture
async def repo() -> SQLAlchemyTaskRepository:
    engine = create_async_engine(TEST_DB_URL)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    Session = async_sessionmaker(engine, expire_on_commit=False)
    async with Session() as session:
        yield SQLAlchemyTaskRepository(session)
    await engine.dispose()


class TestSearch:

    @pytest.mark.asyncio
    async def test_returns_all_when_no_filters(self, repo) -> None:
        await repo.create(CreateTaskRequest(title='A'))
        await repo.create(CreateTaskRequest(title='B'))
        result = await repo.search(TaskSearchParams())
        assert result.total == 2
        assert len(result.items) == 2

    @pytest.mark.asyncio
    async def test_filters_by_priority(self, repo) -> None:
        await repo.create(CreateTaskRequest(title='High', priority='high'))
        await repo.create(CreateTaskRequest(title='Low',  priority='low'))
        result = await repo.search(TaskSearchParams(priority='high'))
        assert result.total == 1
        assert result.items[0].priority == 'high'

    @pytest.mark.asyncio
    async def test_title_contains_is_case_insensitive(self, repo) -> None:
        await repo.create(CreateTaskRequest(title='Deploy to Production'))
        await repo.create(CreateTaskRequest(title='Write unit tests'))
        result = await repo.search(TaskSearchParams(title_contains='DEPLOY'))
        assert result.total == 1

    @pytest.mark.asyncio
    async def test_pagination_returns_correct_page(self, repo) -> None:
        for i in range(5):
            await repo.create(CreateTaskRequest(title=f'Task {i}'))
        result = await repo.search(TaskSearchParams(page=1, page_size=2))
        assert len(result.items) == 2
        assert result.total      == 5
        assert result.total_pages == 3

    @pytest.mark.asyncio
    async def test_orders_by_title_ascending(self, repo) -> None:
        await repo.create(CreateTaskRequest(title='Zebra task'))
        await repo.create(CreateTaskRequest(title='Apple task'))
        result = await repo.search(TaskSearchParams(order_by='title'))
        assert result.items[0].title == 'Apple task'


class TestMarkAllDone:

    @pytest.mark.asyncio
    async def test_marks_undone_tasks_and_returns_count(self, repo) -> None:
        from src.infrastructure.models import TaskModel
        # Add tasks directly with project_id:
        t1 = TaskModel(title='A', project_id=1)
        t2 = TaskModel(title='B', project_id=1)
        repo.session.add_all([t1, t2])
        await repo.session.commit()

        count = await repo.mark_all_done(project_id=1)
        assert count == 2

        found = await repo.get_by_id(t1.id)
        assert found.done is True
```

### SAVE AND TRY

```bash
pytest tests/test_task_queries.py -v
```

**You should see:**
```
tests/test_task_queries.py::TestSearch::test_returns_all_when_no_filters PASSED
...
tests/test_task_queries.py::TestMarkAllDone::test_marks_undone_tasks_and_returns_count PASSED

6 passed
```

---

## 🎯 Challenge: Add `count_by_priority`

**You know:** `select(func.count())`, `group_by`.

**Task:** Add `async def count_by_priority(self) -> dict[str, int]` that returns a
dictionary mapping each priority level to its task count, using a single SQL query
with `GROUP BY`.

Write 2 tests before implementing.

---

<details>
<summary>▶ Show Solution</summary>

```python
from sqlalchemy import func

async def count_by_priority(self) -> dict[str, int]:
    """Counts tasks per priority level in one SQL query."""
    stmt = (
        select(TaskModel.priority, func.count().label('count'))
        .group_by(TaskModel.priority)
    )
    rows = (await self.session.execute(stmt)).all()
    return {row.priority: row.count for row in rows}
```

**Tests:**
```python
@pytest.mark.asyncio
async def test_count_by_priority_returns_correct_counts(repo) -> None:
    for _ in range(3): await repo.create(CreateTaskRequest(title='T', priority='high'))
    for _ in range(2): await repo.create(CreateTaskRequest(title='T', priority='low'))
    counts = await repo.count_by_priority()
    assert counts['high'] == 3
    assert counts['low']  == 2

@pytest.mark.asyncio
async def test_count_by_priority_empty_db_returns_empty_dict(repo) -> None:
    counts = await repo.count_by_priority()
    assert counts == {}
```

**Key insight:** `GROUP BY` aggregation runs in the database — one round trip, no Python
iteration over rows. `func.count().label('count')` creates a named column `count` in the
result. Accessing it as `row.count` (not `row[1]`) is possible because of the `.label()`.

</details>

---

## Final Check

| Operation | SQLAlchemy | What it does |
|---|---|---|
| Select all | `select(Model)` + `.all()` | `SELECT * FROM table` |
| Filter | `.where(Model.field == value)` | `WHERE field = ?` |
| ILIKE search | `.where(Model.field.ilike('%term%'))` | Case-insensitive LIKE |
| Order | `.order_by(Model.field.desc())` | `ORDER BY field DESC` |
| Paginate | `.offset(n).limit(size)` | `OFFSET n LIMIT size` |
| Count | `select(func.count()).select_from(...)` | `SELECT COUNT(*)` |
| Bulk update | `update(Model).where(...).values(...)` | `UPDATE SET WHERE` |

---

## Quick Check Answers

**1. `scalars(stmt).one()` — two rows? Zero rows?**

Two rows: raises `MultipleResultsFound`. Zero rows: raises `NoResultFound`.
`one()` strictly enforces exactly one result. Use `one_or_none()` when zero is acceptable.
Use `all()` when any number is expected.

**2. `session.get()` vs `select()` — when is `get` faster?**

`session.get(TaskModel, 99)` checks the session's identity map first — an in-memory dict.
If `TaskModel(id=99)` was loaded earlier in the same session, it returns the cached object
with zero database queries. `select(TaskModel).where(TaskModel.id == 99)` always issues
a SQL query, even if the row was already loaded. Use `session.get()` for primary key
lookups; use `select()` for other conditions.

**3. Mark 500 tasks as `done=True` without loading them — which operation?**

`update(TaskModel).where(...).values(done=True)`. This generates a single
`UPDATE tasks SET done = true WHERE ...` SQL statement. The database engine processes
all 500 rows in one operation. Loading all 500 tasks, modifying them in Python, and
committing would generate 500 individual UPDATE statements — orders of magnitude slower.
