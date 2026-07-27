# Concept: Get-or-Create

**What you'll understand by the end:** a small, real, named pattern for "use this row if it already exists, otherwise make it" — and why it has to check *before* it creates, not the other way around.

**Prerequisites:** `orm-query-builder-select-where.md`, `orm-session-unit-of-work.md`.

## The Problem

Sometimes a piece of reference data (a tag, a category, a material name) should exist exactly once, but the code adding it doesn't necessarily know in advance whether it's already there — especially when the data is arriving from an external source (a second file, a user-submitted form) that has no idea what this database already contains. Blindly inserting every time would create real duplicates; blindly assuming it already exists would crash the first time it doesn't.

## The Isolated Example

```python
from sqlalchemy import create_engine, select
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, Session

class Base(DeclarativeBase):
    pass

class Tag(Base):
    __tablename__ = "tags"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str]

engine = create_engine("sqlite:///:memory:")
Base.metadata.create_all(engine)

def get_or_create_tag(session, name):
    existing = session.execute(select(Tag).where(Tag.name == name)).scalar_one_or_none()
    if existing is not None:
        return existing
    new_tag = Tag(name=name)
    session.add(new_tag)
    session.commit()
    return new_tag

with Session(engine) as session:
    a = get_or_create_tag(session, "urgent")
    b = get_or_create_tag(session, "urgent")
    c = get_or_create_tag(session, "later")
    print(a.id, b.id, c.id)
    print(a.id == b.id)
    print("total tags:", len(session.execute(select(Tag)).scalars().all()))
```

**Real output:**
```
1 1 2
True
total tags: 2
```

**What this proves:** calling `get_or_create_tag(session, "urgent")` twice returned the *same* row both times (`a.id == b.id` is `True`) rather than creating a second `"urgent"` tag — while `"later"`, a genuinely new name, correctly got its own new row. Only two real tags exist after three calls.

## Mechanical Walkthrough

- `select(Tag).where(Tag.name == name)` — **(c) already established** query construction (`orm-query-builder-select-where.md`).
- `.scalar_one_or_none()` — **(b) reappearing**, first seen elsewhere in this project — returns the single matching row, or `None` if there isn't one; this specific method (rather than `.scalars().all()`) is what makes "does exactly one already exist?" a one-line check.
- `if existing is not None: return existing` — **(c) already established** `is`-comparison against `None` (`python-is-vs-equals.md`) — the actual branch this whole pattern is named for: check first, only create on the "no" path.
- `session.add(new_tag)` / `session.commit()` — **(c) already established** ORM insert (`orm-session-unit-of-work.md`), reached only when the check above found nothing.

## Execution Trace

Three sequential calls, traced against the real output above
(`1 1 2` / `True` / `total tags: 2`):

```
Call 1: get_or_create_tag(session, "urgent")
  existing = query for Tag.name == "urgent" → None (table is empty)
  existing is not None? → False
  new_tag = Tag(name="urgent"); session.add(new_tag); session.commit()
  → new_tag.id = 1 (assigned by the database on commit)
  → returns new_tag (id=1)
  a = <Tag id=1, name="urgent">

Call 2: get_or_create_tag(session, "urgent")
  existing = query for Tag.name == "urgent" → the real row from Call 1 (id=1)
  existing is not None? → True
  → returns existing immediately, no insert, no new id assigned
  b = <Tag id=1, name="urgent">  (same row as a)

Call 3: get_or_create_tag(session, "later")
  existing = query for Tag.name == "later" → None (no such row yet)
  existing is not None? → False
  new_tag = Tag(name="later"); session.add(new_tag); session.commit()
  → new_tag.id = 2
  c = <Tag id=2, name="later">
```

`a.id == b.id` is `True` specifically because Call 2 never reached the
`session.add`/`commit` lines at all — the query at the top of Call 2
found Call 1's own committed row and returned early. Only two real
inserts ever happened across three calls.

## CS Lens

This is **idempotency** applied to a single function rather than a whole API endpoint — calling `get_or_create_tag(session, "urgent")` any number of times produces the same real end state (exactly one `"urgent"` row) as calling it once, matching `idempotent-initialization-guard.md`'s core idea but scoped to one row's existence rather than a whole table's.

Also recognized in: Django's own `Model.objects.get_or_create(...)`, a real, built-in method with this exact name doing exactly this — proof this pattern is common enough that a major framework ships it as a first-class API rather than leaving every project to hand-write it.

## SE Lens

The real, honest gap in the version shown here: between the `select` check and the `commit`, nothing stops a *different*, concurrent request from also deciding `"urgent"` doesn't exist yet and creating its own duplicate — a genuine race condition. Real production systems close this with a database-level `UNIQUE` constraint on `name` (so a genuine duplicate insert fails loudly instead of silently succeeding) combined with catching that specific failure and re-querying — a real refinement on top of this pattern, not shown here because the underlying `UNIQUE` constraint and the exception-handling it requires are their own separate concepts, not yet taught.

## Connection

Builds on `orm-query-builder-select-where.md` and `orm-session-unit-of-work.md`. Used in this project when importing a tool from an external file: its real material/manufacturer names ("Carbide," "Mastercam") get matched against this project's own existing reference rows by name, or created fresh if genuinely new — never duplicated.

## Try It Yourself

1. Call `get_or_create_tag` with names differing only in case (`"Urgent"` vs `"urgent"`) and observe that two separate rows are created — the `==` comparison in the `WHERE` clause is case-sensitive by default; reason about whether that's the right behavior for this specific use case.
2. Add a real `unique=True` constraint to `Tag.name` (`mapped_column(unique=True)`) and deliberately trigger the race condition described above by inserting a duplicate directly, bypassing the check — observe the real `IntegrityError` the database itself now raises.
3. Rewrite `get_or_create_tag` to accept extra fields (a `description`) that should only be set when *creating* a new row, left alone on an existing one — a common, real refinement once "the thing being fetched-or-created" has more than just its lookup key.
