# Lesson 5: A Database That Doesn't Exist Until You Ask for a Table

**What you will build**
`Table` — a `Schema` plus a real, growable list of `Row`s — and
`Database`, a real collection of named `Table`s, built at runtime one
`CREATE TABLE` at a time, with no fixed set of tables baked in at
compile time. Asking for a table that was never created fails loudly,
with a real, specific error — reusing Lesson 4's own exception pattern,
not a new one. This completes the in-memory "`Table` / `Schema` / `Row`"
trio `README.md`'s own architecture diagram has pointed to since before
any of it existed.

**What you need to know first:** Lesson 2 — `Schema`, `Column`,
`std::unique_ptr`. Lesson 4 — `Row`, `Value`, `throw`/`try`/`catch`,
`std::invalid_argument`.

**Terms introduced in this lesson:** None — this lesson's new material
is entirely real classes and a real standard-library container, covered
fully in Objects and methods used below; no new language keyword or
concept needs its own glossary entry.

**Objects and methods used**
- **`std::map<K, V>`**
  - *What it is:* the C++ standard library's real associative
    container — stores real key-value pairs, and keeps them internally
    ordered by key (unlike `std::vector`, which is ordered by insertion
    position, not by any property of the values themselves).
  - *Implementation:* `std::map<std::string, Table> tables;` starts
    empty. `.emplace(key, value)` constructs a new entry in place,
    directly inside the map's own storage. `.find(key)` searches for a
    real entry and returns an **iterator** — a real object pointing at
    that entry if found, or a special sentinel iterator, `.end()`, if
    not. An iterator `it` from a `std::map` has two real members:
    `it->first` (the key) and `it->second` (a real reference to the
    stored value) — `it == container.end()` is the real, standard way
    to check whether a search actually found anything.
  - *Its use:* `Database::tables`, this lesson's own real storage —
    mapping every real table name to its real `Table`.
- **`Table`**
  - *What it is:* this lesson's own real subject — a `Schema` plus a
    real, growable list of `Row`s that actually belong to it.
  - *Implementation:* holds a `Schema` and a `std::vector<Row>`; a real
    `insert(Row)` method appends a new row.
  - *Its use:* what `Database::create_table` actually builds, and what
    every real `INSERT` (a future lesson) will add rows to.
- **`Database`**
  - *What it is:* this lesson's own real subject — a real, named
    collection of `Table`s, built entirely at runtime.
  - *Implementation:* holds a `std::map<std::string, Table>`;
    `create_table(name, schema)` adds a new one, `get_table(name)`
    looks one up, throwing a real `std::invalid_argument` — reappearing
    exactly, per the Repetition Rule (Lesson 4 already gave this
    exception type full treatment) — if the name was never created.
  - *Its use:* the real, single owner of every table this project's
    engine knows about — exactly what `database_create_table` and
    `database_insert` (the `extern "C"` API, next lesson) will call
    into.

---

## Concept Unit: `Table` — a Schema That Actually Owns Some Rows

### The Problem

`Schema` (Lesson 2) describes a table's shape. `Row` (Lesson 4) holds
one real record matching that shape. Nothing yet *owns* a real,
growable collection of them together — a `Schema` next to a completely
separate pile of `Row`s, with nothing tying the two into one real
object, is not yet a table.

### Project Change

- **Reference Source:** No reference counterpart — a from-scratch
  addition, combining Lesson 2's `Schema` and Lesson 4's `Row`.
- **Files affected:** `table.h` (new), `table.cpp` (new).
- **Change type:** Add.
- **Dependencies:** `schema.h` (Lesson 3), `row.h` (Lesson 4).

### The New Code — `table.h`

In `pocketdb/`, save the following as `table.h`:

```cpp
#ifndef TABLE_H
#define TABLE_H

#include <vector>
#include "schema.h"
#include "row.h"

class Table
{
public:
    Schema schema;
    std::vector<Row> rows;

    explicit Table(Schema schema) : schema(std::move(schema)) {}

    void insert(Row row);
};

#endif
```

### The New Code — `table.cpp`

Save this as `table.cpp`:

```cpp
#include "table.h"

void Table::insert(Row row)
{
    rows.push_back(std::move(row));
}
```

### Introduce the Concept in Isolation

`Table` combines two already-proven pieces — `Schema` and
`std::vector<Row>`'s own `push_back` — in a genuinely new *shape*, so
this real usage, run for real, is the proof, rather than a separate
throwaway file: no new mechanism is being isolated that Lesson 2's
`Schema::add_column` and Lesson 4's `Row` haven't already each proven on
their own. Save this as `table_check.cpp`, in the same folder:

```cpp
#include <iostream>
#include "table.h"
#include "value.h"

int main()
{
    Schema schema;
    schema.add_column(std::make_unique<IntegerColumn>("id"));
    schema.add_column(std::make_unique<TextColumn>("player"));

    Table games(std::move(schema));

    std::vector<std::unique_ptr<Value>> values;
    values.push_back(std::make_unique<IntegerValue>(1));
    values.push_back(std::make_unique<TextValue>("Alice"));

    games.insert(Row(std::move(values), games.schema));

    std::cout << "Row count: " << games.rows.size() << std::endl;
    for (const auto& row : games.rows)
    {
        std::cout << row.values[0]->to_string() << " "
                   << row.values[1]->to_string() << std::endl;
    }
}
```

Compiled and run:

```bash
g++ -std=c++17 -Wall -c table.cpp -o table.o
g++ -std=c++17 -Wall -c schema.cpp -o schema.o
g++ -std=c++17 -Wall -c row.cpp -o row.o
g++ -std=c++17 -Wall -c table_check.cpp -o table_check.o
g++ table.o schema.o row.o table_check.o -o table_check.exe
./table_check.exe
```

Real output:

```text
Row count: 1
1 'Alice'
```

The `for` loop's own real behavior — only one real iteration, since
exactly one row was inserted:

#### Execution Trace

```text
Iteration 1: row = games.rows[0] → prints "1 'Alice'", because
             row.values[0] is the IntegerValue(1) inserted and
             row.values[1] is the TextValue("Alice") inserted — the
             loop then ends, because games.rows has no second element
```

*What this proves:* `games.insert(...)` genuinely grew `games.rows`
from empty to one real element, and that real `Row`'s own values —
proven, not asserted, by printing them back — match exactly what was
inserted. This is called **object composition**: `Table` doesn't
inherit from `Schema` or `Row` (there's no "is-a" relationship here);
it simply *owns* one real `Schema` and a real list of `Row`s as its own
members.

### Discard the Throwaway Example

`table_check.cpp`/`.o`/`.exe` are deleted — they exist only to prove
`Table::insert` grows `rows` correctly:

```bash
rm table_check.cpp table_check.o table_check.exe
```

`table.h` and `table.cpp` are kept — real, permanent project files.

### Mechanical Walkthrough

- `Schema schema;` / `std::vector<Row> rows;` — `Table`'s own two real
  members; `Schema`, reappearing exactly (Lesson 2), `std::vector<Row>`,
  reappearing exactly (Lesson 2's own `std::vector<std::unique_ptr<Column>>`,
  the identical container, just holding a different element type).
- `explicit Table(Schema schema) : schema(std::move(schema)) {}` —
  reappearing shape (Lesson 2's own `Column(std::string name)`
  constructor pattern) — takes ownership of a `Schema` by value, moving
  it into the member.
- `void insert(Row row);` (declaration, in `table.h`) — reappearing
  shape (Lesson 3's declaration/definition split).
- `void Table::insert(Row row) { rows.push_back(std::move(row)); }` (in
  `table.cpp`) — `rows.push_back(std::move(row))` reappearing exactly
  (Lesson 2's `Schema::add_column`'s own identical
  `push_back(std::move(...))` pattern), just appending a `Row` instead
  of a `std::unique_ptr<Column>`.

### CS Lens

This is **object composition** ("has-a"), the direct alternative to
**inheritance** ("is-a") — `Table` *has a* `Schema` and *has* some
`Row`s, rather than *being* either one. Also recognized in: a car class
that has an `Engine` rather than being one, a `Doorbell` that has a
`Chime` callback (a different repo's own pocket-inventory-wpf), and any
UI component that holds child components as members rather than
extending a "container" base class for every possible child shape.

### SE Lens

Why does `Table` hold `std::vector<Row>` directly, as a plain member,
rather than something more elaborate — a separate `RowStore` class, say?
Because nothing about this project yet needs more than "a real, ordered,
growable list of rows" — Lesson 6's `Database` needs to look up a
*table* by name, not an individual *row*, so `Table` itself has no
current reason to index or search its own `rows` any more cleverly than
a plain `std::vector` already does. Adding structure before a real,
felt need for it (a `RowStore` class with no actual extra
responsibility yet) would be speculative complexity, not preparation —
the same judgment this project's own `README.md` already commits to for
every slice.

### Commands Needed

Every command was already shown above, alongside its real output.

### Run It

Already shown above, in "Introduce the Concept in Isolation."

### Connection

A single `Table` can now hold real rows. A real database needs more
than one table, each reachable by the real name it was created with —
`Database` is next.

---

## Concept Unit: `Database` — Looking Up a Table That Might Not Exist

### The Problem

`CREATE TABLE games (...)` and `CREATE TABLE machine_data (...)` need
to add two real, independently-named tables to the same running engine,
at runtime, with no fixed set of table names known in advance. Later,
something needs to look one back up *by that real name* — and a lookup
for a name nobody ever created needs to fail safely, not silently
return nothing useful or crash.

### Introduce the Concept in Isolation

A small, throwaway proof of `std::map`'s own real mechanics — nothing
about `Table` yet. Save this as `map_check.cpp`, in `pocketdb/`:

```cpp
#include <iostream>
#include <map>
#include <string>

int main()
{
    std::map<std::string, int> ages;
    ages.emplace("Alice", 30);
    ages.emplace("Bob", 25);

    auto it = ages.find("Alice");
    if (it != ages.end())
    {
        std::cout << it->first << " is " << it->second << std::endl;
    }

    auto missing = ages.find("Charlie");
    if (missing == ages.end())
    {
        std::cout << "Charlie not found" << std::endl;
    }
}
```

Compiled and run:

```bash
g++ -std=c++17 -Wall -o map_check.exe map_check.cpp
./map_check.exe
```

Real output:

```text
Alice is 30
Charlie not found
```

*What this proves:* `ages.find("Alice")` returned a real iterator whose
`->first`/`->second` gave back the exact real key and value stored —
and `ages.find("Charlie")`, a name never `emplace`d, returned the real
sentinel `ages.end()` instead of crashing or returning a made-up value.
This is called an **associative container** — a real, direct
key-to-value lookup, decided at runtime by whatever keys actually exist.

### Discard the Throwaway Example

`map_check.cpp`/`.exe` are deleted — they exist only to prove
`std::map`'s own real lookup behavior before `Database` depends on it:

```bash
rm map_check.cpp map_check.exe
```

### Project Change

- **Reference Source:** No reference counterpart — a from-scratch
  addition.
- **Files affected:** `database.h` (new), `database.cpp` (new).
- **Change type:** Add.
- **Dependencies:** `table.h` (this lesson's first unit), `std::map`
  (this unit's own isolated proof).

### The New Code — `database.h`

Save this as `database.h`:

```cpp
#ifndef DATABASE_H
#define DATABASE_H

#include <map>
#include <string>
#include "table.h"

class Database
{
public:
    std::map<std::string, Table> tables;

    void create_table(std::string name, Schema schema);
    Table& get_table(const std::string& name);
};

#endif
```

### The New Code — `database.cpp`

Save this as `database.cpp`:

```cpp
#include <stdexcept>
#include "database.h"

void Database::create_table(std::string name, Schema schema)
{
    tables.emplace(std::move(name), Table(std::move(schema)));
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

Proven for real — a complete round trip, plus the real failure. Save
this as `database_check.cpp`:

```cpp
#include <iostream>
#include "database.h"

int main()
{
    Database db;

    Schema schema;
    schema.add_column(std::make_unique<IntegerColumn>("id"));
    schema.add_column(std::make_unique<TextColumn>("player"));
    schema.add_column(std::make_unique<IntegerColumn>("score"));

    db.create_table("games", std::move(schema));

    Table& games = db.get_table("games");

    std::vector<std::unique_ptr<Value>> values;
    values.push_back(std::make_unique<IntegerValue>(1));
    values.push_back(std::make_unique<TextValue>("Alice"));
    values.push_back(std::make_unique<IntegerValue>(100));

    games.insert(Row(std::move(values), games.schema));

    std::cout << "Row count: " << games.rows.size() << std::endl;
    for (const auto& row : games.rows)
    {
        for (size_t i = 0; i < row.values.size(); ++i)
        {
            std::cout << games.schema.columns[i]->name << " = "
                       << row.values[i]->to_string() << " ";
        }
        std::cout << std::endl;
    }

    try
    {
        db.get_table("missing_table");
    }
    catch (const std::invalid_argument& e)
    {
        std::cout << "Caught: " << e.what() << std::endl;
    }
}
```

Compiled and run:

```bash
g++ -std=c++17 -Wall -c database.cpp -o database.o
g++ -std=c++17 -Wall -c database_check.cpp -o database_check.o
g++ table.o schema.o row.o database.o database_check.o -o database_check.exe
./database_check.exe
```

Real output:

```text
Row count: 1
id = 1 player = 'Alice' score = 100
Caught: No table named 'missing_table'
```

*What this proves:* a real `Database`, built with exactly one
`create_table` call, correctly finds `"games"` back by that real name,
holds the real row `insert`ed into it, and — the same real
`std::invalid_argument` mechanism Lesson 4 already proved — refuses to
silently succeed on a name that was never created, printing a real,
specific message naming the missing table.

### Discard the Throwaway Example

`database_check.cpp`/`.o`/`.exe` are deleted:

```bash
rm database_check.cpp database_check.o database_check.exe
```

`database.h` and `database.cpp` are kept — real, permanent project
files.

### Mechanical Walkthrough

- `std::map<std::string, Table> tables;` — covered fully in Objects and
  methods used, above.
- `void create_table(std::string name, Schema schema);` /
  `Table& get_table(const std::string& name);` (declarations, in
  `database.h`) — reappearing shape (Lesson 3's declaration/definition
  split).
- `tables.emplace(std::move(name), Table(std::move(schema)));` (in
  `database.cpp`) — `emplace`, covered fully in Objects and methods
  used; `Table(std::move(schema))` constructs a real `Table` directly,
  moved into the map's own storage, not copied — `Table` has no copy
  constructor at all (its own `Schema` member holds
  `std::unique_ptr<Column>`s, which cannot be copied, per Lesson 2), so
  this move is not an optimization here — it's the only way this line
  can compile at all.
- `auto it = tables.find(name);` — reappearing exactly (this unit's own
  isolated proof).
- `if (it == tables.end())` — reappearing exactly.
- `throw std::invalid_argument(...)` — reappearing exactly, per the
  Repetition Rule (Lesson 4 gave this full treatment) — the identical
  exception type, a different real message.
- `return it->second;` — reappearing exactly (this unit's own isolated
  proof) — returns a real reference to the found `Table`, not a copy
  (which, again, wouldn't compile — `Table` has no copy constructor).

### CS Lens

`std::map`'s real lookup is a hash-table's conceptual sibling, not its
twin — worth naming the real distinction directly, since a hash index
is this project's own next real milestone (`README.md`'s Slice S06):
`std::map` keeps its real entries in sorted order by key, and looks one
up in real logarithmic time by comparing keys; a genuine hash table
(built from scratch, S06) computes a real position directly from the
key's own hash, in real constant time on average, at the cost of no
ordering guarantee at all. Both are real, valid answers to "look
something up by key" — different real tradeoffs, not one simply better
than the other.

### SE Lens

Why does `get_table` return a real `Table&` (a reference) instead of a
copy? Because `Table` cannot be copied at all — proven directly above,
in the walkthrough's own explanation of why `emplace` needed a move —
and even if it could, copying an entire table's real rows just to read
one value from it would be real, wasted work. The real cost this
project accepts: the returned reference is only valid as long as the
real `Database` it came from still exists, and as long as nothing else
modifies `tables` in a way that could invalidate it (a real `std::map`
guarantee worth trusting for now, revisited honestly if this project
ever needs concurrent access, S06+).

### Commands Needed

Every command was already shown above, alongside its real output.

### Run It

Already shown above, in "Introduce the Concept in Isolation" and "The
New Code" — the real `std::map` proof, the real successful round trip,
and the real caught exception.

### Connection

A real `Database` can now hold, create, and safely look up real,
named `Table`s — entirely in memory, entirely from C++. Python cannot
reach any of this yet — `Database`, `Table`, `Schema`, and `Row` are
all real C++ classes, none of them `extern "C"`-shaped. The next lesson
builds the actual, narrow FFI boundary — `database_open`/
`database_create_table` — that lets Python reach this real engine for
the first time.

---

## Closing

### Connect the Pieces

`Table` combined a real `Schema` with a real, growable `std::vector<Row>`,
proven by inserting one real row and reading it back correctly. `Database`
then wrapped a real `std::map<std::string, Table>` around that, proven
with a full round trip — one real `create_table("games", ...)` call,
followed by `get_table("games")` correctly finding it back, a real row
inserted and read back correctly through it — and a real, caught
`std::invalid_argument` the moment a name that was never created was
looked up. Every real class from Lesson 2 through this lesson —
`Column`, `Schema`, `Value`, `Row`, `Table`, `Database` — now composes
into one real, in-memory engine, missing only a way for anything outside
this one C++ program to reach it.

### What Breaks Without This

Already shown directly above: look up a table name that was never
created, and `Database::get_table` throws a real, specific
`std::invalid_argument` naming exactly which name was missing — not a
crash, not a silent empty result standing in for "not found."

### Exercises

- Add a `Database::table_names()` method returning a
  `std::vector<std::string>` of every real table name currently in
  `tables` — iterate `tables` with a range-based `for` loop
  (`for (const auto& entry : tables)`, reappearing shape from Lesson 2's
  own `Schema::columns` loop) and collect each real `entry.first`.
- Create two real tables in the same `Database` (`"games"` and a second
  one of your own choosing, with a different real schema), insert a
  real row into each, and confirm both are stored correctly and
  independently — proving `Database` really does hold more than one
  table safely at once.
- Deliberately call `db.create_table("games", schema)` twice with the
  same real name. Read what actually happens (does it throw, silently
  overwrite, or something else?) — check `std::map::emplace`'s own real,
  documented behavior for a duplicate key against what you observe, and
  explain the real result in your own words.

### Definition of Done

- [ ] `table.h`, `table.cpp`, `database.h`, and `database.cpp` all exist
      as real files in your own `pocketdb/` folder.
- [ ] A real `Database`, with one real table created in it, correctly
      stores and returns a real, inserted row.
- [ ] You caused the real `std::invalid_argument` for a missing table
      name yourself, and can explain why `get_table` throws instead of
      returning something like a null pointer.
- [ ] You can explain, from memory, why `Table` and `Database` can't be
      copied, referencing the real chain of ownership (`unique_ptr` in
      `Column`, `Value`) that makes it true, not just "the compiler said
      so."
- [ ] Committed with a message stating why: for example,
      `git commit -m "Add Table and Database, completing the in-memory engine"`.
