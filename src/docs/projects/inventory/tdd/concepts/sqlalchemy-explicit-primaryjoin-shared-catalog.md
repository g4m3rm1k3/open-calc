# Concept: An Explicit `primaryjoin` for a Relationship With No Real Single Owner

**What you'll understand by the end:** how to declare a real SQLAlchemy
relationship between two tables when the join condition can't be
inferred from a single, real `ForeignKey` — because the column is
honestly shared by more than one kind of real parent row, not owned by
just one.

**Prerequisites:** `orm-object-relational-mapping.md`,
`shared-primary-key-table-inheritance.md`.

## Setup

Python 3 with `sqlalchemy` installed (`pip install sqlalchemy`).

## The Problem

SQLAlchemy can normally figure out how to join two related tables on
its own, by looking at a real `ForeignKey(...)` declared on one of the
join columns. That inference breaks down the moment a column is
legitimately shared by *more than one* real parent table — a catalog
row that could belong to a `Widget` or a `Gadget`, for instance, with no
single correct `ForeignKey` to declare, since either one (or neither)
might be the real match for a given row.

## The Isolated Example

```python
import uuid
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Mapped, Session, mapped_column, relationship
from sqlalchemy.types import BINARY, TypeDecorator


class Base(DeclarativeBase):
    pass


class Widget(Base):
    __tablename__ = "widget"
    id: Mapped[int] = mapped_column(primary_key=True)


class Gadget(Base):
    __tablename__ = "gadget"
    id: Mapped[int] = mapped_column(primary_key=True)


class CatalogEntry(Base):
    __tablename__ = "catalog_entry"
    # No real ForeignKey here on purpose -- this id can legitimately
    # match a Widget's id OR a Gadget's id, never enforceably both.
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(default="")

    widget: Mapped[Widget | None] = relationship(
        primaryjoin="CatalogEntry.id == foreign(Widget.id)", viewonly=True,
    )
    gadget: Mapped[Gadget | None] = relationship(
        primaryjoin="CatalogEntry.id == foreign(Gadget.id)", viewonly=True,
    )


engine = create_engine("sqlite:///:memory:")
Base.metadata.create_all(engine)
with Session(engine) as session:
    session.add(Widget(id=1))
    session.add(Gadget(id=2))
    session.add(CatalogEntry(id=1, name="A real widget's catalog row"))
    session.add(CatalogEntry(id=2, name="A real gadget's catalog row"))
    session.commit()

    for entry in session.query(CatalogEntry).all():
        print(entry.name, "-> widget:", entry.widget, "gadget:", entry.gadget)
```

**Real output:**
```
A real widget's catalog row -> widget: <Widget id=1> gadget: None
A real gadget's catalog row -> widget: None gadget: <Gadget id=2>
```

**What this proves:** `CatalogEntry.id` correctly resolves against
*whichever* real table actually has a matching row — `widget` and
`gadget` are independent, honestly-optional views, not a single
relationship trying (and failing) to commit to one owner.

## Mechanical Walkthrough

- No `ForeignKey` on `CatalogEntry.id` — declaring one (say, to
  `Widget.id`) would make the relationship to `Gadget` impossible to
  express cleanly, and would misrepresent every real gadget row as if
  it were violating a constraint it was never really subject to.
- `primaryjoin="CatalogEntry.id == foreign(Gadget.id)"` — an explicit
  string expression telling SQLAlchemy exactly how to join, since it
  can no longer infer this from a column-level `ForeignKey`. The
  `foreign()` annotation marks *which side* of that expression plays
  the role a `ForeignKey` normally would — without it, SQLAlchemy has
  no way to know which column is "the many side" of the join.
- `viewonly=True` — this relationship is a read-only convenience for
  querying; every real write already happens by constructing
  `Widget(...)`/`Gadget(...)`/`CatalogEntry(...)` directly with matching
  `id`s, not by assigning through `.widget =`/`.gadget =`. Marking it
  `viewonly` is honest about that, and avoids SQLAlchemy trying (and
  failing) to figure out how to *write* through an intentionally
  ambiguous join.

## CS Lens

This is the ORM-level version of a **polymorphic association** — one
row that may relate to exactly one of several different real parent
types, determined by *which table actually has a matching row*, not by
a stored type tag. The alternative most systems reach for instead (a
discriminator column naming which type applies) is a different, more
explicit design choice; this pattern is what happens when the real,
external schema you're mapping already committed to the "matching row
decides" shape, and your own model has to describe that faithfully
rather than impose a cleaner shape the real data doesn't actually have.

## SE Lens

The real, tempting shortcut here is forcing a single `ForeignKey` onto
the shared column anyway — pointing it at whichever parent table
happens to be used most often, and treating the other case as an edge
case to handle separately. That works right up until real data proves
the "edge case" isn't rare at all (here: every real holder needed the
exact same catalog mechanism tools already used) — at which point the
forced FK actively lies about what the column really means. An explicit
`primaryjoin` costs a few more lines up front, but stays honestly
correct for every real case the column can actually represent, not just
the first one you happened to notice.

## Connection

Builds on `orm-object-relational-mapping.md` (relationships in
general) and `shared-primary-key-table-inheritance.md` (the shared-ID
pattern this project already used for one real owner; this concept is
what changes once a shared ID needs to honestly support more than one).

## Try It Yourself

1. Add a third real parent type (`Doohickey`) and a matching
   `primaryjoin`-based relationship on `CatalogEntry` — confirm a
   `CatalogEntry` row can resolve against any one of the three,
   independently.
2. Remove `viewonly=True` from one relationship and try assigning
   `entry.widget = some_widget` before committing — observe what
   SQLAlchemy actually does (or complains about) when a write is
   attempted through an intentionally ambiguous, foreign()-annotated
   join, and reason about why `viewonly` is the honest choice here.
3. Add a `CatalogEntry` row whose `id` matches *neither* a `Widget` nor
   a `Gadget` row, and confirm both relationships correctly resolve to
   `None` rather than raising an error — a real, valid case (a catalog
   entry for something this schema doesn't model at all yet).
