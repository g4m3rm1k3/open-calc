# Concept: SQLAlchemy `TypeDecorator` (Custom Column Types)

**What you'll understand by the end:** how to teach an ORM to store a Python type it has no built-in mapping for, by writing the two conversion functions that sit between "the Python value your code works with" and "the raw bytes the database actually stores."

**Prerequisites:** `orm-object-relational-mapping.md`, `sqlalchemy-mapped-column-types.md`, `uuid-byte-order.md`.

## The Problem

SQLAlchemy knows how to map Python's `int`, `str`, `float`, and a handful of other built-in types directly onto SQL column types — that's what `Mapped[int]`/`Mapped[str]` already do, no extra work required. But a `uuid.UUID` has no such built-in mapping, and SQLite has no native UUID column type at all. Something has to define, explicitly, exactly how a `uuid.UUID` Python object turns into bytes going *into* the database, and exactly how those same bytes turn back into a `uuid.UUID` coming *out* — and that conversion needs to run automatically, every time, without every piece of code that touches the column having to remember to call it by hand.

## The Isolated Example

```python
import uuid
from sqlalchemy import create_engine, select
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, Session
from sqlalchemy.types import BINARY, TypeDecorator

class GUID(TypeDecorator):
    impl = BINARY(16)
    cache_ok = True

    def process_bind_param(self, value, dialect):
        if value is None:
            return None
        return value.bytes_le

    def process_result_value(self, value, dialect):
        if value is None:
            return None
        return uuid.UUID(bytes_le=value)

class Base(DeclarativeBase):
    pass

class Widget(Base):
    __tablename__ = "widgets"
    id: Mapped[uuid.UUID] = mapped_column(GUID, primary_key=True)
    name: Mapped[str]

engine = create_engine("sqlite:///:memory:")
Base.metadata.create_all(engine)

wid = uuid.uuid4()
with Session(engine) as session:
    session.add(Widget(id=wid, name="bracket"))
    session.commit()
    row = session.execute(select(Widget)).scalar_one()
    print(type(row.id), row.id)
    print(row.id == wid)

raw = engine.raw_connection()
cur = raw.cursor()
cur.execute("SELECT id FROM widgets")
print(type(cur.fetchone()[0]))
```

**Real output:**
```
<class 'uuid.UUID'> 90cb34b3-4252-4f71-97a4-34aefac1f9bd
True
<class 'bytes'>
```

**What this proves:** the ORM layer hands back a real `uuid.UUID` object (`row.id`), equal to the original `wid` that was inserted — but querying the *raw* underlying SQLite connection directly (bypassing the ORM) shows the actual stored value is plain `bytes`. `GUID` is invisibly converting in both directions at exactly the boundary between "Python object" and "database bytes," and nowhere else.

## Mechanical Walkthrough

- `class GUID(TypeDecorator):` — **subclassing**, a reappearing concept: `GUID` inherits `TypeDecorator`'s machinery and only overrides the specific pieces that differ.
- `impl = BINARY(16)` — declares what SQL type actually backs this column underneath (a fixed 16-byte binary field — a UUID is always exactly 16 bytes). `TypeDecorator` handles storing/retrieving that underlying type; `GUID` only needs to describe the *conversion* on either side of it.
- `cache_ok = True` — tells SQLAlchemy this type's conversion behavior is deterministic (the same input always produces the same output), which lets it safely cache compiled SQL statements that use this column — a real performance opt-in, not a required-but-arbitrary flag.
- `process_bind_param(self, value, dialect)` — called automatically every time a `GUID` value is about to be **sent to** the database (an INSERT, an UPDATE, a WHERE clause comparison). "Bind param" names *what* this converts: a Python value being bound into a parameterized SQL statement (see `sql-parameterized-queries-injection.md`) in place of a `?` placeholder.
- `process_result_value(self, value, dialect)` — the reverse: called automatically every time a `GUID` column's raw stored value comes **back from** a query, before the ORM hands it to your code.
- `value.bytes_le` / `uuid.UUID(bytes_le=value)` — the actual conversion logic, already taught in isolation in `uuid-byte-order.md`; this file is entirely about the SQLAlchemy *wiring*, not the byte-order concept itself.
- `Mapped[uuid.UUID] = mapped_column(GUID, primary_key=True)` — a reappearing pattern from `sqlalchemy-mapped-column-types.md`, except the type argument is `GUID` (the custom type just defined) instead of a bare Python type SQLAlchemy already knows.

## CS Lens

This is a **boundary adapter** — code whose entire job is translating between two representations of the same information at the exact seam where one system hands data to another, so that neither side needs to know the other's representation. The same shape as `_tool_to_dict` in this project's own `core/tools.py` (converting ORM objects into plain JSON-serializable dicts at the API boundary) or `orm-object-relational-mapping.md`'s whole premise, just narrowed down to a single column instead of a whole model.

Also recognized in: Django's custom model field classes (`to_python`/`get_prep_value`), Rust's `serde` `Serialize`/`Deserialize` traits, and any "codec" pattern generally — one function per direction, always paired, always at the exact crossing point.

## SE Lens

The alternative — store the UUID as a plain 36-character string (`str(uuid.uuid4())`) instead of writing a custom binary type — is real and simpler (no `TypeDecorator` needed at all, since `Mapped[str]` already works). The tradeoff: a string column takes roughly twice the storage of a 16-byte binary one, and — the reason this project specifically needs binary, not just any binary encoding — a real Mastercam `.TOOLDB` file stores its own GUIDs as raw 16-byte blobs in a specific byte order (`uuid-byte-order.md`), so matching that exact representation is what makes importing a real file's rows directly (byte-for-byte) possible later, without a conversion pass. A `TypeDecorator` is real, permanent complexity carried for that specific, concrete future payoff — not a default to reach for whenever a convenient built-in type would do.

## Connection

Builds on `orm-object-relational-mapping.md` and `sqlalchemy-mapped-column-types.md`; the actual conversion logic inside it is `uuid-byte-order.md`, applied. Used throughout this project's `core/tools.py` — every `TlTool`/`TlToolMill`/`TlAssemblyItem` row's primary key is a `GUID` column. Contrasted directly in `json-text-column-serialization.md` — the identical real conversion idea (a Python value ↔ a storable column representation), performed manually and explicitly instead of through this file's own automatic ORM hook, for a real, separate application (a different codebase modeling the identical real Mastercam tool-library schema this file's own citation draws from, deliberately using plain `sqlite3` with no ORM at all).

## Try It Yourself

1. Remove the `cache_ok = True` line and run the example again — SQLAlchemy emits a real warning about uncachable types; read it and confirm it explains exactly why this flag exists.
2. Change `process_bind_param` to use `.bytes` instead of `.bytes_le`, insert a row, then read the raw stored bytes directly (as the example's last block does) and compare them against what `.bytes_le` would have produced for the same UUID — confirm they're genuinely different byte sequences for the same logical value.
3. Add a second custom `TypeDecorator` for a different Python type SQLAlchemy has no built-in mapping for (a `datetime.date` stored as a Unix-timestamp integer, for instance) and confirm round-tripping it through a real table works the same way.
