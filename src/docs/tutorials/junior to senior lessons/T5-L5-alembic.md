# Junior to Senior — T5·L5 — Alembic: Database Migrations

**Prerequisites:** T5·L4 (SQLAlchemy Queries). You have a working database layer.
This lesson adds schema version control — the mechanism that safely evolves the
database in production without manually writing SQL.

**What this lab adds:**
- What a migration is and exactly why `create_all` is not enough for production
- `alembic init migrations` — creating the migration infrastructure
- `alembic revision --autogenerate` — generating a migration from model changes
- `alembic upgrade head` — applying all pending migrations
- `alembic downgrade -1` — reversing the most recent migration
- Data migrations: transforming existing data alongside schema changes

**Time:** 45–60 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. Your app uses `Base.metadata.create_all()` to set up the database. You add
>    a new column to `TaskModel`. The production database already has a `tasks`
>    table. What happens when the app restarts?
> 2. Two developers independently add migrations on different branches. They merge.
>    What is the problem?
> 3. You add a `NOT NULL` column to a table with 100,000 existing rows. What must
>    your migration provide for those rows?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

A migration history that documents every schema change with reversible scripts:

```bash
$ alembic upgrade head
INFO [alembic.runtime] Running upgrade  -> a1b2c3d4, create tasks and projects tables
INFO [alembic.runtime] Running upgrade a1b2c3d4 -> e5f6g7h8, add description column to tasks

$ alembic current
e5f6g7h8 (head)

$ alembic downgrade -1
INFO [alembic.runtime] Running downgrade e5f6g7h8 -> a1b2c3d4
```

---

### Concept: Why `create_all` Fails in Production

**What it is:** `Base.metadata.create_all(engine)` creates tables that DO NOT yet
exist in the database. It does NOT modify existing tables.

**The problem — what happens when you add a column:**

```python
# Week 1: TaskModel has title, priority, done
class TaskModel(Base):
    id:       Mapped[int] = mapped_column(primary_key=True)
    title:    Mapped[str]
    priority: Mapped[str] = mapped_column(default='medium')
    done:     Mapped[bool] = mapped_column(default=False)

# Run: Base.metadata.create_all(engine)
# Creates the tasks table with 3 columns. ✓

# Week 2: You add a description column
class TaskModel(Base):
    # ... existing columns ...
    description: Mapped[str | None] = mapped_column(nullable=True)  # NEW

# Run: Base.metadata.create_all(engine) again
# The tasks table ALREADY EXISTS — create_all does nothing.
# The description column is silently NOT added.
# Accessing task.description raises sqlalchemy.exc.OperationalError
```

**The solution — migrations:**

```python
# alembic revision --autogenerate -m "add description column"
# Generates:
def upgrade() -> None:
    op.add_column('tasks', sa.Column('description', sa.Text(), nullable=True))

def downgrade() -> None:
    op.drop_column('tasks', 'description')
```

Running `alembic upgrade head` executes `upgrade()` on the production database.
The column is added correctly. The migration is tracked in the `alembic_version`
table so it is never run twice.

**What it hides:** The state tracking. Alembic maintains a `alembic_version` table
with one row: the current migration ID. It knows exactly which migrations have been
applied and which need to run next.

**The invariant Alembic protects:** Every environment (development, staging, production)
that runs `alembic upgrade head` ends up with the same database schema. Drift between
environments is impossible if everyone runs migrations.

**Canonical example:** Git for your database schema. `git commit` tracks code changes.
`alembic revision` tracks schema changes. `git pull && alembic upgrade head` keeps the
schema in sync, just as `git pull` keeps the code in sync.

**You will see this again in:**
- Every production Python application with a database uses Alembic or an equivalent
- Django: `python manage.py makemigrations && python manage.py migrate`
- Rails: `db:migrate` — same concept, different syntax
- Standard DevOps practice: migrations run as part of deployment pipelines

**Watch for:** Never edit a migration after it has been applied to any database.
If you need to change a schema, create a NEW migration that undoes the old one or
makes the new change. Editing applied migrations corrupts the migration history.

---

## Step 1 — Install Alembic and Initialise

```bash
pip install alembic
alembic init migrations
```

**You should see:**

```
Creating directory /path/to/task-api/migrations ...  done
Creating directory /path/to/task-api/migrations/versions ...  done
Generating /path/to/task-api/migrations/env.py ...  done
Generating /path/to/task-api/migrations/script.py.mako ...  done
Generating /path/to/task-api/alembic.ini ...  done
```

Open `alembic.ini` and update the database URL:

```ini
sqlalchemy.url = sqlite+aiosqlite:///./tasks.db
```

### SAVE AND TRY

```bash
alembic current
```

**You should see:** `INFO [alembic.runtime] No revision detected` — no migrations applied yet.

---

## Step 2 — Configure `migrations/env.py` for Async

The generated `env.py` is synchronous. Replace its content with an async-compatible version:

```python
# migrations/env.py
import asyncio
import sys
from pathlib import Path
from logging.config import fileConfig
from sqlalchemy.ext.asyncio import create_async_engine
from alembic import context

# Make src/ importable:
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

config = context.config
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Import Base so Alembic discovers all mapped classes:
from src.infrastructure.models import Base          # noqa: E402 — must be after sys.path
from src.infrastructure.database import Base         # noqa: F811 (same Base)
target_metadata = Base.metadata


def run_migrations_offline() -> None:
    url = config.get_main_option('sqlalchemy.url')
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
    )
    with context.begin_transaction():
        context.run_migrations()


def do_run_migrations(connection) -> None:
    context.configure(connection=connection, target_metadata=target_metadata)
    with context.begin_transaction():
        context.run_migrations()


async def run_migrations_online() -> None:
    from src.config import config as app_config
    engine = create_async_engine(app_config.database_url)
    async with engine.connect() as conn:
        await conn.run_sync(do_run_migrations)
    await engine.dispose()


if context.is_offline_mode():
    run_migrations_offline()
else:
    asyncio.run(run_migrations_online())
```

### SAVE AND TRY

```bash
alembic check
```

Expected: Alembic reads the models and checks if any migrations are missing.
This should report "New upgrade operations detected" because no migration file exists yet.

---

## Step 3 — Generate the First Migration

```bash
alembic revision --autogenerate -m "initial schema: projects and tasks tables"
```

**You should see:**

```
INFO [alembic.autogenerate.compare] Detected added table 'projects'
INFO [alembic.autogenerate.compare] Detected added table 'tasks'
Generating .../migrations/versions/xxxx_initial_schema.py ...  done
```

Open the generated file. It should contain `upgrade()` and `downgrade()` functions.

Inspect the file:

```bash
cat migrations/versions/xxxx_initial_schema.py
```

**You should see** SQL operations like `op.create_table('projects', ...)` and
`op.create_table('tasks', ...)`.

Apply the migration:

```bash
alembic upgrade head
```

**You should see:**

```
INFO [alembic.runtime] Running upgrade  -> xxxx, initial schema: projects and tasks tables
```

```bash
alembic current
```

**Expected:** Shows the migration hash as `(head)`.

---

### Concept: Adding a Column With a Migration

**What it is:** Each migration is a Python file with `upgrade()` (apply the change)
and `downgrade()` (reverse it). They use the `op` object to issue schema operations.

**The safe two-step for adding a NOT NULL column:**

```python
def upgrade() -> None:
    # Step 1 — add as nullable:
    op.add_column('tasks', sa.Column('priority_level', sa.Integer(), nullable=True))

    # Step 2 — backfill existing rows:
    op.execute("""
        UPDATE tasks SET priority_level = CASE priority
            WHEN 'high'   THEN 3
            WHEN 'medium' THEN 2
            ELSE 1
        END
    """)

    # Step 3 — make it NOT NULL now that all rows have a value:
    op.alter_column('tasks', 'priority_level', nullable=False)

def downgrade() -> None:
    op.drop_column('tasks', 'priority_level')
```

**Why two steps for NOT NULL?** Adding a NOT NULL column directly to a table with
existing rows fails — the existing rows have NULL for the new column, violating the
constraint. You must: add nullable, populate, then tighten to NOT NULL.

---

## Step 4 — Add the `description` Column Via Migration

Add `description: Mapped[str | None]` to `TaskModel` in `src/infrastructure/models.py`:

```python
class TaskModel(Base):
    # ... existing columns ...
    description: Mapped[str | None] = mapped_column(Text, nullable=True)   # ← add this
```

Generate the migration:

```bash
alembic revision --autogenerate -m "add description column to tasks"
```

**You should see:** `Detected added column 'tasks.description'`

Review the generated file:

```bash
# The upgrade should contain:
def upgrade() -> None:
    op.add_column('tasks', sa.Column('description', sa.Text(), nullable=True))

# The downgrade should contain:
def downgrade() -> None:
    op.drop_column('tasks', 'description')
```

### SAVE AND TRY

Apply the migration:

```bash
alembic upgrade head
```

**You should see:** `Running upgrade xxxx -> yyyy, add description column to tasks`

Test the downgrade:

```bash
alembic downgrade -1
alembic current
```

**Expected:** Current is the PREVIOUS migration (one step back). The description
column was removed.

```bash
alembic upgrade head
```

**Expected:** Re-applied. Current is `(head)` again.

```bash
alembic history
```

**You should see:** Two migrations listed, newest first.

---

## Step 5 — Write Tests for Migration Safety

Create `tests/test_migrations.py`:

```python
# tests/test_migrations.py
import pytest
import pytest_asyncio
from sqlalchemy.ext.asyncio import create_async_engine, text
from src.infrastructure.database import Base, init_db


@pytest.mark.asyncio
async def test_init_db_creates_all_tables() -> None:
    """Verify all expected tables are created by init_db."""
    engine = create_async_engine('sqlite+aiosqlite:///:memory:')
    await init_db()   # creates tables from Base.metadata
    # This uses create_all — fine for development/testing
    async with engine.connect() as conn:
        # Check that both tables exist:
        result = await conn.execute(
            text("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
        )
        tables = {row[0] for row in result}
    await engine.dispose()

    # The tables defined in models.py must all be present:
    expected = {'projects', 'tasks'}
    assert expected.issubset(tables)
```

### SAVE AND TRY

```bash
pytest tests/test_migrations.py -v
```

Expected: `1 passed`

---

## 🎯 Challenge: Write a Data Migration

**You know:** Alembic `upgrade`/`downgrade`, `op.add_column`, `op.execute`.

**Task:** Write a migration manually (without autogenerate) that:
1. Adds a `completed_at: DateTime | None` column to `TaskModel`
2. In `upgrade()`, backfills `completed_at = created_at` for all rows where `done = True`
3. In `downgrade()`, drops the column

Paste the full migration file path template and fill it in.

---

<details>
<summary>▶ Show Solution</summary>

Create `migrations/versions/manual_001_add_completed_at.py`:

```python
"""add completed_at column to tasks

Revision ID: manual_001
Revises: <replace-with-previous-revision-id>
Create Date: 2024-01-01

"""
from alembic import op
import sqlalchemy as sa

revision    = 'manual_001'
down_revision = '<replace-with-previous-revision-id>'
branch_labels = None
depends_on    = None


def upgrade() -> None:
    # Step 1: add as nullable — existing rows get NULL:
    op.add_column(
        'tasks',
        sa.Column('completed_at', sa.DateTime(), nullable=True)
    )

    # Step 2: backfill done tasks with their creation time:
    op.execute("""
        UPDATE tasks
        SET completed_at = created_at
        WHERE done = 1
    """)
    # Note: SQLite uses 1/0 for true/false


def downgrade() -> None:
    op.drop_column('tasks', 'completed_at')
```

**Key insight:** The two-step pattern (add nullable + backfill) is required for any
`NOT NULL` column. Here the column is nullable, so step 3 (tighten to NOT NULL) is
optional. Backfilling with `created_at` is an approximation — we don't have the real
completion time for historical rows. In a real system, you'd capture `completed_at`
when a task is marked done.

</details>

---

## Final Check

| Command | What it does |
|---|---|
| `alembic init migrations` | Creates migration infrastructure |
| `alembic revision --autogenerate -m "msg"` | Generates migration from model diff |
| `alembic upgrade head` | Applies all pending migrations |
| `alembic downgrade -1` | Reverses the last migration |
| `alembic current` | Shows current version |
| `alembic history` | Lists all migrations |

---

## Quick Check Answers

**1. `create_all()` on an existing DB when a new column is added. What happens?**

Nothing — the column is NOT added. `create_all()` only creates tables that do not exist.
It will not ALTER an existing table. The new `description` column exists in `TaskModel`
but is absent from the database. Any access to `task.description` raises
`OperationalError: no such column: tasks.description`.

**2. Two developers add migrations on different branches. They merge. The problem?**

A "multiple heads" situation. Both migrations have the same `down_revision` (the last
migration before the branches diverged). Alembic calls this a "branch" — it has two
migrations that both claim to be the next step. `alembic upgrade head` fails with
an error. Resolution: `alembic merge heads -m "merge branches"` — creates a new
migration that has both as its `down_revision`. This marks the merge point.

**3. Adding a NOT NULL column to a table with 100,000 rows — what must the migration provide?**

A default value or backfill for the existing rows. If you add a NOT NULL column
directly, the database rejects it — the existing 100,000 rows have NULL for the new
column, violating the constraint. The safe approach: (1) add the column as nullable,
(2) run an UPDATE to populate all rows, (3) alter the column to NOT NULL.
