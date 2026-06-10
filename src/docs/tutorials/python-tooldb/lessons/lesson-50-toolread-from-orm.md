# Python Tool Database — LAB 50 — ToolRead: Pydantic from SQLAlchemy Objects

**Prerequisites:** Labs 28 and 49. In Lesson 28 you built `ToolCreate` — a Pydantic model that validates incoming data. In Lesson 47 you built `ToolORM` — a SQLAlchemy model that stores data. This lesson connects the outbound direction: you have an ORM object, and you want a clean, typed Python object to hand to the UI layer. That is `ToolRead`.

**What this lab adds:**
- Why `ToolCreate` and `ToolRead` are different things
- `model_config = ConfigDict(from_attributes=True)` — reading a Pydantic model from an ORM object
- What `from_attributes` does under the hood
- `ToolRead` as the schema every layer above the database receives
- Testing the conversion

**Time:** 40–50 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. You have a `ToolORM` object returned by SQLAlchemy. You call `ToolRead.model_validate(tool_orm)`. Pydantic tries to read fields from the ORM object. What does `from_attributes=True` do that makes this work?
> 2. `ToolCreate` has no `id` field. `ToolRead` has an `id` field. Why?
> 3. The UI layer receives a `ToolRead` object and accesses `tool.name`. It never imports `ToolORM`. Is that a problem?
>
> *(Answers at the end)*

---

## The Three Schemas

In Lesson 28, `ToolCreate` represented one operation: creating a new tool. That is not the only thing you do with tool data:

| Operation | Schema | Key difference |
|---|---|---|
| Creating a tool | `ToolCreate` | No `id` (the database assigns it) |
| Reading a tool | `ToolRead` | Has `id`, may have computed fields |
| Updating a tool | `ToolUpdate` | All fields optional (only send what changed) |

You built `ToolCreate` in Lesson 28. This lesson builds `ToolRead`. Lesson 51 builds `ToolUpdate` and shows all three working together.

These are three separate classes because they serve three separate contracts. Collapsing them into one class would mean every field needs to be optional (to accommodate partial updates) and every field has a dual role as input and output — which makes validation logic tangled.

---

## The Problem Without `from_attributes`

Here is what happens if you try to validate a Pydantic model from an ORM object with the defaults:

```python
from tooldb.orm.models import ToolORM
from tooldb.schemas.tool_schemas import ToolRead

tool_orm = session.get(ToolORM, 1)

# Without from_attributes=True:
read = ToolRead.model_validate(tool_orm)
# PydanticUserError: You should use model_validate instead
# (or) ValidationError: dict expected but got ToolORM
```

Pydantic expects a dict or another Pydantic model. A SQLAlchemy ORM object is neither — it is a regular Python object whose fields are attributes, not dict keys.

`from_attributes=True` tells Pydantic: "when validating, also try reading attributes if the input is not a dict." It calls `getattr(obj, field_name)` for each field in the schema.

---

## Step 1 — Create `tooldb/schemas/tool_schemas.py`

In Lesson 28, you created `tooldb/schemas/tool_schema.py` (singular). Add `ToolRead` to it, or create a new file with all three schemas together. Here both `ToolCreate` (the version from Lesson 28) and `ToolRead` live in the same file:

```python
from pydantic import BaseModel, ConfigDict, Field, field_validator
from typing import Optional


class ToolCreate(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    name: str
    diameter_inches: float
    material: str
    tool_type: str
    flutes: Optional[int] = None
    notes: Optional[str] = None

    # Validators from Lesson 28 — not repeated here, carry them over


class ToolRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    diameter_inches: float
    material: str
    tool_type: str
    flutes: Optional[int] = None
    notes: Optional[str] = None

    # Subtype-specific fields — None for irrelevant types
    corner_radius: Optional[float] = None
    helix_angle: Optional[float] = None
    flute_length: Optional[float] = None
    point_angle: Optional[float] = None
    drill_length: Optional[float] = None
    insert_size: Optional[str] = None
    num_inserts: Optional[int] = None
    lead_angle: Optional[float] = None

    # Holder info — only populated when holder is loaded
    holder_id: Optional[int] = None
```

The differences from `ToolCreate`:
- `id: int` — the database-assigned primary key is now present
- `from_attributes=True` — the `model_config` flag that enables ORM-to-Pydantic conversion
- All subtype-specific columns — `ToolRead` represents a complete row as it exists in the database, including the nullable columns from single-table inheritance
- No validators — `ToolRead` is for output, not input. You trust what the database returns.

---

## Step 2 — The Conversion

```python
from sqlalchemy import select
from tooldb.orm.session import SessionLocal
from tooldb.orm.models import ToolORM
from tooldb.schemas.tool_schemas import ToolRead


def get_tool_as_read(tool_id: int) -> ToolRead | None:
    with SessionLocal() as session:
        tool_orm = session.get(ToolORM, tool_id)
        if tool_orm is None:
            return None
        return ToolRead.model_validate(tool_orm)
```

`ToolRead.model_validate(tool_orm)` reads each field by calling `getattr(tool_orm, field_name)` for every field in `ToolRead`. Because `ToolORM` has attributes named `id`, `name`, `diameter_inches`, etc., this works without any mapping code.

The returned `ToolRead` is a plain Pydantic object — no SQLAlchemy session attached, no lazy loading, no `DetachedInstanceError`. It is safe to pass to any layer above the database.

---

## Step 3 — What `from_attributes` Does, Precisely

`from_attributes=True` changes how `model_validate` interprets its input:

```python
# Without from_attributes (default):
# Pydantic tries: isinstance(input, dict) → yes → extract by key
# Pydantic tries: isinstance(input, BaseModel) → no
# Anything else → ValidationError

# With from_attributes=True:
# Pydantic tries: isinstance(input, dict) → no
# Pydantic tries: hasattr(input, field_name) → yes for each field
# → reads via getattr(input, field_name) for each field
```

This works for any object with attributes — not just SQLAlchemy ORM objects. You could pass a `dataclass`, a `namedtuple`, or your `Tool` class from Lesson 39. If the object has the right attribute names, `model_validate` converts it.

```python
from tooldb.models.tool_types import EndMill  # the dataclass from Lesson 39

endmill = EndMill(
    name="EM-0500", diameter_inches=0.5, material="carbide",
    flutes=4, corner_radius=0.015, helix_angle=30.0
)

# This works — EndMill has attributes named the same as ToolRead fields
read = ToolRead.model_validate(endmill)   # works if you set from_attributes=True
```

---

## Step 4 — Converting a List

For queries that return many tools:

```python
def get_all_tools_as_read() -> list[ToolRead]:
    with SessionLocal() as session:
        tools_orm = session.scalars(select(ToolORM)).all()
        return [ToolRead.model_validate(t) for t in tools_orm]
```

The list comprehension converts every ORM object to a `ToolRead`. After the `with` block, the session closes. The `ToolRead` objects are self-contained — no session, no lazy loading danger.

---

## Step 5 — Test the Conversion

```python
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from tooldb.orm.models import Base, ToolORM, EndMillORM
from tooldb.schemas.tool_schemas import ToolRead


@pytest.fixture
def orm_session():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    with Session() as session:
        session.add(EndMillORM(
            name="EM-0500", diameter_inches=0.5, material="carbide",
            flutes=4, corner_radius=0.015, helix_angle=30.0
        ))
        session.commit()
        yield session


def test_toolread_from_orm(orm_session):
    tool_orm = orm_session.get(ToolORM, 1)
    read = ToolRead.model_validate(tool_orm)

    assert read.id == 1
    assert read.name == "EM-0500"
    assert read.diameter_inches == 0.5
    assert read.tool_type == "endmill"
    assert read.corner_radius == 0.015
    assert read.point_angle is None    # drill field, not populated


def test_toolread_is_not_orm(orm_session):
    tool_orm = orm_session.get(ToolORM, 1)
    read = ToolRead.model_validate(tool_orm)

    # ToolRead has no session — safe to use outside the session context
    assert isinstance(read, ToolRead)
    assert not hasattr(read, '_sa_instance_state')   # no SQLAlchemy tracking
```

The second test makes the architectural point explicit: `ToolRead` carries no SQLAlchemy machinery. It is a plain Python object.

---

## Step 6 — SAVE AND TRY

**Access a lazy-loaded attribute after the session closes.** Do this:

```python
with SessionLocal() as session:
    tool_orm = session.get(ToolORM, 1)

# Session is closed — ORM object is now detached
print(tool_orm.name)        # works — name is a scalar, already loaded
print(tool_orm.holder.name) # DetachedInstanceError — relationship not loaded
```

Now do the same with `ToolRead`:

```python
with SessionLocal() as session:
    tool_orm = session.get(ToolORM, 1)
    read = ToolRead.model_validate(tool_orm)

# Session is closed
print(read.name)         # works
print(read.holder_id)    # works — it's just an int, already copied
```

`ToolRead` carries `holder_id` as an integer. It never holds a reference to the `HolderORM` object, so there is nothing to lazily load. The detached-object problem simply does not exist for `ToolRead`.

---

## Concept: Why the Conversion Layer Exists

The layers look like this:

```
Qt Table Model
      ↓ ↑ ToolRead objects
   Service
      ↓ ↑ ToolORM objects (session-bound)
   Repository
      ↓ ↑ SQL
   Database
```

The service layer owns the conversion: it receives `ToolCreate` (input), calls the repository, gets back `ToolORM`, converts to `ToolRead`, and returns `ToolRead` to the caller.

The Qt table model, the dialog, the REST handler — they all receive `ToolRead`. They never hold a SQLAlchemy session. They are not responsible for knowing when the session closes.

If you skip the conversion and hand `ToolORM` objects directly to the UI, you get `DetachedInstanceError` the first time the UI tries to access a relationship attribute after the session closed. That error happens at render time, not at database time, and it is hard to trace back to the root cause.

---

## Final Check

| | |
|--|--|
| `ToolCreate` has no `id`; `ToolRead` has `id` — different roles | ✓ |
| `from_attributes=True` reads Pydantic fields via `getattr` | ✓ |
| `ToolRead.model_validate(orm_obj)` converts an ORM object to a plain Pydantic model | ✓ |
| `ToolRead` is session-independent — safe to use after session closes | ✓ |
| The service layer owns the ToolORM → ToolRead conversion | ✓ |

---

## Quick Check Answers

1. **`from_attributes=True` changes the validation strategy from dict-key lookup to attribute access.** Without it, Pydantic calls `input["name"]` for each field — which raises `TypeError` on an ORM object. With it, Pydantic calls `getattr(input, "name")` for each field — which works on any Python object with matching attribute names, including SQLAlchemy ORM objects.

2. **`ToolCreate` has no `id` because the database assigns it.** When you create a tool, you don't know the ID yet — the database's `autoincrement` primary key assigns it on INSERT. Putting an `id` field on `ToolCreate` would require the caller to either supply a fake ID or leave it blank, both of which are wrong. `ToolRead` has `id` because by the time you read a tool, the row exists and the ID is known.

3. **No — that is the point.** The UI layer receiving `ToolRead` objects without ever importing `ToolORM` is the architecture working correctly. The SQLAlchemy session, the ORM model, the database — those are the responsibility of the service and repository layers. The UI's job is to display data, and `ToolRead` gives it exactly the data it needs. Clean separation of concerns.
