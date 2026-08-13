# Lesson 8: Who Frees Memory That Crossed a Boundary?

**What you will build**
`database_get` — the harder direction of crossing the FFI boundary:
returning real, variable-length row data *from* C++ *to* Python, not
just receiving it. This raises a real question Lesson 6/7 never had to
answer: once C++ allocates a real buffer and hands its address to
Python, who is actually responsible for freeing it — and what happens
if `ctypes` is told the wrong thing about what kind of value that
address even is? Both proven directly, including one genuinely wrong,
tempting approach that quietly loses the real pointer forever.

**What you need to know first:** Lesson 6 — opaque handles,
`static_cast`, the `extern "C"` boundary. Lesson 7 — the exception-safe
`try`/`catch` pattern every function in this file now follows.

**Terms introduced in this lesson:** None — this lesson's real subject
is a consequence of `ctypes`' own already-taught behavior (Lesson 1)
meeting a genuinely new situation: a pointer C++ allocates and Python
receives, rather than the reverse.

**Objects and methods used**
- **`std::strcpy`**
  - *What it is:* a real, C-standard-library function, from `<cstring>`
    — copies a null-terminated C string, byte by byte including its own
    terminator, from a source buffer into a destination buffer.
  - *Implementation:* `std::strcpy(destination, source)` — performs no
    bounds checking of its own at all; the destination buffer must
    already be real and large enough, or the copy overruns it — this
    project's own real `new char[joined.size() + 1]`, sized exactly
    from the real source string plus one byte for the terminator, is
    what makes this specific call safe.
  - *Its use:* copying a real `std::string`'s own characters into a
    plain `char*` — the only real shape that can cross the `extern "C"`
    boundary, since `std::string` itself (Lesson 2) cannot.
- **`std::vector<T>::at(index)`**
  - *What it is:* a real, bounds-checked alternative to `operator[]` —
    unlike `container[index]`, which is undefined behavior for an
    out-of-range index (no check, no error, just whatever happens to be
    in memory there), `.at(index)` throws a real `std::out_of_range` if
    `index` isn't actually valid.
  - *Implementation:* `container.at(index)` — identical syntax to a
    function call rather than `[]`, otherwise behaves like `operator[]`
    for any valid index.
  - *Its use:* `Table::rows.at(row_index)`, this lesson's own real
    subject — `row_index` originates from Python, external, untrusted
    input, exactly the situation `.at()`'s real bounds-checking exists
    for, distinct from every earlier use of `[]` in this project so
    far, always on an index this project's own code already knew was
    valid.
- **`ctypes.string_at(address)`**
  - *What it is:* a real `ctypes` function — reads a real,
    null-terminated C string starting at a given raw address, and
    copies it into a genuine, independent Python `bytes` object.
  - *Implementation:* `ctypes.string_at(ptr)` — `ptr` a real address
    (an `int`, or a `ctypes.c_void_p`); returns a new `bytes` object
    holding a real copy of the data — the original C buffer is
    completely untouched, and the returned `bytes` object no longer
    depends on it existing at all.
  - *Its use:* `database_get`'s own real return value, read into a
    genuine, independent Python copy before the original C++ buffer is
    freed.

---

## Concept Unit: Returning Memory Across the Boundary — Who Frees It?

### The Problem

A `database_get` call needs to hand Python a real string, built fresh
on the C++ side (joining a row's real values together) — meaning C++
must allocate real, new memory for it. Lesson 2's own `unique_ptr`
can't help here: ownership needs to cross into Python, and Python has
no way to run a C++ destructor, the identical real reason Lesson 6's
`database_open` used raw `new`. But a string is different from
`database_open`'s opaque handle in one real way: Python needs to
actually *read* this one, not just hold it and hand it back. Does that
change what `ctypes` needs to be told about it?

### Introduce the Concept in Isolation

A real, tempting *wrong* answer first. Save this as `mem_check.cpp`,
in `pocketdb/`:

```cpp
#include <cstring>
#include <string>

extern "C" char* make_greeting(const char* name)
{
    std::string result = "Hello, ";
    result += name;
    result += "!";

    char* buffer = new char[result.size() + 1];
    std::strcpy(buffer, result.c_str());
    return buffer;
}

extern "C" void free_greeting(char* s)
{
    delete[] s;
}
```

Compiled to a shared library:

```bash
g++ -std=c++17 -Wall -shared -o mem_check.dll mem_check.cpp
```

Called the way Lesson 1 already established — `restype = ctypes.c_char_p`,
the same declaration every earlier string-returning call in this
project has used. Save this as `mem_check_wrong.py`:

```python
import ctypes

lib = ctypes.CDLL("./mem_check.dll")
lib.make_greeting.argtypes = [ctypes.c_char_p]
lib.make_greeting.restype = ctypes.c_char_p  # the same declaration used before

result = lib.make_greeting(b"Alice")
print(f"type of result: {type(result)}")
print(f"result: {result}")
```

Run with `python mem_check_wrong.py`. Real output:

```text
type of result: <class 'bytes'>
result: b'Hello, Alice!'
```

*What this proves:* `ctypes.c_char_p` as a `restype` does exactly what
it always has (Lesson 1) — it automatically copies the real C string
into a genuine, independent Python `bytes` object. That's real, correct
behavior *for reading the value* — but it comes at a real, hidden cost:
the *original pointer address* `make_greeting` actually returned is
gone. `result` is a `bytes` object now, with no way to recover the real
heap address `new char[]` allocated — meaning `free_greeting` can never
correctly be called on it. Every single call to `make_greeting` this
way leaks its real buffer, permanently, with no way to fix it after the
fact.

The real fix — tell `ctypes` the return value is a raw address, not an
auto-converted string, and read it separately. Save this as
`mem_check_right.py`:

```python
import ctypes

lib = ctypes.CDLL("./mem_check.dll")
lib.make_greeting.argtypes = [ctypes.c_char_p]
lib.make_greeting.restype = ctypes.c_void_p
lib.free_greeting.argtypes = [ctypes.c_void_p]

raw_ptr = lib.make_greeting(b"Alice")
print(f"raw pointer: {raw_ptr}")

real_bytes = ctypes.string_at(raw_ptr)
print(f"copied into Python: {real_bytes}")

lib.free_greeting(raw_ptr)
print("freed the real C++ buffer")

print(f"Python's own copy still works fine: {real_bytes}")
```

Run with `python mem_check_right.py`. Real output:

```text
raw pointer: 2549863683888
copied into Python: b'Hello, Alice!'
freed the real C++ buffer
Python's own copy still works fine: b'Hello, Alice!'
```

*What this proves:* `restype = ctypes.c_void_p` keeps `raw_ptr` as a
real, plain address — `ctypes.string_at(raw_ptr)` then makes a genuine,
independent copy into `real_bytes`, in Python's own memory. Once that
copy exists, `free_greeting(raw_ptr)` correctly releases the *original*
C++ buffer — and `real_bytes`, printed again afterward, still works
perfectly, because it was never the same memory at all, just a real
copy of its contents.

### Discard the Throwaway Example

`mem_check.cpp`/`.dll`, `mem_check_wrong.py`, and `mem_check_right.py`
are all deleted — they exist only to prove the real contrast:

```bash
rm mem_check.cpp mem_check.dll mem_check_wrong.py mem_check_right.py
```

### Mechanical Walkthrough

- `char* buffer = new char[result.size() + 1];` — real, raw heap
  allocation, reappearing shape (Lesson 6's own `new Database()`) — the
  `+ 1` accounts for the real null terminator every C string needs, not
  counted by `std::string::size()`.
- `std::strcpy(buffer, result.c_str());` — **first appearance.** Copies
  `result`'s real characters, plus its own null terminator, into
  `buffer` — needed because `result` (a `std::string`, Lesson 2) itself
  cannot cross the boundary; only the raw bytes it holds, copied into a
  plain `char*`, can.
- `lib.make_greeting.restype = ctypes.c_char_p` (the wrong version) —
  reappearing exactly (Lesson 1) — correct for reading a value, proven
  here to be the *wrong* choice specifically when the same pointer also
  needs to be freed afterward.
- `lib.make_greeting.restype = ctypes.c_void_p` (the fix) — reappearing
  exactly (Lesson 6's own `DatabaseHandle`) — keeps the real address
  itself accessible, rather than auto-converting it away.
- `ctypes.string_at(raw_ptr)` — covered fully in Objects and methods
  used, above.

### CS Lens

This is the real, concrete distinction between **borrowing** and
**owning** a piece of memory, crossing a real language boundary:
`ctypes.c_char_p`'s automatic copy is correct for *borrowing* — reading
a value whose real lifetime is someone else's responsibility — while
*owning* memory (being the one who must eventually free it) requires
keeping the real, raw address itself, not a copy of its contents alone.
Also recognized in: Rust's own borrow checker distinguishing `&str`
(borrowed) from `String` (owned) at the language level, and any file
API distinguishing "read these bytes" from "you now own this open file
handle and must close it."

### SE Lens

Why does this project's own real `database_get` (next unit) return a
raw `char*` at all, instead of, say, writing the result into a
Python-supplied buffer instead? Returning a freshly-allocated pointer
is simpler to implement correctly on the C++ side — the caller doesn't
need to guess a large-enough buffer size in advance — at the real cost
of exactly the ownership question this unit just answered: every
successful call now creates a real obligation the caller must remember
to fulfill. A buffer-supplied-by-the-caller design avoids that
obligation entirely, at the cost of the caller needing to know (or
guess, and handle being wrong about) the real maximum size needed
ahead of time — a genuine, different tradeoff, not adopted here because
this project's own row data has no fixed maximum size to guess safely.

### Commands Needed

Every command was already shown above, alongside its real output.

### Run It

Already shown above, in "Introduce the Concept in Isolation" — both the
real, silently-lost pointer and the real, correct fix.

### Connection

The real ownership-transfer pattern — `c_void_p`, `string_at`, then an
explicit, matching free call — is proven correct in isolation.
`database_get` applies it to a real row's real values, next.

---

## Concept Unit: `database_get` — Built From a Row's Own Real Values, Freed by a Real, Matching Function

### The Problem

`database_get(db, "games", 0)` needs to return the real first row of a
real table — every one of its real values, joined into something
Python can read — using the exact real ownership pattern this lesson's
first unit just proved, and refusing safely (not crashing) if the real
row index doesn't actually exist.

### Project Change

- **Reference Source:** No reference counterpart — a from-scratch
  addition.
- **Files affected:** `database_c_api.h` (adds two new declarations),
  `database_c_api.cpp` (adds two new functions).
- **Change type:** Add.
- **Dependencies:** `Row::to_string()` — actually, each `Value::to_string()`
  (Lesson 4) — the exception-safe pattern (Lesson 7), this lesson's own
  ownership-transfer pattern.

### The New Code — `database_c_api.h`

Add these two declarations, inside the existing `extern "C" { ... }`
block:

```cpp
char* database_get(DatabaseHandle db, const char* table_name, int row_index);
void database_free_string(char* s);
```

### The New Code — `database_c_api.cpp`

Add `#include <cstring>` at the top of the file, alongside the existing
`#include <stdexcept>`, then add these two functions, after
`database_insert`:

```cpp
char* database_get(DatabaseHandle db, const char* table_name, int row_index)
{
    try
    {
        Database* real_db = static_cast<Database*>(db);
        Table& table = real_db->get_table(table_name);

        const Row& row = table.rows.at(row_index);

        std::string joined;
        for (size_t i = 0; i < row.values.size(); ++i)
        {
            if (i > 0)
            {
                joined += ",";
            }
            joined += row.values[i]->to_string();
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

void database_free_string(char* s)
{
    delete[] s;
}
```

Rebuilt into the real shared library:

```bash
g++ -std=c++17 -Wall -c database_c_api.cpp -o database_c_api.o
g++ -shared -o pocketdb_engine.dll schema.o row.o table.o database.o database_c_api.o
```

Called for real — two rows inserted, both read back correctly, plus
the real, safe out-of-range case. Save this as `verify_get.py`:

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
engine.database_get.argtypes = [ctypes.c_void_p, ctypes.c_char_p, ctypes.c_int]
engine.database_get.restype = ctypes.c_void_p
engine.database_free_string.argtypes = [ctypes.c_void_p]

db = engine.database_open()

names = (ctypes.c_char_p * 3)(b"id", b"player", b"score")
types = (ctypes.c_int * 3)(0, 1, 0)
engine.database_create_table(db, b"games", names, types, 3)

values1 = (ctypes.c_char_p * 3)(b"1", b"Alice", b"100")
engine.database_insert(db, b"games", values1, 3)
values2 = (ctypes.c_char_p * 3)(b"2", b"Bob", b"85")
engine.database_insert(db, b"games", values2, 3)

for i in range(2):
    ptr = engine.database_get(db, b"games", i)
    text = ctypes.string_at(ptr).decode("utf-8")
    print(f"row {i}: {text}")
    engine.database_free_string(ptr)

missing_ptr = engine.database_get(db, b"games", 99)
print(f"out-of-range row pointer: {missing_ptr}")

engine.database_close(db)
print("done, no crash")
```

Run with `python verify_get.py`. Real output:

```text
row 0: 1,'Alice',100
row 1: 2,'Bob',85
out-of-range row pointer: None
done, no crash
```

*What this proves:* both real rows come back correctly, in real
`"value,value,value"` form (`'Alice'`'s own quoting is `TextValue::to_string()`,
Lesson 4, proven again here, unchanged) — freed correctly after each
one is read, per this lesson's own first unit. Row index `99`, real,
genuinely out of range, makes `table.rows.at(99)` throw a real
`std::out_of_range`, caught by the same `try`/`catch` pattern Lesson 7
established, returning a real `nullptr` — which `ctypes`, seeing
`restype = ctypes.c_void_p`, represents as Python's own real `None`,
printed exactly as shown. No crash, no garbage value standing in for
"not found."

### Discard the Throwaway Example

`verify_get.py` is deleted:

```bash
rm verify_get.py
```

`database_c_api.h`/`.cpp`'s two new functions are kept — real,
permanent project files.

### Mechanical Walkthrough

- `const Row& row = table.rows.at(row_index);` — covered fully in
  Objects and methods used, above; `const Row&` (a reference, not a
  copy) — reappearing shape (Lesson 5's own `Database::get_table`
  returning `Table&`) — `Row` cannot be copied at all (Lesson 2's own
  `unique_ptr` chain), so a reference is the only real option here too.
- `std::string joined;` — reappearing exactly (Lesson 2) — built up one
  real value at a time.
- `if (i > 0) { joined += ","; }` — a real, deliberate choice: a comma
  goes *between* values, never before the first or after the last —
  checked by index, not by some other marker.
- `joined += row.values[i]->to_string();` — reappearing shape (Lesson
  4's own polymorphic `to_string()` dispatch) — each real value renders
  itself, whatever real type it actually is.
- `char* result = new char[joined.size() + 1];` / `std::strcpy(result, joined.c_str());` —
  reappearing exactly (this lesson's own first unit).
- `return nullptr;` (inside `catch`) — **first appearance of returning
  `nullptr` as a real, deliberate error signal** — the pointer
  equivalent of `database_create_table`/`database_insert`'s own `-1`
  (Lesson 7), for a function whose real, successful return type is
  already a pointer, not an `int`.

### CS Lens

Returning `nullptr` to signal "no real result" here is the identical
real idea Lesson 7's own `-1` already proved — a **sentinel value**,
reused across two different real return types (`int`, `char*`) for the
identical real purpose: a value from deep inside the function's own
success/failure logic, recognizable at the call site as meaning
something specific by convention, not by its literal value alone.

### SE Lens

Why does `database_get` join every value into *one* comma-separated
string, instead of, say, an array of separate real strings — one per
value, mirroring `database_insert`'s own `const char** values`
parameter shape? Because returning an *array* of newly-allocated
strings would mean Python needs to know how many real elements it
holds (another `count`, the same real reason `database_insert` needed
`value_count`) and would need to free every one of them individually,
not just once — real, additional complexity this lesson's own narrow
scope doesn't yet need. One joined string, freed once, is the simplest
real design that actually gets a row's data across correctly — a real,
deliberate scope decision, not a limitation Python's own `pocketdb`
package (Lesson 9) will need to work around forever; splitting a joined
string back into real, individual values on the Python side is
straightforward, ordinary work.

### Commands Needed

Every command was already shown above, alongside its real output.

### Run It

Already shown above, in "The New Code" — the full, real round trip:
two rows read back correctly, one real, safe `None` for an out-of-range
index.

### Connection

Python can now open a database, create a table, insert real rows, and
read them back — the complete real round trip `README.md`'s own S01
promised from the start, proven end to end. Every piece of it, so far,
has meant hand-writing real `ctypes` boilerplate — `argtypes`,
`restype`, raw pointer management — at every single call site. Wrapping
all of it behind a real, designed Python package, so none of that
machinery leaks into ordinary use, is Lesson 9's own real job.

---

## Closing

### Connect the Pieces

This lesson opened by proving a real, tempting mistake: declaring
`database_get`'s return value as `ctypes.c_char_p`, the same
declaration every earlier string-returning call in this project already
used correctly — proven here to silently and permanently lose the real
pointer needed to free it, the moment reading and owning a value are
actually different real needs. The fix — `c_void_p`, then
`ctypes.string_at()` to make a genuine, independent copy, then an
explicit free call on the original real address — was proven correct in
isolation, then applied directly in `database_get`'s own real
implementation: a row's values, joined with `Value::to_string()`
(Lesson 4), copied into a real, freshly-allocated buffer, and freed by
a matching `database_free_string`. A real, out-of-range row index —
`table.rows.at(99)` — throws a real `std::out_of_range`, caught by
Lesson 7's own exception-safe pattern, returning a real `nullptr` that
`ctypes` itself represents as Python's own `None`. Two real rows,
inserted in Lesson 7, come back out exactly as they went in.

### What Breaks Without This

Already shown directly above: declare `database_get`'s return value as
`ctypes.c_char_p` instead of `c_void_p`, and the real pointer needed to
free the buffer is gone the instant the call returns — every real call
leaks, permanently, with no way to recover afterward. Switching back to
`c_void_p` and reading the value with `ctypes.string_at()` fixes it,
proven with the identical real buffer correctly freed.

### Exercises

- Call `database_get` on a table that was never created (a real,
  missing table name, not just a missing row). Confirm it returns a
  real `nullptr`/`None`, the identical safe path an out-of-range row
  index already proved, both routed through the same
  `Database::get_table` exception this project has relied on since
  Lesson 5.
- Insert a row containing a real comma inside a `TextValue` (a player
  name like `"Smith, John"`) and call `database_get` on it. Read the
  real, joined output and explain, concretely, why this project's own
  simple comma-joining scheme cannot currently tell "a comma inside one
  value" apart from "a comma separating two values" — a real, honest
  limitation worth naming, not silently working around.
- Write a small Python helper function, `get_row(engine, db, table, index)`,
  wrapping the real `database_get`/`ctypes.string_at`/`database_free_string`
  sequence into one real function that returns a plain Python `list` of
  strings (split on `,`) or `None`. This is, in miniature, exactly the
  real job Lesson 9's `pocketdb` package does for every function in
  this API, not just this one.

### Definition of Done

- [ ] `database_get` and `database_free_string` both exist as real,
      permanent functions in your own `database_c_api.h`/`.cpp`.
- [ ] You caused the real, silent pointer loss yourself
      (`ctypes.c_char_p` as `restype`), and fixed it with the real,
      correct `c_void_p`/`string_at`/free pattern.
- [ ] You read two real rows back from your own Python script, in the
      exact order and values they were inserted, and freed each one
      correctly.
- [ ] You confirmed a real, out-of-range row index returns a real,
      safe `None` — not a crash, not garbage data.
- [ ] You can explain, from memory, why `ctypes.c_char_p` was the
      *wrong* choice here even though it's the exact same declaration
      used correctly elsewhere in this project — referencing the real
      difference between borrowing and owning a value, not just
      "because the lesson said so."
- [ ] Committed with a message stating why: for example,
      `git commit -m "Add database_get, proving the correct memory-ownership pattern across the FFI boundary"`.
