# Python Tool Database — LAB 44 — Declaring SQLAlchemy Models

**Prerequisites:** Lab 43. You understand what an ORM is. Now you write your first SQLAlchemy model and watch it generate SQL you already know how to read.

**What this lab adds:**
- `DeclarativeBase` — the foundation every model inherits from
- `Mapped[T]` and `mapped_column` — the 2.0-style field declarations
- `create_all()` — watching SQLAlchemy write the CREATE TABLE
- `echo=True` — the single best learning tool in SQLAlchemy
- Comparing the generated SQL to the hand-written version from Lesson 11

**Time:** 40–50 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. `Mapped[str]` vs `Mapped[str | None]` — what is the SQL difference between these two field annotations?
> 2. You call `Base.metadata.create_all(engine)`. The table already exists. What happens?
> 3. `mapped_column(unique=True)` — what SQL constraint does this add to the column?
>
> *(Answers at the end)*

---

## Step 1 — The Engine

Before a model, you need an engine — SQLAlchemy's connection to the database:

```python
from sqlalchemy import create_engine

engine = create_engine("sqlite:///tools.db", echo=True)
```

`echo=True` prints every SQL statement to stdout. Turn it on now and leave it on throughout this block — you will learn SQLAlchemy by reading what it generates.

The connection string format is `dialect+driver://path`. For SQLite:
- `sqlite:///tools.db` — a relative path file
- `sqlite:////absolute/path/tools.db` — absolute path (four slashes)
- `sqlite:///:memory:` — in-memory (tests)

---

## Step 2 — DeclarativeBase and a Model

Create `tooldb/orm/__init__.py` (empty) and `tooldb/orm/models.py`:

```python
from sqlalchemy import String, Float, Integer, Text
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    pass


class ToolORM(Base):
    __tablename__ = "tools_orm"   # new table, not the existing tools table

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    diameter_inches: Mapped[float] = mapped_column(Float, nullable=False)
    material: Mapped[str] = mapped_column(String(50), nullable=False)
    tool_type: Mapped[str] = mapped_column(String(50), nullable=False)
    flutes: Mapped[int | None] = mapped_column(Integer, nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    def __repr__(self) -> str:
        return f"ToolORM(id={self.id}, name={self.name!r}, type={self.tool_type!r})"
```

Notice: `Mapped[int | None]` maps to a nullable column. `Mapped[str]` (no `| None`) maps to `NOT NULL`. The Python type annotation IS the nullable/not-null declaration — no separate `nullable=False` needed for non-nullable fields (it is redundant but harmless).

---

## Step 3 — Watch `create_all()`

Create `tooldb/orm/setup.py`:

```python
from sqlalchemy import create_engine
from tooldb.orm.models import Base

engine = create_engine("sqlite:///tools_orm_demo.db", echo=True)
Base.metadata.create_all(engine)
print("Done.")
```

Run it:

```
python -m tooldb.orm.setup
```

The output will include something like:

```sql
CREATE TABLE tools_orm (
    id INTEGER NOT NULL,
    name VARCHAR(255) NOT NULL,
    diameter_inches FLOAT NOT NULL,
    material VARCHAR(50) NOT NULL,
    tool_type VARCHAR(50) NOT NULL,
    flutes INTEGER,
    notes TEXT,
    PRIMARY KEY (id),
    UNIQUE (name)
)
```

Compare this to your hand-written `TOOLS_TABLE_SQL` from Lesson 11. They declare the same structure. The ORM generated it from the class definition.

Run the script again. SQLAlchemy detects the table already exists and skips it — `create_all` is safe to call multiple times.

---

## Step 4 — Type Annotations ARE the Schema

This is the key idea of SQLAlchemy 2.0's declarative style. The Python type annotation and the SQL column type are the same declaration:

```python
name: Mapped[str]                    → VARCHAR NOT NULL
diameter_inches: Mapped[float]       → FLOAT NOT NULL
flutes: Mapped[int | None]           → INTEGER (nullable)
notes: Mapped[str | None]            → TEXT (nullable)
```

The `Mapped[T]` wrapper is what tells SQLAlchemy "this attribute is a database column." Without it, the attribute is just a regular Python class attribute.

You can add `mapped_column(...)` to customize:

```python
name: Mapped[str] = mapped_column(String(255), unique=True)
```

`String(255)` sets the max length (SQLite ignores it but other databases enforce it). `unique=True` adds a UNIQUE constraint. Without `mapped_column(...)`, SQLAlchemy uses defaults.

---

## Step 5 — A Model for Holders

Add to `tooldb/orm/models.py`:

```python
class HolderORM(Base):
    __tablename__ = "holders_orm"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    taper: Mapped[str] = mapped_column(String(50), nullable=False)
    collet_size_inches: Mapped[float] = mapped_column(Float, nullable=False)

    def __repr__(self) -> str:
        return f"HolderORM(id={self.id}, name={self.name!r})"
```

Rerun setup:

```
python -m tooldb.orm.setup
```

SQLAlchemy creates `holders_orm` but skips `tools_orm` (already exists). You should see only the `CREATE TABLE holders_orm` statement printed.

---

## Step 6 — SAVE AND TRY

**Read the generated SQL** carefully. Every line of the CREATE TABLE statement corresponds to something in your model. Find:
- The `PRIMARY KEY (id)` — comes from `primary_key=True`
- `UNIQUE (name)` — comes from `unique=True`
- `INTEGER` for `id` and `flutes` — maps from `Mapped[int]`
- `FLOAT` for `diameter_inches` — maps from `Mapped[float]`
- `VARCHAR(50) NOT NULL` for `material` — maps from `Mapped[str]` + `String(50)`

**Turn off echo** by changing to `echo=False` and rerun. Nothing is printed — the SQL still runs, just silently. Turn it back on for the rest of this block.

**Try a type mismatch:** change `diameter_inches: Mapped[float]` to `diameter_inches: Mapped[str]`. What SQL type does SQLAlchemy generate now? Drop and recreate the table (delete `tools_orm_demo.db` and rerun). Change it back.

---

## Concept: `__tablename__` Strategy

We used `tools_orm` as the table name to avoid colliding with the existing `tools` table. In a real migration to SQLAlchemy you would either:

1. **Rename**: drop and recreate as `tools` once you are confident the ORM layer works
2. **Point at the existing table**: set `__tablename__ = "tools"` and run `create_all()` — SQLAlchemy will skip creation if the table exists. Your ORM models then read/write the existing data.

For this block, `tools_orm` keeps both layers working side by side so you can compare them directly.

---

## Challenge

Add a `created_at` column that stores a timestamp as an ISO 8601 string (SQLite has no native datetime type):

```python
from sqlalchemy import String
from datetime import datetime

created_at: Mapped[str] = mapped_column(String(30), default=lambda: datetime.now().isoformat())
```

The `default` parameter provides a Python-side default — SQLAlchemy calls the lambda when a new row is inserted without an explicit `created_at`. This is different from a SQL `DEFAULT` clause; it is applied by SQLAlchemy before sending the INSERT.

Look at the generated CREATE TABLE statement. Notice: the `default` does not appear in the SQL — it is invisible to the database. The column has no `DEFAULT` constraint. SQLAlchemy fills it in before the INSERT reaches the database.

<details>
<summary>Why this matters</summary>

A Python-side `default` means SQLAlchemy must be involved for the default to apply. If you insert a row directly with `conn.execute("INSERT INTO tools_orm (...) VALUES (...)")` — bypassing SQLAlchemy — the `created_at` column gets `NULL` because the Python-side default never ran.

A SQL-side default (`mapped_column(server_default=text("CURRENT_TIMESTAMP"))`) puts the default in the database schema. It applies regardless of whether SQLAlchemy is involved.

For `created_at` in a project where you might use both raw SQL and SQLAlchemy, prefer `server_default` so the constraint is in the schema, not the application layer.

</details>

---

## Final Check

| | |
|--|--|
| `create_all()` generates readable SQL you can compare to Lesson 11 | ✓ |
| `Mapped[str]` → NOT NULL column; `Mapped[str | None]` → nullable column | ✓ |
| Running `create_all()` twice does not error | ✓ |
| `echo=True` shows every SQL statement | ✓ |

---

## Quick Check Answers

1. **`Mapped[str]` generates `VARCHAR NOT NULL`.** `Mapped[str | None]` generates `VARCHAR` (nullable — no NOT NULL). The `| None` in the Python type directly controls nullability in the SQL schema.

2. **Nothing — `create_all()` uses `CREATE TABLE IF NOT EXISTS` semantics.** It checks the existing schema and skips any table that already exists. It does not update an existing table to match your model — that is Alembic's job (Lesson 49).

3. **`UNIQUE (column_name)`** is added as a table-level constraint. Inserting a row with a duplicate name raises `IntegrityError`. This is the same as `UNIQUE` in the hand-written DDL from Lesson 11.
