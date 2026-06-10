# Python Tool Database — LAB 43 — What is an ORM and the Impedance Mismatch

**Prerequisites:** Lab 42. You have a working application: typed tool objects, a database, a UI. Every SQL query in this project was written by hand. This lesson explains why ORMs exist, what they trade away, and how SQLAlchemy is structured — before touching a single line of SQLAlchemy code.

**What this lab adds:**
- The impedance mismatch: why objects and tables don't naturally fit together
- What an ORM does (and does not do)
- The cost: generated SQL you didn't write
- SQLAlchemy's two layers: Core and ORM
- When to bypass the ORM entirely

**Time:** 20–25 minutes (concept only — no code to run)

---

> **Quick Check — try to answer before reading:**
>
> 1. You have a `Tool` Python object. It has methods (`describe()`, `type_name()`), identity (same object == same tool), and inheritance (`EndMill` is a `Tool`). A database row has none of these. Name the three things a row *cannot* have that an object can.
> 2. An ORM writes SQL for you. You insert a tool by calling `session.add(tool)`. What SQL does the ORM generate? Can you see it?
> 3. You have a query that joins five tables, uses a window function, and groups by month. Should you use the ORM or raw SQL?
>
> *(Answers at the end)*

---

## The Impedance Mismatch

"Impedance mismatch" comes from electrical engineering — two circuits with different impedances lose energy at the connection. In software it means: the relational model and the object model represent data differently, and translating between them takes effort.

Here is what each model provides:

| Object model | Relational model |
|---|---|
| Identity — `tool_a is tool_b` | Primary key — `id = 42` |
| Inheritance — `EndMill extends Tool` | No inheritance — just rows |
| Behavior — `tool.calculate_sfm()` | No behavior — just data |
| Graphs — `tool.holder.job.customer` | Joins with explicit ON clauses |
| Nullable by default — `None` | Nullable by schema — `NULL` |

When you write raw SQL, you manage the translation yourself:
- SQL gives you a row dict → you construct a Python object
- You modify the Python object → you write an UPDATE statement
- You add a relationship → you write a JOIN

This is what you have been doing since Lesson 12. You are good at it now.

An ORM automates this translation. You work with Python objects; the ORM generates the SQL. The mismatch doesn't disappear — the ORM just handles it for you.

---

## What an ORM Does

```
Without ORM:                      With ORM:
────────────────────────────────  ────────────────────────────────
conn.execute(                     session.add(EndMill(
  "INSERT INTO tools (...) "        name="EM-0500",
  "VALUES (?,?,?)",                 diameter_inches=0.5,
  ("EM-0500", 0.5, "carbide")       material="carbide"
)                                 ))
                                  session.commit()
```

The ORM generates the INSERT statement from the object's attributes and the model declaration. You never write the SQL.

Going the other direction:

```
Without ORM:                      With ORM:
────────────────────────────────  ────────────────────────────────
row = conn.execute(               tool = session.get(Tool, 42)
  "SELECT * FROM tools            # → EndMill object
   WHERE id = ?", (42,)
).fetchone()
tool = EndMill(                   print(tool.name)
  name=row["name"], ...           print(tool.corner_radius)
)
```

The ORM turns a row back into the right Python object automatically.

---

## The Cost

Nothing is free. The ORM costs you:

**Opacity.** You call `session.add(tool)` but you did not write the INSERT. If the generated SQL is wrong or slow, you have to diagnose it indirectly.

**Loss of control.** `tool.holder` looks like a simple attribute access. It may trigger a SQL query you didn't ask for. In a loop over 100 tools, that is 100 SQL queries you didn't know you were running.

**Learning curve.** SQLAlchemy has its own vocabulary (Session, Unit of Work, identity map, lazy vs eager loading). It takes time to build the mental model.

**The reason you learned raw SQL first:** Every time something goes wrong with SQLAlchemy, you will diagnose it by looking at the generated SQL. You cannot debug SQL you cannot read. You can read it now — that is your advantage.

---

## SQLAlchemy's Two Layers

SQLAlchemy has two distinct layers that can be used independently:

**Core** — the SQL expression language. You build SQL programmatically without writing strings:
```python
from sqlalchemy import select, and_
stmt = select(tools_table).where(
    and_(tools_table.c.material == "carbide", tools_table.c.diameter_inches > 0.5)
)
```
This generates `SELECT * FROM tools WHERE material = 'carbide' AND diameter_inches > 0.5`. It is type-safe and composable but not object-oriented.

**ORM** — built on top of Core. Adds the class-to-table mapping, sessions, and relationships:
```python
stmt = select(Tool).where(Tool.material == "carbide", Tool.diameter_inches > 0.5)
tools = session.scalars(stmt).all()  # returns EndMill/Drill objects, not rows
```

This project uses the ORM. But when a query is too complex for the ORM, you drop to Core (or raw SQL via `text()`). The layers coexist — use whichever fits the problem.

---

## When to Bypass the ORM

Use raw SQL or Core when:

- The query has `GROUP BY` + `HAVING` + window functions — the ORM supports these but the code becomes hard to read
- You are inserting or updating thousands of rows — the ORM's per-object overhead adds up; `executemany` is faster
- You need `RETURNING` or database-specific features
- You are writing a reporting query that aggregates across many tables

The ORM is not a barrier to raw SQL. You will see `session.execute(text("SELECT ..."))` in SQLAlchemy codebases. It is not a failure to use it.

---

## Install

```
pip install sqlalchemy
```

Verify:

```python
python -c "import sqlalchemy; print(sqlalchemy.__version__)"
```

This project requires SQLAlchemy 2.0 or later. The API changed significantly from 1.x — older tutorials may show the `session.query()` style, which is deprecated. We use the 2.0 `select()` style throughout.

---

## Looking Ahead

The next four lessons build the SQLAlchemy layer alongside the existing raw SQL layer. You will not delete the existing code immediately — for a while both exist, and you can compare them directly. At the end of Block 5 you decide which layer drives the production code.

---

## Quick Check Answers

1. **Behavior** (methods), **inheritance** (is-a relationships), **identity** (two references to the same row being the same object in memory). A database row is data only — no methods, no subclassing, and two queries for the same row produce two independent dicts.

2. **SQLAlchemy generates `INSERT INTO tools (name, diameter_inches, material, ...) VALUES (?, ?, ?, ...)`**, with the values taken from the object's attributes. You can see it by passing `echo=True` to the engine — every SQL statement is printed to stdout. This is the most important debugging tool in SQLAlchemy.

3. **Raw SQL.** The ORM handles CRUD and straightforward joins well. Complex analytical queries — window functions, grouping, CTEs — become contorted in ORM syntax. SQLAlchemy supports them, but the generated SQL is easier to write by hand and the raw SQL version is more readable and maintainable.
