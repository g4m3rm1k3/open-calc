# Lesson 15: One Page, Many Records

**What you will build** — a real, variable-length `Row` packed into one
of `PageManager`'s own fixed-size 4 KiB pages, using the same real
technique production databases use: a **slotted page** — record bytes
growing forward from the front, a directory of `{offset, length}` slots
growing backward from the end. Proven in isolation, then assembled into
`record_page.h/.cpp` and a dedicated `extern "C"` surface, and proven
correct from real Python — including surviving a real process restart.

**What you need to know first:** Lesson 14 — `PageManager`, real
fixed-size pages, `allocate_page`/`write_page`/`read_page`. Lesson 4 —
`Row`, `Value`, `IntegerValue`/`TextValue`.

**Terms introduced in this lesson:** **slotted page** — a page laid
out as two regions growing toward each other: real record bytes from
the front, and a real directory of slots (each one an `{offset,
length}` pair pointing at one record) from the back.

**Objects and methods used**
- **`dynamic_cast<T*>`**
  - *What it is:* a real, runtime-checked cast — given a base-class
    pointer, produces a real, derived-class pointer if the object
    genuinely *is* that derived type, or `nullptr` if it isn't.
  - *Implementation:* `dynamic_cast<const IntegerValue*>(value.get())`
    — asks, at real runtime, "is this particular `Value` actually an
    `IntegerValue`?" — unlike `static_cast` (Lesson 6), which trusts
    the caller and never checks.
  - *Its use:* `encode_row` doesn't know a `Row`'s own values' real,
    concrete types ahead of time — only that each one is *some*
    `Value` — so it asks each one directly, rather than assuming.
- **`Slot` (this lesson's own struct)**
  - *What it is:* a small, real, page-local record — an `{offset,
    length}` pair — describing exactly where one record's own real
    bytes live inside a page.
  - *Implementation:* `struct Slot { uint32_t offset; uint32_t
    length; };`, written directly into a page's own raw bytes near the
    end, exactly the same way `DatabaseFileHeader` (Lesson 13) is
    written into a file's own raw bytes at the start.
  - *Its use:* `insert_record`/`get_record`'s own real directory —
    given a slot's own index, its `Slot` says exactly where inside the
    page to find that one record's own bytes.
- **`insert_record` / `get_record` / `init_record_page`**
  - *What they are:* this lesson's own real, project-specific
    functions — implementing the slotted-page technique against a raw,
    in-memory page buffer.
  - *Implementation:* covered fully in this lesson's own third unit,
    below.
  - *Its use:* the real bridge between a `PageManager`-owned page's raw
    bytes and one real, individually addressable record inside it.
- **`encode_row` / `decode_row`**
  - *What they are:* this lesson's own real functions converting
    between a real, in-memory `Row` and its own flat, variable-length
    byte representation.
  - *Implementation:* covered fully in this lesson's own first unit,
    below.
  - *Its use:* what `insert_record`/`get_record` actually store and
    retrieve — a page holds real record *bytes*, not `Row` objects
    themselves.

---

## Concept Unit: Encoding a Variable-Length `Row` Into Flat Bytes

### The Problem

A `Row` (Lesson 4) is a real, in-memory C++ object — a
`std::vector<std::unique_ptr<Value>>`, each `Value` a real
`IntegerValue` or `TextValue` living at its own, separate heap
address. A page (Lesson 14) is one flat, contiguous, fixed-size block
of real bytes. There's no real way to `memcpy` a `Row` directly into a
page — its values aren't laid out contiguously in memory at all, and a
`TextValue`'s own `std::string` doesn't have a fixed, predictable size
the way an `int` does. A real, explicit way to turn a `Row` into one
flat, contiguous, variable-length buffer of real bytes — and back
again — is needed first.

### Introduce the Concept in Isolation

Save this as `record_encode_check.cpp`:

```cpp
#include <iostream>
#include <vector>
#include <string>
#include <cstdint>
#include <cstring>

std::vector<char> encode_int(int32_t value)
{
    std::vector<char> bytes;
    char tag = 0;
    bytes.push_back(tag);
    bytes.resize(bytes.size() + sizeof(int32_t));
    std::memcpy(bytes.data() + 1, &value, sizeof(int32_t));
    return bytes;
}

std::vector<char> encode_text(const std::string& value)
{
    std::vector<char> bytes;
    char tag = 1;
    bytes.push_back(tag);

    uint32_t length = static_cast<uint32_t>(value.size());
    size_t length_offset = bytes.size();
    bytes.resize(bytes.size() + sizeof(uint32_t));
    std::memcpy(bytes.data() + length_offset, &length, sizeof(uint32_t));

    size_t text_offset = bytes.size();
    bytes.resize(bytes.size() + length);
    std::memcpy(bytes.data() + text_offset, value.data(), length);

    return bytes;
}

int main()
{
    std::vector<char> record;

    std::vector<char> id_bytes = encode_int(7);
    record.insert(record.end(), id_bytes.begin(), id_bytes.end());

    std::vector<char> name_bytes = encode_text("Alice");
    record.insert(record.end(), name_bytes.begin(), name_bytes.end());

    std::cout << "record size: " << record.size() << std::endl;

    size_t pos = 0;

    char tag1 = record[pos];
    pos += 1;
    int32_t id;
    std::memcpy(&id, record.data() + pos, sizeof(int32_t));
    pos += sizeof(int32_t);
    std::cout << "tag1=" << (int)tag1 << " id=" << id << std::endl;

    char tag2 = record[pos];
    pos += 1;
    uint32_t len;
    std::memcpy(&len, record.data() + pos, sizeof(uint32_t));
    pos += sizeof(uint32_t);
    std::string name(record.data() + pos, len);
    pos += len;
    std::cout << "tag2=" << (int)tag2 << " len=" << len << " name=" << name << std::endl;

    std::cout << "consumed: " << pos << " of " << record.size() << std::endl;
}
```

Compiled and run:

```bash
g++ -std=c++17 -Wall -o record_encode_check.exe record_encode_check.cpp
./record_encode_check.exe
```

Real output:

```text
record size: 15
tag1=0 id=7
tag2=1 len=5 name=Alice
consumed: 15 of 15
```

*What this proves:* `id` (an `int32_t`) real-encodes to `1 + 4 = 5`
bytes; `"Alice"` real-encodes to `1 + 4 + 5 = 10` bytes — a real, exact
`15`-byte total, matching what `pos` actually consumed reading it back.
A one-byte real **tag** in front of each value (`0` for integer, `1`
for text) is what makes the buffer **self-describing** — decoding needs
no outside information about what comes next, only the bytes
themselves.

### Discard the Throwaway Example

```bash
rm record_encode_check.cpp record_encode_check.exe
```

### Mechanical Walkthrough

- `char tag = 0; bytes.push_back(tag);` — reappearing shape (`char`,
  Lesson 0) — one real byte, written first, identifying what kind of
  value follows.
- `bytes.resize(bytes.size() + sizeof(int32_t)); std::memcpy(...)` —
  reappearing shape (Lesson 13's own struct-serialization pattern) —
  grows the buffer by exactly `sizeof(int32_t)` real bytes, then copies
  the real integer's own bytes into the new space.
- `uint32_t length = static_cast<uint32_t>(value.size());` — a real
  length, written *before* the text itself — necessary because, unlike
  an `int32_t`, a `std::string`'s own real size varies every time; the
  decoder needs to be told how many bytes to read, not assume a fixed
  count.
- Decoding walks `pos` forward through the buffer exactly once, reading
  one real tag, then that tag's own real, fixed-or-length-prefixed
  payload — never guessing, never re-reading.

### CS Lens

A self-describing, tag-prefixed buffer like this is one real form of
**serialization** — converting an in-memory structure (scattered across
real, separate heap allocations) into one flat, transmittable or
storable sequence of bytes, and back. The same real idea, at different
scales, is what JSON does for a whole object graph, what Protocol
Buffers do with a schema instead of inline tags, and what this
project's own `DatabaseFileHeader` (Lesson 13) already did for one
fixed-size struct — this unit's own real contribution is doing it for a
*variable*-length one.

### SE Lens

Why a one-byte tag *per value*, repeating "this is an integer" once for
every single `IntegerValue` in every single row, instead of storing a
row's own column types once, in the table's `Schema`, and never
repeating them in the record bytes at all? The tag-per-value design
costs real, small, repeated space — but buys real independence: any
function holding nothing but a raw record's own bytes can decode it
correctly, with no `Schema` in hand at all. This lesson's own upcoming
`decode_row` (third unit) depends on exactly that — a real,
deliberate tradeoff, not an oversight; S02d may reconsider it once a
table's real row count makes the repeated tag bytes an actual, measured
cost worth removing.

### Commands Needed

Every command was already shown above, alongside its real output.

### Run It

Already shown above, in "Introduce the Concept in Isolation."

### Connection

A `Row` can now become one flat, self-describing buffer of real bytes,
and back. Where inside a page that buffer actually lives — and how more
than one of them can share the same page — is the slotted page,
next.

---

## Concept Unit: The Slotted Page — a Directory of Records Inside One Page

### The Problem

A page (Lesson 14) is one flat `4096`-byte block. If a record's bytes
were simply written starting at byte `0` every time, a second record
would have nowhere to go without overwriting the first — and nothing
inside the page itself would remember *where* the first record's own
bytes start or how long they are. A real way to place more than one
variable-length record inside one fixed-size page, and find any one of
them back later purely by a real, small index, is needed.

### Introduce the Concept in Isolation

Save this as `slotted_page_check.cpp`:

```cpp
#include <iostream>
#include <vector>
#include <cstdint>
#include <cstring>

const uint32_t PAGE_SIZE = 4096;

struct Slot
{
    uint32_t offset;
    uint32_t length;
};

int main()
{
    std::vector<char> page(PAGE_SIZE, 0);

    uint32_t slot_count = 0;
    uint32_t free_space_offset = sizeof(uint32_t) * 2;

    std::vector<char> record = {'h', 'e', 'l', 'l', 'o'};

    uint32_t record_offset = free_space_offset;
    std::memcpy(page.data() + record_offset, record.data(), record.size());
    free_space_offset += static_cast<uint32_t>(record.size());

    Slot slot;
    slot.offset = record_offset;
    slot.length = static_cast<uint32_t>(record.size());

    uint32_t slot_position = PAGE_SIZE - (slot_count + 1) * sizeof(Slot);
    std::memcpy(page.data() + slot_position, &slot, sizeof(Slot));
    slot_count++;

    std::memcpy(page.data(), &slot_count, sizeof(uint32_t));
    std::memcpy(page.data() + sizeof(uint32_t), &free_space_offset, sizeof(uint32_t));

    uint32_t read_slot_count;
    std::memcpy(&read_slot_count, page.data(), sizeof(uint32_t));
    std::cout << "slot_count: " << read_slot_count << std::endl;

    uint32_t read_slot_position = PAGE_SIZE - 1 * sizeof(Slot);
    Slot read_slot;
    std::memcpy(&read_slot, page.data() + read_slot_position, sizeof(Slot));
    std::cout << "slot 0: offset=" << read_slot.offset << " length=" << read_slot.length << std::endl;

    std::string recovered(page.data() + read_slot.offset, read_slot.length);
    std::cout << "recovered: " << recovered << std::endl;

    uint32_t free_bytes = (PAGE_SIZE - slot_count * sizeof(Slot)) - free_space_offset;
    std::cout << "free bytes remaining: " << free_bytes << std::endl;
}
```

Compiled and run:

```bash
g++ -std=c++17 -Wall -o slotted_page_check.exe slotted_page_check.cpp
./slotted_page_check.exe
```

Real output:

```text
slot_count: 1
slot 0: offset=8 length=5
recovered: hello
free bytes remaining: 4075
```

*What this proves:* the record's own bytes (`"hello"`) live starting
at real offset `8` (right after this page's own tiny 8-byte
`slot_count`/`free_space_offset` header) — and slot `0`, written at the
real, opposite end of the page (`PAGE_SIZE - sizeof(Slot)`), correctly
records exactly where to find it and how long it is. `free bytes
remaining: 4075` proves the two regions — record data growing forward,
the slot directory growing backward — really do share the same page
without colliding, `4096 - 8 (page header) - 5 (record) - 8 (one Slot)
= 4075` accounted for exactly.

### Discard the Throwaway Example

```bash
rm slotted_page_check.cpp slotted_page_check.exe
```

### Mechanical Walkthrough

- `uint32_t slot_count = 0; uint32_t free_space_offset =
  sizeof(uint32_t) * 2;` — this page's own tiny, 8-byte real header,
  living at the very front — reappearing shape (Lesson 13's file
  header, at page scale instead of file scale).
- `uint32_t record_offset = free_space_offset; ... free_space_offset +=
  record.size();` — the record grows the "front" region forward by
  exactly its own real size.
- `uint32_t slot_position = PAGE_SIZE - (slot_count + 1) * sizeof(Slot);`
  — the *next* slot's own real position, counted backward from the very
  end of the page — slot `0` sits at the last `sizeof(Slot)` bytes, slot
  `1` would sit just before it, and so on; this is what makes the
  directory grow *backward* while records grow *forward*.
- `std::memcpy(page.data() + slot_position, &slot, sizeof(Slot));` —
  reappearing shape (Lesson 13) — writes this one real `Slot` directly
  into the page's own raw bytes, at its own computed real position.

### CS Lens

Growing two real regions toward each other from opposite ends of one
fixed-size block — records forward from the front, a directory
backward from the back — is a real, standard technique called a
**slotted page**, used by production database engines (SQLite,
PostgreSQL, and others) for exactly this reason: it lets a page hold
any real *mix* of record sizes, while still finding any one record in
real, constant time through its own small, fixed-size slot — no
scanning the page's own raw bytes to find where a record starts.

### SE Lens

Why index records by a real, page-local *slot number* (`0`, `1`, `2`,
...) rather than by their own raw byte offset directly? A slot number
stays real and stable even if a record's own bytes later move within
the page (say, a future "compact this page" operation, reclaiming space
after a delete) — only the one `Slot` entry needs updating, not every
outside reference to that record. This is the identical real reasoning
behind `PageManager`'s own page IDs (Lesson 14) staying stable while a
page's own on-disk byte offset is only ever computed, never stored or
passed around directly.

### Commands Needed

Every command was already shown above, alongside its real output.

### Run It

Already shown above, in "Introduce the Concept in Isolation."

### Connection

Both real halves — flat record encoding, and the slotted-page layout
holding one inside a real page — are proven correct in isolation.
Assembling them into real, permanent project code, addressable from
real Python through `PageManager`, is next.

---

## Concept Unit: `record_page` — Records That Actually Live on a Real Page

### The Problem

`encode_row`/`decode_row` and the slotted-page technique both exist
only as throwaway proofs so far. A real, permanent module is needed
combining both — and a real way for Python to insert an actual `Row`
into an actual `PageManager`-owned page, and read it back, including
surviving the real Python process ending and a new one opening the
same file.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `record_page.h` (new), `record_page.cpp` (new),
  `record_page_c_api.h` (new), `record_page_c_api.cpp` (new).
- **Change type:** Add.
- **Dependencies:** This lesson's own first two units; Lesson 14's
  `PageManager`.

### The New Code — `record_page.h`

```cpp
#ifndef RECORD_PAGE_H
#define RECORD_PAGE_H

#include <vector>
#include <cstdint>
#include "row.h"
#include "schema.h"

std::vector<char> encode_row(const Row& row);
Row decode_row(const char* data, uint32_t length);

void init_record_page(char* page);
uint32_t insert_record(char* page, const std::vector<char>& record);
std::vector<char> get_record(const char* page, uint32_t slot_index);

#endif
```

### The New Code — `record_page.cpp`

```cpp
#include <cstring>
#include <stdexcept>
#include "record_page.h"
#include "value.h"

namespace
{
    const uint32_t PAGE_SIZE = 4096;

    struct Slot
    {
        uint32_t offset;
        uint32_t length;
    };
}

std::vector<char> encode_row(const Row& row)
{
    std::vector<char> record;

    for (const auto& value : row.values)
    {
        const IntegerValue* as_integer = dynamic_cast<const IntegerValue*>(value.get());
        if (as_integer != nullptr)
        {
            char tag = 0;
            record.push_back(tag);

            size_t offset = record.size();
            record.resize(record.size() + sizeof(int32_t));
            int32_t as_int32 = as_integer->value;
            std::memcpy(record.data() + offset, &as_int32, sizeof(int32_t));
            continue;
        }

        const TextValue* as_text = dynamic_cast<const TextValue*>(value.get());
        char tag = 1;
        record.push_back(tag);

        uint32_t length = static_cast<uint32_t>(as_text->value.size());
        size_t length_offset = record.size();
        record.resize(record.size() + sizeof(uint32_t));
        std::memcpy(record.data() + length_offset, &length, sizeof(uint32_t));

        size_t text_offset = record.size();
        record.resize(record.size() + length);
        std::memcpy(record.data() + text_offset, as_text->value.data(), length);
    }

    return record;
}

Row decode_row(const char* data, uint32_t length)
{
    std::vector<std::unique_ptr<Value>> values;
    Schema schema;
    uint32_t pos = 0;

    while (pos < length)
    {
        char tag = data[pos];
        pos += 1;

        if (tag == 0)
        {
            int32_t as_int32;
            std::memcpy(&as_int32, data + pos, sizeof(int32_t));
            pos += sizeof(int32_t);
            values.push_back(std::make_unique<IntegerValue>(as_int32));
            schema.add_column(std::make_unique<IntegerColumn>("decoded"));
        }
        else
        {
            uint32_t text_length;
            std::memcpy(&text_length, data + pos, sizeof(uint32_t));
            pos += sizeof(uint32_t);

            std::string text(data + pos, text_length);
            pos += text_length;
            values.push_back(std::make_unique<TextValue>(text));
            schema.add_column(std::make_unique<TextColumn>("decoded"));
        }
    }

    return Row(std::move(values), schema);
}

void init_record_page(char* page)
{
    uint32_t slot_count = 0;
    uint32_t free_space_offset = sizeof(uint32_t) * 2;
    std::memcpy(page, &slot_count, sizeof(uint32_t));
    std::memcpy(page + sizeof(uint32_t), &free_space_offset, sizeof(uint32_t));
}

uint32_t insert_record(char* page, const std::vector<char>& record)
{
    uint32_t slot_count;
    std::memcpy(&slot_count, page, sizeof(uint32_t));

    uint32_t free_space_offset;
    std::memcpy(&free_space_offset, page + sizeof(uint32_t), sizeof(uint32_t));

    uint32_t slot_directory_start = PAGE_SIZE - (slot_count + 1) * sizeof(Slot);
    uint32_t record_end = free_space_offset + static_cast<uint32_t>(record.size());

    if (record_end > slot_directory_start)
    {
        throw std::runtime_error("Not enough free space in this page for this record");
    }

    std::memcpy(page + free_space_offset, record.data(), record.size());

    Slot slot;
    slot.offset = free_space_offset;
    slot.length = static_cast<uint32_t>(record.size());
    std::memcpy(page + slot_directory_start, &slot, sizeof(Slot));

    uint32_t new_slot_count = slot_count + 1;
    uint32_t new_free_space_offset = free_space_offset + static_cast<uint32_t>(record.size());
    std::memcpy(page, &new_slot_count, sizeof(uint32_t));
    std::memcpy(page + sizeof(uint32_t), &new_free_space_offset, sizeof(uint32_t));

    return slot_count;
}

std::vector<char> get_record(const char* page, uint32_t slot_index)
{
    uint32_t slot_count;
    std::memcpy(&slot_count, page, sizeof(uint32_t));

    if (slot_index >= slot_count)
    {
        throw std::out_of_range("No slot " + std::to_string(slot_index) + " on this page");
    }

    uint32_t slot_position = PAGE_SIZE - (slot_index + 1) * sizeof(Slot);
    Slot slot;
    std::memcpy(&slot, page + slot_position, sizeof(Slot));

    std::vector<char> record(slot.length);
    std::memcpy(record.data(), page + slot.offset, slot.length);
    return record;
}
```

### The New Code — `record_page_c_api.h`

```cpp
#ifndef RECORD_PAGE_C_API_H
#define RECORD_PAGE_C_API_H

#include <cstdint>
#include "page_manager_c_api.h"

extern "C" {

typedef enum
{
    RECORD_TYPE_INTEGER = 0,
    RECORD_TYPE_TEXT = 1
} RecordTypeCode;

void record_page_init(PageManagerHandle pm, uint32_t page_id);
int record_page_insert(PageManagerHandle pm, uint32_t page_id,
                        const char** values, const RecordTypeCode* types, int value_count);
char* record_page_get(PageManagerHandle pm, uint32_t page_id, int slot_index);
void record_page_free_string(char* s);

}

#endif
```

### The New Code — `record_page_c_api.cpp`

```cpp
#include <cstring>
#include <stdexcept>
#include "record_page_c_api.h"
#include "page_manager.h"
#include "record_page.h"
#include "value.h"

namespace
{
    const uint32_t PAGE_SIZE = 4096;
}

extern "C" {

void record_page_init(PageManagerHandle pm, uint32_t page_id)
{
    std::vector<char> page(PAGE_SIZE, 0);
    init_record_page(page.data());
    static_cast<PageManager*>(pm)->write_page(page_id, page.data());
}

int record_page_insert(PageManagerHandle pm, uint32_t page_id,
                        const char** values, const RecordTypeCode* types, int value_count)
{
    try
    {
        Schema schema;
        std::vector<std::unique_ptr<Value>> row_values;
        for (int i = 0; i < value_count; ++i)
        {
            if (types[i] == RECORD_TYPE_INTEGER)
            {
                schema.add_column(std::make_unique<IntegerColumn>("col"));
                row_values.push_back(std::make_unique<IntegerValue>(std::stoi(values[i])));
            }
            else
            {
                schema.add_column(std::make_unique<TextColumn>("col"));
                row_values.push_back(std::make_unique<TextValue>(values[i]));
            }
        }

        Row row(std::move(row_values), schema);
        std::vector<char> record = encode_row(row);

        std::vector<char> page(PAGE_SIZE);
        PageManager* real_pm = static_cast<PageManager*>(pm);
        real_pm->read_page(page_id, page.data());

        uint32_t slot_index = insert_record(page.data(), record);
        real_pm->write_page(page_id, page.data());

        return static_cast<int>(slot_index);
    }
    catch (const std::exception&)
    {
        return -1;
    }
}

char* record_page_get(PageManagerHandle pm, uint32_t page_id, int slot_index)
{
    try
    {
        std::vector<char> page(PAGE_SIZE);
        static_cast<PageManager*>(pm)->read_page(page_id, page.data());

        std::vector<char> record_bytes = get_record(page.data(), static_cast<uint32_t>(slot_index));
        Row row = decode_row(record_bytes.data(), static_cast<uint32_t>(record_bytes.size()));

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

void record_page_free_string(char* s)
{
    delete[] s;
}

}
```

Compiled into its own, separate shared library, alongside `PageManager`'s
own code (this lesson's own real functions call `PageManager`'s real
`read_page`/`write_page` methods directly):

```bash
g++ -std=c++17 -Wall -shared -o recordpage.dll schema.cpp row.cpp page_manager.cpp record_page.cpp page_manager_c_api.cpp record_page_c_api.cpp
```

Proven from real Python — allocate a page, format it, insert a real
row, read it back:

```python
import ctypes

lib = ctypes.CDLL("./recordpage.dll")

lib.page_manager_open.argtypes = [ctypes.c_char_p]
lib.page_manager_open.restype = ctypes.c_void_p
lib.page_manager_close.argtypes = [ctypes.c_void_p]
lib.page_manager_allocate.argtypes = [ctypes.c_void_p]
lib.page_manager_allocate.restype = ctypes.c_uint32

lib.record_page_init.argtypes = [ctypes.c_void_p, ctypes.c_uint32]
lib.record_page_insert.argtypes = [ctypes.c_void_p, ctypes.c_uint32,
                                    ctypes.POINTER(ctypes.c_char_p), ctypes.POINTER(ctypes.c_int), ctypes.c_int]
lib.record_page_insert.restype = ctypes.c_int
lib.record_page_get.argtypes = [ctypes.c_void_p, ctypes.c_uint32, ctypes.c_int]
lib.record_page_get.restype = ctypes.c_void_p
lib.record_page_free_string.argtypes = [ctypes.c_void_p]

pm = lib.page_manager_open(b"rptest.pdb")
page_id = lib.page_manager_allocate(pm)
lib.record_page_init(pm, page_id)

values = (ctypes.c_char_p * 2)(b"7", b"Alice")
types = (ctypes.c_int * 2)(0, 1)
slot_index = lib.record_page_insert(pm, page_id, values, types, 2)
print(f"inserted at slot: {slot_index}")

result_ptr = lib.record_page_get(pm, page_id, slot_index)
result = ctypes.string_at(result_ptr).decode("utf-8")
lib.record_page_free_string(result_ptr)
print(f"read back: {result}")

lib.page_manager_close(pm)
```

Run with `python verify_record_page.py`. Real output:

```text
inserted at slot: 0
read back: 7,'Alice'
```

Then, in a real, *separate* run — proving this isn't just an in-memory
result, but genuinely persisted:

```python
import ctypes

lib = ctypes.CDLL("./recordpage.dll")
lib.page_manager_open.argtypes = [ctypes.c_char_p]
lib.page_manager_open.restype = ctypes.c_void_p
lib.page_manager_close.argtypes = [ctypes.c_void_p]
lib.record_page_get.argtypes = [ctypes.c_void_p, ctypes.c_uint32, ctypes.c_int]
lib.record_page_get.restype = ctypes.c_void_p
lib.record_page_free_string.argtypes = [ctypes.c_void_p]

pm = lib.page_manager_open(b"rptest.pdb")
result_ptr = lib.record_page_get(pm, 0, 0)
result = ctypes.string_at(result_ptr).decode("utf-8")
lib.record_page_free_string(result_ptr)
print(f"reopened, read back: {result}")
lib.page_manager_close(pm)
```

Real output:

```text
reopened, read back: 7,'Alice'
```

*What this proves:* the real row inserted by the *first* Python
process is still there, correctly decoded, in a completely new Python
process that only ever opened the same `.pdb` file and asked for page
`0`, slot `0` — real, on-disk persistence, not a result held in memory.

### Discard the Throwaway Example

```bash
rm verify_record_page.py verify_record_page_reopen.py rptest.pdb
```

`record_page.h`/`.cpp` and `record_page_c_api.h`/`.cpp` are kept —
real, permanent project files.

### Mechanical Walkthrough

- `dynamic_cast<const IntegerValue*>(value.get())` — covered fully in
  Objects and methods used; `encode_row` tries `IntegerValue` first,
  and if that `dynamic_cast` returns `nullptr`, falls through to
  treating the value as `TextValue` — safe here specifically because
  `Value` only ever has these two real subclasses so far (Lesson 2).
- `Schema schema;` inside `decode_row` — reappearing shape (`Schema`,
  Lesson 2) — built fresh from the tags actually found while decoding,
  purely to satisfy `Row`'s own constructor's real column-count check
  (Lesson 4); the column *names* ("decoded") are placeholders, since
  nothing this lesson does depends on them.
- `void record_page_init(PageManagerHandle pm, uint32_t page_id)` —
  a real, explicit "format this page for holding records" step, called
  once, right after `page_manager_allocate` — a freshly allocated page
  (Lesson 14) has no real, defined content yet; without this call,
  `insert_record` would read a `slot_count`/`free_space_offset` of
  whatever raw bytes happen to already be there, not a real, valid
  empty page.
- `real_pm->read_page(page_id, page.data()); ... insert_record(...);
  real_pm->write_page(page_id, page.data());` — the real
  read-modify-write cycle every `record_page_insert` call performs:
  the *whole* page is read into memory, `insert_record` changes one
  small part of it, and the *whole* page is written back — `PageManager`
  itself has no notion of "just update these few bytes."

### CS Lens

`record_page_init`'s own real job — writing known, valid content into a
page before anything else touches it — is a real, small example of
**initialization**, the same principle a language's own default
constructor (`Row`'s, `Schema`'s) already provides automatically for a
C++ object; a raw page of bytes gets no such automatic guarantee, so
this project provides it explicitly, once, on purpose.

### SE Lens

Why does `record_page_insert` read the *entire* `4096`-byte page,
modify it in memory, and write the *entire* page back — rather than
seeking directly to just the new record's own bytes and writing only
those? Because the slot directory itself also changes on every insert
(`slot_count`, and the new slot's own bytes), and those live at the
*opposite end* of the page from the record data — two separate,
non-adjacent writes would be needed instead of one, and a real crash
between them could leave the page in a state where the directory
claims a slot exists whose bytes were never actually written. One
whole-page read-modify-write keeps every change to one page happening
as a single, real disk operation — a real, deliberate simplicity choice
this project's future write-ahead log (`README.md`'s own later slices)
will build durability guarantees on top of, not one this lesson tries
to solve on its own yet.

### Commands Needed

Every command was already shown above, alongside its real output.

### Run It

Already shown above — the full sequence: allocate, initialize, insert,
read back, close, reopen in a real, separate process, and read back
again.

### Connection

A single, real record now survives a page, a file close, and a real
process restart — persistence, proven at the smallest real scale that
matters. `Table`/`Database` still don't use any of this — every row
inserted through `pocketdb`'s own real, public API still only ever
touches a `std::vector<Row>`, in memory, gone the moment the process
ends. S02d, next, is where that changes for real: `Table` itself
starts using `PageManager` and this lesson's own `record_page`
functions, and `pocketdb`'s own `close()`/reopen finally means
something.

---

## Closing

### Connect the Pieces

This lesson's first two units proved, in isolation, the two real
mechanisms a record needs to live inside a page: a self-describing,
tag-prefixed flat encoding for a variable-length `Row` (proven by a
`15`-byte buffer decoding back to the exact original `id`/`name`), and
a slotted-page layout letting record data and a slot directory share
one page by growing toward each other from opposite ends (proven by
`4075` free bytes accounted for exactly). `record_page.h/.cpp` then
combined both into real, permanent functions — `encode_row`/`decode_row`,
`init_record_page`, `insert_record`, `get_record` — and
`record_page_c_api` exposed them through their own real `extern "C"`
surface, built on top of Lesson 14's own `PageManager`. Proven from
real Python not once but twice: inserted and read back in one process,
then read back again, correctly, in a completely separate process that
only reopened the same file — real, on-disk persistence, not an
in-memory illusion.

### What Breaks Without This

Skip the `record_page_init` call entirely — allocate a page, then call
`record_page_insert` directly against it — and rebuild. Because a
freshly allocated page's own bytes are whatever was already sitting at
that location in the file (potentially real, leftover bytes from a
much earlier run, not necessarily all zero), `slot_count` and
`free_space_offset` are read as whatever those bytes happen to decode
to — sometimes an already-too-large `free_space_offset`, sometimes a
`slot_count` that makes `insert_record` compute a nonsensical slot
position past the end of the page. Restore the `record_page_init` call
and confirm the real, correct `inserted at slot: 0` output returns.

### Exercises

- Call `record_page_insert` a second time, on the same page, with a
  different row (say, `id=8`, `name="Bob"`). Confirm it returns slot
  `1`, not `0` — and confirm `record_page_get` still correctly returns
  *both* rows independently, by their own real slot index. This is the
  real proof that "slotted" means more than one record per page, not
  just one.
- Deliberately call `record_page_insert` enough times, with large
  enough text values, to exceed one page's own real free space, and
  confirm the real `std::runtime_error` this lesson's own
  `insert_record` throws gets caught correctly (returned as `-1`
  through `record_page_c_api`), rather than corrupting the page.
- `record_page_get` currently rebuilds a throwaway `Schema` inside
  `decode_row`, purely to satisfy `Row`'s constructor. Explain, from
  this lesson's own SE Lens on tag-per-value encoding, why this is safe
  even though the decoded `Schema`'s own column *names* are meaningless
  placeholders — and what would have to change if a caller ever needed
  the real, original column names back.

### Definition of Done

- [ ] `record_page.h`/`.cpp` and `record_page_c_api.h`/`.cpp` exist as
      real, permanent files in your own `pocketdb/` folder.
- [ ] You inserted a real row into a real page and read it back
      correctly, from your own real Python script.
- [ ] You closed that script's process, opened a *new* one, and
      confirmed the same real row was still there — real persistence,
      not an in-memory result.
- [ ] You caused the real "skipped initialization" failure yourself and
      confirmed restoring `record_page_init` fixes it.
- [ ] You can explain, from memory, why record data grows forward from
      a page's front while the slot directory grows backward from its
      end — referencing this lesson's own CS Lens.
- [ ] Committed with a message stating why: for example,
      `git commit -m "Add record_page: slotted-page encoding for a real Row"`.
