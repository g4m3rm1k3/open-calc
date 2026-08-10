# Concept: ORM Cascade-Delete Inference vs. Explicit Core Deletes

**What you'll understand by the end:** a real failure mode in `relationship()`-based deletes — where the ORM's automatic cleanup logic actively fights against a shared-primary-key relationship — and the more explicit alternative that sidesteps it entirely.

**Prerequisites:** `shared-primary-key-table-inheritance.md`, `sqlalchemy-relationship-back-populates.md`, `sql-insert-select-where.md`.

## The Problem

Deleting a row that other rows reference (or are referenced by, in a shared-primary-key relationship) isn't just one `DELETE` — every dependent row needs to be dealt with too, in the right order, or the database rejects the operation, or worse, silently leaves orphaned data. SQLAlchemy's ORM tries to infer that cleanup automatically from your `relationship()` declarations when you call `session.delete()` on a loaded object — usually correctly, but that inference is built around the *ordinary* case (a nullable foreign key that can simply be set to `NULL` before the row it points to is removed), and it does not handle every real shape of relationship correctly.

## The Isolated Example

```python
from sqlalchemy import create_engine, ForeignKey, select, delete
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, Session, relationship

class Base(DeclarativeBase):
    pass

class Car(Base):
    __tablename__ = "car"
    id: Mapped[int] = mapped_column(primary_key=True)
    gas_engine: Mapped["GasEngine | None"] = relationship(back_populates="car", uselist=False)
    electric_engine: Mapped["ElectricEngine | None"] = relationship(back_populates="car", uselist=False)

class GasEngine(Base):
    __tablename__ = "gas_engine"
    id: Mapped[int] = mapped_column(ForeignKey("car.id"), primary_key=True)
    car: Mapped[Car] = relationship(back_populates="gas_engine")

class ElectricEngine(Base):
    __tablename__ = "electric_engine"
    id: Mapped[int] = mapped_column(ForeignKey("car.id"), primary_key=True)
    car: Mapped[Car] = relationship(back_populates="electric_engine")

engine = create_engine("sqlite:///:memory:")
Base.metadata.create_all(engine)

with Session(engine) as session:
    session.add(Car(id=1))
    session.add(GasEngine(id=1))
    session.commit()

# Attempt 1: session.delete() on loaded objects
with Session(engine) as session:
    car = session.execute(select(Car)).scalar_one()
    if car.gas_engine is not None:
        session.delete(car.gas_engine)
    if car.electric_engine is not None:
        session.delete(car.electric_engine)
    session.delete(car)
    try:
        session.commit()
    except Exception as e:
        print("FAILS:", type(e).__name__, str(e)[:120])

# Attempt 2: explicit, ordered Core deletes
with Session(engine) as session:
    car_id = session.execute(select(Car.id)).scalar_one()
    session.execute(delete(GasEngine).where(GasEngine.id == car_id))
    session.execute(delete(ElectricEngine).where(ElectricEngine.id == car_id))
    session.execute(delete(Car).where(Car.id == car_id))
    session.commit()
    print("remaining cars:", session.execute(select(Car)).scalars().all())
```

**Real output:**
```
FAILS: AssertionError Dependency rule on column 'car.id' tried to blank-out primary key column 'gas_engine.id'
remaining cars: []
```

**What this proves:** deleting the exact same rows two different ways produces two genuinely different outcomes. `session.delete()` on the loaded ORM objects — the "obvious," more idiomatic-looking approach — crashes with an internal `AssertionError`, even though every dependent object was deleted by hand, in what looks like the correct order. Explicit `delete()` statements, run in dependency order, succeed cleanly.

## Mechanical Walkthrough

- `session.delete(obj)` doesn't issue a `DELETE` immediately — it marks `obj` for deletion and, at `commit()` (really at the **flush** that precedes it), the ORM's *unit of work* examines every `relationship()` touching that object to figure out what else needs to happen first.
- For a normal nullable foreign key, that inference is genuinely helpful: the ORM will automatically `UPDATE` a dependent row's foreign-key column to `NULL` before deleting the row it pointed to, so the database's own foreign-key constraint never gets a chance to complain.
- Here, that inference actively breaks: `GasEngine.id` **is** the foreign key (`shared-primary-key-table-inheritance.md`) — it's also `GasEngine`'s own primary key. The ORM's dependency processor still tries to "blank it out" as part of its normal cleanup sequence, and setting a primary key column to `NULL` is nonsensical — hence the `AssertionError`, raised from inside SQLAlchemy's own internals, not from the database.
- `delete(GasEngine).where(GasEngine.id == car_id)` is **SQLAlchemy Core** syntax — a `DELETE` statement built and executed directly, with no relationship inference involved at all. `session.execute(...)` runs it as a plain SQL statement against the current transaction; nothing about `relationship()` declarations is consulted.
- Running the Core deletes in explicit dependency order (children — the tables holding the foreign keys — before the parent they reference) is what actually satisfies the real database-level constraint; the ORM's inference was trying (incorrectly, in this shape) to automate exactly this ordering.

## Execution Trace

Attempt 1 (`session.delete()` on loaded objects), traced against the
real `AssertionError`:

- car = the loaded Car(id=1), with car.gas_engine = GasEngine(id=1)
- car.gas_engine is not None → True → session.delete(car.gas_engine)  (marked, not yet issued)
- car.electric_engine is not None → False (never created) → skipped
- session.delete(car)  (marked, not yet issued)
- session.commit() → triggers a flush:
  unit of work examines Car's own relationship()s to figure out real
  dependency order before issuing any DELETE
  → sees GasEngine.id is a foreign key to car.id AND GasEngine's own
    primary key at the same time
  → tries to UPDATE gas_engine SET id = NULL (its normal "blank out the
    FK first" strategy) before deleting the row
  → NULL into a primary key column is invalid → AssertionError, raised
    from inside SQLAlchemy itself, before any real SQL even reaches the
    database
- → prints "FAILS: AssertionError Dependency rule on column 'car.id'
   tried to blank-out primary key column 'gas_engine.id'"

Attempt 2 (explicit Core deletes, in dependency order):

- car_id = 1 (queried fresh)
- execute(delete(GasEngine).where(GasEngine.id == 1))
  → real DELETE FROM gas_engine WHERE id = 1, no relationship inference
    involved at all — the row is just gone
- execute(delete(ElectricEngine).where(ElectricEngine.id == 1))
  → real DELETE FROM electric_engine WHERE id = 1 — 0 rows affected
    (none existed), not an error
- execute(delete(Car).where(Car.id == 1))
  → real DELETE FROM car WHERE id = 1 — now safe, since gas_engine's
    own referencing row is already gone
- session.commit() → all three real deletes committed together
- query: select(Car) → [] (no cars remain)
- → prints "remaining cars: []"

The two attempts delete the exact same real rows, in the same real
order (child before parent) — the only difference is *which mechanism*
issues the deletes: the ORM's own automatic dependency inference (which
breaks specifically because `GasEngine.id` is both a foreign key and a
primary key at once), or plain, explicit SQL statements that never
consult `relationship()` at all.

## CS Lens

This is a real, concrete case of an **automated inference layer producing an incorrect result for a valid input it wasn't designed to handle** — the general risk of any system that tries to derive behavior from declared structure rather than have that behavior stated explicitly. The unit of work's dependency processor is itself a form of **topological sort** (ordering operations so every dependency runs before whatever depends on it) — the same underlying idea as a build system ordering compilation steps, or a package manager ordering installs — it simply has a bug in how it classifies a shared-primary-key foreign key.

Also recognized in: any ORM's automatic cascade/cleanup logic hitting an edge case the framework's authors didn't anticipate (a real, recurring category of ORM bug reports across every major ORM), and more generally any "magic" convenience layer whose failure mode, when it does fail, is much harder to diagnose than the equivalent explicit code would have been.

## SE Lens

`session.delete()` on loaded objects is less code at call sites, reads more naturally next to `relationship()`-based navigation, and is correct for the overwhelmingly common case (ordinary nullable foreign keys). Explicit `delete()` statements are more verbose — every table in the dependency chain has to be named and ordered by hand — but they have a real, valuable property the ORM-inferred version doesn't: **the actual order dependent rows are removed in is stated directly in the code**, not derived by a separate inference pass whose behavior can surprise you. The honest tradeoff: choosing explicit Core deletes for every delete operation, everywhere, purely defensively, would be over-engineering for a codebase that mostly has ordinary relationships — the right call here was narrow and situational (this one shared-primary-key deletion path), made *after* hitting the real error, not decided in advance.

## Connection

Builds on `shared-primary-key-table-inheritance.md` — this failure is specific to that pattern, not a general ORM problem. This project's `delete_tool` function (`core/tools.py`) hit exactly this error deleting a `TlToolMill` row with a matching `TlToolEndmill`, and was rewritten to use explicit, ordered `delete()` statements as shown here.

## Try It Yourself

1. Reduce the example to a *single* child table (just `GasEngine`, remove `ElectricEngine` entirely) and confirm whether `session.delete()` still fails — this isolates whether the bug specifically requires *two* sibling relationships on the same parent, or one is enough.
2. In Attempt 1, delete `car` *before* deleting `car.gas_engine`, instead of after, and see whether changing that order changes the error at all.
3. Add a `print` of the real generated SQL for one of the Core `delete()` statements (`print(delete(GasEngine).where(GasEngine.id == car_id))`) and compare it against what you'd write by hand — confirming, as in `orm-object-relational-mapping.md`, that this "Core" layer really is just a structured way to build ordinary SQL.
