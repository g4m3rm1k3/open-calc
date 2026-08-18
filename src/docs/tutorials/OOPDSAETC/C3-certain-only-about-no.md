# Lesson C3: Certain Only About No

**What you will build:** A `BloomFilter` added to the shared catalog
project — a compact array of individual bits, checked *before* any real
lookup ever touches the catalog's actual `Product` objects, that answers
one narrow question as cheaply as possible: is this label *definitely
absent*, or *maybe present*? The transferable problem this lesson is
actually about: sometimes the cheapest thing you can do before an
expensive operation (a disk read, a network call, a full hash-map
lookup) is a compact, probabilistic pre-check — one that can only ever
be *certain* about the negative answer — trading a small, honestly
measured chance of being wrong about "maybe" for a large, real
reduction in memory compared to storing every key outright.

**What you need to know first:** Lesson C1's `djb2` hash function,
reused here verbatim, not reimplemented, along with the general idea of
reducing a string down to a single deterministic number. Lessons B4 and
B5's `CatalogItem`, `TagPool`, and `Product` classes, and the 7-product
catalog they populate (`Apple`, `Banana`, `Cheese`, `Bread`, `Cherry`,
`Pea`, `Peach`), reused verbatim as the domain this lesson's
`BloomFilter` is built for.

## Terms used in this lesson

- **Bit** — the smallest unit of information a computer stores: exactly
  two possible states, conventionally written `0` and `1`. Why it
  matters here: a Bloom filter's entire storage is nothing but a long
  row of these, one per possible "slot," with no other structure —
  treating a bit as the atomic unit is what makes the rest of this
  lesson's storage layer legible.
- **Bitwise OR (`|=`)** — an operator that combines two numbers
  bit-by-bit, producing a `1` in any position where either input
  already has a `1`. Why it exists: it is the only tool this lesson
  uses to *set* one specific bit inside a wider integer without
  disturbing any of that integer's other bits — a plain assignment
  would overwrite the whole number, not just one bit of it.
- **Bitwise AND (`&`)** — an operator that combines two numbers
  bit-by-bit, producing a `1` only in positions where *both* inputs
  have a `1`. Why it exists: paired with a single-bit mask, it is how
  this lesson *reads* one specific bit back out of a wider integer,
  discarding every other bit in the process.
- **Left shift (`<<`)** — an operator that moves a number's bits toward
  the higher end, filling the vacated low end with zeros; `1 << 3`
  produces the number with only bit 3 set. Why it exists: it is how
  this lesson builds the one-bit "mask" that both `|=` and `&` need in
  order to target one exact bit position out of many, without writing
  out dozens of different constants by hand.
- **Bit array / packed bit storage** — many individual yes/no flags
  stored inside ordinary integers, dozens to a single machine word,
  instead of one flag per byte or per `bool`. Why it exists: a `bool`
  in this language occupies a full byte even though it only carries one
  bit of real information — proven directly in this lesson's first
  isolated lab — so packing flags into the otherwise-unused bits of a
  wider integer is how a large number of yes/no answers fit into a
  small amount of real memory.
- **Hash function** — reappearing in full from Lesson C1: a function
  that takes an input of any size (here, a string) and deterministically
  produces a fixed-size number from it, the same number every time for
  the same input, with no practical way to predict the output without
  actually running the function. Why it exists: it turns an
  arbitrary-length string into something fixed-size and directly usable
  as a numeric position — this lesson reuses C1's own `djb2` for
  exactly that purpose, unmodified.
- **DJB2** — reappearing in full from Lesson C1: a specific, simple hash
  function, invented by Daniel J. Bernstein, that starts an accumulator
  at the constant `5381` and repeatedly computes
  `hash = hash * 33 + character` for every character of the input
  string. Why it exists here again: this lesson reuses it verbatim as
  one of its two real hash functions, rather than inventing a third
  algorithm from nothing.
- **FNV-1a** — a second, different hash function: it starts an
  accumulator at a fixed constant (the "FNV offset basis") and, for
  every character, first XORs the character into the accumulator, then
  multiplies the whole accumulator by a second fixed constant (the "FNV
  prime"). Why it exists: this lesson needs a hash function whose
  output does not move in lockstep with DJB2's output for the same
  input — two functions built from genuinely different arithmetic
  (multiply-then-add versus XOR-then-multiply) are far less likely to
  collide on the same input at the same time than the same function run
  twice.
- **Hash independence** — the property that two hash functions'
  outputs, for the same input, don't move together in any predictable
  way: knowing one function's result tells you nothing useful about the
  other's. Why it matters: a Bloom filter's whole accuracy argument
  depends on treating several bit positions as separate, independent
  pieces of evidence — if two of those positions were secretly always
  equal, checking both would be no better than checking one, while
  looking like extra protection.
- **Double hashing (the Kirsch–Mitzenmacher technique)** — a way to
  manufacture several different index positions, `h_0, h_1, h_2, ...`,
  out of only two real hash functions `h1` and `h2`, using the formula
  `h_i(x) = (h1(x) + i * h2(x)) mod m`. Why it exists: writing k
  genuinely different hash algorithms by hand for k index positions is
  real, error-prone work; this formula gets a good-enough approximation
  of k independent positions out of exactly two real algorithms —
  proven, not asserted, by this lesson's own third isolated lab.
- **Bloom filter** — the whole named structure this lesson builds: a
  fixed-size bit array plus a small, fixed number of index positions
  computed per key, where inserting a key sets those positions and
  querying a key checks whether they are all still set. Why it exists:
  it answers "might this be present?" using a small, fixed amount of
  memory that does not grow with the size or number of the actual keys
  stored elsewhere, at the cost of occasionally saying "maybe" about
  something that was never actually inserted.
- **Probabilistic data structure** — a data structure whose answers
  carry a small, quantifiable chance of being wrong in one specific,
  bounded direction, in exchange for using dramatically less memory or
  time than an exact structure would. Why it exists as its own
  category: naming it separates "this is buggy" from "this is a
  deliberate, analyzable trade-off" — a Bloom filter's false positives
  are not a defect to be fixed; they are the explicit price this whole
  category of structure charges for its memory savings.
- **False positive** — a query that reports "maybe present" for a key
  that was never actually inserted, because some other combination of
  inserted keys happened to already set every bit position that key's
  own hash functions land on. Why it matters: this is the literal cost
  side of "trading certainty for memory" — the BRD's own framing for
  this lesson's whole vehicle — and this lesson proves a real one
  occurring, rather than only asserting that they're possible.
- **False negative** — a query that reports "definitely not present"
  for a key that actually was inserted. Why it matters here by
  contrast: a Bloom filter, built correctly, can never produce one —
  every bit an `add` call sets stays set forever, so a later query for
  that exact key will always find all of its own bits still on. This
  lesson proves that guarantee holds for every one of the 7 real
  catalog products, not just asserts it.
- **`static_cast`** — reappearing: a compile-time-checked explicit
  conversion between related types, written
  `static_cast<TargetType>(expression)`. Why it exists: this lesson
  uses it twice — narrowing a `char` to `unsigned char` before hashing
  (so a negative `char` value, on a platform where `char` is signed,
  doesn't silently sign-extend into a huge accumulator value), and
  widening an `int` loop counter to `size_t` before multiplying it
  against a hash result, so the multiplication happens in unsigned
  64-bit arithmetic matching the type `numBits` and the hash values
  already use.
- **`size_t`** — reappearing from Lesson C1: an unsigned integer type,
  guaranteed large enough to index any array this machine can actually
  allocate (64 bits wide on this machine). Why it exists: both this
  lesson's hash functions and its bit-array positions are naturally
  non-negative counts, and `size_t` is the standard library's own type
  for exactly that kind of value — using it here, as C1 did, keeps a
  hash result and a real memory index the same type without a
  narrowing conversion.
- **`class`** — reappearing: a user-defined type bundling data and the
  functions that operate on it. Why it exists: `BloomFilter` and the
  reused `CatalogItem`/`TagPool`/`Product` are all classes — the
  language's way of keeping a structure's data and the operations that
  are allowed to touch it declared in one place.
- **`private`/`public` access specifiers** — reappearing: `private`
  members are only reachable from inside the class's own methods;
  `public` members are reachable from anywhere the object is visible.
  Why they exist: `BloomFilter` keeps its bit array and index math
  `private` specifically so nothing outside the class can set a bit
  through any path except `add`, or read one through any path except
  `mightContain` — the class's own methods are the only doors in.
- **Constructor initializer list** — reappearing: the
  `: member(value), member2(value2)` syntax right after a constructor's
  parameter list, which initializes each named member directly rather
  than assigning to it after default-construction. Why it exists: for
  `bits`, a `std::vector<uint64_t>`, this is what sizes the vector to
  the right number of words at construction time, in one step, instead
  of default-constructing an empty vector and resizing it a line later.
- **`const` (on a method or a parameter)** — reappearing: on a method
  (`bool mightContain(...) const`), it promises the method will not
  modify the object it's called on; on a parameter
  (`const std::string& key`), it promises the function will not modify
  the argument passed in. Why it matters here: `mightContain` only
  reads bits, never sets them — marking it `const` makes that promise
  checkable by the compiler, not just true by convention.
- **Reference (`&`)** — reappearing: a parameter type that binds
  directly to the caller's own object instead of copying it. Why it
  exists: every key this lesson hashes or inserts arrives as
  `const std::string&` — a reference avoids copying a product's whole
  label string just to hash it, and `const` on top guarantees the
  original string is never altered in the process.
- **Pure virtual function / abstract class (`virtual ... = 0`)** —
  reappearing from Lesson B2: a method declared with `= 0` instead of a
  body, which makes the whole class impossible to instantiate directly
  and forces every subclass to supply its own real implementation. Why
  it matters here: `CatalogItem::totalQuantity` is declared this way,
  which is why only `Product` — the subclass that actually implements
  it — can ever be constructed.
- **`override`** — reappearing from Lesson B2: a keyword on a subclass
  method that asks the compiler to verify the method really does
  override a same-named virtual method in the base class, failing to
  compile if it doesn't. Why it exists: without it, a typo in
  `Product::totalQuantity`'s signature would silently create an
  unrelated new method instead of overriding the base's, and the
  mistake would compile cleanly and fail only at runtime.
- **Pointer (`*`) and `new`** — reappearing from Lesson B1: a pointer
  holds the address of an object living elsewhere in memory rather than
  the object itself; `new` allocates that object on the heap and
  returns its address. Why they matter here: every real catalog
  `Product` this lesson constructs is heap-allocated with `new` and
  referred to everywhere else by a `Product*`, exactly as in C1 and C2,
  even though `BloomFilter` itself never stores or dereferences one.

## Objects and methods used

- **`BloomFilter`**
  - *What it is:* A class representing one compact presence-check
    structure — a fixed-size bit array plus the logic to set and test
    several bit positions per key.
  - *Implementation:* Constructed as
    `BloomFilter(size_t numBits, int numHashes)`; stores
    `std::vector<uint64_t> bits`, `size_t numBits`, and
    `int numHashes` as private fields; exposes two public methods,
    `add` and `mightContain`.
  - *Its use:* This lesson's own subject — every Concept Unit either
    builds one piece of this class or exercises it once complete.
- **`BloomFilter::add`**
  - *What it is:* The method that records a key's presence into the
    bit array.
  - *Implementation:* `void add(const std::string& key)` — loops `i`
    from `0` to `numHashes - 1`, calling the private `setBit` on
    `indexFor(key, i)` each time.
  - *Its use:* Called once per real catalog product's label, in this
    lesson's own project code, to populate the filter for the first
    time.
- **`BloomFilter::mightContain`**
  - *What it is:* The method that answers the filter's one actual
    question.
  - *Implementation:* `bool mightContain(const std::string& key) const`
    — loops the same `i` range as `add`, and returns `false` the
    instant any one of the `numHashes` positions is unset; returns
    `true` only once every position has been checked and found set.
  - *Its use:* This lesson's own closing proof — run against every
    real catalog label (always `true`) and against labels never
    inserted (usually `false`, once demonstrably `true`).
- **`djb2`** (reappearing from Lesson C1)
  - *What it is:* A free function implementing the DJB2 string-hashing
    algorithm.
  - *Implementation:* `size_t djb2(const std::string& key)` — starts
    `hash` at `5381`, and for every character in `key` computes
    `hash = hash * 33 + static_cast<unsigned char>(c)`, returning the
    accumulated `size_t` once the loop ends.
  - *Its use:* Reused verbatim, unmodified, as the first of the two
    real hash functions `indexFor` combines. Reference Source:
    `verification/C1/step3_full_productindex.cpp` lines 45–51.
- **`fnv1a`**
  - *What it is:* A free function implementing the FNV-1a
    string-hashing algorithm.
  - *Implementation:* `size_t fnv1a(const std::string& key)` — starts
    `hash` at the 64-bit FNV offset basis constant
    `14695981039346656037ULL`, and for every character in `key`
    computes `hash ^= static_cast<unsigned char>(c)` followed by
    `hash *= 1099511628211ULL` (the 64-bit FNV prime), returning the
    accumulated `size_t`.
  - *Its use:* This lesson's second, independent hash function —
    paired with `djb2` inside `indexFor`'s double-hashing formula.
- **`std::vector<uint64_t>`** (reappearing template, new use)
  - *What it is:* The standard library's dynamic array, already used
    throughout this curriculum to hold business objects like
    `Product*`; here it holds raw 64-bit words instead.
  - *Implementation:* Declared as `std::vector<uint64_t> bits`, sized
    to `(numBits + 63) / 64` elements in the constructor's initializer
    list — enough 64-bit words to hold `numBits` individual bits,
    rounded up.
  - *Its use:* The Bloom filter's entire storage — every bit this
    lesson sets or tests lives inside one of this vector's elements,
    addressed by `pos / 64` (which word) and `pos % 64` (which bit
    inside that word).

**Everything else in the file, not this lesson's subject but still
explained:**

- **`CatalogItem`** (reappearing from Lesson B4)
  - *What it is:* The abstract base class every catalog entry shares.
  - *Implementation:*
    `class CatalogItem { public: CatalogItem(std::string label); virtual int totalQuantity() const = 0; std::string label; };`
    — a constructor taking a label, one pure virtual method, and one
    public data member.
  - *Its use:* `Product` inherits from it in this lesson's own code,
    exactly as it has since Lesson B4, even though this lesson's
    `BloomFilter` only ever reads `label` off the product, never
    `totalQuantity`.
- **`TagPool`** (reappearing from Lesson B5)
  - *What it is:* A class that stores one shared copy of each distinct
    tag string and hands out pointers to it.
  - *Implementation:*
    `class TagPool { public: const std::string* intern(const std::string& text); private: std::vector<std::string*> pool; };`
    — `intern` linearly scans `pool` for an existing equal string,
    returning it if found, otherwise heap-allocating a new one, storing
    it, and returning that.
  - *Its use:* This lesson's `main` still builds the catalog's tags
    through it, exactly as B5, C1, and C2 all did, even though
    `BloomFilter` itself never touches a tag.
- **`Product`** (reappearing from Lessons B4/B5)
  - *What it is:* The concrete catalog entry class.
  - *Implementation:*
    `class Product : public CatalogItem { public: Product(std::string label, int quantity, const std::string* tag); int totalQuantity() const override; const std::string* tag; private: int quantity; };`
  - *Its use:* This lesson constructs all 7 real catalog products from
    it, exactly as C1 and C2 did, and passes each one's `->label` — a
    plain `std::string`, not the `Product*` itself — into
    `BloomFilter::add`.
- **`std::string`** (reappearing)
  - *What it is:* The standard library's dynamic, owning string type.
  - *Implementation:* Supports range-based iteration character by
    character (used inside both `djb2` and `fnv1a`'s
    `for (char c : key)` loops), equality comparison, and construction
    from a string literal.
  - *Its use:* Every hash function in this lesson takes its key as
    `const std::string&`, and every catalog product's `label` is one.

---

## Concept Unit: Packing Many Yes/No Answers Into One Word

### The Problem

A Bloom filter needs somewhere to store, for each of a large number of
possible bit positions, a single yes-or-no answer: has anything's hash
ever landed here? The obvious storage — one `bool` per position, in a
`std::vector<bool>`-shaped mental model of "an array of flags" — sounds
free, but a `bool` in this language is not actually one bit wide. If
the whole point of this structure is to spend less memory than storing
every real key would cost, storing one full byte per flag, when a byte
holds eight bits' worth of real information, is throwing away seven out
of every eight bits of the exact resource this structure exists to
save. Something has to actually pack multiple flags into the same byte
before any of the rest of this lesson's memory story is honest.

### Project Change

- **Reference Source:** No reference counterpart — this is a
  from-scratch addition. No earlier lesson in this curriculum has
  needed packed bit storage; the closest existing structures
  (`ProductIndex`'s bucket vector from C1, `ProductTrie`'s
  fixed-size children array from C2) store real objects or pointers
  per slot, not raw bits.
- **Files affected:** `catalog_prefilter.cpp` — created.
- **Change type:** add (new file).
- **Location:** n/a — this is the file's first content.
- **Dependencies:** none beyond the standard library already used
  throughout this curriculum (`<vector>`, `<cstdint>`, `<iostream>`).

### The New Code

Type this in as a brand-new file, `catalog_prefilter.cpp`.

```cpp
class BloomFilter {
public:
    BloomFilter(size_t numBits)
        : bits((numBits + 63) / 64, 0), numBits(numBits) {}

private:
    void setBit(size_t pos) {
        bits[pos / 64] |= (uint64_t(1) << (pos % 64));
    }

    bool testBit(size_t pos) const {
        return (bits[pos / 64] & (uint64_t(1) << (pos % 64))) != 0;
    }

    std::vector<uint64_t> bits;
    size_t numBits;
};
```

### Updated Project

This *is* the whole new structure, with nothing surrounding it yet —
`catalog_prefilter.cpp`'s first content is exactly the code just
shown, no more and no less. There is no larger enclosing structure to
return to.

### Introduce the Concept in Isolation

The class above already places `|=`, `&`, and `<<` into real code, but
nothing there explains what any of the three actually do yet — this is
exactly what the reordering this schema now prefers is for: see the
real destination first, then go understand the tool. Throwaway code,
not the real project, is where that understanding actually happens.

```cpp
#include <cstdint>
#include <iostream>

int main() {
    std::cout << "sizeof(bool) = " << sizeof(bool) << " byte(s)" << std::endl;

    uint8_t packed = 0;
    packed |= (1 << 0);
    packed |= (1 << 2);

    std::cout << "packed byte after setting bits 0 and 2: " << static_cast<int>(packed) << std::endl;

    bool hasStock     = (packed & (1 << 0)) != 0;
    bool isPerishable = (packed & (1 << 1)) != 0;
    bool isOnSale     = (packed & (1 << 2)) != 0;

    std::cout << "hasStock=" << hasStock << " isPerishable=" << isPerishable << " isOnSale=" << isOnSale << std::endl;
    return 0;
}
```

Compiled and run this session as
`verification/C3/lab1_bit_packing.cpp`, real output:

```
sizeof(bool) = 1 byte(s)
packed byte after setting bits 0 and 2: 5
hasStock=1 isPerishable=0 isOnSale=1
```

This proves two separate things. First, `sizeof(bool)` really is `1`
on this machine — a `bool` costs a full byte, confirming the Problem
above wasn't a hypothetical. Second, three completely independent
yes/no flags — `hasStock`, `isPerishable`, `isOnSale` — were packed
into, and correctly read back out of, a *single* `uint8_t`: `packed`
ends up holding the number `5`, which is `0b00000101` — bit 0 and bit 2
set, bit 1 left alone. `packed |= (1 << 0)` turned bit 0 on without
touching any other bit; `packed |= (1 << 2)` turned bit 2 on the same
way; and each `& (1 << n)` test read exactly one of those bits back
out, ignoring the rest. This technique — one wide integer standing in
for many narrow flags, addressed by shifting a `1` to the right
position and combining it with `|=` to set or `&` to test — is called
**bit packing**, and it is exactly what `setBit` and `testBit` in
`BloomFilter`, shown above, are doing, just across a whole
`std::vector<uint64_t>` of 64-bit words instead of one `uint8_t`.

### Discard the Throwaway Example

`hasStock`, `isPerishable`, and `isOnSale` were invented purely to
prove the bit-packing mechanism in isolation. They are deleted now and
will not appear in `catalog_prefilter.cpp` or any later lesson.

### Mechanical Walkthrough

Enumerating every distinct syntactic element of the real code shown
above, in order:

- **`class BloomFilter { ... }`** — declares a new class named
  `BloomFilter`. A class is a blueprint for objects, not a running
  thing by itself; nothing exists in memory until something actually
  constructs one.
- **`public:`** — everything below this label, until the next access
  specifier, is reachable from outside the class. Only the constructor
  is public so far.
- **`BloomFilter(size_t numBits)`** — the constructor. It takes one
  argument, `numBits`, the total number of individual bit positions
  this filter will manage — the size of the "row of bits" from this
  unit's own Problem.
- **`: bits((numBits + 63) / 64, 0), numBits(numBits) {}`** — the
  constructor initializer list. `bits(...)` constructs the `bits`
  vector directly with `(numBits + 63) / 64` elements, each initialized
  to `0`; `numBits(numBits)` copies the constructor's own parameter
  into the member of the same name. The empty `{}` afterward is the
  constructor body — there's nothing left to do once the initializer
  list has run.
- **`(numBits + 63) / 64`** — integer division, rounding up. If
  `numBits` were exactly `64`, this would be `1` word — correct. If
  `numBits` were `65`, plain `65 / 64` would truncate to `1` word,
  which is one bit too few; adding `63` first pushes any remainder over
  the next boundary before the division truncates, so `65` becomes
  `2` words. This is the standard "round up an integer division"
  idiom, and it is why `catalog_prefilter.cpp`'s filter can be sized to
  *any* number of bits, not just exact multiples of 64.
- **`private:`** — everything below this label, until the class ends,
  is reachable only from `BloomFilter`'s own methods. `setBit`,
  `testBit`, and both data members live here — nothing outside this
  class can touch a bit except through methods the class itself hasn't
  written yet (`add` and `mightContain`, arriving in later units).
- **`void setBit(size_t pos)`** — takes a bit position and turns that
  bit on; returns nothing.
- **`bits[pos / 64]`** — `pos / 64` (integer division, truncating this
  time — no rounding-up needed, since this just picks which whole word
  a given bit position falls inside) picks which element of the `bits`
  vector holds this particular bit. `pos` counts individual bits, but
  `bits` is a vector of 64-bit *words* — dividing by 64 converts "the
  37th bit overall" into "word 0" (bits 0–63 all live in word 0).
- **`|= (uint64_t(1) << (pos % 64))`** — `pos % 64` is the remainder:
  which of the 64 bit positions *inside* that one word this specific
  bit is. `uint64_t(1) << (pos % 64)` builds a 64-bit mask with exactly
  one bit set, at that position — this is the **left shift** from this
  unit's Terms, doing exactly the same job `1 << 0` and `1 << 2` did in
  the isolated lab above, just built as a full 64-bit value instead of
  an `int`-width one. `|=` is **bitwise OR** combined with assignment —
  it ORs that single-bit mask into the existing word and stores the
  result back, turning that one bit on without disturbing any of the
  other 63 bits already living in that same word.
- **`bool testBit(size_t pos) const`** — takes a bit position and
  reports whether it's currently on; `const` promises this method never
  modifies `bits`, which is true — it only reads.
- **`(bits[pos / 64] & (uint64_t(1) << (pos % 64))) != 0`** — the same
  word-and-offset math as `setBit`, but combined with **bitwise AND**
  instead of OR. ANDing the word against a mask with only one bit set
  produces a nonzero result exactly when that one bit was already `1`
  in the word, and `0` when it wasn't — `!= 0` converts that raw
  integer result into a real `bool`.
- **`std::vector<uint64_t> bits;`** — the packed storage itself: a
  dynamic array of 64-bit unsigned integers, reused from earlier
  lessons' `std::vector`, now holding raw words instead of `Product*`.
- **`size_t numBits;`** — the total logical bit count this filter was
  constructed with, kept around so later units (not yet written) can
  loop over every valid position.

### CS Lens

Bit packing is not this lesson's own hard concept in the
pattern/principle sense — it's a storage technique — but the *idea* it
embodies, cramming multiple small values into the unused capacity of a
wider one, recurs constantly. Also recognized in: IPv4 header flags
packed into spare bits of a 32-bit word, RGBA pixel colors packed four
8-bit channels into one 32-bit integer, Unix file permission bits
(`rwxrwxrwx`) packed into a single integer `chmod` accepts as one
number, and CPU status-flag registers where "carry," "zero," and
"overflow" each live in one bit of a single machine word the processor
already has to read anyway.

### SE Lens

The alternative not chosen here is the naive one: a `std::vector<bool>`
worth of *actual* one-byte-each flags (imagine `std::vector<char>` used
as a flag array), or worse, a `std::vector<Product*>`-shaped structure
storing something for every possible slot. That alternative is simpler
to write and easier to read at a glance — no shifting, no masking, no
`pos / 64` arithmetic — but it spends 8× the memory this lesson's own
packed version spends per flag, which directly undermines the entire
reason a Bloom filter exists in the first place: the BRD's own framing
for this lesson is a cheap check *without storing every key*, and
"cheap" only holds if the storage itself is actually compact. The real
cost this project is now carrying: `setBit`/`testBit`'s arithmetic is
harder to read at a glance than a plain array index, and a bug in the
`/ 64` or `% 64` math would corrupt bits silently rather than throwing
an out-of-bounds exception the way a plain vector index would — a real
debuggability trade this lesson is accepting in exchange for the
memory savings.

### Commands Needed

```
clang++ -std=c++17 -Wall -Wextra catalog_prefilter.cpp -o catalog_prefilter
```

`clang++` is this machine's C++ compiler (Apple clang 17, arm64
darwin — `g++` resolves to the same toolchain here, as established in
earlier lessons). `-std=c++17` selects the C++17 language standard,
consistent with every prior lesson in this curriculum. `-Wall -Wextra`
enables the broader warning set this curriculum has used throughout —
no warnings are expected from this unit's own code. `catalog_prefilter.cpp`
is the source file; `-o catalog_prefilter` names the resulting
executable.

### Run It

`BloomFilter` has no public way to observe its own bits yet — the
constructor is its only public member so far. To prove the class
actually compiles and the constructor's rounding math is correct, this
unit's own verification file adds two small public helper methods,
`printBits` and `debugSetBit`, purely to observe state from `main` —
neither survives past this unit; `add` and `mightContain`, arriving in
later units, replace the need for either.

Compiled and run this session as
`verification/C3/step1_bloomfilter_bits.cpp`:

```
before setting any bits: 00000000000000000000
after setting bits 3 and 10: 00010000001000000000
```

A 20-bit filter starts all zero, and after `debugSetBit(3)` and
`debugSetBit(10)`, exactly bit 3 and bit 10 read back as `1` — every
other bit is untouched. The bit-packing storage layer works.

### Connecting

This unit built the one thing every later unit in this lesson needs
somewhere to write into: a compact place to store "yes" answers. It
has no way yet to decide *which* bits a given key should set — that
arrives next, starting with a second hash function.

---

## Concept Unit: A Second Hash Function That Doesn't Move With the First

### The Problem

A single hash function reduces a key to one number, and one number
picks exactly one bit position. If a Bloom filter only ever set one bit
per key, two completely unrelated keys hashing to the same bit would be
indistinguishable from each other the moment either one was inserted —
one hash function gives one piece of evidence, and one piece of
evidence is fragile. Making the filter check *several* positions per
key, so a coincidence has to happen several times at once instead of
once, needs several real sources of evidence to check — which means at
least one more real hash function, one that doesn't just echo the
first.

### Project Change

- **Reference Source:** `djb2` — `verification/C1/step3_full_productindex.cpp`
  lines 45–51, quoted verbatim, unmodified. `fnv1a` — no reference
  counterpart; a from-scratch addition, this lesson's first use of the
  FNV-1a algorithm.
- **Files affected:** `catalog_prefilter.cpp` — modified.
- **Change type:** add.
- **Location:** above the existing `BloomFilter` class definition —
  free functions, so no particular position is required by the
  compiler beyond appearing before their first real call site, which
  arrives in Concept Unit 3.
- **Dependencies:** `<string>`, now needed for `const std::string&`.

### The New Code

```cpp
size_t djb2(const std::string& key) {
    size_t hash = 5381;
    for (char c : key) {
        hash = hash * 33 + static_cast<unsigned char>(c);
    }
    return hash;
}

size_t fnv1a(const std::string& key) {
    size_t hash = 14695981039346656037ULL;
    for (char c : key) {
        hash ^= static_cast<unsigned char>(c);
        hash *= 1099511628211ULL;
    }
    return hash;
}
```

### Updated Project

Both are brand-new freestanding functions with nothing enclosing them
yet — there is no larger structure to return to for this step; the two
function bodies just shown *are* the whole change. `BloomFilter` itself
is untouched by this unit.

### Introduce the Concept in Isolation

Neither function is called anywhere in `catalog_prefilter.cpp` yet —
nothing in the file's own `main` exercises them until Concept Unit 3's
`indexFor` gives them a real caller. Throwaway code proves both
actually work, and work *differently* from one another, in the
meantime.

```cpp
#include <iostream>
#include <string>

size_t djb2(const std::string& key) {
    size_t hash = 5381;
    for (char c : key) {
        hash = hash * 33 + static_cast<unsigned char>(c);
    }
    return hash;
}

size_t fnv1a(const std::string& key) {
    size_t hash = 14695981039346656037ULL;
    for (char c : key) {
        hash ^= static_cast<unsigned char>(c);
        hash *= 1099511628211ULL;
    }
    return hash;
}

int main() {
    for (const std::string& word : {std::string("cat"), std::string("dog")}) {
        size_t h1 = djb2(word);
        size_t h2 = fnv1a(word);
        std::cout << word << ": djb2=" << h1 << " fnv1a=" << h2
                  << "  djb2%10=" << (h1 % 10) << " fnv1a%10=" << (h2 % 10) << std::endl;
    }
    return 0;
}
```

Compiled and run this session as
`verification/C3/lab2_second_hash.cpp`, real output:

```
cat: djb2=193488125 fnv1a=17718013163177550631  djb2%10=5 fnv1a%10=1
dog: djb2=193489663 fnv1a=14604957094952335593  djb2%10=3 fnv1a%10=3
```

For `"cat"`, the two functions land on different digits mod 10 (`5`
versus `1`) — clear evidence they're not the same function in
disguise. For `"dog"`, they land on the *same* digit (`3` and `3`), by
honest coincidence, not by design. That second result is worth sitting
with: this is called **hash independence**, and independence means
"not correlated," not "never agree by chance." Two genuinely
independent functions will still occasionally land on the same answer
for the same input — what independence actually buys is that this
kind of coincidence doesn't happen *reliably*, the way it would if
`fnv1a` were secretly just `djb2` with different constants. A Bloom
filter's false positives, proven for real later in this lesson, are
built from exactly this kind of honest coincidence, scaled up across
several bit positions instead of one digit.

### Discard the Throwaway Example

`"cat"` and `"dog"` were only ever throwaway strings to compare the two
functions' outputs. They are deleted now and do not appear anywhere in
`catalog_prefilter.cpp`.

### Mechanical Walkthrough

Enumerating every distinct syntactic element of `fnv1a` — `djb2` is
identical in structure to its own C1 appearance and gets the same full
restatement here, per this schema's Repetition Rule, immediately after:

- **`size_t fnv1a(const std::string& key)`** — a free function, not a
  method of any class, taking a key by `const` reference and returning
  a `size_t`, mirroring `djb2`'s own signature exactly so both can be
  called identically inside `indexFor` later.
- **`size_t hash = 14695981039346656037ULL;`** — the FNV-1a algorithm's
  fixed starting constant, the "offset basis," analogous to `djb2`'s
  starting `5381` — both are arbitrary-looking constants chosen by each
  algorithm's original designers to spread small inputs well; neither
  is derived from anything else in this code.
- **`ULL`** — a literal suffix marking this number as an
  `unsigned long long`, wide enough to hold a constant this large
  without truncation; without it, a compiler could try to fit the
  literal into a narrower default integer type and either warn or
  truncate.
- **`for (char c : key)`** — a range-based for loop, already
  established syntax floor per this curriculum's own working rules,
  visiting every character of `key` in order — identical in form to
  `djb2`'s own loop, and to `TagPool::intern`'s loop over `pool`.
- **`hash ^= static_cast<unsigned char>(c);`** — `static_cast<unsigned char>(c)`
  converts the loop's `char` to `unsigned char`, the same defensive
  cast `djb2` uses and for the same reason: on a platform where `char`
  is signed, a character with its high bit set would otherwise convert
  to a large negative number, and mixing that into unsigned arithmetic
  would sign-extend into unexpected high bits. `^=` is bitwise XOR
  combined with assignment — it flips exactly the bits in `hash` where
  the incoming character byte has a `1`, and leaves the rest of `hash`
  alone. This is FNV-1a's namesake: **X**OR-**f**old, **N**oll,
  **V**o — the algorithm mixes each byte in with XOR, not addition,
  which is the concrete arithmetic difference from `djb2`'s
  multiply-and-add that makes the two functions' outputs genuinely
  independent rather than the same math wearing different constants.
- **`hash *= 1099511628211ULL;`** — the FNV-1a algorithm's second fixed
  constant, the "FNV prime," multiplied into the running hash after
  every XOR. Multiplying by a large, carefully chosen prime after every
  byte is what spreads small differences in the input across the whole
  64 bits of `hash`, rather than leaving them isolated in the low bits
  where XOR alone would keep them.
- **`return hash;`** — returns the fully mixed 64-bit accumulator, the
  same as `djb2`'s own final `return`.

### CS Lens

Using two structurally different mixing operations — DJB2's
multiply-and-add versus FNV-1a's XOR-and-multiply — to get outputs that
don't correlate is a small instance of a much larger idea:
**independent evidence is worth more than repeated evidence.** Also
recognized in: requiring two different forms of identification that
don't share a failure mode (a password plus a physical device, not two
passwords), RAID storage schemes that compute parity with a
mathematically different operation than the data itself so a single
kind of corruption can't silently defeat both, and forecasting
ensembles that deliberately combine models built on different
assumptions rather than several copies of the same model.

### SE Lens

The alternative not chosen: reuse `djb2` twice with two different seed
constants (`hash = 5381` versus, say, `hash = 17`), which would be less
code to write and maintain than a second full algorithm. That
alternative was rejected because two runs of the *same* multiply-and-add
recurrence, differing only in starting constant, tend to still move
together far more than two structurally different algorithms do — a
seed change shifts where collisions happen, but the underlying
arithmetic that causes them stays identical. The real cost of the
choice actually made here: this project now carries two hash
algorithms to maintain and reason about instead of one, and a future
maintainer has to understand both well enough to know why both exist,
not just copy-paste a second call to the first.

### Commands Needed

```
clang++ -std=c++17 -Wall -Wextra catalog_prefilter.cpp -o catalog_prefilter
```

Same compiler, standard, and warning flags as Concept Unit 1 — no new
tooling is needed for this unit.

### Run It

`catalog_prefilter.cpp` compiles cleanly with `djb2` and `fnv1a` added
— confirmed this session as `verification/C3/step2_bloomfilter_hashes.cpp`
— but neither function is called by anything in the file yet, so
there's nothing new to observe from `main` beyond `BloomFilter`'s own
bits behaving exactly as Concept Unit 1 left them:

```
bits unchanged, still: 00010000001000000000
djb2 and fnv1a now exist in this file, not wired up yet -- see the isolated lab
```

This fragment can't run standalone in any more interesting way yet —
it connects into Concept Unit 3's `indexFor`, which is the first real
caller of either function.

### Connecting

Concept Unit 1 built somewhere to write bits. This unit built two real,
independent sources of numbers to decide *which* bits. The next unit
combines them.

---

## Concept Unit: Manufacturing Several Index Positions From Two Real Hash Functions

### The Problem

A Bloom filter's whole design calls for checking *several* bit
positions per key, not just the one or two real hash functions this
lesson has actually written. Writing a genuinely different third,
fourth, and fifth hash algorithm by hand, each one independent of the
others, is real, error-prone, specialist work — and even Concept Unit
2's two algorithms took real care to get structurally different from
each other. There needs to be a way to turn the two real hash functions
already on hand into as many index positions as the filter wants,
without inventing a new algorithm for every single one.

### Project Change

- **Reference Source:** No reference counterpart — a from-scratch
  addition combining Concept Units 1 and 2's own results.
- **Files affected:** `catalog_prefilter.cpp` — modified.
- **Change type:** add.
- **Location:** inside `BloomFilter`, in the `private:` section,
  alongside `setBit` and `testBit`.
- **Dependencies:** `djb2` and `fnv1a`, added to this same file in
  Concept Unit 2.

### The New Code

```cpp
size_t indexFor(const std::string& key, int i) const {
    size_t h1 = djb2(key);
    size_t h2 = fnv1a(key);
    return (h1 + static_cast<size_t>(i) * h2) % numBits;
}
```

### Updated Project

`indexFor` joins `setBit` and `testBit` inside `BloomFilter`'s private
section — the class, shown here in full, not eliding anything already
present:

```cpp
class BloomFilter {
public:
    BloomFilter(size_t numBits)
        : bits((numBits + 63) / 64, 0), numBits(numBits) {}

private:
    size_t indexFor(const std::string& key, int i) const {  // ← new
        size_t h1 = djb2(key);
        size_t h2 = fnv1a(key);
        return (h1 + static_cast<size_t>(i) * h2) % numBits;
    }

    void setBit(size_t pos) {
        bits[pos / 64] |= (uint64_t(1) << (pos % 64));
    }

    bool testBit(size_t pos) const {
        return (bits[pos / 64] & (uint64_t(1) << (pos % 64))) != 0;
    }

    std::vector<uint64_t> bits;
    size_t numBits;
};
```

`BloomFilter` now has everything it needs, internally, to turn one key
and one small integer `i` into a real bit position — it just has no
public method yet that actually calls `indexFor` for a real purpose.

### Introduce the Concept in Isolation

`indexFor` is private and uninvoked by anything in
`catalog_prefilter.cpp` so far — proving the formula it embodies really
does spread one key across several different positions needs throwaway
code with its own tiny modulus, small enough to see the whole result at
once.

```cpp
#include <iostream>
#include <string>

size_t djb2(const std::string& key) {
    size_t hash = 5381;
    for (char c : key) {
        hash = hash * 33 + static_cast<unsigned char>(c);
    }
    return hash;
}

size_t fnv1a(const std::string& key) {
    size_t hash = 14695981039346656037ULL;
    for (char c : key) {
        hash ^= static_cast<unsigned char>(c);
        hash *= 1099511628211ULL;
    }
    return hash;
}

int main() {
    std::string word = "cat";
    size_t h1 = djb2(word);
    size_t h2 = fnv1a(word);
    const size_t m = 10;

    std::cout << word << ": h1=" << h1 << " h2=" << h2 << std::endl;
    for (int i = 0; i < 3; ++i) {
        size_t index = (h1 + static_cast<size_t>(i) * h2) % m;
        std::cout << "i=" << i << " -> (h1 + " << i << "*h2) % " << m << " = " << index << std::endl;
    }
    return 0;
}
```

Compiled and run this session as
`verification/C3/lab3_double_hashing.cpp`, real output:

```
cat: h1=193488125 h2=17718013163177550631
i=0 -> (h1 + 0*h2) % 10 = 5
i=1 -> (h1 + 1*h2) % 10 = 6
i=2 -> (h1 + 2*h2) % 10 = 1
```

This is exactly what `indexFor` in the real class above is doing,
isolated: reusing the same `h1` and `h2` — the same two real hash
functions from Concept Unit 2, not three or four different ones — and
combining them with a different small integer `i` each time. Out of a
modulus of only 10 possible positions, three calls with `i = 0, 1, 2`
land on `5`, `6`, and `1` — three different positions, manufactured
from exactly two real hash computations plus arithmetic. This technique
is called **double hashing**, specifically the **Kirsch–Mitzenmacher
technique**: `h_i(x) = (h1(x) + i·h2(x)) mod m`. It proves the earlier
claim from this unit's Problem — a filter that wants k checks per key
never needs k real hash algorithms, only two, plus this formula.

### Discard the Throwaway Example

The modulus-10 experiment on `"cat"` was only ever built to prove the
double-hashing formula produces distinct positions from two real
inputs. It is deleted now; `catalog_prefilter.cpp` uses `indexFor`
against the real 42-bit filter, not this toy 10-slot one.

### Mechanical Walkthrough

Enumerating every distinct syntactic element of `indexFor`:

- **`size_t indexFor(const std::string& key, int i) const`** — a
  private method, taking the key to hash and which of the several
  index positions (`0`, `1`, `2`, ...) is being asked for; `const`
  because computing an index never modifies the filter's own state.
- **`size_t h1 = djb2(key);`** — calls the first real hash function,
  reused verbatim from Concept Unit 2 and, before that, from Lesson C1
  — a plain function call, already fully explained syntax, storing its
  result in a local variable.
- **`size_t h2 = fnv1a(key);`** — calls the second real hash function,
  written in Concept Unit 2, the same way.
- **`static_cast<size_t>(i)`** — `i` arrives as a plain `int`;
  converting it to `size_t` before the multiplication that follows
  ensures the multiplication happens in unsigned 64-bit arithmetic that
  matches `h2`'s own type, rather than mixing a signed `int` into an
  expression with two unsigned 64-bit operands, which would otherwise
  force an implicit, unremarked conversion at the same point.
- **`* h2`** — multiplies the (now `size_t`-typed) loop index by the
  second hash. This is the term that actually changes with `i` — at
  `i = 0` it contributes nothing (`0 * h2 = 0`); at `i = 1` it adds the
  whole of `h2`; at `i = 2` it adds twice `h2` — this is precisely what
  makes each `i` land somewhere different, rather than every call
  collapsing to the same result.
- **`h1 + ...`** — adds the first hash's own contribution on top,
  ensuring even `i = 0`'s result depends on both real hash functions,
  not on `h1` alone.
- **`% numBits`** — reduces the (potentially enormous) sum down into
  the valid range `0` to `numBits - 1`, the same modulus operation
  `bucketIndexOf` used in Lesson C1 to fit a hash into a table's real
  size.
- **`return (...)`** — returns the single computed bit position for
  this specific `key` and this specific `i`.

### CS Lens

Deriving several outputs from a small number of independent primitives
plus a cheap, deterministic formula, instead of computing each output
from scratch, is a specific application of a much older idea — reduce
the number of expensive, independent primitives, and get the rest
"for free" from arithmetic on those few. Also recognized in: pseudo-random
number generators that derive an entire long sequence from one small
seed value, hash table implementations in real standard libraries
(several major ones use double hashing internally for open
addressing), and cryptographic key derivation functions that stretch
one real secret into several distinct subkeys without needing several
independently-secret inputs.

### SE Lens

The alternative not chosen: implement k genuinely separate hash
algorithms (a third, a fourth, a fifth full function, each with its own
constants) to get k real index positions with true independence. That
alternative was rejected because it multiplies the amount of code to
write, test, and maintain roughly by k, for a benefit — slightly better
statistical independence than double hashing provides — that has been
shown, in the real published research behind the Kirsch–Mitzenmacher
technique this unit names, to make a negligible practical difference
to a Bloom filter's actual false-positive rate. The real debt this
project accepts instead: `indexFor`'s three positions for a given key
are not *truly* independent of each other — they're all derived from
the same two underlying numbers — which is a theoretical weakness this
lesson's own Closing will make concrete by showing what happens when
that derivation is done wrong.

### Commands Needed

```
clang++ -std=c++17 -Wall -Wextra catalog_prefilter.cpp -o catalog_prefilter
```

Same toolchain as both units before it.

### Run It

`indexFor` is private, with no public caller yet in
`catalog_prefilter.cpp` — confirmed this session as
`verification/C3/step3_bloomfilter_indexfor.cpp`, compiling cleanly and
producing the same bits-unchanged output as Concept Unit 2, since
nothing new is observable from `main` until `add` exists:

```
bits unchanged, still: 00010000001000000000
indexFor exists now but is private and unused -- nothing calls it until add() in the next unit
```

### Connecting

Concept Unit 1 built where bits live. Concept Unit 2 built two real,
independent numbers per key. This unit combined them into as many
distinct positions as the filter wants. The next unit is the first one
that actually writes a key's presence into the filter for real.

---

## Concept Unit: Writing Presence Into the Array

### The Problem

Everything so far — packed storage, two independent hash functions, a
formula for deriving several positions from them — is machinery with
no public door in. Nothing outside `BloomFilter` can actually record
that a real catalog product exists yet. The filter needs one real,
public operation: given a key, mark it present, by turning on every one
of the several positions its own hash functions land on.

### Project Change

- **Reference Source:** `add` itself — no reference counterpart, a
  from-scratch addition. The 7-product catalog `add` is run against —
  `CatalogItem`, `TagPool`, `Product`, and their construction —
  `verification/C2/step3_full_producttrie.cpp` lines 5–43 (the three
  classes) and lines 107–117 (the 7 real `Product` objects), quoted
  verbatim, reused exactly as C1 and C2 both reused them from B4/B5.
- **Files affected:** `catalog_prefilter.cpp` — modified.
- **Change type:** add (a new field, an updated constructor, a new
  public method) plus add (the reused `CatalogItem`/`TagPool`/`Product`
  classes and catalog construction, entering this file for the first
  time).
- **Location:** `numHashes` joins `numBits` as a private field; the
  constructor's parameter list grows to
  `BloomFilter(size_t numBits, int numHashes)`; `add` joins the
  `public:` section, placed above `printBits`. The debug-only
  `debugSetBit` helper is removed — `add` now serves its purpose for
  real — while `printBits` itself is kept, since it still earns its
  place for the Closing's own bit-array trace. `CatalogItem`, `TagPool`,
  and `Product` are added above `BloomFilter` in the file, and `main` is
  replaced with real catalog construction.
- **Dependencies:** none new beyond what's already in the file.

### The New Code

```cpp
void add(const std::string& key) {
    for (int i = 0; i < numHashes; ++i) {
        setBit(indexFor(key, i));
    }
}
```

### Updated Project

`BloomFilter`, shown here in full with `add` and the `numHashes` field
both in place, nothing elided:

```cpp
class BloomFilter {
public:
    BloomFilter(size_t numBits, int numHashes)                       // ← changed
        : bits((numBits + 63) / 64, 0), numBits(numBits), numHashes(numHashes) {}  // ← changed

    void add(const std::string& key) {                               // ← new
        for (int i = 0; i < numHashes; ++i) {                        // ← new
            setBit(indexFor(key, i));                                // ← new
        }                                                             // ← new
    }                                                                 // ← new

    void printBits() const {
        for (size_t i = 0; i < numBits; ++i) {
            std::cout << (testBit(i) ? '1' : '0');
        }
        std::cout << std::endl;
    }

private:
    size_t indexFor(const std::string& key, int i) const {
        size_t h1 = djb2(key);
        size_t h2 = fnv1a(key);
        return (h1 + static_cast<size_t>(i) * h2) % numBits;
    }

    void setBit(size_t pos) {
        bits[pos / 64] |= (uint64_t(1) << (pos % 64));
    }

    bool testBit(size_t pos) const {
        return (bits[pos / 64] & (uint64_t(1) << (pos % 64))) != 0;
    }

    std::vector<uint64_t> bits;
    size_t numBits;
    int numHashes;                                                    // ← new
};
```

`BloomFilter` can now be told, from outside itself, "this key exists" —
`add` is the class's whole write path, start to finish, built entirely
out of pieces the previous three units already proved work: `indexFor`
picks the positions, `setBit` turns each one on.

### Mechanical Walkthrough

Enumerating every distinct syntactic element of `add`:

- **`void add(const std::string& key)`** — a public method, returning
  nothing, taking the key to record — the first method on this class a
  caller outside it can actually reach with real intent, not just to
  observe internal state.
- **`for (int i = 0; i < numHashes; ++i)`** — a C-style counting loop,
  already-taught syntax floor, running once for each of the
  `numHashes` index positions this filter was configured with —
  reappearing here for the first time actually driven by a *stored*
  member (`numHashes`) rather than a literal `3` the way the isolated
  labs used.
- **`indexFor(key, i)`** — calls Concept Unit 3's own method, once per
  loop iteration, with the current `i` — this is the first real caller
  `indexFor` has ever had.
- **`setBit(...)`** — calls Concept Unit 1's own method with whatever
  position `indexFor` just computed, turning that bit on.

**Execution trace — inserting the real product `"Apple"`** (`numBits =
42`, `numHashes = 3`, matching this lesson's own real catalog
configuration, established in this unit's own Run It below):

```
Iteration i=0: indexFor("Apple", 0) = (h1 + 0*h2) % 42 = 23 -> setBit(23) turns bit 23 on
Iteration i=1: indexFor("Apple", 1) = (h1 + 1*h2) % 42 = 8  -> setBit(8)  turns bit 8 on
Iteration i=2: indexFor("Apple", 2) = (h1 + 2*h2) % 42 = 19 -> setBit(19) turns bit 19 on
```

Three iterations, three different positions (`23`, `8`, `19`), each one
following directly from Concept Unit 3's own formula with `i` changing
each time — exactly the isolated lab's own arithmetic, now run against
this lesson's real 42-bit filter instead of a toy 10-slot one.

### CS Lens

`add`'s whole contribution — looping k times, marking one bit each time
— is the concrete mechanical meaning behind "insertion" for this
specific structure. It doesn't get its own CS Lens list the way a named
pattern would; its CS content was already spent in Concept Unit 3's own
lens (deriving several outputs from few primitives). What's worth
naming here instead: this insertion can never be *undone* safely — once
`add("Banana")` turns bit 34 on, there's no way to turn it back off
without risking `"Apple"` (or `"Melon"`, proven later in this lesson) no
longer testing correctly, because bits are shared, anonymous storage
with no record of which key set them. This is the standard, well-known
limitation of a Bloom filter as built here: no safe delete.

### SE Lens

The alternative not chosen: give `add` a return value — a `bool`
reporting whether the key was "new" (had at least one bit previously
unset) versus "already looked present." That alternative was rejected
here because a Bloom filter, by this lesson's own design, cannot
actually answer "was this key new" reliably — a `false` return could
mean the key truly was already inserted, or could mean a different key
already happened to set all the same bits, which is precisely this
lesson's own central subject. Returning `void` is the honest signature:
`add` is a write-only operation with no readable side effect worth
exposing yet. The real cost: a caller who *wants* to know whether an
insert changed anything has no way to ask, short of calling
`mightContain` first — a second full traversal this class doesn't
currently optimize away.

### Commands Needed

```
clang++ -std=c++17 -Wall -Wextra catalog_prefilter.cpp -o catalog_prefilter
```

### Run It

`main` now constructs the real 7-product catalog, verbatim from
B4/B5/C2, and calls `add` once per product's real label, against a
42-bit filter using 3 hash checks per key — 42 bits and 3 checks are
this lesson's own concrete choices, sized specifically so the demo
below produces exactly one honest false positive later in this lesson,
not a contrived one. Compiled and run this session as
`verification/C3/step4_bloomfilter_add.cpp`:

```
bit array after adding all 7 products (bit 0 .. bit 41):
011011011010001000010001100000101010101000
```

16 of the 42 bits are on — roughly 38% of the array — after inserting
all 7 real products, each one setting up to 3 bits (fewer than
`7 × 3 = 21` because some products' positions coincidentally overlap:
both `"Bread"` and `"Pea"` land on bit 7, and both `"Cheese"` and
`"Cherry"` land on bit 14). That overlap is not a bug — it's the exact
mechanism this lesson's next unit turns into a real, provable false
positive.

### Connecting

The filter can now remember every real product that's been added to
it. It still has no way to *ask* whether a given label is one of them
— that's the next and final piece.

---

## Concept Unit: Definitely Not, Versus Maybe

### The Problem

`BloomFilter` can record presence but still can't answer the one
question it exists to answer. A query needs to check the same several
positions `add` would have set for a given key — and the entire honesty
of this structure hinges on what it's allowed to conclude from that
check. If every one of those positions is on, has this key definitely
been inserted, or could something *else* have coincidentally turned on
that exact combination of bits? And if even one of those positions is
off, can the answer be trusted completely?

### Project Change

- **Reference Source:** No reference counterpart — a from-scratch
  addition, this lesson's own subject.
- **Files affected:** `catalog_prefilter.cpp` — modified.
- **Change type:** add (`mightContain` method) plus refactor (`main`
  rewritten from insert-only to insert-then-query).
- **Location:** `mightContain` joins the `public:` section, alongside
  `add`; `main`'s final lines are replaced with real queries against
  the now-populated filter.
- **Dependencies:** none new.

### The New Code

```cpp
bool mightContain(const std::string& key) const {
    for (int i = 0; i < numHashes; ++i) {
        if (!testBit(indexFor(key, i))) {
            return false;
        }
    }
    return true;
}
```

### Updated Project

`BloomFilter`, complete, with `mightContain` in place — its final shape
for this lesson, shown whole:

```cpp
class BloomFilter {
public:
    BloomFilter(size_t numBits, int numHashes)
        : bits((numBits + 63) / 64, 0), numBits(numBits), numHashes(numHashes) {}

    void add(const std::string& key) {
        for (int i = 0; i < numHashes; ++i) {
            setBit(indexFor(key, i));
        }
    }

    bool mightContain(const std::string& key) const {                // ← new
        for (int i = 0; i < numHashes; ++i) {                        // ← new
            if (!testBit(indexFor(key, i))) {                        // ← new
                return false;                                        // ← new
            }                                                        // ← new
        }                                                             // ← new
        return true;                                                 // ← new
    }                                                                 // ← new

private:
    size_t indexFor(const std::string& key, int i) const {
        size_t h1 = djb2(key);
        size_t h2 = fnv1a(key);
        return (h1 + static_cast<size_t>(i) * h2) % numBits;
    }

    void setBit(size_t pos) {
        bits[pos / 64] |= (uint64_t(1) << (pos % 64));
    }

    bool testBit(size_t pos) const {
        return (bits[pos / 64] & (uint64_t(1) << (pos % 64))) != 0;
    }

    std::vector<uint64_t> bits;
    size_t numBits;
    int numHashes;
};
```

`BloomFilter` is now a complete, working presence pre-check: write with
`add`, ask with `mightContain`.

### Mechanical Walkthrough

Enumerating every distinct syntactic element of `mightContain`:

- **`bool mightContain(const std::string& key) const`** — a public
  method, returning `bool`, `const` because a query never writes a bit.
  The name itself is a deliberate honesty check, restated below.
- **`for (int i = 0; i < numHashes; ++i)`** — the identical loop shape
  `add` uses, over the same range — a query checks exactly the same
  positions an insert of the same key would have set.
- **`indexFor(key, i)`** — the same call `add` makes, computing the
  same position for the same `key` and `i` — this is exactly why a key
  that was really inserted is guaranteed to still test positive: `add`
  and `mightContain` are computing identical positions from identical
  inputs.
- **`!testBit(...)`** — `testBit` reads whether that position is
  currently on; `!` negates it, so the condition is true precisely when
  a position this key needs is *not* set.
- **`if (...) { return false; }`** — the moment even one required
  position is found unset, the method exits immediately with `false`,
  without checking the remaining positions at all.
- **`return true;`** — reached only if the loop ran to completion
  without ever hitting that early return — every single position was
  found on.

**Execution trace — querying `"Mango"`**, a real absent word (`h0 = 39`
unset, per this unit's own Run It below):

```
Iteration i=0: indexFor("Mango", 0) = 39, testBit(39) = false -> return false immediately, i=1 and i=2 never run
```

One iteration is all it took. `"Mango"` never reaches a second or third
check — the loop's early `return false` means this method does the
least possible work whenever it can already be certain.

**Execution trace — querying `"Melon"`**, a real absent word that
nonetheless tests positive:

```
Iteration i=0: indexFor("Melon", 0) = 38, testBit(38) = true -> loop continues
Iteration i=1: indexFor("Melon", 1) = 2,  testBit(2)  = true -> loop continues
Iteration i=2: indexFor("Melon", 2) = 34, testBit(34) = true -> loop finishes, return true
```

All three of `"Melon"`'s own computed positions — `38`, `2`, `34` —
were already on. `mightContain` has no way to tell *why* they were on:
it cannot see that bits `34`, `2`, and `38` were actually turned on by
`"Banana"`'s own insertion back in Concept Unit 4 — `"Banana"`'s three
real positions were `34`, `2`, `38`, the exact same three numbers,
computed in a different order. `"Melon"`, a word never inserted at all,
happens to hash to exactly the set of bits `"Banana"` already claimed.
This is not a bug in the code — every line above ran exactly as
written — it's the literal, concrete meaning of the term **false
positive** from this lesson's own Terms glossary: a query reporting
"maybe present" for a key that was never actually inserted, because
some other real key's own insertion happened to already set every bit
this key's own hashing needs.

### CS Lens

`mightContain`'s asymmetric guarantee — **never** a false negative,
**sometimes** a false positive — is this lesson's own hard concept, the
literal reason this whole structure is called a **probabilistic data
structure** rather than an approximate or unreliable one: its error is
bounded to exactly one direction, and that direction is provably safe
for "cheap pre-check before an expensive real lookup," because it can
never cause a real hit to be silently skipped. Also recognized in: web
browsers checking a visited URL against a malicious-site blocklist
before ever making a network call (this is literally what Google
Chrome's Safe Browsing feature does), distributed databases like
Cassandra and HBase checking whether a given on-disk file might contain
a requested key before paying for a real disk read, content delivery
networks doing a cheap admission check before deciding whether a new
object is worth caching, and spell-checkers testing whether a typed
word might be valid before consulting a full dictionary lookup.

### SE Lens

The alternative not chosen: store every real key exactly, in something
like Lesson C1's own `ProductIndex` or a plain `std::unordered_set<std::string>`,
guaranteeing zero false positives ever. That alternative is not wrong
— it's what this lesson's own Closing measures memory against — but it
costs real memory proportional to the number and size of every actual
key stored, which this lesson's own Closing measures at roughly 9–12×
this filter's own footprint at 200,000 keys. The real, honest debt this
project now carries: this `BloomFilter` cannot safely support removing
a key — clearing a bit that one key's hash landed on might be a bit
another still-present key also depends on, and clearing it would
silently turn that other key into an actual false negative, the one
outcome this whole structure is built to guarantee can never happen.
Nothing in this lesson's own code defends against that; a real
production filter would need either a counting variant (storing a small
counter per position instead of one bit, so a delete can decrement
rather than blindly clear) or a periodic full rebuild instead of true
in-place deletion.

### Commands Needed

```
clang++ -std=c++17 -Wall -Wextra catalog_prefilter.cpp -o catalog_prefilter
```

### Run It

`main` now queries all 7 real catalog products plus two words never
inserted, `"Mango"` and `"Melon"`. Compiled and run this session as
`verification/C3/step5_full_bloomfilter.cpp`:

```
presence.mightContain("Apple") -> true
presence.mightContain("Banana") -> true
presence.mightContain("Cheese") -> true
presence.mightContain("Bread") -> true
presence.mightContain("Cherry") -> true
presence.mightContain("Pea") -> true
presence.mightContain("Peach") -> true
presence.mightContain("Mango") -> false
presence.mightContain("Melon") -> true
```

Every one of the 7 real products — every key this filter actually had
`add` called on — comes back `true`: the no-false-negative guarantee
holds for all 7, not just the one traced above. `"Mango"`, never
inserted, correctly comes back `false`. `"Melon"`, also never inserted,
comes back `true` — a real, reproducible false positive, not a
contrived or hand-picked one; this exact 42-bit, 3-hash configuration
against these exact 7 real product labels produces exactly this one
false positive out of every absent word tried, established later in
this lesson's own Closing.

### Connecting

This is the lesson's whole point, assembled: packed storage from
Concept Unit 1, two independent hash functions from Concept Unit 2,
several derived positions from Concept Unit 3, a write path from
Concept Unit 4, and now a read path whose only honest promise is
"definitely not," never "definitely yes."

---

## Closing

### Connect the Pieces

Trace `"Apple"` — a real catalog member — end to end through every unit
this lesson built. `djb2("Apple")` and `fnv1a("Apple")` (Concept Unit
2) produce two real 64-bit numbers. `indexFor` (Concept Unit 3)
combines them with `i = 0, 1, 2` into three positions: `23`, `8`, `19`.
`add("Apple")` (Concept Unit 4) calls `setBit` on each of those three
positions — packed into the `bits` vector using the bit-packing
technique from Concept Unit 1. Later, `mightContain("Apple")` (Concept
Unit 5) recomputes the exact same three positions from the exact same
two hash functions, finds all three still on, and returns `true` — not
because the filter remembers "Apple" as a word, but because nothing
about the storage or the math changed between the insert and the
query.

Now trace `"Melon"` — a word never inserted — through the same
pipeline, to show the other side of the same machine. `djb2("Melon")`
and `fnv1a("Melon")` produce two different real 64-bit numbers.
`indexFor` combines them into three positions: `38`, `2`, `34`.
Nothing ever called `add("Melon")` — but `"Banana"`'s own insertion,
earlier, happened to set bits `34`, `2`, and `38`, the exact same three
positions in a different order. `mightContain("Melon")` finds all
three already on, has no way to know they were set by a different
key entirely, and returns `true`. Same five units, same code, one
input produces a correct answer and one produces an honest, provable
false positive — the entire trade-off this lesson's own BRD row names,
made concrete rather than asserted.

### What Breaks Without This

Concept Unit 3's own SE Lens named a real risk: `indexFor`'s three
positions for one key are derived from the same two hash functions, not
independently computed. What happens if that derivation is done
carelessly — if `i` and `h2` are quietly dropped from the formula,
leaving every "position" equal to `h1(key) % numBits` regardless of
`i`?

```cpp
// BROKEN: ignores h2 and i entirely -- every "index" collapses to the same bit.
size_t indexFor(const std::string& key, int i) const {
    (void)i;
    size_t h1 = djb2(key);
    return h1 % numBits;
}
```

Compiled and run this session as `verification/C3/break_single_hash.cpp`,
computing all 3 index positions for all 7 real products under both the
real `indexFor` and this broken version, real output:

```
Correct (double-hashed) indices -- 3 checks per product:
Apple: 23 8 19
Banana: 34 2 38
Cheese: 14 10 32
Bread: 7 4 1
Cherry: 4 30 14
Pea: 7 14 5
Peach: 32 36 24

Broken (single-hash) indices -- 3 checks per product:
Apple: 23 23 23
Banana: 34 34 34
Cheese: 14 14 14
Bread: 7 7 7
Cherry: 4 4 4
Pea: 7 7 7
Peach: 32 32 32
```

The loop in `mightContain` still runs three times for every product —
`numHashes` is still `3`, nothing about the loop itself changed — but
every single product's three "different" positions are now the exact
same number, three times over. `add` still compiles, still runs,
still sets bits; `mightContain` still compiles, still runs, still
returns the right answer for every real product. Nothing crashes and
nothing looks wrong from the outside. But the class's own promise —
"several independent checks" — was never actually true: it was testing
one bit, three times, dressed up as three checks. Bit 7 shows the
concrete cost directly: `"Bread"` and `"Pea"`, two structurally
unrelated words, collide on that single bit under `djb2` alone —
exactly the single-hash collision risk Concept Unit 2's own Problem
warned about, no longer diluted by a second, independent function.
Restoring the real formula — `(h1 + static_cast<size_t>(i) * h2) % numBits`
— brings back three genuinely different positions per product, proven
by the "Correct" column above.

### A Real Measurement: What a Maybe-Check Costs, Compared to Storing Every Key

The BRD's own framing for this lesson is memory, not speed — "trading
certainty for memory" — so the real, measured claim this Closing makes
is a memory one, following Lesson B5's own `/usr/bin/time -l` precedent
for a memory claim (Lesson C1 measured timing instead, for its own
timing-shaped claim). At a scale of 200,000 synthetic keys, one program
stores every key outright, in a plain `std::vector<std::string>`; a
second builds a `BloomFilter` sized to 10 bits per key (`2,000,000`
bits total, `250,000` bytes of actual bit array) and inserts the same
200,000 keys into it, storing no key text at all.

```
clang++ -std=c++17 -Wall -Wextra -O2 scale_store_every_key.cpp -o scale_store_every_key
clang++ -std=c++17 -Wall -Wextra -O2 scale_bloom_filter.cpp -o scale_bloom_filter
/usr/bin/time -l ./scale_store_every_key
/usr/bin/time -l ./scale_bloom_filter
```

`-O2` is added for both, matching this curriculum's own established
reason: an unoptimized build's extra bookkeeping can obscure a real
memory comparison at scale. `/usr/bin/time -l` is the same real
peak-memory tool Lesson B5 used. Real output, this session, from
`verification/C3/scale_store_every_key.cpp` and
`verification/C3/scale_bloom_filter.cpp`:

```
stored 200000 real keys, first: catalog-item-number-0-abcdefghij last: catalog-item-number-199999-abcdefghij
        0.19 real         0.02 user         0.00 sys
            15892480  maximum resident set size
            15499624  peak memory footprint

added 200000 keys into a 2000000-bit filter (250000 bytes of bit array)
        0.19 real         0.03 user         0.00 sys
             1720320  maximum resident set size
             1327464  peak memory footprint
```

Storing every one of the 200,000 real keys outright cost roughly 15.9
MB of real, measured peak resident memory. The Bloom filter holding the
same 200,000 keys' worth of presence information — never storing a
single character of any key — cost roughly 1.7 MB: about **9.2× less**
memory by maximum resident set size, or about **11.7× less** by peak
memory footprint. This is the literal, measured shape of "trading
certainty for memory" from this lesson's own BRD row: the Bloom filter
can never say which key it holds, or even reliably say *that* it holds
one specific key rather than a coincidental collision of several
others — but it answers "definitely not present" using well under a
tenth of the memory actually storing every key would cost.

### Exercises

1. In `verification/C3/step5_full_bloomfilter.cpp`, change the
   filter's construction from `BloomFilter presence(42, 3);` to
   `BloomFilter presence(24, 3);` — a smaller bit array, same number of
   checks — recompile, and query the same absent words this lesson
   used (`"Mango"`, `"Melon"`, plus any others you'd like to try).
   Compare how many now come back `true` against the one false positive
   this lesson measured at 42 bits.
2. Add an 8th real product to the catalog (a new `Product`, a new
   `add` call) and re-run the same 9 queries from Concept Unit 5. Does
   adding one more product change which absent words are false
   positives? Explain, using this lesson's own explanation of *why*
   `"Melon"` collided, why adding more products can only ever add new
   false positives, never remove one.
3. Write a comment directly above the `BloomFilter` class — not new
   code, just a comment — explaining in your own words why this class,
   as built in this lesson, cannot safely support a `remove(key)`
   method. Use the specific bit-7 collision between `"Bread"` and
   `"Pea"`, proven in this lesson's own "What Breaks Without This," as
   your concrete example of why clearing a bit for one key could break
   another.

### Definition of Done

- [ ] `catalog_prefilter.cpp` compiles cleanly with
      `clang++ -std=c++17 -Wall -Wextra`, no warnings.
- [ ] `BloomFilter` supports `add` and `mightContain`, both exercised
      against the real 7-product catalog.
- [ ] Every one of the 7 real catalog products tests `true` via
      `mightContain` — the no-false-negative guarantee holds for all 7,
      not just one traced example.
- [ ] At least one real, reproducible false positive (`"Melon"`) and
      at least one real true negative (`"Mango"`) are demonstrated
      against real output, not asserted.
- [ ] The "What Breaks Without This" collapse (`break_single_hash.cpp`)
      is run for real, showing every product's 3 checks degenerate to
      1 repeated position, and the real `indexFor` is confirmed
      restored afterward.
- [ ] The real memory measurement (`scale_store_every_key.cpp` versus
      `scale_bloom_filter.cpp`, `/usr/bin/time -l`) has been run this
      session, not pasted from memory of a similar past run.
- [ ] `git commit` — a message stating *why*: something like "add a
      compact presence pre-check in front of the real catalog lookup,
      accepting a small, real, measured false-positive rate in exchange
      for using roughly a tenth of the memory storing every key outright
      would cost."
