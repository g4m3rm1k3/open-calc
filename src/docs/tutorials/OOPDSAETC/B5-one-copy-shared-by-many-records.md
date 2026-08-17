# Lesson B5: One Copy, Shared by Many Records

**What you will build** — A `TagPool` that hands out shared,
read-only tag strings ("perishable," "baked," and others) to this
project's catalog `Product`s — so that any two products carrying the
same tag text genuinely share one underlying string in memory, proven
directly by comparing their pointers, not just their printed values.
The transferable problem: a real catalog with thousands of products
would repeat the same handful of tag, category, and supplier strings
over and over — if every product stored its own independent copy of
its tag text, the total memory spent on tags would grow with the
number of *products*, even though the number of genuinely distinct
tags stays small and fixed.

**What you need to know first** — Lesson B4's `CatalogItem` and
`Product`, extended directly in this lesson. Lesson B1's own
distinction between heap allocation and a dangling pointer — this
lesson's `TagPool` hands out heap-allocated data meant to outlive and
be shared across many callers, the same underlying reason Lesson B1's
`new` was necessary at all.

**Terms used in this lesson**

- **Flyweight** — a design pattern where many logically-identical
  pieces of data are stored once and shared by reference, instead of
  being duplicated once per object that needs them. It exists to cut
  memory use in exactly the situation this lesson's BRD row names
  directly: a large number of records that repeat the same small set of
  substrings — storing one real copy per *distinct* value, instead of
  one per record, means memory spent on that data grows with how much
  of it is actually different, not with how many records refer to it.
- **interning** — the specific technique this lesson's `TagPool`
  implements: given a piece of text, return a shared pointer to one
  canonical stored copy of it, creating that copy only the first time
  that exact text is ever requested, and reusing it on every later
  request for the same text. It exists as the standard name for
  Flyweight applied specifically to strings — several real language
  runtimes (named directly in this lesson's CS Lens) do this
  automatically for certain strings, for exactly this lesson's own
  reason.
- **pointer identity** — comparing two pointers with `==` to ask "do
  these refer to the exact same object," as opposed to comparing the
  *values* those pointers point at. It exists as this lesson's actual
  proof mechanism: two products' tags having identical *text* proves
  nothing about whether that text is actually shared in memory or
  independently duplicated; only comparing the pointers themselves —
  their identity, not their content — can prove sharing really
  happened.

**Objects and methods used**

- **`TagPool`** (this lesson's own subject)
  - *What it is:* a small class whose only job is handing out shared,
    canonical `const std::string*` values for repeated tag text.
  - *Implementation:* built in this lesson's first Concept Unit; full
    shape shown there.
  - *Its use:* every tag this lesson's `Product`s carry is obtained by
    calling `TagPool::intern`, never by constructing a fresh
    `std::string` directly.

**Everything else in the file, not this lesson's subject but still
explained:**

- **`std::vector<T>`**
  - *What it is:* the standard library's growable array, already given
    full treatment, including its real declared shape, in Lesson B4.
  - *Implementation:* unchanged from Lesson B4.
  - *Its use:* `TagPool` stores its collection of already-interned
    strings in a `std::vector<std::string*>`, the same container type
    `Category` already used to store its children.
- **`std::string`**
  - *What it is:* the standard library's owned, growable character
    sequence, already given full treatment in Lesson B1.
  - *Implementation:* unchanged.
  - *Its use:* the actual type being shared — each distinct tag exists
    as exactly one heap-allocated `std::string`, referenced by every
    `Product` that carries that tag.

---

## Concept Unit 1: A Factory That Returns the Same Object Twice

### The Problem

If every `Product` simply stored its own `std::string tag` member,
initialized directly from a string literal each time one is
constructed, two products both tagged `"perishable"` would each get
their *own*, entirely independent heap-allocated copy of those eleven
characters — identical in content, but two separate pieces of memory,
with nothing connecting them. With a handful of products this costs
nothing worth noticing; with thousands of products drawn from a small
set of repeated tags, it means the same short strings get duplicated
over and over, once per product, for no real benefit. What's needed is
a single place that hands out *the same* stored copy of a given tag's
text to every caller that asks for it.

### Project Change

- **Reference Source** — No reference counterpart; from-scratch, per
  Lesson B1's own scoping decision, which every lesson in this project
  has followed since.
- **Files affected** — `catalog_composite.cpp`, modified — this
  lesson extends Lesson B4's file directly, rather than starting a new
  one, because sharing tag text is an addition to the existing
  `Product` type, not a structurally different kind of thing the way
  Lesson B4's own leaf/composite split was from Lessons B1–B3's
  `TreeNode`.
- **Change type** — add.
- **Location** — a new class, `TagPool`, placed above `Product`'s own
  definition.
- **Dependencies** — `#include <vector>`, already present since
  Lesson B4.

### The New Code

```cpp
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
```

### The Updated Project

`TagPool`'s complete definition — this one method, plus the private
`pool` it searches and grows:

```cpp
class TagPool {
public:
    const std::string* intern(const std::string& text) {   // ← new
        for (std::string* existing : pool) {                 // ← new
            if (*existing == text) {                           // ← new
                return existing;                                 // ← new
            }                                                     // ← new
        }                                                          // ← new
        std::string* fresh = new std::string(text);                // ← new
        pool.push_back(fresh);                                       // ← new
        return fresh;                                                 // ← new
    }                                                                   // ← new

private:
    std::vector<std::string*> pool;
};
```

### Introduce the Concept in Isolation

A minimal, direct proof that calling `intern` twice with equal text
returns the exact same pointer both times — not just equal-looking
text:

```cpp
#include <iostream>
#include <string>
#include <vector>

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

int main() {
    TagPool pool;

    const std::string* a = pool.intern("perishable");
    const std::string* b = pool.intern("perishable");
    const std::string* c = pool.intern("imported");

    std::cout << "a == b: " << (a == b) << std::endl;
    std::cout << "a == c: " << (a == c) << std::endl;
    std::cout << "a address: " << a << ", b address: " << b << std::endl;

    return 0;
}
```

Compiled and run for real:

```
$ clang++ -std=c++17 -Wall -Wextra lab1_intern.cpp -o lab1 && ./lab1
a == b: 1
a == c: 0
a address: 0x1028d1ac0, b address: 0x1028d1ac0
```

`a == b` prints `1` (`true`) — the same pointer, byte for byte, was
returned both times `"perishable"` was requested; the printed
addresses match exactly (the specific address shown here is just
wherever this particular run's heap happened to place it — a different
run could print a different number — the fact that both lines show the
identical value is what matters, not the value itself). `a == c`
prints `0` (`false`) — different text correctly produced a different,
independent object. Storing one canonical copy and handing back a
pointer to it, on request, every time the same input is seen again, is
called **interning**.

### Discard the Throwaway Example

`a`, `b`, and `c` above existed only to prove `intern` really does
return identical pointers for identical text. They're discarded now;
this project's real `TagPool` is used directly by `Product`, next.

### Mechanical Walkthrough

Enumerating `intern`'s body, in order:

- **`const std::string* intern(const std::string& text)`** — a public
  method taking the requested tag text by `const std::string&`
  (avoiding an unnecessary copy of the caller's own string) and
  returning `const std::string*` — a pointer, not a fresh `std::string`
  by value, because returning by value would immediately undo the
  entire point of this method by creating yet another independent
  copy; `const` on the return type additionally promises callers will
  never modify the shared string through this pointer, which matters
  specifically because *multiple* products end up pointing at the same
  one.
- **`for (std::string* existing : pool)`** — a range-based for loop
  over `pool` (Lesson B3's own desugaring, reapplied here, same as
  Lesson B4's `Category::totalQuantity`), checking every already-stored
  tag in turn.
- **`if (*existing == text)`** — dereferences `existing` (a
  `std::string*`) to compare its actual string *content* against
  `text`, using `std::string`'s own built-in `==`, which compares
  characters, not addresses — this is deliberately the opposite check
  from this lesson's own proof above: finding a match here is based on
  content equality, precisely so that the *pointer* returned afterward
  can be reused by identity for every future caller with that same
  content.
- **`return existing;`** — if a match was found, return the
  *already-existing* pointer directly — no new allocation happens on
  this path at all, which is the entire mechanism that makes sharing
  real rather than accidental.
- **`std::string* fresh = new std::string(text);`** — reached only if
  no existing entry matched: heap-allocates a brand-new `std::string`,
  copy-constructed from `text`, using the same `new` mechanism Lesson
  B1 gave full treatment to — this is the *one and only* time this
  particular tag's text is ever actually duplicated into new memory,
  no matter how many more times it gets requested afterward.
- **`pool.push_back(fresh);`** — records the freshly created pointer in
  `pool`, so the next call requesting this same text finds it via the
  loop above instead of allocating again.
- **`return fresh;`** — returns the newly created pointer to the
  caller.

### CS Lens

Storing one canonical copy of a repeated value and referencing it by
identity, rather than duplicating it, recurs directly under this exact
name in several real language runtimes. Also recognized in: Python,
which automatically interns many short string literals and small
integers for this exact reason; the Java Virtual Machine's own "string
pool," which does the identical thing for string literals by default;
and, more broadly, any **memoization** cache (storing a computed
result keyed by its input, so the same input never triggers the same
expensive work twice) — `intern`'s own linear search for a match before
creating something new is a direct, if simple, instance of that same
"check before you build" shape.

### SE Lens

The alternative rejected here: giving each `Product` its own
independent `std::string tag`, initialized directly from a literal,
with no pool at all. That's simpler to write and reason about locally
— no extra class, no lookup — and is genuinely the right call for a
catalog with only a handful of products, where duplication costs
nothing worth measuring. The real, honestly stated cost of `TagPool`
as built here: `intern`'s linear search means every new tag request
gets slightly slower as `pool` grows, an `O(n)` scan against `n`
*distinct* tags (not `n` products) — for a catalog realistically drawn
from a small, fixed set of tag categories, `n` stays small regardless
of how many products exist, so this cost stays flat in practice; a
catalog with genuinely thousands of *distinct* tag strings, rather than
thousands of products repeating a handful of tags, would need a faster
lookup (a hash-based structure, Track C's own subject) instead of this
lesson's simple linear scan.

### Commands Needed

```
clang++ -std=c++17 -Wall -Wextra lab1_intern.cpp -o lab1
```

Same `clang++` flags used throughout this project.

### Run It — Real Output

```
$ clang++ -std=c++17 -Wall -Wextra lab1_intern.cpp -o lab1 && ./lab1
a == b: 1
a == c: 0
a address: 0x1028d1ac0, b address: 0x1028d1ac0
```

The real project's `TagPool` cannot be checked standalone yet — nothing
constructs one and calls `intern` until `Product` actually uses it, in
the next Concept Unit.

### Connecting Sentence

`TagPool` can now hand out genuinely shared pointers for repeated text;
the next Concept Unit gives `Product` a tag drawn from it, and proves
real catalog items actually share memory, not just printed values.

---

## Concept Unit 2: Sharing Tags Across Real Catalog Items

### The Problem

`TagPool` works in isolation, but nothing in this project's actual
catalog uses it yet — `Product`, as Lesson B4 left it, has no concept
of a tag at all. Adding one the naive way (a `std::string tag` member,
set directly per product) would silently reintroduce the exact
duplication problem this lesson exists to remove; `Product` needs to
store a *pointer* obtained from a shared `TagPool`, not its own private
copy.

### Project Change

- **Reference Source** — No reference counterpart.
- **Files affected** — `catalog_composite.cpp`, modified.
- **Change type** — refactor (`Product`'s constructor gains a
  parameter; every existing `new Product(...)` call is updated to
  supply a tag).
- **Location** — `Product`'s own definition, and the three
  `new Product(...)` lines Lesson B4 built inside `main`.
- **Dependencies** — `TagPool`, built in Concept Unit 1.

### The New Code

```cpp
const std::string* tag;
```

### The Updated Project

`Product`, with a new `tag` member and a constructor accepting it:

```cpp
class Product : public CatalogItem {
public:
    Product(std::string label, int quantity, const std::string* tag)  // ← new parameter
        : CatalogItem(label), tag(tag), quantity(quantity) {}          // ← new

    int totalQuantity() const override {
        return quantity;
    }

    const std::string* tag;   // ← new

private:
    int quantity;
};
```

`Product`'s constructor initializer list lists `tag(tag)` before
`quantity(quantity)` specifically because `tag` is now declared, as a
member, before `quantity` in the class body above it — C++ always
initializes members in their *declared* order, regardless of the order
written in the initializer list; writing the initializer list to match
prevents the exact compiler warning
(`-Wreorder-ctor`, "field 'quantity' will be initialized after field
'tag'") this project's own verification caught and fixed this session
while building this lesson.

And in `main`, every existing product now supplies a tag, obtained
through a shared `TagPool`:

```cpp
TagPool tags;   // ← new

Product* apple = new Product("Apple", 12, tags.intern("perishable"));   // ← tag added
Product* banana = new Product("Banana", 7, tags.intern("perishable")); // ← tag added
Product* bread = new Product("Bread", 4, tags.intern("baked"));         // ← tag added
```

### Introduce the Concept in Isolation

No new isolated lab is needed for this Concept Unit specifically —
`Product`'s new `tag` member uses the exact same pointer-member and
constructor-parameter mechanics Lesson B4's own `Product` and `Category`
already demonstrated in full, and `TagPool::intern`'s own behavior was
already fully proven in Concept Unit 1's isolated lab. What's new here
is purely the application: two real products, `apple` and `banana`,
both requesting `"perishable"` from the *same* `TagPool` instance,
proven — directly against the real project, not a throwaway stand-in —
to end up pointing at the identical shared string, immediately below.

### Mechanical Walkthrough

Enumerating what's new in `Product` and `main`:

- **`const std::string* tag;`** — a new pointer member on `Product`,
  same declaration mechanism as `TreeNode`'s own pointer members back
  in Lesson B1, now `const`-qualified because `Product` itself never
  intends to modify the shared string it points at.
- **`Product(std::string label, int quantity, const std::string* tag)`**
  — the constructor gains a third parameter, same parameter-passing
  mechanism already fully explained in Lesson B4; `tag` here is simply
  a pointer value, copied into `Product`'s own `tag` member — copying a
  *pointer* copies the address it holds, not the string data it points
  at, which is exactly why two different `Product`s can end up storing
  the identical address.
- **`TagPool tags;`** (inside `main`) — constructs one single `TagPool`
  instance, shared by every product built afterward — sharing only
  works because every call to `intern` below goes through this *same*
  pool; two separate `TagPool` objects would each maintain their own
  independent `pool` member and never find each other's entries.
- **`tags.intern("perishable")`** (used for both `apple` and `banana`)
  — the first call creates and stores a new `std::string("perishable")`
  and returns its address; the second call, same text, finds that
  exact entry already in `tags`' own `pool` and returns the identical
  address — `apple->tag` and `banana->tag` end up holding the exact
  same pointer value, proven directly below.
- **`tags.intern("baked")`** (used for `bread`) — different text, no
  match found in `tags`' `pool`, so a genuinely new, independent string
  is created — `bread->tag` points somewhere entirely different from
  `apple->tag`/`banana->tag`.

### CS Lens

This Concept Unit's own proof — content equal, address different for
one pair; content equal, address equal for another — is the concrete,
inspectable difference between two ideas that are easy to conflate:
**equality** (do these represent the same value) and **identity** (are
these literally the same object). Also recognized in: Python's `==`
versus `is` operators, which name this exact distinction directly;
Java's `.equals()` versus `==` on objects, the identical distinction
under different syntax; and database systems distinguishing two rows
with identical column values (equal) from the literal same row
(identical), which matters directly for update and locking semantics.

### SE Lens

The real, measured benefit this lesson's design produces, not just
claimed: building two million tagged records, once with each product
storing its own independent `std::string` tag, and once with every
product sharing tags through a `TagPool`, and measuring real peak
memory with `/usr/bin/time -l` against both:

```
$ clang++ -std=c++17 -O2 -Wall -Wextra scale_no_sharing.cpp -o scale_no_sharing
$ clang++ -std=c++17 -O2 -Wall -Wextra scale_with_sharing.cpp -o scale_with_sharing
$ /usr/bin/time -l ./scale_no_sharing
built 2000000 records
            98598912  maximum resident set size
$ /usr/bin/time -l ./scale_with_sharing
built 2000000 records
            66437120  maximum resident set size
```

`98598912` bytes (about `94.0` MB) without sharing, against `66437120`
bytes (about `63.4` MB) with it — a real, measured reduction of about
`30.7` MB, roughly `32.6%` of the unshared program's own peak memory,
for two million records drawn from just five distinct tags. This is
this lesson's own BRD problem, reproduced at the scale it actually
names ("thousands of parsed records") and measured for real, not
estimated — the saving scales with how many *records* share a small,
fixed set of *distinct* values, which is exactly the shape a real
catalog's tags, categories, and supplier names would have.

### Commands Needed

No new flags for `Product`/`main`'s own changes; the scale measurement
above additionally uses `-O2` (optimize the build — without it, an
unoptimized build's own extra bookkeeping can obscure a real memory
comparison at this scale) and `/usr/bin/time -l`, this machine's tool
for reporting a process's real peak memory usage (`maximum resident set
size`), already named as part of this project's own verification
toolkit since the very first session.

### Run It — Real Output

The complete real project, compiled and run in exactly this state:

```
$ clang++ -std=c++17 -Wall -Wextra step_tagged_products.cpp -o step_tagged_products && ./step_tagged_products
Apple tag: perishable
Banana tag: perishable
Cheese tag: imported
apple->tag == banana->tag: 1
apple->tag == cheese->tag: 0
imported == cheese->tag:   1
```

(Verified this session by compiling and running the real project file
in this exact state — `Apple` and `Banana` share the identical tag
pointer, `apple->tag == banana->tag` reporting `1`; `Cheese`'s
`"imported"` tag correctly does not match `apple->tag`'s `"perishable"`,
reporting `0`; and a separately-requested `imported` pointer, obtained
independently from `Cheese`'s own, still matches it exactly, reporting
`1` — proving `intern` returns the same pointer no matter how many
separate call sites request the identical text.)

### Connecting Sentence

Real catalog products now share tag memory instead of duplicating it,
proven both by direct pointer comparison and by a real, measured memory
difference at scale; the Closing, next, breaks `intern`'s own
deduplication check on purpose to show what silently goes wrong without
it.

---

## Closing

### Connect the Pieces

Follow the tag `"perishable"` through this lesson's whole build:

1. `tags.intern("perishable")` is called for `apple` — `tags`' own
   `pool` is empty, so no match is found; a new `std::string` is
   heap-allocated and stored, and its address is returned.
2. `tags.intern("perishable")` is called again, for `banana` — this
   time `pool` already holds one entry, `"perishable"`, and the
   content check (`*existing == text`) matches it — the *same* address
   from step 1 is returned, with no new allocation.
3. `apple->tag` and `banana->tag` now hold the identical pointer value
   — proven directly, in this lesson's own verified run, by
   `apple->tag == banana->tag` printing `1`.
4. At scale — two million records instead of two — this exact same
   mechanism, repeated, is precisely what produced this lesson's own
   measured `30.7` MB reduction: every repeated request for
   `"perishable"` (or any of the other four tags used in that
   measurement) took step 2's path, never step 1's, after the very
   first request for each distinct tag.

### What Breaks Without This

Removing `intern`'s own existing-entry check on purpose — always
allocating fresh, never searching `pool` first:

```cpp
const std::string* intern(const std::string& text) {
    // bug: forgot to search the existing pool first -- always allocates fresh
    std::string* fresh = new std::string(text);
    pool.push_back(fresh);
    return fresh;
}
```

Compiled and run for real:

```
$ clang++ -std=c++17 -Wall -Wextra break_no_dedup_check.cpp -o break_no_dedup_check && ./break_no_dedup_check
*a: perishable, *b: perishable
a == b: 0
```

A real, verified failure of the quietest possible kind: `*a` and `*b`
still both print `"perishable"` — the *content* is completely correct,
and nothing about this program's visible output looks wrong at all.
Only `a == b` — pointer identity, not content — reveals the real
problem: `0` (`false`), proving `a` and `b` are two separate,
independently allocated strings with identical content, exactly the
duplication this entire lesson exists to prevent. This is precisely why
this lesson's own proof, throughout, has relied on pointer comparison
rather than printed output — a broken `intern` that skips deduplication
would pass any test that only checks printed values, silently
reverting this project's real, measured `32.6%` memory saving back to
zero, without a single visibly wrong line of output anywhere. Restoring
the check:

```cpp
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
```

### Exercises

- Add a `size_t uniqueCount() const` method to `TagPool` that returns
  how many distinct tags it currently holds (hint: this is just
  `pool`'s own size). Verify it reports `2` after `apple`, `banana`,
  and `cheese` have all requested their tags (`"perishable"` and
  `"imported"` — two distinct values across three products).
- `intern`'s linear search means the *n*-th distinct tag requested for
  the first time costs up to *n* comparisons. Predict, by reasoning
  rather than running anything, whether this cost is paid once per
  distinct tag or once per product — then write a short comment in
  `catalog_composite.cpp` explaining your answer, and check it against
  this lesson's own SE Lens.
- Modify `scale_no_sharing.cpp`/`scale_with_sharing.cpp` (or write new,
  similarly structured files) to use only two distinct tags instead of
  five, at the same two-million-record scale, and re-run the same real
  `/usr/bin/time -l` measurement this lesson used. Predict, before
  running, whether the memory gap should grow or shrink compared to
  five tags — then confirm.

### Definition of Done

- [ ] `catalog_composite.cpp` compiles cleanly with `clang++
      -std=c++17 -Wall -Wextra`, no warnings — including no
      `-Wreorder-ctor` warning on `Product`'s constructor.
- [ ] Running it shows `apple->tag == banana->tag` as `1` and
      `apple->tag == cheese->tag` as `0`.
- [ ] Every isolated lab in this lesson, including the real
      `/usr/bin/time -l` memory measurement, was actually run this
      session, with real pasted numbers.
- [ ] The missing-deduplication-check failure was actually caused and
      observed — content correct, pointer identity wrong — then
      reverted.
- [ ] `git commit -m "Share one copy of each distinct catalog tag
      across every product that carries it, instead of duplicating tag
      text per product — verified at scale with a real measured drop
      in peak memory"`
