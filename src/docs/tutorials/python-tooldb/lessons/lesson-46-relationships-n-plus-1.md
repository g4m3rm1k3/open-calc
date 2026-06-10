# Python Tool Database — LAB 46 — Relationships and the N+1 Problem

**Prerequisites:** Lab 45. You can do CRUD with SQLAlchemy. The `ToolORM` and `HolderORM` models exist but are unrelated. This lesson adds the relationship between them — and then deliberately triggers the most famous ORM performance bug so you can see it, count it, and fix it.

**What this lab adds:**
- `ForeignKey` and `relationship()` in SQLAlchemy models
- `back_populates` — bidirectional navigation
- Lazy loading: when accessing `tool.holder` fires a SQL query
- The N+1 problem: demonstrated live with `echo=True`
- `joinedload()` — the fix that collapses N+1 queries into one

**Time:** 55–70 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. You have 50 tools, each with a holder. You load all tools with one query. Then you loop over them and access `tool.holder.name` for each. How many total SQL queries have you run?
> 2. `back_populates` vs `backref` — both create bidirectional relationships. Why does SQLAlchemy 2.0 prefer `back_populates`?
> 3. `joinedload` fixes N+1 by loading relationships in the same query. What SQL clause does it use?
>
> *(Answers at the end)*

---

## Step 1 — Add the Foreign Key and Relationship

Update `tooldb/orm/models.py`:

```python
from sqlalchemy import String, Float, Integer, Text, ForeignKey
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship
from typing import Optional


class Base(DeclarativeBase):
    pass


class HolderORM(Base):
    __tablename__ = "holders_orm"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    taper: Mapped[str] = mapped_column(String(50), nullable=False)
    collet_size_inches: Mapped[float] = mapped_column(Float, nullable=False)

    # Relationship: one holder has many tools
    tools: Mapped[list["ToolORM"]] = relationship("ToolORM", back_populates="holder")

    def __repr__(self) -> str:
        return f"HolderORM(id={self.id}, name={self.name!r})"


class ToolORM(Base):
    __tablename__ = "tools_orm"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    diameter_inches: Mapped[float] = mapped_column(Float, nullable=False)
    material: Mapped[str] = mapped_column(String(50), nullable=False)
    tool_type: Mapped[str] = mapped_column(String(50), nullable=False)
    flutes: Mapped[int | None] = mapped_column(Integer, nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Foreign key column
    holder_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("holders_orm.id"), nullable=True)

    # Relationship: many tools belong to one holder
    holder: Mapped[Optional["HolderORM"]] = relationship("HolderORM", back_populates="tools")

    def __repr__(self) -> str:
        return f"ToolORM(id={self.id}, name={self.name!r})"
```

Drop the old demo database and recreate:

```
python -c "
import os; os.remove('tools_orm_demo.db') if os.path.exists('tools_orm_demo.db') else None
"
python -m tooldb.orm.setup
```

Watch the generated SQL. You should see `CREATE TABLE holders_orm` (with no foreign key) and `CREATE TABLE tools_orm` (with `holder_id INTEGER REFERENCES holders_orm (id)`). SQLAlchemy creates `holders_orm` first because `tools_orm` depends on it.

---

## Step 2 — What `relationship()` Does

`relationship()` does not add a database column. It adds a Python attribute that, when accessed, loads related objects via SQL.

```python
# Navigating from tool to holder:
tool.holder       # → HolderORM object (or None)
tool.holder.name  # → "ER32 Collet Holder"

# Navigating from holder to tools:
holder.tools      # → list of ToolORM objects
```

`back_populates` links the two sides. When you set `tool.holder = some_holder`, SQLAlchemy also adds `tool` to `some_holder.tools`. They stay in sync.

---

## Step 3 — Seed Data with Relationships

```python
from tooldb.orm.session import SessionLocal
from tooldb.orm.models import ToolORM, HolderORM


def seed():
    with SessionLocal() as session:
        h1 = HolderORM(name="ER32 Collet Holder", taper="BT30", collet_size_inches=0.5)
        h2 = HolderORM(name="ER16 Collet Holder", taper="BT30", collet_size_inches=0.25)
        session.add_all([h1, h2])
        session.flush()   # assigns IDs without committing — so we can use h1.id

        tools = [
            ToolORM(name=f"EM-{i:04d}", diameter_inches=0.5, material="carbide",
                    tool_type="endmill", holder_id=h1.id)
            for i in range(1, 11)   # 10 endmills in holder 1
        ]
        tools += [
            ToolORM(name=f"DR-{i:04d}", diameter_inches=0.25, material="HSS",
                    tool_type="drill", holder_id=h2.id)
            for i in range(1, 11)   # 10 drills in holder 2
        ]
        session.add_all(tools)
        session.commit()
        print(f"Seeded {len(tools)} tools in 2 holders")
```

`session.flush()` sends pending changes to the database but does not commit. After flush, `h1.id` is populated (SQLite assigned it). We need the ID to set `holder_id` on the tools.

---

## Step 4 — The N+1 Problem (Live Demonstration)

With `echo=True` and 20 tools in 2 holders, run this:

```python
from sqlalchemy import select
from tooldb.orm.session import SessionLocal
from tooldb.orm.models import ToolORM


def show_n_plus_1():
    print("=== N+1 DEMONSTRATION ===")
    with SessionLocal() as session:
        tools = session.scalars(select(ToolORM)).all()  # Query 1: SELECT all tools

        print(f"\nLoaded {len(tools)} tools. Now accessing holder names...\n")

        for tool in tools:
            # Each access of tool.holder fires a separate SELECT if not loaded:
            holder_name = tool.holder.name if tool.holder else "no holder"
            print(f"  {tool.name} → {holder_name}")
```

Count the SQL statements printed by `echo=True`. You should see:
- 1 SELECT to load all tools
- 20 SELECTs to load each tool's holder (one per loop iteration)

**21 queries for 20 tools.** With 1000 tools, that would be 1001 queries. This is the N+1 problem: 1 query to get N objects, then N queries to get their related data. The "1" in "N+1" is the first query; the "N" is one per object.

---

## Step 5 — Fix It with `joinedload()`

```python
from sqlalchemy.orm import joinedload


def show_fixed():
    print("=== FIXED WITH joinedload ===")
    with SessionLocal() as session:
        tools = session.scalars(
            select(ToolORM).options(joinedload(ToolORM.holder))
        ).all()   # ONE query with a JOIN

        print(f"\nLoaded {len(tools)} tools. Accessing holder names...\n")

        for tool in tools:
            holder_name = tool.holder.name if tool.holder else "no holder"
            print(f"  {tool.name} → {holder_name}")
```

Count the SQL statements now. You should see **one query**:

```sql
SELECT tools_orm.id, ..., holders_orm.id, holders_orm.name, ...
FROM tools_orm
LEFT OUTER JOIN holders_orm ON holders_orm.id = tools_orm.holder_id
```

That is the JOIN from Lesson 15, generated automatically. The entire holder data is loaded in the same query as the tools. Zero extra queries in the loop.

The difference:
- Without `joinedload`: 1 + N queries
- With `joinedload`: 1 query (with a JOIN)

---

## Why Lazy Loading Exists

If `joinedload` is always faster, why is lazy loading the default?

Because loading every relationship eagerly on every query is often worse than N+1. If you load all tools and never access `tool.holder`, a JOIN that fetches holder data is wasted work. For 10,000 tools with 50 columns of holder data, that is a lot of data transferred for no reason.

The rule: **use lazy loading by default, switch to `joinedload` when you know you will access the relationship for every object in a collection.**

---

## Step 6 — SAVE AND TRY

**Count the queries explicitly.** Modify the N+1 demo to print a separator before each SQL statement by temporarily wrapping the engine's `echo` in a counter. Or just count the output lines — each `SELECT` line is one query.

**Try `selectinload` as an alternative:**

```python
from sqlalchemy.orm import selectinload

tools = session.scalars(
    select(ToolORM).options(selectinload(ToolORM.holder))
).all()
```

`selectinload` issues 2 queries: one for tools, one for all holders (`WHERE holder_id IN (1, 2)`). It avoids the JOIN. Useful when the JOIN would produce a large cartesian product (many-to-many).

The generated SQL:
```sql
SELECT tools_orm.* FROM tools_orm
SELECT holders_orm.* FROM holders_orm WHERE holders_orm.id IN (?, ?)
```

Two queries, not N+1. Often the right choice for one-to-many or many-to-many relationships.

---

## Challenge

Add an `AssemblyORM` model with relationships to both `ToolORM` and `HolderORM`. Then query all assemblies and load both relationships eagerly. Use `echo=True` to verify the generated SQL uses a JOIN (or two SELECTs with `selectinload`).

<details>
<summary>Answer</summary>

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

Query with eager loading:
```python
from sqlalchemy.orm import joinedload

assemblies = session.scalars(
    select(AssemblyORM)
    .options(joinedload(AssemblyORM.tool), joinedload(AssemblyORM.holder))
).all()
```

With `echo=True`, this generates one SELECT with two LEFT OUTER JOINs — the same three-table JOIN from Lesson 15.

</details>

---

## Final Check

| | |
|--|--|
| `relationship()` adds a Python attribute, not a database column | ✓ |
| Accessing `tool.holder` in a loop without `joinedload` = N+1 queries | ✓ demonstrated |
| `joinedload` collapses N+1 into one JOIN query | ✓ |
| `selectinload` uses 2 queries instead of a JOIN | ✓ |
| The default is lazy loading — switch to eager only when you know you need the relationship | ✓ |

---

## Quick Check Answers

1. **51 SQL queries.** One to load 50 tools, then one per tool to load its holder = 1 + 50 = 51. SQLAlchemy's lazy loading fires a `SELECT * FROM holders_orm WHERE id = ?` for each tool when you first access `tool.holder`. If the holders table has already been loaded (same holder reused), the identity map may save some queries — but in the worst case it is 1 + N.

2. **`back_populates` requires explicit configuration on both sides**, making the relationship visible and explicit in the model code. `backref` creates the reverse side automatically with a string argument — convenient but invisible in the model that gets the reverse side added. In SQLAlchemy 2.0, `back_populates` is preferred because the relationship is declared on both classes and the code is self-documenting. With `backref`, reading `HolderORM` gives no indication that it has a `tools` attribute.

3. **`LEFT OUTER JOIN`** (or `INNER JOIN` for non-nullable relationships). `joinedload` adds a JOIN clause to the original SELECT, so the related rows are fetched in the same database round-trip. The ORM then distributes the joined rows back to the correct parent objects using the primary and foreign key values.
