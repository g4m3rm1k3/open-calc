# Concept: Serializing a Structured Value Into a JSON Text Column

**What you'll understand by the end:** how to persist a real, nested,
structured Python value (a list of dataclasses) into a plain SQL text
column by explicitly converting it to and from JSON at the read/write
boundary — a genuinely different, more manual real technique from an
ORM's own automatic `TypeDecorator` conversion, appropriate when no
ORM is involved at all.

**Prerequisites:** `python-dataclasses.md`, `sqlite-file-based-database.md`.

## Setup

Python 3, no packages needed — `json` and `sqlite3` are both standard
library.

## The Problem

Some real data genuinely doesn't fit a single scalar SQL column — a
list of several structured records (a holder's own stack of frustum
segments, each with its own radius and Z position) — and building a
separate real child table for it is sometimes real, unnecessary
overhead when that nested structure is always read and written as one
complete unit, never queried by its own individual fields directly.

## The Isolated Example

```python
import json
import sqlite3
from dataclasses import asdict, dataclass


@dataclass
class Segment:
    radius: float
    z: float


def profile_to_json(segments):
    return json.dumps([asdict(s) for s in segments])


def profile_from_json(raw):
    return [Segment(**d) for d in json.loads(raw)]


conn = sqlite3.connect(":memory:")
conn.execute("CREATE TABLE holder (id INTEGER PRIMARY KEY, profile TEXT)")

segments = [Segment(0.0, 0.0), Segment(5.0, 0.0), Segment(5.0, 10.0)]
conn.execute("INSERT INTO holder (profile) VALUES (?)", (profile_to_json(segments),))
conn.commit()

row = conn.execute("SELECT profile FROM holder WHERE id = 1").fetchone()
restored = profile_from_json(row[0])
print("raw column value:", row[0])
print("restored:", restored)
print("restored == original:", restored == segments)
```

**Real output, run this session:**
```
raw column value: [{"radius": 0.0, "z": 0.0}, {"radius": 5.0, "z": 0.0}, {"radius": 5.0, "z": 10.0}]
restored: [Segment(radius=0.0, z=0.0), Segment(radius=5.0, z=0.0), Segment(radius=5.0, z=10.0)]
restored == original: True
```

**What this proves:** the real `profile` column genuinely stores
plain, human-readable JSON text (confirmed by printing the raw row
value) — and reading it back through `profile_from_json` reconstructs
the **identical** real list of `Segment` instances, confirmed directly
by `restored == segments` reporting `True`, not just "looks similar."

## Mechanical Walkthrough

- `asdict(segment)` (from the `dataclasses` module) converts one
  dataclass instance into a plain `dict` — `json.dumps` can serialize
  a `dict`, but has no idea how to serialize an arbitrary dataclass
  object directly.
- `json.dumps([...])` turns the whole real list of plain dicts into
  one JSON string — a single, ordinary text value, exactly what a
  `TEXT` SQL column already knows how to store.
- On the way back, `json.loads(raw)` parses that text back into plain
  Python dicts — `Segment(**d)` then reconstructs each real dataclass
  instance from its own dict, using keyword-argument unpacking.
- Both conversions happen **explicitly**, at the exact two real call
  sites that touch the database — there is no automatic hook running
  this conversion; every piece of code that reads or writes this
  column has to call the right function itself.

## CS Lens

This is a real, common instance of **serialization** — converting an
in-memory, structured value into a flat, storable/transmittable
representation (here, JSON text), and back. Storing structured data as
JSON inside an otherwise-relational column is a real, deliberate
tradeoff against full normalization (a separate child table, one row
per segment): it sacrifices the ability to query or index individual
segments directly, in exchange for a much simpler schema and read/
write path when the structure is always used as one complete, atomic
unit.

Also recognized in: a NoSQL document store's own native document
format (conceptually the identical idea, taken further — the entire
row *is* a JSON-shaped document); a config file format embedding a
structured value as a JSON or YAML string inside an otherwise flat
`.env`/`.ini`-style file; browser `localStorage`, which only ever
stores strings, commonly paired with `JSON.stringify`/`JSON.parse` at
its own read/write boundary for exactly this reason.

## SE Lens

The real, practical choice here versus an ORM's own automatic
conversion (see this file's own Connection section): plain `sqlite3`
has no concept of a "custom column type" doing this conversion for
you — every call site has to remember to call `profile_to_json`/
`profile_from_json` explicitly, a real, honest maintenance cost
(forgetting to call one produces a real, immediate bug — storing raw
Python objects `sqlite3` can't handle, or reading back an unparsed
string where structured data was expected) traded directly against
not needing an ORM's own real setup and abstraction overhead at all,
appropriate for a project deliberately choosing plain `sqlite3` (per
`sqlite-file-based-database.md`) over an ORM layer.

## Connection

Builds on `python-dataclasses.md` (`asdict`, the dataclass shape being
serialized) and `sqlite-file-based-database.md`. Directly contrasted
with `sqlalchemy-typedecorator-custom-column-type.md` — that file's
own `TypeDecorator` performs the *identical* real conversion (a
Python value ↔ a storable column representation), but **automatically**,
hooked into the ORM so every read/write through a mapped attribute
triggers it with no explicit call anywhere in application code; this
file's technique is the manual equivalent, appropriate specifically
because no ORM is involved at all. A real, applied instance in this
project's own history: a toolholder's own `profile` (a real list of
`HolderSegment` dataclasses describing its frustum-stack shape),
persisted as a single JSON text column via this exact
`json.dumps`/`json.loads` round-trip, reconstructing each dataclass
from its own dict at read time.

## Try It Yourself

1. Forget to call `profile_from_json` and instead try using the raw
   `row[0]` string directly as if it were already a list of
   `Segment`s — observe the real, concrete way this fails, direct
   evidence of the "every call site must remember" cost this file's
   own SE Lens names.
2. Add a real, second nested field to `Segment` (say, a `label: str`)
   and confirm the round-trip still works with **zero** changes to
   `profile_to_json`/`profile_from_json` themselves — reasoning about
   why `asdict`/`json.dumps` genuinely generalize to any dataclass
   shape, not just this specific one.
3. Try storing a dataclass containing a field JSON cannot natively
   serialize (a `datetime`, say) and observe the real, resulting
   `TypeError` — reasoning about what a real, complete solution would
   need to add (a custom JSON encoder/decoder) to support it.
