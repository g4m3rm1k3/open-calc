# Lesson 14: A Page That Remembers What Comes After It

**What you will build**
`PageManager` — the real, permanent owner of every `.pdb` file's own
bytes past the header: fixed-size, 4 KiB pages, each addressed only by
a real, numeric page ID, allocated by growing the file when needed —
and, once a page is no longer needed, a real free-list letting a later
allocation reuse it instead of growing the file forever. Exposed
through its own real `extern "C"` surface, and proven correct from
real Python, before `Table`/`Database` ever depend on it (S02d).

**What you need to know first:** Lesson 13 — `DatabaseFileHeader`, real
binary file I/O, `database_open`'s own real path/validation logic
(`open_or_create_file`, retired this lesson — see this lesson's own
Project Change for why).

**Terms introduced in this lesson:** None — this lesson's real subject
is entirely real classes and real standard-library I/O, covered fully
in Objects and methods used, below.

**Objects and methods used**
- **`std::memset`**
  - *What it is:* a real, standard C function zero-filling (or
    filling with any given byte) a raw block of memory.
  - *Implementation:* `std::memset(data0, 0, PAGE_SIZE);` sets every
    one of `PAGE_SIZE`'s real bytes to `0`, before a shorter real
    string is copied into the front of it.
  - *Its use:* guarantees a page's own unused, trailing bytes are real,
    predictable zeros rather than leftover, uninitialized memory —
    used both in this lesson's own throwaway proofs and in
    `page_manager_c_api.cpp`'s real `write_page` wrapper.
- **`std::numeric_limits<T>::max()`**
  - *What it is:* a real, standard way to get a given type's own real
    maximum representable value, without hardcoding it.
  - *Implementation:* `std::numeric_limits<uint32_t>::max()` — the
    real, largest value a `uint32_t` can hold (`4294967295`), used as
    this lesson's own `NO_FREE_PAGE` sentinel.
  - *Its use:* marks `free_list_head` as "no free page" without
    reusing `0` (a real, otherwise-valid page ID) or any other
    plausible page number as a fake, ambiguous sentinel.
- **`std::fstream`**
  - *What it is:* a real C++ standard-library class supporting *both*
    reading and writing on the same real, open file — distinct from
    `std::ifstream`/`std::ofstream` (Lesson 13), each of which only
    supports one direction.
  - *Implementation:* `std::fstream file(path, std::ios::binary | std::ios::in | std::ios::out);`
    opens a real, existing file for both real reading and writing at
    once; `std::ios::in` alone fails on a file that doesn't exist yet,
    which is why `PageManager`'s own constructor creates a brand-new
    file with a real, separate `std::ofstream` first, then reopens it
    as an `fstream`.
  - *Its use:* `PageManager`'s own real, single, persistent file
    handle — kept open for as long as the `PageManager` itself exists,
    rather than opened and closed for every single page operation.
- **`.seekg(pos)` / `.seekp(pos)`**
  - *What they are:* real methods moving a file stream's own internal
    "current position" — `seekg` for the next real read, `seekp` for
    the next real write — to an exact, given byte offset.
  - *Implementation:* `file.seekp(page_offset(page_id));` moves the
    real write position to exactly where that page's own real bytes
    begin, before the next `.write(...)` call.
  - *Its use:* every real page read or write this lesson performs —
    `PageManager` never reads or writes sequentially from wherever the
    stream happens to already be; it always seeks to a real, computed
    offset first.
- **`PageManager`**
  - *What it is:* this lesson's own real subject — owns a `.pdb`
    file's real, open handle, its in-memory copy of the real header,
    and every real page operation (`allocate_page`, `free_page`,
    `write_page`, `read_page`).
  - *Implementation:* a real C++ class; its constructor absorbs and
    extends Lesson 13's own `open_or_create_file` logic — creating a
    fresh header for a new file, or reading and validating an existing
    one — but keeps the real file open afterward, rather than closing
    it.
  - *Its use:* the real, single owner of a `.pdb` file's own page-level
    storage — `Table`/`Database` (S02d) will hold and use one, rather
    than reading or writing raw bytes themselves.

---

## Concept Unit: Allocating and Addressing Real, Fixed-Size Pages

### The Problem

`database_open` (Lesson 13) reads and validates a real 16-byte header,
then does nothing else with the rest of the file. A real database needs
a real way to carve the rest of a `.pdb` file into fixed-size, 4 KiB
pages, each one addressable purely by a real, numeric ID — and a real
way to allocate a brand-new page when one is needed.

### Introduce the Concept in Isolation

Save this as `page_alloc_check.cpp`, in `pocketdb/`:

```cpp
#include <iostream>
#include <fstream>
#include <cstdint>
#include <cstring>

const uint32_t PAGE_SIZE = 4096;
const uint32_t HEADER_SIZE = 16;

uint32_t page_offset(uint32_t page_id)
{
    return HEADER_SIZE + page_id * PAGE_SIZE;
}

int main()
{
    std::remove("alloc.pdb");

    std::ofstream create("alloc.pdb", std::ios::binary);
    char header[HEADER_SIZE] = {0};
    create.write(header, HEADER_SIZE);
    create.close();

    std::fstream file("alloc.pdb", std::ios::binary | std::ios::in | std::ios::out);

    uint32_t page_count = 0;

    uint32_t page0 = page_count++;
    file.seekp(page_offset(page0));
    char data0[PAGE_SIZE];
    std::memset(data0, 0, PAGE_SIZE);
    std::strcpy(data0, "first page");
    file.write(data0, PAGE_SIZE);

    uint32_t page1 = page_count++;
    file.seekp(page_offset(page1));
    char data1[PAGE_SIZE];
    std::memset(data1, 0, PAGE_SIZE);
    std::strcpy(data1, "second page");
    file.write(data1, PAGE_SIZE);

    file.flush();

    char read_buf[PAGE_SIZE];
    file.seekg(page_offset(page0));
    file.read(read_buf, PAGE_SIZE);
    std::cout << "page 0: " << read_buf << std::endl;

    file.seekg(page_offset(page1));
    file.read(read_buf, PAGE_SIZE);
    std::cout << "page 1: " << read_buf << std::endl;

    std::cout << "page_count: " << page_count << std::endl;
    file.close();
}
```

Compiled and run:

```bash
g++ -std=c++17 -Wall -o page_alloc_check.exe page_alloc_check.cpp
./page_alloc_check.exe
```

Real output:

```text
page 0: first page
page 1: second page
page_count: 2
```

Real, direct proof of the file's own real size:

```bash
ls -la alloc.pdb
```

Real output:

```text
-rw-r--r-- 1 g4m3r 197610 8208 Aug 13 04:27 alloc.pdb
```

*What this proves:* `8208` real bytes — exactly `16` (the header) plus
two real `4096`-byte pages — proving `page_offset` really does place
each page at its own exact, correct, non-overlapping real location, and
`file.seekp(...)`/`.seekg(...)` really do move the real read/write
position to it before each operation.

### Discard the Throwaway Example

```bash
rm page_alloc_check.cpp page_alloc_check.exe alloc.pdb
```

### Mechanical Walkthrough

- `uint32_t page_offset(uint32_t page_id)` — a real, free function
  (not a class method yet, in this throwaway proof) computing a page's
  exact real byte offset: the header's own size, plus `page_id` real
  pages' worth of bytes before it.
- `std::fstream file(path, std::ios::binary | std::ios::in | std::ios::out);` —
  covered fully in Objects and methods used, above; `|` here combines
  three real flags into one — open for binary, real reading, *and* real
  writing, all at once.
- `file.seekp(page_offset(page0));` — covered fully in Objects and
  methods used.
- `file.write(data0, PAGE_SIZE);` — reappearing exactly (Lesson 13) —
  writes exactly `PAGE_SIZE` real bytes, starting at wherever `seekp`
  just moved to.
- `file.seekg(page_offset(page0));` / `file.read(read_buf, PAGE_SIZE);` —
  the identical real pattern, reading instead of writing.

### CS Lens

Computing a real byte offset directly from a page's own ID — no lookup
table, no searching — is called **direct addressing**: given any real
page ID, its exact real location is computed in real constant time.
Also recognized in: an ordinary array's own indexing (`arr[i]` computes
`i * sizeof(element)` the identical real way), and how a real
operating system translates a virtual memory address into a real
physical one.

### SE Lens

Why a *fixed* page size (`4096` for every real page, no exceptions),
instead of letting each page be exactly as large as whatever it needs
to hold? A fixed size is what makes `page_offset`'s own real formula
possible at all — direct addressing depends on every page occupying
identically-sized real space; a variable page size would mean the
offset of page `N` depends on the real sizes of every page before it,
turning a real constant-time computation into a real, linear scan. The
cost: a page holding less than `4096` real bytes of actual data still
occupies the full `4096` on disk — real, wasted space this project
accepts, the same real tradeoff fixed-size pages make in every real
database that uses them.

### Commands Needed

Every command was already shown above, alongside its real output.

### Run It

Already shown above, in "Introduce the Concept in Isolation."

### Connection

A page can now be allocated by growing the file. A real database can't
only grow forever, though — once a page's own data is deleted, that
page's real space needs to become reusable. The free-list, next, is how.

---

## Concept Unit: The Free-List — Reusing a Page Instead of Growing Forever

### The Problem

If every `allocate_page` call only ever grows the file, a `.pdb` file
would only ever get larger, even after real data is deleted and a page
genuinely has nothing left in it. A real way to mark a page "free," and
have the *next* allocation reuse it instead of growing the file again,
is needed.

### Introduce the Concept in Isolation

Save this as `free_list_check.cpp`:

```cpp
#include <iostream>
#include <fstream>
#include <cstdint>
#include <cstring>
#include <limits>

const uint32_t PAGE_SIZE = 4096;
const uint32_t HEADER_SIZE = 16;
const uint32_t NO_FREE_PAGE = std::numeric_limits<uint32_t>::max();

uint32_t page_offset(uint32_t page_id)
{
    return HEADER_SIZE + page_id * PAGE_SIZE;
}

int main()
{
    std::remove("freelist.pdb");
    std::ofstream create("freelist.pdb", std::ios::binary);
    char header[HEADER_SIZE] = {0};
    create.write(header, HEADER_SIZE);
    create.close();

    std::fstream file("freelist.pdb", std::ios::binary | std::ios::in | std::ios::out);

    uint32_t page_count = 0;
    uint32_t free_list_head = NO_FREE_PAGE;

    uint32_t page0 = page_count++;
    uint32_t page1 = page_count++;
    uint32_t page2 = page_count++;
    std::cout << "allocated: " << page0 << ", " << page1 << ", " << page2 << std::endl;

    file.seekp(page_offset(page1));
    file.write(reinterpret_cast<const char*>(&free_list_head), sizeof(free_list_head));
    free_list_head = page1;
    std::cout << "freed page " << page1 << ", free_list_head = " << free_list_head << std::endl;

    uint32_t reused;
    if (free_list_head != NO_FREE_PAGE)
    {
        reused = free_list_head;
        file.seekg(page_offset(reused));
        uint32_t next_free;
        file.read(reinterpret_cast<char*>(&next_free), sizeof(next_free));
        free_list_head = next_free;
    }
    else
    {
        reused = page_count++;
    }
    std::cout << "reused page: " << reused << ", new free_list_head: " << free_list_head << std::endl;
    std::cout << "page_count still: " << page_count << std::endl;

    file.close();
}
```

Compiled and run:

```bash
g++ -std=c++17 -Wall -o free_list_check.exe free_list_check.cpp
./free_list_check.exe
```

Real output:

```text
allocated: 0, 1, 2
freed page 1, free_list_head = 1
reused page: 1, new free_list_head: 4294967295
page_count still: 3
```

*What this proves:* freeing page `1` writes `free_list_head`'s
*previous* real value (`NO_FREE_PAGE`, `4294967295` — `UINT32_MAX`,
the real sentinel meaning "no free pages") into page `1`'s own first 4
real bytes, then points `free_list_head` at page `1` itself. The next
allocation correctly reads that stored value back out of page `1`,
reuses page `1` itself (not a brand-new page `3`), and restores
`free_list_head` to `NO_FREE_PAGE` — proven directly by `page_count`
staying at `3`, not growing to `4`. This is called a **free-list**: a
real linked list of reusable pages, stored *inside the freed pages
themselves* — no separate real data structure needed to remember which
pages are free.

### Discard the Throwaway Example

```bash
rm free_list_check.cpp free_list_check.exe freelist.pdb
```

### Mechanical Walkthrough

- `const uint32_t NO_FREE_PAGE = std::numeric_limits<uint32_t>::max();` —
  **first appearance of `std::numeric_limits`.** A real, standard way
  to get a type's own real maximum value — `UINT32_MAX`, used here as a
  real sentinel meaning "there is no free page," chosen because it's an
  otherwise-real-but-absurd page ID (a file would need to be roughly 16
  billion real pages, ~64 TB, before ID `4294967295` could ever be a
  genuinely allocated page).
- `file.write(reinterpret_cast<const char*>(&free_list_head), sizeof(free_list_head));` —
  reappearing shape (Lesson 13's own `reinterpret_cast` pattern) —
  writes the *current* `free_list_head` value into the page being
  freed, before overwriting `free_list_head` itself.
- `free_list_head = page1;` — the real, second half of freeing a page:
  after page `1` now holds the *old* head, `free_list_head` itself
  becomes page `1` — the new, real head of the list.
- `if (free_list_head != NO_FREE_PAGE) { ... } else { ... }` — the real
  branch every `allocate_page` call makes: reuse a real, freed page if
  one exists, or grow the file if none do.

### CS Lens

This is a real **linked list**, with a real, notable twist: instead of
separate, independently-allocated nodes each pointing to the next
(the usual, in-memory shape), each real "node" *is* an already-existing
page, and the "pointer" to the next one is stored inside that same
page's own first 4 real bytes — no extra real memory or disk space
needed beyond the pages already being tracked. Also recognized in: a
real memory allocator's own free list (recycled heap blocks, chained
the identical way), and an operating system's own free-block list for
unused disk sectors.

### SE Lens

Why store the free-list's own "next" pointer *inside* the freed page,
rather than in a real, separate table (a `std::vector<uint32_t>` of
free page IDs, say, kept in the header)? A separate table has its own
real, growing size problem — the more pages get freed, the larger that
table needs to be, and it would need its own real persistence strategy.
Storing the "next" pointer inside the freed page itself costs nothing
extra: a freed page's own real contents don't matter anymore (nothing
else is using them), so its first 4 bytes are free real space to reuse
for exactly this purpose. The real cost: a freed page's very first 4
bytes are now off-limits to store anything else until that page is
reallocated — a real, deliberate, standard tradeoff, not a bug.

### Commands Needed

Every command was already shown above, alongside its real output.

### Run It

Already shown above, in "Introduce the Concept in Isolation."

### Connection

Both real mechanisms — direct-addressed allocation and a self-hosted
free-list — are proven correct in isolation. `PageManager`, the real,
permanent class combining both with Lesson 13's own header logic, is
next.

---

## Concept Unit: `PageManager` — the Real, Permanent Page Owner

### The Problem

Lesson 13's own `open_or_create_file` reads a real header once and
returns — it never keeps the file open, and the header itself doesn't
yet track a real page count or a real free-list. A real class is needed
that opens a `.pdb` file exactly once, keeps it open for as long as
it's needed, and exposes real `allocate_page`/`free_page`/`write_page`/
`read_page` operations against it.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `file_header.h` (modified — two new real fields),
  `file_header.cpp` (**deleted** — `open_or_create_file` is retired,
  its real logic absorbed into `PageManager`'s own constructor),
  `page_manager.h` (new), `page_manager.cpp` (new),
  `page_manager_c_api.h` (new), `page_manager_c_api.cpp` (new),
  `database_c_api.cpp` (modified — one call site updated; see below).
- **Change type:** Refactor (`file_header.*`, `database_c_api.cpp`) and
  add (`page_manager.*`).
- **Dependencies:** This lesson's own first two units.

### The New Code — `file_header.h`, Extended

```cpp
#ifndef FILE_HEADER_H
#define FILE_HEADER_H

#include <cstdint>
#include <limits>

struct DatabaseFileHeader
{
    char magic[8];
    uint32_t version;
    uint32_t page_size;
    uint32_t page_count;                                                  // ← new
    uint32_t free_list_head;                                              // ← new
};

const uint32_t NO_FREE_PAGE = std::numeric_limits<uint32_t>::max();       // ← new

#endif
```

`file_header.cpp` is deleted entirely — delete it now:

```bash
rm file_header.cpp
```

### The New Code — `page_manager.h`

```cpp
#ifndef PAGE_MANAGER_H
#define PAGE_MANAGER_H

#include <fstream>
#include <string>
#include <cstdint>
#include "file_header.h"

class PageManager
{
public:
    explicit PageManager(const std::string& path);

    uint32_t allocate_page();
    void free_page(uint32_t page_id);
    void write_page(uint32_t page_id, const char* data);
    void read_page(uint32_t page_id, char* buffer);

private:
    std::fstream file;
    DatabaseFileHeader header;

    void write_header();
    uint32_t page_offset(uint32_t page_id) const;
};

#endif
```

### The New Code — `page_manager.cpp`

```cpp
#include <cstring>
#include <stdexcept>
#include "page_manager.h"

namespace
{
    const char REAL_MAGIC[8] = {'P', 'O', 'C', 'K', 'E', 'T', 'D', 'B'};
    const uint32_t CURRENT_VERSION = 2;
    const uint32_t DEFAULT_PAGE_SIZE = 4096;
}

PageManager::PageManager(const std::string& path)
{
    std::ifstream existing(path, std::ios::binary);
    bool file_exists = existing.good();
    existing.close();

    if (!file_exists)
    {
        std::memcpy(header.magic, REAL_MAGIC, 8);
        header.version = CURRENT_VERSION;
        header.page_size = DEFAULT_PAGE_SIZE;
        header.page_count = 0;
        header.free_list_head = NO_FREE_PAGE;

        std::ofstream create(path, std::ios::binary);
        create.write(reinterpret_cast<const char*>(&header), sizeof(header));
        create.close();
    }

    file.open(path, std::ios::binary | std::ios::in | std::ios::out);

    if (file_exists)
    {
        file.read(reinterpret_cast<char*>(&header), sizeof(header));
        if (std::memcmp(header.magic, REAL_MAGIC, 8) != 0)
        {
            throw std::runtime_error("Not a real PocketDB file: bad magic number");
        }
    }
}

uint32_t PageManager::page_offset(uint32_t page_id) const
{
    return sizeof(DatabaseFileHeader) + page_id * header.page_size;
}

void PageManager::write_header()
{
    file.seekp(0);
    file.write(reinterpret_cast<const char*>(&header), sizeof(header));
    file.flush();
}

uint32_t PageManager::allocate_page()
{
    uint32_t page_id;

    if (header.free_list_head != NO_FREE_PAGE)
    {
        page_id = header.free_list_head;
        uint32_t next_free;
        file.seekg(page_offset(page_id));
        file.read(reinterpret_cast<char*>(&next_free), sizeof(next_free));
        header.free_list_head = next_free;
    }
    else
    {
        page_id = header.page_count;
        header.page_count++;
    }

    write_header();
    return page_id;
}

void PageManager::free_page(uint32_t page_id)
{
    file.seekp(page_offset(page_id));
    file.write(reinterpret_cast<const char*>(&header.free_list_head), sizeof(header.free_list_head));
    header.free_list_head = page_id;
    write_header();
}

void PageManager::write_page(uint32_t page_id, const char* data)
{
    file.seekp(page_offset(page_id));
    file.write(data, header.page_size);
    file.flush();
}

void PageManager::read_page(uint32_t page_id, char* buffer)
{
    file.seekg(page_offset(page_id));
    file.read(buffer, header.page_size);
}
```

### The New Code — `page_manager_c_api.h`

```cpp
#ifndef PAGE_MANAGER_C_API_H
#define PAGE_MANAGER_C_API_H

#include <cstdint>

extern "C" {

typedef void* PageManagerHandle;

PageManagerHandle page_manager_open(const char* path);
void page_manager_close(PageManagerHandle pm);
uint32_t page_manager_allocate(PageManagerHandle pm);
void page_manager_free(PageManagerHandle pm, uint32_t page_id);
void page_manager_write(PageManagerHandle pm, uint32_t page_id, const char* data, uint32_t size);
void page_manager_read(PageManagerHandle pm, uint32_t page_id, char* buffer, uint32_t size);

}

#endif
```

### The New Code — `page_manager_c_api.cpp`

```cpp
#include <vector>
#include <cstring>
#include "page_manager_c_api.h"
#include "page_manager.h"

extern "C" {

PageManagerHandle page_manager_open(const char* path)
{
    return new PageManager(path);
}

void page_manager_close(PageManagerHandle pm)
{
    delete static_cast<PageManager*>(pm);
}

uint32_t page_manager_allocate(PageManagerHandle pm)
{
    return static_cast<PageManager*>(pm)->allocate_page();
}

void page_manager_free(PageManagerHandle pm, uint32_t page_id)
{
    static_cast<PageManager*>(pm)->free_page(page_id);
}

void page_manager_write(PageManagerHandle pm, uint32_t page_id, const char* data, uint32_t size)
{
    std::vector<char> buffer(data, data + size);
    buffer.resize(4096, 0);
    static_cast<PageManager*>(pm)->write_page(page_id, buffer.data());
}

void page_manager_read(PageManagerHandle pm, uint32_t page_id, char* buffer, uint32_t size)
{
    std::vector<char> full_page(4096);
    static_cast<PageManager*>(pm)->read_page(page_id, full_page.data());
    std::memcpy(buffer, full_page.data(), size);
}

}
```

Compiled into its own, separate shared library — deliberately kept apart
from `pocketdb_engine.dll` this lesson, since nothing in the real
`Table`/`Database` API depends on `PageManager` yet (S02d):

```bash
g++ -std=c++17 -Wall -shared -o pagemgr.dll page_manager.cpp page_manager_c_api.cpp
```

Proven for real, from Python — allocation, a real write/read round
trip, and free-then-reuse, all through the real boundary. Save this as
`verify_page_manager.py`:

```python
import ctypes

lib = ctypes.CDLL("./pagemgr.dll")
lib.page_manager_open.argtypes = [ctypes.c_char_p]
lib.page_manager_open.restype = ctypes.c_void_p
lib.page_manager_close.argtypes = [ctypes.c_void_p]
lib.page_manager_allocate.argtypes = [ctypes.c_void_p]
lib.page_manager_allocate.restype = ctypes.c_uint32
lib.page_manager_free.argtypes = [ctypes.c_void_p, ctypes.c_uint32]
lib.page_manager_write.argtypes = [ctypes.c_void_p, ctypes.c_uint32, ctypes.c_char_p, ctypes.c_uint32]
lib.page_manager_read.argtypes = [ctypes.c_void_p, ctypes.c_uint32, ctypes.c_char_p, ctypes.c_uint32]

pm = lib.page_manager_open(b"pmtest.pdb")

p0 = lib.page_manager_allocate(pm)
p1 = lib.page_manager_allocate(pm)
p2 = lib.page_manager_allocate(pm)
print(f"allocated: {p0}, {p1}, {p2}")

message = b"hello from python"
lib.page_manager_write(pm, p1, message, len(message))

buf = ctypes.create_string_buffer(len(message))
lib.page_manager_read(pm, p1, buf, len(message))
print(f"read back: {buf.value.decode('utf-8')}")

lib.page_manager_free(pm, p1)
p3 = lib.page_manager_allocate(pm)
print(f"reused after free: {p3} (should equal {p1})")

lib.page_manager_close(pm)
```

Run with `python verify_page_manager.py`. Real output:

```text
allocated: 0, 1, 2
read back: hello from python
reused after free: 1 (should equal 1)
```

*What this proves:* real Python, through nothing but this lesson's own
`extern "C"` surface, allocated three real pages, wrote a real message
into page `1`, read the identical real message back, freed page `1`,
and confirmed the *next* allocation reused it — the exact same real
free-list behavior this lesson's own second unit already proved,
now reachable, and verified, from Python.

### Updated Project

`file_header.cpp`'s deletion leaves one real call site broken:
`database_c_api.cpp`'s own `database_open` still calls the
now-nonexistent `open_or_create_file(path)`. `Table`/`Database` don't
hold a real `PageManager` yet — that real wiring is S02d's own subject
— but `database_open` still needs *some* real way to create-or-validate
a `.pdb` file's header. Since `PageManager`'s own constructor already
does exactly that (a strict superset of what `open_or_create_file` did,
now also initializing `page_count`/`free_list_head`), `database_open`
constructs one, lets it do its real work, and discards it immediately:

```cpp
DatabaseHandle database_open(const char* path)
{
    try
    {
        PageManager pm(path);
        return new Database();
    }
    catch (const std::exception&)
    {
        return nullptr;
    }
}
```

`#include "page_manager.h"` replaces `#include "file_header.h"` at the
top of `database_c_api.cpp` (`page_manager.h` already includes
`file_header.h` itself). This is a real, deliberately temporary
integration point — `Database` still doesn't store the `PageManager`
it just built and discarded, so every real row inserted still lives
only in a `std::vector<Row>`, exactly as before. S02d replaces this
throwaway construction with a real, permanently-held one.

### Discard the Throwaway Example

```bash
rm verify_page_manager.py pmtest.pdb
```

`page_manager.h`/`.cpp` and `page_manager_c_api.h`/`.cpp` are kept —
real, permanent project files.

### Mechanical Walkthrough

- `std::ifstream existing(path, std::ios::binary); bool file_exists = existing.good();` —
  reappearing shape (Lesson 13) — checked first, before deciding
  whether to create a fresh header or read an existing one.
- `if (!file_exists) { ... }` — reappearing logic (Lesson 13's own
  create-vs-validate branch), now building the *extended* real header
  (with `page_count`/`free_list_head`) instead of the plain one.
- `file.open(path, std::ios::binary | std::ios::in | std::ios::out);` —
  covered fully in Objects and methods used; opened *after* a brand-new
  file's header is already written, so this open always succeeds
  either way.
- `uint32_t PageManager::page_offset(uint32_t page_id) const` — the
  identical real formula this lesson's own first unit already proved,
  now a real class method reading `header.page_size` (from the real,
  validated header) instead of a hardcoded constant.
- `void PageManager::write_header()` — a real, private helper —
  `write_header` is called after every real change to `page_count` or
  `free_list_head`, keeping the on-disk header always in sync with
  the in-memory one; a real, deliberate simplicity choice (flush on
  every change) this unit's own SE Lens covers.
- `allocate_page()` / `free_page()` — reappearing exactly (this
  lesson's own second unit), now real class methods operating on
  `this->header` and `this->file` instead of local throwaway variables.
- `uint32_t page_manager_allocate(PageManagerHandle pm)` — reappearing
  shape (Lesson 6's own `static_cast<Database*>` pattern) —
  `static_cast<PageManager*>(pm)` recovers the real, typed pointer from
  the opaque handle before calling a real method on it.
- `std::vector<char> buffer(data, data + size); buffer.resize(4096, 0);`
  (inside `page_manager_write`) — reappearing shape (`std::vector`,
  Lesson 2) — builds a real, full 4096-byte page in memory, copying in
  the real caller-provided bytes and zero-filling the rest, since
  `PageManager::write_page` itself always writes a full, real page.
- `ctypes.create_string_buffer(len(message))` — **first appearance.** A
  real `ctypes` function allocating a real, mutable byte buffer of a
  given size, in Python's own memory — needed here because
  `page_manager_read` writes its real result *into* a buffer the caller
  provides, rather than returning a new one (a different real shape
  than Lesson 8's own `database_get`, which allocates and returns).
- `ctypes.c_uint32` — reappearing concept (Lesson 1's own `ctypes.c_int`
  family) — the real, unsigned, exactly-32-bit counterpart, matching
  this lesson's own real `uint32_t` page IDs exactly.

### CS Lens

Keeping the real header's in-memory copy and its on-disk copy in sync
after every single change is a real, simple form of **write-through**
— every real update goes to the durable store immediately, rather than
being batched or delayed. Also recognized in: a write-through CPU
cache (every write immediately propagates to main memory), contrasted
with a *write-back* cache (changes stay local until a real reason
forces them out) — this project's own future buffer pool and WAL
(`README.md`'s own later slices) will eventually need exactly that
contrast, once flushing the header on every single change becomes a
real, measured performance cost worth avoiding.

### SE Lens

Why does `PageManager`'s constructor `throw` (via the identical real
`std::runtime_error` Lesson 13 already proved) rather than returning
some kind of "invalid" `PageManager` object the caller has to check?
Because a `PageManager` with no real, valid file open has no safe
default behavior for any of its own real methods — `allocate_page`,
`write_page`, and every other real operation would need their own
separate "did construction actually succeed" check, repeated
everywhere. A real C++ constructor that throws on failure makes an
invalid `PageManager` impossible to hold at all — the exact same real
guarantee `Row`'s own constructor (Lesson 4) already established for a
different real reason.

### Commands Needed

Every command was already shown above, alongside its real output.

### Run It

Already shown above, in "The New Code" — the full, real allocate/write/
read/free/reuse sequence, verified from Python.

### Connection

`PageManager` is now a real, complete, independently-tested owner of a
`.pdb` file's own page-level storage. `Table`/`Database` still don't
know it exists — every row this project has ever inserted still lives
only in a real `std::vector<Row>`, in memory. S02c, next, designs how a
real, variable-length `Row` actually gets encoded into one of these
real, fixed-size pages — the last real piece before S02d finally wires
`Table`/`Database` to use `PageManager` for real.

---

## Closing

### Connect the Pieces

This lesson's first two units proved, in isolation, the two real
mechanisms a page manager needs: direct-addressed allocation (a page's
own byte offset computed directly from its ID, proven by a real file's
own exact, correct size) and a self-hosted free-list (a freed page's
own first 4 bytes holding the ID of the next free page, proven by a
reused page ID and an unchanged `page_count`). `PageManager` then
combined both with Lesson 13's own header logic into one real,
permanent class — its constructor absorbing `open_or_create_file`
entirely, now extended with two new real header fields
(`page_count`, `free_list_head`) kept synchronized on disk after every
real change. Exposed through its own real `extern "C"` surface and
proven correct from actual Python — three real pages allocated, a real
message written into one and read back correctly, and a freed page
correctly reused instead of the file growing further.

### What Breaks Without This

Comment out the `write_header();` call at the end of `allocate_page`,
rebuild, and allocate several real pages, then close and reopen the
same `.pdb` file with a fresh `PageManager`. The real, freshly-reopened
`header.page_count` will be `0` again — every real page allocated in
the previous run is still genuinely there, on disk, but the *header*
no longer remembers it, and the next `allocate_page` call will happily
overwrite real, already-used pages, believing them to be free. Restore
the call and confirm real page counts now correctly survive a reopen.

### Exercises

- Add a real `PageManager::page_count()` accessor (returning
  `header.page_count`), expose it through `page_manager_c_api`, and
  confirm from Python that it correctly reports `3` after three real
  allocations, and still `3` (not `4`) after a free-then-reuse cycle.
- Free two real pages in a row (without reallocating between frees),
  then allocate twice. Confirm the *second-most-recently-freed* page
  comes back first — the free-list behaves like a real stack (LIFO),
  not a queue — and explain, from this lesson's own free-list
  mechanics, exactly why that specific order is what actually happens.
- Deliberately call `page_manager_read` for a page ID that was never
  allocated (say, ID `50`, when only 3 real pages exist). Observe what
  actually happens — this reads real bytes past the end of a real,
  shorter file — and explain, referencing this lesson's own SE Lens on
  `Row`-style constructor validation, what a real, safer version of
  `read_page` would need to check first.

### Definition of Done

- [ ] `page_manager.h`/`.cpp` and `page_manager_c_api.h`/`.cpp` exist
      as real, permanent files in your own `pocketdb/` folder;
      `file_header.cpp` no longer exists.
- [ ] You allocated real pages, wrote and read back a real message, and
      confirmed a freed page gets reused — all from your own real
      Python script.
- [ ] You caused the real "header falls out of sync" failure yourself
      (removing `write_header()`'s call) and confirmed restoring it
      fixes it.
- [ ] You can explain, from memory, why the free-list's own "next"
      pointer lives inside the freed page itself, rather than in a
      separate table — referencing this lesson's own SE Lens.
- [ ] Committed with a message stating why: for example,
      `git commit -m "Add PageManager: real page allocation and a self-hosted free-list"`.
