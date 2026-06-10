# Python Tool Database — LAB 47 — SQLAlchemy Inheritance Mapping

**Prerequisites:** Lab 46. You have `ToolORM` as a flat table. In Lessons 39–40 you built a Python hierarchy (`EndMill extends Tool`) and a single-table schema (`tools` with nullable columns + `tool_type` discriminator). This lesson wires them together in SQLAlchemy — so querying returns `EndMill` objects for endmill rows and `Drill` objects for drill rows, automatically.

**What this lab adds:**
- `__mapper_args__` — the configuration block for inheritance
- `polymorphic_on` — the discriminator column
- `polymorphic_identity` — the value that identifies each subclass
- How a single `select(ToolORM)` returns a mix of typed subclass objects
- The payoff: `isinstance()` on query results is no longer a code smell

**Time:** 45–55 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. SQLAlchemy reads a row where `tool_type = 'drill'`. Which class does it instantiate?
> 2. You declare `EndMillORM` as a subclass of `ToolORM`. `EndMillORM` has `corner_radius`. `ToolORM` has `name`. Do you need a separate table for `EndMillORM`?
> 3. You query `select(EndMillORM)`. Will it return drill rows?
>
> *(Answers at the end)*

---

## How SQLAlchemy Knows Which Class to Instantiate

When SQLAlchemy reads a row from the database, it needs to know whether to construct a `ToolORM`, `EndMillORM`, or `DrillORM` object. It uses two pieces of information:

1. **`polymorphic_on`** — a column whose value identifies the type. In our schema, that is `tool_type`.
2. **`polymorphic_identity`** — the value in that column for each class. `"endmill"` → `EndMillORM`, `"drill"` → `DrillORM`.

These are declared in `__mapper_args__`:

```python
class ToolORM(Base):
    __mapper_args__ = {
        "polymorphic_on": "tool_type",     # which column
        "polymorphic_identity": "tool",    # value for the base class
    }

class EndMillORM(ToolORM):
    __mapper_args__ = {
        "polymorphic_identity": "endmill"  # value for this subclass
    }
```

When SQLAlchemy reads a row with `tool_type = 'endmill'`, it constructs an `EndMillORM`. For `tool_type = 'drill'`, it constructs a `DrillORM`. For anything else, it falls back to `ToolORM`.

---

## Step 1 — Rebuild the Model with Inheritance

Delete and recreate `tooldb/orm/models.py`. Start with `HolderORM` (unchanged from Lab 46) and the base `ToolORM`:

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
    tools: Mapped[list["ToolORM"]] = relationship("ToolORM", back_populates="holder")


class ToolORM(Base):
    __tablename__ = "tools_orm"
    __mapper_args__ = {
        "polymorphic_on": "tool_type",      # which column holds the discriminator value
        "polymorphic_identity": "tool",     # value for a plain ToolORM (not a subclass)
    }

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    diameter_inches: Mapped[float] = mapped_column(Float, nullable=False)
    material: Mapped[str] = mapped_column(String(50), nullable=False)
    tool_type: Mapped[str] = mapped_column(String(50), nullable=False)
    flutes: Mapped[int | None] = mapped_column(Integer, nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    holder_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("holders_orm.id"), nullable=True)
    holder: Mapped[Optional["HolderORM"]] = relationship("HolderORM", back_populates="tools")
```

`__mapper_args__` with `polymorphic_on` and `polymorphic_identity` are the only additions compared to Lab 46. Everything else is the same model. At this point `ToolORM` is complete — there is no separate `EndMillORM` table.

The type-specific columns go **on the same class**. Because all subtypes share one table (single-table inheritance), all their nullable columns must exist on `ToolORM`:

```python
    # Endmill-specific — NULL for drills and facemills
    corner_radius: Mapped[float | None] = mapped_column(Float, nullable=True)
    helix_angle: Mapped[float | None] = mapped_column(Float, nullable=True)
    flute_length: Mapped[float | None] = mapped_column(Float, nullable=True)

    # Drill-specific — NULL for endmills and facemills
    point_angle: Mapped[float | None] = mapped_column(Float, nullable=True)
    drill_length: Mapped[float | None] = mapped_column(Float, nullable=True)

    # Facemill-specific
    insert_size: Mapped[str | None] = mapped_column(String(100), nullable=True)
    num_inserts: Mapped[int | None] = mapped_column(Integer, nullable=True)
    lead_angle: Mapped[float | None] = mapped_column(Float, nullable=True)
```

This is the tradeoff from Lab 40: one table, all columns present for every row, unused columns store `NULL`. No JOINs needed to read type-specific data. The subclasses just declare which identity they respond to:

```python
class EndMillORM(ToolORM):
    __mapper_args__ = {"polymorphic_identity": "endmill"}
    # No __tablename__ — uses the parent's table
    # No mapped_column — the columns already exist on ToolORM


class DrillORM(ToolORM):
    __mapper_args__ = {"polymorphic_identity": "drill"}


class FaceMillORM(ToolORM):
    __mapper_args__ = {"polymorphic_identity": "facemill"}
```

Three classes, each one line. No `__tablename__`, no `mapped_column` — for single-table inheritance, all the data columns live on the base class. The subclass only declares which discriminator value maps to it.

---

## Step 2 — Recreate the Table and Seed

```
python -c "
import os; os.remove('tools_orm_demo.db') if os.path.exists('tools_orm_demo.db') else None
"
python -m tooldb.orm.setup
```

Seed data with typed objects:

```python
from tooldb.orm.session import SessionLocal
from tooldb.orm.models import HolderORM, EndMillORM, DrillORM, FaceMillORM


def seed_typed():
    with SessionLocal() as session:
        h = HolderORM(name="ER32 Collet Holder", taper="BT30", collet_size_inches=0.5)
        session.add(h)
        session.flush()

        session.add_all([
            EndMillORM(name="EM-0500", diameter_inches=0.5, material="carbide",
                       flutes=4, corner_radius=0.015, helix_angle=30.0, holder_id=h.id),
            EndMillORM(name="EM-0375", diameter_inches=0.375, material="carbide",
                       flutes=4, corner_radius=0.0, holder_id=h.id),
            DrillORM(name="DR-0250", diameter_inches=0.25, material="HSS",
                     point_angle=118.0),
            DrillORM(name="DR-0500", diameter_inches=0.5, material="HSS",
                     point_angle=135.0),
            FaceMillORM(name="FM-1000", diameter_inches=1.0, material="carbide",
                        insert_size="APKT 1003", num_inserts=5, lead_angle=45.0),
        ])
        session.commit()
        print("Seeded typed tools")
```

SQLAlchemy inserts each object into the same `tools_orm` table. The `tool_type` column is set automatically from `polymorphic_identity`.

---

## Step 3 — Query and See the Types

```python
from sqlalchemy import select
from tooldb.orm.session import SessionLocal
from tooldb.orm.models import ToolORM, EndMillORM, DrillORM


def query_typed():
    with SessionLocal() as session:
        # Query all tools — returns a mix of subclass objects
        all_tools = session.scalars(select(ToolORM)).all()
        for tool in all_tools:
            print(f"{type(tool).__name__:12} | {tool.name}")

        print()

        # Query only endmills — WHERE tool_type = 'endmill' added automatically
        endmills = session.scalars(select(EndMillORM)).all()
        for em in endmills:
            print(f"corner_radius={em.corner_radius}, helix={em.helix_angle}")

        print()

        # isinstance now tells you the actual type cleanly
        for tool in all_tools:
            if isinstance(tool, EndMillORM):
                print(f"  {tool.name} has corner_radius={tool.corner_radius}")
            elif isinstance(tool, DrillORM):
                print(f"  {tool.name} has point_angle={tool.point_angle}")
```

The output shows each row instantiated as the right class. `select(EndMillORM)` generates `WHERE tools_orm.tool_type IN ('endmill')` automatically — you do not write the filter.

With `echo=True`:
```sql
SELECT tools_orm.id, tools_orm.name, ..., tools_orm.tool_type, ...
FROM tools_orm
WHERE tools_orm.tool_type IN (?)  -- when querying EndMillORM specifically
```

---

## Step 4 — `isinstance` Is No Longer a Code Smell Here

In Lesson 39, `isinstance(tool, Drill)` was a smell because it replaced polymorphism — every check was a branch that grew with new tool types.

Here, `isinstance(tool, EndMillORM)` has a different purpose: it narrows the type *after* a polymorphic query, so the type checker knows that `tool.corner_radius` exists. It is not a branch that grows with tool types — SQLAlchemy's mapper handles dispatch, and `isinstance` is just a type guard.

The distinction: `isinstance` to *dispatch behavior* is a smell. `isinstance` to *narrow types after polymorphic retrieval* is correct.

---

## Step 5 — SAVE AND TRY

**Try accessing a drill's `corner_radius`:**

```python
drill = session.scalars(select(DrillORM).limit(1)).first()
print(drill.corner_radius)   # → None (column exists on the table, NULL for drills)
```

Unlike the dataclass approach in Lesson 39 where `Drill` literally had no `corner_radius` attribute, the SQLAlchemy ORM approach uses the full table — all columns exist on every object. `DrillORM` has `corner_radius` as an attribute, it just holds `None`.

This is the trade-off of single-table inheritance: the Python class does not enforce column absence. Joined-table inheritance would give `DrillORM` no `corner_radius` attribute at all — but requires a JOIN for every query.

**Compare to the dataclass version:**
```python
# Lesson 39 dataclass — AttributeError:
from tooldb.models.tool_types import Drill
d = Drill("DR-0250", 0.25, "HSS", point_angle=118.0)
print(d.corner_radius)  # AttributeError: 'Drill' object has no attribute 'corner_radius'

# Lesson 47 ORM — returns None:
d = session.scalars(select(DrillORM)).first()
print(d.corner_radius)  # None
```

Both are valid. The dataclass approach gives tighter typing; the ORM approach gives easier queries.

---

## Challenge

Add a `TurnToolORM` subclass with `polymorphic_identity = "turntool"`. Query all tools and print each type. Verify that `select(TurnToolORM)` generates the correct WHERE clause.

<details>
<summary>Answer</summary>

```python
class TurnToolORM(ToolORM):
    __mapper_args__ = {"polymorphic_identity": "turntool"}
```

Insert one:
```python
session.add(TurnToolORM(
    name="TT-CNMG432", diameter_inches=0.5, material="carbide",
    insert_shape="CNMG 432", nose_radius=0.031, relief_angle=7.0
))
session.commit()
```

Query:
```python
turn_tools = session.scalars(select(TurnToolORM)).all()
# Generated SQL: WHERE tools_orm.tool_type IN ('turntool')
```

Adding a new tool type to the ORM requires: one `__mapper_args__` subclass declaration, and any type-specific columns already exist on `ToolORM` (since we declared them there). Zero schema changes if the columns are already in the table.

</details>

---

## Final Check

| | |
|--|--|
| `select(ToolORM)` returns a mix of EndMillORM, DrillORM, etc. objects | ✓ |
| `select(EndMillORM)` generates `WHERE tool_type IN ('endmill')` | ✓ |
| `isinstance(tool, EndMillORM)` is correct here (type narrowing, not dispatch) | ✓ |
| Subclasses have no `__tablename__` or new `mapped_column` (single-table) | ✓ |
| A DrillORM object has `corner_radius = None`, not AttributeError | ✓ understood trade-off |

---

## Quick Check Answers

1. **`DrillORM`** — because `DrillORM.__mapper_args__["polymorphic_identity"] == "drill"` and the row has `tool_type = 'drill'`. SQLAlchemy looks up the `polymorphic_on` column value in its mapper registry and constructs the matching class.

2. **No separate table** — that is single-table inheritance. All subclass columns live in the base table. `EndMillORM` does not need `__tablename__` because it uses `ToolORM.__tablename__ = "tools_orm"` by inheritance. The columns (`corner_radius` etc.) are declared on `ToolORM` and simply hold `NULL` for non-endmill rows.

3. **No** — `select(EndMillORM)` automatically adds `WHERE tools_orm.tool_type IN ('endmill')`. Drill rows are excluded. To get all tools regardless of type, query `select(ToolORM)`.
