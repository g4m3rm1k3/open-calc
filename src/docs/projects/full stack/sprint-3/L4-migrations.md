# Sprint 3 · Lesson 4 — Migrations: change the schema safely

## What you will build

By the end of this lesson, Alembic is set up and you have added a `priority` column to `work_orders` using a migration — without losing any existing data. You will understand what a migration is, why `Base.metadata.create_all` is not a migration, and how to upgrade and downgrade the schema safely.

---

## What you need to know first

- Sprint 3 L3: SQLAlchemy is set up, the `work_orders` table exists, data is in the database.
- Sprint 3 L2: `ALTER TABLE` in SQL.

---

## The lesson

---

### 1. Why migrations exist

**The problem:** Your `work_orders` table exists in the database with real data. You need to add a new column: `description TEXT`. You cannot drop and recreate the table — that deletes all the data. You cannot run `Base.metadata.create_all` — it skips tables that already exist and ignores schema changes.

The correct solution is an **ALTER TABLE** statement:

```sql
ALTER TABLE work_orders ADD COLUMN description TEXT;
```

This adds the column without touching existing rows. Existing rows get `NULL` for the new column.

The problem with running this manually: how do you track which changes have been applied to which environments? Your development database has the column. Your production database does not — yet. Your colleague's machine does not. You need a system that:

1. Records every schema change as a versioned file
2. Knows which versions have been applied to each database
3. Can apply the next version (`upgrade`) or revert the previous one (`downgrade`)

This is a **database migration system**. Alembic is the standard migration tool for SQLAlchemy projects.

---

### 2. Install and configure Alembic

From `backend/` with the virtual environment active:

```
pip install alembic
pip freeze > requirements.txt
```

Initialise Alembic:

```
alembic init alembic
```

**Walkthrough:** `alembic init alembic` creates:
- `alembic/` — directory containing the migration files and supporting scripts
- `alembic/versions/` — the empty directory where migration files will be created
- `alembic/env.py` — the configuration script Alembic runs when applying migrations
- `alembic.ini` — Alembic's main configuration file

**Configure `alembic.ini`:** Open `alembic.ini` and find the line:

```
sqlalchemy.url = driver://user:pass@localhost/dbname
```

Replace it with:

```
sqlalchemy.url = postgresql://devuser:devpassword@localhost:5432/workorders
```

This tells Alembic how to connect to the database.

**Configure `alembic/env.py`:** Open `alembic/env.py`. Find the line:

```python
target_metadata = None
```

Replace it with:

```python
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from database import Base
from orm_models import WorkOrderModel  # noqa: F401

target_metadata = Base.metadata
```

**Walkthrough of the `env.py` changes:**

`sys.path.insert(0, ...)` — adds the `backend/` directory to Python's module search path. Without this, `from database import Base` would fail because `env.py` is in `backend/alembic/`, not `backend/`, and Python cannot find `database.py`. `sys.path` is the list of directories Python searches when importing a module. Prepending `backend/` ensures imports from `backend/` work.

`from database import Base` — imports the SQLAlchemy `Base` containing all model metadata.

`from orm_models import WorkOrderModel` — forces `WorkOrderModel` to register with `Base.metadata`. The same pattern as `init_db.py`.

`target_metadata = Base.metadata` — tells Alembic's autogenerate feature to compare the current database schema against `Base.metadata` (your ORM models) to detect differences. When you run `alembic revision --autogenerate`, Alembic connects to the database, inspects its schema, compares it to `Base.metadata`, and writes a migration that describes the difference.

**CS lens — migrations as a version control system for schemas.** Alembic stores migrations as Python files in `alembic/versions/`. Each file has a unique revision ID (a hex string), an `upgrade()` function (the forward migration), and a `downgrade()` function (the reverse). Alembic stores which revision has been applied in a `alembic_version` table it creates in your database. When you run `alembic upgrade head`, it reads the `alembic_version` table, finds which revisions have not been applied, and runs them in order. The migration history is a linked list of revision files.

**SE lens — migrations as the deployment contract.** The migration files are committed to git alongside application code. When a new feature adds a column, the migration that adds that column is committed in the same pull request as the code that uses it. During deployment, the migration runs first, then the new application code is deployed. This sequence ensures the database is ready for the code. Running code that references a column that does not exist yet causes runtime errors — the migration prevents this.

---

### 3. Create the initial migration

**The problem:** Alembic does not know the current state of the database. The first migration captures the existing schema.

Because you already created the table with `init_db.py`, the database is ahead of Alembic. You have two options:

**Option A — stamp the current schema as the baseline (recommended for existing databases):**

```
alembic revision --autogenerate -m "initial schema"
```

Then inspect the generated file in `alembic/versions/`. It should contain `CREATE TABLE work_orders ...` in `upgrade()` and `DROP TABLE work_orders` in `downgrade()`.

Because the table already exists, do not run `alembic upgrade head` yet — instead, tell Alembic "the database is already at this revision":

```
alembic stamp head
```

**Walkthrough of `alembic stamp head`:** `stamp` updates the `alembic_version` table in the database to record the given revision as applied, without actually running the migration. `head` is an alias for the most recent revision. After stamping, Alembic considers the database up to date.

**Option B — drop and recreate (only for development databases with no important data):**

Drop the existing table (`DROP TABLE work_orders CASCADE` in TablePlus), then run `alembic upgrade head` to create it fresh from the migration.

For this curriculum, use Option A — it is the pattern used for existing production databases.

---

### 4. Add the `description` column via migration

**The problem:** Add a `description TEXT` column to `work_orders`. The column is optional (can be NULL) so existing rows remain valid.

First, update the SQLAlchemy ORM model in `backend/orm_models.py`:

```python
from sqlalchemy import Column, Integer, String, DateTime, Text, func
from database import Base

class WorkOrderModel(Base):
    __tablename__ = "work_orders"

    id          = Column(Integer, primary_key=True, index=True)
    title       = Column(String, nullable=False)
    status      = Column(String, nullable=False, default="open")
    priority    = Column(String, nullable=False)
    assigned_to = Column(String, nullable=True)
    description = Column(Text, nullable=True)  # new field
    created_at  = Column(DateTime(timezone=True), server_default=func.now())
```

Also update `backend/models.py` (Pydantic model):

```python
from pydantic import BaseModel
from typing import Optional

class WorkOrderCreate(BaseModel):
    title: str
    status: str
    priority: str
    assigned_to: Optional[str] = None
    description: Optional[str] = None  # new field

class WorkOrder(WorkOrderCreate):
    id: int
```

Now generate the migration:

```
alembic revision --autogenerate -m "add description column to work_orders"
```

Expected output:
```
INFO  [alembic.runtime.migration] Context impl PostgresqlImpl.
INFO  [alembic.runtime.migration] Will assume transactional DDL.
INFO  [alembic.autogenerate.compare] Detected added column 'work_orders.description'
  Generating /Users/yourname/fullstack-project/backend/alembic/versions/abc123_add_description_column_to_work_orders.py ...  done
```

Open the generated file. It should look like:

```python
"""add description column to work_orders

Revision ID: abc123
Revises: def456
Create Date: 2024-01-01 12:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = 'abc123'
down_revision: Union[str, None] = 'def456'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    op.add_column('work_orders', sa.Column('description', sa.Text(), nullable=True))

def downgrade() -> None:
    op.drop_column('work_orders', 'description')
```

**Walkthrough of the migration file:**

`revision: str = 'abc123'` — the unique ID for this migration. Alembic generates a random hex string.

`down_revision: str = 'def456'` — the revision this one follows. This forms the linked list of migrations.

`def upgrade() -> None:` — what to do when applying this migration. `op.add_column` generates `ALTER TABLE work_orders ADD COLUMN description TEXT`.

`def downgrade() -> None:` — what to do when reverting. `op.drop_column` generates `ALTER TABLE work_orders DROP COLUMN description`.

Apply the migration:

```
alembic upgrade head
```

Expected output:
```
INFO  [alembic.runtime.migration] Running upgrade def456 -> abc123, add description column to work_orders
```

Verify in TablePlus: refresh the `work_orders` table. The `description` column now appears. Existing rows have `NULL` for `description`. No data was lost.

**CS lens — the migration as a delta, not a snapshot.** Unlike `Base.metadata.create_all` (which generates the full current schema), a migration is a **delta** — the difference between two states. `upgrade()` is the forward delta; `downgrade()` is the reverse. Applying a series of deltas in sequence takes the database from any historical state to the current state. This is the same model used by version control: a git commit is a delta (the diff), not a snapshot of the entire codebase.

**SE lens — `downgrade` as a safety valve.** The `downgrade()` function is the rollback mechanism. If a deployment fails, you run `alembic downgrade -1` (go back one revision) to revert the schema change. This requires that `downgrade()` is implemented correctly — dropping the column you just added, undoing the constraint you just added. Some changes are hard to reverse (e.g., a `NOT NULL` constraint on a column that has existing NULLs cannot simply be reversed without updating the data). Always implement `downgrade()` and test it during development.

**Real-world connection:** Every production database migration system — Django's migrations, Rails' ActiveRecord migrations, Flyway (Java), Liquibase — follows the same model: versioned files, an `upgrade`/`downgrade` pair, a version table in the database. The concepts are universal; only the syntax differs.

---

### 5. Run migrations in the correct order

**The problem:** You need to understand the Alembic commands you will use repeatedly.

```
# Show current revision
alembic current

# Show all revisions and which are applied
alembic history

# Apply all pending migrations
alembic upgrade head

# Apply the next migration only
alembic upgrade +1

# Revert the most recent migration
alembic downgrade -1

# Revert to the beginning (dangerous — use only in development)
alembic downgrade base
```

**Walkthrough:**

`alembic current` — queries the `alembic_version` table and prints the current revision ID. The revision shown should be your most recent migration after `alembic upgrade head`.

`alembic history` — prints all revisions in the migration chain, oldest first. Revisions already applied are shown with `(head)` or their applied status.

`alembic upgrade head` — applies every unapplied migration in sequence until the latest (`head`). This is the command you run after every schema change and in CI/CD deployment pipelines.

`alembic downgrade -1` — reverts one migration. The `-1` means "go back one step."

`alembic downgrade base` — reverts every migration. `base` is the revision before the first migration — an empty schema. Only run this in development when you want to rebuild from scratch.

**SE lens — `alembic upgrade head` as the deployment command.** In Sprint 8, your deployment script will run `alembic upgrade head` before starting the new version of the application. This ensures: the database schema is updated before the new application code that depends on it starts serving requests. Running migrations in deployment is not optional — it is the sequence that prevents "column does not exist" errors in production.

---

## Connect the pieces

Alembic manages schema changes. SQLAlchemy manages query execution. Postgres stores the data. The three tools together form the database layer of your stack:

- Alembic creates and modifies tables (schema changes over time)
- SQLAlchemy generates and executes queries (data operations at runtime)
- Postgres persists and indexes the data

Every future schema change — adding a column, creating a new table, adding an index — follows the same pattern: update the ORM model, update the Pydantic model, generate a migration, apply it. The migration file is committed to git alongside the code that uses the new schema.

---

## What breaks without this

**Forgetting to commit the migration file:** The migration exists on your machine but not in git. When a colleague pulls the code and runs `alembic upgrade head`, their database is missing the migration. They get "column does not exist" errors. Always commit migration files.

**Changing a migration after it has been applied:** If you edit a migration file that has already been applied to the database, Alembic's hash no longer matches and it may refuse to run. Never edit applied migrations — create a new migration instead.

---

## Definition of done

- [ ] `alembic current` shows the most recent revision
- [ ] `alembic history` shows both migrations (initial and description column)
- [ ] The `description` column appears in TablePlus in the `work_orders` table
- [ ] Existing rows have `NULL` for `description` (no data was lost)
- [ ] `alembic downgrade -1` removes the `description` column, then `alembic upgrade head` adds it back
- [ ] You can explain the difference between `alembic upgrade head` and `Base.metadata.create_all`
- [ ] You can explain what `down_revision` is in a migration file

**Git commit:**

```
git add backend/alembic/ backend/alembic.ini backend/orm_models.py backend/models.py
git commit -m "Add Alembic migrations: initial schema baseline and description column migration"
```

This commit marks the end of Sprint 3. Your data persists in Postgres, your schema changes are versioned, and your API is unchanged from the outside. The foundation for authentication (Sprint 4) and testing (Sprint 5) is now in place.
