# Concept: An ORM Model Reused Against a Foreign Schema

**What you'll understand by the end:** why binding the same ORM model
class to two different database files — one your own application
owns and controls, one that belongs to an external format you don't —
is a real, distinct risk most ORM tutorials never mention, and how to
recognize it before it breaks.

**Prerequisites:** an ORM's basic model-to-table mapping (any prior
exposure to defining a class whose attributes map to real table
columns).

## Setup

Python 3, SQLAlchemy (`pip install sqlalchemy`), no other packages.

## The Problem

An ORM model class isn't actually tied to one specific database file —
it's tied to a *table shape* (a name, and a set of columns). Nothing
stops the exact same model from being pointed at two different SQLite
files, as long as both happen to have a table matching that shape.
That's a genuine convenience — until the two files stop being
identical. If one of them is a file your own application created and
fully controls, and the other is a real file from an outside format
you don't control at all, extending the model to fit *your* file's
needs can silently break every read against the *other* one.

## The Isolated Example

```python
from sqlalchemy import create_engine, select
from sqlalchemy.orm import DeclarativeBase, Mapped, Session, mapped_column

class Base(DeclarativeBase):
    pass

class Item(Base):
    __tablename__ = "items"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str]

# "owned.db" -- our own application's file, created fresh from this model.
owned_engine = create_engine("sqlite:///owned.db")
Base.metadata.create_all(owned_engine)
with Session(owned_engine) as s:
    s.add(Item(name="widget"))
    s.commit()

# "foreign.db" -- simulates a real external file that predates our
# model and was never migrated alongside it.
import sqlite3
conn = sqlite3.connect("foreign.db")
conn.execute("CREATE TABLE items (id INTEGER PRIMARY KEY, name TEXT)")
conn.execute("INSERT INTO items (name) VALUES ('gadget')")
conn.commit()
conn.close()

# The same model, reading both files:
for path in ("owned.db", "foreign.db"):
    engine = create_engine(f"sqlite:///{path}")
    with Session(engine) as s:
        print(path, [i.name for i in s.execute(select(Item)).scalars()])
```

**Real output:**
```
owned.db ['widget']
foreign.db ['gadget']
```

**What this proves:** one model, `Item`, reads both files correctly —
right up until the schemas genuinely match. Now extend `Item` with a
new column real code elsewhere actually needs:

```python
class Item(Base):
    __tablename__ = "items"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str]
    priority: Mapped[int] = mapped_column(default=0)  # new
```

Re-running the same loop against `owned.db` (migrated to have the new
column) still works — but against `foreign.db` (never migrated, and
never *going* to be, since it's not really this project's file):

**Real output:**
```
owned.db ['widget']
Traceback (most recent call last):
    ...
sqlite3.OperationalError: no such column: items.priority
```

## Mechanical Walkthrough

- `create_engine(f"sqlite:///{path}")` used twice, against two
  different files — the *model class* (`Item`) never changes; only the
  engine/session it's bound to at read time does. This is exactly what
  makes reusing one model against two files convenient in the first
  place.
- Adding `priority` to `Item` changes the SQL SQLAlchemy generates for
  *every* query using that model — including the one running against
  `foreign.db`, which has no way to know or care that the model changed,
  because that file isn't under this codebase's control at all.
- The failure is a plain `OperationalError`, identical in shape to any
  other missing-column bug — nothing about the error message hints that
  the real cause is "this file is foreign, not local."

## CS Lens

This is a real instance of the **Liskov substitution**-adjacent idea
applied to schemas rather than types: two things are being treated as
interchangeable (any file with an `items` table) when they're only
interchangeable *until* one of them evolves independently of the other.
The model implicitly assumes both database files share one evolving
schema, when in truth only one of them actually does.

Also recognized in: a shared library's data class used both for its own
internal state *and* for deserializing a third-party API's response
(extending it for internal needs can break parsing of the external
payload); a config-file parser reused for both a project's own config
and a plugin ecosystem's third-party config files, following the same
format only by convention.

## SE Lens

The real fix isn't "never extend the model" — the local file genuinely
needed the new column. It's recognizing, *before* extending a shared
model, whether every real consumer of that model is bound to a schema
you actually control. The available real fixes, in order of
increasing effort: keep the addition schema-compatible with the
foreign format if at all possible (rare — the foreign format usually
isn't yours to redefine); use a *separate*, second model/table for the
locally-owned data, joined logically rather than merged into the same
mapped class; or, as this project did, recognize the new field doesn't
actually need to be *stored* at all, and compute it live instead —
removing the schema divergence entirely rather than managing it.

## Connection

Builds on ordinary ORM model-to-table mapping. Pairs directly with
`database-migrations.md` — a migration only reaches files your own
deployment process actually runs it against; a foreign file, by
definition, never receives it, which is exactly the gap this concept
names.

## Try It Yourself

1. Reproduce the isolated example, then add a *nullable* new column
   with a default instead of removing it — confirm reading `owned.db`
   still works, but `foreign.db` still fails identically, proving
   nullability doesn't help: the column has to exist in the table at
   all to be selected.
2. Modify the read loop to catch `OperationalError` specifically for
   the foreign file and fall back to a raw, column-limited query
   (`SELECT id, name FROM items`) instead of the full ORM model — a
   real, working mitigation that trades the ORM's convenience for
   compatibility with a schema you don't control.
3. Write a short comment directly on the model class stating which of
   its columns are safe to assume exist in *every* file it might be
   bound to, and which are only guaranteed for the locally-owned one —
   making the real, implicit assumption this concept exists to name
   explicit and visible to the next person reading the code.
