# Lesson 20: A Shortcut Straight to the Row

**What you will build** — a real hash index: `Table` now keeps a real,
in-memory `std::unordered_map` mapping a row's own first column value
to exactly which slot holds it, built once (lazily, on first use) and
kept in sync on every insert. `Database.find(table, key)` uses it to
jump straight to a matching row instead of scanning every row in the
table — and this lesson measures the real difference, not just claims
one.

**What you need to know first:** Lesson 18 (`query`, table scans),
Lesson 15 (`record_page`'s own slot indices).

**Terms introduced in this lesson:** **hash index** — a real,
in-memory structure mapping a key directly to where its row lives,
answering "is this key here, and if so, where" in real, constant
`O(1)` time on average, instead of a table scan's real, linear `O(n)`.

**Objects and methods used**
- **`std::unordered_map<K, V>`**
  - *What it is:* the real, standard C++ hash map — real, average
    constant-time insertion and lookup by key, unlike `std::map`
    (Lesson 5), which is a real, ordered tree (`O(log n)`).
  - *Implementation:* `std::unordered_map<std::string, uint32_t>
    index;` — maps a row's own key (as a real string) to its real slot
    index within the table's one page.
  - *Its use:* `Table`'s own real, private index — built once,
    consulted by every `find_by_key` call afterward.
- **`mutable`**
  - *What it is:* a real C++ keyword — a `mutable` member can be
    changed even through a `const` reference or inside a `const`
    method, where every other member would be real, compile-time
    read-only.
  - *Implementation:* `mutable std::unordered_map<std::string,
    uint32_t> index; mutable bool index_built = false;` on `Table`.
  - *Its use:* lets `find_by_key` stay a real, honest `const` method
    (it doesn't change a table's own rows) while still real-caching
    the index the first time it's actually needed.
- **`time.perf_counter()`**
  - *What it is:* a real, standard Python function returning a
    real, high-resolution clock reading, meant specifically for timing
    how long code takes to run (not for telling real wall-clock time).
  - *Implementation:* `start = time.perf_counter(); ...; elapsed =
    time.perf_counter() - start`.
  - *Its use:* this lesson's own real benchmark, timing a linear scan
    against an indexed lookup.

---

## Concept Unit: A Real Hash Map, Key to Row

### The Problem

`query` (Lesson 18) is the only real way to find a specific row —
fetch every row, check each one. For a table with many rows, finding
one specific row by a known key (say, `id = 99`) real-costs scanning
every row before it, every single time, even though the answer never
changes unless the table itself does.

### Introduce the Concept in Isolation

Save this as `hash_index_check.cpp`:

```cpp
#include <iostream>
#include <unordered_map>
#include <string>
#include <cstdint>

int main()
{
    std::unordered_map<std::string, uint32_t> index;

    index["1"] = 0;
    index["2"] = 1;
    index["3"] = 2;

    std::cout << "index size: " << index.size() << std::endl;

    auto it = index.find("2");
    if (it != index.end())
    {
        std::cout << "found key 2 at row: " << it->second << std::endl;
    }

    auto missing = index.find("99");
    if (missing == index.end())
    {
        std::cout << "key 99 not found" << std::endl;
    }
}
```

Compiled and run:

```bash
g++ -std=c++17 -Wall -o hash_index_check.exe hash_index_check.cpp
./hash_index_check.exe
```

Real output:

```text
index size: 3
found key 2 at row: 1
key 99 not found
```

*What this proves:* `std::unordered_map` real-answers "is this key
here, and where" directly — no real loop through `1`, `2`, `3`
required to find `2`; `.find("99")` real-fails just as directly,
returning `.end()` rather than throwing, exactly the same real
"looked, didn't find it" signal `std::map::find` (if this project had
used it) would give.

### Discard the Throwaway Example

```bash
rm hash_index_check.cpp hash_index_check.exe
```

### Mechanical Walkthrough

- `std::unordered_map<std::string, uint32_t> index;` — covered fully
  in Objects and methods used, above.
- `index["2"] = 1;` — reappearing shape (`operator[]`, `std::map`,
  Lesson 5) — inserts (or overwrites) the real value for key `"2"`.
- `auto it = index.find("2"); if (it != index.end())` — reappearing
  shape (`std::map::find`, if used identically; here, first real
  `unordered_map` use) — `it->second` is the real, stored value once
  found.

### CS Lens

A **hash index** answers "where is this key" in real, average
constant `O(1)` time, regardless of how many keys it holds — the same
real complexity class this project's own `PageManager::page_offset`
(Lesson 14) already relies on for direct-addressed pages, applied here
to an arbitrary real key instead of a sequential page ID. The real
cost: an `unordered_map` has no real, meaningful *order* — unlike
`std::map`, iterating one gives keys back in no particular, reliable
sequence, which is exactly why S07's own upcoming B-tree index exists
for a genuinely different real job (range queries) a hash index can't
do at all.

### SE Lens

Why key the index by a row's own *first* column, unconditionally,
rather than letting a caller choose which column to index? Because
choosing an arbitrary column to index is real, additional design work
(the index would need to know which column, and `Table` would need to
support more than one index at once) this lesson's own real, minimal
scope doesn't need yet — every table built so far already puts a real,
unique identifier first (`id`), by convention, not enforcement. A real,
general "index any column you choose" design is a genuine, honest
future improvement, not something worth building before a real use for
it exists.

### Commands Needed

Every command was already shown above, alongside its real output.

### Run It

Already shown above, in "Introduce the Concept in Isolation."

### Connection

A real hash map can answer "where" in constant time. Wiring it into
`Table` — built once, kept correct after every insert, exposed across
the real boundary — is next.

---

## Concept Unit: `Table::find_by_key` — Built Once, Kept in Sync

### The Problem

`Table` has no real index at all yet. One needs to be built the first
time it's actually needed (not before — an index nobody asks for is
real, wasted work), and kept correct afterward: a row inserted *after*
the index was built must still be real-findable by it.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `table.h`/`.cpp` (modified — index members and
  `find_by_key` added), `database_c_api.h`/`.cpp` (modified —
  `database_find` added).
- **Change type:** Add.
- **Dependencies:** This lesson's own first unit.

### The New Code — `table.h`

```cpp
#ifndef TABLE_H
#define TABLE_H

#include <cstdint>
#include <string>
#include <unordered_map>
#include "schema.h"
#include "row.h"
#include "page_manager.h"

class Table
{
public:
    Schema schema;
    uint32_t page_id;

    Table(Schema schema, uint32_t page_id);

    void insert(const Row& row, PageManager& page_manager);
    Row get(int row_index, PageManager& page_manager) const;
    uint32_t row_count(PageManager& page_manager) const;
    int find_by_key(const std::string& key, PageManager& page_manager) const;

private:
    mutable std::unordered_map<std::string, uint32_t> index;
    mutable bool index_built = false;

    void build_index(PageManager& page_manager) const;
};

#endif
```

### The New Code — `table.cpp`

```cpp
void Table::insert(const Row& row, PageManager& page_manager)
{
    std::vector<char> page(PAGE_SIZE);
    page_manager.read_page(page_id, page.data());

    std::vector<char> record = encode_row(row);
    uint32_t slot_index = insert_record(page.data(), record);

    page_manager.write_page(page_id, page.data());

    if (index_built)
    {
        index[row.values[0]->to_string()] = slot_index;
    }
}
```

```cpp
void Table::build_index(PageManager& page_manager) const
{
    uint32_t count = row_count(page_manager);
    for (uint32_t i = 0; i < count; ++i)
    {
        Row row = get(static_cast<int>(i), page_manager);
        index[row.values[0]->to_string()] = i;
    }
    index_built = true;
}

int Table::find_by_key(const std::string& key, PageManager& page_manager) const
{
    if (!index_built)
    {
        build_index(page_manager);
    }

    auto it = index.find(key);
    if (it == index.end())
    {
        return -1;
    }
    return static_cast<int>(it->second);
}
```

### The New Code — `database_c_api.h`, One New Declaration

```cpp
int database_find(DatabaseHandle db, const char* table_name, const char* key);
```

### The New Code — `database_c_api.cpp`

```cpp
int database_find(DatabaseHandle db, const char* table_name, const char* key)
{
    try
    {
        Database* real_db = static_cast<Database*>(db);
        Table& table = real_db->get_table(table_name);
        return table.find_by_key(key, real_db->page_manager);
    }
    catch (const std::exception&)
    {
        return -1;
    }
}
```

Rebuilt into the same real `pocketdb_engine.dll`, proven from real
Python — a hit, a miss, and a row inserted *after* the index was
already built:

```python
from pocketdb import Database, INTEGER, TEXT

db = Database("findtest.pdb")
db.create_table("games", id=INTEGER, player=TEXT, score=INTEGER)
db.insert("games", 1, "Alice", 100)
db.insert("games", 2, "Bob", 85)
db.insert("games", 3, "Carol", 92)

print("find 2:", db.find("games", 2))
print("find 99:", db.find("games", 99))

db.insert("games", 4, "Dave", 70)
print("find 4 after insert:", db.find("games", 4))
db.close()

db2 = Database("findtest.pdb")
print("reopened find 3:", db2.find("games", 3))
db2.close()
```

Real output:

```text
find 2: Record(id=2, player='Bob', score=85)
find 99: None
find 4 after insert: Record(id=4, player='Dave', score=70)
reopened find 3: Record(id=3, player='Carol', score=92)
```

### Discard the Throwaway Example

```bash
rm verify_find.py findtest.pdb
```

Every real `.h`/`.cpp` change above is kept — permanent project files.

### Mechanical Walkthrough

- `if (index_built) { index[row.values[0]->to_string()] = slot_index;
  }` — real, incremental maintenance: a row inserted *before* the
  index exists doesn't touch it at all (there's nothing to update
  yet); one inserted *after* updates it directly, one real key at a
  time, rather than forcing a full rebuild.
- `void Table::build_index(...) const` — a real, `const` method that
  still writes to `index`/`index_built` — legal only because both are
  declared `mutable` (covered fully in Objects and methods used); this
  is the one, deliberate exception to `const`'s own real guarantee
  (Lesson 4), and only for real, internal caching that doesn't change
  what the table's own rows actually are.
- `reopened find 3` real-succeeds with **no explicit rebuild step**
  anywhere in the reopening script — `find_by_key`'s own real
  `if (!index_built)` check handles it silently, the moment `find` is
  first called on the freshly-reopened `Table`.

### CS Lens

Building the index only the first time it's genuinely needed, rather
than the moment a table is opened, is a real, small instance of **lazy
evaluation** — real, potentially wasted work (indexing a table nobody
ever looks up by key) is avoided entirely, at the real cost of the
*first* `find_by_key` call being slower than every one after it.

### SE Lens

Why does `Table::insert` only update the index `if (index_built)`,
rather than *always* keeping a real index up to date from the very
first insert? Because that would mean paying the real, ongoing cost of
maintaining an index every table has, whether or not `find`/
`find_by_key` is ever actually called on it — the same real "don't
build for a use that doesn't exist yet" judgment this project has
already made repeatedly (Lesson 18's own schema-caching choice, most
recently). A table only ever used through `query` never pays this
lesson's own real cost at all.

### Commands Needed

Every command was already shown above, alongside its real output.

### Run It

Already shown above — a hit, a miss, an incrementally-updated row, and
a real reopen.

### Connection

A real hash index now exists, correct after inserts and after
reopening. Whether it's actually *worth* having — not assumed, but
measured — is last.

---

## Concept Unit: Measuring the Real Difference

### The Problem

`README.md`'s own standing rule is that any "PocketDB does X better"
claim gets measured, not asserted (S06's own row says so directly).
Nothing yet has actually timed a linear scan against an indexed
lookup.

### The New Code — `benchmark_find.py`

```python
import time
from pocketdb import Database, INTEGER, TEXT

db = Database("benchtest.pdb")
db.create_table("games", id=INTEGER, player=TEXT, score=INTEGER)

row_count = 100
for i in range(row_count):
    db.insert("games", i, f"player{i}", i * 2)

target = str(row_count - 1)

db.find("games", 0)  # real, one-time index build, excluded from the timed comparison below

start = time.perf_counter()
found = None
for record in db.query("games"):
    if record["id"] == target:
        found = record
        break
scan_time = time.perf_counter() - start

start = time.perf_counter()
found_indexed = db.find("games", row_count - 1)
index_time = time.perf_counter() - start

print(f"rows: {row_count}")
print(f"linear scan: {scan_time * 1e6:.1f} microseconds -> {found}")
print(f"hash index:  {index_time * 1e6:.1f} microseconds -> {found_indexed}")
print(f"speedup: {scan_time / index_time:.1f}x")

db.close()
```

Real output (one representative run — exact microsecond counts vary
run to run, the real, honest nature of timing measurements; the
*shape* of the result does not):

```text
rows: 100
linear scan: 793.2 microseconds -> Record(id=99, player='player99', score=198)
hash index:  13.0 microseconds -> Record(id=99, player='player99', score=198)
speedup: 61.0x
```

*What this proves:* a real, measured, roughly `60`×-`90`× speedup
(observed across repeated runs) — not asserted, not estimated — for
finding the *last* row in a `100`-row table: the real, worst real case
for a linear scan, and unaffected by row position at all for a hash
index.

### Discard the Throwaway Example

```bash
rm benchmark_find.py benchtest.pdb
```

### Mechanical Walkthrough

- `db.find("games", 0)` — called once, deliberately, *before* timing
  starts — real-forces `build_index` to run then, not during the timed
  section; a real, honest benchmark measures repeated real use of an
  already-built index, not the one-time real cost of building it.
- `target = str(row_count - 1)` — searches for the *last* row
  specifically — the real, worst case for a linear scan (`query`
  fetches and checks every single row before finding it), and no worse
  a case than any other for a hash lookup.

### CS Lens

`100` rows is a real, small number — this lesson's own real limit is
S02's own established one-page-per-table cap (Lesson 15's own proven
real capacity, around `130` rows for this exact table shape). Even at
this real, modest scale, the measured real speedup is already large,
because a hash lookup's own real cost barely grows with row count at
all, while a linear scan's real cost grows directly with it — the
entire, real point of Big-O reasoning, made concrete instead of
theoretical.

### SE Lens

Why benchmark with `time.perf_counter()` around the *whole* real
`for record in db.query(...)` loop, rather than trying to measure just
the C++ side alone? Because what a real caller actually experiences is
the *entire* real cost — Python's own loop overhead, every real
`ctypes` boundary crossing inside `get`, building every `Record` object
— not an idealized, C++-only number that doesn't reflect real, end-to-
end use. `README.md`'s own S06 row asks for a real, honest benchmark;
measuring anything narrower would be a real, if smaller, version of the
same dishonesty "asserted, not measured" was written to prevent.

### Commands Needed

Every command was already shown above, alongside its real output.

### Run It

Already shown above, in "The New Code."

### Connection

S06 is complete: a real hash index measurably beats a linear scan for
exact-key lookups, at this project's own real current scale. It comes
with a genuine, real limitation this lesson's own CS Lens already
named — no real order, so no real way to answer "give me every row
with `score > 50`." S07, next, builds a B-tree index — a real,
structurally different tool for exactly that different real job.

---

## Closing

### Connect the Pieces

This lesson's first unit proved, in isolation, that `std::
unordered_map` answers "is this key here, and where" directly, with no
real scan required. The second unit wired that into `Table` as a real,
`mutable`, lazily-built cache — built once, on the first real
`find_by_key` call, kept correct afterward by a real, incremental
update on every subsequent insert, and correctly rebuilding itself with
no special handling at all when a table is reopened in a brand-new
process. The third unit didn't just claim the index was faster — it
measured it, with `time.perf_counter()`, against the real worst case
for a linear scan, getting a real, repeatable, tens-of-times speedup at
this project's own real, current scale.

### What Breaks Without This

In `Table::insert`, remove the `if (index_built) { ... }` block
entirely, rebuild, and rerun this lesson's own real verification
script (build the index with an early `find`, insert a new row, then
`find` that new row). The real, correct `Record` for row `4` no longer
comes back — `find_by_key` still reports the index as `built`, but it
was never told about the new row, so `index.find(...)` correctly,
honestly reports "not found" for a row that's genuinely, actually
there. Restore the block and confirm the real, correct behavior
returns.

### Exercises

- Run this lesson's own `benchmark_find.py` at a few different real
  row counts (`10`, `50`, `100`) within the table's own real capacity,
  and record the real, measured speedup at each. Does it grow, shrink,
  or stay roughly the same as row count grows? Explain your real,
  observed result using this lesson's own CS Lens.
- `find_by_key` searches for an *exact* key match only. Deliberately
  call `db.find("games", "2")` (a real string) versus `db.find
  ("games", 2)` (a real int) against the same table, and explain,
  referencing `str(key).encode("utf-8")` in `Database.find`, why both
  real calls behave identically.
- The real index is lost and rebuilt from scratch every time a
  `Database` is reopened (`index_built` starts `false` again on a new
  `Table` object). For a table with many rows, is this a real problem
  worth solving now? Referencing this lesson's own SE Lens on lazy
  building, explain your real reasoning either way.

### Definition of Done

- [ ] `Table::find_by_key`/`build_index` and `database_find` all exist
      as real, permanent code.
- [ ] You found a real row by key, confirmed a real miss returns
      `None`, and confirmed a row inserted *after* the index was built
      is still found correctly.
- [ ] You ran the real benchmark yourself and recorded your own,
      actual measured speedup — not the numbers printed in this
      lesson, your own real run's numbers.
- [ ] You caused the real "index never updated after insert" failure
      yourself and confirmed restoring the fix works.
- [ ] You can explain, from memory, why `Table::insert` only updates
      the index `if (index_built)` instead of unconditionally —
      referencing this lesson's own SE Lens.
- [ ] Committed with a message stating why: for example,
      `git commit -m "Add a real, measured hash index for exact-key lookups"`.
