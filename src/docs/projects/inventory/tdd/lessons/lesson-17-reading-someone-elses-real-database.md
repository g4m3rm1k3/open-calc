# Lesson 17: Reading Someone Else's Real Database

## What you will build

`core/tools.py` and `cnc-web/src/ToolCardList.tsx`, rebuilt three times
in one lesson, each time closer to real: first a faithful port of the
reference's tool-number-keyed card list (closing the name-keyed mismatch
Lesson 13 shipped), then a rename of every field to a self-documenting
name with a real, typed validation layer at the API boundary, then a
full rebuild on top of a real, external schema — a genuine Mastercam
`.TOOLDB` export, read directly with `sqlite3`, its actual tables and
foreign keys traced by hand until a real design (GUID-keyed "Class Table
Inheritance," confirmed against real data, not guessed at) emerged. The
transferable problem this lesson is actually about: **reading an
unfamiliar, undocumented real schema is its own skill**, separate from
writing one — and a design decision made from an assumption ("no
per-tool unit flag exists"), instead of from re-checking the data, is
exactly the kind of mistake this project's own discipline exists to
catch, demonstrated for real, mid-lesson, when it happened.

## What you need to know first

Lesson 13: the original, wrong, name-keyed tools table (`ToolTable.tsx`,
`core/tools.py`) — that mismatch is what gets closed here. Lesson 14/15:
raw `sqlite3`, then a real SQLAlchemy ORM (`Mapped`, `mapped_column`,
`Session`, `select`) — this lesson's models build directly on that
foundation, adding relationships and a custom column type it didn't
need yet. Lesson 7: Flask's request/response cycle, `request.get_json`.

## Concepts cataloged from this lesson

Full standalone treatments live in `../concepts/`. Pointers to each are
also placed inline at their point of use below.

- `../concepts/python-dataclasses.md`
- `../concepts/uuid-byte-order.md`
- `../concepts/sqlalchemy-typedecorator-custom-column-type.md`
- `../concepts/sqlalchemy-relationship-back-populates.md`
- `../concepts/shared-primary-key-table-inheritance.md`
- `../concepts/orm-cascade-delete-vs-core-delete.md`
- `../concepts/python-isinstance.md` — reappearing, extended (a tuple of
  allowed types, plus the `bool`-is-an-`int` guard).
- `../concepts/input-validation-at-boundary.md` — reappearing, extended
  (a declarative, data-driven schema instead of one hard-coded check).
- `../concepts/typescript-record-utility-type.md` — new; `ToolCardList.tsx`'s
  `Record<string, Tool>` is this project's first typed keyed-lookup object.
- `../concepts/flask-url-path-parameters.md`,
  `../concepts/http-status-codes.md`,
  `../concepts/react-usestate-hook.md`,
  `../concepts/react-useeffect-hook.md`,
  `../concepts/react-key-prop-reconciliation.md`,
  `../concepts/fetch-api.md`,
  `../concepts/typescript-interfaces.md`,
  `../concepts/css-custom-properties.md`,
  `../concepts/css-rule-syntax-selectors-cascade.md`,
  `../concepts/python-leading-underscore-convention.md`,
  `../concepts/flask-implicit-dict-to-json.md`,
  `../concepts/serialization-deserialization.md` — all reappearing,
  applied to this lesson's real routes/frontend/CSS, not re-taught.

## No pipeline diagram change

The tools table is persistence, not part of the `Text → Tokens →
Commands → Machine State → Points → Picture` pipeline — same as Lessons
14–15.

---

## Concept Unit: Meaningful Names and the Canonical-Unit Invariant

### The Problem

Lesson 13's fix started simple: `cnc-web/src/ToolTable.tsx` was a bare
`<table>` keyed by an invented `name` field; the real reference
(`cnc-sim/cnc/components/ToolCardList.jsx`) is a card list keyed by real
tool number. Porting that faithfully was the easy part. What came next
wasn't a reference-reading problem at all — it was a live design review
of the port's own field names, and it's worth teaching as its own unit
because the two mistakes caught here are common, real, and not specific
to this project.

### Reference Source

`cnc-sim/cnc/components/ToolCardList.jsx` (full file, already read
Lesson 13) — real field names `n`, `dia`, `cr`, `mat`, `desc`, short
because they're JavaScript object properties read constantly in JSX;
no reference counterpart for what this unit actually changes, since
this project's own field *names* (not values) are a deliberate
departure, not a port.

### The New Code

The first backend shape, direct from the reference's own short names:

```python
class Tool(Base):
    __tablename__ = "tools"
    n: Mapped[int] = mapped_column(primary_key=True)
    type: Mapped[str]
    dia: Mapped[float]
    ...
```

Caught live: *"I don't know what that is — it could be name, it could
be number... there are no types so I don't know if its a string or an
int."* Renamed to full words:

```python
class Tool(Base):
    __tablename__ = "tools"
    tool_number: Mapped[int] = mapped_column(primary_key=True)
    tool_type: Mapped[str]
    diameter_mm: Mapped[float]
    ...
```

Caught live *again*, one message later: *"why do we default to mm...
if we add a material do we have diameter_mm_carbide?"* — the `_mm`
suffix repeats the same mistake one level down, just with units instead
of an abbreviation.

### The Fix, in Both Directions

```python
diameter: Mapped[float]          # always mm — a global convention,
                                  # documented once, not per field
```

### Mechanical Walkthrough

- `n` → `tool_number` — **(a) first appearance of a real naming
  principle**: a name should tell a reader what a value *is* without
  requiring them to already know the source it was copied from. `n`
  is legal Python, compiles, runs — and answers nothing.
- `diameter_mm` → `diameter` — **(a) a second, more subtle case of the
  same principle**: encoding a *unit* into a field name asserts that
  the unit is a property of that specific field, capable of varying
  row to row. It isn't, here — every dimension in this table is always
  mm, by convention, for the whole table. A name that implies
  variability where none exists invites exactly the problem it was
  asked about: a second field (`diameter_in`) the moment inch storage
  seemed needed, when nothing about the *data* actually required one.

### CS Lens

This is the difference between a value's **type** and a value's
**unit** — related but distinct. A type system (even Python's informal
one, via `Mapped[float]`) already answers "what kind of value is this."
A unit is a separate fact about *what that number means*, and belongs
either in documentation once, at the table level, or in a genuine
per-row field only when it genuinely varies per row — never smuggled
into the identifier itself, where it can't be checked, only read.

Also recognized in: NASA's 1999 Mars Climate Orbiter, lost because one
team's software produced pound-force-seconds and another consumed
newton-seconds with no unit ever checked in between — the industry's
most famous case of exactly this class of mistake, at read no code
review caught because nothing in either system's *names* forced the
question.

### SE Lens

The alternative — leave the reference's own short names in place,
since they're real and already used consistently there — is real,
working code; nothing about `n`/`dia` is a bug. The tradeoff is pure
readability debt, paid by every future reader (including this
project's own author, months later) who has to either remember or
re-derive what each one means. Renaming cost two small, mechanical
passes through one file; the alternative cost compounds forever,
silently, every time the file is read again.

---

## Concept Unit: `@dataclass` for a Validation Schema

*(Full standalone treatment: ../concepts/python-dataclasses.md.)*

### The Problem

A tool's API request body has ten-plus fields, some required, some
optional, each a specific type. Writing that as a flat tuple of field
names (as the very first version of this route did) answers "is this
field present" but nothing about what *type* it should be — exactly
the gap that prompted the naming conversation above to keep going:
*"there are no types."*

### The Concept, Isolated

Full standalone lab in `../concepts/python-dataclasses.md`. Not
repeated here — reused directly, at its very next appearance, on real
project data.

### Project Change

- **Reference Source** — none. No reference counterpart: the original
  reference app has no backend at all (`ms.tools` lives in React
  state), so there is no real API validation layer to port.
- **Files affected** — `cnc-service/app.py`.
- **Change type** — add.
- **Location** — top of the file, before any route.
- **Dependencies** — `dataclasses`, standard library, no install needed.

### The New Code

```python
@dataclass(frozen=True)
class ToolField:
    name: str
    allowed_types: tuple[type, ...]
    required: bool
```

### The Updated Project

```python
from dataclasses import dataclass

# ... imports ...

@dataclass(frozen=True)
class ToolField:
    name: str
    allowed_types: tuple[type, ...]
    required: bool


NUMBER = (int, float)

TOOL_FIELDS: tuple[ToolField, ...] = (
    ToolField("tool_number", (int,), required=True),
    ToolField("name", (str,), required=True),
    ToolField("is_metric", (bool,), required=True),
    ToolField("diameter", NUMBER, required=True),
    ToolField("total_length", NUMBER, required=True),
    ToolField("flute_count", (int,), required=True),
    ToolField("cutting_depth", NUMBER, required=True),
    ToolField("arbor_diameter", NUMBER, required=True),
    ToolField("corner_radius", NUMBER, required=False),
    ToolField("tip_angle", NUMBER, required=False),
    ToolField("material", (str,), required=False),
    ToolField("manufacturer", (str,), required=False),
)
```

`TOOL_FIELDS` is a real, complete, machine-readable description of
every field a tool request body may contain — the actual schema this
lesson's next unit validates against.

### Mechanical Walkthrough

- `@dataclass(frozen=True)` — **(a) first appearance**, full treatment
  in the concept file. `frozen=True` specifically, here, because
  `ToolField` describes a fixed fact about the API's own shape — it
  should never be mutated once defined, and `frozen=True` makes that a
  real, enforced guarantee, not just a convention.
- `allowed_types: tuple[type, ...]` — **(a) first appearance** of
  `tuple[type, ...]` as a type annotation: a tuple of an unspecified
  number of `type` objects (`int`, `str`, `bool` are themselves values
  of type `type` in Python) — this is what lets one field accept
  `(int, float)` and another accept just `(str,)`.
- `TOOL_FIELDS: tuple[ToolField, ...] = (...)` — **(c) already
  established** tuple-literal syntax, applied to a tuple of the
  `ToolField` instances just defined.

### CS Lens

This is **data-driven design** — instead of writing one `if` statement
per field (imperative, one branch per case), the *rules themselves*
are data (a tuple of `ToolField` records), and a single, generic loop
(next unit) interprets that data the same way regardless of how many
fields exist or what changes about them. Adding a thirteenth field
later means adding one more `ToolField(...)` line, not writing a new
branch of logic.

Also recognized in: HTML form-validation libraries that take a schema
object rather than per-field code, JSON Schema itself, and any
"config, not code" system generally — the recurring tradeoff being
genericity and extensibility (this unit) purchased at the cost of one
extra layer of indirection (the next unit has to interpret the data,
rather than the logic being readable inline).

### SE Lens

The alternative — the flat tuple-of-names this route started with —
is fewer lines and needs no separate interpreting step. It answers
exactly one question ("is this key present") and nothing else. The
real, concrete cost of *not* upgrading it: every new requirement (a
type check, a mutual-exclusivity rule between two fields, the
`bool`-vs-`int` guard the next unit adds) would have had to be another
hand-written `if`, with no shared structure tying them together — the
data-driven version was chosen specifically because more than one such
rule was about to be needed, not preemptively.

---

## Concept Unit: Schema-Driven Type Validation at a Boundary

*(Reappearing concepts, extended: `../concepts/python-isinstance.md`,
`../concepts/input-validation-at-boundary.md`.)*

### The Problem

`TOOL_FIELDS` (previous unit) is just data until something reads it
and actually rejects a malformed request. And type-checking a JSON
number is genuinely trickier than it first looks: Python's `bool` is a
real subclass of `int`, so a naive `isinstance(value, (int, float))`
check silently accepts `True`/`False` as valid numbers — already named
as a real gotcha in `python-isinstance.md`'s own exercises, and now
something this project's real code has to actually guard against, not
just know about.

### Project Change

- **Reference Source** — none (same reasoning as the previous unit).
- **Files affected** — `cnc-service/app.py`.
- **Change type** — add.
- **Location** — directly below `TOOL_FIELDS`.
- **Dependencies** — none beyond the previous unit.

### The New Code

```python
def validate_tool_body(body):
    errors = []
    for field in TOOL_FIELDS:
        if field.name not in body:
            if field.required:
                errors.append(f"missing required field: {field.name}")
            continue
        value = body[field.name]
        is_bool_where_unwanted = isinstance(value, bool) and bool not in field.allowed_types
        if is_bool_where_unwanted or not isinstance(value, field.allowed_types):
            type_names = " or ".join(t.__name__ for t in field.allowed_types)
            errors.append(f"{field.name} must be {type_names}, got {type(value).__name__}")
    return errors
```

### The Updated Project

```python
def validate_tool_body(body):
    """Returns a list of human-readable error strings; empty means valid."""
    errors = []
    for field in TOOL_FIELDS:
        if field.name not in body:
            if field.required:
                errors.append(f"missing required field: {field.name}")
            continue
        value = body[field.name]
        is_bool_where_unwanted = isinstance(value, bool) and bool not in field.allowed_types
        if is_bool_where_unwanted or not isinstance(value, field.allowed_types):
            type_names = " or ".join(t.__name__ for t in field.allowed_types)
            errors.append(
                f"{field.name} must be {type_names}, got {type(value).__name__}"
            )
    if "corner_radius" in body and "tip_angle" in body:
        errors.append("corner_radius and tip_angle are mutually exclusive (endmill vs. drill)")
    if "corner_radius" not in body and "tip_angle" not in body:
        errors.append("must include exactly one of corner_radius (endmill) or tip_angle (drill)")
    return errors
```

`validate_tool_body` is now the single real gate every tool creation
passes through — one generic loop over `TOOL_FIELDS`, plus two rules
(mutual exclusivity) that don't fit the per-field shape and are stated
directly instead.

### Mechanical Walkthrough

- `for field in TOOL_FIELDS:` — **(c) already established** iteration
  over a tuple.
- `if field.name not in body:` — **(b) reappearing**, the same
  presence check `input-validation-at-boundary.md` already taught,
  now run once per declared field instead of once for a whole object.
- `isinstance(value, bool) and bool not in field.allowed_types` — **(a)
  first real, enforced use** of the `bool`-subclass-of-`int` gotcha
  `python-isinstance.md`'s own exercises already named as a fact —
  here it's an actual guard, not just an observation: without it,
  `{"tool_number": true}` would silently pass a bare `isinstance(value,
  (int,))` check, since `True` really is an `int` as far as Python's
  type system is concerned.
- `isinstance(value, field.allowed_types)` — **(b) reappearing**, the
  tuple-of-types form of `isinstance` `python-isinstance.md`'s own
  Mechanical Walkthrough already covered — used here for real, driven
  by data instead of a literal tuple typed inline.
- `" or ".join(t.__name__ for t in field.allowed_types)` — **(a) first
  appearance** of `.join` on a **generator expression** (`t.__name__
  for t in ...`, no square brackets — lazily produced, not a full list
  built first) — produces `"int or float"` from `(int, float)`.
- The two `if` blocks after the loop — **(c) already established**
  membership checks (`in body`), composed into two new, real business
  rules specific to this project's tool shape (a tool is either an
  endmill or a drill, never both, never neither).

### Execution Trace

The loop against the real second test case below —
`{"tool_number": 7, "name": "x", "is_metric": True, "diameter": True,
"total_length": 50, "flute_count": 2, "cutting_depth": 20,
"arbor_diameter": 5, "corner_radius": 0}` — traced field by field, in
`TOOL_FIELDS`' own declared order:

```
errors = []

field=ToolField("tool_number",(int,),required=True):
  "tool_number" in body? Yes. value=7.
  isinstance(7, bool)? No → is_bool_where_unwanted=False
  isinstance(7, (int,))? Yes → not True = False → no error

field=ToolField("name",(str,),required=True):
  "name" in body? Yes. value="x". isinstance("x",(str,))? Yes → no error

field=ToolField("is_metric",(bool,),required=True):
  "is_metric" in body? Yes. value=True.
  isinstance(True, bool)? Yes. bool not in (bool,)? False → is_bool_where_unwanted=False
  isinstance(True, (bool,))? Yes → no error   (bool IS the allowed type here)

field=ToolField("diameter", NUMBER=(int,float), required=True):
  "diameter" in body? Yes. value=True.
  isinstance(True, bool)? Yes. bool not in (int,float)? True
    → is_bool_where_unwanted = True and True = True
  is_bool_where_unwanted or not isinstance(...)? → True → ERROR:
    type_names = "int or float"
    errors.append("diameter must be int or float, got bool")

field=ToolField("total_length", NUMBER, required=True):
  value=50. isinstance(50,bool)? No. isinstance(50,(int,float))? Yes → no error

field=ToolField("flute_count",(int,),required=True): value=2 → no error
field=ToolField("cutting_depth",NUMBER,required=True): value=20 → no error
field=ToolField("arbor_diameter",NUMBER,required=True): value=5 → no error
field=ToolField("corner_radius",NUMBER,required=False): value=0 → no error
field=ToolField("tip_angle",NUMBER,required=False): not in body, required=False → skipped, no error
field=ToolField("material",(str,),required=False): not in body → skipped
field=ToolField("manufacturer",(str,),required=False): not in body → skipped

Loop ends (all 12 fields checked). errors = ["diameter must be int or float, got bool"]

if "corner_radius" in body and "tip_angle" in body:  → True and False → False, skip
if "corner_radius" not in body and "tip_angle" not in body: → False and True → False, skip

return ["diameter must be int or float, got bool"]
```

The loop never stops early at `"diameter"` — it checks all 12 declared
fields regardless of how many already failed, which is why a body with
*multiple* type errors would come back with multiple messages at once,
the same "report everything wrong, not just the first thing" choice
Lesson 14's comprehension already made.

### Verified, Run for Real

```python
>>> validate_tool_body({"tool_number": "6", "name": "x", "is_metric": True,
...                      "diameter": 5, "total_length": 50, "flute_count": 2,
...                      "cutting_depth": 20, "arbor_diameter": 5, "corner_radius": 0})
['tool_number must be int, got str']

>>> validate_tool_body({"tool_number": 7, "name": "x", "is_metric": True,
...                      "diameter": True, "total_length": 50, "flute_count": 2,
...                      "cutting_depth": 20, "arbor_diameter": 5, "corner_radius": 0})
['diameter must be int or float, got bool']
```

Both run for real, this session, against the actual live Flask test
client — `POST /api/tools` with a string `tool_number` and with a
`bool` masquerading as a `diameter` each returned a real `400` with
exactly these messages.

### CS Lens

**Fail-fast validation** — reject malformed input at the earliest
possible point, with a specific, actionable reason, rather than
letting it propagate deeper into the system where the eventual failure
would be harder to trace back to its real cause.

### SE Lens

The alternative — skip the `bool` guard, since "nobody would actually
send `true` for a diameter" — is a real, common shortcut. The honest
cost: JavaScript's own `JSON.stringify` will happily produce `true` for
a checkbox bound to the wrong field by an honest UI bug, and without
this guard, that bug would silently create a tool with `diameter =
True` (which Python treats as `1` in most numeric contexts) instead of
failing loudly at the one point (this validator) built specifically to
catch it.

---

## Concept Unit: UUID and Byte Order

*(Full standalone treatment: ../concepts/uuid-byte-order.md.)*

### The Problem

At this point in the lesson, the project pivoted: instead of continuing
to invent this table's own shape, a real Mastercam `.TOOLDB` file
(`Untitled.TOOLDB`, a genuine SQLite export) was opened directly and
read, table by table, with the explicit goal of matching its real
schema — not an approximation of it — for whatever subset this project
actually uses. Its primary keys are GUIDs, stored as raw 16-byte blobs.
Representing a GUID correctly in this project's own SQLite table isn't
just "pick a UUID library" — it requires knowing *which* of several
real, valid binary layouts a Windows/.NET application (which Mastercam
is) actually writes.

### The Concept, Isolated

Full standalone lab in `../concepts/uuid-byte-order.md`. Not repeated
here.

### Verified Against the Real File

```python
>>> import sqlite3
>>> conn = sqlite3.connect("Untitled.TOOLDB")
>>> conn.execute("SELECT ID FROM TlTool LIMIT 1").fetchone()[0].hex()
'2d4e999b853b704d849d3f6364de82ec'
```

A real 16-byte blob, read directly from the real file this session —
confirming the target format is genuinely raw binary, not a text GUID
string, before any code was written to match it.

### CS Lens / SE Lens

Both fully covered in the concept file — reused here, not restated, per
the Repetition Rule.

---

## Concept Unit: A Custom SQLAlchemy Column Type

*(Full standalone treatment:
../concepts/sqlalchemy-typedecorator-custom-column-type.md.)*

### The Problem

Lesson 15's ORM models used only `Mapped[int]`/`Mapped[str]`/`Mapped[float]`
— types SQLAlchemy already knows how to store. `uuid.UUID`, storing
specifically as `.bytes_le` (previous unit), is not one of them. Nothing
in SQLAlchemy already knows to do this exact conversion.

### Project Change

- **Reference Source** — none (SQLAlchemy library mechanism, not a
  reference-app port).
- **Files affected** — `cnc-service/core/storage.py`.
- **Change type** — add.
- **Location** — after the existing `Base` declaration.
- **Dependencies** — `sqlalchemy.types.BINARY`/`TypeDecorator`, already
  part of the `sqlalchemy` dependency Lesson 15 added.

### The New Code

```python
class GUID(TypeDecorator):
    impl = BINARY(16)
    cache_ok = True

    def process_bind_param(self, value, dialect):
        if value is None:
            return None
        if isinstance(value, str):
            value = uuid.UUID(value)
        return value.bytes_le

    def process_result_value(self, value, dialect):
        if value is None:
            return None
        return uuid.UUID(bytes_le=value)
```

### The Updated Project

```python
import uuid
from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session
from sqlalchemy.types import BINARY, TypeDecorator

DB_PATH = Path(__file__).resolve().parent.parent / "instance" / "cnc.db"


class Base(DeclarativeBase):
    pass


class GUID(TypeDecorator):
    """A uuid.UUID stored as a 16-byte binary column."""

    impl = BINARY(16)
    cache_ok = True

    def process_bind_param(self, value, dialect):
        if value is None:
            return None
        if isinstance(value, str):
            value = uuid.UUID(value)
        return value.bytes_le

    def process_result_value(self, value, dialect):
        if value is None:
            return None
        return uuid.UUID(bytes_le=value)


def get_engine():
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    return create_engine(f"sqlite:///{DB_PATH}")


def get_session():
    return Session(get_engine())


def init_db():
    Base.metadata.create_all(get_engine())
```

`storage.py` now exports one more real, reusable piece — `GUID` — used
by every model in the next two units, alongside the same `get_engine`/
`get_session`/`init_db` Lesson 15 already built.

### Mechanical Walkthrough

Full first-appearance treatment in the concept file — this project's
real `GUID` class *is* that file's isolated example, verbatim, so
nothing here is new to re-enumerate. The one addition specific to this
project: `if isinstance(value, str): value = uuid.UUID(value)` —
**(b) reappearing** `isinstance` — lets a `GUID` column also accept a
plain UUID string, not only a `uuid.UUID` object, convenient for the
seed data and manual testing done this session.

### Verified, Run for Real

```
GET status: 200
{"tools": {"1": {..., "tool_number": 1, ...
```

The real Flask app, restarted, serving real GUID-keyed rows — the exact
verification run this session, confirming `GUID` round-trips correctly
through a real SQLite database, not just the in-memory lab.

---

## Concept Unit: Relationships Between Shared-Key Tables

*(Full standalone treatment:
../concepts/sqlalchemy-relationship-back-populates.md.)*

### The Problem

A tool's real data, per the file just read, doesn't live in one table.
Reading a tool's full geometry means joining across several — by hand,
that's a `SELECT ... JOIN ... JOIN ...` written out fresh every time
it's needed.

### The Concept, Isolated

Full standalone lab in `../concepts/sqlalchemy-relationship-back-populates.md`.
Not repeated here.

### Verified, Run for Real

```python
>>> tool = session.execute(select(TlTool).where(TlTool.ToolNumber == 1)).scalar_one()
>>> tool.mill.OverallDiameter
10.0
>>> tool.mill.endmill.CornerRadius
0.0
```

Run against the real project database, this session — `tool.mill` and
`tool.mill.endmill` navigate two real joins with no `select`/`join`
written at the call site.

---

## Concept Unit: Shared-Primary-Key Table Inheritance — Reading a Real, Undocumented Schema

*(Full standalone treatment: ../concepts/shared-primary-key-table-inheritance.md.)*

### The Problem

Knowing *that* `relationship()` can join two tables doesn't say *which*
tables to join, or on what key — and the real file has roughly eighty
of them, with no documentation shipped alongside it. The actual
structure had to be found by reading real data, not assumed from table
names alone.

### The Investigation, for Real, This Session

```python
cur.execute("SELECT name FROM sqlite_master WHERE type='table'")
# ...80 real table names, "TlTool", "TlToolMill", "TlToolEndmill", ...

for t in tables:
    cur.execute(f"PRAGMA table_info({t})")
    fk_like = [c for c in cols if c.endswith("ID") and c != "ID"]
    # every column shaped like a foreign key, across all 80 tables
```

Real output (excerpt) named exactly which tables reference which —
`TlToolMill -> ['TlGradeID', 'TlOpParamsID']`, `TlToolType ->
['TlToolGroupID']` — a real, mechanical way to map a schema's foreign
keys *without* a diagram, before finding out (from actually reading
row data, not just column names) that `TlTool`, `TlToolMill`, and
`TlToolEndmill` share the **same** primary key rather than referencing
each other by a separate foreign key column at all.

### Execution Trace

The comprehension against `TlToolMill`'s own real columns (cross-
referenced from `pragma table_info` and this same unit's own final ORM
model below: `ID`, `OverallDiameter`, `OverallLength`, `FluteCount`,
`CuttingDepth`, `ArborDiameter`, plus the two real, unmapped columns the
investigation found, `TlGradeID`/`TlOpParamsID`):

```
cols = ["ID", "OverallDiameter", "OverallLength", "FluteCount",
        "CuttingDepth", "ArborDiameter", "TlGradeID", "TlOpParamsID"]

c="ID":              ends with "ID"? Yes. c != "ID"? No  → excluded
c="OverallDiameter":  ends with "ID"? No                 → excluded
c="OverallLength":    ends with "ID"? No                 → excluded
c="FluteCount":       ends with "ID"? No                 → excluded
c="CuttingDepth":     ends with "ID"? No                 → excluded
c="ArborDiameter":    ends with "ID"? No                 → excluded
c="TlGradeID":        ends with "ID"? Yes. != "ID"? Yes   → included
c="TlOpParamsID":     ends with "ID"? Yes. != "ID"? Yes   → included

fk_like = ["TlGradeID", "TlOpParamsID"]
```

This matches the real, cited output exactly — the comprehension's own
`c != "ID"` check is specifically why the table's own primary key,
`ID`, never shows up as a false "foreign key" of itself, even though it
technically ends in the same two letters every real candidate is
filtered by.

```python
>>> [row["ID"].hex() for row in tl_tool_rows]
['2d4e999b853b704d849d3f6364de82ec', ...]
>>> [row["ID"].hex() for row in tl_tool_mill_rows]
['2d4e999b853b704d849d3f6364de82ec', ...]  # identical
```

### The New Code

```python
class TlTool(Base):
    __tablename__ = "TlTool"
    ID: Mapped[uuid.UUID] = mapped_column(GUID, primary_key=True)
    ToolNumber: Mapped[int]
    mill: Mapped["TlToolMill | None"] = relationship(back_populates="tool", uselist=False)


class TlToolMill(Base):
    __tablename__ = "TlToolMill"
    ID: Mapped[uuid.UUID] = mapped_column(GUID, ForeignKey("TlTool.ID"), primary_key=True)
    OverallDiameter: Mapped[float]
    tool: Mapped[TlTool] = relationship(back_populates="mill")
    endmill: Mapped["TlToolEndmill | None"] = relationship(back_populates="mill", uselist=False)
    drill: Mapped["TlToolDrill | None"] = relationship(back_populates="mill", uselist=False)
```

### The Updated Project

The full real chain, as it exists in `cnc-service/core/tools.py` today
— `TlTool` → `TlToolMill` → `TlToolEndmill`/`TlToolDrill`, plus the
catalog-metadata side found the same way (below):

```python
class TlTool(Base):
    __tablename__ = "TlTool"

    ID: Mapped[uuid.UUID] = mapped_column(GUID, primary_key=True)
    ToolNumber: Mapped[int]

    mill: Mapped["TlToolMill | None"] = relationship(back_populates="tool", uselist=False)
    catalog_item: Mapped["TlAssemblyItem | None"] = relationship(
        back_populates="tool", uselist=False
    )


class TlToolMill(Base):
    __tablename__ = "TlToolMill"

    ID: Mapped[uuid.UUID] = mapped_column(GUID, ForeignKey("TlTool.ID"), primary_key=True)
    OverallDiameter: Mapped[float]
    OverallLength: Mapped[float]
    FluteCount: Mapped[int]
    CuttingDepth: Mapped[float]
    ArborDiameter: Mapped[float]

    tool: Mapped[TlTool] = relationship(back_populates="mill")
    endmill: Mapped["TlToolEndmill | None"] = relationship(back_populates="mill", uselist=False)
    drill: Mapped["TlToolDrill | None"] = relationship(back_populates="mill", uselist=False)


class TlToolEndmill(Base):
    __tablename__ = "TlToolEndmill"

    ID: Mapped[uuid.UUID] = mapped_column(GUID, ForeignKey("TlToolMill.ID"), primary_key=True)
    CornerRadius: Mapped[float]

    mill: Mapped[TlToolMill] = relationship(back_populates="endmill")


class TlToolDrill(Base):
    __tablename__ = "TlToolDrill"

    ID: Mapped[uuid.UUID] = mapped_column(GUID, ForeignKey("TlToolMill.ID"), primary_key=True)
    TipAngle: Mapped[float]

    mill: Mapped[TlToolMill] = relationship(back_populates="drill")
```

Whether a given tool "is" an endmill or a drill is now answered purely
by which child table has a matching row — `tool.mill.endmill is not
None` — the same existence-based typing the real file itself uses,
with no invented discriminator column standing in for it.

### Mechanical Walkthrough

Full first-appearance treatment of the pattern itself is in the
concept file. What's specific to this project's real code: **(a) a
four-level-deep real chain** (`TlTool` → `TlToolMill` →
`TlToolEndmill`/`TlToolDrill`), one level deeper than the concept
file's own two-level `Vehicle`/`Car` example — and **(b) a genuinely
sibling pair** (`endmill`/`drill`) at the deepest level, both optional,
at most one ever populated for a given tool — this exact shape is what
the next unit's real bug turned out to depend on.

### A Second Real Discovery: Catalog Metadata Lives One Level Up

Reading `TlTool`/`TlToolMill` columns directly showed no `Name`,
`Material`, or `Manufacturer` field anywhere — a real, initially
confusing gap. Cross-referencing `TlAssemblyItem`'s own `ID` values
against `TlTool`'s real rows (not just its column list) showed they
share the *same* GUIDs: `TlAssemblyItem` is the same shared-key pattern
applied one more time, carrying a tool's real display name and its
links to `TlToolMaterial`/`TlManufacturer` — confirmed only by
following real data, not inferred from either table's schema alone.

### CS Lens / SE Lens

Both fully covered in the concept file for the pattern itself. Worth
naming here, specifically: this entire unit is an example of **reading
a system by its real behavior (actual stored data) rather than trusting
its declared structure (column/table names) to be self-explanatory** —
the same discipline this project's own `LessonContract` already
requires of reading reference UI source, applied here to a database
instead of a component tree.

---

## Concept Unit: The ORM Cascade-Delete Bug

*(Full standalone treatment: ../concepts/orm-cascade-delete-vs-core-delete.md.)*

### The Problem

Deleting a tool now means deleting across five real tables
(`TlAssemblyItem`, `TlToolEndmill`/`TlToolDrill`, `TlToolMill`,
`TlTool`) in the right order. The first, most natural-looking attempt
— `session.delete()` on each already-loaded object — hit a real
internal SQLAlchemy error the moment it actually ran.

### The Concept, Isolated

Full standalone lab, including this exact failure reproduced minimally,
in `../concepts/orm-cascade-delete-vs-core-delete.md`. Not repeated
here.

### Verified, the Real Failure, This Session

```
AssertionError: Dependency rule on column 'TlToolMill.ID' tried to
blank-out primary key column 'TlToolEndmill.ID' on instance
'<TlToolEndmill at 0x2111a412780>'
```

The real traceback, from the real `DELETE /api/tools/5` call, this
session — not a contrived error message.

### The New Code

```python
def delete_tool(tool_number):
    with get_session() as session:
        tool_id = session.execute(
            select(TlTool.ID).where(TlTool.ToolNumber == tool_number)
        ).scalar_one_or_none()
        if tool_id is None:
            return False
        session.execute(delete(TlAssemblyItem).where(TlAssemblyItem.ID == tool_id))
        session.execute(delete(TlToolEndmill).where(TlToolEndmill.ID == tool_id))
        session.execute(delete(TlToolDrill).where(TlToolDrill.ID == tool_id))
        session.execute(delete(TlToolMill).where(TlToolMill.ID == tool_id))
        session.execute(delete(TlTool).where(TlTool.ID == tool_id))
        session.commit()
        return True
```

### Verified, Fixed, This Session

```
POST T5: 201
DELETE T5: 204
GET T5 after delete: 404
final tool count: 4 ['1', '2', '3', '4']
DELETE nonexistent: 404
```

Real end-to-end run: create a fifth tool, delete it, confirm it's gone,
confirm the original four are untouched, confirm deleting an already-
gone tool number correctly 404s rather than erroring.

### CS Lens / SE Lens

Fully covered in the concept file.

---

## Concept Unit: A Live Correction — `IsMetric`

### The Problem

After the schema above shipped, a direct question — *"unless it's going
to change how we build, then I can do it sooner"* — about adding a
metric tool to the real file later exposed a real mistake: this
lesson's own earlier draft had claimed *"the real Mastercam schema
doesn't carry a per-tool unit flag."* That claim was wrong. It was
re-checked, not defended.

### The Real Correction

```python
cur.execute("PRAGMA table_info(TlAssemblyItem)")
# ['ID', 'CatalogID', 'GeometryFile', 'IsMetric', 'Location', ...]
```

`IsMetric` is a real column — on `TlAssemblyItem` (the same catalog
table the previous unit found `Name`/`Material`/`Manufacturer` on),
not on `TlTool`/`TlToolMill` where it had been assumed not to exist.

### The Fix

```python
class TlAssemblyItem(Base):
    __tablename__ = "TlAssemblyItem"

    ID: Mapped[uuid.UUID] = mapped_column(GUID, ForeignKey("TlTool.ID"), primary_key=True)
    Name: Mapped[str] = mapped_column(default="")
    IsMetric: Mapped[bool]
    TlToolMaterialID: Mapped[uuid.UUID | None] = mapped_column(
        GUID, ForeignKey("TlToolMaterial.ID"), default=None
    )
    TlManufacturerID: Mapped[uuid.UUID | None] = mapped_column(
        GUID, ForeignKey("TlManufacturer.ID"), default=None
    )
```

Threaded through `insert_tool`, `_tool_to_dict`, the API's required-
field list, and the frontend's displayed unit label (`mm` vs. `in`,
previously hardcoded to always show `mm`) — a real, visible correctness
bug the moment any non-metric tool would have existed.

### SE Lens

The alternative to re-checking — trusting the earlier claim because it
had already been written down and acted on — would have shipped a
schema silently unable to correctly label a metric tool the moment one
was actually added, exactly the scenario about to be tested. The real
cost of being wrong here wasn't the two-line fix; it was small
specifically *because* the mistake was caught before more code was
built on top of the wrong assumption, not after.

---

## Concept Unit: Completing the Catalog — Manufacturer and Material

### The Problem

`TlAssemblyItem`'s `TlToolMaterialID`/`TlManufacturerID` foreign keys
(previous unit) point at real tables that don't exist in this project
yet. Without them, nothing could actually be stored on either side of
those keys.

### Project Change

- **Reference Source** — none for the classes themselves (Mastercam's
  real schema, not a UI component); the reference app's own tool data
  (`cnc/toolTemplates.ts`'s `TOOL_TEMPLATES.mill`) has a flat `mat:
  "Carbide"` string per tool, no separate material/manufacturer tables
  at all — real motivation for building this project's own seed rows
  rather than reusing the reference's.
- **Files affected** — `cnc-service/core/tools.py`.
- **Change type** — add.

### The New Code

Two more real Mastercam tables, plus the same shared-key pattern
already proven above, applied a third time (`TlToolMaterial` shares
`TlMaterial`'s own key, exactly the way `TlToolEndmill` shares
`TlToolMill`'s):
```python
class TlManufacturer(Base):
    __tablename__ = "TlManufacturer"

    ID: Mapped[uuid.UUID] = mapped_column(GUID, primary_key=True)
    Name: Mapped[str]
    Description: Mapped[str] = mapped_column(default="")


class TlMaterial(Base):
    __tablename__ = "TlMaterial"

    ID: Mapped[uuid.UUID] = mapped_column(GUID, primary_key=True)
    Name: Mapped[str]
    Description: Mapped[str] = mapped_column(default="")


class TlToolMaterial(Base):
    __tablename__ = "TlToolMaterial"

    ID: Mapped[uuid.UUID] = mapped_column(GUID, ForeignKey("TlMaterial.ID"), primary_key=True)

    material: Mapped[TlMaterial] = relationship()
```

### The Updated Project

Real seed rows for both — deliberately this project's *own* reference
data, not copied from the sample `.TOOLDB` file:
```python
# "Generic"/"Carbide"/"HSS" are OUR seed reference rows, not copied from
# the real Mastercam file (that file's own Manufacturer/Material rows —
# "Mastercam"/"ISCAR", "Carbide" — describe ITS tools, not ours; reusing
# its rows for our own placeholder data would misattribute them).
_GENERIC_MFG_ID = uuid.uuid4()
_CARBIDE_ID = uuid.uuid4()
_HSS_ID = uuid.uuid4()

SEED_MANUFACTURERS = [{"ID": _GENERIC_MFG_ID, "Name": "Generic", "Description": "Seed data"}]
SEED_MATERIALS = [
    {"ID": _CARBIDE_ID, "Name": "Carbide", "Description": "Seed data"},
    {"ID": _HSS_ID, "Name": "HSS", "Description": "Seed data"},
]
SEED_TOOL_MATERIALS = [{"ID": _CARBIDE_ID}, {"ID": _HSS_ID}]
```

### Mechanical Walkthrough

- `TlManufacturer`/`TlMaterial` — **(b) reappearing** the exact same
  shape as `TlTool` one unit ago: a GUID primary key plus plain columns,
  no shared-key inheritance needed here since neither has a
  type-specific "subclass" table the way a tool has endmill/drill.
- `TlToolMaterial` — **(b) reappearing** the shared-primary-key pattern
  a third time, deliberately: the real file models "a tool material" as
  its own table sharing `TlMaterial`'s key, rather than a plain foreign
  key column on `TlAssemblyItem` pointing straight at `TlMaterial`. This
  project's own `TlToolMaterial` rows (below) always shadow a
  `TlMaterial` row 1:1 — the extra table exists in the real schema
  (confirmed against the actual file), even though nothing about this
  project's own data yet needs the distinction that separate table
  would allow in Mastercam itself (per-material tool-specific
  properties, not modeled here).
- `_GENERIC_MFG_ID = uuid.uuid4()` — **(b) reappearing** `uuid.uuid4()`
  (`uuid-byte-order.md`), called at **import time**, not inside a
  function — these three module-level constants exist so `SEED_TOOLS`
  (already in this file, below) can reference the *same* generated ID
  it needs to link a seed tool's catalog row to the correct seed
  material/manufacturer row, without either side needing to query the
  other back out first.

### CS Lens

This is exactly `shared-primary-key-table-inheritance.md`'s pattern
again, worth naming as a repeat rather than a new concept per the
100%-match rule — the "second real discovery" two units ago wasn't a
one-off: Mastercam's own real schema uses this same shape for its
catalog metadata generally, not just for the tool-geometry chain.

### SE Lens

Generating and holding the seed IDs as module-level constants, instead
of querying "the Carbide row" back out by name every time `SEED_TOOLS`
needs to reference it, trades a small amount of indirection (three
extra names to track) for guaranteeing the seed data is internally
consistent by construction — there's no way for `SEED_TOOLS`'s
`material_id` to accidentally reference a material that was never
actually seeded, since both come from the same three constants.

---

## Concept Unit: One Real Function That Reads the Whole Tree — `_tool_to_dict`

### The Problem

A caller (a route, `list_tools`) needs one flat dict per tool — but a
tool's real data is now spread across up to five real tables
(`TlTool`, `TlToolMill`, `TlToolEndmill`/`TlToolDrill`,
`TlAssemblyItem`, and through it `TlToolMaterial`/`TlMaterial`/
`TlManufacturer`). Something has to walk that whole real relationship
tree and flatten it, once, in one place, so every caller doesn't have
to know the schema's real shape.

### Project Change

- **Reference Source** — none (the reference has no backend/API at
  all; this shape is this project's own, feeding its own `ToolCardList`
  props below).
- **Files affected** — `cnc-service/core/tools.py`.
- **Change type** — add.

### The New Code

```python
def _tool_to_dict(tool: TlTool) -> dict:
    mill = tool.mill
    catalog = tool.catalog_item
    return {
        "tool_number": tool.ToolNumber,
        "name": catalog.Name if catalog else "",
        "is_metric": catalog.IsMetric if catalog else None,
        "diameter": mill.OverallDiameter,
        "total_length": mill.OverallLength,
        "flute_count": mill.FluteCount,
        "cutting_depth": mill.CuttingDepth,
        "arbor_diameter": mill.ArborDiameter,
        "corner_radius": mill.endmill.CornerRadius if mill.endmill else None,
        "tip_angle": mill.drill.TipAngle if mill.drill else None,
        "material": catalog.tool_material.material.Name if catalog and catalog.tool_material else None,
        "manufacturer": catalog.manufacturer.Name if catalog and catalog.manufacturer else None,
    }
```

### Mechanical Walkthrough

- `tool.mill`, `tool.catalog_item` — **(b) reappearing** the
  `back_populates` relationships already built two units ago —
  reading `tool.mill` triggers SQLAlchemy to load the matching
  `TlToolMill` row (same shared ID) with no join written by hand here.
- `mill.endmill.CornerRadius if mill.endmill else None` — **(b)
  reappearing** the exact existence-based typing already established:
  a tool "is" an endmill purely by `mill.endmill` being non-`None`, so
  reading its geometry and deciding *whether* it's an endmill happen in
  the same expression, not two separate steps.
- `catalog.tool_material.material.Name` — **(a) first appearance** of
  chaining *three* relationship hops in one expression
  (`TlAssemblyItem` → `TlToolMaterial` → `TlMaterial`) — each `.` is a
  separate real relationship traversal, only possible because every
  link in the chain was declared with `relationship()` two units ago;
  guarded by `catalog and catalog.tool_material` first since either
  hop can genuinely be `None` (a tool with no catalog row yet, or no
  material assigned).
- The function's own name, leading underscore — **(b) reappearing**
  `python-leading-underscore-convention.md`'s convention: this is a
  private helper for this module, never imported by `app.py` directly
  (every route below goes through `list_tools`/`get_tool_by_number`
  instead, which call this internally).

### CS Lens

This is **serialization**, the same concept `flask-implicit-dict-to-json.md`
and `serialization-deserialization.md` already named — applied here to
a real, multi-table ORM object graph instead of a single flat row,
which is exactly why it needs its own function rather than a one-line
`row.__dict__`-style shortcut: the real shape a caller needs doesn't
match the real shape the database stores it in, and something has to
bridge the two, explicitly, once.

### SE Lens

Centralizing this in one function is what let the frontend's `Tool`
interface (next unit) stay simple and flat, completely unaware that
`material`/`manufacturer` are actually two and three relationship hops
away, respectively, in the real schema — the alternative (every
caller doing its own relationship-walking) would mean the same
three-hop chain repeated at every call site, and any future schema
change would need to be found and fixed in each of them separately
instead of once, here.

---

## Concept Unit: Real Inserts and Lookups, Wired to the Routes

*(Reappearing: `../concepts/input-validation-at-boundary.md`,
`../concepts/flask-url-path-parameters.md`,
`../concepts/http-status-codes.md`.)*

### The Problem

The schema (built above) and the validation schema (`TOOL_FIELDS`,
taught earlier in this lesson) still aren't connected to anything a
client can actually call — nothing yet turns a validated request body
into real rows across five tables, or a stored tool back into the flat
dict shape a client expects.

### Project Change

- **Reference Source** — none (no backend in the reference app).
- **Files affected** — `cnc-service/core/tools.py`, `cnc-service/app.py`.
- **Change type** — add (new functions/routes), modify (`get_tool`'s
  path and body, `remove_tool`'s path and body — both previously
  addressed a tool by its old `name` field, Lesson 13's mismatch).

### The New Code

Two small, real lookups `create_tool` (below) needs, each a direct
`SELECT ... WHERE Name = ...` — a name is real, human-chosen input; an
`ID` is the real, opaque key everything else joins on, so a lookup has
to bridge from one to the other before any insert can happen:
```python
def get_material_id_by_name(name):
    with get_session() as session:
        row = session.execute(
            select(TlMaterial).where(TlMaterial.Name == name)
        ).scalar_one_or_none()
        return row.ID if row else None


def get_manufacturer_id_by_name(name):
    with get_session() as session:
        row = session.execute(
            select(TlManufacturer).where(TlManufacturer.Name == name)
        ).scalar_one_or_none()
        return row.ID if row else None
```

The real insert, writing across every table this lesson built, in one
transaction:
```python
def insert_tool(tool_number, mill_fields, catalog_fields, endmill_fields=None, drill_fields=None):
    tool_id = uuid.uuid4()
    with get_session() as session:
        session.add(TlTool(ID=tool_id, ToolNumber=tool_number))
        session.add(TlToolMill(ID=tool_id, **mill_fields))
        if endmill_fields is not None:
            session.add(TlToolEndmill(ID=tool_id, **endmill_fields))
        if drill_fields is not None:
            session.add(TlToolDrill(ID=tool_id, **drill_fields))
        session.add(
            TlAssemblyItem(
                ID=tool_id,
                Name=catalog_fields.get("Name", ""),
                IsMetric=catalog_fields["is_metric"],
                TlToolMaterialID=catalog_fields.get("material_id"),
                TlManufacturerID=catalog_fields.get("manufacturer_id"),
            )
        )
        session.commit()
```

And the two real reads every route below calls into, plus seeding,
updated to populate the two new tables first:
```python
def list_tools():
    with get_session() as session:
        rows = session.execute(select(TlTool).order_by(TlTool.ToolNumber)).scalars().all()
        return {str(row.ToolNumber): _tool_to_dict(row) for row in rows}


def get_tool_by_number(tool_number):
    with get_session() as session:
        row = session.execute(
            select(TlTool).where(TlTool.ToolNumber == tool_number)
        ).scalar_one_or_none()
        return _tool_to_dict(row) if row else None


def seed_tools_if_empty():
    with get_session() as session:
        existing = session.execute(select(TlTool)).scalars().first()
    if existing is not None:
        return
    with get_session() as session:
        for manufacturer in SEED_MANUFACTURERS:
            session.add(TlManufacturer(**manufacturer))
        for material in SEED_MATERIALS:
            session.add(TlMaterial(**material))
        for tool_material in SEED_TOOL_MATERIALS:
            session.add(TlToolMaterial(**tool_material))
        session.commit()
    for tool in SEED_TOOLS:
        insert_tool(
            tool["ToolNumber"], tool["mill"], tool["catalog"],
            endmill_fields=tool.get("endmill"), drill_fields=tool.get("drill"),
        )
```

### The Updated Project

`cnc-service/app.py`'s tool routes, in full, all four together — every
tool route now addresses a tool by `tool_number` in the URL, matching
`ToolCardList.tsx`'s own real keys (next unit), closing the Lesson 13
mismatch this whole lesson opened with:
```python
@app.route("/api/tools")
def get_tools():
    return {"tools": list_tools()}


@app.route("/api/tools/<int:tool_number>")
def get_tool(tool_number):
    tool = get_tool_by_number(tool_number)
    if tool is None:
        return {"error": f"no tool numbered T{tool_number}"}, 404
    return {"tool": tool}


@app.route("/api/tools", methods=["POST"])
def create_tool():
    body = request.get_json(silent=True)
    if not isinstance(body, dict):
        return {"error": "expected a JSON object body"}, 400
    errors = validate_tool_body(body)
    if errors:
        return {"error": "; ".join(errors)}, 400

    material_id = None
    if "material" in body:
        material_id = get_material_id_by_name(body["material"])
        if material_id is None:
            return {"error": f"no material named {body['material']!r}"}, 400
    manufacturer_id = None
    if "manufacturer" in body:
        manufacturer_id = get_manufacturer_id_by_name(body["manufacturer"])
        if manufacturer_id is None:
            return {"error": f"no manufacturer named {body['manufacturer']!r}"}, 400

    mill_fields = {
        "OverallDiameter": body["diameter"],
        "OverallLength": body["total_length"],
        "FluteCount": body["flute_count"],
        "CuttingDepth": body["cutting_depth"],
        "ArborDiameter": body["arbor_diameter"],
    }
    catalog_fields = {
        "Name": body["name"],
        "is_metric": body["is_metric"],
        "material_id": material_id,
        "manufacturer_id": manufacturer_id,
    }
    endmill_fields = {"CornerRadius": body["corner_radius"]} if "corner_radius" in body else None
    drill_fields = {"TipAngle": body["tip_angle"]} if "tip_angle" in body else None

    insert_tool(
        body["tool_number"], mill_fields, catalog_fields,
        endmill_fields=endmill_fields, drill_fields=drill_fields,
    )
    return {"tool": get_tool_by_number(body["tool_number"])}, 201


@app.route("/api/tools/<int:tool_number>", methods=["DELETE"])
def remove_tool(tool_number):
    if not delete_tool(tool_number):
        return {"error": f"no tool numbered T{tool_number}"}, 404
    return "", 204
```

### Mechanical Walkthrough

- `<int:tool_number>` — **(b) reappearing** Flask's URL converter
  syntax (`flask-url-path-parameters.md`), previously `<name>` (a bare
  string converter) — the converter itself enforces the type at the
  routing layer: a non-numeric path segment never even reaches
  `get_tool`/`remove_tool`, it's a `404` from Flask's own router before
  either function runs.
- `if "material" in body: material_id = get_material_id_by_name(...)` —
  **(a) first appearance** of a request field that's optional at the
  API boundary but, once present, must resolve to something real
  server-side, checked with its own dedicated `400` — distinct from
  `validate_tool_body`'s type/presence checks (which run first): a
  syntactically valid string can still name a material that doesn't
  exist, a different kind of invalid input than a wrong type.
- `insert_tool(body["tool_number"], mill_fields, catalog_fields, ...)`
  — **(a) first appearance** of assembling several small dicts
  (grouped by which table each maps to) from one flat validated body,
  immediately before the real insert — the shape `insert_tool` expects
  mirrors the schema's own real table boundaries, not the flat request
  body's.
- `return {"tool": get_tool_by_number(body["tool_number"])}, 201` —
  **(b) reappearing** the same "read back what was just written and
  return it" pattern Lesson 14 already established, now reading
  through the full five-table chain via `_tool_to_dict` instead of one
  row.

### Execution Trace

`list_tools()`'s own dict comprehension, against 2 real rows (tool 1,
the real end-mill data cited throughout this lesson; tool 4, the real
drill):

```
rows = [TlTool(ToolNumber=1, ...), TlTool(ToolNumber=4, ...)]
  (ordered by ToolNumber, per the query)

row=TlTool(ToolNumber=1):
  str(1) → "1"
  _tool_to_dict(row) → {"tool_number":1, "name":"end_mill_4fl",
    "diameter":10.0, "flute_count":4, "corner_radius":0.0,
    "tip_angle":None, ...}   (tip_angle is None — this row has no
    mill.drill, only mill.endmill)
  → entry: "1" → {that dict}

row=TlTool(ToolNumber=4):
  str(4) → "4"
  _tool_to_dict(row) → {"tool_number":4, "name":"drill_hss",
    "diameter":6.0, "flute_count":2, "corner_radius":None,
    "tip_angle":118.0, ...}   (corner_radius is None here instead —
    this row has mill.drill, not mill.endmill)
  → entry: "4" → {that dict}

Final: {"1": {tool 1's dict}, "4": {tool 4's dict}}
```

`_tool_to_dict` is called once per row inside the comprehension — the
same function the previous unit already traces in detail — and the
dict's own keys are `str(row.ToolNumber)`, not the row's own database
`ID` (the real GUID), which is why `/api/tools`'s response is keyed
`"1"`/`"4"`, matching `ToolCardList.tsx`'s own real, human-facing tool
numbers, not an opaque UUID a frontend would have no use for.

### Verified, Run for Real

```
GET /api/tools/1
  200 {"tool": {"tool_number": 1, "name": "4-flute square end mill", "is_metric": true, "diameter": 10.0, ...}}
GET /api/tools/99
  404 {"error": "no tool numbered T99"}
POST /api/tools {"tool_number": 5, "name": "Test", "is_metric": true, "diameter": 6, "total_length": 50,
                  "flute_count": 2, "cutting_depth": 20, "arbor_diameter": 6, "corner_radius": 0,
                  "material": "Carbide", "manufacturer": "Generic"}
  201 {"tool": {"tool_number": 5, "name": "Test", "material": "Carbide", "manufacturer": "Generic", ...}}
POST /api/tools {"tool_number": 6, ..., "material": "Unobtanium"}
  400 {"error": "no material named 'Unobtanium'"}
DELETE /api/tools/5
  204 (empty body)
GET /api/tools/5
  404 {"error": "no tool numbered T5"}
```

All six run for real this session against the live server — the last
two confirm delete-then-refetch actually round-trips through the real
database, not just an in-memory cache.

---

## Concept Unit: `ToolCardList` — the Reference's Real Card Layout, Ported

*(Reappearing: `../concepts/react-usestate-hook.md`,
`../concepts/react-useeffect-hook.md`,
`../concepts/react-key-prop-reconciliation.md`,
`../concepts/fetch-api.md`, `../concepts/typescript-interfaces.md`.
New: `../concepts/typescript-record-utility-type.md`.)*

### The Problem

`ToolTable.tsx` (Lesson 13) is a bare `<table>`, name-keyed — the real
reference (`cnc-sim/cnc/components/ToolCardList.jsx`) is a card list,
tool-number-keyed. Every backend unit above exists specifically so this
component can finally be a faithful port instead of a stand-in.

### Reference Source

`cnc-sim/cnc/components/ToolCardList.jsx`, full file (89 lines,
already read in Lesson 13 for its field names). Real gaps this port
names explicitly rather than silently drops: no `ACTIVE`/`LIVE` badges
(lines 26–54 — driven by `ms.activeT`/live-tooling state, neither of
which exists in this project yet), no `headerLabel`/`isLathe` props
(this project has exactly one machine class so far), no `onSelect`
click-to-activate (no active-tool concept yet), and no mm/inch
*conversion* — the reference's own `toolDisplayDim` doesn't convert
either, it only formats; both projects treat a tool's stored numbers as
already being in whatever unit its own flag says.

### Project Change

- **Files affected** — `cnc-web/src/ToolCardList.tsx` (new file),
  `cnc-web/src/ToolTable.tsx` (deleted), `cnc-web/src/App.tsx`
  (import swapped).
- **Change type** — add + delete.

### The New Code

The two real network calls, direct siblings of `fetchPath`/`fetchTools`'s
already-established shape (Lesson 7), now pointed at the real
tool-number-keyed routes above:
```typescript
async function fetchTools(): Promise<Record<string, Tool>> {
  const response = await fetch("http://127.0.0.1:5000/api/tools");
  const data: ToolsResponse = await response.json();
  return data.tools;
}

async function deleteToolByNumber(toolNumber: number): Promise<void> {
  await fetch(`http://127.0.0.1:5000/api/tools/${toolNumber}`, {
    method: "DELETE",
  });
}
```

### The Updated Project

`cnc-web/src/ToolCardList.tsx`, in full:
```typescript
import { useEffect, useState } from "react";

interface Tool {
  tool_number: number;
  name: string;
  is_metric: boolean;
  diameter: number;
  total_length: number;
  flute_count: number;
  cutting_depth: number;
  arbor_diameter: number;
  corner_radius: number | null;
  tip_angle: number | null;
  material: string | null;
  manufacturer: string | null;
}

interface ToolsResponse {
  tools: Record<string, Tool>;
}

async function fetchTools(): Promise<Record<string, Tool>> {
  const response = await fetch("http://127.0.0.1:5000/api/tools");
  const data: ToolsResponse = await response.json();
  return data.tools;
}

async function deleteToolByNumber(toolNumber: number): Promise<void> {
  await fetch(`http://127.0.0.1:5000/api/tools/${toolNumber}`, {
    method: "DELETE",
  });
}

function ToolCardList() {
  const [tools, setTools] = useState<Record<string, Tool>>({});

  useEffect(() => {
    fetchTools().then(setTools);
  }, []);

  const visibleTools = Object.entries(tools);

  const handleDelete = async (toolNumber: number) => {
    await deleteToolByNumber(toolNumber);
    setTools((prev) => {
      const next = { ...prev };
      delete next[String(toolNumber)];
      return next;
    });
  };

  return (
    <>
      <div className="sec">Tool Table (Mill)</div>
      {visibleTools.map(([toolNumber, t]) => {
        const kind = t.corner_radius != null ? "Endmill" : "Drill";
        return (
          <div key={toolNumber} className="tcard">
            <div className="tcard-h">
              <span className="tcard-name">
                T{String(toolNumber).padStart(2, "0")} — {kind}
              </span>
              <button
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--color-muted)",
                  cursor: "pointer",
                  marginLeft: "auto",
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(Number(toolNumber));
                }}
              >
                ✕
              </button>
            </div>
            <div className="tcard-meta">
              {t.name} Ø{t.diameter}
              {t.is_metric ? "mm" : "in"}{" "}
              {t.corner_radius != null
                ? `R${t.corner_radius}${t.is_metric ? "mm" : "in"}`
                : `${t.tip_angle}°`}{" "}
              {t.material ?? "—"} · {t.manufacturer ?? "—"}
            </div>
          </div>
        );
      })}
      {visibleTools.length === 0 && (
        <div style={{ color: "var(--color-muted)", fontSize: 9, padding: "8px 0" }}>
          No mill tools defined.
        </div>
      )}
    </>
  );
}

export default ToolCardList;
```
`App.tsx`'s only change — the import and the one JSX line that renders
it:
```typescript
import ToolCardList from "./ToolCardList.tsx"; // was ToolTable
// ...
<ToolCardList />
```

### Mechanical Walkthrough

- `Record<string, Tool>` — **(a) first appearance**, full standalone
  treatment: `../concepts/typescript-record-utility-type.md`. Matches
  `list_tools()`'s real return shape (a dict keyed by `str(row.ToolNumber)`)
  exactly — the frontend's type is a direct mirror of what the backend
  unit above actually serializes, not an independently guessed shape.
- `Object.entries(tools)` — **(b) reappearing** the same
  object-to-entries conversion this project's own `App.tsx` state
  patterns already use elsewhere, here turning the `Record` back into
  an iterable `[key, value][]` list `.map` can render.
- `key={toolNumber}` — **(b) reappearing** `react-key-prop-reconciliation.md`,
  now keyed by the real tool number instead of Lesson 13's table-row
  index, which is the actual point of this whole rebuild: a real,
  stable identity per card, matching the reference's own `key={n}`.
- `t.corner_radius != null ? "Endmill" : "Drill"` — **(b) reappearing**
  the same existence-based typing already used server-side in
  `_tool_to_dict`, applied again here purely for *display* — the
  frontend never re-derives "is this an endmill" from anything the
  backend didn't already decide; it just reads which of the two
  optional fields came back non-`null`.
- `handleDelete` calling `deleteToolByNumber` then updating local state
  with `delete next[String(toolNumber)]` — **(b) reappearing** the
  copy-then-mutate-the-copy immutability discipline already established
  for objects/arrays, applied to a `Record` treated as a plain object
  (which, at runtime, it is one).
- The delete button's `e.stopPropagation()` — **(b) reappearing**,
  matching the reference's own identical call at the identical spot
  (its line 63) — needed there and here for the same real reason: once
  the reference's own `onClick={() => onSelect(n, t)}` exists on the
  outer card (a future lesson, not yet ported here), a click on the
  inner ✕ button would otherwise also fire the card's own click
  handler.

### Execution Trace

`visibleTools.map(...)` against the same 2 real tools traced above
(`Object.entries({"1": {...end_mill_4fl...}, "4": {...drill_hss...}})`):

```
visibleTools = [["1", {tool_number:1, name:"end_mill_4fl", diameter:10,
                       is_metric:true, corner_radius:0, tip_angle:null, ...}],
                ["4", {tool_number:4, name:"drill_hss", diameter:6,
                       is_metric:true, corner_radius:null, tip_angle:118, ...}]]

Entry 1: toolNumber="1", t={...end_mill_4fl...}
  kind: t.corner_radius (0) != null? → True → kind = "Endmill"
  card header: "T01 -- Endmill"   (String("1").padStart(2,"0") = "01")
  meta line: "end_mill_4fl (diameter 10mm) R0mm -- (unnamed material/manufacturer)"
    (corner_radius branch taken: R0mm)

Entry 2: toolNumber="4", t={...drill_hss...}
  kind: t.corner_radius (null) != null? → False → kind = "Drill"
  card header: "T04 -- Drill"
  meta line: "drill_hss (diameter 6mm) 118deg -- (unnamed material/manufacturer)"
    (corner_radius is null, so the tip_angle branch runs instead: 118deg)

Result: 2 real card elements, keyed "1" and "4".
```

`kind`'s own ternary and the meta line's own nested ternary both key
off the exact same `corner_radius != null` fact — Entry 1 and Entry 2
take opposite branches of *both* ternaries together, never
independently, because they're deciding the same real question
("is this an endmill or a drill") twice in two different places.

### CS Lens

The reference's `visibleTools` prop (computed by its own parent) and
this project's local `Object.entries(tools)` are the same idea —
**deriving a rendered list from a keyed lookup structure** — solved
one layer higher up in the reference (its parent owns the tools data)
and locally here (this component owns its own `fetchTools` call),
which is itself a real, named, current scope difference from the
reference's actual architecture, not an oversight: the reference's
`ToolCardList` is a pure, prop-driven component; this project's version
currently also owns its own data-fetching, since no shared "app-level
tools state" exists yet for it to receive as a prop instead.

### SE Lens

Porting the reference's exact `tcard`/`tcard-h`/`tcard-name`/`tcard-meta`
class structure (next unit) rather than inventing new class names for
an equivalent-looking layout is what makes this a real port, not a
lookalike: the CSS this project already ported once (below) works
unchanged against this component with zero new styling decisions,
because the DOM shape matches what that CSS was actually written for.

### Verified, Run for Real

```
Loaded cnc-web: 4 real cards rendered (T01 Endmill, T02 Endmill, T03
Endmill, T04 Drill), each showing real name/diameter/material/
manufacturer from the live server. Clicked T04's ✕: DELETE /api/tools/4
fired, the card disappeared with no page reload, and a follow-up
GET /api/tools/4 confirmed 404 — restored afterward by re-seeding.
```

---

## Concept Unit: New Card Styles, Ported From the Reference

*(Reappearing: `../concepts/css-custom-properties.md`,
`../concepts/css-rule-syntax-selectors-cascade.md`.)*

### The Problem

`ToolCardList.tsx`, just ported above, uses `className="tcard"`,
`"tcard-h"`, `"tcard-name"`, `"tcard-meta"` — none of which exist yet
in `cnc-web/src/theme.css`.

### Project Change

- **Reference Source** — `cnc-sim/cnc/CNCSim.jsx`'s own embedded CSS
  template, lines 1684–1689 (the four rules) — `.tcard.on`'s amber
  highlight is ported too, even though nothing in this project sets
  the `.on` class yet (per the previous unit's named gap: no active-tool
  concept exists here), the same "port the real rule, use it partially,
  name the rest as not-yet-wired" choice Lesson 12 already established.
- **Files affected** — `cnc-web/src/theme.css`.
- **Change type** — add.

### The New Code

Two new custom properties this rule set needs, beyond Lesson 12's
original palette:
```css
--color-border-strong: #475569;
--color-amber: #f0b44c;
--color-amber-bg: rgba(240, 180, 76, 0.1);
```
And the real rules:
```css
.tcard {
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  padding: 7px 9px;
  margin-bottom: 4px;
  cursor: pointer;
  transition: 0.15s;
}
.tcard:hover {
  border-color: var(--color-border-strong);
}
.tcard.on {
  border-color: var(--color-amber);
  background: var(--color-amber-bg);
}
.tcard-h {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2px;
}
.tcard-name {
  font-size: 10px;
  font-weight: 600;
}
.tcard-meta {
  font-size: 9px;
  color: var(--color-muted);
  font-family: monospace;
  line-height: 1.6;
}
```

### Mechanical Walkthrough

- `.tcard`, `.tcard-h`, `.tcard-name`, `.tcard-meta` — **(a) first
  appearance** of this project's card-list styling — every property
  used was already declared by Lesson 12 except the two new ones above.
- `.tcard:hover`, `.tcard.on` — **(b) reappearing** pseudo-class and
  compound-class selector syntax (`css-rule-syntax-selectors-cascade.md`),
  `.tcard.on` specifically requiring *both* classes on the same element
  (`cursor: pointer` alone from `.tcard`, plus the amber override from
  `.on`) — the same compositional-class idea Lesson 18 names again for
  `.btn.btn-gr.full`.
- `--color-border-strong`/`--color-amber`/`--color-amber-bg` — **(b)
  reappearing** `css-custom-properties.md`'s mechanism, three more real
  values added to the same `:root` block.

### CS Lens / SE Lens

Same as Lesson 12's own design-token unit; `css-custom-properties.md`
covers both in full. Nothing new to re-derive.

### Verified, Run for Real

```
Reloaded cnc-web with these rules in place: all 4 tool cards render
with a real dark card background, a visible border, and a smooth
hover-border transition, exactly matching the reference's own real
tool-tab appearance.
```

---

## Connect the Pieces

One tool, `T01`, traced through everything built this lesson: its real
identity lives in `TlTool` (`ToolNumber = 1`), its shared geometry in
`TlToolMill` (`OverallDiameter = 10.0`), its endmill-specific geometry
in `TlToolEndmill` (`CornerRadius = 0.0`) — three separate tables,
joined only by sharing the identical GUID primary key
(`2d4e999b853b704d849d3f6364de82ec`-shaped, `uuid-byte-order.md`'s real
`.bytes_le` layout), reachable from Python as `tool.mill.endmill`
(`sqlalchemy-relationship-back-populates.md`) with no join written by
hand. Its display name and unit ("4-flute square end mill", `is_metric
= True`) live one level further, in `TlAssemblyItem`, sharing that same
GUID again — found only by reading real data, not the schema alone.
`ToolCardList.tsx` fetches all of it through one `GET /api/tools`, and
renders `T01 — Endmill` (endmill vs. drill decided the same
existence-based way the schema itself decides it) with a real,
correctly-labeled `Ø10mm`.

## What Breaks Without This

Already demonstrated live, twice, this lesson: (1) `session.delete()`
on the loaded ORM objects, which raises the real `AssertionError`
quoted above the moment two sibling shared-key tables both exist for
one deletion — restore the ORM-cascade version yourself and confirm
you get that exact error again; (2) the `IsMetric` omission, which
would have silently mislabeled any non-metric tool's diameter as `mm`
— temporarily hardcode `t.is_metric ? "mm" : "in"` back to a bare
`"mm"` and confirm nothing catches an inch tool being displayed wrong.

## Exercises

1. Add a fifth tool via `POST /api/tools` with `is_metric: false` and a
   real inch diameter (`0.5`). Confirm the card correctly renders
   `Ø0.5in`, not `Ø0.5mm`.
2. Send a `tool_number` as a JSON float (`5.0`, not `5`) and read the
   real validation error — explain, from `TOOL_FIELDS`' declared
   `(int,)`, why a float is rejected even though `5.0 == 5`.
3. Query the real `Untitled.TOOLDB` file yourself (`sqlite3` +
   `PRAGMA table_info(TlHolder)`) and, without writing any project
   code, sketch on paper which columns you'd expect `TlAssembly`
   (`MainHolder`, `MainTool`) to need in order to represent "this tool,
   loaded in this holder" — the next real phase this lesson deliberately
   didn't build.

## Definition of Done

- [ ] `ToolCardList.tsx` renders real, tool-number-keyed cards, closing
      the Lesson 13 mismatch.
- [ ] Every backend field name is a full word; no field name encodes a
      unit.
- [ ] `POST /api/tools` rejects a wrong-typed field (including a `bool`
      masquerading as a number) with a specific `400` message.
- [ ] `core/tools.py` models a real subset of Mastercam's own
      `.TOOLDB` schema — `TlTool`/`TlToolMill`/`TlToolEndmill`/
      `TlToolDrill`/`TlAssemblyItem`/`TlToolMaterial`/`TlMaterial`/
      `TlManufacturer` — GUID-keyed, exact real table and column names,
      verified against the actual file, not assumed.
- [ ] `delete_tool` uses explicit, ordered Core deletes; you reproduced
      the ORM-cascade `AssertionError` yourself and understand why it
      happens.
- [ ] `IsMetric` is real, threaded end to end, and the frontend's unit
      label reflects it instead of a hardcoded `mm`.
- [ ] Full regression: `tsc --noEmit`, `vitest run` (4/4), and a live
      backend smoke test (GET/POST/DELETE, including the validation
      error paths) all pass.
- [ ] A git commit exists explaining *why* (a faithful port, then a
      naming correction, then a real external schema adopted on
      purpose, then a real bug found and fixed, then a real mistake in
      this very lesson caught and corrected) — not a list of files
      changed.
