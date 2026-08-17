# Lesson C1: Finding It Instantly by Key

**What you will build.** A `ProductIndex` — a hash map keyed by a product's
name — that finds any product in the catalog without checking every record
one by one. The transferable problem this lesson is actually about: any
time a match is found by comparing a key against every stored record in
turn, a **hash function** that maps that key straight to the record's
storage location removes the scan entirely, at the cost of needing a real
strategy for when two different keys land on the same location
(**chaining**) and a real strategy for keeping that location space large
enough as more keys arrive (**rehashing**). By the end of this lesson
that trade is not just asserted — it's measured, on this machine, with
real numbers.

**What you need to know first.** Lesson B4's `CatalogItem`/`Product`
class hierarchy (the base class with a pure virtual method, and the
concrete `Product` that implements it) is reused verbatim as the data
being indexed. Lesson B5's `Product::tag` field and `TagPool::intern` are
also reused verbatim — `ProductIndex` stores and returns real `Product*`
values built exactly the way B5 built them.

**Terms used in this lesson**

- **Hash map** — an associative container that stores key/value pairs and
  finds a value by its key without comparing that key against every
  stored entry; it exists because a linear scan gets slower as the number
  of records grows, and most real programs look a specific record up far
  more often than they walk every record in order.
- **Hash function** — a function that takes a key and deterministically
  produces a number, the same number every time for the same key; it
  exists to turn an arbitrary, unpredictable key (a name, a string, an
  object) into something that can be used as a numeric address.
- **Hash value / hash code** — the specific number a hash function
  produces for one particular key; it exists as the raw material a hash
  map reduces down to an actual, in-bounds storage slot.
- **DJB2** — a small, well-known string hash function: start an
  accumulator at 5381, and for every character multiply the accumulator
  by 33 and add the character; it exists as a concrete, simple,
  good-in-practice algorithm to actually hash with, rather than leaving
  "hash function" as an abstract idea with no real implementation behind
  it.
- **Bucket** — one slot in a hash map's internal storage array, addressed
  by a bucket index; it exists as the actual place a key/value pair
  physically lives once its key has been hashed and reduced to an index.
- **Bucket index / capacity** — the position of a bucket within the
  bucket array (`hash % capacity`), and the total number of buckets
  currently allocated; they exist because a hash value is normally a
  huge number (DJB2's own output routinely runs into the trillions — see
  the isolated lab below) and the array actually backing the map is not
  — modulo reduces that huge number down to a real, in-bounds position.
- **Collision** — when two different keys hash to the same bucket index;
  it exists as a name for an outcome that is mathematically guaranteed to
  happen eventually (there are always more possible keys than buckets),
  not a bug and not a rare edge case to design around as an afterthought.
- **Chaining** — resolving a collision by letting one bucket hold more
  than one entry (here, a small `std::vector` of entries) and walking
  that list to find the one whose key actually matches; it exists
  because a bucket cannot simply refuse a second key — the map still has
  to store it and retrieve it correctly, collision or not.
- **Load factor** — the ratio of stored entries to bucket count
  (`count / capacity`); it exists as a measurable early-warning number
  for when chains are getting long enough to start costing real lookup
  speed, instead of waiting to notice the map has quietly gotten slow.
- **Rehashing** — building a new, larger bucket array and re-placing
  every existing entry into it once the load factor crosses a threshold;
  it exists because a hash map that never grows degrades toward the same
  linear scan it was built to avoid, once enough keys pile into the same
  small set of buckets.
- **Amortized time complexity** — describing an operation's cost averaged
  over a long sequence of calls, not its single worst-case call; it
  exists because `insert` is occasionally expensive (the one call that
  triggers a rehash touches every existing entry) but that expense
  happens rarely enough, and shrinks proportionally often enough, that
  the *average* cost per `insert` still comes out constant.
- **Pointer** — a variable that stores a memory address rather than a
  value itself (`Product*`, `const std::string*`); it exists so a large
  or shared object can be referred to and passed around cheaply, by its
  address, instead of being copied.
- **Reference** (a function parameter like `const std::string& key`) — an
  alias for an existing variable, not a new copy of it and not a
  separate address-holding variable like a pointer; it exists here so a
  function can read a caller's string without copying it and without the
  syntax overhead of dereferencing a pointer at every use.
- **Class** — a blueprint bundling data and the operations that act on
  it into one named type; it exists so a concept like "a product index"
  is represented as one cohesive thing in code, not a scattered handful
  of loose variables and free functions a caller has to keep in sync by
  hand.
- **struct** — a user-defined aggregate type whose members default to
  `public` (unlike `class`, whose members default to `private`); it
  exists here (`ProductIndex::Entry`) as a small, purpose-built bundle
  with no behavior of its own, just two pieces of data — a key and a
  value — being carried together as one unit.
- **Inheritance** (`class Product : public CatalogItem`) — declaring that
  one class is a specialized version of another, automatically gaining
  its base's interface; it exists so code that only needs "any
  `CatalogItem`" can work with a `Product` without knowing it's
  specifically a `Product`.
- **Virtual function / pure virtual function** (`virtual int
  totalQuantity() const = 0;`) — a method whose actual implementation is
  decided at runtime by the real type of the object, not by the
  compile-time type of the pointer or reference used to call it; the
  `= 0` marks it *pure*, meaning `CatalogItem` provides no body at all
  and cannot be instantiated on its own — only a concrete subclass that
  supplies one can be. It exists so new kinds of catalog item could be
  added later without changing any code that only knows about
  `CatalogItem`.
- **override** — a keyword marking that a method is deliberately
  replacing a base class's virtual method, not accidentally declaring an
  unrelated new one; it exists so a typo in a method's signature becomes
  a compile error instead of a silently-ignored new method that never
  gets called.
- **const member function** (`int totalQuantity() const`) — a method
  that promises not to modify the object it's called on; it exists so
  that promise is checked by the compiler, not just held in the
  programmer's head, and so the method can be called on a `const`
  reference or pointer to the object.
- **Member initializer list** (`: CatalogItem(label), tag(tag),
  quantity(quantity)`) — the syntax right after a constructor's
  parameter list, before its body, that initializes base classes and
  member fields directly; it exists so those fields are constructed with
  their real starting values in one step, instead of being
  default-constructed and then immediately reassigned inside the
  constructor's body.
- **Heap allocation** (`new Product(...)`) — requesting memory that
  outlives the function call that created it, returning a pointer to it;
  it exists because a `Product` built inside `main` still needs to be
  reachable after being handed to `ProductIndex::insert`, long after
  `main`'s own local variables would normally have gone out of scope.
- **Range-based for loop** (`for (char c : key)`) — a loop that visits
  every element of a sequence in order without a manually managed index
  variable; it exists to walk a string's characters (or a bucket's
  entries) without the off-by-one risk a hand-written index invites.
- **`static_cast`** — an explicit, compiler-checked type conversion
  (`static_cast<unsigned char>(c)`); it exists so a conversion the
  programmer actually intends is stated plainly in the code, instead of
  happening silently and implicitly in a way a reader could miss.
- **Default parameter value** (`ProductIndex(size_t initialCapacity =
  4)`) — a parameter that takes a stated value when the caller omits an
  argument for it; it exists so `ProductIndex index;` and
  `ProductIndex index(64);` are both valid calls to the same one
  constructor, without writing two overloads.
- **`std::move`** — an explicit signal that a value is about to be
  reused elsewhere and the caller no longer needs its current contents
  preserved; it exists so `rehash` can transfer every bucket's contents
  into the new, larger bucket array by relocating them, not by making a
  wasted extra copy of every entry first.
- **`nullptr`** — the literal representing "this pointer does not point
  to any real object"; it exists as `find`'s honest answer when a key
  was never inserted, distinguishable from every real address a valid
  lookup could return.

**Objects and methods used**

- **`djb2`**
  - *What it is:* a free function, this lesson's own hash function.
  - *Implementation:* `size_t djb2(const std::string& key)` — takes a
    string by `const` reference, returns a `size_t`.
  - *Its use:* turns any product name into a large, deterministic
    number that `bucketIndexOf` then reduces to a real bucket index.
- **`bucketIndexOf`**
  - *What it is:* a free function combining hashing and the
    modulo-to-index step into one named operation.
  - *Implementation:* `size_t bucketIndexOf(const std::string& key,
    size_t capacity)` — calls `djb2(key) % capacity` and returns the
    result.
  - *Its use:* the one place `ProductIndex` ever asks "which bucket does
    this key belong in," called identically from `insert`, `find`, and
    `rehash`.
- **`ProductIndex`**
  - *What it is:* this lesson's own subject — a hand-built hash map from
    `std::string` product names to `Product*` values.
  - *Implementation:* `class ProductIndex` with a private
    `std::vector<std::vector<Entry>> buckets` member, a private `size_t
    count` member, a constructor, and three methods: `insert`, `find`,
    and the private `rehash`.
  - *Its use:* the whole point of this lesson — replacing a linear scan
    through the catalog with an average-O(1) lookup by name.
- **`ProductIndex::ProductIndex`**
  - *What it is:* the constructor.
  - *Implementation:* `ProductIndex(size_t initialCapacity = 4) :
    buckets(initialCapacity) {}` — allocates `initialCapacity` empty
    buckets up front.
  - *Its use:* every `ProductIndex` in this lesson starts at capacity 4,
    small on purpose, so a rehash is easy to trigger and observe with
    only a handful of real products.
- **`ProductIndex::insert`**
  - *What it is:* adds one key/value pair to the map.
  - *Implementation:* `void insert(const std::string& key, Product*
    value)` — checks the load factor, rehashes if needed, then appends
    an `Entry` to the correct bucket.
  - *Its use:* how every product actually gets into the index.
- **`ProductIndex::find`**
  - *What it is:* looks a key up and returns its value, or `nullptr`.
  - *Implementation:* `Product* find(const std::string& key) const` —
    computes the bucket index, walks that one bucket's entries, and
    compares keys.
  - *Its use:* the whole reason this class exists — the operation this
    lesson replaces a linear scan with.
- **`ProductIndex::Entry`**
  - *What it is:* a private nested `struct` — one key/value pair as
    stored inside a bucket.
  - *Implementation:* `struct Entry { std::string key; Product* value;
    };` — two public data members, no methods.
  - *Its use:* what a bucket's `std::vector` actually holds; the unit of
    chaining.
- **`ProductIndex::rehash`** (private)
  - *What it is:* grows the bucket array and re-places every existing
    entry.
  - *Implementation:* `void rehash()` — moves the old `buckets` vector
    out, replaces it with one twice the size, then recomputes every
    entry's bucket index under the new capacity and re-inserts it.
  - *Its use:* keeps the load factor bounded as the catalog grows,
    without the caller of `insert` ever having to think about it.

**Everything else in the file, not this lesson's subject but still
explained.**

- **`CatalogItem`**
  - *What it is:* the abstract base class every catalog entry shares,
    reused unchanged from Lesson B4.
  - *Implementation:* `class CatalogItem { public: CatalogItem(std::string
    label) : label(label) {} virtual int totalQuantity() const = 0;
    std::string label; };` — one constructor, one pure virtual method,
    one public field.
  - *Its use:* `Product` inherits from it; nothing in this lesson adds
    a second `CatalogItem` subclass, but `ProductIndex` doesn't need to
    know that — it only ever handles the concrete `Product*` type.
- **`Product`**
  - *What it is:* a concrete catalog item, reused unchanged from Lesson
    B5 (which added the `tag` field to Lesson B4's original version).
  - *Implementation:* `class Product : public CatalogItem { public:
    Product(std::string label, int quantity, const std::string* tag) :
    CatalogItem(label), tag(tag), quantity(quantity) {} int
    totalQuantity() const override { return quantity; } const
    std::string* tag; private: int quantity; };`
  - *Its use:* the real value type `ProductIndex` stores and returns —
    every `Product*` this lesson inserts and finds is a real, complete
    object built exactly the way Track B built it.
- **`TagPool`**
  - *What it is:* Lesson B5's Flyweight pool of interned tag strings,
    reused unchanged.
  - *Implementation:* `class TagPool { public: const std::string*
    intern(const std::string& text) { ... } private:
    std::vector<std::string*> pool; };` — `intern` linearly checks
    `pool` for an existing match before allocating a new one.
  - *Its use:* builds the real `Product` objects this lesson indexes,
    exactly as B5 left it — this lesson does not touch or extend
    `TagPool`.
- **`TagPool::intern`**
  - *What it is:* returns a shared pointer to one canonical copy of a
    tag string.
  - *Implementation:* `const std::string* intern(const std::string&
    text)` — walks `pool` comparing dereferenced values, or heap-
    allocates and stores a new one on first sight of that text.
  - *Its use:* called once per product in this lesson's demonstration
    code, same as B5.
- **`std::string`**
  - *What it is:* the standard library's owning, growable string type.
  - *Implementation:* `std::string` — manages its own heap-allocated
    character buffer; supports `==`, concatenation, range-based
    iteration over its characters, and more.
  - *Its use:* every product name, every tag, and every hash key in this
    lesson is a `std::string`.
- **`std::vector`**
  - *What it is:* the standard library's owning, growable array type.
  - *Implementation:* `std::vector<T>` — contiguous heap storage,
    `push_back` to append, `.size()` for the current element count,
    range-based iteration over its elements.
  - *Its use:* `ProductIndex`'s own bucket array is a
    `std::vector<std::vector<Entry>>` — a vector of buckets, each bucket
    itself a vector of entries.

---

## Concept Unit: Hashing a Key Into a Bucket Index

### The Problem

Right now, finding a product by name means walking a list from the
front, comparing names one at a time, until one matches or the list runs
out. That works, but the cost grows directly with the catalog's size —
double the products, double the average work per lookup. A hash map's
whole premise is different: instead of *searching* for where a key's
value lives, *compute* where it lives, directly from the key itself, and
go straight there. That computation has two parts. First, turn the key
— an arbitrary string like `"Cheese"` — into some number. Second, turn
that number into a real, in-bounds position in a fixed-size array. Both
parts are needed: the first alone produces a number far too large to use
as an array position; the second alone, with nothing to reduce first,
has no large space of possible inputs to spread across a small array.

### Project Change

- **Reference Source:** No reference counterpart for `djb2` or
  `bucketIndexOf` — this is a from-scratch addition. DJB2 is a small,
  well-known public-domain string hash algorithm, not sourced from any
  file already in this project; it was chosen because it's short enough
  to type and reason about by hand while still being a real, commonly
  used hash function, not a toy invented for this lesson alone.
  `CatalogItem`, `TagPool`, and `Product`, which this same file also
  carries forward unchanged, do have a real counterpart:
  `verification/B5/step_tagged_products.cpp`, lines 5–43, quoted
  verbatim below (read this session).
- **Files affected:** created — `catalog_lookup.cpp`. This is a new
  file, not an extension of `catalog_tree.cpp` or `catalog_composite.cpp`.
  Per working rule 5 (one evolving project file per track, with
  deliberate exceptions when a lesson's feature is genuinely different
  in kind): a bucket array plus chaining has nothing structurally in
  common with a binary tree (`catalog_tree.cpp`) or a variable-arity
  composite hierarchy (`catalog_composite.cpp`) — the same "genuinely
  different in kind" reasoning that already forced Track B itself into
  two separate files.
- **Change type:** add (new file).
- **Location:** top of the file, after `#include <iostream>`,
  `#include <string>`, and `#include <vector>`, and after the
  carried-over `CatalogItem`/`TagPool`/`Product` definitions shown next
  — before `main`.
- **Dependencies:** none beyond the standard library headers already
  listed.

Carried over verbatim from `verification/B5/step_tagged_products.cpp`,
lines 5–43, unchanged:

```cpp
class CatalogItem {
public:
    CatalogItem(std::string label) : label(label) {}
    virtual int totalQuantity() const = 0;

    std::string label;
};

class TagPool {
public:
    const std::string* intern(const std::string& text) {
        for (std::string* existing : pool) {
            if (*existing == text) {
                return existing;
            }
        }
        std::string* fresh = new std::string(text);
        pool.push_back(fresh);
        return fresh;
    }

private:
    std::vector<std::string*> pool;
};

class Product : public CatalogItem {
public:
    Product(std::string label, int quantity, const std::string* tag)
        : CatalogItem(label), tag(tag), quantity(quantity) {}

    int totalQuantity() const override {
        return quantity;
    }

    const std::string* tag;

private:
    int quantity;
};
```

### The New Code

```cpp
size_t djb2(const std::string& key) {
    size_t hash = 5381;
    for (char c : key) {
        hash = hash * 33 + static_cast<unsigned char>(c);
    }
    return hash;
}

size_t bucketIndexOf(const std::string& key, size_t capacity) {
    return djb2(key) % capacity;
}
```

Both functions are freestanding — there is no larger enclosing structure
they're being added into yet (`ProductIndex` itself doesn't exist until
the next Concept Unit), so there is no Updated Project step here: these
two functions, exactly as shown, are the whole of what this unit adds.

### Introduce the Concept in Isolation

The real code above just typed `djb2` and `bucketIndexOf` without
proving anything about how they behave. Here's a throwaway program that
isolates exactly what those two real functions are doing, run for real,
against a short escalating sequence — a one-character key, a two-
character key, then real product names — so the behavior is visible in
the smallest case before it meets the real one:

```cpp
#include <cstdint>
#include <iostream>
#include <string>

size_t djb2(const std::string& key) {
    size_t hash = 5381;
    for (char c : key) {
        hash = hash * 33 + static_cast<unsigned char>(c);
    }
    return hash;
}

int main() {
    std::cout << "djb2(\"a\")      = " << djb2("a") << std::endl;
    std::cout << "djb2(\"a\")      = " << djb2("a") << " (again, same input)" << std::endl;
    std::cout << "djb2(\"ab\")     = " << djb2("ab") << std::endl;
    std::cout << "djb2(\"Apple\")  = " << djb2("Apple") << std::endl;
    std::cout << "djb2(\"Banana\") = " << djb2("Banana") << std::endl;
    std::cout << "djb2(\"Cheese\") = " << djb2("Cheese") << std::endl;

    size_t capacity = 4;
    std::cout << "\nWith capacity " << capacity << ":" << std::endl;
    std::cout << "djb2(\"Apple\")  % " << capacity << " = " << djb2("Apple") % capacity << std::endl;
    std::cout << "djb2(\"Banana\") % " << capacity << " = " << djb2("Banana") % capacity << std::endl;
    std::cout << "djb2(\"Cheese\") % " << capacity << " = " << djb2("Cheese") % capacity << std::endl;

    std::cout << "\nProof that unsigned wraparound is well-defined, not undefined behavior:" << std::endl;
    size_t maxVal = SIZE_MAX;
    std::cout << "SIZE_MAX       = " << maxVal << std::endl;
    std::cout << "SIZE_MAX + 1   = " << (maxVal + 1) << " (wraps to 0, does not crash or corrupt)" << std::endl;

    return 0;
}
```

Real output, this session:

```
djb2("a")      = 177670
djb2("a")      = 177670 (again, same input)
djb2("ab")     = 5863208
djb2("Apple")  = 210668785175
djb2("Banana") = 6952091173894
djb2("Cheese") = 6952138291826

With capacity 4:
djb2("Apple")  % 4 = 3
djb2("Banana") % 4 = 2
djb2("Cheese") % 4 = 2

Proof that unsigned wraparound is well-defined, not undefined behavior:
SIZE_MAX       = 18446744073709551615
SIZE_MAX + 1   = 0 (wraps to 0, does not crash or corrupt)
```

This is exactly what `djb2` in the code above is doing, isolated: the
same key always produces the same number (`djb2("a")` twice, identical),
different keys usually produce very different numbers (the six-digit
gap between `"a"` and `"ab"`, the trillion-scale numbers for real
words), and those numbers are, as expected, far too large to use
directly as an array position — `bucketIndexOf`'s job, proven in the
same output, is reducing them down to `0`, `1`, `2`, or `3` at capacity
4. This is called a **hash function**: a deterministic, one-way mapping
from an arbitrary key to a number. The `SIZE_MAX + 1` line proves
something separate but load-bearing: `hash = hash * 33 + c` multiplies
an ever-growing accumulator, and for long enough keys that multiplication
genuinely exceeds what a 64-bit `size_t` can hold — but unsigned integer
overflow in C++ is defined to wrap around modulo 2⁶⁴, not undefined
behavior the way signed overflow would be, so `djb2` never crashes or
produces garbage no matter how long the key is; it just keeps producing
some large, deterministic, well-defined number.

This throwaway example is now discarded — it does not appear in the
project again. Its only job was proving, with real output, what `djb2`
and the modulo step actually do before trusting them inside the real
`ProductIndex`.

### Mechanical Walkthrough

Enumerating every distinct syntactic element of the New Code above, in
order:

- `size_t djb2(const std::string& key)` — a free function named
  `djb2`, taking one parameter, `key`, by `const` reference (a
  **reference**: an alias for the caller's actual string, not a copy),
  returning a `size_t` — the unsigned integer type used throughout the
  standard library for sizes and counts, and the type this lesson
  standardizes on for hash values and bucket indices.
- `size_t hash = 5381;` — a local variable, seeded at 5381. This
  specific number is DJB2's own traditional seed: an arbitrary-looking
  but conventional odd constant chosen by the algorithm's original
  author (Daniel J. Bernstein) for its empirically good bit-mixing
  behavior — starting at a plain `0` instead measurably produces more
  collisions for short, similar keys, though that specific comparison
  isn't reproduced here since DJB2's fixed seed is simply being reused
  as-is, not re-derived from scratch.
- `for (char c : key)` — a **range-based for loop**, visiting every
  character of `key` in order, binding each one to `c`, with no manual
  index variable and no way to run one character past the end of the
  string by an off-by-one mistake.
- `hash = hash * 33 + static_cast<unsigned char>(c);` — three things
  happening in one line. `hash * 33` multiplies the running accumulator
  by 33, DJB2's own chosen multiplier (again a fixed, conventional
  constant, not derived in this lesson); `static_cast<unsigned char>(c)`
  is an explicit, compiler-checked conversion — `char` is signed on this
  toolchain, and a signed `char` with its high bit set would sign-extend
  to a large negative value if added directly, silently corrupting the
  hash for any text containing non-ASCII bytes, so the cast to
  `unsigned char` first guarantees a small positive value between 0 and
  255 regardless; the `+` then adds that value into the accumulator,
  and the whole expression's result is stored back into `hash` — for a
  long enough key, this multiply-then-add is exactly what wraps around
  the way the isolated lab just proved.
- `return hash;` — returns the final accumulated value: the key's hash
  value, a real number but not yet a usable array position.
- `size_t bucketIndexOf(const std::string& key, size_t capacity)` — a
  second free function, taking the same kind of `key` reference plus a
  `capacity` parameter passed by plain value (a `size_t` copy, cheap
  enough that a reference would add nothing).
- `return djb2(key) % capacity;` — calls `djb2` to get the raw hash
  value, then applies the modulo operator: for any hash value `h` and
  capacity `c`, `h % c` is always in the range `0` to `c - 1` — exactly
  the valid index range of an array with `c` slots. This is the second
  half of "a hash function maps a key to a bucket index": hashing alone
  produces a number too large to index into anything; modulo is what
  actually turns it into a real position.

### CS Lens

This is a **hash function** — a deterministic, one-directional mapping
from an arbitrary-sized input down to a fixed-size number, used as an
address rather than searched for. Also recognized in: password storage
(hashing a password instead of ever storing the real one), version
control systems identifying a piece of content by a hash of its bytes
rather than a filename, download checksums confirming a file wasn't
corrupted in transit, CDN and cache systems addressing stored content by
a hash of that content, and every general-purpose language's own
built-in dictionary/map type, which all reduce a key to a bucket
position exactly this way somewhere underneath their own syntax.

### SE Lens

The alternative not chosen here is the one this lesson started from:
linear search, comparing the key against every stored record. Linear
search needs no hash function, no bucket array, and cannot get a lookup
"wrong" through a bad hash — but its cost is directly proportional to
how much data is stored, with no way around that. Hashing trades a small
amount of up-front complexity (a real algorithm, tuned constants, a
modulo step) and a small amount of memory (the bucket array itself, sized
larger than the number of items actually stored) for lookups whose cost,
on average, does not grow with the catalog's size at all. The real
maintenance cost this design carries: the quality of the hash function
matters. A poorly chosen one that clusters many different real product
names into the same few buckets would silently degrade this whole
structure back toward the linear scan it exists to avoid — with nothing
in the code's own shape looking wrong. DJB2 was chosen here because it's
a real, known-reasonable algorithm, not an arbitrary one invented for
this lesson.

### Commands Needed

```
clang++ -std=c++17 -Wall -Wextra lab1_hash_function.cpp -o lab1_hash_function && ./lab1_hash_function
```

`clang++` is this toolchain's C++ compiler (Apple clang 17, arm64
darwin — `clang++` and `g++` both resolve to the same underlying
compiler on this machine). `-std=c++17` selects the C++17 language
standard. `-Wall -Wextra` enable the compiler's standard and extra
warning sets — this file compiles with zero warnings, meaning nothing
here relies on behavior the compiler considers questionable. `-o
lab1_hash_function` names the resulting executable; `&& ./lab1_hash_function`
runs it immediately after a successful compile.

### Run It

Already shown above, under "Introduce the Concept in Isolation" — the
exact real output produced by compiling and running that file this
session.

### Connecting Back

Hashing a key into a bucket index is the entire idea a hash map is built
on; the next Concept Unit gives that bucket index somewhere real to
land — a `ProductIndex` class with an actual array of buckets behind it.

---

## Concept Unit: Resolving Collisions With Chaining

### The Problem

`bucketIndexOf` guarantees an in-bounds position, but it does not, and
cannot, guarantee a *unique* one. With only 4 buckets and far more than
4 possible product names, two different names are eventually going to
land on the same bucket index — the isolated lab already proved this is
not hypothetical: at capacity 4, `"Banana"` and `"Cheese"` both hash to
bucket 2. A bucket that can hold only one entry would have no honest way
to handle that second key. It has to hold more than one, and `find` has
to know how to pick the right one back out again.

### Project Change

- **Reference Source:** No reference counterpart — chaining is a
  from-scratch addition to this lesson's own `ProductIndex`, the
  standard textbook technique for this exact problem, not ported from
  any file already in this project.
- **Files affected:** modified — `catalog_lookup.cpp`.
- **Change type:** add.
- **Location:** immediately after the `bucketIndexOf` function added in
  the previous Concept Unit, introducing the `ProductIndex` class for
  the first time.
- **Dependencies:** the `djb2` and `bucketIndexOf` functions from the
  previous unit; `Product` (carried over from B5).

### The New Code

```cpp
class ProductIndex {
public:
    ProductIndex(size_t initialCapacity = 4) : buckets(initialCapacity) {}

    void insert(const std::string& key, Product* value) {
        size_t idx = bucketIndexOf(key, buckets.size());
        buckets[idx].push_back({key, value});
    }

    Product* find(const std::string& key) const {
        size_t idx = bucketIndexOf(key, buckets.size());
        for (const Entry& e : buckets[idx]) {
            if (e.key == key) {
                return e.value;
            }
        }
        return nullptr;
    }

private:
    struct Entry {
        std::string key;
        Product* value;
    };

    std::vector<std::vector<Entry>> buckets;
};
```

### The Updated Project

This *is* the whole `ProductIndex` class so far — there is nothing from
an earlier state of this same class to preserve alongside it, since this
unit is the class's first appearance. As a whole, `ProductIndex` right
now can be constructed with a starting bucket count, can `insert` any
number of key/value pairs (correctly handling collisions by letting a
bucket grow past one entry), and can `find` a value back by its key —
but it has no way yet to grow its own bucket array, so every bucket's
chain only ever gets longer as more products are added, never shorter or
better-distributed. That gap is exactly what the next Concept Unit
closes.

### Introduce the Concept in Isolation

Here's a throwaway program isolating exactly what `insert` and `find`
above are doing when a collision actually happens — using the same
`"Banana"`/`"Cheese"` collision the previous unit's isolated lab already
found at capacity 4, with plain `int` values standing in for `Product*`
so the collision itself, not the surrounding `Product` machinery, is
what's on screen:

```cpp
#include <iostream>
#include <string>
#include <vector>

size_t djb2(const std::string& key) {
    size_t hash = 5381;
    for (char c : key) {
        hash = hash * 33 + static_cast<unsigned char>(c);
    }
    return hash;
}

struct Entry {
    std::string key;
    int value;
};

int main() {
    size_t capacity = 4;
    std::vector<std::vector<Entry>> buckets(capacity);

    std::vector<std::pair<std::string, int>> toInsert = {
        {"Apple", 12}, {"Banana", 7}, {"Cheese", 3}
    };

    for (auto& [key, value] : toInsert) {
        size_t idx = djb2(key) % capacity;
        buckets[idx].push_back({key, value});
        std::cout << "insert(\"" << key << "\", " << value << ") -> bucket " << idx
                  << " (bucket " << idx << " now holds " << buckets[idx].size() << " entr"
                  << (buckets[idx].size() == 1 ? "y" : "ies") << ")" << std::endl;
    }

    std::cout << "\nFull bucket layout:" << std::endl;
    for (size_t i = 0; i < capacity; ++i) {
        std::cout << "bucket " << i << ": [";
        for (size_t j = 0; j < buckets[i].size(); ++j) {
            std::cout << buckets[i][j].key << "=" << buckets[i][j].value;
            if (j + 1 < buckets[i].size()) std::cout << ", ";
        }
        std::cout << "]" << std::endl;
    }

    std::cout << "\nLooking up \"Cheese\" by walking bucket " << (djb2("Cheese") % capacity) << ":" << std::endl;
    size_t idx = djb2("Cheese") % capacity;
    for (auto& e : buckets[idx]) {
        std::cout << "  checking \"" << e.key << "\" == \"Cheese\"? "
                  << (e.key == "Cheese" ? "yes, found it" : "no, keep walking") << std::endl;
        if (e.key == "Cheese") break;
    }

    return 0;
}
```

Real output, this session:

```
insert("Apple", 12) -> bucket 3 (bucket 3 now holds 1 entry)
insert("Banana", 7) -> bucket 2 (bucket 2 now holds 1 entry)
insert("Cheese", 3) -> bucket 2 (bucket 2 now holds 2 entries)

Full bucket layout:
bucket 0: []
bucket 1: []
bucket 2: [Banana=7, Cheese=3]
bucket 3: [Apple=12]

Looking up "Cheese" by walking bucket 2:
  checking "Banana" == "Cheese"? no, keep walking
  checking "Cheese" == "Cheese"? yes, found it
```

This is exactly what `insert` and `find` in the real `ProductIndex`
above are doing, isolated: `"Banana"` and `"Cheese"` both land in bucket
2 — a real, proven collision, not a hypothetical one — and instead of
the second insert overwriting the first, bucket 2 simply holds both,
growing from one entry to two. Looking `"Cheese"` back up doesn't fail
or return the wrong product; it walks bucket 2's own small list, checks
each key in turn, and finds the real match on the second check. This
technique — letting a bucket hold a list, and comparing keys within it
— is called **chaining**.

Discarded now — this throwaway version, with its `int` values and its
debug printing of internal bucket state, does not appear in the project
again. The real `ProductIndex::insert`/`find` shown above do the
identical thing on real `Product*` values, silently, with no debug
output.

### Mechanical Walkthrough

- `class ProductIndex {` — a **class**: a blueprint bundling
  `ProductIndex`'s data (its bucket array) and behavior (`insert`,
  `find`) into one named type.
- `public:` — an access modifier; everything below it, until the next
  one, is callable from outside the class.
- `ProductIndex(size_t initialCapacity = 4) : buckets(initialCapacity)
  {}` — the constructor. `size_t initialCapacity = 4` is a **default
  parameter value**: calling `ProductIndex()` with no argument at all
  uses `4`. `: buckets(initialCapacity)` is a **member initializer
  list** — it constructs the `buckets` member directly as a
  `std::vector` of `initialCapacity` empty inner vectors, rather than
  default-constructing an empty `buckets` and resizing it afterward
  inside the body. The body, `{}`, is empty — nothing left to do after
  the initializer list already did the real work.
- `void insert(const std::string& key, Product* value) {` — a method
  taking `key` by `const` **reference** and `value` as a `Product*`
  **pointer** — `insert` never owns the `Product` it's given, it only
  stores the address of one that already exists elsewhere.
- `size_t idx = bucketIndexOf(key, buckets.size());` — calls last
  unit's `bucketIndexOf`, passing `buckets.size()` — the *current*
  bucket count — as the capacity, so the computed index is always valid
  for however large `buckets` actually is right now.
- `buckets[idx].push_back({key, value});` — `buckets[idx]` accesses one
  bucket — itself a `std::vector<Entry>` — by its computed index;
  `push_back` appends a new element onto the end of that vector, growing
  it by one; `{key, value}` is brace-initialization, building a new
  `Entry` directly from `key` and `value` without a separate named
  temporary variable. This line is chaining's entire mechanism: it never
  checks whether the bucket is already occupied, because a `std::vector`
  answers that question by simply growing.
- `Product* find(const std::string& key) const {` — a **const member
  function**: `find` promises not to modify the `ProductIndex` it's
  called on, checked by the compiler, not just by convention.
- `size_t idx = bucketIndexOf(key, buckets.size());` — the identical
  computation `insert` used, guaranteeing `find` looks in the same
  bucket `insert` would have placed this exact key into.
- `for (const Entry& e : buckets[idx]) {` — a **range-based for loop**
  over one specific bucket's entries, binding each one, by `const`
  reference, to `e`.
- `if (e.key == key) {` — `std::string`'s own `==` operator, comparing
  the stored key against the one being searched for — this is the
  actual "walk the chain until the right one is found" step chaining
  requires.
- `return e.value;` — returns the matching entry's stored `Product*` the
  moment a match is found, without checking the rest of the bucket.
- `return nullptr;` — reached only if the loop finishes without a match:
  either the bucket was empty, or every key in it was checked and none
  matched. **`nullptr`** signals "no such key was ever inserted,"
  distinguishable from any real `Product*` address `find` could
  otherwise return.
- `private:` — everything below this point is only reachable from
  inside `ProductIndex`'s own methods.
- `struct Entry { std::string key; Product* value; };` — a **struct**:
  an aggregate with no behavior, just two public data members, `key`
  and `value`, bundled together as the one thing a bucket actually
  stores.
- `std::vector<std::vector<Entry>> buckets;` — the bucket array itself:
  a `std::vector` (the outer array, indexed by bucket) of
  `std::vector<Entry>` (each bucket's own chain, which can hold zero,
  one, or many entries).

### CS Lens

This is **chaining** — resolving a collision by letting one storage
location hold a small list instead of a single value. Also recognized
in: the pigeonhole principle generally (more items than boxes guarantees
some box holds more than one), an apartment mailbox slot with several
tenants' names taped to it, a coat-check counter handing back the right
coat from a rack of several sharing one ticket-stub number, and library
shelving when two different books alphabetize to the same call number
and simply sit side by side on the shelf.

### SE Lens

The alternative not chosen here is open addressing — on a collision,
probe forward to a *different* bucket instead of growing a list in the
one already claimed. Open addressing avoids a `std::vector`'s own
per-bucket overhead and can have better cache behavior, but its own
removal logic is more delicate (naively deleting an entry can break the
probe sequence a later lookup depends on) and it degrades sharply once
the table gets nearly full. Chaining, as built here, is simpler to
implement correctly, never fails to insert regardless of how full the
table gets, and its removal logic (not needed by this lesson, but worth
naming honestly) is just erasing one element from a small vector. Its
real cost: every bucket carries a `std::vector`'s own overhead even when
empty, and in the pathological worst case — every key colliding into one
bucket — `find` degrades all the way to the exact linear scan this
lesson set out to avoid. Bounding how bad that worst case gets in
practice is precisely what the next Concept Unit's load factor and
rehashing exist to do.

### Commands Needed

```
clang++ -std=c++17 -Wall -Wextra lab2_chaining.cpp -o lab2_chaining && ./lab2_chaining
```

Same compiler, same `-std=c++17` language standard, and the same
`-Wall -Wextra` warning sets as the previous unit — this file also
compiles with zero warnings.

### Run It

Already shown above, under "Introduce the Concept in Isolation."

### Connecting Back

Chaining makes collisions *correct* — no key is ever lost or
overwritten, no matter how many others land in the same bucket. It does
not make them *fast* forever: nothing built so far stops one bucket's
chain from growing arbitrarily long as more products are added. The next
Concept Unit is what actually keeps that from happening.

---

## Concept Unit: Load Factor and Rehashing

### The Problem

`ProductIndex` as it stands never grows its own bucket array — it was
constructed with some fixed number of buckets, and every product added
after that just makes existing chains longer. Chaining means `find`
still returns the right answer even with a long chain, but "right
answer, eventually, after checking every entry in a nine-item chain"
is exactly the linear scan this whole lesson exists to avoid — it has
just moved from scanning the whole catalog to scanning one overloaded
bucket. The fix isn't a smarter `find`; it's making sure chains never
get that long in the first place, by growing the bucket array itself
once it starts getting crowded.

### Project Change

- **Reference Source:** No reference counterpart — load-factor-triggered
  rehashing is a from-scratch addition, the standard technique for
  keeping a hash map's average performance from degrading as it grows.
- **Files affected:** modified — `catalog_lookup.cpp`.
- **Change type:** refactor (`insert` gains a check) plus add (a new
  private `rehash` method).
- **Location:** inside the `ProductIndex` class added in the previous
  Concept Unit — one new line at the top of `insert`'s body, and one new
  private method, `rehash`, placed after `find` and before the `Entry`
  struct.
- **Dependencies:** `bucketIndexOf`, `Entry`, and `buckets`, all from
  the previous two units.

### The New Code

```cpp
void rehash() {
    std::vector<std::vector<Entry>> old = std::move(buckets);
    buckets.assign(old.size() * 2, {});
    for (auto& bucket : old) {
        for (auto& e : bucket) {
            size_t newIdx = bucketIndexOf(e.key, buckets.size());
            buckets[newIdx].push_back(std::move(e));
        }
    }
}
```

And the one new line inside `insert`, checking the load factor before
placing the new entry:

```cpp
double loadFactorAfter = static_cast<double>(count + 1) / buckets.size();
if (loadFactorAfter > 0.75) {
    rehash();
}
```

### The Updated Project

`ProductIndex` in full, with both new pieces in place (marked `// ←
new`) and nothing from the previous two units elided:

```cpp
class ProductIndex {
public:
    ProductIndex(size_t initialCapacity = 4) : buckets(initialCapacity) {}

    void insert(const std::string& key, Product* value) {
        double loadFactorAfter = static_cast<double>(count + 1) / buckets.size();  // ← new
        if (loadFactorAfter > 0.75) {                                              // ← new
            rehash();                                                             // ← new
        }                                                                          // ← new
        size_t idx = bucketIndexOf(key, buckets.size());
        buckets[idx].push_back({key, value});
        ++count;                                                                   // ← new
    }

    Product* find(const std::string& key) const {
        size_t idx = bucketIndexOf(key, buckets.size());
        for (const Entry& e : buckets[idx]) {
            if (e.key == key) {
                return e.value;
            }
        }
        return nullptr;
    }

private:
    struct Entry {
        std::string key;
        Product* value;
    };

    void rehash() {                                                                // ← new
        std::vector<std::vector<Entry>> old = std::move(buckets);                  // ← new
        buckets.assign(old.size() * 2, {});                                        // ← new
        for (auto& bucket : old) {                                                 // ← new
            for (auto& e : bucket) {                                               // ← new
                size_t newIdx = bucketIndexOf(e.key, buckets.size());              // ← new
                buckets[newIdx].push_back(std::move(e));                           // ← new
            }                                                                      // ← new
        }                                                                          // ← new
    }                                                                              // ← new

    std::vector<std::vector<Entry>> buckets;
    size_t count = 0;                                                             // ← new
};
```

As a whole, `ProductIndex` is now complete: `insert` checks, before
placing anything, whether adding one more entry would push the load
factor past 0.75, and if so grows the bucket array first; `find` is
unchanged, but now benefits from chains `insert` has been actively
keeping short. This is the version carried into the rest of this lesson.

### Introduce the Concept in Isolation

Here's a throwaway program isolating exactly what `insert`'s new check
and `rehash` above are doing — using plain `int` values again, inserting
the same four product names in the same order the real project's own
demonstration will use, with debug printing at every step so the
capacity growth and the re-placement of every existing entry are both
directly visible:

```cpp
#include <iostream>
#include <string>
#include <vector>

size_t djb2(const std::string& key) {
    size_t hash = 5381;
    for (char c : key) {
        hash = hash * 33 + static_cast<unsigned char>(c);
    }
    return hash;
}

struct Entry {
    std::string key;
    int value;
};

void printLayout(const std::vector<std::vector<Entry>>& buckets) {
    for (size_t i = 0; i < buckets.size(); ++i) {
        std::cout << "  bucket " << i << ": [";
        for (size_t j = 0; j < buckets[i].size(); ++j) {
            std::cout << buckets[i][j].key;
            if (j + 1 < buckets[i].size()) std::cout << ", ";
        }
        std::cout << "]" << std::endl;
    }
}

void rehash(std::vector<std::vector<Entry>>& buckets) {
    size_t oldCapacity = buckets.size();
    size_t newCapacity = oldCapacity * 2;
    std::cout << "  load factor threshold crossed -> rehashing: capacity " << oldCapacity
              << " -> " << newCapacity << std::endl;

    std::vector<std::vector<Entry>> old = std::move(buckets);
    buckets.assign(newCapacity, {});
    for (auto& bucket : old) {
        for (auto& e : bucket) {
            size_t newIdx = djb2(e.key) % newCapacity;
            std::cout << "    re-placing \"" << e.key << "\" -> bucket " << newIdx
                      << " (was in a bucket sized for capacity " << oldCapacity << ")" << std::endl;
            buckets[newIdx].push_back(std::move(e));
        }
    }
}

void insert(std::vector<std::vector<Entry>>& buckets, size_t& count, const std::string& key, int value) {
    double loadFactorAfter = static_cast<double>(count + 1) / buckets.size();
    std::cout << "insert(\"" << key << "\"): count=" << count << ", capacity=" << buckets.size()
              << ", load factor after insert would be " << loadFactorAfter << std::endl;
    if (loadFactorAfter > 0.75) {
        rehash(buckets);
    }
    size_t idx = djb2(key) % buckets.size();
    buckets[idx].push_back({key, value});
    ++count;
    std::cout << "  placed in bucket " << idx << " (capacity is now " << buckets.size() << ")" << std::endl;
}

int main() {
    size_t capacity = 4;
    std::vector<std::vector<Entry>> buckets(capacity);
    size_t count = 0;

    std::cout << "Reference: hash % 4 and hash % 8 for each key\n";
    for (const std::string& key : {"Apple", "Banana", "Cheese", "Bread"}) {
        std::cout << "  " << key << ": %4=" << djb2(key) % 4 << "  %8=" << djb2(key) % 8 << std::endl;
    }
    std::cout << std::endl;

    insert(buckets, count, "Apple", 12);
    insert(buckets, count, "Banana", 7);
    insert(buckets, count, "Cheese", 3);
    insert(buckets, count, "Bread", 9);

    std::cout << "\nFinal layout (capacity " << buckets.size() << "):" << std::endl;
    printLayout(buckets);

    return 0;
}
```

Real output, this session:

```
Reference: hash % 4 and hash % 8 for each key
  Apple: %4=3  %8=7
  Banana: %4=2  %8=6
  Cheese: %4=2  %8=2
  Bread: %4=3  %8=3

insert("Apple"): count=0, capacity=4, load factor after insert would be 0.25
  placed in bucket 3 (capacity is now 4)
insert("Banana"): count=1, capacity=4, load factor after insert would be 0.5
  placed in bucket 2 (capacity is now 4)
insert("Cheese"): count=2, capacity=4, load factor after insert would be 0.75
  placed in bucket 2 (capacity is now 4)
insert("Bread"): count=3, capacity=4, load factor after insert would be 1
  load factor threshold crossed -> rehashing: capacity 4 -> 8
    re-placing "Banana" -> bucket 6 (was in a bucket sized for capacity 4)
    re-placing "Cheese" -> bucket 2 (was in a bucket sized for capacity 4)
    re-placing "Apple" -> bucket 7 (was in a bucket sized for capacity 4)
  placed in bucket 3 (capacity is now 8)

Final layout (capacity 8):
  bucket 0: []
  bucket 1: []
  bucket 2: [Cheese]
  bucket 3: [Bread]
  bucket 4: []
  bucket 5: []
  bucket 6: [Banana]
  bucket 7: [Apple]
```

This is exactly what the real `insert`'s new check and the real
`rehash` above are doing, isolated. Walking the trace: inserting
`"Cheese"` brings the load factor to exactly `0.75` — not *greater
than* `0.75` — so the `if (loadFactorAfter > 0.75)` condition is false
and no rehash fires yet; capacity stays 4. Inserting `"Bread"` next
would bring the load factor to `1.0`, which *is* greater than `0.75`,
so `rehash` fires before `"Bread"` is placed at all. Every existing
entry is re-placed under the new capacity of 8, and — this is the part
a prose description alone would not make obvious — the results are not
the old bucket indices copied over; they're genuinely new, independently
computed ones, because `bucketIndexOf`'s modulo depends on capacity.
`"Apple"` moves from bucket 3 to bucket 7; `"Banana"` moves from bucket
2 to bucket 6. `"Cheese"` happens to land back in bucket 2 again at
capacity 8 too — a coincidence of its specific hash value, not a rule;
nothing here guarantees a key keeps or loses its old bucket number after
a rehash. Only then is `"Bread"` itself placed, directly into the new,
already-grown layout — landing in bucket 3, since `djb2("Bread") % 8 =
3`. This whole growth-when-crowded strategy is called **rehashing**,
and the ratio that triggers it — `count / capacity` — is called the
**load factor**.

Discarded now — this throwaway version, with its free `insert`/`rehash`
functions taking `buckets` and `count` as explicit parameters, its `int`
values, and its debug printing, does not appear in the project again.
The real `ProductIndex::insert`/`rehash` shown above do the identical
thing as private methods operating on the class's own `buckets` and
`count` members, silently, with no debug output.

### Mechanical Walkthrough

- `double loadFactorAfter = static_cast<double>(count + 1) / buckets.size();`
  — `count + 1` is what the entry count *would become* if this insert
  goes ahead; `static_cast<double>(...)` is an explicit conversion from
  integer to floating-point, needed because integer division would
  otherwise truncate `count / buckets.size()` to `0` for any load factor
  under `1.0`, silently making this whole check meaningless; the result
  is stored in `loadFactorAfter`, a `double` — the actual, precise
  **load factor** this insert is about to produce.
- `if (loadFactorAfter > 0.75) {` — compares that ratio against a fixed
  threshold, `0.75`, chosen (as in most real hash map implementations)
  as a practical balance: a lower threshold rehashes more often, keeping
  chains very short at the cost of more frequent, expensive rehash
  calls; a higher threshold rehashes less often but tolerates longer
  chains in between.
- `rehash();` — calls the new private method, growing the table *before*
  this insert's own new entry is placed, guaranteeing the load factor
  never actually exceeds the threshold even momentarily.
- `++count;` — increments `count` after the entry is placed, keeping it
  accurate for the *next* call's own load-factor check.
- `void rehash() {` — a private method; only callable from inside
  `ProductIndex`'s own code, never directly by a caller of `insert`.
- `std::vector<std::vector<Entry>> old = std::move(buckets);` —
  **`std::move`** signals that `buckets`'s current contents are about to
  be replaced and don't need to be preserved in `buckets` itself
  anymore; this transfers `buckets`'s internal storage into `old`
  directly, leaving `buckets` empty, without allocating a second copy of
  every bucket's every entry first.
- `buckets.assign(old.size() * 2, {});` — replaces `buckets`'s own
  contents with `old.size() * 2` freshly-empty buckets — double the
  previous capacity, the same doubling strategy Track A1's dynamic array
  used when it filled up, though what happens next here is genuinely
  more involved than that lesson's own copy.
- `for (auto& bucket : old) {` — a **range-based for loop** over every
  old bucket, by reference (`auto&` — not copying each bucket's own
  vector just to read it).
- `for (auto& e : bucket) {` — nested inside the first: a range-based
  for loop over one old bucket's own entries.
- `size_t newIdx = bucketIndexOf(e.key, buckets.size());` — recomputes
  this specific entry's bucket index, but against `buckets.size()` —
  the *new*, already-doubled capacity, not the one this entry was
  originally placed under. This recomputation, not a plain copy, is the
  entire reason rehashing has to touch every entry instead of just
  reserving more space.
- `buckets[newIdx].push_back(std::move(e));` — places the entry into
  its newly-computed bucket in the new array, again using `std::move` to
  relocate `e`'s own `std::string key` and `Product*` rather than
  copying them.

### CS Lens

This is **rehashing**, triggered by a **load factor** threshold — an
amortized strategy for keeping a hash map's own average operation cost
bounded as it grows. Also recognized in: Track A1's own dynamic array
doubling its capacity when full, though rehashing is a strictly harder
version of that same idea — A1's array only had to copy existing
elements into new slots at the *same relative positions*, while
rehashing has to recompute a genuinely different position for every
single existing entry, because the bucket index itself depends on
capacity. Beyond this project: a city outgrowing its original road
grid and needing to re-plan intersections, not just pave more road; a
phone system's area code splitting once a region's numbers run out,
reassigning which prefix belongs to which exchange; a database rebuilding
its own index after a table has grown far past its original sizing
estimate.

### SE Lens

The alternative not chosen here is never resizing at all — simpler code,
one less method, no occasional expensive `insert` call. But without it,
`ProductIndex`'s average lookup cost grows without bound as more
products are added, which defeats this entire lesson's premise: a hash
map that quietly degrades back into a linear scan as data grows has not
actually solved the problem it exists to solve. The chosen alternative —
grow at a load-factor threshold — pays an occasional real cost (one
`rehash` call touches every existing entry, genuinely O(n) for that one
call) in exchange for keeping every *other* `insert` and every `find`
fast. Averaged over a long sequence of many inserts, that occasional
O(n) cost divided across all of them works out to a constant cost per
insert — the concrete meaning of **amortized time complexity** from this
lesson's own Terms glossary, not just a vocabulary word attached after
the fact.

### Commands Needed

```
clang++ -std=c++17 -Wall -Wextra lab3_rehash.cpp -o lab3_rehash && ./lab3_rehash
```

Same compiler, standard, and warning flags as both previous units — this
file also compiles with zero warnings.

### Run It

Already shown above, under "Introduce the Concept in Isolation."

### Connecting Back

`ProductIndex` is now complete: hashing gets a key to a bucket,
chaining keeps a collision correct, and rehashing keeps chains from
growing unboundedly as the catalog does. The Closing below wires this
exact class to the real catalog and measures, for real, what it actually
bought.

---

## Closing

### Connect the Pieces

One concrete product, `"Bread"`, traced through every piece this lesson
built, in the order it actually happens inside the real
`ProductIndex::insert("Bread", bread)` call — the fourth and last
product inserted in this lesson's own demonstration, after `"Apple"`,
`"Banana"`, and `"Cheese"` are already in place at capacity 4 (`count`
already `3`):

1. `insert` computes `loadFactorAfter = static_cast<double>(3 + 1) /
   4 = 1.0`.
2. `1.0 > 0.75` is true, so `rehash()` runs *before* `"Bread"` is
   touched at all. Every one of the three existing entries is
   re-placed into a fresh, 8-bucket array: `"Apple"` moves to bucket 7,
   `"Banana"` moves to bucket 6, `"Cheese"` lands in bucket 2 again.
3. Only now does `insert` compute `"Bread"`'s own bucket index:
   `bucketIndexOf("Bread", 8)`, which is `djb2("Bread") % 8 = 3`.
4. `buckets[3].push_back({"Bread", bread})` — bucket 3, at the new
   capacity, was empty, so this is chaining's ordinary case: no
   collision this time, just a plain first entry in that bucket.
5. `++count` brings the count to `4`.

Later, `ProductIndex::find("Cheese")` retraces the same hashing step —
`bucketIndexOf("Cheese", 8) = 2` — walks bucket 2's chain (one entry,
`"Cheese"` itself, after the rehash), and returns the real `Product*`
built earlier by `TagPool`/`Product` from Lesson B5. Every piece this
lesson built — hashing, chaining, rehashing — runs on every single
`insert` and `find` call; `"Bread"` simply happens to be the one call in
this lesson's own demonstration where all three are visible in the same
trace.

### Measured: Hash Map vs. Linear Scan at Scale

Track C's own premise is speed, not memory — so, per the same real-
measurement standard Lesson B5 used for Flyweight's memory savings, here
is a real timed comparison, not just an assertion that hashing is
faster. Two separate programs were built: `scale_linear_lookup.cpp`
builds a catalog of 200,000 products and performs 5,000 lookups by
comparing each target name against every stored product's `label` in
turn, stopping at the first match; `scale_hash_lookup.cpp` builds the
identical 200,000-product catalog, indexes every product into a real
`ProductIndex` as it's built, and performs the same 5,000 lookups (the
same random seed, `std::mt19937 rng(42)`, produces the identical
sequence of target names in both programs) through `ProductIndex::find`
instead.

Both compiled with `-O2` — an optimization level enabling the compiler
to remove overhead a plain debug build wouldn't (inlining small
functions, eliminating redundant work) — because comparing two
*algorithms'* real relative speed requires removing compiler-overhead
noise that would otherwise affect both programs and obscure the actual
difference being measured:

```
clang++ -std=c++17 -Wall -Wextra -O2 scale_linear_lookup.cpp -o scale_linear_lookup
clang++ -std=c++17 -Wall -Wextra -O2 scale_hash_lookup.cpp -o scale_hash_lookup
/usr/bin/time ./scale_linear_lookup
/usr/bin/time ./scale_hash_lookup
```

`/usr/bin/time` (distinct from the shell's own built-in `time`) runs a
program and reports three real numbers after it finishes: `real`, the
total wall-clock time elapsed; `user`, the CPU time actually spent
executing this program's own code; and `sys`, CPU time spent in the
operating system on this program's behalf. `real` includes whatever else
this machine happened to be doing at the same moment — scheduling noise
neither program controls — so `user` is the fairer of the two numbers
for comparing two algorithms doing the same logical work.

Real output, this session:

```
linear scan: 5000 lookups over 200000 products, found 5000
        0.70 real         0.54 user         0.00 sys

hash map lookup: 5000 lookups over 200000 products, found 5000
        0.21 real         0.03 user         0.00 sys
```

Both programs found all 5,000 targets — this is a speed comparison
between two *correct* implementations, not a correctness comparison.
The linear scan spent `0.54` CPU-seconds finding them; the hash map
spent `0.03` — about 18 times less CPU time, for the identical 5,000
lookups against the identical 200,000-product catalog. That gap is not
a fixed constant; a linear scan's cost grows directly with catalog
size, while `ProductIndex::find`'s cost, on average, does not grow with
it at all — a larger catalog than 200,000 products would widen this
same gap further, not narrow it.

### What Breaks Without This

Chaining specifically — not hashing, not rehashing — is what keeps a
collision from silently losing data. Here's a deliberately broken
`ProductIndex` where each bucket holds a single `Entry` slot instead of
a `std::vector` of them, so a second key hashing into an already-
occupied bucket simply overwrites whatever was there:

```cpp
class BrokenProductIndex {
public:
    BrokenProductIndex(size_t capacity) : buckets(capacity) {}

    void insert(const std::string& key, Product* value) {
        size_t idx = djb2(key) % buckets.size();
        buckets[idx] = {key, value};
    }

    Product* find(const std::string& key) const {
        size_t idx = djb2(key) % buckets.size();
        if (buckets[idx].value != nullptr && buckets[idx].key == key) {
            return buckets[idx].value;
        }
        return nullptr;
    }

private:
    struct Entry {
        std::string key;
        Product* value = nullptr;
    };

    std::vector<Entry> buckets;
};
```

Real output, this session, inserting the same four products this lesson
has used throughout, at the same capacity of 4:

```
insert("Apple") -> bucket 3
insert("Banana") -> bucket 2
insert("Cheese") -> bucket 2 (OVERWRITING "Banana", which was already there)
insert("Bread") -> bucket 3 (OVERWRITING "Apple", which was already there)

find("Banana") -> not found — but it was inserted above!
```

`"Banana"` was genuinely inserted, and then genuinely lost — not because
of a bug in `find`, but because `insert` had nowhere to put `"Cheese"`
except directly on top of it. This is the real, demonstrated reason
`ProductIndex::insert` above uses `buckets[idx].push_back({key, value})`
into a `std::vector<Entry>`, appending, rather than
`buckets[idx] = {key, value}`, overwriting: a bucket that can only hold
one entry is not an incomplete optimization — it's a hash map that
silently discards data the moment two keys share a bucket, which
`bucketIndexOf`'s own modulo guarantees will eventually happen to *some*
two keys, no matter how good the hash function is.

### Exercises

- Change `ProductIndex`'s default `initialCapacity` from `4` to `16`
  and re-run this lesson's four-product insert sequence. Confirm, by
  temporarily printing `buckets.size()` before and after each `insert`
  call, that no rehash fires this time — then explain why not, using
  the load factor formula from the "Load Factor and Rehashing" unit
  (four products in sixteen buckets is a load factor of `0.25`, nowhere
  near the `0.75` threshold).
- Pick a fifth and sixth product name of your own choosing. Using
  `lab1_hash_function.cpp`'s own `djb2` function, compute each name's
  real hash value and its bucket index at both capacity 4 and capacity
  8 by hand, then confirm your prediction against the real program's
  output.
- Change the rehash threshold in `insert`'s `if (loadFactorAfter >
  0.75)` check to `0.5`, and re-run the Closing's own timed comparison.
  Using what the "Load Factor and Rehashing" unit's SE Lens established
  — a lower threshold rehashes more often but keeps chains shorter —
  predict, before running it, whether this should make `find` faster or
  slower at the same 200,000-product scale, then check the real,
  re-measured numbers against that prediction.

### Definition of Done

- [ ] `catalog_lookup.cpp` compiles clean with `clang++ -std=c++17
      -Wall -Wextra`, zero warnings.
- [ ] `ProductIndex::find` returns the correct `Product*` for every key
      actually inserted (`"Apple"`, `"Banana"`, `"Cheese"`, `"Bread"`),
      and `nullptr` for a key that was never inserted (`"Mango"`).
- [ ] The four-product insert sequence visibly triggers exactly one
      rehash, capacity 4 to 8, confirmed by re-running with a temporary
      diagnostic print of `buckets.size()`.
- [ ] The real linear-scan-vs-hash-map timing comparison in this
      Closing has actually been run on this machine, this session, and
      the numbers cited are its real output, not estimates.
- [ ] `BrokenProductIndex`'s real failure — `"Banana"` silently lost —
      has been reproduced and understood, and no version of that bug
      (a bucket that can hold only one entry) exists in the real
      `ProductIndex`.
- [ ] `git commit`, with a message stating *why*: catalog lookups were
      an O(n) scan; this trades a bucket array and a hash function for
      average O(1) `find`, at the real cost of needing chaining and
      rehashing to keep that fast as the catalog grows.
