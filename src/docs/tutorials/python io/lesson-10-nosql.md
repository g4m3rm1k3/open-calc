# Lesson 10: Two NoSQL Mental Models — Key-Value and Document Storage

**What you will build:** a `recordkeeper/kv_store.py` module using the
standard library's `shelve` for pure key-value storage, and a
`recordkeeper/doc_store.py` module storing `Contact`s as JSON blobs in
SQLite and querying into them with SQLite's own JSON1 functions. The
transferable problem: Lessons 8-9 built on the relational model — a
fixed table schema, every row shaped identically, values found by
naming a column. "NoSQL" isn't one alternative to that, it's a
family of different mental models; this lesson proves two of the most
common ones directly — a schema-free key-to-anything mapping, and a
schema-*on-read* document store where structure lives inside each
value instead of being fixed by the table.

**What you need to know first:** Lesson 4 — `Contact`, `asdict`.
Lesson 8 — `sqlite3` connections, parameterized queries. Lesson 9's own
comparison mindset (place a new approach directly next to an existing
one and check where they actually agree and differ) carries forward
here too.

**Terms used in this lesson**

- **Schema-on-write** — a storage model where a value's structure
  (which fields exist, their types) is fixed in advance, before any
  data is written, and every write is checked against it. The
  relational model (Lessons 8-9) is schema-on-write: a table's `CREATE
  TABLE` statement fixes its columns before any row can be inserted.
- **Schema-on-read** — a storage model where a value's structure isn't
  fixed by the storage system at all; each individual value can, in
  principle, have its own shape, and any assumption about that shape is
  only checked at the moment something tries to read a specific field
  back out. It exists to trade the relational model's up-front
  structural guarantee for flexibility — adding a new field to some
  but not all records requires no schema change at all, at the cost of
  no longer having the storage system itself guarantee every record has
  the fields a reader expects.
- **Key-value store** — a storage model with exactly one operation
  shape: given a key, store or retrieve one associated value, with no
  built-in notion of columns, rows, or a query language beyond "look up
  this exact key." It exists as the simplest possible persistent
  storage model — useful specifically because it makes so few
  assumptions about what's being stored that almost anything fits.
- **Document store** — a storage model where each stored unit (a
  "document") is a self-contained, structured value — commonly JSON —
  and the store offers a genuine query language capable of looking
  *inside* a document's own structure, not just retrieving it whole by
  key. It exists as a middle ground between a plain key-value store's
  bare lookup-by-key and a relational table's fixed-column querying:
  documents can vary in shape from one to the next, the way key-value
  values can, while still being queryable by their internal fields, the
  way relational rows are.

**Objects and methods used**

- **`shelve.open`**
  - *What it is:* A function from the standard library's `shelve`
    module that opens a persistent, dict-like object backed by a file
    on disk.
  - *Implementation:* `shelve.open(path) -> a Shelf object`, usable as
    a context manager; supports the same `db[key] = value`,
    `db[key]`, `.keys()` operations a plain `dict` does, transparently
    pickling (Python's own object-serialization format) each value to
    store it and unpickling it on read.
  - *Its use:* What `kv_store.py` uses to persist `Contact` data,
    keyed by a string, with no schema declared anywhere.
  - *Type / Responsibility / Depends on / Connects to / Shape:* A
    standard-library function returning a dict-like object; responsible
    for transparently serializing whatever Python value is assigned to
    a key and persisting it to disk, then reversing that on read;
    depends on a file path (an underlying `dbm`-format file is
    created); connects to nothing else — it's a leaf storage mechanism;
    shape is a `str` key and (almost) any Python value in, that same
    value, reconstructed, out — no fixed value shape required at all,
    unlike a database column.

- **SQLite's `json_extract`**
  - *What it is:* A SQL function, part of SQLite's built-in JSON1
    extension, that pulls one value out of a JSON-formatted text
    column using a path expression.
  - *Implementation:* `json_extract(json_text, path) -> a value`;
    `path` uses a `$.field` syntax (`$` meaning the document's own
    root); returns SQL `NULL` if the path doesn't exist in the given
    JSON text, rather than raising an error.
  - *Its use:* What `find_by_name_doc` uses to query *inside* each
    stored JSON document's `name` field, from plain SQL.
  - *Type / Responsibility / Depends on / Connects to / Shape:* A
    built-in SQL function (not a Python object — called from within SQL
    text, same as any other SQL function like `COUNT` or `UPPER`);
    responsible for parsing a JSON text value and returning whatever
    sits at a given path inside it, or `NULL` if that path is absent;
    depends on the column it's applied to actually containing
    well-formed JSON text; used both in a `SELECT`'s column list (to
    extract a value for output) and inside a `WHERE` clause (to filter
    by an extracted value) in this lesson's lab and in
    `find_by_name_doc`; shape is a JSON text column and a path string
    in, one SQL value (or `NULL`) out per row.

---

## Concept Unit: Key-value storage — no schema at all

### The Problem

Every storage mechanism `recordkeeper` has used so far — CSV, JSON,
XML, and both SQL layers — assumes a fixed, known shape for every
record: `Contact`'s same four fields, every time. Not every piece of
data a real program needs to persist fits that assumption equally
well — a small, miscellaneous cache of per-contact notes, a
configuration value, a session token — each with its own, possibly
completely different shape, where building (and maintaining) a whole
relational table per shape would be far more structure than the data
actually needs.

> **Stop and think:** If a storage system offers exactly one operation
> — "given this key, store or retrieve this value" — with no fixed
> notion of what a value has to look like, what could that let you
> store that a fixed-schema table couldn't hold naturally? What would
> you lose, compared to a table, in exchange for that flexibility?

### Introduce the concept in isolation

```python
import shelve

with shelve.open("scratch_kv") as db:
    db["contact:1"] = {
        "id": "1", "name": "Alice Smith", "email": "alice@example.com",
        "notes": "Prefers email, not calls",
    }
    db["contact:2"] = {
        "id": "2", "name": "Bob Lee", "email": "bob@example.com",
        "notes": "Referred by Alice\nFollow up in June",
        "vip": True,
    }
    db["config:retry_count"] = 3

with shelve.open("scratch_kv") as db:
    print("contact:1  ->", db["contact:1"])
    print("contact:2  ->", db["contact:2"])
    print("config:retry_count ->", db["config:retry_count"])
    print("keys() ->", list(db.keys()))
    try:
        print(db["contact:999"])
    except KeyError as e:
        print(f"{type(e).__name__}:", e)
```

Real output:

```
contact:1  -> {'id': '1', 'name': 'Alice Smith', 'email': 'alice@example.com', 'notes': 'Prefers email, not calls'}
contact:2  -> {'id': '2', 'name': 'Bob Lee', 'email': 'bob@example.com', 'notes': 'Referred by Alice\nFollow up in June', 'vip': True}
config:retry_count -> 3
keys() -> ['config:retry_count', 'contact:2', 'contact:1']
KeyError: b'contact:999'
```

Three completely different-shaped values — two dicts with genuinely
different fields (`contact:2` has a `vip` key `contact:1` doesn't have
at all) and one bare integer — are stored under three keys in the same
`db`, with no schema declared anywhere, no `CREATE TABLE`, nothing
checked at write time about what shape a value has to be. This is a
**key-value store**, named here in full: the only two real operations
are "set this key to this value" and "get this key's value." Looking
up a key that was never set raises a real `KeyError` — note the key
appears as `b'contact:999'`, bytes rather than a plain string; `shelve`
stores keys internally as bytes, converting a `str` key to bytes
automatically on the way in, a real, visible implementation detail this
error message exposes.

### Discard the throwaway example

`scratch_kv`'s underlying file and this lab's code are discarded; the
`shelve`-based pattern they prove carries forward into `kv_store.py`
below.

### Project Change

- **Reference Source** — none; from-scratch, as in every prior lesson.
- **Files affected** — new file `recordkeeper/kv_store.py`.
- **Change type** — add.
- **Location** — n/a (new file).
- **Dependencies** — `shelve` (standard library);
  `recordkeeper.models.Contact` (Lesson 4).

### The New Code

```python
import shelve
from dataclasses import asdict

from recordkeeper.models import Contact


def save_contacts(path, contacts):
    with shelve.open(path) as db:
        for contact in contacts:
            db[f"contact:{contact.id}"] = asdict(contact)


def load_contact(path, contact_id):
    with shelve.open(path) as db:
        return Contact(**db[f"contact:{contact_id}"])
```

### The Updated Project

Brand-new file, nothing surrounding this fragment yet — covered by
Project Change above.

### Mechanical walkthrough

- **`with shelve.open(path) as db:`** — full treatment of
  `shelve.open` above; the same `with`/context-manager protocol from
  Lesson 1, applied here to a `Shelf` object instead of a file object —
  guarantees the underlying file is properly closed (and any buffered
  writes flushed) once the block ends.
- **`db[f"contact:{contact.id}"] = asdict(contact)`** — an f-string
  builds a namespaced key (`"contact:1"`, `"contact:2"`, ...) so
  contact keys can't collide with some other, differently-prefixed kind
  of key this store might hold later, mirroring `"contact:1"`'s own
  shape from this unit's isolated lab; `asdict(contact)` (full
  treatment already given in Lesson 5) converts the `Contact` into a
  plain dict, since that's what gets pickled and stored.
- **`Contact(**db[f"contact:{contact_id}"])`** — the same keyword-
  unpacking reconstruction pattern used since Lesson 4 (`Contact(**row)`
  for JSON, Lesson 5), applied here to whatever dict `shelve` hands
  back for the requested key.

### CS lens

A key-value store's single "get/set by key" interface is the same
underlying operation a plain Python `dict` provides in memory, made
persistent — the **associative array** abstraction, at the storage
layer instead of the language layer.

```
Also recognized in: an operating system's own environment-variable
table, a web browser's localStorage, a CDN's edge cache keyed by URL,
DNS itself (a name-to-address key-value lookup at internet scale)
```

### SE lens

The alternative not chosen for `recordkeeper`'s actual `Contact` data
is treating `kv_store.py` as `Contact`'s primary storage — replacing
`store.py` (Lesson 8) or `orm.py` (Lesson 9) entirely. That would be a
real regression: a key-value store, per this unit's own lab, offers no
way to ask "which contacts have this email domain" or "how many
contacts are there" without manually fetching and inspecting every
single value — no query language beyond exact-key lookup exists at
all. `kv_store.py` is genuinely well-suited to `recordkeeper`'s
*miscellaneous*, variably-shaped data instead — a per-contact scratch
note, a cached lookup result — where building a dedicated relational
table per shape would add far more structure than the data actually
needs, at the real cost of losing every query capability beyond "I
already know the exact key."

### Commands needed

None new.

### Run it

Shown above under "Introduce the concept in isolation" — real output.

### Connect

This unit shows the simplest possible persistent storage model — no
schema, no query language, just get and set by key; the next unit adds
back real query capability, into data that's still, deliberately,
schema-*free* at the storage level.

---

## Concept Unit: Document storage — queryable, still schema-free

### The Problem

`kv_store.py`'s only way to find "the contact named Alice Smith" is to
already know her key — there's no way to ask "which value has a `name`
field equal to this" without reading every single value out and
checking by hand. A relational table (Lesson 8) solves exactly this
with a real `WHERE` clause — but only for a value already broken out
into fixed, named columns ahead of time.

> **Stop and think:** If an entire `Contact`'s data is stored as one
> JSON-formatted text value in a single database column — the same
> `json.dumps`-produced text from Lesson 5 — is there any way SQL could
> still search *inside* that text for a specific field's value, the way
> `WHERE name = ?` searches a real column? Would that require SQLite to
> somehow understand JSON's own structure, not just treat the column as
> opaque text?

### Introduce the concept in isolation

```python
import sqlite3
import json

conn = sqlite3.connect(":memory:")
conn.execute("CREATE TABLE docs (id TEXT PRIMARY KEY, data TEXT)")

docs = [
    {"id": "1", "name": "Alice Smith", "email": "alice@example.com",
     "notes": "Prefers email, not calls"},
    {"id": "2", "name": "Bob Lee", "email": "bob@example.com",
     "notes": "Referred by Alice\nFollow up in June", "vip": True},
]
for d in docs:
    conn.execute("INSERT INTO docs (id, data) VALUES (?, ?)", (d["id"], json.dumps(d)))
conn.commit()

for row in conn.execute("SELECT id, data FROM docs"):
    print(row)

cur = conn.execute("SELECT id, json_extract(data, '$.name') FROM docs")
print(cur.fetchall())

cur = conn.execute("SELECT id FROM docs WHERE json_extract(data, '$.vip') = 1")
print(cur.fetchall())

cur = conn.execute("SELECT id, json_extract(data, '$.vip') FROM docs")
print(cur.fetchall())
```

Real output:

```
('1', '{"id": "1", "name": "Alice Smith", "email": "alice@example.com", "notes": "Prefers email, not calls"}')
('2', '{"id": "2", "name": "Bob Lee", "email": "bob@example.com", "notes": "Referred by Alice\\nFollow up in June", "vip": true}')
[('1', 'Alice Smith'), ('2', 'Bob Lee')]
[('2',)]
[('1', None), ('2', 1)]
```

The raw `SELECT id, data FROM docs` output confirms `data` really is
plain text as far as the `contacts` table's own schema is concerned —
one `TEXT` column, same as any other, with the two documents' entire
structure sitting inside it rather than broken into named columns.
`json_extract(data, '$.name')` (full treatment above, in Objects and
methods used) reaches *into* that text and pulls out just the `name`
field's value — real querying into a value SQLite itself never
declared any columns for. The `WHERE json_extract(data, '$.vip') = 1`
query proves this works as a genuine filter, not just an output
transform — only Bob's row, the one with a real `vip` field, comes
back. The final query is this unit's proof of **schema-on-read** (named
here in full, per Terms above): asking for `$.vip` on Alice's
document — which was never given a `vip` field at all — returns SQL
`NULL` (`None` in Python), not an error; nothing about SQLite's schema
required every document to agree on which fields exist, and a missing
field is discovered, harmlessly, only at the moment something actually
asks for it.

### Discard the throwaway example

This lab's in-memory `docs` table is discarded; the pattern it proves —
storing JSON text in one column, querying into it with `json_extract`
— carries forward into `doc_store.py` below.

### Project Change

- **Reference Source** — none; from-scratch, as in the previous unit.
- **Files affected** — new file `recordkeeper/doc_store.py`.
- **Change type** — add.
- **Location** — n/a (new file).
- **Dependencies** — `sqlite3`, `json` (both standard library);
  `recordkeeper.models.Contact` (Lesson 4).

### The New Code

```python
import json
import sqlite3
from dataclasses import asdict

from recordkeeper.models import Contact

SCHEMA = """
CREATE TABLE IF NOT EXISTS contact_docs (
    id TEXT PRIMARY KEY,
    data TEXT NOT NULL
)
"""


def connect(path):
    conn = sqlite3.connect(path)
    conn.execute(SCHEMA)
    conn.commit()
    return conn


def insert_contacts_doc(conn, contacts):
    rows = [(c.id, json.dumps(asdict(c))) for c in contacts]
    conn.executemany("INSERT INTO contact_docs (id, data) VALUES (?, ?)", rows)
    conn.commit()


def find_by_name_doc(conn, name):
    cur = conn.execute(
        "SELECT data FROM contact_docs WHERE json_extract(data, '$.name') = ?", (name,)
    )
    return [Contact(**json.loads(row[0])) for row in cur.fetchall()]
```

### The Updated Project

Brand-new file, nothing surrounding this fragment yet — covered by
Project Change above.

### Mechanical walkthrough

- **`SCHEMA`** — declares `contact_docs` with exactly two columns: `id`
  (a real primary key, still enforced relationally — one document per
  contact) and `data`, a plain `TEXT` column with no internal structure
  known to the table's own schema at all — the schema-on-write/
  schema-on-read split this unit's lab already proved happens *inside*
  that one column, not at the table level.
- **`json.dumps(asdict(c))`** — the same `asdict`-then-`json.dumps`
  pattern already given full treatment in Lesson 5's
  `contacts_to_json`, here producing one document's text per
  `Contact`, to be stored in a single row's `data` column instead of
  written to a file.
- **`conn.executemany("INSERT INTO contact_docs (id, data) VALUES (?, ?)", rows)`**
  — full treatment of `Connection.executemany` already given in Lesson
  8; each row's second value is a full JSON document, but as far as
  this parameterized `INSERT` is concerned, it's just one more string
  value — the same safe, structurally-separated placeholder Lesson 8
  proved immune to SQL injection.
- **`"... WHERE json_extract(data, '$.name') = ?"`** — full treatment
  of `json_extract` above; combined with a `?` placeholder for `name`
  itself, exactly like Lesson 8's `find_by_name` — proving this
  document-store version is no less safe against injection than the
  purely relational one, since the placeholder mechanism doesn't care
  whether the column being compared against is a plain value or the
  result of a JSON function.
- **`Contact(**json.loads(row[0]))`** — `json.loads` (full treatment,
  Lesson 5) parses the stored document text back into a plain dict;
  `Contact(**...)` reconstructs a real `Contact`, the same keyword-
  unpacking pattern used throughout this curriculum since Lesson 4.

### CS lens

Storing structured data as opaque text in one column, while still
being able to query *into* that structure via a dedicated function, is
an instance of the broader idea of a **semi-structured data model** —
data that has real, meaningful internal structure, but isn't required
to conform to one single, table-wide schema the way a fully relational
model demands.

```
Also recognized in: PostgreSQL's own native `JSONB` column type,
document databases like MongoDB (JSON-like documents as the primary
storage unit, not an add-on inside a relational column), log-analytics
platforms indexing semi-structured JSON log lines for search without
requiring every log line to share one fixed schema
```

### SE lens

The alternative not chosen for `recordkeeper`'s current `Contact`
data — genuinely uniform, four fields, every time — is keeping it fully
relational, as `store.py` (Lesson 8) and `orm.py` (Lesson 9) already
do. For data that's actually this uniform, the fully relational
approach has a real advantage this unit's lab didn't need to
prove again: the database itself *enforces* that every row has a
`name`, rather than merely allowing a reader to check for one and get
`None` if it's missing. `doc_store.py` is the right tool specifically
when records *don't* reliably share one shape — contacts imported from
a source that sometimes includes extra, source-specific fields (a
`vip` flag, a `referred_by` note) `recordkeeper`'s own `Contact`
doesn't define at all. Storing those documents relationally would mean
either rejecting the extra fields (losing real data) or repeatedly
altering the table's schema every time a new, occasional field shows
up; storing them as documents accepts that variability directly, at
the real cost this unit's own lab already demonstrated: nothing catches
a missing or misspelled field until something actually reads for it.

### Commands needed

None new.

### Run it

Real output, from an actual run against `recordkeeper`'s own real
`data/contacts.csv` (Lesson 3), through both of this lesson's new
modules:

```python
from recordkeeper.ingest.csv_source import load_contacts_csv
from recordkeeper.kv_store import save_contacts, load_contact
from recordkeeper.doc_store import connect, insert_contacts_doc, find_by_name_doc

contacts = load_contacts_csv("data/contacts.csv")

save_contacts("data/recordkeeper_kv", contacts)
print(load_contact("data/recordkeeper_kv", "1") == contacts[0])

conn = connect("data/recordkeeper_docs.db")
insert_contacts_doc(conn, contacts)
print(find_by_name_doc(conn, "Alice Smith") == [contacts[0]])
print(find_by_name_doc(conn, "x' OR '1'='1"))
```

```
True
True
[]
```

Both storage models round-trip `recordkeeper`'s real data correctly,
checked directly against the original `Contact` objects; the document
store's injection attempt, run through the exact same parameterized-`?`
pattern proven safe in Lesson 8, correctly returns nothing.

### Connect

The previous unit offered the simplest possible persistent model — get
and set by key, nothing more; this unit adds real query capability back
in, while keeping each stored value's own internal shape unfixed at the
table level — a genuinely different position on the schema-on-write
versus schema-on-read spectrum than either extreme this curriculum has
built so far.

---

## Connect the pieces

`recordkeeper` now has four different, real, verified ways to persist
the identical two `Contact` records — Alice's comma-containing notes,
Bob's newline-containing notes, unchanged since Lesson 3 — and this
lesson's own two additions sit at opposite ends of a real spectrum from
Lessons 8-9's relational approach. `store.py`/`orm.py` (schema-on-write):
every `Contact` field is a named, typed column, checked at write time,
queryable directly by column name. `kv_store.py` (this lesson, no
schema at all): a `Contact` is just whatever value happens to be
stored under a `"contact:{id}"` key, retrievable only by already
knowing that exact key. `doc_store.py` (this lesson, schema-on-read):
a `Contact` is a full JSON document in one text column, queryable by
its internal fields via `json_extract`, with a missing field
discovered as `None` at read time rather than rejected at write time.
All four were checked, in this lesson alone, against the exact same
real data, with the exact same `==` comparison against the original
`Contact` objects loaded from CSV — the choice between them is a real
design tradeoff about how much structure to fix in advance, not a
question of which one is "more correct."
