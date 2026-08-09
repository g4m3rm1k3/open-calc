# Concept: The Same ORM Model, Against a Different Database

**What you'll understand by the end:** that a declarative model class describes a table's *shape*, not a connection to any specific database — so the exact same class can query two completely different real databases, unmodified, just by handing it a different `Session`.

**Prerequisites:** `orm-object-relational-mapping.md`, `orm-session-unit-of-work.md`.

## The Problem

An application normally has one database it talks to, so it's easy to assume a model class is somehow tied to *that* database specifically. But sometimes a program legitimately needs to read a *second*, independent database with the same real table shape — a second SQLite file uploaded by a user, say — and re-deriving a whole parallel set of model classes (or hand-writing raw SQL) just because the data happens to live in a different file would be pure duplication of something already fully described once.

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

engine_a = create_engine("sqlite:///:memory:")
Base.metadata.create_all(engine_a)
with Session(engine_a) as s:
    s.add(Pet(name="Rex"))
    s.commit()

engine_b = create_engine("sqlite:///:memory:")
Base.metadata.create_all(engine_b)
with Session(engine_b) as s:
    s.add(Pet(name="Milo"))
    s.commit()

with Session(engine_a) as s:
    print("engine_a pets:", [p.name for p in s.execute(select(Pet)).scalars().all()])
with Session(engine_b) as s:
    print("engine_b pets:", [p.name for p in s.execute(select(Pet)).scalars().all()])
```

**Real output:**
```
engine_a pets: ['Rex']
engine_b pets: ['Milo']
```

**What this proves:** the exact same `Pet` class, `select(Pet)` query, and code was used against two entirely separate, independent SQLite databases (each with its own `Rex`/`Milo`) — and each query correctly saw only its own database's data. Nothing about `Pet` needed to change, or even know, which database it was being queried against.

## Mechanical Walkthrough

- `class Pet(Base): ...` — **(c) already established** declarative model definition — defined exactly once here, unlike the two separate engines below it.
- `create_engine("sqlite:///:memory:")` called **twice**, producing `engine_a` and `engine_b` — **(b) reappearing** `create_engine` (`database-connection-url.md`), but the key new fact is that calling it twice produces two genuinely independent connections/databases, not two handles onto the same one.
- `Base.metadata.create_all(engine_a)` / `(engine_b)` — **(b) reappearing** (`orm-object-relational-mapping.md`) — run once per engine, since each is a separate, empty database needing its own real tables created.
- `Session(engine_a)` vs. `Session(engine_b)` — **(a) the actual concept**: a `Session` is bound to *one specific engine* at construction — this is the only place "which database" is ever decided. `Pet`, `select(Pet)`, and every query-building line are completely unaware of it.

## Execution Trace

Four real `Session` blocks, traced against the real output above:

- Session(engine_a): add Pet(name="Rex")   → commit → engine_a's own
  real database now has one row: Rex

- Session(engine_b): add Pet(name="Milo")  → commit → engine_b's own,
  completely separate real database now has one row: Milo
  (engine_a is untouched by this — different file/connection entirely)

- Session(engine_a): select(Pet) → queries engine_a's own database only
  → finds Rex (the only row engine_a has ever had)
  → print "engine_a pets: ['Rex']"

- Session(engine_b): select(Pet) → queries engine_b's own database only
  → finds Milo (the only row engine_b has ever had)
  → print "engine_b pets: ['Milo']"

The exact same `Pet` class and the exact same `select(Pet)` expression
run in all four blocks — nothing about `Pet` changes between them. The
only thing that ever varies is which `Session` (and therefore which
`engine`) each block is constructed with, which is the sole real
decision point determining which database gets read or written.

## CS Lens

This is **separation of schema from connection** — a real, general database-programming principle: the description of *what a table looks like* (columns, types, relationships) is independent information from *where a specific instance of that table's data lives* (which server, which file, which connection). Conflating the two — as informally assuming "a model IS a database" does — is what makes this pattern feel surprising the first time it's seen.

Also recognized in: any multi-tenant system serving many customers from structurally identical databases (one schema, many real database instances, selected per-request), and database migration tooling that runs the identical schema-definition code against a "before" and "after" database to compare them.

## SE Lens

The alternative — writing a second, parallel set of model classes (or raw SQL) specifically for "the other database" — would be real, unnecessary duplication the moment the two databases share a real schema, and a real maintenance hazard the moment that shared schema changes (two places to update, easy to let them drift apart). The one real constraint this pattern depends on: the *actual* schema of both databases has to genuinely match what the model classes declare — reading a database whose real columns don't line up with the model will produce real errors (a missing column) or silently wrong results (a column present but never populated), not a helpful, self-diagnosing message pointing at the mismatch.

## Connection

Builds on `orm-object-relational-mapping.md` and `orm-session-unit-of-work.md`. Used directly in this project to read an uploaded, independent `.TOOLDB` file with the exact same `TlTool`/`TlToolMill`/etc. classes already written for this project's own database — no duplicate parsing code for "a foreign file" versus "our own file."

## Try It Yourself

1. Add a `Pet` to *both* `engine_a` and `engine_b` with the same `id` (`1`) but different names, and confirm each database correctly keeps its own independent row — proving primary keys are scoped per-database, not globally.
2. Deliberately create `engine_b` *without* calling `Base.metadata.create_all(engine_b)` first, then try to query it — observe the real error, and reason about why it happens (the table genuinely doesn't exist in that specific database file yet).
3. Copy one `Pet` row's data from a query against `engine_a` into a *new* `Pet` object added to a `Session(engine_b)`, and confirm it now exists in `engine_b` too — this is exactly the "import" operation this concept enables project-wide, reduced to its smallest real form.
