# Python Tool Database — LAB 49 — Alembic Migrations

**Prerequisites:** Lab 48. You have SQLAlchemy models and can query them. The `tools_orm_demo.db` was recreated from scratch every time you needed a schema change. That worked for learning — it won't work in production. This lesson teaches Alembic: the tool that evolves a live schema one versioned step at a time, without losing data.

**What this lab adds:**
- Why `create_all()` is not enough — it creates but never alters
- `alembic init` — the scaffold Alembic writes for you
- `alembic revision --autogenerate` — detecting what changed
- `alembic upgrade head` — applying migrations forward
- `alembic downgrade -1` — stepping back
- Reviewing generated migrations before running them

**Time:** 60–75 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. You call `Base.metadata.create_all(engine)`. The `tools_orm` table already exists but is missing a new `coating` column you added to `ToolORM`. What happens to the missing column?
> 2. You have 10 migration files. An Alembic migration file has `down_revision = "a1b2c3d4"`. What does that value mean?
> 3. You run `alembic upgrade head` on an empty database. Then you run it again. What happens the second time?
>
> *(Answers at the end)*

---

## Why `create_all()` Is Not Enough

`Base.metadata.create_all(engine)` creates tables that don't exist yet. It does nothing to tables that already exist.

```
Day 1: You create tools_orm with 7 columns. create_all() runs. Table created.
Day 5: You add coating: Mapped[str | None]. create_all() runs. Nothing happens.
       The table already exists. The new column is silently ignored.
       Your code breaks at runtime when it tries to read coating.
```

You need a tool that can *alter* an existing table — adding columns, removing them, changing types, adding indexes. That tool is Alembic.

Alembic works by storing the current schema version in a table called `alembic_version`. Each migration is a Python file with `upgrade()` and `downgrade()` functions. Running `alembic upgrade head` applies every migration that hasn't been applied yet, in order.

---

## Step 1 — Install and Initialize

```
pip install alembic
```

From the project root (where `tooldb/` lives):

```
alembic init alembic
```

This creates:
```
alembic/
    env.py          ← configuration — you will edit this
    script.py.mako  ← template for new migration files
    versions/       ← where migration files live
alembic.ini         ← the main config file
```

Open `alembic.ini`. Find the line:
```
sqlalchemy.url = driver://user:pass@localhost/dbname
```

Change it to point at your demo database:
```
sqlalchemy.url = sqlite:///tools_orm_demo.db
```

---

## Step 2 — Connect Alembic to Your Models

`alembic/env.py` needs to import your `Base` so it can compare the models to the live schema. Open it and find:

```python
target_metadata = None
```

Replace it with:

```python
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from tooldb.orm.models import Base
target_metadata = Base.metadata
```

This tells Alembic: "when comparing models to the database, use the metadata from our SQLAlchemy models."

Without this, `--autogenerate` has no models to compare against and cannot detect changes.

---

## Step 3 — Create the Initial Migration

You have a fresh `tools_orm_demo.db` with tables created by `create_all()`. Now you want Alembic to take over. First, generate the initial migration that represents the current state:

```
alembic revision --autogenerate -m "initial schema"
```

Alembic compares `Base.metadata` (what your models declare) to the live database (what actually exists). It generates a migration file in `alembic/versions/`. Open it — it looks like:

```python
"""initial schema

Revision ID: 3a1f2e9c
Revises:
Create Date: 2024-01-15 10:30:00

"""
from alembic import op
import sqlalchemy as sa

revision = '3a1f2e9c'
down_revision = None        # None = this is the first migration
branch_labels = None
depends_on = None


def upgrade() -> None:
    # op.create_table('tools_orm', ...)
    # op.create_table('holders_orm', ...)
    pass


def downgrade() -> None:
    # op.drop_table(...)
    pass
```

**Read the generated migration before running it.** This is a habit. Autogenerate is good but not perfect — it can miss things, or generate operations you do not want.

**Stamp the database** at this revision without running the migration (since the tables already exist from `create_all()`):

```
alembic stamp head
```

Now `alembic_version` table has an entry saying "we are at revision `3a1f2e9c`." Alembic will not try to re-create the tables that already exist.

---

## Step 4 — Make a Schema Change

Add a new column to `ToolORM` in `tooldb/orm/models.py`:

```python
class ToolORM(Base):
    # ... existing columns ...
    coating: Mapped[str | None] = mapped_column(String(100), nullable=True)
```

Generate a migration:

```
alembic revision --autogenerate -m "add coating column"
```

Look at the generated file:

```python
def upgrade() -> None:
    op.add_column('tools_orm', sa.Column('coating', sa.String(length=100), nullable=True))


def downgrade() -> None:
    op.drop_column('tools_orm', 'coating')
```

Alembic detected the new column. It generated `ADD COLUMN` for upgrade and `DROP COLUMN` for downgrade. **Review it.** Does it look right? Yes.

Apply it:

```
alembic upgrade head
```

Output:
```
INFO  [alembic.runtime.migration] Running upgrade 3a1f2e9c -> 8b4d2f1a, add coating column
```

The database now has the `coating` column. Your ORM code can use it. No data was lost.

---

## Step 5 — The Migration Chain

Every migration file has `revision` and `down_revision`. Together they form a linked list:

```
None → 3a1f2e9c → 8b4d2f1a → (next migration)
       "initial"   "coating"
```

`down_revision = None` means "this is the first migration — nothing came before."
`down_revision = "3a1f2e9c"` means "this migration builds on the initial one."

To see where you are:

```
alembic current
```

Output:
```
8b4d2f1a (head)
```

To see the full history:

```
alembic history
```

Output:
```
8b4d2f1a -> (head), add coating column
3a1f2e9c -> 8b4d2f1a, initial schema
<base> -> 3a1f2e9c, initial schema
```

---

## Step 6 — Downgrade

To step back one migration:

```
alembic downgrade -1
```

This runs `downgrade()` in the most recent migration — `DROP COLUMN coating`. Your table is back to its pre-coating state. The `alembic_version` row is updated to `3a1f2e9c`.

To downgrade all the way to nothing:

```
alembic downgrade base
```

This runs every `downgrade()` in reverse order, eventually removing all tables. Useful in tests.

To re-apply everything from scratch:

```
alembic upgrade head
```

The whole cycle — `downgrade base` → `upgrade head` — is what test suites use to get a clean database with the full current schema.

---

## Step 7 — What Autogenerate Detects (and What It Misses)

Autogenerate compares your `Base.metadata` to the live database and detects:

| Detects | Does NOT detect |
|---|---|
| New tables | Table renames |
| Dropped tables | Column renames |
| New columns | Changes to CHECK constraints |
| Dropped columns | Changes to indexes on some databases |
| Column type changes | Stored procedures, triggers |

**Column renames are invisible to autogenerate.** It sees "old column is gone" and "new column appeared" and generates `DROP COLUMN` + `ADD COLUMN`. All data in the renamed column is lost. For renames, you must write the migration by hand:

```python
def upgrade() -> None:
    op.alter_column('tools_orm', 'flute_count', new_column_name='flutes')

def downgrade() -> None:
    op.alter_column('tools_orm', 'flutes', new_column_name='flute_count')
```

This is why reviewing generated migrations before running them is mandatory — not optional.

---

## Step 8 — Manual Migrations

Not every migration is a schema change. Sometimes you need to migrate data. You can write any SQL in a migration:

```python
from alembic import op
import sqlalchemy as sa

def upgrade() -> None:
    # Schema change: add a column
    op.add_column('tools_orm', sa.Column('is_active', sa.Boolean(), nullable=True))

    # Data migration: backfill existing rows
    op.execute("UPDATE tools_orm SET is_active = 1 WHERE is_active IS NULL")

    # Now make it non-nullable
    op.alter_column('tools_orm', 'is_active', nullable=False)


def downgrade() -> None:
    op.drop_column('tools_orm', 'is_active')
```

This is a three-step migration inside one file: add the column (nullable), backfill data, then tighten the constraint. SQLite limits `ALTER TABLE` severely (no `ALTER COLUMN`, no `DROP COLUMN` before version 3.35) — for complex SQLite changes you sometimes need to recreate the table.

---

## Step 9 — SAVE AND TRY

**Add and apply a real migration.** Add a `last_used` column (`Mapped[str | None]` to store a date string) to `ToolORM`. Generate the migration, read it, apply it. Verify with:

```python
import sqlite3
conn = sqlite3.connect("tools_orm_demo.db")
info = conn.execute("PRAGMA table_info(tools_orm)").fetchall()
for row in info:
    print(row)
```

You should see `last_used` in the output.

**Then downgrade and re-upgrade.** Confirm the column disappears and reappears.

---

## Concept: This Project Has Two Migration Systems

You have been using hand-written `.sql` files in `migrations/` since Lesson 19. The raw SQL layer (Lessons 10–22) uses those files. The SQLAlchemy ORM layer (Lessons 44–48) uses Alembic.

They coexist in this project for comparison purposes. In a real project you would choose one and use it throughout. If you commit to SQLAlchemy for the production data layer, Alembic is the natural migration system — it keeps the schema in sync with the models automatically.

The raw SQL migration system you built is simpler: it is just a list of SQL files applied in order, no autogenerate, no downgrade. That simplicity is a feature for small projects where you do not need rollback.

---

## Challenge

Add an `AssemblyORM` model (from the Lesson 46 challenge):

```python
class AssemblyORM(Base):
    __tablename__ = "assemblies_orm"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    stickout_inches: Mapped[float] = mapped_column(Float, nullable=False)
    tool_id: Mapped[int] = mapped_column(Integer, ForeignKey("tools_orm.id"), nullable=False)
    holder_id: Mapped[int] = mapped_column(Integer, ForeignKey("holders_orm.id"), nullable=False)
    tool: Mapped["ToolORM"] = relationship("ToolORM")
    holder: Mapped["HolderORM"] = relationship("HolderORM")
```

Generate and apply the migration. Then write a query that fetches all assemblies with their tools and holders in one query using `joinedload`. Verify with `echo=True`.

<details>
<summary>Answer</summary>

After adding the model:
```
alembic revision --autogenerate -m "add assemblies table"
alembic upgrade head
```

The generated migration will include `op.create_table('assemblies_orm', ...)` with foreign key columns.

Query:
```python
from sqlalchemy.orm import joinedload

assemblies = session.scalars(
    select(AssemblyORM)
    .options(joinedload(AssemblyORM.tool), joinedload(AssemblyORM.holder))
).all()

for a in assemblies:
    print(f"{a.name}: {a.tool.name} in {a.holder.name}, stickout={a.stickout_inches}")
```

With `echo=True`, one SELECT with two LEFT OUTER JOINs — same as the manual JOIN from Lesson 15, generated automatically.

</details>

---

## Final Check

| | |
|--|--|
| `create_all()` creates missing tables; does not alter existing ones | ✓ |
| Each migration file has `revision` and `down_revision` forming a chain | ✓ |
| `alembic revision --autogenerate` compares `Base.metadata` to the live database | ✓ |
| Always read the generated migration before running it | ✓ |
| Column renames are NOT detected — write those by hand | ✓ |
| `alembic downgrade base` → `alembic upgrade head` = clean rebuild | ✓ |

---

## Quick Check Answers

1. **`create_all()` does nothing to the existing table.** It uses `CREATE TABLE IF NOT EXISTS` semantics — if the table exists, it is left unchanged. The new `coating` column simply does not appear in the database. At runtime, SQLAlchemy tries to INSERT a value for `coating` and fails, or tries to read `coating` and gets an `OperationalError: no such column`. The model and schema are out of sync. This is the exact problem Alembic solves.

2. **`down_revision` is the revision ID of the previous migration — the one this migration builds on.** It defines the chain: "before applying this migration, the database must be at revision `a1b2c3d4`." Alembic walks the chain to determine which migrations to apply and in what order. `down_revision = None` means "this is the first migration in the chain."

3. **The second run does nothing.** Alembic checks the `alembic_version` table. It is already at `head`. There are no unapplied migrations. `alembic upgrade head` is idempotent — safe to run repeatedly. This is the behavior you want in deployment scripts: run it on every deploy, and it applies only what is new.
