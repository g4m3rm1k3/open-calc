# Python Tool Database — LAB 48 — Querying with SQLAlchemy

**Prerequisites:** Lab 47. You have polymorphic ORM models: `ToolORM`, `EndMillORM`, `DrillORM`, `FaceMillORM`. This lesson makes you fluent with the SQLAlchemy 2.0 query style — `select()`, `where()`, `join()`, ordering, limiting — and shows exactly why the output matches the SQL you already know how to write.

**What this lab adds:**
- `select()` as a statement builder — columns, aliases, expressions
- `.where()` with single conditions and compound `and_()` / `or_()`
- `.join()` — explicit joins that mirror your Lesson 15 SQL
- `.scalars()` vs `.execute()` — when you want objects vs rows
- `scalar_one_or_none()` — the safe single-row fetch
- Side-by-side: the same query written as raw SQL and SQLAlchemy

**Time:** 50–65 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. `session.scalars(select(ToolORM))` vs `session.execute(select(ToolORM))` — what does each return? When would you use `execute` instead of `scalars`?
> 2. You write `select(ToolORM).where(ToolORM.diameter_inches > 0.5, ToolORM.material == "carbide")`. What SQL does the `.where()` generate for two conditions passed together?
> 3. `scalar_one_or_none()` vs `first()` — both return at most one object. What happens when two rows match?
>
> *(Answers at the end)*

---

## The select() Statement

In SQLAlchemy 2.0, every query starts with `select()`. It is a statement object you build up by chaining methods — nothing runs until you hand it to a session.

```python
from sqlalchemy import select
from tooldb.orm.models import ToolORM

stmt = select(ToolORM)                         # SELECT tools_orm.*
stmt = stmt.where(ToolORM.material == "carbide")  # WHERE material = 'carbide'
stmt = stmt.order_by(ToolORM.diameter_inches)     # ORDER BY diameter_inches
stmt = stmt.limit(10)                             # LIMIT 10
```

The statement is immutable — each method returns a new statement. This means you can build partial statements and reuse them:

```python
base = select(ToolORM).where(ToolORM.material == "carbide")

small_carbide = base.where(ToolORM.diameter_inches < 0.5)
large_carbide = base.where(ToolORM.diameter_inches >= 0.5)
```

`base` is unchanged. You composed two queries from one foundation.

---

## Step 1 — Basic Queries Side by Side

Here is the same query written both ways. Use `echo=True` to confirm they generate identical SQL.

**Raw SQL (from Lesson 12):**
```python
import sqlite3
conn = sqlite3.connect("tools_orm_demo.db")
rows = conn.execute(
    "SELECT id, name, diameter_inches FROM tools_orm "
    "WHERE material = ? ORDER BY diameter_inches DESC",
    ("carbide",)
).fetchall()
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

Generated SQL (from `echo=True`):
```sql
SELECT tools_orm.id, tools_orm.name, tools_orm.diameter_inches, ...
FROM tools_orm
WHERE tools_orm.material = ?
ORDER BY tools_orm.diameter_inches DESC
```

Same query. The ORM version returns `ToolORM` objects; the raw version returns `Row` tuples. The SQL is identical.

---

## Step 2 — Compound Conditions

Two conditions on `.where()` are ANDed automatically:

```python
# Both conditions — AND
stmt = select(ToolORM).where(
    ToolORM.material == "carbide",
    ToolORM.diameter_inches > 0.5
)
# SQL: WHERE material = ? AND diameter_inches > ?
```

For explicit OR, import `or_`:

```python
from sqlalchemy import or_

stmt = select(ToolORM).where(
    or_(ToolORM.material == "carbide", ToolORM.material == "HSS")
)
# SQL: WHERE material = ? OR material = ?
```

For more complex expressions, `and_` makes structure explicit:

```python
from sqlalchemy import and_

stmt = select(ToolORM).where(
    and_(
        ToolORM.material == "carbide",
        or_(
            ToolORM.diameter_inches < 0.25,
            ToolORM.diameter_inches > 1.0
        )
    )
)
# SQL: WHERE material = ? AND (diameter_inches < ? OR diameter_inches > ?)
```

This is identical in structure to the SQL from Lesson 13. The parentheses around OR sub-expressions are handled automatically.

---

## Step 3 — Filtering by Subclass

Because of polymorphic inheritance (Lesson 47), you can filter by ORM class directly:

```python
# All tools — mix of types
all_tools = session.scalars(select(ToolORM)).all()

# Only endmills — WHERE tool_type IN ('endmill') added automatically
endmills = session.scalars(select(EndMillORM)).all()

# Only endmills with corner radius > 0
profiling = session.scalars(
    select(EndMillORM).where(EndMillORM.corner_radius > 0)
).all()
# SQL: WHERE tool_type IN ('endmill') AND corner_radius > ?
```

The `WHERE tool_type IN (...)` clause comes free from `polymorphic_identity`. You get type safety in the result — `profiling` contains `EndMillORM` objects, not generic `ToolORM` objects.

---

## Step 4 — `scalars()` vs `execute()`

`session.scalars(stmt)` and `session.execute(stmt)` both run the query. The difference is what you get back.

```python
# scalars() — unwraps the result to give you ORM objects directly
tools = session.scalars(select(ToolORM)).all()
# tools is a list[ToolORM]

for t in tools:
    print(t.name)          # attribute access on the object
```

```python
# execute() — gives you Row objects (like sqlite3's Row)
result = session.execute(select(ToolORM)).all()
# result is a list[Row]

for row in result:
    obj = row[0]           # first column is the ORM object
    print(obj.name)
```

When you pass an ORM class to `select()`, `execute()` wraps each result in a `Row` with one column. That is why `scalars()` exists — it unwraps the single-column Row for you.

When would you use `execute()` instead? When you select multiple things:

```python
from sqlalchemy import func

# Selecting both an ORM object and an aggregate
stmt = (
    select(ToolORM, func.count(ToolORM.id))
    .group_by(ToolORM.material)
)

for tool, count in session.execute(stmt):
    print(f"{tool.material}: {count}")
```

Here `execute()` returns rows with two columns, and tuple unpacking works naturally. `scalars()` would only give you the first column.

The rule: **use `scalars()` when selecting one ORM class; use `execute()` when selecting multiple things**.

---

## Step 5 — Single-Row Fetches

Three patterns for fetching one row:

```python
# Pattern 1: get by primary key — fastest, uses identity map
tool = session.get(ToolORM, 42)
# Returns None if not found. Does NOT hit the database if already cached.

# Pattern 2: first() — returns the first result or None, no error if many match
tool = session.scalars(
    select(ToolORM).where(ToolORM.name == "EM-0500").limit(1)
).first()
# Fine for "find any example of X"

# Pattern 3: scalar_one_or_none() — returns None if zero rows, raises if more than one
tool = session.scalars(
    select(ToolORM).where(ToolORM.name == "EM-0500")
).one_or_none()
# Use when name is supposed to be unique — the error tells you there's a data bug
```

The difference between `first()` and `one_or_none()` matters:

```python
# Both return a tool when there is exactly one match.
# When there are two matches:
#   .first()          → silently returns the first one
#   .one_or_none()    → raises MultipleResultsFound

# For unique fields (name, serial number), one_or_none is safer.
# It tells you when your UNIQUE constraint has been violated or bypassed.
```

---

## Step 6 — JOIN Queries

SQLAlchemy can join using the relationship you defined in Lesson 46:

```python
from sqlalchemy.orm import joinedload

# Eager join — get tools with their holders in one query
tools = session.scalars(
    select(ToolORM).options(joinedload(ToolORM.holder))
).all()

for t in tools:
    holder_name = t.holder.name if t.holder else "no holder"
    print(f"{t.name} → {holder_name}")
```

Or you can write an explicit join — useful when filtering on the joined table:

```python
from tooldb.orm.models import HolderORM

# Find all tools in BT30 holders — explicit JOIN + WHERE
tools = session.scalars(
    select(ToolORM)
    .join(ToolORM.holder)                          # JOIN on the relationship
    .where(HolderORM.taper == "BT30")
).all()
```

Generated SQL:
```sql
SELECT tools_orm.*
FROM tools_orm
JOIN holders_orm ON holders_orm.id = tools_orm.holder_id
WHERE holders_orm.taper = ?
```

This is exactly the JOIN from Lesson 15. The relationship attribute (`ToolORM.holder`) provides the ON clause.

---

## Step 7 — Aggregation

For counts and grouping, use `func`:

```python
from sqlalchemy import func, select

with SessionLocal() as session:
    # Count by material
    rows = session.execute(
        select(ToolORM.material, func.count(ToolORM.id).label("count"))
        .group_by(ToolORM.material)
        .order_by(func.count(ToolORM.id).desc())
    ).all()

    for material, count in rows:
        print(f"{material}: {count}")
```

Generated SQL:
```sql
SELECT tools_orm.material, count(tools_orm.id) AS count
FROM tools_orm
GROUP BY tools_orm.material
ORDER BY count(tools_orm.id) DESC
```

Again: the same SQL you wrote in Lesson 14, generated from the expression. Notice `execute()` here — we are selecting two columns (material + count), not one ORM object.

---

## Step 8 — SAVE AND TRY

**Write a query that returns all endmills with `corner_radius > 0`, sorted by `helix_angle` descending.** Verify with `echo=True` that the generated SQL includes `WHERE tool_type IN ('endmill') AND corner_radius > ?`.

**Then write the same query as raw SQL** using `conn.execute()`. Compare the two. They should return the same rows in the same order.

**Break it deliberately.** Call `.one_or_none()` on a query that you know returns more than one row. Read the exception message — `MultipleResultsFound: Multiple rows were found when exactly one was required`. This is the exception you want to see before production.

---

## Concept: Why Expression-Based Queries

Hand-written SQL is fine for most of this project. Why bother with the expression API?

**Composability.** You can build a `base_query` and layer conditions programmatically:

```python
def search_tools(material=None, min_diameter=None, tool_type=None):
    stmt = select(ToolORM)
    if material:
        stmt = stmt.where(ToolORM.material == material)
    if min_diameter is not None:
        stmt = stmt.where(ToolORM.diameter_inches >= min_diameter)
    if tool_type:
        stmt = stmt.where(ToolORM.tool_type == tool_type)
    return stmt
```

With raw SQL you would concatenate strings and track bind parameters manually. With the expression API, you compose. The parameterization is automatic and injection-safe.

**Introspection.** You can inspect what the query will do before running it:

```python
stmt = search_tools(material="carbide", min_diameter=0.5)
print(stmt.compile(compile_kwargs={"literal_binds": True}))
# SELECT tools_orm.id, ... WHERE tools_orm.material = 'carbide' AND ...
```

This is useful for debugging search functions — print the compiled SQL, paste it into a database browser.

---

## Challenge

Write `search_tools(session, **kwargs)` that accepts any combination of `material`, `min_diameter`, `max_diameter`, `tool_type`, `has_holder` (bool). Return a list of `ToolORM` objects. For `has_holder=True`, add `.join(ToolORM.holder)` to the statement; for `has_holder=False`, filter `where(ToolORM.holder_id == None)`.

<details>
<summary>Answer</summary>

```python
from sqlalchemy import select
from tooldb.orm.models import ToolORM, HolderORM


def search_tools(session, material=None, min_diameter=None,
                 max_diameter=None, tool_type=None, has_holder=None):
    stmt = select(ToolORM)

    if material:
        stmt = stmt.where(ToolORM.material == material)
    if min_diameter is not None:
        stmt = stmt.where(ToolORM.diameter_inches >= min_diameter)
    if max_diameter is not None:
        stmt = stmt.where(ToolORM.diameter_inches <= max_diameter)
    if tool_type:
        stmt = stmt.where(ToolORM.tool_type == tool_type)
    if has_holder is True:
        stmt = stmt.join(ToolORM.holder)
    elif has_holder is False:
        stmt = stmt.where(ToolORM.holder_id == None)

    return session.scalars(stmt).all()
```

The `has_holder=None` case (neither True nor False) skips the filter entirely — return all tools regardless of holder status. `has_holder=False` uses `== None` which SQLAlchemy converts to `IS NULL` in SQL.

</details>

---

## Final Check

| | |
|--|--|
| `select(ToolORM).where(A, B)` generates `WHERE A AND B` | ✓ |
| `or_()` and `and_()` for explicit boolean structure | ✓ |
| `scalars()` unwraps single-ORM-class results; `execute()` for multi-column | ✓ |
| `one_or_none()` raises on multiple matches; `first()` silently picks one | ✓ |
| `.join(ToolORM.holder)` uses the relationship's ON clause | ✓ |
| `func.count()` with `group_by()` for aggregation | ✓ |

---

## Quick Check Answers

1. **`scalars()` returns an iterable of ORM objects directly.** `execute()` returns an iterable of `Row` objects — each row is a tuple-like container. When you `select(ToolORM)`, each `Row` has one element: the ORM object at index `[0]`. Use `execute()` when you select multiple expressions per row (e.g., an ORM object + a `func.count()`), so tuple unpacking works naturally. Use `scalars()` when you only want one ORM class per row.

2. **Two conditions passed to `.where()` are ANDed:** `WHERE material = ? AND diameter_inches > ?`. This is equivalent to `.where(and_(ToolORM.material == "carbide", ToolORM.diameter_inches > 0.5))` — the comma syntax is shorthand for `and_()`.

3. **`one_or_none()` raises `MultipleResultsFound` when two rows match.** `first()` silently returns the first row without error. For fields that should be unique (names, serial numbers), `one_or_none()` is the safer choice — a `MultipleResultsFound` exception tells you your uniqueness assumption is wrong, rather than silently returning arbitrary data.
