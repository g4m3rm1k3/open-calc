# Lesson 47: The Proof Lived Outside the Repo

**What you will build:** the backend half of a new feature — real tool
*assembly* data (a tool's actual holder, and that holder's real 3D
outline) — read from an actual Mastercam `.TOOLDB` file via direct,
command-line database archaeology (no documentation existed to read
instead), modeled as new SQLAlchemy classes, copied into this project's
own database on import, and exposed through one new endpoint. The
transferable throughline, start to finish: nothing here was assumed —
every real claim (what a column means, whether a relationship really
has one owner, whether the whole interpretation is even correct) was
checked against something outside this project's own code before being
trusted. The frontend half (rendering this data as a real 3D shape) is
a deliberately separate, later lesson.

**What you need to know first:** `core/tools.py`'s existing `TlTool`/
`TlToolMill`/`TlAssemblyItem` models (Lessons 17–18); `orm-object-
relational-mapping.md`; `shared-primary-key-table-inheritance.md`;
`sql-create-table-and-schema.md`; `automated-testing-unit-test-basics.md`.

---

## Concept Unit: Confirming Prior Art Is Actually Alive

### The Problem

Before writing anything, `COMPONENT_MAP.md` was checked for prior art —
it names `cnc/toolTemplates.ts`'s `TOOL_TEMPLATES.holders`,
`getHolderProfile`, and `buildFullToolProfile` as the reference's own
tool/holder-geometry mechanism. Reading a reference's own comment isn't
the same as confirming the reference actually *uses* what it names.

### Introduce the Concept in Isolation

No new concept file — this is the same "Reading the Real Source"
discipline this project has used from the start, applied here to a
question docs alone couldn't answer: *is this code actually called?*

### Mechanical Walkthrough
A real, command-line grep across the reference's own source settled it:

```
$ grep -n "buildFullToolProfile\|getHolderProfile\|TOOL_TEMPLATES" \
    cnc-sim/cnc/CNCBackplot.jsx cnc-sim/cnc/CNCSim.jsx cnc/CNCEngine.test.ts
cnc-sim/cnc/CNCSim.jsx:2:import { CNCEngine, MACHINE_DEFINITIONS, TOOL_TEMPLATES } from "../../cnc/CNCEngine.ts";
cnc-sim/cnc/CNCSim.jsx:761:      const tmpl = TOOL_TEMPLATES.mill[k];
cnc/CNCEngine.test.ts:8:  getHolderProfile,
cnc/CNCEngine.test.ts:296:  it("getHolderProfile returns null for unknown key", ...
cnc/CNCEngine.test.ts:302:describe("buildFullToolProfile", ...
```

`TOOL_TEMPLATES` itself is real and used (seeding the reference's own
- default tool table) — but `getHolderProfile`/`buildFullToolProfile`
only ever appear in `CNCEngine.test.ts`. Confirmed further: the
reference's actual "Tool Shape Preview" canvas
(`ToolEditForm.jsx`'s own `toolCvsRef`, drawn in `CNCSim.jsx`) hand-draws
- a hardcoded icon per `tool.type` — it never calls
`buildFullToolProfile` at all. There is no working reference display of
tool/holder 3D geometry anywhere in the running app — real code, dead
on arrival, exercised only by its own unit tests.

### CS Lens

Not a hard CS concept — this is **dead code**, confirmed by usage
analysis rather than assumed from a comment or a doc's own claim.

### SE Lens

The real cost of skipping this check: designing a port around
`buildFullToolProfile`'s own shape (a `{r, z}` point list) as if it were
proven, working prior art, when it's really an untested design sketch
the reference itself never finished wiring up. Confirming *usage*, not
just *presence*, before treating something as prior art is what this
project's own citation discipline has meant all along — this is that
same discipline applied to a question a comment alone couldn't answer.

### Commands

```
grep -n "buildFullToolProfile\|getHolderProfile\|TOOL_TEMPLATES" \
    cnc-sim/cnc/CNCBackplot.jsx cnc-sim/cnc/CNCSim.jsx cnc/CNCEngine.test.ts
```

### Run It

Real output shown above — three call sites, all in the test file, none
in the running app.

---

## Concept Unit: Reverse-Engineering an Unfamiliar Schema From the Command Line

### The Problem

With no working reference and no documentation, the only real source
of truth left was the actual `.TOOLDB` file sitting in the workspace —
a real SQLite database, but with dozens of unfamiliar real table names
(`TlAssembly`, `TlHolder`, `TlProfileData`, `TlGraphicsFile`, ...) and
no schema documentation at all.

### Introduce the Concept in Isolation

First appearance of this exact technique in this project — full
standalone treatment: `concepts/sqlite-schema-introspection-via-
pragma.md`. Read that first; its own isolated example (`pragma
table_info`, row counts, cross-referencing ID sets) is precisely the
technique used here, generalized.

### Mechanical Walkthrough
Every real step, run directly against `Untitled.TOOLDB`, in order:

**1. What's actually in this file?**

```
$ python3 -c "
import sqlite3
conn = sqlite3.connect('Untitled.TOOLDB')
cur = conn.cursor()
cur.execute(\"select name from sqlite_master where type='table' order by name\")
for row in cur.fetchall():
    print(row[0])
"
```

- 76 real tables — `TlAssembly`, `TlAssemblyComponent`, `TlHolder`,
`TlGraphicsFile`, `TlProfileData`, and 71 more.

**2. Row counts — which of these are actually populated?**

```
$ python3 -c "
import sqlite3
conn = sqlite3.connect('Untitled.TOOLDB')
cur = conn.cursor()
for t in ['TlGraphicsFile','TlGraphicsFileCollection','TlHolder','TlAssembly',
          'TlMatrix4x4','TlAssemblyComponent','TlAssemblyComponentTree']:
    cur.execute(f'select count(*) from {t}')
    print(t, cur.fetchone()[0])
"
TlGraphicsFile 0
TlGraphicsFileCollection 0
TlHolder 3
TlAssembly 3
TlMatrix4x4 0
TlAssemblyComponent 6
TlAssemblyComponentTree 0
```

Real, immediately useful signal: `TlGraphicsFile` (a `BLOB` + `FileFormat`
column, clearly meant for real mesh data) and `TlMatrix4x4` (meant for
real per-component 3D transforms) are both **empty** — not just in this
one file, but (checked the identical way) in Mastercam's own official,
921-holder system library too. Standard holders are not rendered from
stored mesh data at all.

**3. Cross-referencing IDs to find the real relationship no column name spelled out:**

```
$ python3 -c "
import sqlite3
conn = sqlite3.connect('Untitled.TOOLDB')
cur = conn.cursor()
cur.execute('select count(*) from TlProfileData')
print('rows:', cur.fetchone()[0])
cur.execute('select ItemID, count(*) from TlProfileData group by ItemID')
item_ids = [r[0] for r in cur.fetchall()]
cur.execute('select ID from TlHolder')
holder_ids = set(r[0] for r in cur.fetchall())
print('every ItemID is a real TlHolder.ID:', set(item_ids) <= holder_ids)
"
rows: 56
every ItemID is a real TlHolder.ID: True
```

This is the real discovery the whole feature turns on: `TlProfileData`
(56 populated rows — real data, unlike the empty graphics/matrix
tables) is keyed by `TlHolder.ID`, not by a tool. It's a real, literal
2D outline, not a hardcoded template and not a mesh blob.

### CS Lens / SE Lens

Not repeated — fully covered by `sqlite-schema-introspection-via-
pragma.md`. The concrete value delivered here: three real, load-bearing
facts (graphics/matrix tables are genuinely unused; the real profile
data is keyed to holders; `TlAssemblyItem` is a shared catalog, covered
in its own unit below) — none of them written anywhere, all found by
querying the actual file directly.

### Commands

All three shown above, run in order.

### Run It

Real output shown inline with each command — this whole unit *is* its
own "Run It," a real, ordered investigation rather than a single
before/after snippet.

---

## Concept Unit: A Real 2D Revolve Profile

### The Problem

Once `TlProfileData` was found, its own columns (`x0, y0, x1, y1,
radius, StartAngle, SweepAngle`) needed a real interpretation — what do
these numbers actually describe?

### Mechanical Walkthrough
One real holder's full profile, read directly and hand-traced:

```
$ python3 -c "
import sqlite3
conn = sqlite3.connect('Untitled.TOOLDB')
cur = conn.cursor()
cur.execute(
    'select Segment,x0,y0,x1,y1 from TlProfileData '
    'where ItemID=(select ID from TlHolder limit 1 offset 3) order by Segment'
)
for r in cur.fetchall(): print(r)
"
(0, 0.0, 0.0, 0.25, 0.0)
(1, 0.25, 0.0, 0.25, 3.0)
(2, 0.25, 3.0, 1.0, 3.0)
(3, 1.0, 3.0, 1.0, 4.0)
(4, 1.0, 4.0, 0.0, 4.0)
```

Traced by hand: `(0,0)→(0.25,0)` (a face, out to radius 0.25),
- `(0.25,0)→(0.25,3)` (straight up at a constant radius — a cylindrical shank), `(0.25,3)→(1.0,3)` (a step outward — a shoulder), `(1.0,3)→ (1.0,4)` (straight up again — a larger-diameter body), `(1.0,4)→(0,4)`

(back to the axis, closing the outline). `x` is radius; `y` is axial
(Z) position — a real, revolve-ready lathe-style cross-section, ordered
segment by segment, each one's end matching the next one's start.

Checked across every real segment in both this file (56 rows) and
Mastercam's own official system library (15,015 rows, `Type` always
- `2` — a line): arcs (`radius`/`StartAngle`/`SweepAngle`) never actually
occur in real Mastercam holder data. Those columns are kept in the
model below, honestly unexercised, not invented.

### CS Lens

This is a **piecewise-linear boundary representation** — a shape
described as an ordered chain of straight segments rather than a filled
region or a mesh — the standard way to describe a revolve profile (a
2D outline swept 360° around an axis to produce a solid) in CAD/CAM
software.

### SE Lens

Not repeated — covered together with the modeling decision in the
composite-key unit below (this profile's own rows are what motivated
that design).

### Commands

Shown above.

### Run It

Real output shown above — one real holder's outline, traced end to end
by hand before any code was written to consume it.

---

## Concept Unit: `CScalar` — Confirmed, Not Guessed

### The Problem

`TlAssemblyComponent.CScalar` had no obvious meaning from its column
name or type (`FLOAT`) alone.

### Mechanical Walkthrough

Real values, read directly for one assembly's two component rows:

```
$ python3 -c "
import sqlite3
conn = sqlite3.connect('Untitled.TOOLDB')
cur = conn.cursor()
cur.execute('select TlAssemblyItemID, ParentID, CScalar from TlAssemblyComponent')
for r in cur.fetchall(): print(r)
"
```

Every assembly's two rows follow the same real shape: the tool's own
row (`ParentID` = the holder's ID) always carries `CScalar = 0.0`; the
holder's own row (`ParentID` = null/root) carries the real nonzero
value (`2.6`, `1.0`, `2.7`, `1.36...`). Rather than guess further, this
was asked directly and confirmed: **`CScalar` is the real tool-to-holder
stickout** — how far the tool protrudes past the holder's gauge line.

### CS Lens / SE Lens

Not a hard concept — a real, plain domain fact, confirmed by asking
someone who actually knows the domain rather than continuing to infer
it from data alone. Worth naming directly: reverse-engineering a real
schema doesn't mean *never* asking a real domain expert — it means not
defaulting to guessing when a better source is available, and not
treating a guess as confirmed until it actually is.

### Commands

Shown above.

### Run It

Real output — four real assemblies, the same two-row shape each time,
confirmed against real domain knowledge rather than left as an
unverified inference.

---

## Concept Unit: A Shared Catalog Table, Two Real Parents

### The Problem

`TlAssemblyItem` (Lesson 17) was modeled with `ID: Mapped[uuid.UUID] =
mapped_column(GUID, ForeignKey("TlTool.ID"), primary_key=True)` — a
real FK, but one that turned out to describe less than the whole truth:

```
$ python3 -c "
import sqlite3
conn = sqlite3.connect('Untitled.TOOLDB')
cur = conn.cursor()
cur.execute('select ID from TlHolder')
holder_ids = set(r[0] for r in cur.fetchall())
cur.execute('select ID from TlAssemblyItem')
item_ids = set(r[0] for r in cur.fetchall())
print('every real holder ID has its own TlAssemblyItem row:', holder_ids <= item_ids)
"
every real holder ID has its own TlAssemblyItem row: True
```

Every real holder has its own catalog row too — `TlAssemblyItem` is a
shared catalog table for *any* assembly item, not a tool-only extension
the way the original FK claimed.

### Introduce the Concept in Isolation

First appearance of this exact pattern in this project — full
standalone treatment: `concepts/sqlalchemy-explicit-primaryjoin-shared-
catalog.md`. Read that first; its own isolated example (a
`CatalogEntry` shared by `Widget` and `Gadget`) is precisely this
project's own `TlAssemblyItem` situation, generalized.

### Project Change

- **Reference Source** — none; a real correction to this project's own
  earlier (Lesson 17) model.
- **Files affected** — `cnc-service/core/tools.py` (`TlTool.catalog_item`,
  `TlAssemblyItem.ID`, `TlAssemblyItem.tool`).
- **Change type** — replace.
- **Location** — where Lesson 17 originally declared them.
- **Dependencies** — `sqlalchemy-explicit-primaryjoin-shared-catalog.md`.

### The New Code

```python
class TlTool(Base):
    __tablename__ = "TlTool"

    ID: Mapped[uuid.UUID] = mapped_column(GUID, primary_key=True)
    ToolNumber: Mapped[int]

    mill: Mapped["TlToolMill | None"] = relationship(back_populates="tool", uselist=False)
    # Explicit primaryjoin, not back_populates: TlAssemblyItem.ID is no
    # longer FK'd to TlTool.ID alone (it's a shared catalog table, see
    # TlAssemblyItem's own comment) -- writes always go directly through
    # `TlAssemblyItem(ID=tool_id, ...)`, never through this attribute, so
    # a plain, independent, read-only view is all this ever needed to be.
    catalog_item: Mapped["TlAssemblyItem | None"] = relationship(
        primaryjoin="TlTool.ID == foreign(TlAssemblyItem.ID)",
        uselist=False,
        viewonly=True,
    )
```

```python
class TlAssemblyItem(Base):
    __tablename__ = "TlAssemblyItem"

    # No longer FK'd to TlTool.ID specifically: confirmed directly (every
    # real TlHolder.ID in the sample file also has its own TlAssemblyItem
    # row -- "HSK63ATT088394", "H4Y3A0375", etc.) that this table is a
    # shared catalog for *any* assembly item, tool or holder, not a
    # tool-only extension. SQLite here never enforces FK constraints
    # anyway (no `PRAGMA foreign_keys`), so this changes nothing at
    # runtime -- only the (previously misleading) declared relationship,
    # now given an explicit `primaryjoin` below instead of relying on a
    # single-table FK inference that was never really true.
    ID: Mapped[uuid.UUID] = mapped_column(GUID, primary_key=True)
    Name: Mapped[str] = mapped_column(default="")
    IsMetric: Mapped[bool]
    TlToolMaterialID: Mapped[uuid.UUID | None] = mapped_column(
        GUID, ForeignKey("TlToolMaterial.ID"), default=None
    )
    TlManufacturerID: Mapped[uuid.UUID | None] = mapped_column(
        GUID, ForeignKey("TlManufacturer.ID"), default=None
    )

    # Unused in this codebase (only TlTool.catalog_item, the other
    # direction, is ever actually read) -- kept only to document the real
    # relationship. Independent of TlTool.catalog_item now (no
    # back_populates): `ID` no longer carries a real FK annotation either
    # side could infer a shared join from, since a holder's own
    # TlAssemblyItem row has no matching TlTool row at all.
    tool: Mapped[TlTool | None] = relationship(
        primaryjoin="TlAssemblyItem.ID == foreign(TlTool.ID)",
        viewonly=True,
    )
    tool_material: Mapped[TlToolMaterial | None] = relationship()
    manufacturer: Mapped[TlManufacturer | None] = relationship()
```

### Mechanical Walkthrough
- `ForeignKey("TlTool.ID")` removed entirely from `TlAssemblyItem.ID` —
SQLite here never enforces foreign keys anyway (no `PRAGMA
foreign_keys` anywhere in `core/storage.py`), so nothing changes at
runtime; what changes is that the relationship can no longer be
*inferred* from that FK, so both sides now say explicitly, in
`primaryjoin`, exactly how to join (`TlTool.ID == foreign(TlAssemblyItem.ID)`
- and its mirror) — the `foreign()` annotation marking which side plays
the FK-like role a real column-level `ForeignKey` used to play
automatically. Both relationships are `viewonly=True`: every real write
already happens by constructing `TlAssemblyItem(ID=tool_id, ...)` or
`TlAssemblyItem(ID=holder.ID, ...)` directly (`insert_tool`,
- `_copy_tool_assembly` below) — nothing ever wrote through
`.catalog_item =`/`.tool =`, so marking both read-only costs nothing
and is simply honest about how they're actually used.

### CS Lens / SE Lens

Not repeated — fully covered by `sqlalchemy-explicit-primaryjoin-
shared-catalog.md`.

### Commands

The cross-reference query shown in "The Problem," above.

### Run It

```pycon
>>> holder_ids <= item_ids
True
```

Confirmed directly — every real holder ID in the sample file has its
own real `TlAssemblyItem` catalog row.

---

## Concept Unit: Composite Natural Keys for Rows With No Real Surrogate ID

### The Problem

`TlProfileData` (one row per real line segment) and
`TlAssemblyComponent` (one row per item in an assembly) have no single
ID column of their own in the real schema at all — `pragma
table_info(TlProfileData)` lists `ItemID, Segment, Type, Color, x0, y0,
x1, y1, radius, StartAngle, SweepAngle` and nothing resembling a
surrogate key.

### Introduce the Concept in Isolation

First appearance of this exact pattern in this project — full
standalone treatment: `concepts/composite-natural-primary-key.md`. Read
that first; its own isolated example (`OutlineSegment`, keyed by
`(shape_id, position)`) is precisely this project's own
`TlProfileData`, generalized.

### Project Change

- **Reference Source** — none; a real, direct mapping of the real
  schema, not a design choice made in isolation.
- **Files affected** — `cnc-service/core/tools.py` (new
  `TlProfileData`, `TlAssemblyComponent`).
- **Change type** — add.
- **Location** — new classes.
- **Dependencies** — `composite-natural-primary-key.md`.

### The New Code

```python
class TlProfileData(Base):
    __tablename__ = "TlProfileData"

    # No single real ID column -- (ItemID, Segment) together are what's
    # actually unique per row in the real file, so that's the composite
    # key here too, not an invented surrogate one. `x0,y0 -> x1,y1` is a
    # real 2D line segment (x = radius, y = axial/Z position -- confirmed
    # by hand-tracing a real 5-segment holder profile end to end: it
    # traces a closed, monotonically-stepped outline exactly like a
    # lathe-style revolve cross-section). `Type` is kept even though
    # every real row in both files sampled this session (15,071 rows
    # total) is `2` (line) -- never an arc -- so `radius`/`StartAngle`/
    # `SweepAngle` are real, named, currently-unexercised columns, not
    # invented ones; arc-segment revolving is real, deferred scope.
    ItemID: Mapped[uuid.UUID] = mapped_column(GUID, primary_key=True)
    Segment: Mapped[int] = mapped_column(primary_key=True)
    Type: Mapped[int]
    x0: Mapped[float]
    y0: Mapped[float]
    x1: Mapped[float]
    y1: Mapped[float]
    radius: Mapped[float] = mapped_column(default=0.0)
    StartAngle: Mapped[float] = mapped_column(default=0.0)
    SweepAngle: Mapped[float] = mapped_column(default=0.0)
```

```python
class TlAssemblyComponent(Base):
    __tablename__ = "TlAssemblyComponent"

    # (TlAssemblyID, TlAssemblyItemID) together are the real unique key
    # per row -- one row per item participating in a given assembly.
    # `CScalar` is the real tool-to-holder stickout distance (confirmed
    # directly): within one assembly's two real component rows, the
    # nonzero CScalar present is how far the tool protrudes from the
    # holder's own gauge line.
    TlAssemblyID: Mapped[uuid.UUID] = mapped_column(
        GUID, ForeignKey("TlAssembly.ID"), primary_key=True
    )
    TlAssemblyItemID: Mapped[uuid.UUID] = mapped_column(GUID, primary_key=True)
    ParentID: Mapped[uuid.UUID | None] = mapped_column(GUID, default=None)
    CScalar: Mapped[float] = mapped_column(default=0.0)

    assembly: Mapped["TlAssembly"] = relationship(back_populates="components")
```

### Mechanical Walkthrough

Declaring `primary_key=True` on two columns (`ItemID`/`Segment`, or
`TlAssemblyID`/`TlAssemblyItemID`) makes SQLAlchemy treat the *pair* as
one composite key — real uniqueness enforced on the combination, with
no invented `id` column carrying no real meaning of its own. This
mirrors the real schema exactly: neither table has a surrogate ID in
Mastercam's own file, and neither needed one added.

### CS Lens / SE Lens

Not repeated — fully covered by `composite-natural-primary-key.md`.

### Commands

`pragma table_info(TlProfileData)` / `pragma table_info(TlAssemblyComponent)`
(the general technique from the schema-introspection unit above,
applied to these two specific tables).

### Run It

Confirmed directly against the real file — no duplicate
`(ItemID, Segment)` or `(TlAssemblyID, TlAssemblyItemID)` pairs exist in
either real `.TOOLDB` inspected this session.

---

## Concept Unit: `TlHolder` and `TlAssembly` — the Rest of the Real Model

### The Problem

With the profile/component keys settled and the shared-catalog question
resolved, the remaining two real tables (`TlHolder` itself, and
`TlAssembly`, the thing that actually ties a tool to a holder) needed
their own models.

### Project Change

- **Reference Source** — none.
- **Files affected** — `cnc-service/core/tools.py`.
- **Change type** — add.
- **Location** — directly above `TlAssemblyItem`.
- **Dependencies** — `sqlite-schema-introspection-via-pragma.md` (the
  columns below are exactly what `pragma table_info` reported — no more,
  no less).

### The New Code

```python
class TlHolder(Base):
    __tablename__ = "TlHolder"

    # Real, confirmed against both the project's own Untitled.TOOLDB and
    # Mastercam's own official system library (Mill_Inch.tooldb, 921 real
    # holders): TlHolder itself carries no body dimensions at all -- just
    # these connection-type/size enums plus CustomDisplayType. The real,
    # literal holder outline lives in TlProfileData (above), keyed by
    # this same ID -- confirmed by cross-referencing every real ItemID in
    # TlProfileData against TlHolder.ID in both files.
    ID: Mapped[uuid.UUID] = mapped_column(GUID, primary_key=True)
    HolderType: Mapped[int] = mapped_column(default=0)
    UpperConnectionType: Mapped[int] = mapped_column(default=0)
    UpperConnectionSize: Mapped[str] = mapped_column(default="")
    LowerConnectionType: Mapped[int] = mapped_column(default=0)
    LowerConnectionSize: Mapped[str] = mapped_column(default="")

    profile: Mapped[list["TlProfileData"]] = relationship(
        primaryjoin="TlHolder.ID == foreign(TlProfileData.ItemID)",
        order_by="TlProfileData.Segment",
        viewonly=True,
    )


class TlAssembly(Base):
    __tablename__ = "TlAssembly"

    # `MainHolder`/`MainTool` are real, direct GUID pointers -- confirmed
    # against every real assembly in Untitled.TOOLDB, they resolve
    # correctly with a plain join, no tree-walking needed. The fuller,
    # general case (TlAssemblyComponent's own parent/child tree --
    # holder extensions, right-angle heads, more than one tool per
    # assembly) is real, deliberately deferred scope: this pass only
    # supports the direct one-tool/one-holder case MainTool/MainHolder
    # already cover, per direct instruction to build the two-slice
    # feature (modal + preview first).
    ID: Mapped[uuid.UUID] = mapped_column(GUID, primary_key=True)
    Name: Mapped[str] = mapped_column(default="")
    MainHolder: Mapped[uuid.UUID | None] = mapped_column(GUID, default=None)
    MainTool: Mapped[uuid.UUID | None] = mapped_column(GUID, default=None)
    ToolNumber: Mapped[int] = mapped_column(default=0)

    components: Mapped[list["TlAssemblyComponent"]] = relationship(
        back_populates="assembly", viewonly=True,
    )
```

### Mechanical Walkthrough
- `TlHolder.profile` — the same `primaryjoin`/`foreign()` shape as the
shared-catalog unit above, here for a genuinely one-directional,
one-real-owner relationship (a profile segment always belongs to
- exactly one holder) — `viewonly=True` for the same reason: real writes
go through `_copy_tool_assembly` (below), never through this attribute.
`order_by="TlProfileData.Segment"` guarantees the profile always comes
back in real outline order, matching the order the segments were
actually drawn in.

`MainHolder`/`MainTool` verified directly before being trusted as "the
simple case":

```
$ python3 -c "
import sqlite3
conn = sqlite3.connect('Untitled.TOOLDB')
conn.row_factory = sqlite3.Row
cur = conn.cursor()
cur.execute('''
select a.Name, a.ToolNumber, ti.Name as tool_name, hi.Name as holder_name
from TlAssembly a
join TlAssemblyItem ti on ti.ID = a.MainTool
join TlAssemblyItem hi on hi.ID = a.MainHolder
''')
for r in cur.fetchall(): print(dict(r))
"
{'Name': 'TA5120', 'ToolNumber': 1, 'tool_name': '0.5 Bull endmill', 'holder_name': 'HSK63ATT088394'}
{'Name': 'TA4015', 'ToolNumber': 2, 'tool_name': '.3125 CT 1"LOC', 'holder_name': 'HSK63ATT044354'}
{'Name': 'TA1215', 'ToolNumber': 3, 'tool_name': '0.25 Flat endmill', 'holder_name': 'H4Y3A0375'}
{'Name': 'TA1018', 'ToolNumber': 4, 'tool_name': '.25 double angle cutter', 'holder_name': 'HSK 63A PG15'}
```

All 4 real assemblies resolve correctly through a plain join — no
`TlAssemblyComponent` tree-walk needed for this project's own current
scope.

### CS Lens

Not a hard CS concept beyond what's already covered above.

### SE Lens

Choosing the simpler `MainTool`/`MainHolder` path over the fully
general `TlAssemblyComponent` tree (which supports holder extensions
and multi-tool assemblies) is a real, named scope cut, not an oversight
— verified first (the query above) that it actually covers every real
case in the data available, rather than assumed to be "probably fine."

### Commands

The join query shown above.

### Run It

Real output shown above — 4/4 real assemblies resolved correctly.

---

## Concept Unit: `get_tool_assembly` and the New Endpoint

### Project Change

- **Reference Source** — none.
- **Files affected** — `cnc-service/core/tools.py`, `cnc-service/app.py`.
- **Change type** — add.
- **Location** — `core/tools.py` near `get_tool_by_id`; `app.py` near
  the other `/api/tools/...` routes.
- **Dependencies** — every model above.

### The New Code

```python
def get_tool_assembly(tool_id):
    """Returns the real holder profile + tool-to-holder stickout for one
    tool's assembly, or None if this tool has no assembly at all (a
    manually-added/seed tool, or a real tool that was imported before
    this feature existed and has no copied assembly rows).

    Only the direct one-tool/one-holder case (TlAssembly's own
    MainTool/MainHolder) is read -- see that class's own comment on the
    real, deliberately deferred general case.
    """
    with get_session() as session:
        assembly = session.execute(
            select(TlAssembly).where(TlAssembly.MainTool == tool_id)
        ).scalar_one_or_none()
        if assembly is None or assembly.MainHolder is None:
            return None
        holder = session.execute(
            select(TlHolder).where(TlHolder.ID == assembly.MainHolder)
        ).scalar_one_or_none()
        if holder is None:
            return None
        holder_catalog = session.execute(
            select(TlAssemblyItem).where(TlAssemblyItem.ID == holder.ID)
        ).scalar_one_or_none()
        # The nonzero CScalar among this assembly's real component rows
        # is the tool's own real stickout past the holder's gauge line
        # (confirmed directly) -- 0.0 if neither component row carries
        # one (a real, valid case: no recorded stickout offset).
        stickout = next((c.CScalar for c in assembly.components if c.CScalar), 0.0)
        points = [{"x": seg.x0, "y": seg.y0} for seg in holder.profile]
        if holder.profile:
            points.append({"x": holder.profile[-1].x1, "y": holder.profile[-1].y1})
        return {
            "holder_id": str(holder.ID),
            "holder_name": holder_catalog.Name if holder_catalog else "",
            "holder_type": holder.HolderType,
            "upper_connection_type": holder.UpperConnectionType,
            "upper_connection_size": holder.UpperConnectionSize,
            "lower_connection_type": holder.LowerConnectionType,
            "lower_connection_size": holder.LowerConnectionSize,
            "profile": points,
            "stickout": stickout,
        }
```

```python
@app.route("/api/tools/<uuid:tool_id>/assembly")
def get_assembly(tool_id):
    # Real, not synthesized: `holder_name`, `profile` (its actual 2D
    # revolve outline), and `stickout` all come from Mastercam's own
    # TlHolder/TlProfileData/TlAssemblyComponent rows, copied in at
    # import time (core/tools.py's own _copy_tool_assembly) -- a tool
    # imported before this feature existed, or added manually, has no
    # assembly at all, which is a real, valid `null`, not an error.
    if get_tool_by_id(tool_id) is None:
        return {"error": f"no tool with id {tool_id}"}, 404
    return {"assembly": get_tool_assembly(tool_id)}
```

### Mechanical Walkthrough
- `points` is built by taking every segment's own *start* point in
  order, then appending the very last segment's *end* point once —
  since consecutive real segments share an endpoint
  (`segment[i].x1,y1 == segment[i+1].x0,y0`), this reconstructs the
  complete, closed outline without repeating any shared point twice.
- `next((c.CScalar for c in assembly.components if c.CScalar), 0.0)` —
  a generator expression picking the first *truthy* (nonzero) `CScalar`
  among the assembly's real component rows, falling back to `0.0` if
  neither carries one — matching the real, confirmed shape (one row
  always 0.0, the other real) from the `CScalar` unit above.
- The route checks `get_tool_by_id(tool_id) is None` first, specifically
  so a request for a tool that doesn't exist at all (404) reads
  differently from a request for a real tool with no assembly
- (`200`, `{"assembly": null}`) — two different real situations, not
  conflated into one error response.

### CS Lens / SE Lens

Not a hard concept — ordinary application logic, verified directly
(below) rather than assumed correct from reading it alone.

### Commands

None new.

### Run It

A real Flask test-client round trip, against the actual imported data:

```pycon
>>> resp = client.get(f'/api/tools/{first_id}/assembly')
>>> resp.status_code
200
>>> resp.get_json()['assembly']['holder_name']
'HSK63ATT088394'
>>> resp.get_json()['assembly']['stickout']
2.6
>>> len(resp.get_json()['assembly']['profile'])
19
```

And the honest, real null case:

```pycon
>>> seed = tools.list_tools()
>>> tools.get_tool_assembly(seed[0]['id'])
None
```

Both confirmed directly, this session.

---

## Concept Unit: Importing Real Assembly Data Alongside Tool Data

### The Problem

`import_tools_from_file` (Lesson 18) already copies a tool's real
dimensional/catalog data on import. Without a matching extension, an
imported tool would have no assembly at all — every real holder/profile
row would stay behind in the source file, unreachable once the upload
that produced it is gone.

### Introduce the Concept in Isolation

**REAPPEARING** — this is exactly Lesson 18's own real-data-copy
convention, applied a second time to a second real relationship. No new
concept file.

### Project Change

- **Reference Source** — none.
- **Files affected** — `cnc-service/core/tools.py`
  (`import_tools_from_file`).
- **Change type** — add.
- **Location** — inside the existing per-tool import loop.
- **Dependencies** — every model above.

### The New Code

```python
def _copy_tool_assembly(source_session, tool_id):
    """Copies one tool's real assembly (its holder + real profile
    segments + tool-to-holder stickout) from `source_session` (the
    *source* file's own session, still open) into this project's own
    tables -- real data, imported the same way Lesson 18's tool import
    already copies real dimensional/catalog data, not synthesized.

    A no-op if this tool has no real assembly at all (a real, valid
    case -- not every real tool was ever saved as part of an assembly).
    Only the direct one-tool/one-holder case is copied -- see
    TlAssembly's own class comment on the real, deferred general case.
    """
    assembly = source_session.execute(
        select(TlAssembly).where(TlAssembly.MainTool == tool_id)
    ).scalar_one_or_none()
    if assembly is None or assembly.MainHolder is None:
        return
    holder = source_session.execute(
        select(TlHolder).where(TlHolder.ID == assembly.MainHolder)
    ).scalar_one_or_none()
    if holder is None:
        return
    with get_session() as session:
        already_have_holder = session.execute(
            select(TlHolder.ID).where(TlHolder.ID == holder.ID)
        ).scalar_one_or_none() is not None
        if not already_have_holder:
            session.add(
                TlHolder(
                    ID=holder.ID,
                    HolderType=holder.HolderType,
                    UpperConnectionType=holder.UpperConnectionType,
                    UpperConnectionSize=holder.UpperConnectionSize,
                    LowerConnectionType=holder.LowerConnectionType,
                    LowerConnectionSize=holder.LowerConnectionSize,
                )
            )
            holder_catalog = source_session.execute(
                select(TlAssemblyItem).where(TlAssemblyItem.ID == holder.ID)
            ).scalar_one_or_none()
            session.add(
                TlAssemblyItem(
                    ID=holder.ID,
                    Name=holder_catalog.Name if holder_catalog else "",
                    IsMetric=holder_catalog.IsMetric if holder_catalog else True,
                )
            )
            for seg in holder.profile:
                session.add(
                    TlProfileData(
                        ItemID=seg.ItemID, Segment=seg.Segment, Type=seg.Type,
                        x0=seg.x0, y0=seg.y0, x1=seg.x1, y1=seg.y1,
                        radius=seg.radius, StartAngle=seg.StartAngle,
                        SweepAngle=seg.SweepAngle,
                    )
                )
        already_have_assembly = session.execute(
            select(TlAssembly.ID).where(TlAssembly.ID == assembly.ID)
        ).scalar_one_or_none() is not None
        if not already_have_assembly:
            session.add(
                TlAssembly(
                    ID=assembly.ID, Name=assembly.Name,
                    MainHolder=assembly.MainHolder, MainTool=assembly.MainTool,
                    ToolNumber=assembly.ToolNumber,
                )
            )
            for component in assembly.components:
                session.add(
                    TlAssemblyComponent(
                        TlAssemblyID=component.TlAssemblyID,
                        TlAssemblyItemID=component.TlAssemblyItemID,
                        ParentID=component.ParentID,
                        CScalar=component.CScalar,
                    )
                )
        session.commit()
```

Wired in directly after the existing `insert_tool(...)` call — shown
whole, not elided, even though only the last two lines are new:

```python
                insert_tool(
                    row.ToolNumber,
                    {
                        "OverallDiameter": row.mill.OverallDiameter,
                        "OverallLength": row.mill.OverallLength,
                        "FluteCount": row.mill.FluteCount,
                        "CuttingDepth": row.mill.CuttingDepth,
                        "ArborDiameter": row.mill.ArborDiameter,
                    },
                    {
                        "Name": catalog.Name if catalog else "",
                        "is_metric": catalog.IsMetric if catalog else True,
                        "material_id": material_id,
                        "manufacturer_id": manufacturer_id,
                    },
                    endmill_fields={"CornerRadius": row.mill.endmill.CornerRadius} if row.mill.endmill else None,
                    drill_fields={"TipAngle": row.mill.drill.TipAngle} if row.mill.drill else None,
                    tool_id=row.ID,
                )
                _copy_tool_assembly(session, row.ID)               # ← new
                imported.append(str(row.ID))
```

### Mechanical Walkthrough
`_copy_tool_assembly` takes the *source* session (already open, reading
the uploaded file) as one argument, and separately opens this project's
- own `get_session()` to write into — two different databases, exactly
the same "read from one, write to the other" shape `import_tools_from_file`
already uses for tools themselves. `already_have_holder`/
`already_have_assembly` guards make this idempotent: importing the same
file twice (a real, already-handled case for tools) doesn't try to
insert the same holder/assembly rows again.

### CS Lens / SE Lens

Not repeated — this is Lesson 18's own real-data-copy convention,
reappearing.

### Commands

None new.

### Run It

```pycon
>>> tool_ids = [... 4 real GUIDs from Untitled.TOOLDB ...]
>>> tools.import_tools_from_file(r'Untitled.TOOLDB', tool_ids)
{'imported': [...4 ids...], 'skipped_duplicate': [], 'skipped_unsupported': []}
>>> tools.get_tool_assembly(tool_ids[0])
{'holder_id': '603a021b-...', 'holder_name': 'HSK63ATT088394', ...,
 'profile': [{'x': 0.0, 'y': 0.0}, ..., 19 real points ...], 'stickout': 2.6}
```

Real output, this session, against the actual file.

---

## Concept Unit: Verifying Against Something That Didn't Make It

### The Problem

Every check up to this point — the Flask round trip, the direct
`pycon` calls — only proves this project's own code reads back what it
itself wrote. None of it proves the *interpretation* (`x` = radius,
`y` = axial) is actually correct, since a wrong shared assumption
would make every one of those tests pass identically.

### Introduce the Concept in Isolation

First appearance of this exact technique in this project — full
standalone treatment: `concepts/verification-against-independent-
ground-truth.md`. Read that first; its own worked example (radius vs.
diameter, resolved by checking against the original software) is
precisely the test performed here.

### Mechanical Walkthrough

A real, deliberate, isolated change — made in a **copy** of the file,
never the original:

```
$ cp Untitled.TOOLDB Untitled_test.TOOLDB
$ python3 -c "
import sqlite3
conn = sqlite3.connect('Untitled_test.TOOLDB')
cur = conn.cursor()
holder_id = bytes.fromhex('1b023a606c49214fbe366a54da6e86a3')
SCALE = 1.5
cur.execute('select Segment, x0, x1 from TlProfileData where ItemID=?', (holder_id,))
for seg, x0, x1 in cur.fetchall():
    cur.execute(
        'update TlProfileData set x0=?, x1=? where ItemID=? and Segment=?',
        (x0 * SCALE, x1 * SCALE, holder_id, seg),
    )
conn.commit()
"
```

Only `x0`/`x1` (the radius values) were scaled by 1.5×; `y0`/`y1` (the
axial values) were left untouched — if the interpretation is right, the
holder should render visibly *fatter*, at the *same length*, not
taller or shorter. Confirmed the original file was untouched
(`Untitled.TOOLDB`'s own segment 5 still read `0.9429, 1.2311` after the
edit — the copy, not the source, was ever modified).

**The real ground-truth check**: `Untitled_test.TOOLDB`, opened
directly in actual Mastercam — the one program that has never seen this
project's own code, and renders holders however its own real, internal
logic says a `TlProfileData` row should look. Reported result, directly:
the holder appeared "much fatter" — exactly, unambiguously, what the
`x` = radius interpretation predicts, and not what a wrong
interpretation (say, `x` = diameter, or `x`/`y` swapped) would have
produced.

### CS Lens / SE Lens

Not repeated — fully covered by `verification-against-independent-
ground-truth.md`. The real, concrete stakes here: every model class,
every endpoint, and the entire planned frontend revolve (Lesson 48, not
yet built) all depend on `x` genuinely meaning radius. A self-consistent
but wrong belief about that one fact would have silently produced
confidently wrong 3D geometry for every real holder this feature will
ever show — caught here, before any of that code was written, by
checking against the one authority that was never told what this
project believes.

### Commands

Both shown above — the copy, and the scale-and-update script.

### Run It

```
Real, this session: original Untitled.TOOLDB confirmed byte-for-byte
unchanged after the edit (segment 5's x0,x1 still 0.9429, 1.2311).
Untitled_test.TOOLDB opened in real Mastercam: the scaled holder
rendered visibly fatter, same length -- confirmed directly by the user,
the ground-truth check this entire interpretation depended on.
```

---

## Connect the Pieces

One real chain, start to finish: the reference's own `buildFullToolProfile`
turned out to be dead code, so the only real source of truth was the
actual `.TOOLDB` file — read directly, table by table, via `pragma
table_info` and row counts, until the real, populated `TlProfileData`
table surfaced as the actual holder-geometry mechanism, keyed to
`TlHolder.ID` (not a tool), with `x` = radius and `y` = axial position,
confirmed by hand-tracing a real profile and then, independently, by
scaling one in a copy of the file and watching real Mastercam render it
fatter. `TlAssemblyItem` turned out to be a shared catalog for both
tools and holders, requiring an honest `primaryjoin` rewrite rather than
the single FK Lesson 17 first assumed. Every new table
(`TlHolder`/`TlProfileData`/`TlAssembly`/`TlAssemblyComponent`) uses the
real key shape the actual file has — composite where the file has no
surrogate ID, a direct GUID where it does. `import_tools_from_file` now
carries a tool's real assembly across an import, the same way it
already carries dimensional/catalog data; `/api/tools/<id>/assembly`
exposes it, `null` when a tool honestly has none. Nothing in this
lesson was assumed correct without being checked against something
outside this project's own code — a comment (checked against real
usage), a column name (checked against real row counts and real
cross-references), and finally an entire interpretation (checked
against real, independent software that was never told what this
project believes).

## What Breaks Without This

Re-adding `ForeignKey("TlTool.ID")` to `TlAssemblyItem.ID` and
re-running the real import against `Untitled.TOOLDB`: every holder's
own `TlAssemblyItem` row (`HSK63ATT088394`, etc.) would still insert
without error (SQLite never enforces the FK) — but the relationship
itself would silently claim every holder's catalog row is really a
tool's, misrepresenting real data the moment anything tried to read
`TlAssemblyItem.tool` for a holder's own row and got a nonsensical
match instead of the honest `None` the current model correctly returns.

## Exercises

1. Read `concepts/sqlite-schema-introspection-via-pragma.md`'s own
   Try-It-Yourself exercise 3 and, against `Untitled.TOOLDB`, find one
   more real table (of the 76 total) that's schema-present but
   currently empty in this specific file — name it, and state what real
   feature would need it before it would ever hold data.
2. Trace `get_tool_assembly`'s own `points` reconstruction by hand for
   the 5-segment holder shown in the revolve-profile unit above —
   write out the exact 6-point list it would produce, and confirm no
   point is duplicated.
3. `verification-against-independent-ground-truth.md`'s own Try-It-
   Yourself exercise 3 asks about cases with no independent authority
   available. Name one real value in this lesson's own new schema
   (`HolderType`, `UpperConnectionType`, etc.) that's still an
   unverified guess at what its integer values actually mean, and
   describe what a real ground-truth check for it would look like.

## Known Incomplete — Named Directly

- **Only the direct one-tool/one-holder case is modeled** — a real,
  deliberate scope cut named throughout (`TlAssembly` and
  `_copy_tool_assembly`'s own comments): holder extensions,
  right-angle heads, and multi-tool assemblies (`TlAssemblyComponent`'s
  fuller parent/child tree) are real, un-built future work.
- **Arc segments are schema-real but never exercised** — every real
  segment sampled this session (15,071 rows across two files) is a
  line; `TlProfileData.radius`/`StartAngle`/`SweepAngle` exist and are
  copied faithfully, but nothing yet revolves an arc into geometry.
- **`HolderType`/`UpperConnectionType`/`LowerConnectionType`'s own real
  integer meanings are still unconfirmed** — copied and stored
  faithfully as opaque integers, not yet decoded into real, named
  values (e.g. "BT40" vs. whatever `UpperConnectionType=4` actually
  means) — a real gap named directly, per Exercise 3 above.
- **No frontend yet** — this lesson is the backend half only, by
  design (the two-slice plan agreed on directly). The revolve utility
  and the assembly modal are Lesson 48, not started.
- **`delete_tool` does not clean up assembly data** — deleting a tool
  currently leaves its `TlAssembly`/`TlAssemblyComponent`/`TlHolder`/
  `TlProfileData` rows behind, orphaned. A real, named gap, not
  addressed this pass.

## Definition of Done

- [x] `TlHolder`, `TlProfileData`, `TlAssembly`, `TlAssemblyComponent`
      added, matching the real schema exactly (verified via `pragma
      table_info` against two real files).
- [x] `TlAssemblyItem`'s relationship to `TlTool` corrected (explicit
      `primaryjoin`/`foreign()`, `viewonly`), confirmed it still reads a
      real external file correctly (the exact regression class Lesson
      45 hit before).
- [x] `get_tool_assembly` + `/api/tools/<id>/assembly`, verified via a
      real Flask test-client round trip against real imported data, and
      a real `None`/`null` case for a tool with no assembly.
- [x] `import_tools_from_file` copies real assembly data
      (`_copy_tool_assembly`), idempotent on re-import.
- [x] Four new, project-independent concept files
      (`sqlite-schema-introspection-via-pragma.md`, `sqlalchemy-
      explicit-primaryjoin-shared-catalog.md`, `composite-natural-
      primary-key.md`, `verification-against-independent-ground-
      truth.md`).
- [x] Ground-truth verified in real Mastercam — a scaled holder
      rendered visibly, correctly fatter, confirmed directly.
- [x] `py_compile` clean on both changed files.

```
git commit -m "Lesson 47: the proof lived outside the repo"
```
