# Lesson 16: A Table That Remembers Its Own Page

**What you will build** — the real, final piece of S02: `Database` now
owns a real `PageManager` for as long as it's open, and `Table` no
longer holds a `std::vector<Row>` at all — every insert writes into a
real page, every `get` reads from one. A real **catalog**, living in
the database file's own page `0`, records which page belongs to which
table, so reopening a `.pdb` file rebuilds the whole database — table
names, schemas, and all — from nothing but its own real bytes. This is
the lesson where `pocketdb`'s own `close()` and reopening finally mean
something.

**What you need to know first:** Lesson 13 (`DatabaseFileHeader`),
Lesson 14 (`PageManager`, `page_manager.allocate_page/read_page/
write_page`), Lesson 15 (`record_page`'s `encode_row`/`decode_row`/
`init_record_page`/`insert_record`/`get_record`), Lesson 5 (`Table`,
`Database`, `std::map`).

**Terms introduced in this lesson:** **catalog** (sometimes called a
*system table* or *system catalog* in production databases) — a
database's own real, internal record of its own structure: which
tables exist, what their columns are, and where their data actually
lives.

**Objects and methods used**
- **`PageManager::page_count()`**
  - *What it is:* a real, new accessor on `PageManager` (Lesson 14),
    returning how many real pages a `.pdb` file currently has.
  - *Implementation:* `return header.page_count;` — reads the same
    real field `allocate_page` already maintains, just exposed as a
    real, public, read-only method.
  - *Its use:* the real signal `Database`'s own constructor uses to
    tell a brand-new file (`page_count() == 0`) apart from an existing
    one being reopened (`page_count() > 0`).
- **`save_catalog` / `load_catalog`**
  - *What they are:* this lesson's own real functions, converting
    between `Database`'s in-memory `std::map<std::string, Table>` and
    the catalog's own flat, encoded bytes, living in page `0`.
  - *Implementation:* covered fully in this lesson's own third unit,
    below.
  - *Its use:* `save_catalog` runs every time a table is created;
    `load_catalog` runs once, inside `Database`'s own constructor,
    only when reopening an existing file.
- **`Table::insert` / `Table::get` (real, changed shape)**
  - *What they are:* `Table`'s own real methods (first introduced
    Lesson 5), now taking a real `PageManager&` and delegating to
    Lesson 15's own `record_page` functions instead of touching an
    in-memory `std::vector<Row>`, which `Table` no longer has at all.
  - *Implementation:* covered fully in this lesson's own third unit.
  - *Its use:* every real `database_insert`/`database_get` call, now
    genuinely reading and writing a real page instead of an in-memory
    list.

---

## Concept Unit: A Catalog — a Directory of Table Name to Page

### The Problem

`PageManager` (Lesson 14) only knows about numbered pages — it has no
notion of a "table" at all. Something has to remember, in a way that
survives closing and reopening the file, which page ID belongs to
which table name — otherwise, on reopen, there would be no real way to
find `"games"`'s own rows again, even though they're still sitting,
completely intact, on disk.

### Introduce the Concept in Isolation

Save this as `catalog_encode_check.cpp`:

```cpp
#include <iostream>
#include <vector>
#include <string>
#include <cstdint>
#include <cstring>

int main()
{
    std::vector<std::string> names = {"games", "scores"};
    std::vector<uint32_t> page_ids = {1, 2};

    std::vector<char> bytes;

    uint32_t table_count = static_cast<uint32_t>(names.size());
    size_t offset = bytes.size();
    bytes.resize(bytes.size() + sizeof(uint32_t));
    std::memcpy(bytes.data() + offset, &table_count, sizeof(uint32_t));

    for (size_t i = 0; i < names.size(); ++i)
    {
        uint32_t name_length = static_cast<uint32_t>(names[i].size());
        offset = bytes.size();
        bytes.resize(bytes.size() + sizeof(uint32_t));
        std::memcpy(bytes.data() + offset, &name_length, sizeof(uint32_t));

        offset = bytes.size();
        bytes.resize(bytes.size() + name_length);
        std::memcpy(bytes.data() + offset, names[i].data(), name_length);

        offset = bytes.size();
        bytes.resize(bytes.size() + sizeof(uint32_t));
        std::memcpy(bytes.data() + offset, &page_ids[i], sizeof(uint32_t));
    }

    std::cout << "encoded catalog size: " << bytes.size() << std::endl;

    uint32_t pos = 0;
    uint32_t read_count;
    std::memcpy(&read_count, bytes.data() + pos, sizeof(uint32_t));
    pos += sizeof(uint32_t);
    std::cout << "table_count: " << read_count << std::endl;

    for (uint32_t i = 0; i < read_count; ++i)
    {
        uint32_t name_length;
        std::memcpy(&name_length, bytes.data() + pos, sizeof(uint32_t));
        pos += sizeof(uint32_t);

        std::string name(bytes.data() + pos, name_length);
        pos += name_length;

        uint32_t page_id;
        std::memcpy(&page_id, bytes.data() + pos, sizeof(uint32_t));
        pos += sizeof(uint32_t);

        std::cout << "table[" << i << "]: name=" << name << " page_id=" << page_id << std::endl;
    }
}
```

Compiled and run:

```bash
g++ -std=c++17 -Wall -o catalog_encode_check.exe catalog_encode_check.cpp
./catalog_encode_check.exe
```

Real output:

```text
encoded catalog size: 31
table_count: 2
table[0]: name=games page_id=1
table[1]: name=scores page_id=2
```

*What this proves:* the identical self-describing, length-prefixed
technique Lesson 15's own `encode_row`/`decode_row` already proved for
one `Row`'s own values works just as well one level up — for a whole
*directory* of tables. `31` bytes accounts for exactly `4` (table
count) `+ 4 + 5` ("games") `+ 4` (its page ID) `+ 4 + 6` ("scores")
`+ 4` (its page ID).

The encode loop's own real behavior, traced iteration by iteration
against `names`/`page_ids`' actual, real contents:

#### Execution Trace

```text
Iteration 1: i = 0 → appends 13 real bytes (a 4-byte length, 5 name bytes, a 4-byte page ID), because names[0]="games" is 5 characters and page_ids[0]=1
Iteration 2: i = 1 → appends 14 real bytes (a 4-byte length, 6 name bytes, a 4-byte page ID), because names[1]="scores" is 6 characters and page_ids[1]=2
```

`4` (table count) `+ 13` (iteration 1) `+ 14` (iteration 2) `= 31` —
the exact real `encoded catalog size` printed above.

### Discard the Throwaway Example

```bash
rm catalog_encode_check.cpp catalog_encode_check.exe
```

### Mechanical Walkthrough

- `std::vector<std::string> names; std::vector<uint32_t> page_ids;` —
  reappearing shape (`std::vector`, Lesson 2) — two real, parallel
  vectors standing in for what will become `Database`'s own real
  `std::map<std::string, Table>` once this is assembled for real.
- The encode loop and decode loop are the identical real shape as
  Lesson 15's own `encode_row`/`decode_row` — grow-and-`memcpy` to
  write, read-and-advance-`pos` to read back — applied to a table
  *name* and a *page ID* instead of an `IntegerValue`/`TextValue`.

### CS Lens

A **catalog** — real metadata *about* a database's own structure,
stored using the exact same real mechanism (pages, encoding) as the
data it describes — is a genuinely standard real technique: SQLite
keeps its own schema in an ordinary table named `sqlite_master`;
PostgreSQL's `pg_catalog` schema is built from ordinary tables too.
There's nothing structurally special about metadata — it's real data,
stored the same real way, just read by the engine itself instead of by
a user's own query.

### SE Lens

Why does the catalog live in a real, reserved page (`0`) instead of, say,
extending `DatabaseFileHeader` (Lesson 13) itself to hold the table
directory directly? A fixed-size header has a fixed, hardcoded byte
budget — Lesson 13's grew from `16` to `24` bytes, but a real
*database's* own table count and column count aren't knowable ahead of
time the way `page_count`/`free_list_head` are. Reserving page `0` — a
full `4096` real bytes — gives the catalog real room to grow (until it
eventually doesn't, this lesson's own upcoming overflow check) without
the file header itself needing to change shape again for every new
table.

### Commands Needed

Every command was already shown above, alongside its real output.

### Run It

Already shown above, in "Introduce the Concept in Isolation."

### Connection

A directory of `name → page_id` can now round-trip through flat bytes.
Deciding *when* to build a fresh, empty one versus reading an existing
one back — the real difference between a brand-new file and a reopened
one — is next.

---

## Concept Unit: Telling a New File From a Reopened One

### The Problem

`Database`'s own constructor needs to behave two different real ways:
for a brand-new `.pdb` file, it must reserve page `0` for a fresh,
empty catalog; for an existing one, it must read that catalog back and
rebuild every table it describes. Nothing yet tells `Database` which
real situation it's in.

### Introduce the Concept in Isolation

Save this as `page_count_check.cpp`, in `pocketdb/` (needs the real
`PageManager` this project already has from Lesson 14):

```cpp
#include <iostream>
#include "page_manager.h"

int main()
{
    std::remove("pcount.pdb");

    {
        PageManager pm("pcount.pdb");
        std::cout << "fresh file, page_count: " << pm.page_count() << std::endl;
        if (pm.page_count() == 0)
        {
            uint32_t catalog_page = pm.allocate_page();
            std::cout << "allocated catalog page: " << catalog_page << std::endl;
        }
    }

    {
        PageManager pm("pcount.pdb");
        std::cout << "reopened, page_count: " << pm.page_count() << std::endl;
    }
}
```

Compiled and run:

```bash
g++ -std=c++17 -Wall -o page_count_check.exe schema.cpp row.cpp page_manager.cpp page_count_check.cpp
./page_count_check.exe
```

Real output:

```text
fresh file, page_count: 0
allocated catalog page: 0
reopened, page_count: 1
```

*What this proves:* a brand-new file real-reports `page_count: 0`
before anything is allocated; after allocating one real page (getting
back ID `0`, exactly as Lesson 14 already proved), a *second*,
completely separate `PageManager`, opening the identical file, real-
reports `page_count: 1` — the real, on-disk record of "this file
already has a page 0" survived the first `PageManager` going out of
scope and closing its own file handle.

### Discard the Throwaway Example

```bash
rm page_count_check.cpp page_count_check.exe pcount.pdb
```

### Mechanical Walkthrough

- `uint32_t PageManager::page_count() const` — covered fully in
  Objects and methods used, above.
- `{ PageManager pm("pcount.pdb"); ... }` — the braces are a real,
  deliberate scope — when execution reaches the closing `}`, `pm`'s
  own destructor runs, which (via `std::fstream`'s own destructor)
  really closes the file, so the *second* `PageManager` in the next
  block genuinely opens it fresh, not the same still-open handle.

### CS Lens

Real code cleaning itself up automatically when a real object goes out
of scope — `pm`'s own file getting closed with no explicit
`pm.close()` call anywhere — is called **RAII** (Resource Acquisition
Is Initialization): a resource (here, an open file) is tied to an
object's own real lifetime, acquired in its constructor, released in
its destructor, guaranteed by the language itself. This project has
relied on it since Lesson 2's very first `unique_ptr` (a resource being
memory, not a file) without naming it directly until now.

### SE Lens

Why check `page_count() == 0` rather than, say, checking whether the
file existed *before* `PageManager`'s own constructor ran (the real
check `PageManager`'s constructor itself already makes internally,
Lesson 14)? Because that information doesn't escape the constructor —
by the time `Database` gets a real `PageManager` object back, it has no
way to ask "were you just created, or did you already exist?" directly.
`page_count() == 0` is a real, honest proxy for the same fact,
re-derived from state `PageManager` already, correctly, exposes.

### Commands Needed

Every command was already shown above, alongside its real output.

### Run It

Already shown above, in "Introduce the Concept in Isolation."

### Connection

Both real pieces — a catalog that survives round-tripping through
bytes, and a real way to tell a fresh file from a reopened one — are
proven. Assembling them into `Table`, `Database`, and the real
`extern "C"` boundary they already sit behind is the last step.

---

## Concept Unit: `Table` and `Database`, Rewired for Real

### The Problem

`Table` still holds `std::vector<Row> rows;` — real data, gone the
instant the process ends. `Database` still discards the `PageManager`
`database_open` builds (Lesson 14's own documented, deliberate,
temporary gap). Both need to change for real: `Table` delegates every
row to a real page; `Database` owns its `PageManager` for its whole
real lifetime and uses this lesson's own catalog to survive being
closed and reopened.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `page_manager.h`/`.cpp` (modified — `page_count()`
  added), `catalog.h`/`.cpp` (new), `table.h`/`.cpp` (rewritten —
  `rows` removed, `page_id` added, `insert`/`get` delegate to
  `PageManager`/`record_page`), `database.h`/`.cpp` (rewritten — owns a
  real `PageManager`, `create_table` allocates a page and persists the
  catalog), `database_c_api.cpp` (modified — `database_open` keeps its
  `PageManager` instead of discarding it), `pocketdb.py` (modified —
  `Database.__init__` finally takes and passes a real `path`).
- **Change type:** Add (`catalog.*`) and refactor (everything else).
- **Dependencies:** This lesson's own first two units; Lessons 13–15.

### The New Code — `page_manager.h`/`.cpp`, One New Method

```cpp
// page_manager.h — one new declaration
uint32_t page_count() const;
```

```cpp
// page_manager.cpp — one new definition
uint32_t PageManager::page_count() const
{
    return header.page_count;
}
```

### The New Code — `catalog.h`

```cpp
#ifndef CATALOG_H
#define CATALOG_H

#include <map>
#include <string>
#include <cstdint>
#include "page_manager.h"
#include "table.h"

const uint32_t CATALOG_PAGE_ID = 0;

void save_catalog(PageManager& page_manager, const std::map<std::string, Table>& tables);
std::map<std::string, Table> load_catalog(PageManager& page_manager);

#endif
```

### The New Code — `catalog.cpp`

```cpp
#include <cstring>
#include <stdexcept>
#include "catalog.h"

namespace
{
    const uint32_t PAGE_SIZE = 4096;

    void append_uint32(std::vector<char>& bytes, uint32_t value)
    {
        size_t offset = bytes.size();
        bytes.resize(bytes.size() + sizeof(uint32_t));
        std::memcpy(bytes.data() + offset, &value, sizeof(uint32_t));
    }

    void append_string(std::vector<char>& bytes, const std::string& value)
    {
        append_uint32(bytes, static_cast<uint32_t>(value.size()));
        size_t offset = bytes.size();
        bytes.resize(bytes.size() + value.size());
        std::memcpy(bytes.data() + offset, value.data(), value.size());
    }

    uint32_t read_uint32(const char* data, uint32_t& pos)
    {
        uint32_t value;
        std::memcpy(&value, data + pos, sizeof(uint32_t));
        pos += sizeof(uint32_t);
        return value;
    }

    std::string read_string(const char* data, uint32_t& pos)
    {
        uint32_t length = read_uint32(data, pos);
        std::string value(data + pos, length);
        pos += length;
        return value;
    }
}

void save_catalog(PageManager& page_manager, const std::map<std::string, Table>& tables)
{
    std::vector<char> bytes;
    append_uint32(bytes, static_cast<uint32_t>(tables.size()));

    for (const auto& entry : tables)
    {
        append_string(bytes, entry.first);
        append_uint32(bytes, entry.second.page_id);
        append_uint32(bytes, static_cast<uint32_t>(entry.second.schema.columns.size()));

        for (const auto& column : entry.second.schema.columns)
        {
            append_string(bytes, column->name);
            uint32_t type_code = (column->type_name() == "INTEGER") ? 0 : 1;
            append_uint32(bytes, type_code);
        }
    }

    if (bytes.size() > PAGE_SIZE)
    {
        throw std::runtime_error("Catalog page overflow: too many tables/columns to fit in one page");
    }

    std::vector<char> page(PAGE_SIZE, 0);
    std::memcpy(page.data(), bytes.data(), bytes.size());
    page_manager.write_page(CATALOG_PAGE_ID, page.data());
}

std::map<std::string, Table> load_catalog(PageManager& page_manager)
{
    std::vector<char> page(PAGE_SIZE);
    page_manager.read_page(CATALOG_PAGE_ID, page.data());

    std::map<std::string, Table> tables;
    uint32_t pos = 0;
    uint32_t table_count = read_uint32(page.data(), pos);

    for (uint32_t i = 0; i < table_count; ++i)
    {
        std::string name = read_string(page.data(), pos);
        uint32_t page_id = read_uint32(page.data(), pos);
        uint32_t column_count = read_uint32(page.data(), pos);

        Schema schema;
        for (uint32_t c = 0; c < column_count; ++c)
        {
            std::string column_name = read_string(page.data(), pos);
            uint32_t type_code = read_uint32(page.data(), pos);
            if (type_code == 0)
            {
                schema.add_column(std::make_unique<IntegerColumn>(column_name));
            }
            else
            {
                schema.add_column(std::make_unique<TextColumn>(column_name));
            }
        }

        tables.emplace(name, Table(std::move(schema), page_id));
    }

    return tables;
}
```

### The New Code — `table.h`, Rewritten

```cpp
#ifndef TABLE_H
#define TABLE_H

#include <cstdint>
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
};

#endif
```

### The New Code — `table.cpp`, Rewritten

```cpp
#include "table.h"
#include "record_page.h"

namespace
{
    const uint32_t PAGE_SIZE = 4096;
}

Table::Table(Schema schema, uint32_t page_id)
    : schema(std::move(schema)), page_id(page_id)
{
}

void Table::insert(const Row& row, PageManager& page_manager)
{
    std::vector<char> page(PAGE_SIZE);
    page_manager.read_page(page_id, page.data());

    std::vector<char> record = encode_row(row);
    insert_record(page.data(), record);

    page_manager.write_page(page_id, page.data());
}

Row Table::get(int row_index, PageManager& page_manager) const
{
    std::vector<char> page(PAGE_SIZE);
    page_manager.read_page(page_id, page.data());

    std::vector<char> record = get_record(page.data(), static_cast<uint32_t>(row_index));
    return decode_row(record.data(), static_cast<uint32_t>(record.size()));
}
```

### The New Code — `database.h`, Rewritten

```cpp
#ifndef DATABASE_H
#define DATABASE_H

#include <map>
#include <string>
#include "table.h"
#include "page_manager.h"

class Database
{
public:
    PageManager page_manager;
    std::map<std::string, Table> tables;

    explicit Database(PageManager page_manager);

    void create_table(std::string name, Schema schema);
    Table& get_table(const std::string& name);
};

#endif
```

### The New Code — `database.cpp`, Rewritten

```cpp
#include <stdexcept>
#include "database.h"
#include "catalog.h"
#include "record_page.h"

namespace
{
    const uint32_t PAGE_SIZE = 4096;
}

Database::Database(PageManager page_manager) : page_manager(std::move(page_manager))
{
    if (this->page_manager.page_count() == 0)
    {
        this->page_manager.allocate_page();
        save_catalog(this->page_manager, tables);
    }
    else
    {
        tables = load_catalog(this->page_manager);
    }
}

void Database::create_table(std::string name, Schema schema)
{
    uint32_t page_id = page_manager.allocate_page();

    std::vector<char> page(PAGE_SIZE, 0);
    init_record_page(page.data());
    page_manager.write_page(page_id, page.data());

    tables.emplace(std::move(name), Table(std::move(schema), page_id));
    save_catalog(page_manager, tables);
}

Table& Database::get_table(const std::string& name)
{
    auto it = tables.find(name);
    if (it == tables.end())
    {
        throw std::invalid_argument("No table named '" + name + "'");
    }
    return it->second;
}
```

### Updated Project — `database_c_api.cpp`

`database_open` keeps its `PageManager` for real now, instead of
discarding it (Lesson 14's own documented, temporary gap):

```cpp
DatabaseHandle database_open(const char* path)
{
    try
    {
        PageManager pm(path);
        return new Database(std::move(pm));
    }
    catch (const std::exception&)
    {
        return nullptr;
    }
}
```

`database_insert` and `database_get` now pass `real_db->page_manager`
through to `Table`'s own real methods:

```cpp
        table.insert(Row(std::move(row_values), table.schema), real_db->page_manager);
        return 0;
```

```cpp
        Database* real_db = static_cast<Database*>(db);
        Table& table = real_db->get_table(table_name);

        Row row = table.get(row_index, real_db->page_manager);

        std::string joined;
```

Nothing else in `database_c_api.cpp` changes — `database_create_table`
already called `real_db->create_table(...)`, which now, internally,
does real, persistent work it didn't do before.

### Updated Project — `pocketdb.py`

`Database.__init__` finally takes and passes a real path — the gap
Lesson 12 documented and deferred:

```python
_engine.database_open.argtypes = [ctypes.c_char_p]
_engine.database_open.restype = ctypes.c_void_p
```

```python
class Database:
    def __init__(self, path):
        self._handle = _engine.database_open(path.encode("utf-8"))
        if not self._handle:
            raise PocketDBError(f"Failed to open database at '{path}'")
```

`demo.py`'s own one-line call site updates to match:

```python
db = Database("games.pdb")
```

Run for real:

```bash
python demo.py
```

Real output:

```text
All rows:
  ['1', "'Alice'", '100']
  ['2', "'Bob'", '85']
  ['3', "'Carol'", '92']
Expected error for a missing row: No row 99 in table 'games'
Done.
```

The *real* proof — a completely separate Python process, run
afterward, reopening the identical file and reading the same rows back
with no `create_table`/`insert` calls at all:

```python
from pocketdb import Database

db = Database("games.pdb")
print("reopened, all rows:")
for i in range(3):
    print(f"  {db.get('games', i)}")
db.close()
```

Real output:

```text
reopened, all rows:
  ['1', "'Alice'", '100']
  ['2', "'Bob'", '85']
  ['3', "'Carol'", '92']
```

*What this proves:* every real row `demo.py` inserted is still there —
recovered purely from `games.pdb`'s own bytes, by a Python process that
never ran a single `insert` itself. `Database`'s own constructor found
`page_count() > 0`, called `load_catalog`, and correctly rebuilt the
`games` table's real `Schema` and `page_id` from nothing but the
catalog page.

### Discard the Throwaway Example

The reopening script above was a real, throwaway verification —
delete it once you've confirmed the real output yourself. `demo.py`,
`pocketdb.py`, and every `.h`/`.cpp` file this unit touched are kept —
real, permanent project files.

### Mechanical Walkthrough

- `Database(PageManager page_manager) : page_manager(std::move(page_manager))`
  — reappearing shape (`std::move` into a member initializer, Lesson
  4's own `Row`) — `Database` now owns its `PageManager` for its whole
  real lifetime, not a temporary, discarded one.
- `if (this->page_manager.page_count() == 0) { ... } else { ... }` —
  this lesson's own second unit's real branch, now deciding whether to
  reserve a fresh catalog page or load an existing one.
- `Table::insert`/`Table::get` no longer touch `rows` at all — every
  real row lives only on a real page now; `Table` itself holds nothing
  but a `Schema` and a `page_id`.
- `tables.emplace(std::move(name), Table(std::move(schema), page_id));`
  followed immediately by `save_catalog(page_manager, tables);` — every
  real `create_table` call keeps the on-disk catalog in sync with the
  in-memory `tables` map, the identical real "keep it synced after
  every change" discipline `PageManager::write_header` (Lesson 14)
  already established for its own header.
- `_handle = _engine.database_open(path.encode("utf-8"))` — reappearing
  shape (`ctypes.c_char_p`, `.encode("utf-8")`, Lesson 9) — the exact
  real fix Lesson 12 and Lesson 14 both explicitly deferred to this
  lesson.

### CS Lens

`Database`'s own constructor branching on `page_count() == 0` is one
real instance of a pattern with a name: **lazy initialization** done
*conditionally* — the catalog page is only ever created once, the very
first time a file is real, genuinely new; every later open reuses what
already exists rather than recreating it. The same real principle
governs why `PageManager`'s own constructor (Lesson 14) only writes a
fresh header when `file_exists` is false.

### SE Lens

Why does `Table::get` rebuild a `Row` from `decode_row`'s own
placeholder `Schema` (Lesson 15) rather than passing `Table`'s own
*real*, correctly-named `Schema` through? Because `Row`'s own real
values (`row.values`) are all `database_get` actually needs — their
`to_string()` output doesn't depend on column names at all. Threading
`Table`'s real schema through here would cost a real parameter, for a
real benefit nothing downstream currently uses — the same "don't build
for a use that doesn't exist yet" judgment this project's own `README`
already commits to. If a future slice needs column *names* back from a
`get` call, that's the real moment to revisit it, not before.

### Commands Needed

Every command was already shown above, alongside its real output.

### Run It

Already shown above — `demo.py`, then a real, separate reopening
script, both producing the identical, correct, real rows.

### Connection

S02 is complete. A `.pdb` file is now a real, self-describing database
— its own catalog page records every table's name, schema, and page;
every row lives in a real, slotted page; closing and reopening the
file loses nothing. S03, next, is the first slice built entirely *on
top of* this real foundation: importing a real CSV file into real,
persistent rows — the first time this project does something plainly
useful, now that what it stores actually survives.

---

## Closing

### Connect the Pieces

This lesson's first two units proved, in isolation, the two real
mechanisms `Database` needed to become genuinely persistent: a
self-describing catalog encoding a table directory into flat bytes
(proven by a `31`-byte buffer decoding back to two exact table names
and page IDs), and a real way to tell a brand-new file from a reopened
one (`page_count() == 0`, proven by a second `PageManager` correctly
seeing the first one's own committed page count). Assembling both into
`Table` (which no longer holds any row in memory at all) and `Database`
(which now owns a real `PageManager` for its whole life, and persists
its catalog on every `create_table`) finally closed the gap Lesson 12
and Lesson 14 both explicitly, deliberately left open:
`pocketdb.py`'s own `Database` now takes a real path, and a completely
separate Python process, run afterward, reads back the exact rows a
prior process inserted — real, on-disk, whole-database persistence,
not just one isolated page's own.

### What Breaks Without This

Comment out the `save_catalog(page_manager, tables);` call at the end
of `Database::create_table`, rebuild, run `demo.py`, then run the
reopening script afterward. `demo.py` itself still works — the table
and its rows are genuinely still on disk — but the reopening script
fails with `No table named 'games'`: the catalog page (`0`) never
learned that `"games"` exists, even though its real data, on its own
real page, was never touched. Restore the call and confirm the real,
correct reopening output returns.

### Exercises

- Create a table, insert a row, close the database, reopen it, and
  insert a *second* row into the same table. Confirm `get` returns both
  rows correctly — proving `Table::insert`, on a reopened table, finds
  the identical real page (`insert_record`'s own slot-count logic,
  Lesson 15) a fresh process never allocated itself.
- `Database::create_table` currently has no real check preventing two
  tables sharing the same name (`std::map::emplace` on an existing key
  silently does nothing — the second `create_table` call would succeed
  but not actually replace anything). Add a real check, and a real
  thrown exception, for this case — reusing the exact pattern
  `Database::get_table` already established for "no table by that
  name."
- Deliberately create enough tables, with long enough names, to trigger
  this lesson's own real `"Catalog page overflow"` exception. Confirm
  it's caught correctly (surfacing as `PocketDBError` through
  `database_create_table`'s existing `try`/`catch`) rather than
  corrupting the catalog page.

### Definition of Done

- [ ] `catalog.h`/`.cpp` exist as real, permanent files; `table.h`/
      `.cpp` and `database.h`/`.cpp` no longer reference
      `std::vector<Row>` anywhere.
- [ ] `pocketdb.py`'s `Database` takes a real path; `demo.py` runs
      correctly end to end.
- [ ] You ran a real, separate Python process, reopened the same
      `.pdb` file `demo.py` created, and read back the identical real
      rows — with no `create_table`/`insert` calls in that second
      process.
- [ ] You caused the real "catalog never learns about a new table"
      failure yourself (removing `save_catalog`'s call) and confirmed
      restoring it fixes it.
- [ ] You can explain, from memory, why the catalog lives on its own
      reserved page instead of growing `DatabaseFileHeader` itself —
      referencing this lesson's own first unit's SE Lens.
- [ ] Committed with a message stating why: for example,
      `git commit -m "Wire Table/Database to real pages via a catalog — S02 persistence complete"`.
