# Lesson 35: Smaller When It Helps, Walkable Without Exposure
### (Project 11 — Mini Git, C++)

**What you will build.** A real, working compression algorithm — run-
length encoding — wired into `BlobStore` with an honest safeguard: only
actually use the compressed form when it's genuinely smaller, proven
against both a case where it helps enormously and a plausible, realistic
case where it doesn't help at all. Then a real `CommitIterator`, letting
`for (const Commit& c : repo)` walk this project's own commit history
directly, with `Repository`'s internal storage never exposed to the
caller. The transferable problem this lesson is actually about: a
"smart" optimization that isn't checked against the case where it makes
things worse isn't actually smart, and a container should let callers
walk its contents without ever needing to know how those contents are
actually stored.

**What you need to know first.** Lesson 32 — `BlobStore`,
content-addressed storage. Lesson 33 — `Repository`, `Commit`,
`parentHash` chaining, which this lesson's iterator walks directly.

---

## Concept Unit: Run-Length Encoding

### The Problem

Every blob this project stores (Lesson 32) is kept exactly as large as
its original content. Real Git compresses its stored objects — this
project's own storage should too, at least for content where
compression genuinely helps.

### Project Change

- **Reference Source** — No reference counterpart; from-scratch.
- **Files affected** — created `rle_lab.cpp` (throwaway, this unit
  only).
- **Change type** — add.
- **Location** — new file, new project directory.
- **Dependencies** — none beyond `g++`.

### The New Code

```cpp
std::string compress(const std::string& input) {
    std::string result;
    size_t i = 0;
    while (i < input.size()) {
        char current = input[i];
        int count = 0;
        while (i < input.size() && input[i] == current) {
            count++;
            i++;
        }
        result += current;
        result += std::to_string(count);
    }
    return result;
}
```

### The Updated Project

Brand-new throwaway file, shown whole above.

### Introduce the concept in isolation

```cpp
std::string data = "aaaaabbbccccccccdd";
std::string compressed = compress(data);
```

Real output:

```
Original:   aaaaabbbccccccccdd (18 bytes)
Compressed: a5b3c8d2 (8 bytes)
```

Eighteen bytes became eight — `aaaaa` (5 `a`s) became `a5`, `bbb` (3
`b`s) became `b3`, and so on. This is **run-length encoding (RLE)**: a
genuinely real, if simple, compression technique — replacing a *run* of
repeated characters with the character plus a count, rather than
storing every repetition individually.

### Discard the throwaway example

`rle_lab.cpp`'s `compress` is deleted — its algorithm carries forward
directly into a real, complete, reversible version.

### Project Change (compress and decompress, together)

- **Reference Source** — No reference counterpart; from-scratch.
- **Files affected** — created `rle_full.cpp`.
- **Change type** — add.
- **Location** — new file.
- **Dependencies** — `<cctype>`.

### The New Code

```cpp
std::string decompress(const std::string& input) {
    std::string result;
    size_t i = 0;
    while (i < input.size()) {
        char c = input[i];
        i++;
        std::string countStr;
        while (i < input.size() && std::isdigit(input[i])) {
            countStr += input[i];
            i++;
        }
        int count = std::stoi(countStr);
        result.append(count, c);
    }
    return result;
}
```

### The Updated Project

Brand-new file, shown whole above, alongside `compress` — a complete,
reversible pair for the first time.

### Mechanical walkthrough

- `char c = input[i]; i++;` — **(c) already basic**: reads the
  character starting this run.
- `std::string countStr; while (i < input.size() && std::isdigit(input[i])) { countStr += input[i]; i++; }`
  — **(a) first appearance,** conceptually: reads *every* consecutive
  digit character following the run's character — necessary because a
  count can be more than one digit long (`c8` has a single-digit count,
  but a run of 23 characters would produce `c23`, a two-digit count
  `decompress` has to read in full before converting it).
- `result.append(count, c);` — **(a) first appearance** of this
  specific `std::string::append` overload: appends the character `c`,
  repeated `count` times, in one call — the direct reverse of
  `compress`'s own counting loop.

### CS lens

RLE is a real, named **lossless compression** algorithm: the original
data can be reconstructed *exactly* from the compressed form, with
nothing lost — distinct from **lossy** compression (JPEG, MP3), which
discards some information permanently in exchange for much higher
compression ratios on the specific kinds of data it targets. Also
recognized in: fax machine transmission (RLE's own classic real-world
use case — mostly-white pages compress extremely well), simple bitmap
image formats, real Git's own use of zlib (a genuinely more
sophisticated algorithm, but solving the identical underlying problem
this unit's small version solves).

### SE lens

Proven directly — the round trip, and a real, honest limitation:

```cpp
std::string restored = decompress(compressed);
std::cout << "Round-trip correct? " << (data == restored) << std::endl;

std::string realistic = "The quick brown fox jumps over the lazy dog";
std::string compressedRealistic = compress(realistic);
```

Real output:

```
Round-trip correct? 1

--- a real, honest limitation ---
Original:   43 bytes
Compressed: 86 bytes
Compression helped? 0
```

The round trip is genuinely correct — but ordinary English text, with
almost no repeated characters in a row, **doubles in size** under this
scheme: every single, non-repeated character still costs two bytes
(the character plus its count, `1`) instead of one. RLE is not a
general-purpose compressor — it's only effective on data with long runs
of repetition, and using it blindly on data without that property makes
things *worse*, not better. This is exactly why the next unit's real
storage code checks before committing to compression, rather than
applying it unconditionally.

### Commands needed

`g++ -std=c++17 -o <output> <file>.cpp`, same pattern as every lesson
in this project.

### Run it

Shown above.

### Connecting sentence

Compression genuinely works, and genuinely can backfire — the next unit
builds real storage that checks which case it's in before committing to
either.

---

## Concept Unit: Compressing Only When It Helps

### The Problem

Blindly compressing every blob, the way the previous unit's numbers
proved, would make plenty of real content *larger*, not smaller. A real
`BlobStore` needs to check, per blob, whether compression actually
helps, and only use it when it does.

### Project Change

- **Reference Source** — No reference counterpart; from-scratch.
- **Files affected** — modified `BlobStore` (Lesson 32).
- **Change type** — add (compression, with a size check, wired into
  `store`/`retrieve`).
- **Location** — inside `class BlobStore`.
- **Dependencies** — `compress`/`decompress`, this lesson's previous
  unit.

### The New Code

```cpp
std::string store(const std::string& content) {
    std::string hash = toHex(fnv1a(content));
    std::string compressed = compress(content);
    bool useCompression = compressed.size() < content.size();
    blobs[hash] = useCompression ? compressed : content;
    wasCompressed[hash] = useCompression;
    return hash;
}

std::string retrieve(const std::string& hash) {
    const std::string& stored = blobs.at(hash);
    return wasCompressed.at(hash) ? decompress(stored) : stored;
}
```

### The Updated Project

`BlobStore` gains a second map, `wasCompressed`, tracking — per hash —
whether the stored bytes are the compressed form or the raw original,
so `retrieve` knows exactly how to reverse it correctly either way.

### Mechanical walkthrough

- `bool useCompression = compressed.size() < content.size();` — **(a)
  first appearance,** conceptually: the actual safeguard — comparing
  sizes *before* deciding what to store, directly answering this
  lesson's own previous unit's honest limitation.
- `blobs[hash] = useCompression ? compressed : content;` — **(b) hard
  concept reappearing**: the conditional expression from Project 2,
  Lesson 5, choosing between two genuinely different values to store.
- `return wasCompressed.at(hash) ? decompress(stored) : stored;` —
  **(b) hard concept reappearing**: the exact mirror on the read side —
  `retrieve` never gets this wrong, because the decision made at store
  time is remembered, not re-derived or guessed.

### CS lens

Nothing new beyond what the previous unit already established about
RLE — this unit's real content is the *policy* wrapped around it:
measure, then decide, rather than assume.

### SE lens

Proven directly, both outcomes, against genuinely different real
content:

```cpp
std::string indentedCode =
    "function padded() {\n"
    "                                return 0;\n"
    "}\n";
auto h1 = store.store(indentedCode);
```

```
--- realistic source snippet ---
stored raw: 64 -> 64 bytes
Round-trip correct? 1
```

This result is worth sitting with, because it's genuinely surprising at
first glance: this snippet *has* a long run of repeated spaces (32 of
them), which looks like exactly the kind of thing RLE should compress
well — and yet the safeguard correctly declined. The reason: every
*other* character in the snippet — nearly all of it — is part of a
run of length one, and RLE's own two-bytes-per-run overhead on all of
those non-repeated characters outweighs the real savings from the one
long space run. The safeguard isn't just protecting against an obvious
case like plain English prose; it correctly caught a *plausible,
realistic* case too.

```cpp
std::string blankFile(2000, '\0');
auto h2 = store.store(blankFile);
```

```
--- a 2000-byte all-zero placeholder file ---
compressed: 2000 -> 5 bytes
Round-trip correct? 1
```

And for content that's genuinely, overwhelmingly repetitive — a
2000-byte placeholder file, all zero bytes — the savings are dramatic:
**400 times smaller**, correctly compressed, correctly restored. Both
results together are the actual point: a real storage layer has to
measure and decide per-item, not assume one policy fits every case.

### Commands needed

Same pattern.

### Run it

Both shown above.

### Connecting sentence

Storage now shrinks exactly when shrinking genuinely helps, and never
otherwise — the final unit turns to a different kind of interface
design: letting this project's commit history be walked without
exposing how it's actually stored.

---

## Concept Unit: The Iterator Pattern

### The Problem

Lesson 33's `Repository::log()` hardcodes exactly one thing to do while
walking history: print each commit's message. Any *other* operation
over history — collecting messages into a list, searching for one
matching a condition, counting commits — would need its own, separately
written traversal loop, each one re-implementing the same
"follow `parentHash` until empty" logic `log()` already has.

### Project Change

- **Reference Source** — No reference counterpart; from-scratch.
- **Files affected** — created `iterator_lab.cpp` (throwaway, this unit
  only).
- **Change type** — add.
- **Location** — new file.
- **Dependencies** — none new.

### The New Code

```cpp
class NumberList {
public:
    void add(int n) { numbers.push_back(n); }

    class Iterator {
    public:
        Iterator(const std::vector<int>& data, size_t pos) : data(data), pos(pos) {}
        bool operator!=(const Iterator& other) const { return pos != other.pos; }
        void operator++() { pos++; }
        int operator*() const { return data[pos]; }
    private:
        const std::vector<int>& data;
        size_t pos;
    };

    Iterator begin() const { return Iterator(numbers, 0); }
    Iterator end() const { return Iterator(numbers, numbers.size()); }

private:
    std::vector<int> numbers;
};
```

### The Updated Project

Brand-new throwaway file, shown whole above.

### Introduce the concept in isolation

```cpp
NumberList list;
list.add(10);
list.add(20);
list.add(30);

for (int n : list) {
    std::cout << n << " ";
}
```

Real output:

```
10 20 30
```

`for (int n : list)` — the exact same range-based `for` syntax used
for `std::vector` throughout this entire phase — works on a completely
custom class, with no built-in support from the language beyond three
specific operators: `operator!=` (when does iteration stop),
`operator++` (how to advance), and `operator*` (how to read the current
value), plus `begin()`/`end()` to produce the starting and ending
iterator. Nothing about `list`'s own internal `std::vector<int>` is
ever exposed directly — the caller never touches `numbers` itself.

### Discard the throwaway example

`iterator_lab.cpp`'s `NumberList`/`Iterator` are deleted — the exact
`begin()`/`end()`/three-operator shape carries forward directly into
`Repository`.

### Project Change (real code)

- **Reference Source** — No reference counterpart; from-scratch.
- **Files affected** — modified `Repository` (Lesson 33).
- **Change type** — add (`CommitIterator`, `begin`, `end`).
- **Location** — inside `class Repository`.
- **Dependencies** — `Commit`, `parentHash` chaining, Lesson 33.

### The New Code

```cpp
class CommitIterator {
public:
    CommitIterator(const std::unordered_map<std::string, Commit>* store, std::string current)
        : store(store), current(current) {}

    bool operator!=(const CommitIterator& other) const { return current != other.current; }
    void operator++() { current = store->at(current).parentHash; }
    const Commit& operator*() const { return store->at(current); }

private:
    const std::unordered_map<std::string, Commit>* store;
    std::string current;
};

CommitIterator begin() const { return CommitIterator(&commits, headHash); }
CommitIterator end() const { return CommitIterator(&commits, ""); }
```

### The Updated Project

`Repository` gains a nested `CommitIterator` class and two methods,
`begin`/`end` — no changes needed to `commit`, `log`, or `checkout`
from Lesson 33 at all.

### Mechanical walkthrough

- `void operator++() { current = store->at(current).parentHash; }` —
  **(a) first appearance,** as applied here: "advancing" this iterator
  means following the *current* commit's `parentHash` — the exact
  traversal `log()` already performed with an explicit `while` loop,
  now expressed as what "moving to the next element" *means* for this
  specific container.
- `CommitIterator end() const { return CommitIterator(&commits, ""); }`
  — **(a) first appearance,** conceptually: `end()` doesn't point past
  a real commit — it represents the *empty* `parentHash`, exactly the
  same natural stopping condition `log()`'s own `while (!current.empty())`
  already checked for.

### CS lens

This is the **Iterator pattern**: providing a uniform way to walk a
collection's elements sequentially without exposing that collection's
underlying representation — a `std::vector`, a `std::unordered_map`
chained by hash, or anything else. Also recognized in: every container
in the C++ standard library itself (`std::vector`, `std::map`, all of
them expose exactly this `begin()`/`end()` shape), Python's own
iterator protocol (`__iter__`/`__next__`, never explicitly built by
hand anywhere in Phase 1, since Python's own built-in containers always
provided it), Java's `Iterator` interface and C#'s `IEnumerable` — both
formalizing the identical idea as a real, named interface rather than
operator overloading.

### SE lens

Proven directly — real commit history, walked with the exact same loop
syntax used for a plain `std::vector` anywhere else in this curriculum:

```cpp
for (const Commit& c : repo) {
    std::cout << c.hash().substr(0, 8) << " " << c.message << std::endl;
}
```

Real output:

```
f14dc4ef Fix bug in feature A
8e248701 Add feature A
35b0aaec Initial commit
```

`Repository`'s own internal `unordered_map<std::string, Commit> commits`
is never touched directly by this loop — the caller has no idea, and no
need to know, that commits are stored in a hash map at all, chained by
string keys rather than, say, real pointers. That decoupling is the
entire payoff: `Repository` could switch its internal storage to
something completely different tomorrow, and every piece of code using
`for (const Commit& c : repo)` would keep working, unchanged.

### Commands needed

Same pattern.

### Run it

Shown above.

### Connecting sentence

This project's commit history can now be walked with the same natural
syntax as any built-in container, with `Repository`'s own storage
decisions kept entirely private — closing this project on the same
principle it opened with in Lesson 32: identify and access things by
what they are, never by how they happen to be stored underneath.

---

## Closing

**Connect the pieces.** One repository, exercised by everything this
lesson built: a blob's content is measured, and only compressed when
compression genuinely helps — proven both ways, a realistic near-miss
correctly stored raw, a genuinely repetitive file correctly shrunk
400-fold. That same repository's commit history — built in Lesson 33,
diffed and visited in Lesson 34 — can now be walked with
`for (const Commit& c : repo)`, exactly the syntax this entire
curriculum has used for `std::vector` since Phase 5 began, with
`Repository`'s own internal `unordered_map` never once exposed to the
code doing the walking.

**What breaks without this.** Already shown, precisely, twice: the
realistic snippet where compression would have made storage *larger*
had the safeguard not caught it, and the exact numbers proving both the
success and near-miss cases — deliberately not restaged, since both
landed exactly where they were measured.

**Exercises.**
1. Add a `compressionRatio()` method to `BlobStore` reporting the
   overall ratio of total stored bytes to total original bytes across
   every blob ever stored, and test it against a mix of compressible
   and incompressible content.
2. Write a second iterator, `CommitIterator::Range`, that stops after a
   given number of commits instead of walking all the way to the first
   one — useful for something like `git log -n 5`.
3. RLE's real weakness, proven in this lesson, is single-character runs.
   Research a slightly more sophisticated real scheme — such as only
   encoding runs of length 3 or more, leaving short runs as literal
   characters — and describe, in a few sentences, how it would need to
   mark the difference between "this is a literal character" and "this
   is a run" during decompression.

**Definition of done.**
- [ ] `compress`/`decompress` correctly round-trip real data, confirmed
      against real output.
- [ ] `BlobStore` correctly declines compression for content where it
      wouldn't help, and correctly compresses content where it helps
      dramatically — both confirmed against real, measured output.
- [ ] `Repository` supports `for (const Commit& c : repo)` directly,
      confirmed by real output walking real commit history, with no
      code outside `Repository` ever touching its internal storage.
- [ ] Commit with a message explaining why — e.g. `"Compress blobs with
      RLE only when it measurably helps, proven against both a
      realistic near-miss and a genuinely repetitive file, and expose
      commit history through a real Iterator instead of Repository's
      internal map"` — not `"add compression and iteration"`.

**This closes Project 11, and this curriculum's C++ phase.** Across
Lessons 23–35: manual memory and RAII, smart pointers and a measured
reference-cycle leak, cache locality, a from-scratch B-Tree, a complete
lexer/parser/AST/execution pipeline, real graph algorithms for a
package manager, and — closing Mini Git — content-addressed storage,
Merkle trees, real commits, Visitor, compression, and Iterator, each one
arriving because the project genuinely needed it. **Phase 7** moves to
Software Engineering at scale: authentication, monitoring, distributed
systems, and architecture itself — where the patterns this curriculum
has built one class at a time become the shape of entire systems.
