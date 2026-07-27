# Lesson 15: An ORM — Classes Instead of SQL Strings

## What you will build

`core/tools.py`'s `Tool` — a real SQLAlchemy model class — replacing
every hand-written SQL string from Lesson 14 with real Python objects
and expressions, while keeping every route's behavior identical,
verified live. The transferable problem: **an ORM (Object-Relational
Mapper) doesn't remove SQL — it generates it from Python code you
write instead**, and understanding that requires having already written
the real SQL yourself (Lesson 14), so what's being generated on your
behalf is never a mystery.

## What you need to know first

Lesson 14: raw `sqlite3`, `CREATE TABLE`, parameterized `?` queries, the
real SQL injection danger and fix. This lesson replaces `core/
storage.py`/`core/tools.py`'s internals entirely; every route in
`app.py` and every existing test/verification keeps working unchanged.

## Concepts cataloged from this lesson

Full standalone treatments live in `../concepts/`. Pointers to each are
also placed inline at their point of use below.

- `../concepts/orm-object-relational-mapping.md`
- `../concepts/sqlalchemy-mapped-column-types.md`
- `../concepts/database-connection-url.md`
- `../concepts/orm-session-unit-of-work.md`
- `../concepts/orm-query-builder-select-where.md`
- `../concepts/python-dict-comprehension.md`
- `../concepts/database-migrations.md` — added retroactively, found
  missing while cross-referencing a professional-software-engineering-
  concepts checklist; this lesson's own Exercise 1 already demonstrates
  the exact gap a real migration tool closes.

## No pipeline diagram change

Persistence, same as Lesson 14, is separate from the G-code pipeline.

---

## Concept Unit: The Same Real Table, Through an ORM Instead

*(Full standalone treatments: ../concepts/orm-object-relational-mapping.md,
../concepts/sqlalchemy-mapped-column-types.md,
../concepts/database-connection-url.md,
../concepts/orm-session-unit-of-work.md,
../concepts/orm-query-builder-select-where.md.)*

### The Concept, Isolated

```python
from sqlalchemy import create_engine, String, select
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, Session


class Base(DeclarativeBase):
    pass


class Pet(Base):
    __tablename__ = "pets"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String)
    age: Mapped[int]


engine = create_engine("sqlite:///:memory:")
Base.metadata.create_all(engine)

with Session(engine) as session:
    session.add(Pet(name="Rex", age=3))
    session.add(Pet(name="Milo", age=5))
    session.commit()

    rows = session.execute(select(Pet)).scalars().all()
    print("all pets:", [(p.id, p.name, p.age) for p in rows])

    older = session.execute(select(Pet).where(Pet.age > 4)).scalars().all()
    print("older than 4:", [(p.id, p.name, p.age) for p in older])
```
**Real output, run this session:**
```
all pets: [(1, 'Rex', 3), (2, 'Milo', 5)]
older than 4: [(2, 'Milo', 5)]
```
Identical result to Lesson 14's own disposable `pets` lab — same real
data, same real question answered — proving the ORM version is a
different *way to write* the same real SQL, not a different database or
different behavior.

**What each new piece is:**
- `class Base(DeclarativeBase): pass` — **(a) first appearance** —
  every real table this project defines will be a Python class
  inheriting from this one shared `Base`; SQLAlchemy uses that shared
  ancestor to collect every table's real structure in one place
  (`Base.metadata`, used next).
- `class Pet(Base): __tablename__ = "pets"` — **(a) first appearance**
  of a **declarative model**: a real Python class *is* the table
  definition — no separate `CREATE TABLE` string anywhere.
  `__tablename__` is the one required piece of real SQL vocabulary
  (the actual table name) that still has to be stated explicitly.
- `id: Mapped[int] = mapped_column(primary_key=True)` — **(a) first
  appearance** of `Mapped[...]`.
  *(Full standalone treatment: ../concepts/sqlalchemy-mapped-column-types.md.)*
  A real, modern (SQLAlchemy 2.0) type
  annotation doing two real jobs at once: telling *Python*/`mypy`-style
  tools this attribute is an `int`, and telling *SQLAlchemy* to
  generate a real `INTEGER` column for it — the same real column type
  Lesson 14 wrote by hand (`id INTEGER PRIMARY KEY AUTOINCREMENT`), now
  inferred from the annotation plus `mapped_column(primary_key=True)`.
- `name: Mapped[str] = mapped_column(String)` / `age: Mapped[int]` —
  **(a) first appearance** of the shorthand: a bare `Mapped[int]` with
  no explicit `mapped_column(...)` at all still works — SQLAlchemy
  infers a real, correct column type from the Python type alone,
  `mapped_column(String)` shown once, explicitly, to name that the
  shorthand is optional sugar over the same real mechanism.
- `create_engine("sqlite:///:memory:")` — **(a) first appearance** of a
  **connection URL** rather than a bare file path.
  *(Full standalone treatment: ../concepts/database-connection-url.md.)*
  `sqlite://` is the
  *dialect* (which real database this is), `/:memory:` is SQLite's own
  real in-memory marker (Lesson 14). **This one string is this lesson's
  actual, real payoff, worth naming explicitly**: changing it to
  `"postgresql://user:pass@host/dbname"` (a real, different database
  entirely) would require **zero changes** to `Pet`, `select(Pet)`, or
  any query — SQLAlchemy translates the same Python into whichever
  real dialect's actual SQL the engine targets.
- `Base.metadata.create_all(engine)` — **(a) first appearance** —
  generates and runs a real `CREATE TABLE` (SQLAlchemy builds the exact
  same kind of statement Lesson 14 wrote by hand, from `Pet`'s class
  definition) for every model registered under `Base`.
- `Session(engine)` / `session.add(Pet(name="Rex", age=3))` — **(a)
  first appearance** of a **Session**.
  *(Full standalone treatment: ../concepts/orm-session-unit-of-work.md.)*
  SQLAlchemy's real, stateful
  "unit of work" object — `.add(...)` stages a new, real Python object
  to be inserted; nothing is actually written to the database until
  `.commit()` — the same real transaction concept Lesson 14's
  `connection.commit()` already introduced, now managed by the Session
  instead of a bare connection.
- `select(Pet)` / `.where(Pet.age > 4)` — **(a) first appearance** of
  SQLAlchemy's **query construction API**.
  *(Full standalone treatment: ../concepts/orm-query-builder-select-where.md.)*
  `select(Pet)` builds a real
  query object (not yet run); `.where(Pet.age > 4)` — a real Python
  comparison (`Pet.age > 4`) that SQLAlchemy intercepts and translates
  into a real SQL `WHERE age > ?` clause, **always** using a
  parameterized placeholder under the hood — there is no string-
  building step here at all for a caller to get wrong.
- `session.execute(...).scalars().all()` — **(a) first appearance** —
  `.execute(query)` actually runs it; `.scalars()` unwraps each result
  row down to the real `Pet` object itself (rather than a
  one-element-tuple wrapper); `.all()` — **(b) reappearing** naming
  convention (Lesson 14's `.fetchall()`), same real idea.

### Discard

This `Pet`/`Base`/in-memory-engine example is deleted now. It will not
appear in the project again — it existed only to prove the ORM produces
the same real result as Lesson 14's raw SQL, using real Python objects
instead of SQL strings.

### Commands, Run for Real

```
pip install sqlalchemy
```
**Real output (abridged):**
`Successfully installed greenlet-3.5.3 sqlalchemy-2.0.51 typing-extensions-4.16.0`
— a real, new dependency (unlike `sqlite3` itself, which needed none).

### CS Lens

An ORM is a real **abstraction layer over a query language** — the same
general shape as this project's own `core/lexer.py`/`core/parser.py`
turning raw G-code text into structured Python objects, applied here in
the opposite direction: structured Python objects (`Pet(name=...,
age=...)`) turned *into* a different language's raw text (real SQL),
rather than the other way around.

Also recognized in: every major language's own standard ORM (Django's
ORM in Python, Entity Framework in C#, ActiveRecord in Ruby,
Hibernate in Java) — the pattern (real classes standing in for real
tables, real attribute comparisons standing in for real `WHERE`
clauses) is a genuinely universal one across the industry, not specific
to SQLAlchemy.

### SE Lens

The real, honest cost: an ORM adds a real dependency, a real learning
curve, and a real layer where "what SQL actually runs" is one step
removed from what you typed — which is exactly why this project built
Lesson 14's raw version *first*: trusting `select(Pet).where(Pet.age >
4)` to generate a safe, correct `WHERE age > ?` means having already
seen, with your own eyes, that this is the exact real query shape it's
standing in for. The real payoff, named explicitly and load-bearing for
your own stated goal: this project's engine and route code can now
target SQLite today and a real production database (PostgreSQL,
MySQL) later by changing **one connection string**, in **one file**
(`core/storage.py`) — every model and every query stays exactly as
written.

---

## Concept Unit: The Real Table, Migrated

### Project Change

- **Reference Source** — none (unchanged from Lesson 14 — this is a
  real backend addition, not reference-ported logic).
- **Files affected** — `cnc-service/core/storage.py` (rewritten),
  `cnc-service/core/tools.py` (rewritten).
- **Change type** — replace.
- **Location** — whole files.
- **Dependencies** — `sqlalchemy`, added to `requirements.txt`.

### The New Code

```python
from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session

DB_PATH = Path(__file__).resolve().parent.parent / "instance" / "cnc.db"


class Base(DeclarativeBase):
    pass


def get_engine():
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    return create_engine(f"sqlite:///{DB_PATH}")


def get_session():
    return Session(get_engine())


def init_db():
    Base.metadata.create_all(get_engine())
```

### Mechanical Walkthrough

- `DB_PATH` / `mkdir` — **(c) already established** (Lesson 14),
  unchanged.
- `class Base(DeclarativeBase): pass` — **(b) reappearing** (this
  lesson's own `Pet` lab) — this project's **one real, shared**
  declarative base; every real model (`Tool`, and any future table)
  will inherit from this exact class, so `Base.metadata` collects every
  one of them in a single place.
- `f"sqlite:///{DB_PATH}"` — **(b) reappearing** connection-URL syntax;
  **(a) worth naming**: three slashes (`sqlite:///`) followed by a real
  file *path* — SQLite's own URL convention — versus Lesson 14's own
  disposable lab, which used `sqlite:///:memory:`'s special in-memory
  marker instead of a real path.
- `get_session()` — **(a) a real, deliberate design choice**: returns a
  **new** `Session` (backed by a fresh engine/connection) on every
  call, rather than one long-lived, shared session — the identical
  reasoning already given for Lesson 14's `get_connection()`: this
  project's current, real scale doesn't need connection pooling or
  session reuse, and a fresh session per call sidesteps any real
  cross-request state-sharing risk entirely.
- `init_db()` — **(a) a real, important detail worth naming
  explicitly**: `Base.metadata.create_all(...)` only creates tables for
  models that have **already been imported** somewhere by the time it
  runs (Python only registers a class with `Base.metadata` when the
  class *definition itself* executes, which requires the module
  defining it to have been imported). This project's real, correct
  order — `app.py` imports `core.tools` (which defines `Tool`) *before*
  calling `init_db()` — is what makes this work; calling `init_db()`
  before that import would silently create an empty database with no
  `tools` table at all. Verified, not assumed: this exact ordering was
  tested this session and produces the real, correct table.

### CS Lens

`Base.metadata` acting as a real, shared registry that every model
class adds itself to just by being defined is a form of **class-level
side effect via inheritance** — defining `class Tool(Base):` doesn't
just create a type, it also, as a side effect, registers that type's
real structure into `Base`'s own tracked state — a real, if implicit,
mechanism worth naming rather than treating as magic.

---

## Concept Unit: A Model That Replaces Twelve Manually-Written Columns

### The New Code

```python
from sqlalchemy import select
from sqlalchemy.orm import Mapped, mapped_column

from core.storage import Base, get_session


class Tool(Base):
    __tablename__ = "tools"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str]
    type: Mapped[str]
    subtype: Mapped[str | None]
    diameter_mm: Mapped[float]
    corner_radius_mm: Mapped[float]
    flute_length_mm: Mapped[float]
    total_length_mm: Mapped[float]
    shank_diameter_mm: Mapped[float]
    flute_count: Mapped[int]
    material: Mapped[str]
    description: Mapped[str]
    point_angle_deg: Mapped[float | None]

    def to_dict(self):
        return {
            "id": self.id, "name": self.name, "type": self.type,
            "subtype": self.subtype, "diameter_mm": self.diameter_mm,
            "corner_radius_mm": self.corner_radius_mm,
            "flute_length_mm": self.flute_length_mm,
            "total_length_mm": self.total_length_mm,
            "shank_diameter_mm": self.shank_diameter_mm,
            "flute_count": self.flute_count, "material": self.material,
            "description": self.description,
            "point_angle_deg": self.point_angle_deg,
        }
```

### Mechanical Walkthrough

- `class Tool(Base): __tablename__ = "tools"` — **(b) reappearing**
  (this lesson's own `Pet`), applied to the real table Lesson 14 built
  by hand — same real table name, same real column set, now declared
  once as a Python class instead of a `CREATE TABLE` string plus a
  separate mental model of "what fields a tool dict has."
- `subtype: Mapped[str | None]` / `point_angle_deg: Mapped[float |
  None]` — **(a) first appearance** of `Mapped[T | None]`: the **union
  with `None`** in the type annotation itself is what tells SQLAlchemy
  a column is **nullable** — the real, direct equivalent of Lesson 14's
  explicit SQL (columns *without* `NOT NULL` were nullable; here,
  *without* `| None` in the annotation, `NOT NULL` is generated
  automatically) — the same real constraint, expressed as a Python type
  instead of separate SQL keywords.
- `def to_dict(self): return {...}` — **(a) first appearance** of a
  **real method on a model class**, something Lesson 14's raw
  `sqlite3.Row` objects had no equivalent of at all (`dict(row)` worked
  generically, with no method belonging to the row itself) — `Tool`
  instances are real Python objects, so they can carry real behavior,
  not just data; this one method is what lets every route keep
  returning the exact same plain-dict shape as before, unchanged.

### CS Lens

Each `Tool` instance is a real object with identity and behavior (`.
to_dict()`), not merely a labeled tuple of values — this is the real,
substantive difference between an ORM's rows and a raw driver's rows,
and it's also a real, deliberate application of this project's very
first backend class shape (`Parser`, `MachineState`, Lesson 4/5):
behavior belongs on the object whose data it acts on.

---

## Concept Unit: The Same Three Functions, Rewritten

### The New Code

```python
def insert_tool(tool):
    with get_session() as session:
        session.add(Tool(**tool))
        session.commit()


def list_tools():
    with get_session() as session:
        rows = session.execute(select(Tool).order_by(Tool.id)).scalars().all()
        return [row.to_dict() for row in rows]


def get_tool_by_name(name):
    with get_session() as session:
        row = session.execute(
            select(Tool).where(Tool.name == name)
        ).scalar_one_or_none()
        return row.to_dict() if row else None


def seed_tools_if_empty():
    with get_session() as session:
        existing = session.execute(select(Tool)).scalars().first()
    if existing is None:
        for tool in SEED_TOOLS:
            insert_tool(tool)
```

### Mechanical Walkthrough

- `with get_session() as session:` — **(a) first appearance** of
  `Session` used as a **context manager**: guarantees the session is
  properly closed when the block ends, even if an error occurs inside
  it — the object-oriented cousin of Lesson 14's explicit
  `connection.close()` calls, now automatic.
- `Tool(**tool)` — **(a) first appearance** of constructing a model
  instance from a plain dict via `**` unpacking (Lesson 9's own dict-
  unpacking concept, here unpacking keyword arguments into a real
  class constructor instead of building a dict). **A real, verified
  fact, worth naming as a genuine improvement over Lesson 14's raw
  version**: if `tool` contains any key that isn't a real column on
  `Tool`, this line raises a real `TypeError` — *"'unexpected_field' is
  an invalid keyword argument for Tool"*, confirmed this session —
  whereas Lesson 14's hand-written `INSERT INTO tools (name, type,
  ...)` silently **ignored** any extra dict key not in its explicit
  column list. The ORM is *stricter* here, by construction, not by
  extra validation code this project had to write.
- `select(Tool).where(Tool.name == name)` — **(b) reappearing** (this
  lesson's own `Pet` lab), now the real lookup Lesson 14 wrote as
  `"SELECT * FROM tools WHERE name = ?"` — identical real behavior,
  including safety: `Tool.name == name` **always** compiles to a real
  parameterized query, confirmed this session with the exact same
  malicious input Lesson 14 used
  (`"x' OR '1'='1"` → `get_tool_by_name` correctly returns `None`, not
  every row) — proof the ORM's query API is safe *by construction*,
  with no `?` for a future caller to forget to type.
- `.scalar_one_or_none()` — **(a) first appearance** — expects **zero
  or one** matching row; returns the real object, or `None` if none
  matched (would raise a real error if *more than one* matched,
  correctly treating that as a genuine data problem rather than
  silently picking one — not reachable here since `name` isn't
  declared unique yet, a real, honest, small gap worth naming: a future
  lesson should add a real `UNIQUE` constraint on `Tool.name`).
- `seed_tools_if_empty` — **(c) already established** shape (Lesson
  14), `session.execute(select(Tool)).scalars().first()` replacing the
  raw `SELECT COUNT(*)` — a real, deliberate simplification: fetching
  one row and checking for `None` is simpler to read than a separate
  count query, at the honest cost of a marginally less efficient query
  if the table were ever huge (not a real concern at this project's
  current, real scale).

### Execution Trace

`seed_tools_if_empty()` against a fresh, empty table, then a second
call against the now-populated one:

```
First call:
  with get_session() as session:
    existing = session.execute(select(Tool)).scalars().first()
    → no rows in the table yet → existing = None
  existing is None?  → True
  for tool in SEED_TOOLS:  (4 real tools, same data as Lesson 14)
    tool={name:"end_mill_4fl", ...}: insert_tool(tool)
      → with get_session() as session: session.add(Tool(**tool)); session.commit()
      → 1 real row written
    tool={name:"end_mill_2fl", ...}: insert_tool(tool) → 2nd row written
    tool={name:"ball_mill_4fl", ...}: insert_tool(tool) → 3rd row written
    tool={name:"drill_hss", ...}: insert_tool(tool) → 4th row written
  → table now has 4 real rows

Second call (e.g. a server restart):
  existing = session.execute(select(Tool)).scalars().first()
    → the table now has rows → existing = <Tool id=1, name="end_mill_4fl">
  existing is None?  → False → the for loop never runs
  → still exactly 4 rows, nothing re-inserted
```

`.first()` only ever needs to find *one* row to prove the table isn't
empty — it doesn't matter which one, which is why the check works
identically whether the table has 1 row or 10,000.

### Commands and Real Output — Full Regression, Verified Live

```
GET /api/tools           -> real 4 tools (fresh DB, seeded via the ORM)
GET /api/tools/drill_hss -> 200, real tool
POST /api/tools (valid, plus one unexpected field) -> 201, extra field
                                                        silently dropped
                                                        by app.py's own
                                                        allow-list filter
                                                        before it ever
                                                        reaches Tool(**tool)
```
The real server process was killed and restarted completely, this
session — `face_mill_50` (created via `POST` before the restart) still
exists afterward, real tool count `5`, not reseeded — identical real
persistence guarantee to Lesson 14, now provided by the ORM version.
Every other existing route (`/api/status`, `/api/tokenize`,
`/api/parse`, `/api/simulate`, `/api/path`) and `segments.test.ts`'s
four tests were re-verified, unaffected by this entirely backend-
internal change.

---

## Concept Unit: A Route That Now Has to Filter What It Passes Along

### The New Code

```python
OPTIONAL_TOOL_FIELDS = ("subtype", "point_angle_deg")
ALLOWED_TOOL_FIELDS = REQUIRED_TOOL_FIELDS + OPTIONAL_TOOL_FIELDS

# ...
    tool = {field: body[field] for field in ALLOWED_TOOL_FIELDS if field in body}
    insert_tool(tool)
    return {"tool": get_tool_by_name(tool["name"])}, 201
```

### Mechanical Walkthrough

- `ALLOWED_TOOL_FIELDS = REQUIRED_TOOL_FIELDS + OPTIONAL_TOOL_FIELDS` —
  **(b) reappearing** tuple concatenation (already-known basic Python);
  a real, explicit **allow-list** — the same instinct as Lesson 4's
  `_SUPPORTED_WORDS`, applied here to request-body fields.
- `{field: body[field] for field in ALLOWED_TOOL_FIELDS if field in
  body}` — **(a) first appearance** of a **dict comprehension**.
  *(Full standalone treatment: ../concepts/python-dict-comprehension.md.)*
  Builds
  a brand-new dict containing only the real, known-safe fields present
  in the client's body — anything else the client sent (a typo'd field
  name, a genuinely unexpected one) is silently dropped **before**
  `insert_tool` ever sees it, which is what keeps this route from
  hitting the real `TypeError` demonstrated above, live, in production
  use — the crash is real and correctly possible when calling
  `insert_tool` directly (proven), but never reachable through this
  route, because the route's own filtering makes it unreachable.

### Execution Trace

The comprehension against a real request body with one genuinely
unexpected field (`"unexpected_field"`, the exact case that raises a
real `TypeError` when it reaches `Tool(**tool)` unfiltered):

```
body = {"name": "face_mill_50", "type": "Face Mill", "diameter_mm": 50,
        "corner_radius_mm": 0, "flute_length_mm": 20, "total_length_mm": 60,
        "shank_diameter_mm": 12, "flute_count": 4, "material": "Carbide",
        "description": "test", "unexpected_field": "danger"}

ALLOWED_TOOL_FIELDS has 12 entries (10 required + 2 optional); for each:
  "name" in body?              → Yes → tool["name"] = "face_mill_50"
  "type" in body?               → Yes → tool["type"] = "Face Mill"
  "diameter_mm" in body?        → Yes → tool["diameter_mm"] = 50
  ... (the other 6 required fields, all present) → all included
  "subtype" in body?            → No  → not included
  "point_angle_deg" in body?    → No  → not included

"unexpected_field" is never checked at all — it isn't in
ALLOWED_TOOL_FIELDS, so the comprehension never even asks whether it's
in body.

tool = {"name": "face_mill_50", "type": "Face Mill", "diameter_mm": 50,
        "corner_radius_mm": 0, "flute_length_mm": 20, "total_length_mm": 60,
        "shank_diameter_mm": 12, "flute_count": 4, "material": "Carbide",
        "description": "test"}
  → "unexpected_field" and "danger" are gone — never copied into `tool`
  → insert_tool(tool) → Tool(**tool) succeeds, no TypeError
```

The comprehension iterates the *allow-list*, not the incoming body —
that's the entire mechanism: a field the client sends is only ever
copied over if its name appears in `ALLOWED_TOOL_FIELDS`, regardless of
what else is present in `body`.

### SE Lens

This is a real, concrete instance of **defense in depth**, restated
from Lesson 14: the ORM's own strictness (rejecting unknown keyword
arguments) is a real safety net, but relying on it alone here would
mean a route bug (forgetting this filter) surfaces as an ugly `500`
instead of a clean, intentional response. Filtering explicitly, at the
boundary, means the ORM's strictness is a backstop this project
verified exists, not the primary defense this route depends on.

## Connect the Pieces

1. `app.py` imports `core.tools`, which defines `Tool(Base)` —
   registering it with `Base.metadata` as a side effect of the class
   itself being defined.
2. `init_db()` runs, now correctly creating a real `tools` table because
   `Tool` was already registered by the time it's called.
3. `seed_tools_if_empty()` checks via a real `select(Tool)` query;
   finding none, inserts the four real, cited seed tools — the exact
   values Lesson 14 already verified, now travelling through `Tool(
   **tool)` instead of a raw `INSERT` string.
4. A client `POST`s a new tool with one extra, unexpected field; the
   route's own dict comprehension drops it; `insert_tool` receives only
   real, known fields; `Tool(**tool)` succeeds.
5. The server is killed and restarted; `GET /api/tools/face_mill_50`
   still returns the real row — the identical real persistence
   guarantee Lesson 14 first proved, now running through the ORM.

## What Breaks Without This

Already demonstrated in full, live, this lesson: calling `insert_tool`
directly with an unexpected extra key raises a real `TypeError`
("invalid keyword argument for Tool") — the ORM's own real strictness,
verified rather than assumed, and the reason `app.py`'s route filters
its input explicitly rather than trusting that strictness alone to
produce a clean HTTP response.

## Exercises

1. Add a real, new column to `Tool` (e.g., `coating: Mapped[str |
   None]`), matching a real field the reference's own `ToolDefinition`
   doesn't even have — invent a genuinely new one, named honestly as
   this project's own addition, not a port. Restart the server with the
   *existing* `instance/cnc.db` still present (don't delete it) and
   observe what actually happens — does the new column appear, error,
   or silently not exist? Explain why, from `Base.metadata.create_all`'s
   own real behavior (`CREATE TABLE IF NOT EXISTS` — SQLAlchemy's
   version of this has the identical real limitation Lesson 14 already
   named: it does not alter an *existing* table's columns). *(Full
   standalone treatment of what a real migration tool — like Alembic,
   SQLAlchemy's own companion — adds here:
   ../concepts/database-migrations.md.)*
2. Change `get_tool_by_name`'s `.scalar_one_or_none()` to
   `.scalar_one()` and call it with a name that doesn't exist. Read the
   real exception SQLAlchemy raises and explain, from this unit's own
   walkthrough, why that's the *wrong* method to use here.
3. In a Python shell, create two `Tool` instances with the same real
   `name` and insert both. Confirm the database accepts it (no `UNIQUE`
   constraint exists yet), then call `get_tool_by_name` on that shared
   name and observe what actually happens — a real, honest gap this
   lesson named but didn't close.

## Definition of Done

- [ ] `core/storage.py` defines `Base`/`get_engine`/`get_session`/
      `init_db`; `core/tools.py`'s `Tool` model replaces every raw SQL
      string from Lesson 14.
- [ ] `core/` still imports nothing from `flask`.
- [ ] All `/api/tools*` routes verified with real requests, identical
      behavior to Lesson 14.
- [ ] You killed the real server process, restarted it, and confirmed a
      tool created beforehand still exists — through the ORM this time.
- [ ] You reproduced the real `TypeError` from an unexpected field
      calling `insert_tool` directly, and confirmed the live route never
      hits it because of its own explicit filtering.
- [ ] You confirmed the ORM's query API is safe against the same real
      injection payload from Lesson 14, with no `?` written by hand.
- [ ] You completed Exercises 1–3.
- [ ] Full regression: every other route and `segments.test.ts`'s four
      tests still pass, untouched.
- [ ] A git commit exists explaining *why* (the same real persistence
      now goes through a real ORM, understood because the raw SQL it
      generates was already written and verified by hand first, and
      ready to target a real production database later by changing one
      connection string).
