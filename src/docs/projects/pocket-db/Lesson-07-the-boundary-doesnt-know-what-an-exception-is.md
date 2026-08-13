# Lesson 7: The Boundary Doesn't Know What a C++ Exception Is

**What you will build**
A real, dangerous gap in Lesson 6's own `extern "C"` API, proven by
actually crashing a real Python process on purpose — then the real fix,
applied to every function in the API, including hardening the two
already-shipped ones. `database_insert` is built on top of that fixed,
safe foundation: real values, sent from Python as plain text, parsed
against whatever real column types `database_create_table` already
recorded for that table — the first time this project's own `Schema`
is *read back* to make a real decision, not just built.

**What you need to know first:** Lesson 4 — `throw`/`try`/`catch`,
`std::invalid_argument`. Lesson 5 — `Database::get_table`, itself
throwing on a missing name. Lesson 6 — the `extern "C"` boundary,
opaque handles, `static_cast`.

**Terms introduced in this lesson:** None — this lesson's new material
is a real, dangerous consequence of already-taught mechanisms meeting
each other for the first time, not a new language construct.

**Objects and methods used**
- **`std::stoi`**
  - *What it is:* a real standard-library function, from `<string>`,
    parsing the leading digits of a real string into a real `int`.
  - *Implementation:* `std::stoi(text)` returns a real `int` if `text`
    starts with valid digits; it throws a real `std::invalid_argument`
    if `text` doesn't start with anything parseable as a number at
    all — the exact real exception type Lesson 4 already gave full
    treatment to.
  - *Its use:* `database_insert`, this lesson's own real subject —
    converting a real `const char*` value, sent from Python as plain
    text, into a real `int` for whichever columns `Schema` says are
    `IntegerColumn`s.

---

## Concept Unit: The Boundary Doesn't Know What a C++ Exception Is

### The Problem

`Database::get_table` (Lesson 5) throws a real `std::invalid_argument`
when a table name doesn't exist. `std::stoi` (this lesson, next unit)
throws the identical real type when text can't be parsed as a number.
Both are real, correct, already-proven C++ behavior. Neither one has
ever been called *from inside an `extern "C"` function* yet — Lesson
6's own `database_create_table` never calls anything that can throw.
What actually happens the moment one does?

### Introduce the Concept in Isolation

A small, deliberately dangerous throwaway, proving the real risk before
fixing it. Save this as `leaky.cpp`, in `pocketdb/`:

```cpp
#include <stdexcept>

extern "C" int parse_and_double(const char* text)
{
    int value = std::stoi(text);
    return value * 2;
}
```

Compiled to a shared library:

```bash
g++ -std=c++17 -Wall -shared -o leaky.dll leaky.cpp
```

Called from Python with both good and deliberately bad input. Save this
as `leaky_test.py`:

```python
import ctypes

lib = ctypes.CDLL("./leaky.dll")
lib.parse_and_double.argtypes = [ctypes.c_char_p]
lib.parse_and_double.restype = ctypes.c_int

print("good input:", lib.parse_and_double(b"21"))
print("about to call with bad input...")
print("bad input result:", lib.parse_and_double(b"not a number"))
print("this line should not print if it crashed")
```

Run with `python leaky_test.py`. Real, captured crash:

```text
good input: 42
about to call with bad input...
terminate called after throwing an instance of 'std::invalid_argument'
  what():  stoi
```

*What this proves:* the good call worked correctly (`21 * 2 = 42`) —
but the bad call's real `std::invalid_argument`, thrown inside
`parse_and_double`, never reached any `catch` at all, because none
exists anywhere between the `throw` and Python's own calling code —
which isn't C++, and has no concept of a C++ exception to catch in the
first place. The entire Python process terminates, immediately, mid-run
— proven directly by the final `print` line never running at all. This
is a real, dangerous fact about `extern "C"` functions specifically:
**a C++ exception must never be allowed to cross into non-C++ calling
code** — doing so is undefined behavior, and a clean crash (what
happened here) is the *best* real outcome undefined behavior can
produce, not a guarantee.

The real fix — catching the exception *inside* the function, before it
can ever reach the boundary. Save this as `safe.cpp`:

```cpp
#include <stdexcept>

extern "C" int parse_and_double(const char* text)
{
    try
    {
        int value = std::stoi(text);
        return value * 2;
    }
    catch (const std::exception&)
    {
        return -1;
    }
}
```

Compiled and tested the same way:

```bash
g++ -std=c++17 -Wall -shared -o safe.dll safe.cpp
```

```python
import ctypes

lib = ctypes.CDLL("./safe.dll")
lib.parse_and_double.argtypes = [ctypes.c_char_p]
lib.parse_and_double.restype = ctypes.c_int

print("good input:", lib.parse_and_double(b"21"))
print("bad input result:", lib.parse_and_double(b"not a number"))
print("program continues normally")
```

Real output — no crash this time:

```text
good input: 42
bad input result: -1
program continues normally
```

*What this proves:* the identical bad input now produces a real,
ordinary return value (`-1`) instead of terminating the process — and
the program's own final `print` line, which never ran in the leaky
version, runs normally here. Every real detail the exception carried
(its type, its message) is gone once caught this way — `-1` is the only
information that survives — a real, honest cost of making the boundary
safe, covered directly in this unit's own SE Lens.

### Discard the Throwaway Example

`leaky.cpp`/`.dll`, `leaky_test.py`, `safe.cpp`/`.dll`, and
`safe_test.py` are all deleted — they exist only to prove the real
danger and the real fix, by contrast:

```bash
rm leaky.cpp leaky.dll leaky_test.py safe.cpp safe.dll safe_test.py
```

### Project Change

- **Reference Source:** No reference counterpart — a from-scratch
  safety fix.
- **Files affected:** `database_c_api.h` (modified — `database_create_table`'s
  return type changes from `void` to `int`), `database_c_api.cpp`
  (modified — every function's body wrapped in `try`/`catch`).
- **Change type:** Refactor (hardening already-shipped Lesson 6 code,
  not changing its real, working behavior for valid input).
- **Dependencies:** This unit's own real proof, above.

### The New Code — `database_create_table`, Hardened

`database_c_api.h`'s own declaration changes — `void` becomes `int`,
a real status code, `0` for success:

```cpp
int database_create_table(DatabaseHandle db, const char* table_name,
                           const char** column_names, const ColumnTypeCode* column_types,
                           int column_count);
```

### The Updated Project — `database_c_api.cpp`

`database_create_table`'s real body, unchanged except for the new
`try`/`catch` wrapper and a real `return 0;` on success:

```cpp
int database_create_table(DatabaseHandle db, const char* table_name,
                           const char** column_names, const ColumnTypeCode* column_types,
                           int column_count)
{
    try
    {
        Database* real_db = static_cast<Database*>(db);                    // ← unchanged

        Schema schema;                                                     // ← unchanged
        for (int i = 0; i < column_count; ++i)                             // ← unchanged
        {
            if (column_types[i] == COLUMN_TYPE_INTEGER)                    // ← unchanged
            {
                schema.add_column(std::make_unique<IntegerColumn>(column_names[i]));  // ← unchanged
            }
            else                                                           // ← unchanged
            {
                schema.add_column(std::make_unique<TextColumn>(column_names[i]));     // ← unchanged
            }
        }

        real_db->create_table(table_name, std::move(schema));              // ← unchanged
        return 0;                                                          // ← new
    }
    catch (const std::exception&)                                          // ← new
    {
        return -1;                                                        // ← new
    }
}
```

### Mechanical Walkthrough

- `try { ... }` / `catch (const std::exception&) { return -1; }` —
  reappearing exactly (this unit's own isolated proof) — wraps the
  entire, already-working function body; nothing about *what* the
  function does for valid input changed, only what happens if something
  inside it throws.
- `return 0;` (added at the end of the `try` block) — a real, explicit
  success signal, needed now that the function's return type carries
  meaning (`0` = worked, anything else = didn't) instead of `void`
  carrying none.
- `catch (const std::exception&)` — catches `std::invalid_argument` and
  every other real standard exception type, since all of them inherit
  from `std::exception` — deliberately broad here, because *every*
  possible real failure inside this function needs to become a safe
  return value, not just the ones anticipated today.

### CS Lens

This is an **exception-safe boundary** — a real, deliberate seam where
no exception is ever allowed to cross, converting C++'s own rich
`throw`/`catch` mechanism into a plain, universal integer status code
the instant control would otherwise leave C++ entirely. Also recognized
in: any language's own C FFI layer (Rust's `catch_unwind`, Java's JNI
requiring a pending-exception check after every native call), and — a
repo-internal comparison worth naming directly — this is structurally
the same problem `exception-translation-at-boundary.md` (a different
curriculum's own concept file) already names for a completely different
kind of boundary: converting one layer's real failure signal into
whatever the next layer up can actually understand.

### SE Lens

Why collapse every real exception down to a bare `-1`, losing the real,
specific message each one carried? Because that message is a real
`std::string`, and this lesson's own earlier unit (Lesson 6) already
proved `std::string` cannot safely cross this exact boundary either —
the same constraint that shaped `database_create_table`'s parameters
in the first place also shapes what a failure can report back. The real
cost accepted here: Python currently learns only *that* something
failed, not *why* — a real, honest limitation, worth naming directly
rather than pretending `-1` is a complete error-reporting story. A more
capable real design (a `database_last_error(db)` function returning the
most recent real message as a `const char*`) is a real, natural next
step once this project needs it — not built now, because nothing yet
requires more than knowing whether a call succeeded.

### Commands Needed

Every command was already shown above, alongside its real output.

### Run It

Already shown above — the real crash, and the real, safe recovery.

### Connection

Every `extern "C"` function in this project must follow this same
discipline from here forward — proven necessary, not just recommended.
`database_insert`, built next, is the first genuinely *new* function
written with it from the start, rather than retrofitted onto working
code.

---

## Concept Unit: `database_insert` — Parsing Real Values Against a Schema Already on File

### The Problem

`INSERT INTO games VALUES (1, 'Alice', 100)` needs to send real row
data across the boundary — but, per Lesson 6's own constraint, only
real C-compatible types can cross it. Unlike `database_create_table`,
which had to invent a way to describe types it didn't know yet,
`database_insert` has something `database_create_table` didn't: the
table's real `Schema`, already built and stored, already recording
exactly which column is which real type. Can that already-known
information do the real work, instead of sending type information
twice?

### Project Change

- **Reference Source:** No reference counterpart — a from-scratch
  addition.
- **Files affected:** `database_c_api.h` (adds a new declaration),
  `database_c_api.cpp` (adds the new function).
- **Change type:** Add.
- **Dependencies:** `Database::get_table` (Lesson 5), `std::stoi` (this
  lesson's own Objects and methods used), the exception-safe pattern
  (this lesson's first unit).

### The New Code — `database_c_api.h`

Add this declaration, inside the existing `extern "C" { ... }` block:

```cpp
int database_insert(DatabaseHandle db, const char* table_name,
                     const char** values, int value_count);
```

### The New Code — `database_c_api.cpp`

Add this function, after `database_create_table`:

```cpp
int database_insert(DatabaseHandle db, const char* table_name,
                     const char** values, int value_count)
{
    try
    {
        Database* real_db = static_cast<Database*>(db);
        Table& table = real_db->get_table(table_name);

        std::vector<std::unique_ptr<Value>> row_values;
        for (int i = 0; i < value_count; ++i)
        {
            Column* column = table.schema.columns[i].get();
            if (column->type_name() == "INTEGER")
            {
                row_values.push_back(std::make_unique<IntegerValue>(std::stoi(values[i])));
            }
            else
            {
                row_values.push_back(std::make_unique<TextValue>(values[i]));
            }
        }

        table.insert(Row(std::move(row_values), table.schema));
        return 0;
    }
    catch (const std::exception&)
    {
        return -1;
    }
}
```

Rebuilt into the real shared library:

```bash
g++ -std=c++17 -Wall -c database_c_api.cpp -o database_c_api.o
g++ -shared -o pocketdb_engine.dll schema.o row.o table.o database.o database_c_api.o
```

A real, temporary diagnostic, added the same way Lesson 6's own
`__debug_table_count` was — appended to the end of `database_c_api.cpp`:

```cpp
extern "C" int __debug_row_count(DatabaseHandle db, const char* table_name)
{
    Database* real_db = static_cast<Database*>(db);
    return static_cast<int>(real_db->get_table(table_name).rows.size());
}
```

Recompiled, then called for real from Python — a real, correct insert,
and both real failure paths this lesson's own first unit made safe.
Save this as `verify_insert.py`:

```python
import ctypes

engine = ctypes.CDLL("./pocketdb_engine.dll")
engine.database_open.restype = ctypes.c_void_p
engine.database_close.argtypes = [ctypes.c_void_p]
engine.database_create_table.argtypes = [
    ctypes.c_void_p, ctypes.c_char_p,
    ctypes.POINTER(ctypes.c_char_p), ctypes.POINTER(ctypes.c_int), ctypes.c_int,
]
engine.database_create_table.restype = ctypes.c_int
engine.database_insert.argtypes = [
    ctypes.c_void_p, ctypes.c_char_p, ctypes.POINTER(ctypes.c_char_p), ctypes.c_int,
]
engine.database_insert.restype = ctypes.c_int
engine.__debug_row_count.argtypes = [ctypes.c_void_p, ctypes.c_char_p]
engine.__debug_row_count.restype = ctypes.c_int

db = engine.database_open()

names = (ctypes.c_char_p * 3)(b"id", b"player", b"score")
types = (ctypes.c_int * 3)(0, 1, 0)
rc = engine.database_create_table(db, b"games", names, types, 3)
print(f"create_table result: {rc}")

values1 = (ctypes.c_char_p * 3)(b"1", b"Alice", b"100")
rc = engine.database_insert(db, b"games", values1, 3)
print(f"insert 1 result: {rc}, row count: {engine.__debug_row_count(db, b'games')}")

values2 = (ctypes.c_char_p * 3)(b"2", b"Bob", b"85")
rc = engine.database_insert(db, b"games", values2, 3)
print(f"insert 2 result: {rc}, row count: {engine.__debug_row_count(db, b'games')}")

bad_values = (ctypes.c_char_p * 3)(b"3", b"Carl", b"not_a_number")
rc = engine.database_insert(db, b"games", bad_values, 3)
print(f"insert with bad int result: {rc}, row count: {engine.__debug_row_count(db, b'games')}")

rc = engine.database_insert(db, b"missing_table", values1, 3)
print(f"insert into missing table result: {rc}")

engine.database_close(db)
print("program continued normally, no crash")
```

Run with `python verify_insert.py`. Real output:

```text
create_table result: 0
insert 1 result: 0, row count: 1
insert 2 result: 0, row count: 2
insert with bad int result: -1, row count: 2
insert into missing table result: -1
program continued normally, no crash
```

#### Execution Trace

```text
Iteration 1: i = 0 → column = table.schema.columns[0] (IntegerColumn
             "id"), column->type_name() == "INTEGER" is true, so
             row_values gets IntegerValue(std::stoi("1")) = 1
Iteration 2: i = 1 → column = table.schema.columns[1] (TextColumn
             "player"), column->type_name() == "INTEGER" is false, so
             row_values gets TextValue("Alice") directly, no parsing
Iteration 3: i = 2 → column = table.schema.columns[2] (IntegerColumn
             "score"), column->type_name() == "INTEGER" is true again,
             so row_values gets IntegerValue(std::stoi("100")) = 100 —
             the loop then ends, because i reaches value_count (3)
```

*What this proves:* two real, valid rows insert correctly, growing the
real row count from `0` to `1` to `2` — proven, not asserted, by the
real diagnostic count each time. A value that can't be parsed as an
`int` (`"not_a_number"`, for the `IntegerColumn` `"score"`) makes
`std::stoi` throw, caught by this lesson's own `try`/`catch`, returning
`-1` — the row count stays `2`, proving the failed insert didn't
partially corrupt the table with an incomplete row. Inserting into a
table that was never created triggers `Database::get_table`'s own
already-proven exception (Lesson 5), caught the identical way. Both
real failures return safely; neither crashes the process — the final
`print` line, which never ran in this unit's own first "leaky" proof,
runs correctly here.

### Discard the Throwaway Example

`__debug_row_count` is removed from `database_c_api.cpp` — never part
of the real, permanent API. `verify_insert.py` is deleted:

```bash
rm verify_insert.py
```

`database_c_api.h`/`.cpp` (minus the debug function) are kept.

### Mechanical Walkthrough

- `Table& table = real_db->get_table(table_name);` — reappearing
  exactly (Lesson 5) — this call can throw, which is exactly why this
  entire function needed the `try`/`catch` this unit's own first part
  established.
- `Column* column = table.schema.columns[i].get();` — **first
  appearance of `.get()`** on a `unique_ptr` — returns the real, raw
  `Column*` the `unique_ptr` owns, *without* transferring ownership —
  needed here because this function only wants to briefly *read*
  `column->type_name()`, not take over owning it.
- `column->type_name() == "INTEGER"` — reappearing shape (`Column`'s
  own method, Lesson 2), compared here against a real string literal to
  decide, at runtime, which real `Value` subclass this column's data
  needs.
- `std::stoi(values[i])` — covered fully in Objects and methods used,
  above.
- `std::make_unique<IntegerValue>(std::stoi(values[i]))` — reappearing
  shape (Lesson 2's own `make_unique` pattern), this time constructing
  a `Value` instead of a `Column`.
- `table.insert(Row(std::move(row_values), table.schema));` —
  reappearing exactly (Lesson 5's `Table::insert`, Lesson 4's `Row`
  constructor) — the real, already-proven validation (row count must
  match the schema's column count) runs here too, for free, since
  `Row`'s constructor doesn't know or care whether it was built from
  C++ code directly or from values that just crossed an FFI boundary.

### CS Lens

Reading `table.schema` back to *decide* how to interpret incoming data
— rather than being told the types again — is a real instance of a
**single source of truth**: the schema was declared exactly once, in
`database_create_table`, and every later operation on that table
consults the same real, stored `Schema` instead of trusting a second,
possibly-inconsistent copy of the same information sent again.

### SE Lens

Why does `database_insert` take `value_count` as a separate parameter,
identical in shape to `database_create_table`'s own `column_count`,
instead of deriving it some other way? Because `const char** values` is
a real, raw pointer to the *start* of an array — nothing about a raw
pointer in C (or C++) carries its own length; C-compatible arrays
crossing this boundary always need their real length sent alongside
them, explicitly, the same real reason `column_count` existed in Lesson
6. The real cost, already proven directly by this unit's third exercise
below: a caller that lies about the real length invites the C++ side to
read real memory it was never given access to — a genuine, structural
risk of this narrow boundary, not fixed by this project, only named
honestly.

### Commands Needed

Every command was already shown above, alongside its real output.

### Run It

Already shown above, in "The New Code" — the full, real round trip:
two successful inserts, one real parse failure, one real missing-table
failure, and no crash.

### Connection

Rows can now be inserted through the real `extern "C"` boundary,
validated the same way Lesson 4 already proved, safely, even when
Python sends genuinely bad input. Reading a row back out — the harder
problem of returning real, variable-shaped data *across* the boundary,
not just receiving it — is next.

---

## Closing

### Connect the Pieces

This lesson opened by causing a real crash on purpose —
`parse_and_double`, with no `try`/`catch`, terminated an entire real
Python process the moment `std::stoi` threw on bad input, proven by the
program's own final `print` line never running. The fix — wrapping
every `extern "C"` function's body in `try`/`catch`, returning a real
`int` status code instead of letting anything escape — was applied both
to Lesson 6's own `database_create_table` (hardened, its real working
behavior unchanged) and to this lesson's new `database_insert`. That
function reads a table's own already-stored `Schema` to decide, column
by column, whether to parse each incoming value as a real `int`
(`std::stoi`) or keep it as real text — proven correct with two
successful inserts, growing a real, diagnostic-confirmed row count from
`0` to `2`, and proven safe with two real, caused failures — a bad
integer and a missing table — neither of which crashed the process or
left a partially-inserted row behind.

### What Breaks Without This

Already shown directly above, at the very start: remove the
`try`/`catch` from an `extern "C"` function that can throw, call it
with input that actually triggers the throw, and the entire calling
Python process terminates immediately — restoring the `try`/`catch`
fixes it, proven with the identical bad input producing a real, safe
`-1` instead.

### Exercises

- Add a `database_last_error(DatabaseHandle db)` function, storing the
  most recent real caught exception's `.what()` message in a
  `static std::string` inside `database_c_api.cpp`, returned as a real
  `const char*` — the real, natural next step this lesson's own SE Lens
  named but didn't build. Confirm it correctly reports the real message
  from a deliberately-caused failure.
- Add real column-*count* validation to `database_insert` itself — if
  `value_count` doesn't match `table.schema.columns.size()`, return
  `-1` before ever touching `values[i]` — proving you understand real
  bounds-checking is needed here even though `Row`'s own constructor
  (Lesson 4) already checks the same thing, since this loop reads
  `table.schema.columns[i]` *before* `Row` is ever constructed.
- Carefully, expecting a real crash (not corrupted data, a full crash —
  read the real error if it doesn't happen cleanly): call
  `database_insert` from Python with `value_count = 10` while the real
  `values` array only actually holds 3 real entries. Explain, in your
  own words, why nothing in this lesson's own `try`/`catch` can catch
  this specific mistake — referencing this unit's own SE Lens.

### Definition of Done

- [ ] `database_c_api.h`/`.cpp` include the hardened
      `database_create_table` and the new `database_insert`, both
      returning a real `int` status code.
- [ ] You caused the real, uncaught crash yourself (`leaky.cpp`), read
      the real terminate message, and fixed it with a real `try`/`catch`.
- [ ] You inserted two real rows from your own Python script and
      confirmed, via the temporary debug count, the real row count grew
      correctly.
- [ ] You triggered both real failure paths (`std::stoi` on bad input,
      `get_table` on a missing table name) and confirmed neither one
      crashed the process or corrupted the table's real row count.
- [ ] You can explain, from memory, why collapsing every exception down
      to `-1` is a real, honest tradeoff, not a complete solution —
      referencing this lesson's own SE Lens.
- [ ] Committed with a message stating why: for example,
      `git commit -m "Harden the extern C boundary against C++ exceptions, add database_insert"`.
