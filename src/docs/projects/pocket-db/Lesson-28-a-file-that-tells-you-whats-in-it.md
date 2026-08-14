# Lesson 28: A File That Tells You What's In It

**What you will build** — one real, small, permanent addition:
`Database.table_names()`, returning every real table a `.pdb` file
actually holds, without the caller already knowing them. Every lesson
before this one always already knew its own table names — it had just
created them. This lesson exists because a genuinely new kind of real
caller doesn't.

**What you need to know first:** Lesson 16 (the real catalog — every
table's name already lives in `Database::tables`), Lesson 18
(`database_column_names`, the identical real convention this lesson
reuses), Lesson 7 (`try`/`catch` at the `extern "C"` boundary).

**Terms introduced in this lesson:** None — every real piece this
lesson uses was already taught in full; this lesson's own real subject
is applying them to one new, small, honest gap.

**Objects and methods used**
- **`database_table_names`**
  - *What it is:* this lesson's own real, new `extern "C"` function —
    returns every real table name a `Database` currently holds, as one
    comma-joined string, the identical real convention
    `database_column_names` (Lesson 18) already established.
  - *Implementation:* iterates `real_db->tables` (a real
    `std::map<std::string, Table>`, already public on `Database` since
    Lesson 16) and joins each real key.
  - *Its use:* `Database.table_names()`'s own real, entire
    implementation.

---

## Concept Unit: Why This Lesson Exists

### The Problem

Every table `pocket-db` has ever created, in every lesson, was created
by code that already knew its own real name — `db.create_table
("games", ...)` always already has `"games"` written right there. A
real, different kind of caller — a generic file browser that opens a
`.pdb` file it didn't create — genuinely doesn't. Nothing in this
project's own real API answers "what tables does this file actually
have."

### Introduce the Concept in Isolation

The real data this lesson exposes already exists — proven directly,
reading `Database::tables` from a real, separate, temporary C++ file:

```cpp
#include <iostream>
#include "database.h"
#include "page_manager.h"

int main()
{
    PageManager pm("isolation_check.pdb");
    Database db(std::move(pm));

    db.create_table("games", Schema());
    db.create_table("scores", Schema());

    std::cout << "real table count already in Database::tables: "
              << db.tables.size() << std::endl;
    for (const auto& entry : db.tables)
    {
        std::cout << "  " << entry.first << std::endl;
    }
}
```

Real output:

```text
real table count already in Database::tables: 2
  games
  scores
```

*What this proves:* the real data this lesson needs to expose isn't
new — `Database::tables` has held it correctly, in real, sorted
`std::map` key order, since Lesson 16. The real gap is only that
nothing outside C++ has ever been allowed to read it.

The real, iterating `for` loop's own behavior, traced against
`db.tables`' actual, real, sorted contents:

#### Execution Trace

```text
Iteration 1: entry = {"games", Table(...)} -> prints "  games", because
             "games" sorts before "scores" in std::map's own real key order
Iteration 2: entry = {"scores", Table(...)} -> prints "  scores", because
             it is the only real key remaining after "games"
```

### Discard the Throwaway Example

```bash
rm isolation_check.cpp isolation_check.exe isolation_check.pdb
```

### Mechanical Walkthrough

- `db.tables.size()` / iterating `db.tables` — reappearing shape
  (`std::map` iteration, Lesson 5) — real, direct proof the real data
  was already there, in real, already-correct, alphabetically-sorted
  order (a real, standard `std::map` property).

### CS Lens

This is a real, small instance of an **information hiding** boundary
finally getting one more real, deliberate opening — `Database::tables`
was always real, correct, internal state; this lesson doesn't change
what it holds, only adds one more real, narrow, intentional way to
read it from outside C++, the identical real principle behind every
`extern "C"` function this project has ever added.

### SE Lens

Why was this real gap never caught by any earlier lesson's own real
testing? Because every earlier lesson's own real proof always already
knew its own table names — the real tests were honest and complete for
what they tested, they simply never needed to ask this particular real
question. A real, new kind of consumer is what surfaced it, not a bug
in the old tests.

### Commands Needed

Every command was already shown above, alongside its real output.

### Run It

Already shown above, in "Introduce the Concept in Isolation."

### Connection

The real data was always there. Exposing it across the real `extern
"C"` boundary, the identical way every other read-only function in
this project already does, is next.

---

## Concept Unit: `database_table_names`

### The Problem

The real data is confirmed to already exist inside `Database::tables`.
Nothing outside C++ can read it yet — no real `extern "C"` function
exposes it, the identical real gap this lesson's own opening already
named.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `database_c_api.h`/`.cpp` (modified —
  `database_table_names` added), `pocketdb.py` (modified —
  `Database.table_names()` added).
- **Change type:** Add.
- **Dependencies:** This lesson's own first unit; Lesson 16's real
  catalog; Lesson 18's real comma-joined convention.

### The New Code — `database_c_api.h`

```cpp
char* database_table_names(DatabaseHandle db);
```

### The New Code — `database_c_api.cpp`

```cpp
char* database_table_names(DatabaseHandle db)
{
    try
    {
        Database* real_db = static_cast<Database*>(db);

        std::string joined;
        bool first = true;
        for (const auto& entry : real_db->tables)
        {
            if (!first)
            {
                joined += ",";
            }
            joined += entry.first;
            first = false;
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

### The New Code — `pocketdb.py`

```python
_engine.database_table_names.argtypes = [ctypes.c_void_p]
_engine.database_table_names.restype = ctypes.c_void_p
```

```python
    def table_names(self):
        ptr = _engine.database_table_names(self._handle)
        if ptr is None:
            raise PocketDBError("Failed to read table names")

        text = ctypes.string_at(ptr).decode("utf-8")
        _engine.database_free_string(ptr)
        return text.split(",") if text else []
```

Rebuilt into the same real `pocketdb_engine.dll`, proven for real —
multiple tables, an empty database, and a real reopen:

```python
from pocketdb import Database, INTEGER, TEXT

db = Database("tntest.pdb")
db.create_table("games", id=INTEGER, player=TEXT)
db.create_table("scores", game_id=INTEGER, points=INTEGER)
print("table names:", db.table_names())
db.close()

db2 = Database("tntest.pdb")
print("reopened table names:", db2.table_names())
db2.close()
```

Real output:

```text
table names: ['games', 'scores']
reopened table names: ['games', 'scores']
```

The real, empty-database edge case:

```python
from pocketdb import Database

db = Database("emptytest.pdb")
print("empty db table names:", db.table_names())
db.close()
```

Real output:

```text
empty db table names: []
```

### Discard the Throwaway Example

```bash
rm tntest.pdb emptytest.pdb
```

Every real `.h`/`.cpp`/`.py` change above is kept — permanent project
code.

### Mechanical Walkthrough

- `for (const auto& entry : real_db->tables)` — reappearing shape
  (this lesson's own first unit; `database_column_names`, Lesson 18)
  — `entry.first` is each real table's own name; `real_db->tables`
  being a real `std::map` means these always come back in real,
  alphabetically sorted order, not creation order.
- `text.split(",") if text else []` — a real, small, deliberate
  Python-side check: an empty database's own real `text` is `""`
  (Lesson 18's own comma-joined convention produces an empty string
  for zero real entries), and `"".split(",")` would real-return
  `['']` — one, real, empty-string "table" — not the real, correct,
  empty list; the explicit `if text else []` avoids that real, subtle
  bug.

### CS Lens

Catching the `"".split(",")` edge case directly is a real, small
instance of the same discipline Lesson 8's own memory-ownership proof
demonstrated: a real, generically-correct-looking pattern
(`.split(",")`, already used safely everywhere else in this project)
can still have one real, specific input (an empty string) where it
silently does the wrong thing — worth a real, explicit check, not an
assumption.

### SE Lens

Why does `database_table_names` return `nullptr` only for a real,
thrown exception, never for a real, valid, empty database? Because
"no tables yet" is real, valid, ordinary state — a freshly opened
`.pdb` file with nothing created yet is a real, correct, unremarkable
case, not an error; conflating "empty" with "failed" would make a
genuinely common, real situation look like a real bug.

### Commands Needed

Every command was already shown above, alongside its real output.

### Run It

Already shown above, in "The New Code."

### Connection

`pocket-db`'s own real API can now answer "what tables does this file
actually have" — the one real question this project never needed to
ask itself, but a real, external caller like `pocket-studio`
genuinely does.

---

## Closing

### Connect the Pieces

This lesson's first unit proved the real data it needed already
existed, untouched, inside `Database::tables` since Lesson 16 — this
lesson changes nothing about what's stored, only adds one more real,
narrow way to read it. The second unit exposed it through the
identical real `extern "C"` convention every earlier, similar function
already established, catching one real, small, honest edge case
(an empty database's own comma-joined string) along the way.

### What Breaks Without This

Remove the `if text else []` check from `Database.table_names()`,
leaving only `return text.split(",")`, rebuild nothing (pure Python),
and call `table_names()` on a real, empty database. The real, returned
value is `['']` — a list containing one, real, empty string — not the
real, correct `[]`; real code written against this method that assumes
`len(table_names()) == 0` means "no tables" would be real, silently
wrong. Restore the check and confirm the real, correct `[]` returns.

### Exercises

- Call `table_names()` on a database handle *after* calling
  `.close()` on it, and observe the real, actual failure. Explain,
  referencing Lesson 9's own real `Database` class, why this happens
  and whether it's this lesson's own real responsibility to guard
  against.
- `database_table_names` returns table names with no real information
  about each one's own schema. Using `database_column_names` (Lesson
  18) in a real, small loop, write a real Python function
  `describe_database(db)` printing every real table's own name
  *and* its own real column names.

### Definition of Done

- [ ] `database_table_names` and `Database.table_names()` exist as
      real, permanent code.
- [ ] You called `table_names()` against a real, multi-table database,
      an empty one, and a reopened one, and confirmed all three real
      results.
- [ ] You caused the real `['']`-instead-of-`[]` failure yourself and
      confirmed restoring the check fixes it.
- [ ] You can explain, from memory, why this lesson exists even though
      `pocket-db` was already "complete" — referencing this lesson's
      own opening paragraph.
- [ ] Committed with a message stating why: for example,
      `git commit -m "Add Database.table_names() for external callers that don't already know them"`.
