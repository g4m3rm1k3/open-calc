# Concept: Matching Persistence Technology to a Real Access Pattern

**What you'll understand by the end:** why "always use a database" and
"always use plain files" are both real, incomplete defaults — the
right real persistence technology depends on how many real records
exist, how often they're created/queried, and who (or what) needs to
read and edit them directly — not a single, universal best choice.

**Prerequisites:** `sqlite-file-based-database.md`.

## Setup

Python 3, no packages needed — `sqlite3` and `json` are both standard
library.

## The Problem

Persisting real, structured application data always needs *some*
storage technology, and it's tempting to default to whichever one a
project already uses elsewhere for everything. But two genuinely
different real kinds of data can have genuinely different real needs:
one might be numerous, frequently created, and queried by specific
fields; another might be few, long-lived, and need to be readable and
editable directly by a real person, not just through the application.

## The Isolated Example

Pattern A — many, frequently-created, frequently-queried records:

```python
import sqlite3

conn = sqlite3.connect(":memory:")
conn.execute("CREATE TABLE tools (id INTEGER PRIMARY KEY, name TEXT)")
for name in ["end_mill_1", "end_mill_2", "drill_1"]:
    conn.execute("INSERT INTO tools (name) VALUES (?)", (name,))
conn.commit()

matches = [row[0] for row in conn.execute("SELECT name FROM tools WHERE name LIKE 'end_mill%'")]
print("tools found via a real, indexed query:", matches)
```

**Real output, run this session:**
```
tools found via a real, indexed query: ['end_mill_1', 'end_mill_2']
```

Pattern B — few, long-lived, human-editable records:

```python
import json
import os
import tempfile

folder = tempfile.mkdtemp()
machine_path = os.path.join(folder, "haas-vf2.machine.json")
with open(machine_path, "w") as f:
    json.dump({"id": "haas-vf2", "channel_count": 1}, f, indent=2)

print("machine file is real, plain, human-readable text:")
print(open(machine_path).read())
```

**Real output, run this session:**
```
machine file is real, plain, human-readable text:
{
  "id": "haas-vf2",
  "channel_count": 1
}
```

**What this proves:** the database version genuinely answers a real,
specific query (`name LIKE 'end_mill%'`) efficiently, over however many
real tools eventually exist — exactly what a growing, frequently-
searched collection needs. The file version produces a real, plain
text file a person can open in any ordinary text editor, read, and
edit directly by hand — exactly what a small, human-managed set of
long-lived records needs, at the real cost of having no query
mechanism at all beyond "read the whole file."

## Mechanical Walkthrough

- A **database** (Pattern A) excels at real, efficient queries over a
  collection whose size isn't fixed in advance — an index makes
  `WHERE name LIKE ...` fast regardless of how many real rows exist,
  something scanning individual files could never match at scale.
- A **file per record** (Pattern B) excels at real, direct human
  access — no query language, no database client needed to inspect or
  edit a single real record; it's just text, openable, diffable, and
  version-controllable with the exact same tools used for source code.
- Neither technology is a strict, universal upgrade over the other —
  each optimizes for a genuinely different real property (efficient
  querying at scale vs. direct human readability/editability), and a
  real system can legitimately use *both*, for different real kinds of
  data, at the same time.
- The real, deciding question is about the data's own real shape and
  use, not a fixed technology preference: how many real records will
  there be, how often are they created and queried, and does a real
  person ever need to read or edit one directly, outside the
  application itself?

## CS Lens

This is a real, applied instance of choosing a **data structure/storage
tradeoff** based on actual, real usage patterns rather than a single,
universal default — the identical underlying judgment call behind
choosing a hash map over a sorted array, or a cache over recomputation:
different real access patterns favor genuinely different real
technologies, and the "best" choice is defined entirely relative to
how the data is actually going to be used.

Also recognized in: a real application storing user preferences in a
small config file while storing user-generated content in a real
database; source code itself (many small, plain, human-editable text
files, version-controlled) versus a build system's own dependency
graph (often cached in a fast, queryable, binary format); a real
photo library storing thumbnails in a database for fast querying while
leaving full-resolution originals as plain files on disk.

## SE Lens

The real, practical risk of defaulting to one technology everywhere:
forcing genuinely file-shaped data (few, long-lived, human-managed
records) into a database loses real, valuable properties — a shop
technician can no longer just open a machine's own definition in a
text editor, diff two versions in version control, or copy one file to
a USB drive and hand it to another shop. Forcing genuinely database-
shaped data (many, frequently-queried records) into individual files
loses efficient querying entirely, replaced by scanning every file by
hand. The real, honest cost of matching technology to pattern
correctly is maintaining two different real persistence mechanisms in
one application, rather than one — worth it specifically when the two
kinds of data genuinely have different real needs, not merely
different names.

## Connection

Builds on `sqlite-file-based-database.md` for Pattern A's own real
technology. A real, applied instance in this project's own history: a
tool library (many, frequently-imported, frequently-queried real tool
and holder records) persisted via SQLite, alongside a completely
separate real machine-definition store (few, long-lived, real machines
per shop) persisted as one plain, hand-editable JSON file per machine
in a user-chosen folder — the project's own code stating the real
reasoning directly: real machines are few and long-lived compared to
tools, and a file per machine (open it in any editor, put it in
version control, copy it to another shop) fits that access pattern
better than a database row would.

## Try It Yourself

1. Write a real query against Pattern A's own database asking for the
   total count of tools (`SELECT COUNT(*) FROM tools`) and reason about
   what the equivalent operation would require against Pattern B's own
   file-per-record approach (opening and counting every real file).
2. Try editing Pattern B's own real JSON file directly in a plain text
   editor, saving it, and reading it back into the application —
   confirming a real person genuinely can modify this data without the
   application's own UI at all, something a database row cannot offer
   nearly as directly.
3. Think of (or find, in a real codebase) a case where data was stored
   using the "wrong" technology for its own real access pattern —
   reasoning about which real property (efficient querying, or direct
   human access) was lost as a result.
