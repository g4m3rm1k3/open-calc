# Lesson 13: A File That Proves Its Own Identity

**What you will build**
`DatabaseFileHeader` — the first 16 real bytes of every `.pdb` file
this project will ever create — and `database_open`, changed for the
first time to take a real file path, creating that header if the file
is new, reading and validating it if the file already exists, and
refusing, safely, if the file exists but isn't genuinely a PocketDB
file at all. This is Slice S02a: the real, provable start of on-disk
storage — not yet a single row surviving a restart (S02d), but the
real foundation everything from here through S02d is built on.

**What you need to know first:** Lesson 6 — the `extern "C"` boundary,
opaque handles. Lesson 7 — every `extern "C"` function returning a real
status instead of letting an exception escape.

**Terms introduced in this lesson:**
- **Magic number** — a fixed, known sequence of bytes a file format
  writes at a specific, agreed-upon position (here, the very start),
  existing purely so a program can check "is this genuinely *my* file
  format" before trusting anything else in it.
- **Binary file** — a file read and written as raw bytes, with no
  assumption those bytes represent human-readable text — distinct from
  every file this project has written so far (`.cpp`, `.py`, even the
  earlier throwaway `.txt`-shaped output), which were all real text.
- **Anonymous namespace** — a real, unnamed `namespace { ... }` block;
  everything declared inside it is only reachable from within that same
  source file — a real, file-scoped privacy mechanism, distinct from a
  named `namespace` (which groups names for outside code to reach
  through it, the opposite real purpose).

**Objects and methods used**
- **Fixed-width integer types (`uint32_t`)**
  - *What they are:* real, standard C++ integer types, from
    `<cstdint>`, each guaranteeing an *exact* real bit width —
    `uint32_t` is always exactly 32 bits, unlike plain `int`, whose
    real width the C++ standard only guarantees a *minimum* for, not an
    exact one.
  - *Implementation:* `uint32_t version;` — a real, unsigned 32-bit
    integer; on essentially every real, modern platform this project
    targets, identical in practice to `unsigned int`, but guaranteed
    identical everywhere `<cstdint>` is available, rather than
    incidentally true on this one machine.
  - *Its use:* `DatabaseFileHeader`'s own `version`/`page_size` fields
    — a real file format needs its own fields to have a real, exact,
    guaranteed size; a file written by this project on one machine must
    be readable by this same project on a different one.
- **`std::ifstream` / `std::ofstream`**
  - *What they are:* real, standard C++ classes for reading from and
    writing to real files — `ifstream` ("input file stream") reads;
    `ofstream` ("output file stream") writes.
  - *Implementation:* `std::ifstream in(path, std::ios::binary);` opens
    `path` for real, binary reading; `.read(buffer, count)` reads
    `count` real bytes into `buffer`. `std::ofstream out(path, std::ios::binary);`
    opens for real, binary writing; `.write(buffer, count)` writes
    `count` real bytes from `buffer`.
  - *Its use:* `open_or_create_file`, this lesson's own real subject —
    reading an existing file's real header, or writing a brand-new one.
- **`std::ios::binary`**
  - *What it is:* a real flag, passed when opening a file, telling C++
    not to translate the file's real bytes at all — no line-ending
    conversion, no text encoding assumptions — exactly the bytes on
    disk, exactly the bytes read or written.
  - *Implementation:* `std::ifstream(path, std::ios::binary)` — without
    it, some platforms would silently alter real byte sequences that
    happen to look like text line endings, corrupting a real binary
    file format like this one.
  - *Its use:* every real file this lesson opens — `DatabaseFileHeader`
    is raw bytes, never meant to be read as text.
- **`std::memcpy` / `std::memcmp`**
  - *What they are:* real, C-standard-library functions, from
    `<cstring>` — `memcpy` copies a given number of raw bytes from one
    location to another; `memcmp` compares a given number of raw bytes
    at two locations, byte for byte.
  - *Implementation:* `std::memcpy(header.magic, REAL_MAGIC, 8)` copies
    8 real bytes; `std::memcmp(header.magic, REAL_MAGIC, 8)` returns
    `0` only if all 8 real bytes match exactly.
  - *Its use:* writing the real magic number into a new header, and
    checking an existing file's real magic number against it.
- **`std::runtime_error`**
  - *What it is:* a real, standard exception type from `<stdexcept>` —
    distinct from `std::invalid_argument` (Lesson 4), used for a
    real failure that isn't specifically about an invalid *argument*
    value, but a broader real problem discovered while an operation was
    already running.
  - *Implementation:* `std::runtime_error("message")` — inherits from
    `std::exception` directly (not through `std::logic_error`, the way
    `std::invalid_argument` does), with the identical real `.what()`
    method.
  - *Its use:* `open_or_create_file`, thrown when a real file's magic
    number doesn't match — a real, running-time discovery, not a bad
    argument value.

---

## Concept Unit: Fixed-Width Integers and Real Binary File I/O

### The Problem

A real file format needs an exact, guaranteed byte layout — plain
`int`'s real size isn't guaranteed identical across every real platform
this project might run on, and every file this project has written so
far (`.cpp`, `.py` source) has been real, human-readable text, never
raw bytes read and written directly.

### Introduce the Concept in Isolation

Save this as `header_size_check.cpp`, in `pocketdb/`:

```cpp
#include <iostream>
#include <cstdint>

struct DatabaseFileHeader
{
    char magic[8];
    uint32_t version;
    uint32_t page_size;
};

int main()
{
    std::cout << "sizeof(DatabaseFileHeader) = " << sizeof(DatabaseFileHeader) << std::endl;
}
```

Compiled and run:

```bash
g++ -std=c++17 -Wall -o header_size_check.exe header_size_check.cpp
./header_size_check.exe
```

Real output:

```text
sizeof(DatabaseFileHeader) = 16
```

*What this proves:* `char magic[8]` (8 bytes) plus two real
`uint32_t`s (4 bytes each) really does total exactly 16 bytes, with no
extra, compiler-inserted padding — worth checking directly rather than
assuming, since C++ is allowed to insert padding between struct members
for alignment reasons in general.

Now, real binary I/O — writing this exact struct to a real file, and
reading it back. Save this as `binary_io_check.cpp`:

```cpp
#include <iostream>
#include <fstream>
#include <cstdint>
#include <cstring>

struct DatabaseFileHeader
{
    char magic[8];
    uint32_t version;
    uint32_t page_size;
};

int main()
{
    DatabaseFileHeader header;
    std::memcpy(header.magic, "POCKETDB", 8);
    header.version = 1;
    header.page_size = 4096;

    std::ofstream out("test.pdb", std::ios::binary);
    out.write(reinterpret_cast<const char*>(&header), sizeof(header));
    out.close();

    DatabaseFileHeader read_back;
    std::ifstream in("test.pdb", std::ios::binary);
    in.read(reinterpret_cast<char*>(&read_back), sizeof(read_back));
    in.close();

    std::cout << "magic: " << std::string(read_back.magic, 8) << std::endl;
    std::cout << "version: " << read_back.version << std::endl;
    std::cout << "page_size: " << read_back.page_size << std::endl;
}
```

Compiled and run:

```bash
g++ -std=c++17 -Wall -o binary_io_check.exe binary_io_check.cpp
./binary_io_check.exe
```

Real output:

```text
magic: POCKETDB
version: 1
page_size: 4096
```

Real, direct proof the file itself holds exactly what was written —
not just trusting the program's own read-back:

```bash
xxd test.pdb
```

Real output — the exact 16 real bytes, shown as hexadecimal and (where
printable) as real text side by side:

```text
00000000: 504f 434b 4554 4442 0100 0000 0010 0000  POCKETDB........
```

*What this proves:* `POCKETDB` really is stored as its own real ASCII
bytes (`50 4f 43 4b 45 54 44 42`), followed by `version` (`01 00 00 00`
— `1`, stored least-significant-byte-first, a real, platform-specific
detail called endianness) and `page_size` (`00 10 00 00` — `4096` in
hexadecimal is `0x1000`, matching the real bytes shown). This is called
a **binary file** — a real file whose meaning comes entirely from a
known, fixed byte layout, not from being read as text.

### Discard the Throwaway Example

`header_size_check.cpp`/`.exe`, `binary_io_check.cpp`/`.exe`, and
`test.pdb` are all deleted:

```bash
rm header_size_check.cpp header_size_check.exe
rm binary_io_check.cpp binary_io_check.exe test.pdb
```

### Mechanical Walkthrough

- `char magic[8];` — a real, fixed-size array of 8 `char`s — not a
  `std::string` (which cannot cross the `extern "C"` boundary, Lesson
  6, and whose own real length can vary, wrong for a fixed-layout
  header).
- `uint32_t version;` / `uint32_t page_size;` — covered fully in
  Objects and methods used, above.
- `std::memcpy(header.magic, "POCKETDB", 8)` — covered fully in Objects
  and methods used; `"POCKETDB"` is a real string literal, 8 characters
  exactly matching `magic`'s own real size (a 9th, implicit null
  terminator C++ string literals normally carry is deliberately not
  copied here — only the real 8 bytes `magic` actually holds).
- `std::ofstream out("test.pdb", std::ios::binary);` — covered fully in
  Objects and methods used.
- `out.write(reinterpret_cast<const char*>(&header), sizeof(header));` —
  **first appearance of `reinterpret_cast`.** `.write` expects a
  `const char*` — a pointer to bytes — but `&header` is a
  `DatabaseFileHeader*`; `reinterpret_cast` tells the compiler "treat
  this pointer's real bits as this different, unrelated type instead,"
  the one real cast built specifically for this: viewing an object's
  real, underlying bytes as raw `char`s, with no actual conversion
  happening, only a different real *view* of the identical bytes.
- `in.read(reinterpret_cast<char*>(&read_back), sizeof(read_back));` —
  reappearing shape, the identical real cast, reading real bytes
  directly into `read_back`'s own real memory.
- `std::string(read_back.magic, 8)` — reappearing shape (Lesson 2's own
  `std::string` — a different real constructor this time: builds a
  `std::string` from exactly 8 real characters starting at
  `read_back.magic`, rather than from a null-terminated C string).

### CS Lens

This is **serialization** — turning a real, in-memory object's own
bits into a real, storable sequence of bytes, and **deserialization** —
the exact reverse. Also recognized in: every real network protocol
(bytes sent over a socket must be serialized the same way), every real
image or audio file format, and — a repo-internal comparison worth
naming directly — `pocket-inventory-wpf`'s own JSON export, a
*text*-based serialization of the identical underlying idea, contrasted
directly here with a *binary* one.

### SE Lens

Why store `version` and `page_size` as real, raw binary integers
instead of, say, real text (`"version=1\npage_size=4096\n"`)? A real
text header would be more human-readable (open the file in any text
editor, read it directly) — a genuine, real advantage. The real cost
accepted here: text requires real *parsing* (splitting on `=`, `\n`,
converting text digits back into a real number, all real, extra work
and real, extra ways to get it wrong) every single time the file opens,
where a raw binary header is read with one real `.read()` call, no
parsing at all. A real database's own file header, read on every single
`open()`, is exactly the kind of place that real, repeated cost matters
enough to accept giving up human-readability for it.

### Commands Needed

Every command was already shown above, alongside its real output.
`xxd` (or `od -A x -t x1z` where `xxd` isn't available) shows a real
file's raw bytes as hexadecimal — a real, standard way to inspect any
binary file directly, not specific to this project.

### Run It

Already shown above, in "Introduce the Concept in Isolation" — both the
real struct size and the real, byte-for-byte file contents.

### Connection

A `DatabaseFileHeader` can now be written to, and read back from, a
real file. `database_open` itself, changed to actually use this header
— creating one for a new file, validating one for an existing file, and
refusing a file that fails validation — is next.

---

## Concept Unit: `database_open` Grows a Real File

### The Problem

`database_open()` (Lessons 6 through 12) has never taken a real file
path at all — every `Database` it returned was purely in-memory, gone
the instant `database_close` ran. `database_open` needs to become the
real, single place a `.pdb` file's own identity gets established or
checked — created fresh if the path doesn't exist yet, validated if it
does, and refused, safely, if it exists but isn't genuinely a PocketDB
file.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `file_header.h` (new), `file_header.cpp` (new),
  `database_c_api.h` (modified — `database_open`'s own signature
  changes), `database_c_api.cpp` (modified).
- **Change type:** Add (`file_header.*`) and refactor
  (`database_c_api.*` — `database_open`'s real behavior grows, its
  existing callers all need a real path now).
- **Dependencies:** This lesson's own first unit.

### The New Code — `file_header.h`

Save this as `file_header.h`:

```cpp
#ifndef FILE_HEADER_H
#define FILE_HEADER_H

#include <cstdint>
#include <string>

struct DatabaseFileHeader
{
    char magic[8];
    uint32_t version;
    uint32_t page_size;
};

DatabaseFileHeader open_or_create_file(const std::string& path);

#endif
```

### The New Code — `file_header.cpp`

Save this as `file_header.cpp`:

```cpp
#include <fstream>
#include <cstring>
#include <stdexcept>
#include "file_header.h"

namespace
{
    const char REAL_MAGIC[8] = {'P', 'O', 'C', 'K', 'E', 'T', 'D', 'B'};
    const uint32_t CURRENT_VERSION = 1;
    const uint32_t DEFAULT_PAGE_SIZE = 4096;
}

DatabaseFileHeader open_or_create_file(const std::string& path)
{
    std::ifstream existing(path, std::ios::binary);
    if (existing.good())
    {
        DatabaseFileHeader header;
        existing.read(reinterpret_cast<char*>(&header), sizeof(header));
        existing.close();

        if (std::memcmp(header.magic, REAL_MAGIC, 8) != 0)
        {
            throw std::runtime_error("Not a real PocketDB file: bad magic number");
        }
        return header;
    }

    DatabaseFileHeader header;
    std::memcpy(header.magic, REAL_MAGIC, 8);
    header.version = CURRENT_VERSION;
    header.page_size = DEFAULT_PAGE_SIZE;

    std::ofstream out(path, std::ios::binary);
    out.write(reinterpret_cast<const char*>(&header), sizeof(header));
    out.close();

    return header;
}
```

### The Updated Project — `database_c_api.h`

`database_open`'s own real declaration changes:

```cpp
DatabaseHandle database_open(const char* path);                            // ← changed (was database_open())
```

### The Updated Project — `database_c_api.cpp`

```cpp
#include <cstring>                                                         // ← unchanged
#include <stdexcept>                                                       // ← unchanged
#include "database_c_api.h"                                                // ← unchanged
#include "database.h"                                                      // ← unchanged
#include "file_header.h"                                                   // ← new

extern "C" {

DatabaseHandle database_open(const char* path)                            // ← changed
{
    try                                                                   // ← new
    {
        open_or_create_file(path);                                        // ← new
        return new Database();                                           // ← unchanged (still in-memory, for now — S02d changes this)
    }
    catch (const std::exception&)                                        // ← new
    {
        return nullptr;                                                  // ← new
    }
}
```

Every other function in `database_c_api.cpp` (`database_close`,
`database_create_table`, `database_insert`, `database_get`) is
unchanged from Lesson 8.

Proven for real — a fresh file created, the same file reopened and
validated, and a real, deliberately invalid file rejected safely. Save
this as `verify_s02a.py`:

```python
import ctypes

engine = ctypes.CDLL("./pocketdb_engine.dll")
engine.database_open.argtypes = [ctypes.c_char_p]
engine.database_open.restype = ctypes.c_void_p
engine.database_close.argtypes = [ctypes.c_void_p]

db1 = engine.database_open(b"real.pdb")
print(f"first open (creates file): {db1}")
engine.database_close(db1)

db2 = engine.database_open(b"real.pdb")
print(f"second open (reads existing file): {db2}")
engine.database_close(db2)

with open("bad.pdb", "wb") as f:
    f.write(b"not a real pocketdb file at all")

db3 = engine.database_open(b"bad.pdb")
print(f"open on a bad file: {db3}")
```

Run with `python verify_s02a.py`. Real output:

```text
first open (creates file): 1535392665408
second open (reads existing file): 1535392665728
open on a bad file: None
```

Real, direct proof of the file itself:

```bash
xxd real.pdb
```

Real output:

```text
00000000: 504f 434b 4554 4442 0100 0000 0010 0000  POCKETDB........
```

*What this proves:* the first `database_open` call genuinely created a
new, real, valid `.pdb` file — proven directly by its own real bytes,
identical to this lesson's own first unit. The second call, against the
now-existing file, read and validated it correctly, returning a real,
different handle (a new, separate in-memory `Database` — S02a doesn't
persist table data yet, only the file's own identity). The third call,
against a real file that plainly isn't a PocketDB file, correctly
returned a real `nullptr` — `ctypes` showing it as `None` — instead of
crashing or silently treating garbage bytes as a real header.

### Discard the Throwaway Example

`verify_s02a.py`, `real.pdb`, and `bad.pdb` are deleted:

```bash
rm verify_s02a.py real.pdb bad.pdb
```

`file_header.h`/`.cpp` and the updated `database_c_api.h`/`.cpp` are
kept — real, permanent project files. `pocketdb.py`'s own `Database.__init__`
does not yet pass a real path through — that update is next lesson's
own real subject, alongside S02b's page manager.

### Mechanical Walkthrough

- `namespace { ... }` — **first appearance of an anonymous namespace.**
  Everything inside it (`REAL_MAGIC`, `CURRENT_VERSION`,
  `DEFAULT_PAGE_SIZE`) is only reachable from within `file_header.cpp`
  itself — a real, file-scoped privacy mechanism, distinct from
  `static`, doing a related real job at file scope instead of class
  scope.
- `std::ifstream existing(path, std::ios::binary);` /
  `existing.good()` — covered fully in Objects and methods used;
  `.good()` is a real, boolean check — true only if the real file
  actually opened successfully, false if `path` doesn't exist (or
  can't be opened for some other real reason).
- The rest of `open_or_create_file` reappears exactly from this
  lesson's own first unit — the identical real read/validate/create
  logic, now living in a real, permanent project file instead of a
  throwaway proof.
- `open_or_create_file(path);` (inside `database_open`) — the return
  value is deliberately discarded here — `database_open` only needs to
  know *whether* this succeeded (did it throw or not), not the real
  header's own contents, yet.

### CS Lens

Checking a real magic number before trusting anything else in a file is
called **format validation** — refusing to interpret data as a
specific format until its own real identity is confirmed. Also
recognized in: every real image format (PNG's own magic bytes,
`89 50 4E 47`), every real executable format (`MZ` for Windows `.exe`
files, `\x7fELF` for Linux), and ZIP files — all real formats that
would silently misbehave, or crash, if a program trusted their contents
without checking this first.

### SE Lens

Why does `open_or_create_file` throw a real `std::runtime_error` for a
bad magic number, rather than, say, silently overwriting the bad file
with a fresh, valid header? Overwriting would silently destroy
whatever real file was actually there — possibly a real, important file
that just happens to share this project's own chosen filename, not a
corrupted PocketDB file at all. Refusing loudly, the same real
exception-safe discipline Lesson 7 already established, is the only
real, safe default when a program genuinely cannot tell "this is my
corrupted file" apart from "this is someone else's completely
unrelated file."

### Commands Needed

Every command was already shown above, alongside its real output.

### Run It

Already shown above, in "The Updated Project" — the full, real
create/reopen/reject sequence, plus the real file bytes.

### Connection

Every `.pdb` file now proves its own real identity before anything else
about it is trusted. The header says the real page size is `4096` — but
nothing yet actually divides the rest of the file into real pages.
S02b, next, builds the real page manager: allocating, reading, and
writing fixed-size pages by their own real ID.

---

## Closing

### Connect the Pieces

This lesson's first unit proved `DatabaseFileHeader`'s real, exact
16-byte layout, and that writing it to a real file and reading it back
produces byte-for-byte identical data — confirmed directly with `xxd`,
not just trusted from the program's own printed output. The second unit
wired that same real logic into `database_open`, now taking a real file
path: the first real call creates a genuinely new, valid `.pdb` file;
the second, against the same path, reads and validates the identical
real header; a third, against a file that plainly isn't a PocketDB
file, safely returns `nullptr` instead of crashing — proven directly
from real Python, with `ctypes` itself representing that failure as
`None`.

### What Breaks Without This

Already shown directly above: open a real, existing file whose first 8
bytes aren't the real magic number, and `open_or_create_file` throws;
caught by `database_open`'s own `try`/`catch`, this becomes a real,
safe `nullptr`/`None` instead of either crashing or silently trusting
garbage data as a real header.

### Exercises

- Add a real check inside `open_or_create_file`: if an existing file's
  real `header.version` doesn't match `CURRENT_VERSION`, throw a
  different, real, specific message ("Unsupported file version") rather
  than silently accepting a version this project's own code was never
  written to handle.
- Deliberately create a file exactly 8 bytes long, containing only the
  real magic number and nothing else (no version, no page size). Open
  it with `database_open` and observe what actually happens — read
  past the end of a real file is genuinely undefined behavior; explain,
  concretely, why this project's own current code doesn't yet check the
  real file's length before reading a fixed 16 bytes from it.
- Using `xxd` (or a hex editor), open a real `.pdb` file this project
  created and manually change one byte of the real magic number, saving
  the file. Confirm `database_open` now correctly refuses it — real,
  direct proof the validation checks every real byte, not just some of
  them.

### Definition of Done

- [ ] `file_header.h`/`.cpp` exist as real, permanent files in your own
      `pocketdb/` folder, and `database_open` now takes a real file
      path.
- [ ] You created a real `.pdb` file, inspected its real bytes with
      `xxd`, and confirmed the magic number, version, and page size
      match exactly what this lesson predicted.
- [ ] You reopened the same real file and confirmed it validates
      correctly — no exception, a real, working handle returned.
- [ ] You caused the real rejection yourself, opening a file that isn't
      a real PocketDB file, and confirmed it returns `nullptr`/`None`
      instead of crashing.
- [ ] You can explain, from memory, why a magic number exists at all,
      referencing this lesson's own CS Lens, not just "to check the
      file."
- [ ] Committed with a message stating why: for example,
      `git commit -m "Add the real file header: magic number, version, page size"`.
