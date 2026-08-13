# Lesson 6: A Boundary That Only Speaks C

**What you will build**
The real `extern "C"` API — `database_open`, `database_close`,
`database_create_table` — the first actual way for Python to reach the
C++ engine built across Lessons 2 through 5. Crossing this boundary
forces a real design constraint, proven directly rather than assumed:
none of `Database`, `Schema`, `std::string`, or `std::vector` can cross
it safely. Only real, C-compatible types — `int`, `const char*`,
`void*`, and arrays of these — can, because those are the only types
`ctypes`, on the Python side, actually knows how to represent at all.

**What you need to know first:** Lesson 0 — `extern "C"`, compiling to
a shared library, `ctypes` loading and calling a real exported function.
Lesson 5 — `Database`, `Table`, `Schema`, the real C++ engine this
lesson exposes for the first time.

**Terms introduced in this lesson:**
- **Opaque handle** — a pointer handed to a caller as an *identifier*
  only — the caller stores it and passes it back on later calls, but
  never looks inside it, never needs to know its real shape. Proven
  directly, with a real, disposable example, in this lesson's first
  Concept Unit.
- **`typedef`** — gives an existing type a second, real name — the
  underlying type is completely unchanged; `typedef void* DatabaseHandle;`
  makes `DatabaseHandle` and `void*` the exact same type to the
  compiler, purely for readability at every call site.
- **`enum`** — declares a real, named, closed set of integer
  constants — `ColumnTypeCode`'s two real values,
  `COLUMN_TYPE_INTEGER`/`COLUMN_TYPE_TEXT`, are ordinary `int`s
  underneath, given real names instead of bare numbers written at every
  call site.

**Objects and methods used**
- **`static_cast<T>(x)`**
  - *What it is:* a real C++ cast operator — an explicit, compile-time-
    checked type conversion, distinct from a C-style `(T)x` cast, which
    performs whichever of several different conversion kinds happens to
    apply with no explicit statement of which one was intended.
  - *Implementation:* `static_cast<Database*>(handle)` converts
    `handle` (a `void*`) back into a real `Database*` — the compiler
    checks this conversion is at least plausible at compile time (unlike
    `reinterpret_cast`, a different, more dangerous cast this project
    doesn't use), though it cannot verify `handle` actually *is* a real
    `Database*` at runtime — that guarantee comes from this project's
    own discipline, not the language.
  - *Its use:* every `extern "C"` function in this lesson that receives
    a `DatabaseHandle` immediately `static_cast`s it back to a real
    `Database*` before using it.
- **`new` / `delete`**
  - *What they are:* C++'s own raw, manual heap allocation and
    deallocation — `new T(...)` constructs a real object on the heap and
    returns a real, owning pointer to it; `delete ptr` destroys that
    object and frees its memory. Unlike `std::make_unique` (Lesson 2),
    neither one wraps the result in any automatic cleanup — a `delete`
    that's never called is a real, permanent memory leak.
  - *Implementation:* `new Database()` — a plain, un-owned `Database*`,
    with no `unique_ptr` involved. `delete static_cast<Database*>(handle)`
    destroys it.
  - *Its use:* `database_open`/`database_close` — this lesson's own real
    reason to use raw `new`/`delete` deliberately, instead of Lesson 2's
    own `unique_ptr`, covered fully in this unit's SE Lens.

---

## Concept Unit: The Opaque Handle — a Pointer Whose Shape Nobody Outside C++ Needs to Know

### The Problem

`database_open()` needs to give Python *something* to hold onto, and
hand back on every later call (`create_table`, and eventually `insert`/
`get`) — but Python has no way to represent a real C++ `Database`
object's actual internal shape (a `std::map<std::string, Table>`, each
`Table` holding real C++ objects), and doesn't need to. What can Python
hold onto instead?

### Introduce the Concept in Isolation

A small, disposable class — the real internal shape is deliberately
irrelevant to this proof. Save this as `handle_check.cpp`, in
`pocketdb/`:

```cpp
#include <iostream>

class Counter
{
public:
    int value = 0;
};

extern "C" void* counter_open()
{
    return new Counter();
}

extern "C" int counter_read(void* handle)
{
    Counter* real_counter = static_cast<Counter*>(handle);
    return real_counter->value;
}

extern "C" void counter_increment(void* handle)
{
    Counter* real_counter = static_cast<Counter*>(handle);
    real_counter->value = real_counter->value + 1;
}

extern "C" void counter_close(void* handle)
{
    delete static_cast<Counter*>(handle);
}
```

Compiled to a shared library:

```bash
g++ -std=c++17 -Wall -shared -o handle_check.dll handle_check.cpp
```

Called from Python. Save this as `handle_check.py`:

```python
import ctypes

lib = ctypes.CDLL("./handle_check.dll")
lib.counter_open.restype = ctypes.c_void_p
lib.counter_read.argtypes = [ctypes.c_void_p]
lib.counter_read.restype = ctypes.c_int
lib.counter_increment.argtypes = [ctypes.c_void_p]
lib.counter_close.argtypes = [ctypes.c_void_p]

handle = lib.counter_open()
print(f"handle = {handle}")
print(f"initial value: {lib.counter_read(handle)}")
lib.counter_increment(handle)
lib.counter_increment(handle)
lib.counter_increment(handle)
print(f"after 3 increments: {lib.counter_read(handle)}")
lib.counter_close(handle)
```

Run with `python handle_check.py`. Real output:

```text
handle = 1746292978544
initial value: 0
after 3 increments: 3
```

*What this proves:* Python never once knew — or needed to know — that
`handle` was really a `Counter*`. It held `handle` as `ctypes.c_void_p`
— a plain address, opaque from Python's own point of view — and handed
it back, unchanged, to `counter_read`/`counter_increment`/`counter_close`,
each of which cast it back to the *real* type on the C++ side. This is
called an **opaque handle**: Python owns the *identifier*; C++ owns
what it actually, really points to.

### Discard the Throwaway Example

`handle_check.cpp`/`.dll` and `handle_check.py` are deleted — `Counter`
itself is never part of the real project; only the pattern is kept:

```bash
rm handle_check.cpp handle_check.dll handle_check.py
```

### Mechanical Walkthrough

- `extern "C" void* counter_open() { return new Counter(); }` — `new Counter()`
  allocates a real `Counter` on the heap and returns a real, raw
  pointer to it; returning it as `void*` (rather than `Counter*`) is
  what actually makes it opaque — `void*` carries no type information
  at all for `ctypes` to even attempt to interpret.
- `extern "C" int counter_read(void* handle)` — receives the same real
  address back, still typed as `void*` on this side of the boundary.
- `static_cast<Counter*>(handle)` — reappearing exactly, covered fully
  in Objects and methods used, above — converts the untyped `void*`
  back into a real, usable `Counter*`, trusting (not verifying) that
  it's genuinely a `Counter*` and not something else.
- `real_counter->value` — an ordinary member access, through the
  now-real `Counter*` — reads or writes the actual object `new Counter()`
  created, proving the *same* real object persisted correctly across
  four separate function calls, each one a separate crossing of the
  language boundary.
- `ctypes.c_void_p` — the specific `ctypes` type representing an opaque
  address, the Python-side counterpart to `void*` — `lib.counter_open.restype = ctypes.c_void_p`
  tells `ctypes` the return value is an address, not something to
  interpret further.

### CS Lens

This is the **opaque handle** (or **opaque pointer**) pattern. Also
recognized in: a file descriptor (a plain `int` a program holds, while
the operating system alone knows the real, private structure it refers
to), a Win32 window `HANDLE` (literally named for this pattern), and a
JDBC or ODBC database connection handle — a value the calling code
holds and passes back, with the real connection object's actual shape
entirely private to the driver that issued it.

### SE Lens

Why `new`/`delete` here, deliberately, instead of Lesson 2's own
`unique_ptr`? Because `unique_ptr`'s entire guarantee — automatic
cleanup when it goes out of scope — depends on a C++ destructor
actually running, and Python has no way to run a C++ destructor at all.
Ownership of the real `Database` object is being handed *across* the
language boundary to Python, which means C++'s own automatic cleanup
mechanisms structurally cannot apply anymore — `database_close`,
called explicitly from Python, is now the *only* thing standing between
this object and a real, permanent memory leak. This is a genuine,
honest cost this design accepts: unlike every C++-internal object this
project has built so far, a `Database` opened through this API is only
freed if whoever holds its handle remembers to close it — the exact
manual-lifetime risk `unique_ptr` exists to eliminate, unavoidable here
because the boundary itself is the reason.

### Commands Needed

Every command was already shown above, alongside its real output.

### Run It

Already shown above, in "Introduce the Concept in Isolation."

### Connection

An opaque `void*` handle is now proven to survive a real round trip
across the FFI boundary, four separate calls deep. The real
`Database`/`Table`/`Schema` engine (Lesson 5) is next — reached through
exactly this same pattern, plus one more real problem: describing a
whole `Schema`, not just a single `int`, in terms `ctypes` can actually
represent.

---

## Concept Unit: `database_create_table` — a Schema in Terms `ctypes` Can Represent

### The Problem

`database_create_table` needs to receive a real schema definition — a
table name, and a real list of column names and types — from Python.
`Schema`/`Column`/`std::string`/`std::vector` (everything this project's
own C++ side already uses to represent exactly this) cannot cross the
boundary directly. What real, C-compatible shape *can* carry the same
information?

### Introduce the Concept in Isolation

Real, direct evidence — not assumed, checked — for what `ctypes` is
actually capable of representing at all:

```bash
python -c "import ctypes; print([n for n in dir(ctypes) if n.startswith('c_')])"
```

Real output:

```text
['c_bool', 'c_buffer', 'c_byte', 'c_char', 'c_char_p', 'c_double', 'c_float', 'c_int', 'c_int16', 'c_int32', 'c_int64', 'c_int8', 'c_long', 'c_longdouble', 'c_longlong', 'c_short', 'c_size_t', 'c_ssize_t', 'c_time_t', 'c_ubyte', 'c_uint', 'c_uint16', 'c_uint32', 'c_uint64', 'c_uint8', 'c_ulong', 'c_ulonglong', 'c_ushort', 'c_void_p', 'c_voidp', 'c_wchar', 'c_wchar_p']
```

*What this proves:* every real type `ctypes` knows about is a plain C
primitive — an integer of some real width, a floating-point number, a
character, a pointer. There is no `c_std_string`, no `c_std_vector`, no
type for any C++ class at all — not because this project's own design
avoids them by convention, but because `ctypes` itself, a real Python
standard-library module, has no such thing to offer.

A real `Schema`, described using only what's actually on that list:

- a table name → `const char*` (`ctypes.c_char_p`)
- several column names → an array of `const char*` (`ctypes.POINTER(ctypes.c_char_p)`)
- several column types → an array of small integers, one per column,
  standing in for `IntegerColumn`/`TextColumn` (`ctypes.POINTER(ctypes.c_int)`)
- how many columns → a plain `int` (`ctypes.c_int`)

### Project Change

- **Reference Source:** No reference counterpart — a from-scratch
  addition.
- **Files affected:** `database_c_api.h` (new), `database_c_api.cpp`
  (new).
- **Change type:** Add.
- **Dependencies:** `database.h` (Lesson 5), the opaque-handle pattern
  (this lesson's first unit).

### The New Code — `database_c_api.h`

Save this as `database_c_api.h`:

```cpp
#ifndef DATABASE_C_API_H
#define DATABASE_C_API_H

extern "C" {

typedef void* DatabaseHandle;

typedef enum
{
    COLUMN_TYPE_INTEGER = 0,
    COLUMN_TYPE_TEXT = 1
} ColumnTypeCode;

DatabaseHandle database_open();
void database_close(DatabaseHandle db);
void database_create_table(DatabaseHandle db, const char* table_name,
                            const char** column_names, const ColumnTypeCode* column_types,
                            int column_count);

}

#endif
```

### The New Code — `database_c_api.cpp`

Save this as `database_c_api.cpp`:

```cpp
#include "database_c_api.h"
#include "database.h"

extern "C" {

DatabaseHandle database_open()
{
    return new Database();
}

void database_close(DatabaseHandle db)
{
    delete static_cast<Database*>(db);
}

void database_create_table(DatabaseHandle db, const char* table_name,
                            const char** column_names, const ColumnTypeCode* column_types,
                            int column_count)
{
    Database* real_db = static_cast<Database*>(db);

    Schema schema;
    for (int i = 0; i < column_count; ++i)
    {
        if (column_types[i] == COLUMN_TYPE_INTEGER)
        {
            schema.add_column(std::make_unique<IntegerColumn>(column_names[i]));
        }
        else
        {
            schema.add_column(std::make_unique<TextColumn>(column_names[i]));
        }
    }

    real_db->create_table(table_name, std::move(schema));
}

}
```

A real, deliberate cleanup, before compiling: `engine.cpp`'s two
functions (`add_two_numbers`/`average_of_two`, Lessons 0–1) have now
served their entire real purpose — proving the FFI boundary itself
works — and nothing in this project calls either one anymore. Leaving
them in the growing `pocketdb_engine.dll` forever would be exactly the
kind of quiet cruft a real codebase accumulates when temporary,
purpose-served code never gets removed. Delete `engine.cpp`,
`call_engine.py`, and `call_double_no_types.py` — Lessons 0–1's own
kept files, now genuinely obsolete, not just discardable throwaways:

```bash
rm engine.cpp call_engine.py call_double_no_types.py
```

Compiled into the real project's shared library — `pocketdb_engine.dll`
is now built entirely from the real engine, not Lesson 0's own trivial
proof functions:

```bash
g++ -std=c++17 -Wall -c schema.cpp -o schema.o
g++ -std=c++17 -Wall -c row.cpp -o row.o
g++ -std=c++17 -Wall -c table.cpp -o table.o
g++ -std=c++17 -Wall -c database.cpp -o database.o
g++ -std=c++17 -Wall -c database_c_api.cpp -o database_c_api.o
g++ -shared -o pocketdb_engine.dll schema.o row.o table.o database.o database_c_api.o
```

A real, temporary diagnostic — not part of the real, permanent API,
added only to prove `create_table` actually worked before `database_get`
exists (Lesson 7) to prove it the normal way. Add this to the *end* of
`database_c_api.cpp`:

```cpp
extern "C" int __debug_table_count(DatabaseHandle db)
{
    return static_cast<int>(static_cast<Database*>(db)->tables.size());
}
```

Recompiled the same way, then called for real from Python. Save this as
`verify_capi.py`:

```python
import ctypes

engine = ctypes.CDLL("./pocketdb_engine.dll")

engine.database_open.restype = ctypes.c_void_p
engine.database_open.argtypes = []

engine.database_close.argtypes = [ctypes.c_void_p]
engine.database_close.restype = None

engine.database_create_table.argtypes = [
    ctypes.c_void_p,
    ctypes.c_char_p,
    ctypes.POINTER(ctypes.c_char_p),
    ctypes.POINTER(ctypes.c_int),
    ctypes.c_int,
]
engine.database_create_table.restype = None

engine.__debug_table_count.argtypes = [ctypes.c_void_p]
engine.__debug_table_count.restype = ctypes.c_int

db = engine.database_open()
print(f"db handle: {db}")

column_names = (ctypes.c_char_p * 3)(b"id", b"player", b"score")
column_types = (ctypes.c_int * 3)(0, 1, 0)

engine.database_create_table(db, b"games", column_names, column_types, 3)

print(f"table count after create_table: {engine.__debug_table_count(db)}")

engine.database_close(db)
print("closed")
```

Run with `python verify_capi.py`. Real output:

```text
db handle: 2139587070112
table count after create_table: 1
closed
```

**A second, real, machine-specific setup detail — new as of this
lesson, not the same one Lesson 0 already covered:** `ctypes.CDLL(...)`
failed here the first time, with a real
`FileNotFoundError: Could not find module '...\pocketdb_engine.dll' (or one of its dependencies)`
— even though the file genuinely exists. Real cause, checked directly
with `objdump -p pocketdb_engine.dll | grep "DLL Name"`: this DLL, unlike
Lesson 0's trivial `add_two_numbers`, actually uses real C++ exceptions
and standard-library features, which pulls in two more real runtime
dependencies — `libstdc++-6.dll` and `libgcc_s_seh-1.dll` — neither of
which Lesson 0's minimal build ever needed. The fix is the same one
Lesson 0 already used for *compiling* — `C:\msys64\ucrt64\bin` on
`PATH` — but this time it's needed for `ctypes.CDLL(...)` to *load* the
`.dll` at all, not just to compile it. If a real, existing `.dll`
produces this exact error, check `PATH` before assuming the file is
somehow missing or corrupted.

*What this proves:* a real Python process — never seeing any of this
project's own C++ source — opened a real `Database`, described a real
three-column schema (`id INTEGER`, `player TEXT`, `score INTEGER`)
using only `ctypes`' own real primitive types, and the real, temporary
count confirms the C++ side actually built and stored a real table from
it, not just accepted the call silently.

### Discard the Throwaway Example

`__debug_table_count` is removed from `database_c_api.cpp` — it was
never part of the real, permanent API, only this unit's own proof.
`verify_capi.py` is deleted:

```bash
rm verify_capi.py
```

`database_c_api.h` and `database_c_api.cpp` (minus the debug function)
are kept — real, permanent project files, and `pocketdb_engine.dll`
now really is this project's own real engine, not Lesson 0's throwaway
`add_two_numbers`.

### Mechanical Walkthrough

- `extern "C" { ... }` wrapping the whole file — reappearing exactly
  (Lesson 0) — every function inside keeps its plain, unmangled name.
- `typedef void* DatabaseHandle;` — a real type alias; `DatabaseHandle`
  is just another name for `void*`, used here purely for readability at
  every call site — `DatabaseHandle db` reads more clearly than
  `void* db` about what the pointer actually represents, with zero real
  difference in the compiled code.
- `typedef enum { COLUMN_TYPE_INTEGER = 0, COLUMN_TYPE_TEXT = 1 } ColumnTypeCode;` —
  a real, C-compatible enumerated type — each name stands for a real,
  fixed `int` value, explicitly written (`= 0`, `= 1`) rather than left
  to the compiler to assign, so the exact real number `ctypes` sends
  across the boundary is never ambiguous.
- `const char* table_name` — a real, null-terminated C string; `ctypes.c_char_p`
  (Objects and methods used, Lesson 1) is its exact Python-side
  counterpart.
- `const char** column_names` — a real pointer to a real array of
  `const char*` — one real C string per column name, however many
  `column_count` says there are.
- `const ColumnTypeCode* column_types` — a real array of the enum
  values above, one per column, in the same order as `column_names`.
- `int column_count` — how many real entries the two arrays above
  actually hold; without this, neither array's real length would be
  knowable on the C++ side at all.
- `Database* real_db = static_cast<Database*>(db);` — reappearing
  exactly (this lesson's first unit).
- `for (int i = 0; i < column_count; ++i)` — an ordinary counting loop,
  walking both parallel arrays (`column_names[i]`, `column_types[i]`)
  together by the same real index.
- `if (column_types[i] == COLUMN_TYPE_INTEGER)` — real branching,
  deciding which real `Column` subclass (Lesson 2) to build for this
  one column, based on the real value Python sent.
- `schema.add_column(std::make_unique<IntegerColumn>(column_names[i]));` —
  reappearing exactly (Lesson 2) — `column_names[i]`, a real `const char*`,
  is passed directly where `IntegerColumn`'s constructor expects a
  `std::string`; a real, implicit conversion from `const char*` to
  `std::string` happens here (a standard, safe one, unlike this lesson's
  own earlier warning about *user-defined* single-argument conversions
  — `std::string` provides this exact conversion deliberately, as part
  of the standard library's own public interface).
- `real_db->create_table(table_name, std::move(schema));` — reappearing
  exactly (Lesson 5) — the real, already-proven C++ method, called here
  for the first time from code that Python itself triggered.

#### Execution Trace

```text
Iteration 1: i = 0 → column_names[0] = "id", column_types[0] =
             COLUMN_TYPE_INTEGER, because Python's own column_types
             array held 0 at this position — schema.add_column builds
             a real IntegerColumn named "id"
Iteration 2: i = 1 → column_names[1] = "player", column_types[1] =
             COLUMN_TYPE_TEXT, because Python's array held 1 here —
             schema.add_column builds a real TextColumn named "player"
Iteration 3: i = 2 → column_names[2] = "score", column_types[2] =
             COLUMN_TYPE_INTEGER, the same real value as iteration 1 —
             schema.add_column builds a second, separate IntegerColumn,
             named "score" — the loop then ends, because i reaches
             column_count (3)
```

### CS Lens

This is **marshaling**, reappearing exactly (Lesson 1's own `ctypes`
Concept Unit already named it in full) — this time marshaling a real,
*compound* piece of data (a whole schema) across the boundary, not a
single number, using the identical underlying principle: both sides
have to agree on a real, fixed, primitive shape, since nothing richer
survives the crossing.

### SE Lens

Why `const ColumnTypeCode*` (a raw array of small integers) instead of,
say, an array of real, human-readable strings (`"INTEGER"`, `"TEXT"`)?
A raw integer array is smaller, faster to compare (`==` on an `int`
versus comparing whole strings), and — the real, decisive reason — its
possible values are a real, closed, fixed set the C++ side already
enumerates exactly (`COLUMN_TYPE_INTEGER`/`COLUMN_TYPE_TEXT`), so
there's no risk of a typo'd string (`"Integer"`, `"INT"`) silently
failing to match anything. The real cost: Python's own code
(`verify_capi.py`'s own `0`/`1` literals) has to know these exact
numeric values match the C++ side's real `enum` — a real, easy-to-get-
wrong coordination this lesson accepts for now, and Lesson 8's own
`pocketdb` Python package is exactly where that coordination gets
hidden behind a real, safer Python-side interface instead of asking
every caller to remember raw integers.

### Commands Needed

Every command was already shown above, alongside its real output.
`g++ -shared -o pocketdb_engine.dll schema.o row.o table.o database.o database_c_api.o`
links five separately-compiled object files into one real shared
library — reappearing shape (Lesson 3's own multi-object-file linking),
this time producing a `.dll` instead of an `.exe`.

### Run It

Already shown above, in "Introduce the Concept in Isolation" — the real
`ctypes` type inventory — and in "The New Code" — the real, full round
trip, `db handle`/`table count`/`closed`, all genuine values from a
real run.

### Connection

Python can now open a real `Database` and create a real table in it,
through a real, C-compatible boundary — proven, not assumed, with a
real (if temporary) count confirming it. `database_insert` and
`database_get` — crossing real *row data*, not just a schema
definition — are next.

---

## Closing

### Connect the Pieces

`database_open` returns a real, opaque `void*` — proven, in this
lesson's first unit, to survive a real round trip through Python
untouched, with C++ alone knowing what it actually points to.
`database_create_table` then proved the harder problem: describing a
whole `Schema` using only the real primitive types `ctypes` itself
actually has (confirmed directly by listing them) — a `const char*`
table name, parallel `const char**`/`const ColumnTypeCode*` arrays, and
a real `int` count — looped over on the C++ side to build the exact
same real `IntegerColumn`/`TextColumn` objects Lesson 2 already proved
correct, now constructed from data that originated in a completely
separate Python process. A real, temporary diagnostic confirmed the
real table count went from `0` to `1` — proof, not assumption, that
the whole boundary crossing actually worked.

### What Breaks Without This

Try changing `database_create_table`'s parameter from
`const ColumnTypeCode* column_types` to `const char** column_types`
(strings instead of the real enum) without updating the loop's own
`if (column_types[i] == COLUMN_TYPE_INTEGER)` comparison. Recompile,
call it from Python passing real `(ctypes.c_char_p * 3)(b"INTEGER", b"TEXT", b"INTEGER")`
instead of the integer array — read the real compiler error this
produces (comparing a `const char*` against an `int` enum value is not
something the compiler silently allows), restore the original code, and
confirm it compiles and runs correctly again.

### Exercises

- Add a `database_table_count` function to the real, permanent API
  (not a `__debug_`-prefixed throwaway this time) — the real, first
  step toward Lesson 8's Python package needing to know things about
  the database beyond just creating tables.
- Create two real tables from Python, with two different real schemas,
  in the same `database_open()`ed handle. Confirm
  `__debug_table_count` (temporarily restored) reports `2` — proving
  the real `Database` genuinely holds more than one table created this
  way, not just the first one.
- Deliberately pass `column_count = 5` from Python while the real
  `column_names`/`column_types` arrays only actually hold 3 real
  entries. Run it, and — carefully, expecting a real crash or garbage
  values, not a clean error — observe what actually happens; explain,
  in your own words, why nothing on the C++ side can catch this mistake
  on its own, and what real, honest limit that puts on this narrow
  `extern "C"` boundary's own safety.

### Definition of Done

- [ ] `database_c_api.h` and `database_c_api.cpp` (with the debug
      function removed) exist as real files in your own `pocketdb/`
      folder, compiled into a real, updated `pocketdb_engine.dll`.
- [ ] You ran the real opaque-handle proof (`Counter`) yourself, and can
      explain why `void*` — not `Counter*` — is what makes it opaque.
- [ ] You ran the real `ctypes` type-listing command yourself, and can
      name, from memory, why `std::string`/`Schema` can't be one of
      `database_create_table`'s real parameter types.
- [ ] You called `database_create_table` from your own real Python
      script and confirmed, via the temporary debug count, that a real
      table was actually created — not just that the call didn't crash.
- [ ] You can explain, from memory, why `database_open`/`database_close`
      use raw `new`/`delete` instead of `unique_ptr`, referencing this
      lesson's own SE Lens, not just "because it's a handle."
- [ ] Committed with a message stating why: for example,
      `git commit -m "Add the extern C API boundary: open, close, create_table"`.
