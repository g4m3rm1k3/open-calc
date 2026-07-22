# Concept: A Composite Natural Key Instead of an Invented ID

**What you'll understand by the end:** when to make a primary key out
of two (or more) real, already-meaningful columns together, instead of
adding a surrogate `id` column that exists only to be unique.

**Prerequisites:** `sql-create-table-and-schema.md`.

## Setup

Python 3 with `sqlalchemy` installed (`pip install sqlalchemy`).

## The Problem

A table needs a primary key — something that uniquely identifies each
row. The default instinct is often to add a surrogate key: an
auto-incrementing integer or a generated GUID, whether or not the row's
own real data already uniquely identifies it. When two of a row's real
columns are *already* guaranteed unique together — one row per (parent,
position) pair, for instance — inventing a third column just to have
"a primary key" adds a value with no real meaning of its own, purely to
satisfy a rule that a composite of real columns could already satisfy.

## The Isolated Example

```python
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Mapped, Session, mapped_column

class Base(DeclarativeBase):
    pass

class OutlineSegment(Base):
    __tablename__ = "outline_segment"
    # (shape_id, position) together are already guaranteed unique --
    # one row per real position in one real shape's outline. No
    # invented `id` column needed at all.
    shape_id: Mapped[int] = mapped_column(primary_key=True)
    position: Mapped[int] = mapped_column(primary_key=True)
    x: Mapped[float]
    y: Mapped[float]

engine = create_engine("sqlite:///:memory:")
Base.metadata.create_all(engine)
with Session(engine) as session:
    session.add_all([
        OutlineSegment(shape_id=1, position=0, x=0.0, y=0.0),
        OutlineSegment(shape_id=1, position=1, x=1.0, y=0.0),
        OutlineSegment(shape_id=2, position=0, x=0.0, y=0.0),
    ])
    session.commit()

    rows = session.query(OutlineSegment).order_by(
        OutlineSegment.shape_id, OutlineSegment.position
    ).all()
    for row in rows:
        print(row.shape_id, row.position, row.x, row.y)
```

**Real output:**
```
1 0 0.0 0.0
1 1 1.0 0.0
2 0 0.0 0.0
```

**What this proves:** `(shape_id, position)` alone is enough to
uniquely address every row — `(1, 0)`, `(1, 1)`, and `(2, 0)` are all
distinct real keys — no separate `id` column was ever needed to make
these rows individually addressable.

## Mechanical Walkthrough

- `shape_id: Mapped[int] = mapped_column(primary_key=True)` and
  `position: Mapped[int] = mapped_column(primary_key=True)` — declaring
  `primary_key=True` on *more than one* column makes SQLAlchemy treat
  them together as one composite key, not two separate ones; the real
  uniqueness constraint is on the pair, not either column alone.
- Inserting a second row with `shape_id=1, position=0` again (not shown
  above) would violate the real primary-key constraint — exactly the
  protection a surrogate `id` column would have provided, just derived
  from data the table already had, instead of an invented extra value.
- Querying/filtering by either or both real columns works exactly like
  any other column — nothing about using a composite key changes how
  the table is queried day to day.

## CS Lens

This is a **natural key** (a key made of data the entity already has,
because that data is itself sufficient to be unique) as opposed to a
**surrogate key** (an artificial value — an auto-increment integer, a
generated UUID — added purely to serve as an identifier). Relational
database theory doesn't prefer one over the other universally; the real
question for any given table is whether a natural composite already
exists and is stable, not whether a surrogate key "feels" more standard.

Also recognized in: a many-to-many join table's own composite key
(`(user_id, group_id)`, needing no separate `id` at all); a time-series
row keyed by `(sensor_id, timestamp)`; a translation table keyed by
`(string_id, language_code)`.

## SE Lens

The real cost of defaulting to a surrogate key even when a natural one
already exists: an extra column that carries no real information, plus
a second, redundant uniqueness constraint (a natural unique index on
the "real" columns, added separately, since the surrogate key alone
doesn't stop true duplicates by real content). The real cost of a
composite natural key: referencing a row from elsewhere now requires
passing both columns, not one — a genuine tradeoff, not a strictly
better choice in every case. The right call depends on whether the
natural combination is truly guaranteed stable and unique for the life
of the data — when it is (as with an ordered position within a fixed
parent), it usually is the cheaper, more honest choice.

## Connection

Builds on `sql-create-table-and-schema.md` (primary keys in general).
Contrasts with `shared-primary-key-table-inheritance.md` (which still
uses a *single*, surrogate-style shared ID as its key — a different
real shape than a multi-column natural key).

## Try It Yourself

1. Try inserting a second `OutlineSegment` with the exact same
   `(shape_id, position)` pair as an existing row, and observe SQLite
   reject it — the real, automatic protection a composite primary key
   provides, with no extra code.
2. Add a third column, `revision`, and make the key
   `(shape_id, position, revision)` instead — reason about what real,
   new case this would correctly allow (the same position appearing
   more than once across different revisions of the same shape) that
   the original two-column key could not.
3. Rewrite `OutlineSegment` with an invented surrogate `id` column
   instead, plus a separate unique constraint on `(shape_id,
   position)` — confirm both designs reject the same duplicate insert,
   then compare how you'd reference "segment 1 of shape 1" from another
   table under each design.
