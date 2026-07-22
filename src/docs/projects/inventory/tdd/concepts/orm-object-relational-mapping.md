# Concept: Object-Relational Mapping (ORM)

**What you'll understand by the end:** what an ORM actually does — and doesn't do — underneath its class-based syntax, and why it's an abstraction layer over SQL rather than a replacement for it.

**Prerequisites:** `sql-create-table-and-schema.md`, `python-classes-instances.md`.

## Setup

Python 3, plus a real ORM library:
```
pip install sqlalchemy
```

## The Problem

Writing raw SQL strings works, but couples every piece of application code that touches the database to that exact SQL dialect's syntax, and to string-building discipline that must be gotten right (parameterized correctly, see `sql-parameterized-queries-injection.md`) every single time. Something that lets a table's structure and its queries be expressed as ordinary Python — classes, attributes, comparisons — while still ultimately running real, correct SQL underneath, removes an entire category of syntax and safety concerns from everyday application code.

## The Isolated Example

Raw SQL:
```python
import sqlite3
connection = sqlite3.connect(":memory:")
connection.execute("CREATE TABLE pets (id INTEGER PRIMARY KEY, name TEXT, age INTEGER)")
connection.execute("INSERT INTO pets (name, age) VALUES (?, ?)", ("Rex", 3))
connection.commit()
rows = connection.execute("SELECT * FROM pets WHERE age > ?", (2,)).fetchall()
print([tuple(r) for r in rows])
```

The same thing, through an ORM:
```python
from sqlalchemy import create_engine, select
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, Session

class Base(DeclarativeBase):
    pass

class Pet(Base):
    __tablename__ = "pets"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str]
    age: Mapped[int]

engine = create_engine("sqlite:///:memory:")
Base.metadata.create_all(engine)

with Session(engine) as session:
    session.add(Pet(name="Rex", age=3))
    session.commit()
    rows = session.execute(select(Pet).where(Pet.age > 2)).scalars().all()
    print([(p.id, p.name, p.age) for p in rows])
```

**Real output (both versions):**
```
[(1, 'Rex', 3)]
```

**Real, inspectable proof this is still "just SQL" underneath** (SQLAlchemy's own query-compilation, available directly):
```python
print(select(Pet).where(Pet.age > 2))
```
```
SELECT pets.id, pets.name, pets.age FROM pets WHERE pets.age > :age_1
```

**What this proves:** both versions produce the identical real result, and the ORM version's `select(Pet).where(Pet.age > 2)`, when printed, reveals real, ordinary SQL underneath — `Pet.age > 2` (a Python comparison) was compiled directly into `WHERE pets.age > :age_1` (a real, parameterized SQL clause). The ORM never bypasses SQL; it generates it.

## Mechanical Walkthrough

- A **declarative model** (`class Pet(Base): ...`) maps a Python class directly to a database table — each class attribute (`id`, `name`, `age`) maps to a real column, and each instance of the class (`Pet(name="Rex", age=3)`) maps to a real row.
- **Class-level attribute comparisons** (`Pet.age > 2`) don't perform a comparison directly — `Pet.age` is a special descriptor object the ORM provides specifically so that writing `>` against it produces a real, structured representation of "compare this column," which the ORM later compiles into actual SQL — this only works because the ORM overrides Python's own comparison operators on these special column-attribute objects.
- A **Session** manages a real, live database connection and tracks pending changes (added objects, modified attributes) until explicitly committed — the object-relational equivalent of a raw connection plus its transaction state (see `sql-transactions-and-commit.md`).
- The ORM's generated SQL is always correctly parameterized — there is no string-concatenation step anywhere in this model for a developer to get wrong, which is a real, structural safety improvement over raw SQL, where parameterization is a discipline that must be applied correctly every single time by hand.

## CS Lens

An ORM is an **abstraction layer** translating between two different representations of the same information — Python objects and relational rows — in both directions: Python code becomes generated SQL going one way, and SQL result rows become real Python objects coming back. This is structurally similar to `lexer-preprocessing-before-parsing.md`'s text-to-structure direction, just applied between two already-structured representations (objects and rows) rather than between raw text and structure.

Also recognized in: essentially every major language's standard ORM (Django's ORM, Ruby's ActiveRecord, Java's Hibernate, C#'s Entity Framework) — the same underlying pattern (classes standing in for tables, attribute comparisons standing in for `WHERE` clauses) recurs nearly universally, because the impedance mismatch between object-oriented code and relational storage is a genuinely common, recurring problem across the industry.

## SE Lens

The real, honest cost of an ORM: a genuine new dependency, a real learning curve, and a real layer of indirection between what a developer types and what SQL actually executes — trusting `select(Pet).where(Pet.age > 4)` to generate a safe, correct query is much easier to do responsibly *after* having written the equivalent raw SQL by hand first (see `sql-insert-select-where.md`), so nothing it generates is a mystery. The real, concrete payoff in exchange: application code becomes independent of which specific SQL dialect is actually running underneath — switching database engines entirely (SQLite in development, PostgreSQL in production, a real, common real-world pattern) can require changing nothing but a connection string (see `database-connection-url.md`), with every model and query untouched.

## Connection

Builds on `sql-create-table-and-schema.md`, `sql-insert-select-where.md`, and `python-classes-instances.md`. `database-connection-url.md`, `sqlalchemy-mapped-column-types.md`, `orm-session-unit-of-work.md`, and `orm-query-builder-select-where.md` each cover one specific mechanical piece of the fuller picture introduced here.

## Try It Yourself

1. Print `str(select(Pet).where(Pet.age > 2).order_by(Pet.name))` and compare the generated SQL text against what you would have written by hand for the equivalent raw query — confirming the ORM's real output matches real, correct SQL syntax.
2. Deliberately compare a model's class attribute against another Python variable in an unexpected way (`if Pet.age > 2:` outside of a query context, not inside `.where(...)`) and observe what it actually evaluates to (a special SQLAlchemy expression object, not a real boolean) — a real, worth-knowing quirk of how operator overriding for query-building works.
3. Look up SQLAlchemy's "Core" API (a lower-level layer beneath the ORM, working directly with tables and raw expressions rather than declarative classes) and compare a simple query written both ways — reasoning about when working closer to the raw SQL layer might be preferable to the full declarative-class ORM style shown here.
