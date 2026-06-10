# Python Tool Database — LAB 45 — Session and CRUD

**Prerequisites:** Lab 44. You have `ToolORM` and `HolderORM` models and an engine. Nothing has been inserted yet. This lesson adds, reads, updates, and deletes records — and shows you exactly what SQL each operation generates.

**What this lab adds:**
- `Session` — the unit of work that tracks changes
- `session.add()`, `session.commit()`, `session.get()`, `session.delete()`
- The identity map — why the same row always returns the same Python object
- `select()` for queries
- Comparing the ORM operations to the raw SQL you already know

**Time:** 50–60 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. You call `session.add(tool)` but not `session.commit()`. Is the row in the database? What happens when the session ends?
> 2. You call `session.get(ToolORM, 42)` twice in the same session. How many SQL queries are executed?
> 3. You do `tool.name = "New Name"` on an object inside a session. You have not called any `update()` method. How does SQLAlchemy know to generate an UPDATE?
>
> *(Answers at the end)*

---

## The Session: Unit of Work

A `Session` is a staging area. When you call `session.add(tool)`, SQLAlchemy remembers that this object needs to be inserted — but the INSERT doesn't run immediately. When you call `session.commit()`, SQLAlchemy flushes all pending changes to the database as one transaction.

This is the **Unit of Work** pattern: batch all related changes, then commit them atomically. If anything fails, the whole transaction rolls back.

```
session.add(tool_a)      →  queued (no SQL yet)
session.add(tool_b)      →  queued (no SQL yet)
session.commit()         →  INSERT tool_a; INSERT tool_b; COMMIT
```

---

## Step 1 — Creating a Session

Create `tooldb/orm/session.py`:

```python
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from tooldb.orm.models import Base

engine = create_engine("sqlite:///tools_orm_demo.db", echo=True)
Base.metadata.create_all(engine)

SessionLocal = sessionmaker(bind=engine)
```

`sessionmaker` is a factory that creates `Session` objects with the engine pre-configured. You call `SessionLocal()` each time you need a session.

---

## Step 2 — Insert

Create `tooldb/orm/crud_demo.py`:

```python
from tooldb.orm.session import SessionLocal
from tooldb.orm.models import ToolORM


def insert_tools():
    with SessionLocal() as session:
        t1 = ToolORM(name="EM-0500-4FL-C", diameter_inches=0.5, material="carbide", tool_type="endmill", flutes=4)
        t2 = ToolORM(name="DR-0250-HSS",   diameter_inches=0.25, material="HSS",     tool_type="drill")
        t3 = ToolORM(name="FM-1000-C",     diameter_inches=1.0,  material="carbide", tool_type="facemill")

        session.add(t1)
        session.add(t2)
        session.add(t3)
        # No SQL yet — objects are "pending"

        session.commit()
        # NOW: three INSERT statements run, then COMMIT

        print(f"IDs: {t1.id}, {t2.id}, {t3.id}")
        # After commit, SQLAlchemy populates t1.id from lastrowid
```

Run it:

```
python -c "from tooldb.orm.crud_demo import insert_tools; insert_tools()"
```

With `echo=True` you will see:

```sql
INSERT INTO tools_orm (name, diameter_inches, material, tool_type, flutes, notes) VALUES (?, ?, ?, ?, ?, ?)
INSERT INTO tools_orm (name, diameter_inches, material, tool_type, flutes, notes) VALUES (?, ?, ?, ?, ?, ?)
INSERT INTO tools_orm (name, diameter_inches, material, tool_type, flutes, notes) VALUES (?, ?, ?, ?, ?, ?)
COMMIT
```

Three INSERTs, one COMMIT. That is the unit of work in action — exactly what `with conn:` did in Lesson 16, but managed automatically.

---

## Step 3 — Read: `session.get()` and the Identity Map

```python
from sqlalchemy import select
from tooldb.orm.session import SessionLocal
from tooldb.orm.models import ToolORM


def read_tools():
    with SessionLocal() as session:
        # Get by primary key:
        tool = session.get(ToolORM, 1)
        print(tool)

        # Get by primary key again — same session:
        tool_again = session.get(ToolORM, 1)
        print(f"Same object? {tool is tool_again}")   # True

        # Query all tools:
        tools = session.scalars(select(ToolORM)).all()
        print(f"Total tools: {len(tools)}")

        # Query with filter:
        carbide = session.scalars(
            select(ToolORM).where(ToolORM.material == "carbide")
        ).all()
        print(f"Carbide tools: {len(carbide)}")
```

Run it and watch the SQL. Notice: `session.get(ToolORM, 1)` issues one SELECT. The second `session.get(ToolORM, 1)` issues **zero** SELECTs — SQLAlchemy returns the cached object. This is the **identity map**: within one session, the same primary key always returns the same Python object.

The SQL for the filtered query:
```sql
SELECT tools_orm.id, tools_orm.name, ... FROM tools_orm WHERE tools_orm.material = ?
```

That is exactly the SQL you would have written by hand. `ToolORM.material == "carbide"` generates `WHERE tools_orm.material = ?` with `"carbide"` as the bound parameter — parameterized, injection-safe.

---

## Step 4 — Update

```python
def update_tool():
    with SessionLocal() as session:
        tool = session.get(ToolORM, 1)
        print(f"Before: {tool.name}")

        tool.name = "EM-0500-UPDATED"
        # No call to session.update() — just assign the attribute

        session.commit()
        # SQLAlchemy detects the change and generates:
        # UPDATE tools_orm SET name=? WHERE tools_orm.id = ?
        print(f"After: {tool.name}")
```

SQLAlchemy's Session tracks every attribute change on objects it manages. When you commit, it compares the current state to the original state and generates `UPDATE` statements only for changed columns. This is called **change tracking** — it is automatic.

The generated SQL:
```sql
UPDATE tools_orm SET name=? WHERE tools_orm.id = ?
```

Notice it does not update all columns — only the changed ones. If you changed both `name` and `diameter_inches`, you would see both in the SET clause.

---

## Step 5 — Delete

```python
def delete_tool():
    with SessionLocal() as session:
        tool = session.get(ToolORM, 2)
        if tool:
            session.delete(tool)
            session.commit()
            # DELETE FROM tools_orm WHERE tools_orm.id = ?
```

`session.delete(tool)` marks the object for deletion. On commit, the DELETE runs. The object still exists in Python memory after the delete — it just has no corresponding database row.

---

## Step 6 — `with Session()` vs Manual Close

```python
# Pattern A: context manager (recommended)
with SessionLocal() as session:
    ...
    session.commit()
# session is automatically closed here

# Pattern B: manual
session = SessionLocal()
try:
    ...
    session.commit()
finally:
    session.close()
```

Pattern A is cleaner. The `with` block guarantees `session.close()` even if an exception occurs. If you forget to call `session.close()` on a long-running process, you leak database connections.

Note: `with Session()` does NOT automatically commit. You must call `session.commit()` explicitly. The `with` block only handles closing. This is intentional — you decide when a unit of work is complete.

---

## Step 7 — SAVE AND TRY: Side by Side

Run these two equivalent queries and compare their SQL output:

**Raw SQL (Lesson 12 style):**
```python
import sqlite3
conn = sqlite3.connect("tools_orm_demo.db")
rows = conn.execute(
    "SELECT id, name, diameter_inches FROM tools_orm WHERE material = ? ORDER BY diameter_inches DESC",
    ("carbide",)
).fetchall()
for row in rows:
    print(dict(row))
```

**SQLAlchemy ORM:**
```python
from sqlalchemy import select
from tooldb.orm.session import SessionLocal
from tooldb.orm.models import ToolORM

with SessionLocal() as session:
    tools = session.scalars(
        select(ToolORM)
        .where(ToolORM.material == "carbide")
        .order_by(ToolORM.diameter_inches.desc())
    ).all()
    for t in tools:
        print(t.id, t.name, t.diameter_inches)
```

The generated SQL (with `echo=True`):
```sql
SELECT tools_orm.id, tools_orm.name, tools_orm.diameter_inches, ...
FROM tools_orm
WHERE tools_orm.material = ?
ORDER BY tools_orm.diameter_inches DESC
```

Identical results. Different writing style. The ORM version chains method calls; the raw SQL version is a string. Both produce the same parameterized query.

---

## Concept: The Session's Three Object States

Every object in a SQLAlchemy session exists in one of three states:

```
Transient     →  add()  →  Pending     →  commit()  →  Persistent
(not in DB,              (queued for                  (in DB, session
not in session)          INSERT)                       tracking changes)

                                          delete()  →  Deleted
                                                       (committed)
                                                       →  Detached
```

When a session closes, `Persistent` objects become `Detached` — they are no longer tracked. Accessing a relationship on a detached object raises `DetachedInstanceError`. This is the most common beginner mistake with SQLAlchemy.

---

## Challenge

Write a function that updates a tool's material using the ORM, then verifies the change by re-reading from the database in a **new session** (to confirm it was actually persisted, not just in the identity map):

```python
def update_and_verify(tool_id: int, new_material: str) -> bool:
    """Returns True if the update was persisted."""
    with SessionLocal() as session:
        tool = session.get(ToolORM, tool_id)
        tool.material = new_material
        session.commit()

    # New session — no identity map cache
    with SessionLocal() as session:
        tool = session.get(ToolORM, tool_id)
        return tool.material == new_material
```

<details>
<summary>Why a new session for verification?</summary>

Within the same session, `session.get(ToolORM, tool_id)` would return the cached object from the identity map — which already has `material = new_material` because you just changed it. The cache makes it impossible to tell whether the value came from the database or from memory.

A new session has an empty identity map. The first `session.get()` must issue a SELECT. The result comes from the database. If the UPDATE was committed successfully, the SELECT returns the new value.

This pattern — open a second session to verify persistence — is also how you write correct tests for update operations.

</details>

---

## Final Check

| | |
|--|--|
| `session.add()` + `session.commit()` generates INSERT then COMMIT | ✓ |
| Two `session.get()` calls for the same ID in one session = one SELECT | ✓ identity map |
| Attribute assignment (`tool.name = "X"`) generates UPDATE on commit | ✓ change tracking |
| `session.delete()` + `session.commit()` generates DELETE | ✓ |
| Context manager closes session but does NOT auto-commit | ✓ understood |

---

## Quick Check Answers

1. **No — the row is not in the database until `session.commit()`.** `session.add()` marks the object as "pending." When the session ends without a commit (e.g., an exception, or `session.close()` without committing), the pending changes are rolled back. The database is unchanged.

2. **One SQL query** — on the first call. The second call returns the same Python object from the session's identity map without querying the database. This is an important performance characteristic: repeated `session.get()` calls in the same session are cheap.

3. **SQLAlchemy's Session instruments every attribute on managed objects.** When you do `tool.name = "New Name"`, SQLAlchemy's tracking mechanism records that `name` changed from the original value. On `session.commit()`, it compares the current attribute values to the original snapshot taken when the object was loaded, generates UPDATE statements for every changed attribute, and clears the snapshot. You never call `session.update()` because change tracking makes it unnecessary.
