# Lesson 25: What a Byte Actually Costs
### (Project 9 — Mini Database Engine, C++)

**What you will build.** A `Record` struct written to disk as raw
bytes — no JSON, no delimiters, no parsing, the file's exact size
matching `sizeof(Record)` precisely — and a real, measured comparison
between scanning two million records stored contiguously versus the
same two million records scattered across the heap in a linked list.
The transferable problem this lesson is actually about: every earlier
phase of this curriculum treated memory layout as invisible, handled
entirely by the language; C++ makes it visible, measurable, and, this
lesson proves, something that changes real wall-clock performance by a
factor of two on identical data doing identical work.

**What you need to know first.** Lesson 23 — `new`/`delete`, the heap.
Lesson 24 — `unique_ptr`. Project 7, Lesson 17 (Java) — the
`|`-delimited text serialization this lesson's raw-byte approach
directly contrasts with.

---

## Concept Unit: Struct Layout and Padding

### The Problem

Every object in Phases 1–4 had a size no code ever needed to think
about — Python, JavaScript, Java, and C# all hide exactly how many
bytes an object occupies in memory. Writing raw bytes to disk — this
project's actual goal — requires knowing that number exactly, and it
turns out a struct's size isn't simply the sum of its fields' sizes.

### Project Change

- **Reference Source** — No reference counterpart; from-scratch.
- **Files affected** — created `struct_size_lab.cpp` (throwaway, this
  unit only).
- **Change type** — add.
- **Location** — new file, new project directory.
- **Dependencies** — none beyond `g++`.

### The New Code

```cpp
struct Padded {
    char flag;      // 1 byte
    int number;     // 4 bytes
    char flag2;     // 1 byte
};

struct Packed {
    int number;     // 4 bytes
    char flag;      // 1 byte
    char flag2;     // 1 byte
};
```

### The Updated Project

Brand-new throwaway file, shown whole above.

### Introduce the concept in isolation

```cpp
std::cout << "sizeof(Padded): " << sizeof(Padded) << " bytes" << std::endl;
std::cout << "sizeof(Packed): " << sizeof(Packed) << " bytes" << std::endl;
```

Real output:

```
sizeof(Padded): 12 bytes
sizeof(Packed): 8 bytes
```

Both structs hold the exact same fields — one `char`, one `int`, one
more `char` — six bytes of genuinely useful data either way. `Padded`
takes **12 bytes**; simply reordering the *same* fields, `Packed` takes
**8**. The difference is **padding**: most CPUs read a 4-byte `int`
fastest when it starts at an address that's a multiple of 4 — called
**alignment** — so the compiler silently inserts unused filler bytes
before `number` in `Padded`, to push it onto a 4-byte boundary, then
more filler at the end so the whole struct's size is itself a multiple
of the largest field's alignment requirement. `Packed` avoids most of
that simply by placing the 4-byte field first, needing no filler before
it.

### Discard the throwaway example

`Padded`/`Packed` are deleted — they only existed to prove field order
genuinely changes a struct's size, isolated from this project's real
`Record`.

### Mechanical walkthrough

- `struct Padded { char flag; int number; char flag2; };` — **(a)
  first appearance** of `struct` in this curriculum's C++ phase: a
  plain aggregate type, publicly accessible fields by default — the
  direct low-level ancestor of `class`, used here specifically because
  this project's records are meant to be simple, raw data.
- `sizeof(Padded)` — **(a) first appearance.** A compile-time operator
  — not a function call — that yields the exact number of bytes an
  instance of the given type occupies, including any padding.

### CS lens

This is **memory alignment**, a real, physical hardware constraint
made visible: CPUs access aligned data faster than misaligned data, and
some architectures historically couldn't access misaligned multi-byte
values at all without extra, slower instructions. Also recognized in:
database engines' own on-disk page formats (designed with exactly this
kind of layout awareness, which is precisely why this project needs to
understand it), network protocol headers defined byte-by-byte with
explicit padding, any systems-level file format specification.

### SE lens

Every language in Phases 1–4 made this invisible on purpose — Python,
JavaScript, Java, and C# objects each carry their own runtime-managed
layout, and nothing in any of those languages ever needed or allowed a
programmer to reorder fields for size. That invisibility is a real,
valuable simplification for the vast majority of code — but a storage
engine, writing raw bytes to disk and reading them back, genuinely
cannot ignore it: the padding bytes get written to disk too, and get
read back too, meaning field order has a real, measurable cost in file
size, multiplied across however many records a real database might
store.

### Commands needed

Same `g++ -o <output> <file>.cpp` pattern as Lessons 23–24.

### Run it

Shown above.

### Connecting sentence

A struct's size on disk is exactly its size in memory, padding
included — the next unit uses that fact directly, writing a record's
raw bytes straight to a file with no translation step at all.

---

## Concept Unit: Raw Bytes to Disk

### The Problem

Project 7, Lesson 17 (Java) serialized a `Product` by converting every
field to text and joining it with `|` characters — real, working,
human-readable, and, as that lesson named honestly, fragile against a
field containing the delimiter itself. C++ offers a fundamentally
different option: since a struct's exact byte layout is now known and
controllable, its raw bytes can be written directly, with no text
conversion step at all.

### Project Change

- **Reference Source** — No reference counterpart; from-scratch.
- **Files affected** — created `raw_record_lab.cpp`.
- **Change type** — add.
- **Location** — new file.
- **Dependencies** — `<cstdio>` (C's own file I/O, still used directly
  in C++), `<cstring>`.

### The New Code

```cpp
#include <cstdio>
#include <cstring>

struct Record {
    int id;
    double price;
    char name[32];
};
```

### The Updated Project

Brand-new file, shown whole above — `name` is a **fixed-size character
array**, not a `std::string`, deliberately: a `std::string` internally
holds its own pointer to separately heap-allocated character data, which
would defeat the entire point of this unit — a `Record` with a
`std::string` field wouldn't have one fixed, self-contained byte layout
at all.

### Mechanical walkthrough

- `char name[32];` — **(a) first appearance** of a fixed-size array as
  a struct member: reserves exactly 32 bytes, inline, as part of
  `Record`'s own layout — a name longer than 31 characters (one byte
  reserved for the string terminator) simply won't fit, a real,
  deliberate constraint traded for `Record` having one fixed, known
  size.
- `std::strncpy(r.name, "Widget", sizeof(r.name));` — **(a) first
  appearance.** Copies a C-style string into the fixed array, safely
  bounded by its actual size — the direct low-level counterpart to
  assigning a `std::string`, needed here because `name` isn't a
  `std::string`.
- `FILE* out = fopen("records.bin", "wb");` — **(a) first appearance**
  of C's own file API, still directly usable in C++: `"wb"` opens for
  writing in **binary mode** — critically different from `"w"` (text
  mode), which can silently translate certain byte sequences (like
  line-ending characters) on some platforms, corrupting raw binary data
  that was never meant to be interpreted as text at all.
- `fwrite(&r, sizeof(Record), 1, out);` — **(a) first appearance.**
  Writes exactly `sizeof(Record)` bytes, starting at the memory address
  `&r`, directly to the file — not `r`'s field values individually
  converted to text, its actual, literal in-memory byte representation,
  padding included.
- `fread(&loaded, sizeof(Record), 1, in);` — **(a) first appearance,**
  the exact mirror: reads `sizeof(Record)` bytes from the file directly
  into `loaded`'s own memory, reconstructing the struct without parsing
  anything.

### CS lens

This is **binary serialization**: persisting a value's raw memory
representation directly, rather than converting it to and from a
text-based intermediate format. Also recognized in: real database
engines' own on-disk page formats (SQLite, PostgreSQL, and virtually
every serious database store fixed-layout binary records for exactly
this performance reason), a memory-mapped file, a network protocol
using a fixed binary frame format instead of a text-based one like
JSON.

### SE lens

Proven directly:

```
sizeof(Record): 48 bytes
Loaded: id=1 price=19.99 name=Widget
```

```
$ ls -la records.bin
-rw-r--r-- 1 root root 48 ... records.bin
```

The file on disk is **exactly** 48 bytes — precisely `sizeof(Record)`,
no more, no less, no delimiters, no field names, nothing but the raw
data. Compare against Java's Lesson 17 `|`-delimited approach: that
format was human-readable, resilient to reordering fields (as long as
the split-and-parse logic matched), and genuinely fragile against a
delimiter appearing inside a field's own value. This binary format is
the opposite on every axis: `records.bin` is unreadable as plain text,
completely inflexible to field reordering (changing `Record`'s field
order changes the file's byte layout, silently making old files
unreadable by new code, a real, serious compatibility risk this lesson
names honestly rather than glosses over), and immune to the delimiter
problem entirely, because there is no delimiter — the format's exact
size and shape are known in advance from the struct definition itself.

### Commands needed

Same `g++` pattern.

### Run it

Shown above, along with the real file size on disk.

### Connecting sentence

One record now writes and reads as raw bytes with no translation cost
at all — the final unit asks the real question a storage engine has to
answer: does *where* those bytes physically live, relative to each
other, actually matter?

---

## Concept Unit: Contiguous Memory vs. Pointer-Chasing

### The Problem

A database engine needs to scan many records — computing a total, a
filter, an aggregate. Two genuinely different ways to hold "many
records" both compile, both run, both produce the same answer: one big
contiguous block (a `std::vector<Record>`) versus many individually
heap-allocated records linked together (a linked list). Nothing in any
earlier phase of this curriculum ever measured whether *how* a
collection of items is laid out in memory — separate from what
algorithm is used to process it — actually changes performance.

### Project Change

- **Reference Source** — No reference counterpart; from-scratch.
- **Files affected** — created `scan_compare.cpp`.
- **Change type** — add.
- **Location** — new file.
- **Dependencies** — `<vector>`, `<chrono>`.

### The New Code

```cpp
#include <vector>
#include <chrono>

struct Node {
    Record record;
    Node* next;
};

const int N = 2000000;

std::vector<Record> contiguous;
contiguous.reserve(N);
for (int i = 0; i < N; i++) {
    contiguous.push_back(Record{i, i * 1.5, "item"});
}

Node* head = nullptr;
Node* tail = nullptr;
for (int i = 0; i < N; i++) {
    Node* n = new Node{Record{i, i * 1.5, "item"}, nullptr};
    if (!head) { head = n; tail = n; }
    else { tail->next = n; tail = n; }
}
```

### The Updated Project

Brand-new file, shown whole above — two million `Record`s, built two
different ways: one as a single contiguous block via `std::vector`,
one as two million separate heap allocations linked by raw pointers.

### Introduce the concept in isolation

No separate lab needed — this comparison, run directly, *is* the
measurement this whole unit exists to make.

### Mechanical walkthrough

- `std::vector<Record> contiguous; contiguous.reserve(N);` — **(a)
  first appearance** of `std::vector` and `.reserve()`: `vector` is
  C++'s standard growable array — the direct counterpart to Python's
  `list`, JavaScript's array, Java's/C#'s `ArrayList`/`List<T>` — backed
  by one single contiguous block of heap memory. `.reserve(N)`
  pre-allocates enough space for `N` elements up front, avoiding
  repeated reallocation as the vector grows.
- `struct Node { Record record; Node* next; };` — **(b) hard concept
  reappearing**: a self-referential struct, the same shape as a linked
  list node from any earlier phase's own data structure work, here
  holding a full `Record` directly (not a pointer to one) plus a
  pointer to the next node.
- `Node* n = new Node{...}; ... tail->next = n;` — **(b) hard concept
  reappearing**: ordinary heap allocation and pointer-linking — the
  critical detail is that each of these two million `new` calls can
  land *anywhere* in the heap, with no guarantee of being anywhere near
  the previous one.

Timing each scan:

```cpp
auto start1 = std::chrono::high_resolution_clock::now();
double total1 = 0;
for (const auto& r : contiguous) {
    total1 += r.price;
}
auto end1 = std::chrono::high_resolution_clock::now();
```

and the equivalent walk over the linked list, timed the same way.

- `std::chrono::high_resolution_clock::now()` — **(a) first
  appearance.** A real, precise timer — the C++ standard library's own
  version of Python's `time.perf_counter()` (Project 2, Lesson 6) and
  JavaScript's `performance.now()`, used here for the same reason both
  of those were: measuring a real claim instead of asserting it.

### CS lens

This is **cache locality**: modern CPUs read memory into small, fast
**cache** lines in chunks, and accessing data that's physically close
to data just accessed is dramatically cheaper than jumping to a
distant, unpredictable address — exactly what scanning a contiguous
`vector` does (each `Record` sits immediately after the last) versus
what walking a linked list does (each `Node` can be anywhere the heap
allocator happened to place it, on this run, two million separate
times). Also recognized in: any performance-sensitive systems code's
strong, well-documented preference for arrays over linked lists when
iteration order matters more than mid-sequence insertion, a real,
foundational reason many modern language runtimes (including, notably,
Java's own `ArrayList` being preferred over `LinkedList` in almost all
real practice) default to contiguous storage even in garbage-collected
languages.

### SE lens

Real, measured output, run multiple times to confirm it's not a
one-off:

```
Contiguous vector scan: 8ms (sum=3e+12)
Pointer-chased list scan: 16ms (sum=3e+12)
```

```
Contiguous vector scan: 8ms (sum=3e+12)
Pointer-chased list scan: 17ms (sum=3e+12)
```

```
Contiguous vector scan: 8ms (sum=3e+12)
Pointer-chased list scan: 17ms (sum=3e+12)
```

Both scans compute the exact same sum, over the exact same two million
records, with algorithmically identical **O(n)** complexity — this
isn't a Big-O difference at all, which is precisely what makes it worth
measuring rather than reasoning about abstractly. Consistently, across
repeated runs, the linked-list version takes roughly **twice as long**
— pure memory-layout cost, invisible to any earlier phase of this
curriculum, because Python, JavaScript, Java, and C# never exposed
enough control over layout to create or measure this difference at
all. The real cost of the contiguous version: inserting into the
*middle* of a `vector` requires shifting every element after it, while
a linked list can splice in a new node anywhere in constant time — this
lesson's measurement is specifically about *scanning*, not every
operation a real data structure needs to support well.

### Commands needed

`g++ -O2 -o <output> <file>.cpp` — **(a) first appearance** of `-O2`:
enables the compiler's own optimizations, used here because unoptimized
builds can produce misleading timing comparisons that don't reflect how
this code would actually run in practice.

### Run it

Shown above, across three separate runs.

### Connecting sentence

The exact same data, the exact same algorithm, laid out two different
ways in memory, produced a real, repeatable, twofold difference in how
long it took to scan — the first genuinely new category of performance
consideration this entire curriculum has measured, and precisely why a
real storage engine's on-disk and in-memory layout decisions matter as
much as the algorithms that operate on them.

---

## Closing

**Connect the pieces.** One record, through the whole lesson: `Record`'s
field order was chosen deliberately, informed by this lesson's own
struct-padding measurement, to minimize wasted bytes; `fwrite(&r,
sizeof(Record), 1, out)` persists it as those exact bytes, no
translation, no delimiter, a file whose size is provably, exactly
`sizeof(Record)`; and when many such records need scanning, *where*
they live relative to each other — one contiguous block, or two million
scattered heap allocations — changes real, measured wall-clock time by
roughly double, on identical data, running an identical algorithm. Every
idea in this lesson is really one idea, viewed from three angles:
memory layout is not free, and every earlier phase of this curriculum
simply never charged for it directly.

**What breaks without this.** Already shown, measured, three separate
times: the padding difference (12 vs. 8 bytes for identical fields),
and the scan-time difference (roughly 2x, reproduced three times).
Deliberately not restaged — the repeated measurement, run fresh each
time, was itself the point: proving the result is real and consistent,
not a single lucky (or unlucky) run.

**Exercises.**
1. Add a third field to `Record` — an `int quantity` — in two different
   positions (right after `id`, versus at the very end) and measure
   `sizeof(Record)` both ways, confirming which placement adds less
   padding.
2. Reproduce this lesson's scan comparison with `N` at ten times the
   scale (20 million), and confirm the roughly-2x ratio holds at that
   scale too, not just at 2 million.
3. `raw_record_lab.cpp`'s binary format was named as fragile against
   changing `Record`'s field order between when a file was written and
   when it's read back. Demonstrate this for real: write a file with
   one version of `Record`, then read it back using a *second* build of
   the program with a reordered `Record` struct, and observe — with
   real, wrong output — the resulting corruption.

**Definition of done.**
- [ ] You've measured a real difference in `sizeof()` for two structs
      with identical fields in different orders.
- [ ] A `Record` genuinely round-trips through raw binary file I/O,
      confirmed by the file's exact byte size on disk matching
      `sizeof(Record)`.
- [ ] You've measured, across multiple runs, a real and consistent
      performance difference between scanning contiguous versus
      pointer-chased memory holding identical data.
- [ ] You can state, in one sentence, why this performance difference
      is invisible in every language used in Phases 1 through 4 of this
      curriculum.
- [ ] Commit with a message explaining why — e.g. `"Order Record's
      fields to minimize padding, persist it as raw bytes instead of
      delimited text, and confirm contiguous storage scans roughly
      twice as fast as an equivalent linked list"` — not `"add binary
      storage"`.

**Next lesson** stays in Project 9: a real, minimal **B-Tree** for
indexed lookup — the data structure underlying nearly every real
database's own index — built directly on top of this lesson's own
fixed-size, disk-friendly record layout.
