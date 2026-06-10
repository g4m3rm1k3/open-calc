# Python Tool Database — LAB 40 — Polymorphic Database Schema

**Prerequisites:** Lab 39. You have a `Tool` hierarchy in Python — `EndMill`, `Drill`, `FaceMill`, `TurnTool` each knowing their own fields. Now you ask: how does this hierarchy live in SQLite, which has no concept of inheritance?

**What this lab adds:**
- The two strategies for storing inheritance in a relational database
- Single-table inheritance: one table, nullable type-specific columns, a CHECK constraint
- Migration 0006: adding the type-specific columns
- A `TypedToolRepository` that returns the right Python subclass for each row
- The tradeoff that makes single-table the right choice here

**Time:** 55–65 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. You have `EndMill` with `corner_radius` and `Drill` with `point_angle`. With single-table inheritance, where do both columns live?
> 2. A drill row in the `tools` table has `corner_radius = NULL`. Is this a problem?
> 3. `CHECK (tool_type IN ('endmill', 'drill', 'facemill', 'turntool'))` — what does this prevent that `NOT NULL` alone cannot?
>
> *(Answers at the end)*

---

## Two Strategies for Inheritance in SQL

Relational databases have no `extends` keyword. To store a hierarchy of objects, you choose a mapping strategy.

### Strategy A — Joined Table Inheritance

One table for the base class, one table per subclass. They share the primary key:

```sql
CREATE TABLE tools (id, name, diameter_inches, material, tool_type);
CREATE TABLE endmills (tool_id REFERENCES tools(id), corner_radius, helix_angle, flute_length);
CREATE TABLE drills   (tool_id REFERENCES tools(id), point_angle, drill_length);
```

To get a drill: `SELECT * FROM tools JOIN drills ON tools.id = drills.tool_id WHERE tools.id = ?`

**Pros:** No wasted columns. Each subclass table has only valid columns — a drill table physically cannot have `corner_radius`.

**Cons:** Every query needs a JOIN. Adding a new tool type means a new table and a new migration.

### Strategy B — Single-Table Inheritance

One table for everything. All type-specific columns are nullable. A `tool_type` discriminator column tells you what type each row is:

```sql
CREATE TABLE tools (
    id, name, diameter_inches, material, tool_type,
    -- endmill columns:
    corner_radius, helix_angle, flute_length,
    -- drill columns:
    point_angle, drill_length,
    -- facemill columns:
    insert_size, num_inserts, lead_angle,
    -- turntool columns:
    insert_shape, nose_radius, relief_angle
);
```

A drill row has `corner_radius = NULL`, `insert_size = NULL`, etc. That is fine — those columns don't apply.

**Pros:** Simple queries (no JOINs for basic reads). One table means one migration for the base schema.

**Cons:** NULL columns for every row of the wrong type. The database cannot enforce "a drill must have a point_angle" — that validation lives in Python.

**For this project:** Single-table. The tool types are bounded (we know them all), the table will stay small (thousands of tools, not millions), and simple queries matter because we query frequently. If new tool types needed to be added dynamically by users at runtime, joined-table would be better.

---

## Step 1 — Migration 0006

Create `migrations/0006_add_type_specific_columns.sql`:

```sql
-- EndMill fields
ALTER TABLE tools ADD COLUMN corner_radius REAL;
ALTER TABLE tools ADD COLUMN helix_angle REAL;
ALTER TABLE tools ADD COLUMN flute_length REAL;

-- Drill fields
ALTER TABLE tools ADD COLUMN point_angle REAL;
ALTER TABLE tools ADD COLUMN drill_length REAL;

-- FaceMill fields
ALTER TABLE tools ADD COLUMN insert_size TEXT;
ALTER TABLE tools ADD COLUMN num_inserts INTEGER;
ALTER TABLE tools ADD COLUMN lead_angle REAL;

-- TurnTool fields
ALTER TABLE tools ADD COLUMN insert_shape TEXT;
ALTER TABLE tools ADD COLUMN nose_radius REAL;
ALTER TABLE tools ADD COLUMN relief_angle REAL;
```

SQLite's `ALTER TABLE ADD COLUMN` always adds a nullable column. There is no `NOT NULL` allowed here unless a `DEFAULT` is also specified. That limitation is fine — these columns are genuinely optional depending on tool type.

Run the migration:

```
python -m tooldb.migrate
```

Verify the columns exist:

```python
python -c "
import sqlite3
conn = sqlite3.connect('tools.db')
cols = [r[1] for r in conn.execute('PRAGMA table_info(tools)').fetchall()]
print(cols)
"
```

You should see all the new column names in the output.

---

## Step 2 — The CHECK Constraint Problem

SQLite does not enforce `CHECK` constraints added after the table exists via `ALTER TABLE` in older versions (before 3.25). To add a proper `CHECK (tool_type IN (...))` constraint, you need to recreate the table. That is a heavier migration — worth doing correctly.

Add `migrations/0007_add_tool_type_check.sql`:

```sql
-- SQLite doesn't support ADD CONSTRAINT, so we recreate the table.
-- This migration copies all data, drops the old table, recreates with constraint, restores data.

CREATE TABLE tools_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    diameter_inches REAL NOT NULL,
    flutes INTEGER,
    material TEXT NOT NULL,
    tool_type TEXT NOT NULL CHECK (tool_type IN ('endmill','drill','facemill','turntool','tap','reamer','chamfer','ballmill')),
    notes TEXT,
    source TEXT DEFAULT 'manual',
    imported_at TEXT,
    field_sources TEXT,
    preferred_sfm REAL,
    corner_radius REAL,
    helix_angle REAL,
    flute_length REAL,
    point_angle REAL,
    drill_length REAL,
    insert_size TEXT,
    num_inserts INTEGER,
    lead_angle REAL,
    insert_shape TEXT,
    nose_radius REAL,
    relief_angle REAL
);

INSERT INTO tools_new SELECT
    id, name, diameter_inches, flutes, material, tool_type, notes,
    source, imported_at, field_sources, preferred_sfm,
    corner_radius, helix_angle, flute_length,
    point_angle, drill_length,
    insert_size, num_inserts, lead_angle,
    insert_shape, nose_radius, relief_angle
FROM tools;

DROP TABLE tools;
ALTER TABLE tools_new RENAME TO tools;
```

Run the migration again:

```
python -m tooldb.migrate
```

Now inserting a tool with `tool_type = 'lathe'` raises `IntegrityError`. The CHECK constraint is enforced.

---

## Step 3 — RED: Tests for `TypedToolRepository`

Create `tests/test_typed_tool_repository.py`:

```python
import pytest
from tooldb.repositories.typed_tool_repository import TypedToolRepository
from tooldb.models.tool_types import EndMill, Drill, FaceMill, Tool


def test_insert_and_retrieve_endmill(db_conn):
    repo = TypedToolRepository(db_conn)
    em = EndMill(name="EM-0500", diameter_inches=0.5, material="carbide",
                 flutes=4, corner_radius=0.015, helix_angle=30.0)
    tool_id = repo.insert(em)
    retrieved = repo.get_by_id(tool_id)
    assert isinstance(retrieved, EndMill)
    assert retrieved.corner_radius == 0.015
    assert retrieved.helix_angle == 30.0


def test_insert_and_retrieve_drill(db_conn):
    repo = TypedToolRepository(db_conn)
    d = Drill(name="DR-0250", diameter_inches=0.25, material="HSS", point_angle=118.0)
    tool_id = repo.insert(d)
    retrieved = repo.get_by_id(tool_id)
    assert isinstance(retrieved, Drill)
    assert retrieved.point_angle == 118.0


def test_retrieved_drill_has_no_corner_radius_attribute(db_conn):
    repo = TypedToolRepository(db_conn)
    d = Drill(name="DR-0500", diameter_inches=0.5, material="HSS", point_angle=135.0)
    tool_id = repo.insert(d)
    retrieved = repo.get_by_id(tool_id)
    # A Drill object doesn't have corner_radius — accessing it is an AttributeError
    assert not hasattr(retrieved, "corner_radius")


def test_get_all_returns_correct_types(db_conn):
    repo = TypedToolRepository(db_conn)
    repo.insert(EndMill(name="EM-001", diameter_inches=0.5, material="carbide"))
    repo.insert(Drill(name="DR-001", diameter_inches=0.25, material="HSS"))
    tools = repo.get_all()
    assert len(tools) == 2
    types = {t.type_name() for t in tools}
    assert types == {"endmill", "drill"}


def test_invalid_tool_type_raises(db_conn):
    import sqlite3
    with pytest.raises(sqlite3.IntegrityError):
        db_conn.execute(
            "INSERT INTO tools (name, diameter_inches, material, tool_type) VALUES (?,?,?,?)",
            ("Bad", 0.5, "carbide", "lathe")
        )
        db_conn.commit()
```

Run — fails with `ModuleNotFoundError`. Red.

---

## Step 4 — GREEN: Build `TypedToolRepository`

Create `tooldb/repositories/typed_tool_repository.py`:

```python
import sqlite3
from tooldb.models.tool_types import Tool, EndMill, Drill, FaceMill, TurnTool

_TYPE_MAP: dict[str, type] = {
    "endmill": EndMill,
    "drill": Drill,
    "facemill": FaceMill,
    "turntool": TurnTool,
}

_ENDMILL_COLS = ["corner_radius", "helix_angle", "flute_length"]
_DRILL_COLS   = ["point_angle", "drill_length"]
_FACEMILL_COLS = ["insert_size", "num_inserts", "lead_angle"]
_TURNTOOL_COLS = ["insert_shape", "nose_radius", "relief_angle"]

_TYPE_COLS: dict[str, list[str]] = {
    "endmill":  _ENDMILL_COLS,
    "drill":    _DRILL_COLS,
    "facemill": _FACEMILL_COLS,
    "turntool": _TURNTOOL_COLS,
}


class TypedToolRepository:
    def __init__(self, conn: sqlite3.Connection) -> None:
        self.conn = conn
        self.conn.execute("PRAGMA foreign_keys = ON")
        self.conn.row_factory = sqlite3.Row

    def insert(self, tool: Tool) -> int:
        type_cols = _TYPE_COLS.get(tool.type_name(), [])
        type_fields = tool.type_specific_fields()

        all_cols = ["name", "diameter_inches", "material", "tool_type"] + type_cols
        values = [tool.name, tool.diameter_inches, tool.material, tool.type_name()]
        values += [type_fields.get(c) for c in type_cols]

        placeholders = ", ".join("?" * len(all_cols))
        col_list = ", ".join(all_cols)
        cursor = self.conn.execute(
            f"INSERT INTO tools ({col_list}) VALUES ({placeholders})",
            values,
        )
        self.conn.commit()
        return cursor.lastrowid

    def get_by_id(self, tool_id: int) -> Tool | None:
        row = self.conn.execute(
            "SELECT * FROM tools WHERE id = ?", (tool_id,)
        ).fetchone()
        return self._row_to_tool(row) if row else None

    def get_all(self) -> list[Tool]:
        rows = self.conn.execute("SELECT * FROM tools").fetchall()
        return [self._row_to_tool(r) for r in rows if r is not None]

    def _row_to_tool(self, row: sqlite3.Row) -> Tool | None:
        tool_type = row["tool_type"]
        cls = _TYPE_MAP.get(tool_type)
        if cls is None:
            return None

        kwargs = {
            "name": row["name"],
            "diameter_inches": row["diameter_inches"],
            "material": row["material"],
        }
        for col in _TYPE_COLS.get(tool_type, []):
            val = row[col]
            if val is not None:
                kwargs[col] = val

        return cls(**kwargs)
```

Run the tests:

```
pytest tests/test_typed_tool_repository.py -v
```

The key test is `test_retrieved_drill_has_no_corner_radius_attribute` — a `Drill` object literally does not have a `corner_radius` attribute. The type hierarchy enforces this at the Python level, not just in documentation.

---

## Step 5 — SAVE AND TRY

Seed a drill and an endmill, then retrieve them and call `all_fields()`:

```python
python -c "
import sqlite3
from pathlib import Path
from tooldb.repositories.typed_tool_repository import TypedToolRepository
from tooldb.models.tool_types import EndMill, Drill
from tooldb.migrate import apply_migrations

conn = sqlite3.connect('tools.db')
apply_migrations(conn, Path('migrations'))
repo = TypedToolRepository(conn)

em_id = repo.insert(EndMill('EM-TEST', 0.5, 'carbide', flutes=4, corner_radius=0.015))
dr_id = repo.insert(Drill('DR-TEST', 0.25, 'HSS', point_angle=118.0))

em = repo.get_by_id(em_id)
dr = repo.get_by_id(dr_id)

print(type(em).__name__, em.all_fields())
print(type(dr).__name__, dr.all_fields())
"
```

The output shows each object knows exactly its own fields, nothing more.

---

## Challenge

Add a `get_by_type(tool_type: str) -> list[Tool]` method to `TypedToolRepository` that returns only tools of a given type. Write the test first.

Then: call `get_by_type("drill")` and call `type_specific_fields()` on every result — confirm they all have `point_angle` and none have `corner_radius`.

<details>
<summary>Answer</summary>

```python
# Test:
def test_get_by_type_returns_only_that_type(db_conn):
    repo = TypedToolRepository(db_conn)
    repo.insert(EndMill("EM-001", 0.5, "carbide"))
    repo.insert(EndMill("EM-002", 0.75, "carbide"))
    repo.insert(Drill("DR-001", 0.25, "HSS"))
    drills = repo.get_by_type("drill")
    assert len(drills) == 1
    assert all(isinstance(t, Drill) for t in drills)
    assert all("point_angle" in t.type_specific_fields() for t in drills)

# Implementation:
def get_by_type(self, tool_type: str) -> list[Tool]:
    rows = self.conn.execute(
        "SELECT * FROM tools WHERE tool_type = ?", (tool_type,)
    ).fetchall()
    return [t for r in rows if (t := self._row_to_tool(r)) is not None]
```

The walrus operator (`:=`) in the list comprehension assigns the result of `_row_to_tool(r)` to `t` while filtering out `None`s in one pass.

</details>

---

## Final Check

| | |
|--|--|
| Migration 0006 adds all type-specific columns | ✓ verified with `PRAGMA table_info` |
| Migration 0007 enforces CHECK constraint on `tool_type` | ✓ invalid type raises `IntegrityError` |
| `TypedToolRepository.get_by_id` returns an `EndMill`, not a dict | ✓ |
| A retrieved `Drill` does not have `corner_radius` as an attribute | ✓ |
| `_row_to_tool` uses `_TYPE_MAP` — adding a new type requires one dict entry | ✓ |

---

## Quick Check Answers

1. **Both live in the `tools` table.** `corner_radius` is a column in `tools`. For endmill rows it has a value. For drill rows it is `NULL`. The column exists on every row; it is just irrelevant (and NULL) for non-endmill rows.

2. **Not a problem** — it means "this field does not apply to this tool type." SQLite stores `NULL` and returns `NULL` when you read it. The Python layer (`_row_to_tool`) knows to skip NULL columns when constructing a `Drill` object. The `Drill` dataclass never receives `corner_radius` in its `__init__`, so the attribute simply doesn't exist on the Python object.

3. **CHECK prevents invalid `tool_type` string values.** `NOT NULL` only prevents missing values. `CHECK (tool_type IN (...))` prevents someone from inserting `tool_type = 'lathe'` or `tool_type = 'xyz'` — values that would confuse `_row_to_tool` and cause it to return `None`. The constraint encodes the domain's valid values in the database itself, not just in application code.
