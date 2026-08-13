# Lesson 18: Every Row, a Real Record

**What you will build** — the first real `SELECT`-shaped read:
`Database.query(table)`, returning every row in a table as a real
Python `Record` object — indexable by position *or* by column name —
instead of fetching one row at a time by a numeric index you had to
already know. Built from two new, small, real C++ pieces:
`record_count` (how many records actually live on a page) and
`database_column_names` (a table's own real column names, exposed to
Python for the first time).

**What you need to know first:** Lesson 15 (`record_page`, a page's
own `slot_count`), Lesson 16 (`Table`, `Database`), Lesson 17
(`database_get`'s own comma-joined result convention).

**Terms introduced in this lesson:** **table scan** — reading every
row in a table, in order, with no filtering — the simplest possible
real way to answer "what's in this table," and the baseline every
later, smarter read strategy (an index, S06; a query planner, later)
gets measured against.

**Objects and methods used**
- **`record_count`**
  - *What it is:* this lesson's own real, small function, reading how
    many records a page actually holds.
  - *Implementation:* `std::memcpy(&slot_count, page, sizeof(uint32_t));
    return slot_count;` — reads the identical real `slot_count` field
    `insert_record`/`get_record` (Lesson 15) already maintain at a
    page's own first four bytes; this lesson just exposes it.
  - *Its use:* `Table::row_count`'s own real implementation.
- **`__getitem__`**
  - *What it is:* a real Python dunder method — defining it on a class
    makes instances support `obj[key]` (both `obj[0]` and
    `obj["name"]`), the same real mechanism that makes a `list` or
    `dict` support square brackets at all.
  - *Implementation:* `def __getitem__(self, key): if isinstance(key,
    str): key = self._columns.index(key); return self._values[key]`
  - *Its use:* `Record`'s own real, dual-mode access — the same real
    shape Python's own standard-library `sqlite3.Row` uses, which this
    project's own S05 (`README.md`) will later sit directly beside.
- **`isinstance`**
  - *What it is:* a real, standard Python built-in, checking whether a
    given value is really an instance of a given type.
  - *Implementation:* `isinstance(key, str)` — real-true if `key` is a
    genuine `str`, real-false otherwise (an `int`, here).
  - *Its use:* `Record.__getitem__`'s own real branch, telling a
    name-based lookup (`record["score"]`) apart from a position-based
    one (`record[2]`) by the real, runtime type of the key itself.
- **`__repr__`**
  - *What it is:* a real Python dunder method controlling how an
    object prints — what `print(obj)` or a bare `obj` in a REPL
    actually shows.
  - *Implementation:* returns a real, built string like
    `"Record(id=1, player='Alice', score=100)"`.
  - *Its use:* makes a real `Record` readable when printed directly,
    instead of Python's own default, uninformative
    `<pocketdb.Record object at 0x...>`.

---

## Concept Unit: How Many Records Does a Page Actually Have?

### The Problem

`database_get` (Lesson 16) fetches one row by an index the caller
already has to know. A real table scan needs to know, first, how many
rows actually exist — nothing today answers that; a page's own real
`slot_count` (Lesson 15) is written and read internally by
`insert_record`/`get_record`, but never exposed as its own real,
callable question.

### Introduce the Concept in Isolation

Save this as `record_count_check.cpp` (reusing Lesson 15's own real
`init_record_page`/`insert_record`, copied in for this isolated proof):

```cpp
#include <iostream>
#include <vector>
#include <cstring>
#include <cstdint>

const uint32_t PAGE_SIZE = 4096;

struct Slot
{
    uint32_t offset;
    uint32_t length;
};

void init_record_page(char* page)
{
    uint32_t slot_count = 0;
    uint32_t free_space_offset = sizeof(uint32_t) * 2;
    std::memcpy(page, &slot_count, sizeof(uint32_t));
    std::memcpy(page + sizeof(uint32_t), &free_space_offset, sizeof(uint32_t));
}

uint32_t insert_record(char* page, const std::vector<char>& record)
{
    uint32_t slot_count;
    std::memcpy(&slot_count, page, sizeof(uint32_t));
    uint32_t free_space_offset;
    std::memcpy(&free_space_offset, page + sizeof(uint32_t), sizeof(uint32_t));

    uint32_t slot_directory_start = PAGE_SIZE - (slot_count + 1) * sizeof(Slot);
    std::memcpy(page + free_space_offset, record.data(), record.size());

    Slot slot;
    slot.offset = free_space_offset;
    slot.length = static_cast<uint32_t>(record.size());
    std::memcpy(page + slot_directory_start, &slot, sizeof(Slot));

    uint32_t new_slot_count = slot_count + 1;
    uint32_t new_free_space_offset = free_space_offset + static_cast<uint32_t>(record.size());
    std::memcpy(page, &new_slot_count, sizeof(uint32_t));
    std::memcpy(page + sizeof(uint32_t), &new_free_space_offset, sizeof(uint32_t));

    return slot_count;
}

uint32_t record_count(const char* page)
{
    uint32_t slot_count;
    std::memcpy(&slot_count, page, sizeof(uint32_t));
    return slot_count;
}

int main()
{
    std::vector<char> page(PAGE_SIZE, 0);
    init_record_page(page.data());

    std::cout << "empty page, record_count: " << record_count(page.data()) << std::endl;

    std::vector<char> record = {'h', 'i'};
    insert_record(page.data(), record);
    std::cout << "after 1 insert, record_count: " << record_count(page.data()) << std::endl;

    insert_record(page.data(), record);
    insert_record(page.data(), record);
    std::cout << "after 3 inserts, record_count: " << record_count(page.data()) << std::endl;
}
```

Compiled and run:

```bash
g++ -std=c++17 -Wall -o record_count_check.exe record_count_check.cpp
./record_count_check.exe
```

Real output:

```text
empty page, record_count: 0
after 1 insert, record_count: 1
after 3 inserts, record_count: 3
```

*What this proves:* `record_count` real-tracks the same page correctly
through every stage — freshly initialized, after one insert, after
three — reading nothing but the page's own already-existing
`slot_count` field; no separate, parallel counter needed anywhere.

### Discard the Throwaway Example

```bash
rm record_count_check.cpp record_count_check.exe
```

### Mechanical Walkthrough

- `uint32_t record_count(const char* page)` — covered fully in Objects
  and methods used, above; note the parameter is `const char*`, not
  `char*` — this lesson's own function only ever reads a page, never
  writes one, and the real `const` says so directly.

### CS Lens

Reading a page's own already-maintained `slot_count` instead of
counting real records by scanning the whole page is real, constant-time
`O(1)` work — a small, direct example of the same real principle
Lesson 14's own direct-addressed page offsets already relied on: a
value that's already being kept correct as a side effect of other real
work (`insert_record`/`free_page`) doesn't need to be *recomputed*,
only *read*.

### SE Lens

Why does `record_count` live in `record_page.cpp` rather than as a new
method directly on `PageManager`? Because `PageManager` (Lesson 14)
only ever deals in raw, opaque page bytes — it has no real concept of
"records" or "slots" at all, on purpose (that separation of real
concerns is why `record_page.cpp` exists as its own file rather than
being folded into `PageManager` itself back in Lesson 15). Adding a
records-aware method to `PageManager` would blur a real boundary this
project has kept clean since it was first drawn.

### Commands Needed

Every command was already shown above, alongside its real output.

### Run It

Already shown above, in "Introduce the Concept in Isolation."

### Connection

A page can now honestly answer "how many records do you hold?" Wiring
that, plus a table's own real column names, through `Table`/`Database`
and across the real `extern "C"` boundary is next.

---

## Concept Unit: `database_row_count` / `database_column_names`

### The Problem

`record_count` only works against a raw page buffer, and only from
C++. A real table scan, driven from Python, needs to ask two real
questions about a *table*, by name, across the boundary: how many rows
does it have, and what are its columns actually called?

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `record_page.h`/`.cpp` (modified — `record_count`
  added), `table.h`/`.cpp` (modified — `row_count` added),
  `database_c_api.h`/`.cpp` (modified — `database_row_count`/
  `database_column_names` added).
- **Change type:** Add.
- **Dependencies:** This lesson's own first unit.

### The New Code — `record_page.h`/`.cpp`, One New Function

```cpp
// record_page.h — one new declaration
uint32_t record_count(const char* page);
```

```cpp
// record_page.cpp — one new definition
uint32_t record_count(const char* page)
{
    uint32_t slot_count;
    std::memcpy(&slot_count, page, sizeof(uint32_t));
    return slot_count;
}
```

### The New Code — `table.h`/`.cpp`, One New Method

```cpp
// table.h — one new declaration
uint32_t row_count(PageManager& page_manager) const;
```

```cpp
// table.cpp — one new definition
uint32_t Table::row_count(PageManager& page_manager) const
{
    std::vector<char> page(PAGE_SIZE);
    page_manager.read_page(page_id, page.data());
    return record_count(page.data());
}
```

### The New Code — `database_c_api.h`, Two New Declarations

```cpp
int database_row_count(DatabaseHandle db, const char* table_name);
char* database_column_names(DatabaseHandle db, const char* table_name);
```

### The New Code — `database_c_api.cpp`, Two New Functions

```cpp
int database_row_count(DatabaseHandle db, const char* table_name)
{
    try
    {
        Database* real_db = static_cast<Database*>(db);
        Table& table = real_db->get_table(table_name);
        return static_cast<int>(table.row_count(real_db->page_manager));
    }
    catch (const std::exception&)
    {
        return -1;
    }
}

char* database_column_names(DatabaseHandle db, const char* table_name)
{
    try
    {
        Database* real_db = static_cast<Database*>(db);
        Table& table = real_db->get_table(table_name);

        std::string joined;
        for (size_t i = 0; i < table.schema.columns.size(); ++i)
        {
            if (i > 0)
            {
                joined += ",";
            }
            joined += table.schema.columns[i]->name;
        }

        char* result = new char[joined.size() + 1];
        std::strcpy(result, joined.c_str());
        return result;
    }
    catch (const std::exception&)
    {
        return nullptr;
    }
}
```

Rebuilt into the same real `pocketdb_engine.dll`:

```bash
g++ -std=c++17 -Wall -shared -o pocketdb_engine.dll schema.cpp row.cpp table.cpp database.cpp page_manager.cpp record_page.cpp catalog.cpp database_c_api.cpp page_manager_c_api.cpp record_page_c_api.cpp
```

Proven directly from real, raw `ctypes`:

```python
import ctypes

lib = ctypes.CDLL("./pocketdb_engine.dll")
lib.database_open.argtypes = [ctypes.c_char_p]
lib.database_open.restype = ctypes.c_void_p
lib.database_create_table.argtypes = [
    ctypes.c_void_p, ctypes.c_char_p,
    ctypes.POINTER(ctypes.c_char_p), ctypes.POINTER(ctypes.c_int), ctypes.c_int,
]
lib.database_create_table.restype = ctypes.c_int
lib.database_insert.argtypes = [
    ctypes.c_void_p, ctypes.c_char_p, ctypes.POINTER(ctypes.c_char_p), ctypes.c_int,
]
lib.database_insert.restype = ctypes.c_int
lib.database_row_count.argtypes = [ctypes.c_void_p, ctypes.c_char_p]
lib.database_row_count.restype = ctypes.c_int
lib.database_column_names.argtypes = [ctypes.c_void_p, ctypes.c_char_p]
lib.database_column_names.restype = ctypes.c_void_p
lib.database_free_string.argtypes = [ctypes.c_void_p]

db = lib.database_open(b"rawtest.pdb")
names = (ctypes.c_char_p * 3)(b"id", b"player", b"score")
types = (ctypes.c_int * 3)(0, 1, 0)
lib.database_create_table(db, b"games", names, types, 3)

values = (ctypes.c_char_p * 3)(b"1", b"Alice", b"100")
lib.database_insert(db, b"games", values, 3)

count = lib.database_row_count(db, b"games")
print(f"row_count: {count}")

ptr = lib.database_column_names(db, b"games")
cols = ctypes.string_at(ptr).decode("utf-8")
lib.database_free_string(ptr)
print(f"column_names: {cols}")
```

Real output:

```text
row_count: 1
column_names: id,player,score
```

### Discard the Throwaway Example

```bash
rm verify_row_count.py rawtest.pdb
```

Every real `.h`/`.cpp` change above is kept — permanent project files.

### Mechanical Walkthrough

- `Table& table = real_db->get_table(table_name); return
  static_cast<int>(table.row_count(...));` — reappearing shape
  (`get_table`'s own real exception, Lesson 5; `static_cast`, Lesson 6)
  — an unknown table name real-throws before `row_count` is ever
  called, caught by the same real `try`/`catch` every other function in
  this file already uses.
- `char* database_column_names(...)` — reappearing shape almost
  exactly matching `database_get` (Lesson 16) — a comma-joined string,
  `new`-allocated, freed later by the identical real
  `database_free_string`; the one real difference is joining
  `table.schema.columns[i]->name` (a column's own name) instead of
  `row.values[i]->to_string()` (a row's own value).

### CS Lens

`database_row_count` and `database_column_names` together are the
entire real, minimal *metadata interface* a table scan needs: "how many"
and "what are they called." Every richer read this project ever adds —
`WHERE` filtering (S08), an index-driven lookup (S06) — still answers
those same two real questions somewhere underneath; this lesson builds
the simplest possible real version first.

### SE Lens

Why does `database_column_names` return a comma-joined string —
reusing `database_get`'s own exact real shape — instead of a real
array of strings (mirroring `database_create_table`'s own
`const char**` *input* shape, in reverse)? Because returning an array
across the `extern "C"` boundary means the caller needs to know its
real length separately, and *each* string inside it needs its own real
ownership/freeing story — meaningfully more real ceremony for a small,
one-time-per-table result. The comma-joined convention is already
proven, already understood on the Python side (`.split(",")`), and
genuinely sufficient here — the same real "simplest mechanism that
actually works" judgment Lesson 17 already made for row batches.

### Commands Needed

Every command was already shown above, alongside its real output.

### Run It

Already shown above, in "The New Code."

### Connection

A table can now honestly report its own row count and column names,
across the real boundary. Turning those two real answers into an
actual, usable Python `query()` — the whole point of this lesson — is
last.

---

## Concept Unit: `Record` and `Database.query`

### The Problem

`database_get` returns a plain list of strings — real, but positional
only; reading `row[2]` tells you nothing about *what* `2` means without
separately remembering the table's own column order. A real table scan
should return something that knows its own shape — indexable by
position *or* by the column's own real name — and it should fetch
every row in a table without the caller manually looping over indices
and calling `get` themselves.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `pocketdb.py` (modified — `Record` class added;
  `Database.schema`/`Database.query` added; `database_row_count`/
  `database_column_names` registered).
- **Change type:** Add.
- **Dependencies:** This lesson's own second unit.

### The New Code — `pocketdb.py`

```python
_engine.database_row_count.argtypes = [ctypes.c_void_p, ctypes.c_char_p]
_engine.database_row_count.restype = ctypes.c_int
_engine.database_column_names.argtypes = [ctypes.c_void_p, ctypes.c_char_p]
_engine.database_column_names.restype = ctypes.c_void_p
```

```python
class Record:
    def __init__(self, columns, values):
        self._columns = columns
        self._values = values

    def __getitem__(self, key):
        if isinstance(key, str):
            key = self._columns.index(key)
        return self._values[key]

    def __repr__(self):
        text = "Record("
        for i in range(len(self._columns)):
            if i > 0:
                text += ", "
            text += f"{self._columns[i]}={self._values[i]}"
        return text + ")"
```

```python
    def schema(self, table):
        ptr = _engine.database_column_names(self._handle, table.encode("utf-8"))
        if ptr is None:
            raise PocketDBError(f"No table named '{table}'")

        text = ctypes.string_at(ptr).decode("utf-8")
        _engine.database_free_string(ptr)
        return text.split(",")

    def query(self, table):
        count = _engine.database_row_count(self._handle, table.encode("utf-8"))
        if count < 0:
            raise PocketDBError(f"No table named '{table}'")

        columns = self.schema(table)
        results = []
        for i in range(count):
            results.append(Record(columns, self.get(table, i)))
        return results
```

Proven end to end, through nothing but `pocketdb`'s own real, public
API:

```python
from pocketdb import Database, PocketDBError, INTEGER, TEXT

db = Database("querytest.pdb")
db.create_table("games", id=INTEGER, player=TEXT, score=INTEGER)
db.insert("games", 1, "Alice", 100)
db.insert("games", 2, "Bob", 85)
db.insert("games", 3, "Carol", 92)

results = db.query("games")
print(f"{len(results)} rows")
for r in results:
    print(r)
    print("  by index:", r[0], r[1], r[2])
    print("  by name:", r["player"], r["score"])
db.close()
```

Real output:

```text
3 rows
Record(id=1, player='Alice', score=100)
  by index: 1 'Alice' 100
  by name: 'Alice' 100
Record(id=2, player='Bob', score=85)
  by index: 2 'Bob' 85
  by name: 'Bob' 85
Record(id=3, player='Carol', score=92)
  by index: 3 'Carol' 92
  by name: 'Carol' 92
```

The real edge cases, proven directly:

```python
db.create_table("empty_table", id=INTEGER)
print("empty table query:", db.query("empty_table"))

try:
    db.query("no_such_table")
except PocketDBError as e:
    print("expected error:", e)
db.close()
```

Real output:

```text
empty table query: []
expected error: No table named 'no_such_table'
```

And, once more, the real proof this entire slice has been building
toward — reopened in a completely separate process:

```python
from pocketdb import Database

db = Database("querytest.pdb")
print("reopened query:", db.query("games"))
db.close()
```

Real output:

```text
reopened query: [Record(id=1, player='Alice', score=100), Record(id=2, player='Bob', score=85), Record(id=3, player='Carol', score=92)]
```

### Discard the Throwaway Example

The reopening script above is a real, throwaway verification — delete
it once you've confirmed the output yourself. Every real change to
`pocketdb.py` is kept — permanent project files.

### Mechanical Walkthrough

- `def __getitem__(self, key): if isinstance(key, str): key =
  self._columns.index(key); return self._values[key]` — covered fully
  in Objects and methods used, above; `self._columns.index(key)`
  (reappearing, `list.index`, first real use here) converts a real
  column *name* into its real, matching position, then falls through to
  the identical, ordinary position-based lookup either way.
- `columns = self.schema(table); ... Record(columns, self.get(table,
  i))` — `schema` is fetched exactly *once*, before the loop, not once
  per row — a real, small, deliberate efficiency choice: every row in
  the same table shares the identical real column names, so asking the
  boundary for them `count` separate times would be real, wasted work.
- `results.append(Record(columns, self.get(table, i)))` — reappearing
  shape (`list.append`, `for`/`range`, Lesson 6) — `query`'s own real
  table scan is nothing more than this lesson's own second unit's two
  real answers (`count`, `columns`), plus Lesson 16's own already-real
  `get`, called in a real loop.

### CS Lens

`query`'s own real strategy — read every row, in page order, with no
filtering — is exactly what this lesson's own Terms entry names: a
**table scan**. It's real, correct, and the *only* real strategy this
project has, because nothing yet tells it which rows to skip; `WHERE`
(S08) is the first real slice that gives a scan a reason to stop
looking at every row.

### SE Lens

Why does `Record` support `__getitem__` (`record["score"]` and
`record[2]`) but not attribute access (`record.score`)? Because
`README.md`'s own S05 commits to a real, `sqlite3`-module-shaped
compatibility surface — and Python's own standard-library
`sqlite3.Row` supports exactly this real shape (index *or* key, no dot
access) and nothing more. Matching that real precedent now, rather than
adding a convenience `sqlite3.Row` itself doesn't have, keeps `Record`
a genuine, honest step toward S05's own stated goal instead of a
slightly different, incompatible shape that would need reworking later.

### Commands Needed

Every command was already shown above, alongside its real output.

### Run It

Already shown above — the full query, both edge cases, and the real
reopening proof.

### Connection

S04 is complete: every row in a table can now be read back as a real,
named-and-indexed `Record`, through one real `query()` call, built
entirely on S02's persistence and S03's own real metadata patterns.
S05, next, layers a hand-rolled ORM and a real `sqlite3`-shaped
`connect()`/`.cursor()`/`.execute()`/`.fetchall()` surface directly on
top of `query()`/`insert()` — no new C++ at all, per `README.md`'s own
slice plan — the first slice in this project that's pure Python from
here on, at least for a while.

---

## Closing

### Connect the Pieces

This lesson's first unit exposed a page's own already-maintained
`slot_count` as a real, callable `record_count` — a real, constant-time
question a page could always honestly answer, just never had to before.
The second unit wired that through `Table::row_count` and a matching
`database_column_names` function, giving Python two real, minimal
questions to ask about any table across the boundary: how many rows,
and what are they called. The third unit turned both into `Record` — a
real Python object supporting both `record[0]` and `record["score"]`,
deliberately matching `sqlite3.Row`'s own real shape ahead of S05 — and
`query()`, a real table scan built from nothing but already-proven
pieces: `row_count`, `schema`, and Lesson 16's own `get`, called in a
loop. Proven against a real multi-row table, an empty one, a
nonexistent one, and — the real point — a completely separate process
reopening the database and getting the identical `Record` objects back.

### What Breaks Without This

In `Database.query`, move `columns = self.schema(table)` *inside* the
`for i in range(count):` loop instead of before it, rebuild nothing (a
pure Python change), and rerun the query proof. The real, printed
output is identical — this particular bug doesn't produce a wrong
answer, only a slower one, calling across the real `extern "C"`
boundary once per row instead of once per table. Time a query against
a table with a few thousand rows before and after to see the real,
measurable difference this lesson's own Mechanical Walkthrough already
named. Move it back outside the loop and confirm the real speed
returns.

### Exercises

- `Record.__getitem__` calls `self._columns.index(key)` for a
  name-based lookup — a real, linear search through the column list
  every single time. For a table with many columns, build a real
  `dict` mapping column name to position once, in `Record.__init__`,
  and use it instead. Confirm the real, printed behavior is unchanged.
- Add a real `Record.keys()` method, returning the column names, and a
  real `__iter__` (or reuse `_values` directly) so a `Record` can be
  unpacked like `id, player, score = record`. Explain what real,
  additional dunder method this requires beyond `__getitem__` alone.
- `query`'s own real values are still the raw, comma-split strings
  `database_get` has always produced — including a `TextValue`'s own
  literal embedded quotes (`"'Alice'"`, not `"Alice"`). Investigate
  what a real fix would need to touch, starting from `database_get`
  itself, and explain why fixing it there affects every caller,
  including this lesson's own `query`.

### Definition of Done

- [ ] `record_count`, `Table::row_count`, `database_row_count`, and
      `database_column_names` all exist as real, permanent code.
- [ ] `pocketdb.py`'s `Record` class and `Database.query`/`schema`
      methods exist and work correctly against a real, multi-row table.
- [ ] You ran `query` against an empty table and a nonexistent one, and
      confirmed the real, correct behavior for both.
- [ ] You closed a database after inserting rows, reopened it in a
      *new* process, and confirmed `query` returned the identical real
      `Record` objects.
- [ ] You caused the real "schema fetched once per row instead of once
      per table" slowdown yourself and confirmed moving it back fixes
      it.
- [ ] You can explain, from memory, why `Record` matches
      `sqlite3.Row`'s own real shape instead of adding attribute access
      — referencing this lesson's own SE Lens.
- [ ] Committed with a message stating why: for example,
      `git commit -m "Add table scan: Record and Database.query"`.
