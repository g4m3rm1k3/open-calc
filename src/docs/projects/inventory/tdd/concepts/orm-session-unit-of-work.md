# Concept: The ORM Session (Unit of Work)

**What you'll understand by the end:** what a SQLAlchemy `Session` actually manages, and why it's used as a context manager around each real piece of database work.

**Prerequisites:** `orm-object-relational-mapping.md`, `sql-transactions-and-commit.md`.

## Setup

Python 3, plus SQLAlchemy:
```
pip install sqlalchemy
```

## The Problem

Working with an ORM involves more state than a single raw query: newly-created objects that don't exist in the database yet, changes to existing objects' attributes, and the question of when any of that actually becomes a real, committed database change. Something needs to track all of this pending work as one coherent unit, and cleanly release its underlying real database connection when that unit of work is done.

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

engine = create_engine("sqlite:///:memory:")
Base.metadata.create_all(engine)

with Session(engine) as session:
    session.add(Pet(name="Rex"))
    print("pending before commit:", session.new)
    session.commit()
    print("pending after commit:", session.new)

with Session(engine) as second_session:
    rows = second_session.execute(select(Pet)).scalars().all()
    print("visible from a fresh session:", [p.name for p in rows])
```

**Real output:**
```
pending before commit: IdentitySet({<Pet object>})
pending after commit: IdentitySet({})
visible from a fresh session: ['Rex']
```

**What this proves:** `session.new` — the Session's own real, internal tracking of not-yet-committed objects — held the pending `Pet` until `.commit()` ran, then emptied; a completely separate, later `Session` could see the committed `Rex` row, confirming the change is real and durable, not merely held in the first session's own memory.

## Mechanical Walkthrough

- A `Session` wraps a real database connection and adds real, stateful bookkeeping on top of it: which objects are newly added (`.new`), which existing, already-loaded objects have been modified (`.dirty`), and which are staged for deletion (`.deleted`) — none of this exists at the raw `sqlite3` connection level, which only ever knows about executed SQL statements, not Python object state.
- `session.add(obj)` stages a new object for insertion — no SQL runs yet.
- `session.commit()` is what actually flushes every pending change (inserts, updates, deletes) to the database as one real transaction (see `sql-transactions-and-commit.md`), and then commits it.
- `with Session(engine) as session:` uses the Session as a **context manager** — guaranteeing the underlying connection is properly closed when the block exits, even if an exception occurs partway through, without requiring an explicit `.close()` call in every code path (including error paths) the way a raw connection would.
- Each `Session` is typically short-lived in a web application — created for one request (or one logical unit of work), used, and closed — rather than one long-lived Session shared across an entire application's lifetime, which risks real, subtle bugs from stale, cached object state persisting across unrelated operations.

## Execution Trace

`session.new`'s own real state, traced across the commit boundary:

- session.add(Pet(name="Rex"))
  → the Pet object is staged, not yet inserted
  → session.new = IdentitySet({<Pet object>})  (one pending object)
  → prints "pending before commit: IdentitySet({<Pet object>})"

- session.commit()
  → flushes the pending Pet as a real INSERT, then commits the transaction
  → the object is no longer "new" — it's now a committed, persistent row
  → session.new = IdentitySet({})  (empty — nothing pending anymore)
  → prints "pending after commit: IdentitySet({})"

- second_session = a completely separate Session, same engine
- second_session.execute(select(Pet)).scalars().all()
  → queries the real database fresh — not the first session's own memory
  → finds the row committed above
  → prints "visible from a fresh session: ['Rex']"

`session.new` is real, live bookkeeping that changes shape at exactly
one moment — the `commit()` call — going from "one pending object" to
"nothing pending," and the second session's own successful query is
what proves the row is now real database state, not something that
only existed inside the first session's own Python memory.

## CS Lens

This is the **Unit of Work** pattern: tracking every change made during one logical operation and committing them all together, as a single, coherent transaction, rather than issuing each individual database write immediately and independently. This lets an ORM batch several real changes into one efficient database round-trip, and gives an application one clear, natural point (`.commit()`) to decide "this whole unit of work is now genuinely done and correct."

Also recognized in: version control systems' own staging area (`git add` stages changes; `git commit` finalizes them as one unit — a strikingly similar two-phase shape), and any transactional API generally that separates "stage a change" from "make it durable."

## SE Lens

Using a fresh, short-lived `Session` per logical operation, rather than one long-lived session shared across an entire application's lifetime, avoids real, subtle bugs a shared session risks: stale object state from an earlier, unrelated operation silently leaking into a later one, or two concurrent operations interfering with the same session's internal tracking. The real cost — a small, real overhead per session created — is a reasonable, deliberate tradeoff at most applications' actual scale, in exchange for sidestepping an entire class of cross-operation state-sharing bug.

## Connection

Builds on `orm-object-relational-mapping.md` and `sql-transactions-and-commit.md`. `orm-query-builder-select-where.md` covers what actually happens when a `Session` is asked to run a query, as opposed to stage a write.

## Try It Yourself

1. Add an object with `session.add(...)` but never call `.commit()`, close the session (exiting the `with` block), open a fresh session, and confirm the uncommitted object never made it into the database — direct, real proof that leaving a `with` block without committing does not implicitly save pending work.
2. Modify an already-persisted object's attribute (fetch a `Pet`, change its `.name`, then call `.commit()` with no explicit `session.add()` for the modified object) — confirm the change is saved anyway, and research why: the Session already knows about (is "tracking") any object it originally loaded, without needing to be told again that it changed.
3. Deliberately cause an error inside a `with Session(engine) as session:` block, after a `session.add(...)` but before `.commit()`, and confirm — by opening a fresh session afterward — that the uncommitted, in-progress change never took effect, demonstrating the context manager's cleanup doesn't accidentally commit partial work.
