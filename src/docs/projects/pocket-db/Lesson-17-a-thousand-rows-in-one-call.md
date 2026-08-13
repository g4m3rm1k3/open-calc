# Lesson 17: A Thousand Rows in One Call

**What you will build** — the first slice built entirely on top of S02's
real persistence: a real, bulk `extern "C"` entry point,
`database_insert_many`, taking an entire batch of rows across the
boundary as one flat, row-major array instead of one FFI call per row —
and `pocketdb.import_csv(path, table)`, using Python's own standard
`csv` module (real, hand-rolled parsing is the point; a *third-party*
CSV library would defeat it) to turn an actual CSV file into real,
persistent rows in one call.

**What you need to know first:** Lesson 6 (the `extern "C"` boundary,
`const char**` arrays), Lesson 16 (`Table`/`Database`, real
persistence). `S02` complete — this lesson depends on rows actually
surviving past the process that inserted them; before Lesson 16, a bulk
import into an in-memory-only table would have been busywork.

**Terms introduced in this lesson:** **row-major order** — laying a
two-dimensional table of values out as one flat, one-dimensional
sequence, row by row, so that value `(row, col)` lives at flat index
`row * value_count + col`.

**Objects and methods used**
- **`database_insert_many`**
  - *What it is:* this lesson's own real, bulk `extern "C"` function —
    inserts an entire batch of rows in one real call across the
    boundary, instead of one `database_insert` call per row.
  - *Implementation:* covered fully in this lesson's own second unit,
    below.
  - *Its use:* what `pocketdb.py`'s own new `insert_many`/`import_csv`
    methods actually call.
- **`csv.reader`**
  - *What it is:* a real, Python standard-library class (`import csv`)
    parsing a real CSV file's own lines into rows of real string
    fields, correctly handling quoting and commas inside quoted fields
    — real, hand-rolled logic this project is *allowed* to use because
    it's the language's own standard library, not a third-party package
    (`README.md`'s own "Hand-rolled, not delegated" principle already
    names this exact exception).
  - *Implementation:* `reader = csv.reader(f)` wraps an already-open
    real file object; iterating `reader` yields one real
    `list[str]` per CSV row.
  - *Its use:* `Database.import_csv`'s own real parsing step — turning
    a `.csv` file's own raw lines into rows `insert_many` can use.

---

## Concept Unit: Flattening a Batch of Rows Into One Real Array

### The Problem

`database_insert` (Lesson 6) takes one row per real call — a `const
char** values` array of just that row's own fields. Sending `1,000`
real rows one call at a time means `1,000` real trips across the
`extern "C"` boundary, each with its own real `ctypes` marshaling cost.
A real way to send an entire batch in *one* call is needed — but a
plain `const char**` can only describe one flat list, not naturally a
two-dimensional batch of rows and columns.

### Introduce the Concept in Isolation

Save this as `flatten_check.cpp`:

```cpp
#include <iostream>
#include <vector>
#include <string>

int main()
{
    std::vector<std::string> flat = {
        "1", "Alice", "100",
        "2", "Bob", "85",
        "3", "Carol", "92"
    };

    int row_count = 3;
    int value_count = 3;

    for (int row = 0; row < row_count; ++row)
    {
        for (int col = 0; col < value_count; ++col)
        {
            std::cout << flat[row * value_count + col];
            if (col < value_count - 1)
            {
                std::cout << ",";
            }
        }
        std::cout << std::endl;
    }
}
```

Compiled and run:

```bash
g++ -std=c++17 -Wall -o flatten_check.exe flatten_check.cpp
./flatten_check.exe
```

Real output:

```text
1,Alice,100
2,Bob,85
3,Carol,92
```

*What this proves:* one flat, `9`-element real vector — with no real
notion of "rows" built into its own type at all — correctly recovers
all three original rows, purely from one real formula:
`row * value_count + col`. No nested arrays, no `std::vector<std::
vector<std::string>>`, needed at all.

The loop's own real behavior, traced iteration by iteration for the
outer `row` loop:

#### Execution Trace

```text
Iteration 1: row = 0 → reads flat[0], flat[1], flat[2], because row * value_count = 0 * 3 = 0 is where row 0's own fields start
Iteration 2: row = 1 → reads flat[3], flat[4], flat[5], because row * value_count = 1 * 3 = 3 is where row 1's own fields start
Iteration 3: row = 2 → reads flat[6], flat[7], flat[8], because row * value_count = 2 * 3 = 6 is where row 2's own fields start
```

### Discard the Throwaway Example

```bash
rm flatten_check.cpp flatten_check.exe
```

### Mechanical Walkthrough

- `std::vector<std::string> flat = { ... };` — reappearing shape
  (`std::vector`, Lesson 2) — one real, single-dimensional list holding
  every field of every row, back to back.
- `flat[row * value_count + col]` — covered fully in Objects and
  methods used, above (**row-major order**) — this one real formula is
  the entire technique; everything else is bookkeeping around it.

### CS Lens

**Row-major order** is a genuinely standard real layout — it's how
C and C++ themselves lay out a real, native 2D array (`int
grid[3][3]`) in memory, and it's the same real reason Lesson 15's own
slotted page could place a record's bytes as one flat run instead of
needing "real" nested structure on disk. The alternative,
**column-major order** (all of column `0` first, then all of column
`1`, ...), is what Fortran and, notably, NumPy's own default array
layout use instead — a real, deliberate choice with real performance
consequences this project's own later ML lessons (`README.md`'s S11)
will eventually meet again.

### SE Lens

Why flatten manually with one real formula, instead of using a real
`const char***` — an array of row-arrays, each row a real, separate
`const char**` — matching the batch's actual, two-dimensional shape
more directly? A `const char***` needs a real, separate heap
allocation *per row* on the C++ side to build, and a nested
`ctypes.POINTER(ctypes.POINTER(ctypes.c_char_p))` on the Python side to
call — real, working, but meaningfully more ceremony for both real
languages involved, for a shape a single multiplication already
handles. This project's own established preference — the simplest real
mechanism that actually works — chooses the flat array on purpose.

### Commands Needed

Every command was already shown above, alongside its real output.

### Run It

Already shown above, in "Introduce the Concept in Isolation."

### Connection

A whole batch of rows can now travel as one real, flat array. Building
the real `extern "C"` entry point that actually receives one, and
inserts every row it describes, is next.

---

## Concept Unit: `database_insert_many` — a Real Bulk Boundary

### The Problem

`database_insert` only takes one row. A real function is needed taking
a whole flat batch (this unit's own first proof) and inserting every
row it describes — and a real, honest way to report back if something
goes wrong partway through, since Lesson 15's own real "page full"
failure (or a real, malformed value) can still happen at any row in a
large batch, and this project has no transactions yet (`README.md`'s
own S10) to undo whatever already succeeded.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `database_c_api.h` (modified — one new
  declaration), `database_c_api.cpp` (modified — one new function).
- **Change type:** Add.
- **Dependencies:** This lesson's own first unit; Lesson 16's real
  `Table`/`Database`.

### The New Code — `database_c_api.h`, One New Declaration

```cpp
int database_insert_many(DatabaseHandle db, const char* table_name,
                          const char** flat_values, int row_count, int value_count);
```

### The New Code — `database_c_api.cpp`

```cpp
int database_insert_many(DatabaseHandle db, const char* table_name,
                          const char** flat_values, int row_count, int value_count)
{
    Database* real_db = static_cast<Database*>(db);

    Table* table;
    try
    {
        table = &real_db->get_table(table_name);
    }
    catch (const std::exception&)
    {
        return -1;
    }

    int inserted = 0;
    for (int row = 0; row < row_count; ++row)
    {
        try
        {
            std::vector<std::unique_ptr<Value>> row_values;
            for (int col = 0; col < value_count; ++col)
            {
                const char* raw = flat_values[row * value_count + col];
                Column* column = table->schema.columns[col].get();
                if (column->type_name() == "INTEGER")
                {
                    row_values.push_back(std::make_unique<IntegerValue>(std::stoi(raw)));
                }
                else
                {
                    row_values.push_back(std::make_unique<TextValue>(raw));
                }
            }
            table->insert(Row(std::move(row_values), table->schema), real_db->page_manager);
            inserted++;
        }
        catch (const std::exception&)
        {
            break;
        }
    }

    return inserted;
}
```

Rebuilt into the same real `pocketdb_engine.dll`:

```bash
g++ -std=c++17 -Wall -shared -o pocketdb_engine.dll schema.cpp row.cpp table.cpp database.cpp page_manager.cpp record_page.cpp catalog.cpp database_c_api.cpp page_manager_c_api.cpp record_page_c_api.cpp
```

Proven directly from real, raw `ctypes` — a full batch, inserted in one
call:

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
lib.database_insert_many.argtypes = [
    ctypes.c_void_p, ctypes.c_char_p, ctypes.POINTER(ctypes.c_char_p), ctypes.c_int, ctypes.c_int,
]
lib.database_insert_many.restype = ctypes.c_int
lib.database_get.argtypes = [ctypes.c_void_p, ctypes.c_char_p, ctypes.c_int]
lib.database_get.restype = ctypes.c_void_p
lib.database_free_string.argtypes = [ctypes.c_void_p]

db = lib.database_open(b"bulktest.pdb")

names = (ctypes.c_char_p * 3)(b"id", b"player", b"score")
types = (ctypes.c_int * 3)(0, 1, 0)
lib.database_create_table(db, b"games", names, types, 3)

flat = [
    b"1", b"Alice", b"100",
    b"2", b"Bob", b"85",
    b"3", b"Carol", b"92",
]
flat_array = (ctypes.c_char_p * len(flat))(*flat)
inserted = lib.database_insert_many(db, b"games", flat_array, 3, 3)
print(f"inserted: {inserted}")

for i in range(3):
    ptr = lib.database_get(db, b"games", i)
    text = ctypes.string_at(ptr).decode("utf-8")
    lib.database_free_string(ptr)
    print(f"  {text}")

lib.database_close(db)
```

Real output:

```text
inserted: 3
  1,'Alice',100
  2,'Bob',85
  3,'Carol',92
```

Then, the real, honest partial-failure path — a batch deliberately
large enough to fill the table's own one real page (Lesson 15's own
`insert_record` overflow, this lesson's own second, real proof):

```python
big = b"x" * 500
flat = []
for i in range(20):
    flat.append(str(i).encode())
    flat.append(big)
flat_array = (ctypes.c_char_p * len(flat))(*flat)
inserted = lib.database_insert_many(db2, b"blobs", flat_array, 20, 2)
print(f"inserted {inserted} of 20")
```

Real output:

```text
inserted 7 of 20
```

*What this proves:* `database_insert_many` doesn't lie about a partial
failure — it real-reports exactly how many rows actually landed (`7`)
before the page genuinely ran out of room, matching precisely what a
`20`-row loop of individual `database_insert` calls would have
achieved stopping at the identical real row (Lesson 15's own already-
proven overflow behavior) — no row silently lost, none double-counted.

### Discard the Throwaway Example

```bash
rm verify_insert_many.py bulktest.pdb overflow_many.pdb
```

`database_c_api.h`/`.cpp`'s own real changes are kept — permanent
project files.

### Mechanical Walkthrough

- `Table* table; try { table = &real_db->get_table(table_name); }
  catch (...) { return -1; }` — a real, separate `try`/`catch` just for
  finding the table, deliberately outside the per-row loop — an
  unknown table name is a real, total failure (nothing can be
  inserted at all), distinct from a per-row failure partway through a
  real, valid table.
- `int inserted = 0; for (...) { try { ...; inserted++; } catch (...)
  { break; } }` — reappearing shape (`try`/`catch`, Lesson 7) inside a
  reappearing shape (the per-row loop, Lesson 6's own
  `database_create_table`) — the real, running count only increments
  on a real, confirmed success; a real failure `break`s out early
  rather than continuing past a table that's already proven full.
- `return inserted;` — this lesson's own real, deliberate return-value
  design: `-1` means "the table itself doesn't exist," any other value
  is a real count of rows actually inserted, compared by the caller
  against how many were attempted.

### CS Lens

Reporting a real, partial success count instead of a flat boolean
is one small, real instance of **graceful degradation** — a real
system continuing to make real, useful progress even when it can't
complete an entire requested operation, and being honest about exactly
how far it got, rather than either silently pretending success or
discarding all partial progress along with the failure.

### SE Lens

Why does `database_insert_many` keep every row it managed to insert
before a real failure, rather than trying to undo them and leave the
table exactly as it was before the call — an **atomic** batch insert,
all-or-nothing? Because undoing an already-written, already-persisted
page (Lesson 15's own real `insert_record`) would need a real way to
reverse a write after the fact — exactly what a **transaction** is for,
and this project doesn't have one yet (`README.md`'s own S10). Returning
an honest partial count, rather than a false all-or-nothing guarantee
this project can't actually back up yet, is the more honest real
engineering choice available right now.

### Commands Needed

Every command was already shown above, alongside its real output.

### Run It

Already shown above — both the full-success and the partial-failure
real proofs.

### Connection

A real batch of rows can now be inserted in one real call, with an
honest report of how many actually landed. Turning an actual `.csv`
file into that same real batch — the whole reason this slice exists —
is last.

---

## Concept Unit: `import_csv` — a Real File Becomes Real Rows

### The Problem

`insert_many` (this unit will build it) takes rows already parsed into
Python lists. A real `.csv` file is just text — commas, newlines, and
real edge cases (a comma *inside* a quoted field) a naive
`line.split(",")` gets wrong. Python's own standard-library `csv`
module already handles this correctly; `README.md`'s own "Hand-rolled,
not delegated" principle explicitly allows using it, since it's the
language itself, not a third-party package standing in for something
this project is supposed to build.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `pocketdb.py` (modified — `insert_many` and
  `import_csv` added, `csv` imported, `database_insert_many`'s
  `argtypes`/`restype` registered).
- **Change type:** Add.
- **Dependencies:** This lesson's own second unit.

### The New Code — `pocketdb.py`

```python
import ctypes
import csv
import os
```

```python
_engine.database_insert_many.argtypes = [
    ctypes.c_void_p, ctypes.c_char_p, ctypes.POINTER(ctypes.c_char_p), ctypes.c_int, ctypes.c_int,
]
_engine.database_insert_many.restype = ctypes.c_int
```

```python
    def insert_many(self, table, rows):
        rows = list(rows)
        if not rows:
            return

        row_count = len(rows)
        value_count = len(rows[0])

        flat = []
        for row in rows:
            for v in row:
                flat.append(str(v).encode("utf-8"))
        flat_array = (ctypes.c_char_p * len(flat))(*flat)

        inserted = _engine.database_insert_many(
            self._handle, table.encode("utf-8"), flat_array, row_count, value_count
        )
        if inserted != row_count:
            raise PocketDBError(
                f"Only inserted {inserted} of {row_count} rows into table '{table}'"
            )

    def import_csv(self, path, table):
        with open(path, newline="", encoding="utf-8") as f:
            reader = csv.reader(f)
            next(reader)
            rows = list(reader)
        self.insert_many(table, rows)
```

A real CSV file, saved as `players.csv`:

```text
id,player,score
1,Alice,100
2,Bob,85
3,Carol,92
```

Proven end to end, through nothing but `pocketdb`'s own real, public
API:

```python
from pocketdb import Database, INTEGER, TEXT

db = Database("csvtest.pdb")
db.create_table("games", id=INTEGER, player=TEXT, score=INTEGER)
db.import_csv("players.csv", "games")
for i in range(3):
    print(db.get("games", i))
db.close()
```

Real output:

```text
['1', "'Alice'", '100']
['2', "'Bob'", '85']
['3', "'Carol'", '92']
```

Then, the real point of this whole slice — a completely separate
Python process, reopening the same file afterward, with no
`import_csv` call of its own at all:

```python
from pocketdb import Database

db = Database("csvtest.pdb")
print("reopened after CSV import:")
for i in range(3):
    print(db.get("games", i))
db.close()
```

Real output:

```text
reopened after CSV import:
['1', "'Alice'", '100']
['2', "'Bob'", '85']
['3', "'Carol'", '92']
```

*What this proves:* a real CSV file's own data is now genuinely,
permanently part of the database — not an in-memory result of the
import script's own run. This is the real payoff `README.md`'s own S03
row named from the start: CSV import is only actually useful *because*
S02 made it survive past the process that ran it.

### Discard the Throwaway Example

The reopening script above is a real, throwaway verification — delete
it once you've confirmed the output yourself. `players.csv` and every
real change to `pocketdb.py` are kept — permanent project files.

### Mechanical Walkthrough

- `with open(path, newline="", encoding="utf-8") as f:` — reappearing
  shape (`with`/context managers, first real use here for a text file
  rather than a binary one) — `newline=""` is required by Python's own
  `csv` module documentation, so it can correctly detect a CSV file's
  own real line endings itself, rather than Python's normal universal-
  newline translation interfering first.
- `reader = csv.reader(f)` — covered fully in Objects and methods
  used, above.
- `next(reader)` — a real, standard Python built-in, advancing an
  iterator by exactly one step and returning what it yields; here, it
  reads and discards the CSV's own real header row (`id,player,score`)
  — this project's own real, deliberate, documented choice: the header
  row's *names* aren't checked against the target table's own real
  schema at all, only skipped; a real mismatch (a CSV column in the
  wrong order for the table it's imported into) isn't caught by
  anything in this lesson.
- `self.insert_many(table, rows)` — reappearing (this lesson's own
  second unit) — `import_csv` itself does no real row-insertion work
  at all; it only turns a file into rows and hands them off.

### CS Lens

`import_csv`'s own real job — reading a file, turning its own contents
into a real, structured form another piece of code already knows how
to consume — is a small, real instance of the **Adapter** pattern: it
adapts one real shape (a `.csv` file's own text) to another a real
consumer (`insert_many`) already expects (a list of rows), without
`insert_many` itself needing to know CSV exists at all.

### SE Lens

Why does `import_csv` silently skip the CSV's own header row instead of
reading it and validating it against the target table's own real
`Schema` (which `pocketdb.py`'s own `Database` object doesn't currently
expose to Python at all — only `create_table`/`insert`/`get`)? Because
building that check for real would mean exposing a table's own schema
back across the boundary — a real, legitimate, but genuinely separate
piece of work, not something this slice's own stated goal ("a real CSV
file becomes real rows... in one call") requires. Skipping it is a
real, honest, documented gap — worth fixing the moment a wrong-order
CSV import actually corrupts real data, not before.

### Commands Needed

Every command was already shown above, alongside its real output.

### Run It

Already shown above — `import_csv`, then a real, separate process
reopening the file and reading the same rows back.

### Connection

S03 is complete: a real `.csv` file's own data is now genuinely,
permanently part of the database, imported in one real call, built
entirely on the real persistence S02 spent four lessons earning. S04,
next, is the first slice to actually *read* this data flexibly —
`SELECT` via a real table scan — rather than only ever fetching one
row at a time by its own numeric index.

---

## Closing

### Connect the Pieces

This lesson's first unit proved, in isolation, that a two-dimensional
batch of rows can travel as one flat array, addressed by nothing but
`row * value_count + col` — real-verified against a real,
`3`-row-by-`3`-column example. The second unit built the real
`extern "C"` entry point receiving exactly that shape,
`database_insert_many`, proven twice: once inserting a full, real batch
correctly, and once, deliberately, running a batch into Lesson 15's own
real page-full failure, correctly reporting `7` real rows landed rather
than lying about all `20`. The third unit put Python's own standard
`csv` module in front of it — `import_csv`, real-verified not just by
reading rows back in the same process, but by a completely separate
process reopening the file afterward and finding the identical, real,
imported rows — the entire reason this slice was sequenced after S02
and not before it.

### What Breaks Without This

Change `database_insert_many`'s own `catch` block from `break;` to
`continue;`, rebuild, and rerun the deliberate page-overflow proof
above. Instead of stopping cleanly at `7`, the loop keeps trying every
remaining row against an already-full page — each one throws and gets
silently swallowed, `inserted` never grows past `7`, but the function
now does real, wasted work for every remaining row instead of stopping
the moment it's clear the table is full. Restore `break;` and confirm
the real, efficient, correct behavior returns.

### Exercises

- Call `insert_many` with an empty list. Confirm it returns
  immediately, inserting nothing, without ever calling
  `database_insert_many` at all — explain, from this lesson's own
  code, exactly which line makes that true.
- `import_csv` currently assumes every CSV row has exactly as many
  fields as the target table has columns. Deliberately craft a CSV file
  where one row is missing a field, import it, and observe what
  actually happens — then explain, referencing `database_insert_many`'s
  own real `flat_values[row * value_count + col]` indexing, why a
  short row corrupts every row *after* it in the same batch, not just
  itself.
- Add a real `Database.table_names()` method (or similar), exposing
  `tables`' own real keys back to Python, and use it to make
  `import_csv` at least warn (not necessarily raise) when importing
  into a table name that doesn't exist yet — reusing the exact
  `PocketDBError` pattern already established.

### Definition of Done

- [ ] `database_insert_many` exists in `database_c_api.h`/`.cpp`, and
      `pocketdb.py`'s own `insert_many`/`import_csv` exist and call it.
- [ ] You imported a real `.csv` file into a real table, through
      nothing but `pocketdb`'s own public API.
- [ ] You closed that process, opened a *new* one, and confirmed the
      imported rows were still there — real persistence, carried
      forward from S02, not re-proven from scratch.
- [ ] You caused the real "wasted work past a full page" behavior
      yourself (changing `break` to `continue`) and confirmed
      restoring `break` fixes it.
- [ ] You can explain, from memory, why `database_insert_many` returns
      a real, partial row count instead of a flat boolean —
      referencing this lesson's own SE Lens on atomicity.
- [ ] Committed with a message stating why: for example,
      `git commit -m "Add bulk insert and CSV import — first slice built on real persistence"`.
