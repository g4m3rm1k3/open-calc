# Concept: SQLAlchemy's `Mapped[T]` and `mapped_column`

**What you'll understand by the end:** how a Python type annotation on a class attribute doubles as a real database column definition, and how to mark a column nullable.

**Prerequisites:** `orm-object-relational-mapping.md`, `typescript-type-annotations.md` (for the general idea of a type annotation, in a different language).

## Setup

Python 3, plus SQLAlchemy:
```
pip install sqlalchemy
```

## The Problem

Defining a table's columns twice — once as real SQL (`CREATE TABLE ... age INTEGER NOT NULL`) and again as a separate Python-side description of that same shape (a dict, a dataclass) — duplicates the same structural information in two places that must be kept manually in sync. Something needs to let one single, real Python declaration serve as both.

## The Isolated Example

```python
from sqlalchemy import create_engine, inspect
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column

class Base(DeclarativeBase):
    pass

class Pet(Base):
    __tablename__ = "pets"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str]
    age: Mapped[int]
    nickname: Mapped[str | None]

engine = create_engine("sqlite:///:memory:")
Base.metadata.create_all(engine)

for column in inspect(engine).get_columns("pets"):
    print(column["name"], column["type"], "nullable" if column["nullable"] else "required")
```

**Real output:**
```
id INTEGER required
name VARCHAR required
age INTEGER required
nickname VARCHAR nullable
```

**What this proves:** every column's real, generated SQL type and nullability came directly from the Python annotation alone — `name: Mapped[str]` (no `| None`) produced a real `NOT NULL` constraint automatically; `nickname: Mapped[str | None]` produced a nullable one — with no separate SQL written anywhere to state either fact.

## Mechanical Walkthrough

- `attribute: Mapped[T]` is a real Python type annotation (checked by tools like `mypy`) that SQLAlchemy also reads at class-definition time to determine the real column's SQL type — `Mapped[int]` → SQL `INTEGER`, `Mapped[str]` → SQL `VARCHAR`/`TEXT` (the exact SQL type chosen depends on the target database dialect).
- `mapped_column(...)` is used when a column needs configuration beyond what the type alone conveys — `primary_key=True`, an explicit `String` length, a default value, or an explicit column name different from the attribute's own name. A bare `Mapped[T]` with no `mapped_column(...)` at all (as `name`/`age` show) still works — SQLAlchemy infers a sensible column definition from the annotation alone.
- `Mapped[T | None]` (a union with `None`, see `typescript-union-types.md` for the identical union idea in a different language) is specifically what marks a column **nullable** — its *absence* is what makes a column `NOT NULL` by default, inverting what might be the more intuitive default (most languages default parameters to required unless marked otherwise; here, the union with `None` is the explicit opt-in to nullability).
- This is a real, direct application of the same "derive one thing from another, don't duplicate" instinct `typescript-typeof-returntype-utility.md` describes — a single Python type annotation is the one true source both a type checker and a real database schema draw from.

## CS Lens

This is **type-driven schema generation** — the same annotation a type checker uses for static analysis is *also* consumed by SQLAlchemy at runtime to determine real database structure, collapsing what could have been two separate, independently-maintained descriptions (a type annotation for the type checker, a schema definition for the database) into exactly one. This reflects a broader pattern of deriving multiple real artifacts from one canonical source, rather than hand-synchronizing several parallel descriptions of the same underlying fact.

Also recognized in: GraphQL schema-first code generation (one schema definition generates both server-side types and client-side query types), and other modern ORMs that similarly read a language's own type system to infer database structure (TypeScript ORMs like Prisma or Drizzle do the analogous thing for TypeScript's own type annotations).

## SE Lens

The real, practical payoff: a column's type and nullability can never silently drift out of sync between "what the type checker believes" and "what the database actually enforces," because both are read from the exact same declaration. The real, honest limit, worth naming: this only governs a column's *initial creation* — changing an existing table's column type or nullability later (an `ALTER TABLE`) is a real, separate migration concern this mechanism doesn't handle on its own, the same limitation `sql-create-table-and-schema.md` already names for `CREATE TABLE IF NOT EXISTS`.

## Connection

Builds on `orm-object-relational-mapping.md`. Directly relevant to `python-custom-exceptions.md`'s neighboring idea of a value's type carrying real, enforced meaning — here extended so a type annotation carries real, enforced *storage* meaning too, not just in-memory behavior.

## Try It Yourself

1. Add a new attribute with `mapped_column(String(50))` (an explicit maximum length) and inspect the generated column — comparing it against a bare `Mapped[str]` column's generated type, to see what the explicit configuration added.
2. Try creating a `Pet` instance without setting `nickname` at all (`Pet(name="Rex", age=3)`), insert it, and confirm it stores as SQL `NULL`, read back as Python `None` — direct proof the mapping works correctly in both directions.
3. Remove `| None` from an attribute that a real insert then omits, and observe the real error SQLAlchemy raises attempting to insert a row missing a required value — confirming the generated `NOT NULL` constraint is genuinely enforced, not just documentation.
