# Concept: ORM Query Construction (`select`/`where`/`scalar_one_or_none`)

**What you'll understand by the end:** how an ORM lets you build a real SQL query using ordinary Python expressions, and how to correctly express "expecting exactly one result" versus "expecting zero or one" versus "expecting many."

**Prerequisites:** `orm-object-relational-mapping.md`, `sql-insert-select-where.md`.

## Setup

Python 3, plus SQLAlchemy:
```
pip install sqlalchemy
```

## The Problem

Retrieving data through an ORM needs a way to express filtering conditions, ordering, and how many results are actually expected — all as real Python code, type-checked and free of string-building, rather than falling back to raw SQL strings the moment a query needs to be more specific than "give me everything."

## The Isolated Example

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
    session.add_all([Pet(name="Rex", age=3), Pet(name="Milo", age=5)])
    session.commit()

    all_pets = session.execute(select(Pet).order_by(Pet.age)).scalars().all()
    print("all:", [p.name for p in all_pets])

    one = session.execute(select(Pet).where(Pet.name == "Rex")).scalar_one_or_none()
    print("found:", one.name if one else None)

    missing = session.execute(select(Pet).where(Pet.name == "Fido")).scalar_one_or_none()
    print("missing:", missing)
```

**Real output:**
```
all: ['Rex', 'Milo']
found: Rex
missing: None
```

**What this proves:** `select(Pet).order_by(Pet.age)` and `.where(Pet.name == "Rex")` — pure Python expressions using real class attributes and real operators — correctly filtered and sorted real data, and `.scalar_one_or_none()` correctly distinguished "found exactly one" from "found none" without raising an error for the missing case.

## Mechanical Walkthrough

- `select(Model)` builds a query object targeting that model's table — nothing runs yet; it's a real, inspectable description of a query, not an executed action.
- `.where(Model.column == value)` (or `>`, `<`, `!=`, and more) adds a filtering condition — the comparison is between a special column-attribute object and a real value, which SQLAlchemy compiles into a real, parameterized SQL `WHERE` clause, never string-built.
- `.order_by(Model.column)` adds sorting, the direct equivalent of raw SQL's `ORDER BY` (see `sql-insert-select-where.md`).
- `session.execute(query)` actually runs the query against the database; `.scalars()` unwraps each raw result row down to the real model object itself (rather than a one-element-tuple wrapper SQLAlchemy would otherwise return); `.all()` collects every matching result into a real Python list.
- `.scalar_one_or_none()` is a terminal method expecting **zero or one** result: returns the single object if exactly one row matched, `None` if none matched, and raises a real error if *more than one* row matched — correctly treating an unexpected duplicate as a genuine data problem rather than silently picking one arbitrarily. `.scalar_one()` is the stricter sibling, raising an error instead of returning `None` when nothing matches — the correct choice specifically when "nothing found" itself should be treated as an error, not a normal, expected outcome.

## Execution Trace

Three real queries against the same two-row table
(`Pet(name="Rex", age=3)`, `Pet(name="Milo", age=5)`), traced against
the real output above:

- select(Pet).order_by(Pet.age):
  rows sorted by age ascending: Rex(3), Milo(5)
  .scalars().all() → [Pet(Rex), Pet(Milo)]
  → prints "all: ['Rex', 'Milo']"

- select(Pet).where(Pet.name == "Rex"):
  checks Rex: name == "Rex"? Yes → matches
  checks Milo: name == "Rex"? No → excluded
  exactly 1 match → .scalar_one_or_none() returns Pet(Rex), not None
  → prints "found: Rex"

- select(Pet).where(Pet.name == "Fido"):
  checks Rex: name == "Fido"? No → excluded
  checks Milo: name == "Fido"? No → excluded
  0 matches → .scalar_one_or_none() returns None (not an error)
  → prints "missing: None"

The third query is the one worth noticing: zero rows matching is a
real, valid outcome `.scalar_one_or_none()` is specifically built to
handle without raising — the same query run with `.scalar_one()`
instead would have raised `NoResultFound` on this exact input.

## CS Lens

This is a **fluent, composable query-building API** — each method (`.where(...)`, `.order_by(...)`) returns a new, extended query object, letting a complex query be built up incrementally from smaller, independently-understandable pieces, while remaining entirely inert (nothing executes) until a terminal method (`session.execute(...)`, then `.scalars()`/`.scalar_one_or_none()`/etc.) actually runs it. This lazy-construction-then-explicit-execution shape recurs anywhere a query or computation is built up as data before being run.

Also recognized in: JavaScript's own promise chains before `await` (see `typescript-async-await.md` — a `Promise` describes pending work, distinct from having actually run it), and other query-builder libraries across many languages/ORMs following this identical incremental, composable construction pattern.

## SE Lens

Choosing the right terminal method for how many results are actually expected is a real, meaningful correctness choice, not a stylistic one: using `.scalar_one_or_none()` where exactly one result should always exist silently tolerates a missing row that should have been treated as an error; using `.scalar_one()` where "not found" is a normal, expected case (a lookup by a possibly-nonexistent name, for instance) turns an ordinary "not found" outcome into an unnecessary crash. Matching the method to the real, actual cardinality expected is what makes a query's failure modes match its actual meaning.

## Connection

Builds on `orm-object-relational-mapping.md` and `sql-insert-select-where.md`. `orm-session-unit-of-work.md` covers the `Session` object these query methods are called through.

## Try It Yourself

1. Insert two `Pet`s with the identical name, then call `.scalar_one_or_none()` for that name — read the real error raised, and reason about why this behavior (erroring on more-than-one, rather than silently returning the first) is the correct default for a method whose name promises "one or none."
2. Call `.scalar_one()` (not `_or_none`) against a name that doesn't exist, and read the real `NoResultFound` error — then rewrite the same lookup using `.scalar_one_or_none()` and handle the `None` case explicitly instead, comparing the two approaches for a case where "not found" is a normal, expected outcome.
3. Chain `.where(...)` twice in a row (`select(Pet).where(Pet.age > 2).where(Pet.name != "Milo")`) and confirm both conditions apply together (as an implicit `AND`) — then look up SQLAlchemy's `and_()`/`or_()` functions for explicitly combining conditions with `OR` instead.
