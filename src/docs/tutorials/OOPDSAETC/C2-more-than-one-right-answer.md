# Lesson C2: More Than One Right Answer

**What you will build** — A `ProductTrie` added to the running catalog
project (`catalog_autocomplete.cpp`) that indexes every product by its
label one character at a time, so that a partial, still-being-typed
prefix like `"Ch"` or `"Pea"` resolves to *every* product whose label
starts with it — `"Ch"` returning both `Cheese` and `Cherry`, not just
one or the other. The transferable problem underneath the feature:
Lesson C1's hash map turns a *complete* key into one bucket index and
can only ever answer "does this exact key exist" — a trie instead turns
every *character* into a step down a shared path, so a prefix is a
real, walkable location with everything below it still reachable, which
is what "suggest matches as someone types" actually requires.

**What you need to know first** — Lesson C1's `ProductIndex` (the hash
map this lesson is deliberately contrasted against — same catalog, the
same insert-then-look-up shaped API, structurally incapable of this
lesson's own vehicle). Lesson B4's `CatalogItem`/`Product` and Lesson
B5's `TagPool` (reused verbatim, unmodified, as this lesson's own
catalog domain — the same reuse Lesson C1 already established). Lesson
B1's recursive tree traversal (the same "call yourself on each child,
stop at a base case" technique, reapplied here to walk a `TrieNode`'s
children instead of a binary tree's two branches).

## Terms used in this lesson

- **trie** — a tree in which each edge is labeled with one character,
  so the sequence of edges walked from the root to any node spells out
  exactly the characters typed so far; it exists because a hash map's
  index depends on hashing a *complete* key, so a partial key hashes to
  a bucket with no relation to the full key's bucket — a trie instead
  makes every partial prefix a real, walkable location in the
  structure, which is exactly what "suggest matches as someone types"
  needs.
- **prefix** — an initial, contiguous run of characters at the start of
  a string (`"Ch"` is a prefix of both `"Cheese"` and `"Cherry"`); it's
  the name for the exact relationship a hash map can't search on — a
  hash map answers "is this whole string a key," a trie answers "what
  keys start with this string," and this lesson's whole vehicle depends
  on that difference.
- **fixed-size array** — a block of memory holding a constant,
  compile-time-known number of elements, indexed by position
  (`children[128]` always holds exactly 128 pointers, never more, never
  fewer); contrasted with Track A's `Array<T>` (Lesson A1), which grows
  at runtime by doubling — a `TrieNode` never needs to grow, because the
  number of possible next characters is fixed by the alphabet, not by
  how much data has been inserted, so a growable container would solve
  a problem this structure doesn't have.
- **character code** — the small integer value a language's character
  type actually stores underneath a human-readable glyph (`'A'` is
  stored as the integer 65, `'a'` as 97, in the ASCII scheme this
  machine's toolchain uses); it matters here because it means a
  character can be used directly as an array index — no hash function,
  no computed bucket, just the character's own numeric identity
  pointing straight at a slot.
- **default member initializer** — a value written directly after a
  class or struct member's declaration (`bool isEnd = false;`) that
  becomes that member's value automatically, on every object of that
  type, unless a constructor's own initializer list overrides it; it
  exists so a type's "safe starting state" is guaranteed at the type's
  own definition, once, instead of being re-typed correctly (or
  forgotten) in every constructor that builds one.
- **pointer** — a variable whose value is a memory address, letting one
  object refer to another without owning or copying it (`TrieNode*
  children[128]` holds 128 addresses, not 128 whole `TrieNode`
  objects); pointers are what let a tree's nodes actually connect to
  each other — without them, a "child" would have to be a full nested
  copy, and no two nodes could ever share or reassign a link at
  runtime.
- **nullptr** — the literal, type-safe value meaning "this pointer does
  not currently point at any object"; it exists so "no child here yet"
  has a real, checkable value (`children[index] == nullptr`) instead of
  a pointer that looks valid but silently points at garbage memory.
- **struct** — a class-like type whose members are `public` by default
  (the opposite of `class`, whose members default to `private`); it's
  the right tool for `TrieNode` specifically because a trie node has no
  invariant to protect — it's a plain bag of pointers and a flag, with
  no method that needs to keep its fields in some consistent
  relationship — so paying for `class`'s default-private ceremony would
  add nothing.
- **static_cast** — a compile-time-checked explicit type conversion,
  spelled `static_cast<T>(value)`, that only allows conversions the
  compiler can verify make sense for the two types involved (unlike a
  raw C-style cast, which will force almost anything through). It
  appears here for exactly the reason it appeared in Lesson C1's
  `djb2`: a plain `char` can be a *signed* type on this toolchain, so a
  character with its high bit set would convert to a negative `int` —
  and a negative array index is undefined behavior. Converting through
  `unsigned char` first guarantees a small positive value before it's
  ever used as an index.
- **unsigned char** — an 8-bit integer type guaranteed never to be
  negative (range 0–255); it's the specific type this lesson's
  `static_cast` converts through, because it's exactly wide enough to
  hold any possible byte value without sign trouble, and every possible
  value it can hold fits inside the 128-slot children array.
- **recursion** — a function that calls itself on a smaller version of
  the same problem, with a base case that stops the calls from
  continuing forever; it's the same technique Lesson B1's tree
  traversals used to walk a binary tree's branches, reapplied here to
  walk a `TrieNode`'s own children — a trie is a tree with up to 128
  branches per node instead of 2, but "call yourself on each child,
  stop when there's nothing left to descend into" is the identical
  idea.
- **const-qualified method** — a method whose signature ends in `const`
  (`std::vector<Product*> autocomplete(const std::string& prefix)
  const`), promising the compiler and every caller that calling it will
  never modify the object it's called on; it exists so a caller holding
  a `const ProductTrie&` — or simply wanting the guarantee — can call
  `autocomplete` with confidence that a lookup can never, as a side
  effect, change what's stored.
- **access modifier (public / private)** — a keyword controlling which
  code is allowed to reach a class's members directly; `public` members
  are reachable from anywhere the object itself is reachable, `private`
  members only from the class's own methods. `ProductTrie` uses this to
  keep `root` and `collect` as private implementation details — callers
  get `insert` and `autocomplete` as the only two ways in, so the
  tree's actual shape can change later without breaking anything that
  calls this class.
- **reference parameter** — a parameter declared with `&`
  (`std::vector<Product*>& matches`) that refers to the caller's own
  variable rather than a copy of it; `collect` uses this so every
  recursive call appends to the *same* `matches` vector instead of each
  call building and then discarding its own separate copy — without it,
  only the outermost call's pushes would ever survive.
- **range-based for loop** — the `for (char c : label)` form that
  visits every element of a sequence in order without a manually
  managed index variable; it appears throughout `insert`'s and
  `autocomplete`'s prefix-walking loops for the same reason it appeared
  walking strings and trees in earlier lessons — the code needs "every
  character, in order," not "an index into this container," and this
  syntax says exactly that.
- **ternary conditional operator** (`? :`) — a single expression that
  evaluates to one of two values depending on a condition (`cond ?
  whenTrue : whenFalse`), used in this lesson's demonstration code
  purely to choose which of two strings to print based on a pointer
  comparison; it's an expression, not a statement, so it can sit
  directly inside a larger expression like a `std::cout <<` chain
  instead of needing a separate `if`/`else` block above it.

## Objects and methods used

**TrieNode**
- *What it is:* a plain data-holding struct representing one position
  along a trie's paths — one node per character step from the root.
- *Implementation:*
  ```cpp
  struct TrieNode {
      TrieNode* children[128] = {};
      bool isEnd = false;
      Product* product = nullptr;
  };
  ```
  Three public members, no methods, no constructor beyond the
  compiler-generated default (which the default member initializers
  fill in automatically).
- *Its use:* every `ProductTrie` operation (`insert`, `autocomplete`,
  `collect`) works by walking a chain of these — `children` says "where
  can I go from here," `isEnd` says "does a real product's label
  actually end at this exact point," and `product` says "which one."

**ProductTrie::insert**
- *What it is:* the method that adds one product's label into the
  trie, character by character.
- *Implementation:* `void insert(const std::string& label, Product*
  product)` — takes the label to index and the `Product*` it should
  resolve to, returns nothing.
- *Its use:* called once per catalog product, the same way
  `ProductIndex::insert` was called once per product in Lesson C1 —
  this is the trie's half of "build the index," walking from `root` and
  creating any `TrieNode` the walk doesn't find already there.

**ProductTrie::autocomplete**
- *What it is:* the method that answers this lesson's whole vehicle —
  given a typed prefix, return every product whose label starts with
  it.
- *Implementation:* `std::vector<Product*> autocomplete(const
  std::string& prefix) const` — takes the prefix typed so far, returns
  every matching `Product*` (zero, one, or many).
- *Its use:* this is the operation a hash map's `find` (Lesson C1)
  structurally cannot perform — `find` needs the *complete* key and
  returns *at most one* match; `autocomplete` needs only a *prefix* and
  can return *any number* of matches, because every product sharing
  that prefix shares the same path down to that point.

**ProductTrie::collect** (private helper)
- *What it is:* the recursive worker that does the actual gathering,
  once `autocomplete` has walked to the node where the typed prefix
  ends.
- *Implementation:* `void collect(TrieNode* node, std::vector<Product*>&
  matches) const` — takes the subtree's root and the results vector to
  append into, returns nothing (all output happens through the
  reference parameter).
- *Its use:* separated from `autocomplete` specifically because
  `autocomplete`'s own job (walk the prefix, bail out early if the
  prefix doesn't exist) and `collect`'s job (given a starting point,
  find every complete word below it) are two different pieces of
  logic — `autocomplete` calls `collect` exactly once, after it already
  knows the prefix is real.

**Everything else in the file, not this lesson's subject but still explained:**

**CatalogItem**
- *What it is:* the abstract base every catalog entry inherits from,
  first built in Lesson B4 as the common interface a "bundle" (a
  `Category`) and a single item (a `Product`) could both satisfy.
- *Implementation:*
  ```cpp
  class CatalogItem {
  public:
      CatalogItem(std::string label) : label(label) {}
      virtual int totalQuantity() const = 0;

      std::string label;
  };
  ```
  A constructor taking the item's label, one pure virtual method
  (`totalQuantity`, making this class abstract — it can never be
  instantiated directly, only through a concrete subclass like
  `Product`), and one public `label` field.
- *Its use:* this lesson never calls `totalQuantity` or constructs a
  bare `CatalogItem`, but `Product` publicly inherits from it, and
  `TrieNode` stores `Product*` (not `CatalogItem*`) specifically
  because a trie needs a full string `label` to index character by
  character — `CatalogItem` is where that `label` field actually
  lives.

**TagPool**
- *What it is:* the Flyweight interning pool built in Lesson B5,
  guaranteeing every distinct tag string (like `"perishable"`) exists
  as exactly one shared object no matter how many products use it.
- *Implementation:*
  ```cpp
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
  ```
  One public method, `intern`, and one private `pool` of every distinct
  string seen so far.
- *Its use:* this lesson's `main()` still builds a `TagPool` and calls
  `intern` for every product's tag, exactly as Lesson C1 did — the trie
  doesn't touch tags at all, but the `Product` constructor still
  requires one, so the catalog is built the same way it always has
  been.

**TagPool::intern**
- *What it is:* the method that does `TagPool`'s actual interning work.
- *Implementation:* `const std::string* intern(const std::string&
  text)` — takes the text to intern, returns a `const std::string*`
  that's guaranteed to be the *same* pointer for every call with equal
  text.
- *Its use:* called once per product below, in `main()`, to get the
  shared tag pointer each `Product` constructor needs — a linear scan
  checking the pool for an existing equal string before ever allocating
  a new one.

**Product**
- *What it is:* a single catalog entry — the concrete class this entire
  lesson's trie is built to index and retrieve.
- *Implementation:*
  ```cpp
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
  Publicly inherits `CatalogItem`, a constructor taking a label,
  quantity, and interned tag pointer, an `override` of `totalQuantity`,
  a public `tag` pointer, and a private `quantity`.
- *Its use:* every value `ProductTrie::insert` stores and
  `ProductTrie::autocomplete` returns is a `Product*` — the trie never
  owns or copies a `Product`, only points at the same ones `main()`
  already built, identical to how `ProductIndex` used `Product*` in
  Lesson C1.

**std::vector**
- *What it is:* the standard library's dynamic, contiguous, resizable
  array type — conceptually the same growable-storage idea Lesson A1
  hand-built as `Array<T>`, provided ready-made by the standard
  library.
- *Implementation* (the members this lesson actually calls, per the
  C++ standard library's own public specification at
  cppreference.com):
  ```cpp
  template<class T>
  class vector {
  public:
      void push_back(const T& value);
      std::size_t size() const noexcept;
      T& operator[](std::size_t pos);
      // (constructors, iterators, and other members exist but aren't called here)
  };
  ```
- *Its use:* `TagPool::pool` and `ProductTrie::autocomplete`'s return
  value are both `std::vector`s — `push_back` appends the next match
  `collect` finds, and `autocomplete`'s return type,
  `std::vector<Product*>`, is exactly the "zero, one, or many matches"
  shape this lesson's vehicle needs, which a hash map's single-`Product*`-
  or-`nullptr` return (Lesson C1) can't express.

**std::string**
- *What it is:* the standard library's owning, dynamically-sized text
  type — every `label`, tag payload, and `prefix` argument in this
  lesson's code is one.
- *Implementation:* a class managing its own heap-allocated character
  buffer, growing it as needed, exposing (among many other members)
  iteration by character via the range-based `for` loop this lesson's
  `insert` and `autocomplete` both use.
- *Its use:* `label` (from `CatalogItem`) and every string literal
  passed to `insert`/`autocomplete` (`"Ch"`, `"Pea"`, and so on) are
  `std::string`s — the range-based `for (char c : label)` loop walks
  exactly this type, one `char` at a time, which is the whole mechanism
  `insert` and `autocomplete` use to descend the trie.

---

## Concept Unit: The Trie Node — A Path Is The Key

### The Problem

Lesson C1 solved "find this exact product, fast" with a hash map:
`ProductIndex::find` hashes the *whole* key, mods it into a bucket
index, and walks that one bucket's short chain. That only works because
the entire key is known up front. Autocomplete doesn't have that luxury
— someone has typed `"Ch"` so far, not `"Cheese"`. Hashing `"Ch"` produces
some bucket number, but that number has no relationship at all to the
bucket `"Cheese"` or `"Cherry"` actually landed in — a hash function is
deliberately designed to scatter similar inputs unpredictably, which is
exactly right for exact-match lookup and exactly wrong for "these
strings start the same way." What's needed is a structure where typing
one more letter is a small, local move — not a jump to a completely
different, unrelated location.

### Project Change

- **Reference Source** — `verification/B5/step_tagged_products.cpp`
  lines 5–43, quoted verbatim below (`CatalogItem`, `TagPool`,
  `Product`): reused unmodified, the same reuse Lesson C1 already
  established for this catalog domain. For the new `TrieNode` struct
  itself: **no reference counterpart — this is a from-scratch addition
  because no earlier lesson in this curriculum has built a trie; it's
  Track C's second data structure, genuinely different in kind from
  Lesson C1's bucket array (the same "genuinely different in kind"
  exception Track B used twice, and Track C's own handoff already
  predicted for this exact lesson).**
- **Files affected** — `catalog_autocomplete.cpp` — new file.
- **Change type** — add.
- **Location** — n/a; a brand-new file has nothing to locate a
  position within yet.
- **Dependencies** — `<iostream>`, `<string>`, `<vector>` (standard
  headers only). No earlier lesson's code is `#include`d — `Product`,
  `CatalogItem`, and `TagPool` are copied in verbatim, the same way
  every earlier project file in this curriculum has assembled its own
  domain classes.

### The New Code

```cpp
struct TrieNode {
    TrieNode* children[128] = {};
    bool isEnd = false;
};
```

### The Updated Project

```cpp
#include <iostream>
#include <string>
#include <vector>

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

struct TrieNode {                                    // ← new
    TrieNode* children[128] = {};                     // ← new
    bool isEnd = false;                               // ← new
};                                                     // ← new

int main() {
    TrieNode* root = new TrieNode();
    std::cout << "root->isEnd = " << root->isEnd << std::endl;
    std::cout << "root->children['A'] is " << (root->children[static_cast<unsigned char>('A')] != nullptr ? "set" : "nullptr") << std::endl;
    std::cout << "root->children['Z'] is " << (root->children[static_cast<unsigned char>('Z')] != nullptr ? "set" : "nullptr") << std::endl;
    return 0;
}
```

`catalog_autocomplete.cpp` now has the full B5 catalog domain sitting
next to a new, empty `TrieNode` shape, with a `main()` that builds
exactly one node and proves its defaults come out right before anything
gets inserted into it. `main()`'s three constructs beyond bare I/O are
all reappearing: `new TrieNode()` heap-allocates one node the same way
every tree node in Lesson B1 onward has been allocated; `root->isEnd`
and `root->children[...]` reach through the pointer with `->`, the
member-access operator for pointers (as opposed to `.` for a value you
already hold directly); `static_cast<unsigned char>('A')` converts the
character literal `'A'` the same defensive way Lesson C1's `djb2`
converted every character before using it numerically — here, before
it's ever used as an array index rather than folded into a running
hash; and the **ternary conditional operator** (`cond ? "set" :
"nullptr"`) picks which string to print based on the `!= nullptr`
comparison, as a single expression sitting inside the `std::cout`
chain rather than a separate `if`/`else` block written above it.

### Introduce the Concept in Isolation

`TrieNode` above is the smallest possible piece of a trie — a node with
somewhere to go next (`children`) and a way to say "a word actually
ends here" (`isEnd`). Before trusting that shape to hold real product
labels, build a tiny path by hand, with no `insert()` method at all,
and prove the shape does what it claims:

```cpp
#include <iostream>

struct TrieNode {
    TrieNode* children[128] = {};
    bool isEnd = false;
};

int main() {
    // Build the path for "to" by hand: root -> 't' -> 'o', no insert() yet.
    TrieNode* root = new TrieNode();
    root->children[static_cast<unsigned char>('t')] = new TrieNode();
    TrieNode* afterT = root->children[static_cast<unsigned char>('t')];
    afterT->children[static_cast<unsigned char>('o')] = new TrieNode();
    TrieNode* afterTo = afterT->children[static_cast<unsigned char>('o')];
    afterTo->isEnd = true;

    std::cout << "root->children['t'] is "
              << (root->children[static_cast<unsigned char>('t')] != nullptr ? "set" : "nullptr")
              << std::endl;
    std::cout << "root->children['t']->children['o'] is "
              << (afterT->children[static_cast<unsigned char>('o')] != nullptr ? "set" : "nullptr")
              << std::endl;
    std::cout << "root->children['t']->children['o']->isEnd = " << afterTo->isEnd << std::endl;

    std::cout << "\nWalking a path that was never built:" << std::endl;
    std::cout << "root->children['x'] is "
              << (root->children[static_cast<unsigned char>('x')] != nullptr ? "set" : "nullptr")
              << std::endl;

    std::cout << "\nWalking a path that exists structurally but was never marked complete:" << std::endl;
    std::cout << "root->children['t']->isEnd = " << afterT->isEnd
              << " (the path to 't' exists, but \"t\" alone was never inserted as a word)" << std::endl;

    return 0;
}
```

Compiled and run, for real, this session:

```
$ clang++ -std=c++17 -Wall -Wextra lab1_trie_node.cpp -o lab1_trie_node && ./lab1_trie_node
root->children['t'] is set
root->children['t']->children['o'] is set
root->children['t']->children['o']->isEnd = 1

Walking a path that was never built:
root->children['x'] is nullptr

Walking a path that exists structurally but was never marked complete:
root->children['t']->isEnd = 0 (the path to 't' exists, but "t" alone was never inserted as a word)
```

This is exactly what the real `TrieNode` above is doing, isolated: two
hand-wired nodes prove that walking `children['t']` then
`children['o']` really does land on the node that was marked
`isEnd = true` — the path *is* the word "to," letter by letter, no
hashing anywhere in it. The unbuilt path (`children['x']`) comes back
`nullptr`, proving "no child here" is a real, checkable state, not a
crash or garbage. And the `'t'`-only node's own `isEnd` staying `false`
proves the two ideas are genuinely separate: a path can *exist*
(something was built through it) without that exact point being a
complete word on its own — a distinction the next Concept Unit's
`insert` depends on completely. This structure — a tree where each edge
is one character, and the walked path spells the prefix so far — is
called a **trie**.

### Discard the Throwaway Lab

`lab1_trie_node.cpp` is deleted now. It never appears in the project
again — the real `TrieNode` in `catalog_autocomplete.cpp` is what
`insert` and `autocomplete` build on from here.

### Mechanical Walkthrough

Enumerating every distinct syntactic element of the New Code block, in
order:

- **`struct TrieNode { ... };`** — declares a new **struct**: a
  class-like type whose members default to `public` (unlike `class`,
  which defaults to `private`). `TrieNode` has no invariant to protect
  — no method that must keep two fields in a consistent relationship —
  so there's nothing `private` would be guarding; `struct` says exactly
  that, plainly, to any reader.
- **`TrieNode* children[128]`** — declares a **fixed-size array** of
  128 **pointers**. Each element can hold the address of another
  `TrieNode` (a child one character further down some path) or nothing
  at all. 128 is not arbitrary — it's chosen to cover every standard
  ASCII **character code** (0–127), so *any* character this project's
  labels could contain has its own dedicated slot, addressable
  directly, with no hash function involved at all.
- **`= {}`** — a **default member initializer** on the array. Every
  `TrieNode` that's ever constructed gets this array value-initialized
  automatically, which for an array of pointers means every one of the
  128 slots starts as `nullptr` — "no child here yet" is the
  guaranteed starting state of a brand-new node, not something every
  future piece of code has to remember to set up correctly by hand.
- **`bool isEnd = false;`** — a second **default member initializer**,
  this time on a plain `bool`. Every new `TrieNode` starts as "not a
  complete word" until something explicitly says otherwise — the same
  guarantee the array's `= {}` gives, applied to a single flag instead
  of 128 pointers.

### CS Lens

A **trie** — sometimes called a prefix tree — is itself a recognizable,
recurring idea, not a one-off invention for this catalog. Also
recognized in: IP routing tables (a router picks the most specific
matching network by walking a trie of address bits — "longest-prefix
match"), phone keypads' predictive text, spell-checkers and dictionary
lookups, and DNS's own domain hierarchy (`com.` → `example.com.` →
`www.example.com.`, each label one more step down a shared path, the
exact same "path is the key" idea this lesson's `TrieNode` embodies).

### SE Lens

The design principle here is a direct space/time tradeoff, traded in
the opposite direction from Lesson C1's hash map. The alternative not
chosen: give each `TrieNode` a `std::map<char, TrieNode*>` instead of a
fixed 128-slot array. A `std::map` only pays for the children that
actually exist — cheap when most nodes only ever have one or two
children, which is realistic for real word lists — but every lookup
inside it costs a comparison-based search, because `std::map` itself
*is* a self-balancing tree internally (Lesson C5's own subject, two
lessons away), not a single direct index. The fixed array chosen here
trades that away: one direct index, no comparisons, at the cost of
allocating all 128 pointers whether they're used or not. Honestly
stated: this project is currently carrying that cost for real — 128
pointers (1024 bytes on a 64-bit machine) in *every* `TrieNode`, even
though the 7-product catalog this lesson builds only ever uses a
handful of letters per node. For a small, hand-built demonstration
catalog that's a fine trade; it's exactly why production tries commonly
move to a map-based or compressed ("radix"/"Patricia") representation
once the alphabet or dataset actually grows.

### Commands Needed

```
clang++ -std=c++17 -Wall -Wextra step1_trie_node_only.cpp -o step1_trie_node_only && ./step1_trie_node_only
```

`clang++` is this machine's C++ compiler (Apple clang 17, arm64 darwin —
`g++` resolves to the same toolchain). `-std=c++17` selects the C++17
language standard. `-Wall -Wextra` turns on the compiler's standard and
extra warning sets, so a real mistake (an uninitialized variable, a
signed/unsigned comparison) surfaces as a warning instead of silently
compiling. `-o step1_trie_node_only` names the output binary; `&&
./step1_trie_node_only` runs it immediately, only if the build actually
succeeded.

### Run It

```
$ clang++ -std=c++17 -Wall -Wextra step1_trie_node_only.cpp -o step1_trie_node_only && ./step1_trie_node_only
root->isEnd = 0
root->children['A'] is nullptr
root->children['Z'] is nullptr
```

No warnings from `-Wall -Wextra`, and the defaults are exactly what the
default member initializers promised: a freshly built `TrieNode` starts
with `isEnd` false and every child slot empty. This is `TrieNode` alone
— nothing populates it yet, which is exactly what the next Concept Unit
adds.

### The Connection

The Problem asked for a structure where a partial string is a real,
walkable location instead of a hash-scattered dead end; `TrieNode` is
that location's shape. The next Concept Unit gives it a way to actually
grow — `insert`, walking a real label character by character and
building exactly the path `lab1_trie_node.cpp` just proved works.

---

## Concept Unit: Insert — Walking And Creating As You Go

### The Problem

`TrieNode` is a shape with nothing in it. Nothing yet turns a product's
label, like `"Pea"`, into an actual chain of connected nodes — that
needs to walk the string one character at a time, and at each step,
either follow an existing child (if some earlier label already went
this way) or create a brand-new one (if this is the first label ever to
reach this exact point), then mark whatever node the walk ends on as a
real, complete word.

### Project Change

- **Reference Source** — no reference counterpart for `insert`'s
  trie-walking logic; this is a from-scratch addition, the first trie
  `insert` in the curriculum. (`Product`, `CatalogItem`, and `TagPool`
  remain the same `verification/B5/step_tagged_products.cpp` lines
  5–43 already present in the file from the previous Concept Unit —
  not re-added here.)
- **Files affected** — `catalog_autocomplete.cpp` — modified.
- **Change type** — add: a new `Product* product` member on the
  already-existing `TrieNode` struct, and a new `ProductTrie` class.
- **Location** — inside `TrieNode`'s member list, directly after
  `isEnd`; and a new `ProductTrie` class placed directly below
  `TrieNode`.
- **Dependencies** — the `TrieNode` struct from the previous Concept
  Unit; `Product`, already present, from Lesson B5.

### The New Code

```cpp
void insert(const std::string& label, Product* product) {
    TrieNode* current = root;
    for (char c : label) {
        unsigned char index = static_cast<unsigned char>(c);
        if (current->children[index] == nullptr) {
            current->children[index] = new TrieNode();
        }
        current = current->children[index];
    }
    current->isEnd = true;
    current->product = product;
}
```

### The Updated Project

```cpp
#include <iostream>
#include <string>
#include <vector>

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

struct TrieNode {
    TrieNode* children[128] = {};
    bool isEnd = false;
    Product* product = nullptr;                       // ← new
};

class ProductTrie {                                    // ← new
public:                                                 // ← new
    ProductTrie() : root(new TrieNode()) {}             // ← new

    void insert(const std::string& label, Product* product) {  // ← new
        TrieNode* current = root;                       // ← new
        for (char c : label) {                          // ← new
            unsigned char index = static_cast<unsigned char>(c);  // ← new
            if (current->children[index] == nullptr) {  // ← new
                current->children[index] = new TrieNode();  // ← new
            }                                            // ← new
            current = current->children[index];          // ← new
        }                                                // ← new
        current->isEnd = true;                           // ← new
        current->product = product;                      // ← new
    }                                                     // ← new

    TrieNode* root;                                       // ← new
};                                                         // ← new

int main() {
    TagPool tags;
    const std::string* perishable = tags.intern("perishable");
    const std::string* imported = tags.intern("imported");

    Product* apple = new Product("Apple", 12, perishable);
    Product* banana = new Product("Banana", 7, perishable);
    Product* cheese = new Product("Cheese", 3, imported);
    Product* bread = new Product("Bread", 9, imported);
    Product* cherry = new Product("Cherry", 15, perishable);
    Product* pea = new Product("Pea", 30, perishable);
    Product* peach = new Product("Peach", 20, perishable);

    ProductTrie trie;
    trie.insert(apple->label, apple);
    trie.insert(banana->label, banana);
    trie.insert(cheese->label, cheese);
    trie.insert(bread->label, bread);
    trie.insert(cherry->label, cherry);
    trie.insert(pea->label, pea);
    trie.insert(peach->label, peach);

    TrieNode* afterP = trie.root->children[static_cast<unsigned char>('P')];
    TrieNode* afterPe = afterP->children[static_cast<unsigned char>('e')];
    TrieNode* afterPea = afterPe->children[static_cast<unsigned char>('a')];
    std::cout << "root->children['P']->children['e']->children['a']->isEnd = " << afterPea->isEnd
              << ", product = " << (afterPea->product != nullptr ? afterPea->product->label : "nullptr")
              << std::endl;

    TrieNode* afterPeac = afterPea->children[static_cast<unsigned char>('c')];
    TrieNode* afterPeach = afterPeac->children[static_cast<unsigned char>('h')];
    std::cout << "...->children['c']->children['h']->isEnd = " << afterPeach->isEnd
              << ", product = " << (afterPeach->product != nullptr ? afterPeach->product->label : "nullptr")
              << std::endl;

    std::cout << "\"Pea\" node's own isEnd = " << afterPea->isEnd
              << " even though it has a child leading to \"Peach\" -- both are real, complete words."
              << std::endl;

    return 0;
}
```

`catalog_autocomplete.cpp` now has a real, working `ProductTrie` — a
`root` node plus an `insert` method that can grow it. `TrieNode` grew by
one field, `product`, storing which real catalog entry a completed word
resolves to. `main()` builds the full seven-product catalog this
lesson uses from here on — the four from Lesson C1 (`Apple`, `Banana`,
`Cheese`, `Bread`) plus three new ones chosen specifically to exercise
this structure: `Cherry` shares a three-letter prefix with `Cheese`
before diverging, and `Pea` is a strict prefix of `Peach` — one
complete product label sitting exactly on the path to a second, longer
one. The manual pointer walk afterward reuses the same reappearing
constructs as the previous Concept Unit's demo (`->` through each
pointer, `static_cast<unsigned char>` before every index, the ternary
operator choosing what to print) to prove, on real data this time, the
exact fact the throwaway lab below is about to isolate: `"Pea"`'s own
node has `isEnd = true` *and* a live child continuing on to `"Peach"` —
both true at once, neither canceling the other out.

### Introduce the Concept in Isolation

This is exactly what `insert`'s `if (current->children[index] ==
nullptr)` check is doing above, isolated with a generic payload instead
of a `Product*`, and printed at every step instead of only at the end:

```cpp
#include <iostream>
#include <string>

struct TrieNode {
    TrieNode* children[128] = {};
    bool isEnd = false;
    int value = 0;
};

void insertWord(TrieNode* root, const std::string& word, int value) {
    TrieNode* current = root;
    for (char c : word) {
        unsigned char index = static_cast<unsigned char>(c);
        if (current->children[index] == nullptr) {
            std::cout << "  no child for '" << c << "' yet -> creating a new TrieNode" << std::endl;
            current->children[index] = new TrieNode();
        } else {
            std::cout << "  child for '" << c << "' already exists -> reusing it" << std::endl;
        }
        current = current->children[index];
    }
    current->isEnd = true;
    current->value = value;
}

int main() {
    TrieNode* root = new TrieNode();

    std::cout << "insertWord(\"to\", 1):" << std::endl;
    insertWord(root, "to", 1);

    std::cout << "\ninsertWord(\"ten\", 2):" << std::endl;
    insertWord(root, "ten", 2);

    std::cout << "\ninsertWord(\"tea\", 3):" << std::endl;
    insertWord(root, "tea", 3);

    TrieNode* afterT = root->children[static_cast<unsigned char>('t')];
    TrieNode* afterTo = afterT->children[static_cast<unsigned char>('o')];
    std::cout << "\nroot->children['t']->children['o']->isEnd = " << afterTo->isEnd
              << ", value = " << afterTo->value << std::endl;

    TrieNode* afterTe = afterT->children[static_cast<unsigned char>('e')];
    std::cout << "root->children['t']->children['e']->isEnd = " << afterTe->isEnd
              << " (\"te\" was never inserted on its own)" << std::endl;

    return 0;
}
```

Compiled and run, for real, this session:

```
$ clang++ -std=c++17 -Wall -Wextra lab2_insert.cpp -o lab2_insert && ./lab2_insert
insertWord("to", 1):
  no child for 't' yet -> creating a new TrieNode
  no child for 'o' yet -> creating a new TrieNode

insertWord("ten", 2):
  child for 't' already exists -> reusing it
  no child for 'e' yet -> creating a new TrieNode
  no child for 'n' yet -> creating a new TrieNode

insertWord("tea", 3):
  child for 't' already exists -> reusing it
  child for 'e' already exists -> reusing it
  no child for 'a' yet -> creating a new TrieNode

root->children['t']->children['o']->isEnd = 1, value = 1
root->children['t']->children['e']->isEnd = 0 ("te" was never inserted on its own)
```

The printed trace proves `insert`'s central claim directly: the second
and third calls both report `'t'` "already exists," never creating a
second root-level node for it — `"to"`, `"ten"`, and `"tea"` really do
share one `'t'` node, exactly the branching structure the first Concept
Unit's lab built by hand. And just as before, the intermediate `"te"`
node's `isEnd` stays `false` — its path exists (built while inserting
`"ten"`), but `"te"` itself was never `insert`-ed as its own word. This
walk-and-create-if-missing algorithm is what makes `insert` a **trie**
insertion, not just a generic tree insertion: the *position* a new node
gets created at is dictated entirely by the string's own characters,
one array index per letter, never by comparing keys against each other
the way a binary search tree would.

### Discard the Throwaway Lab

`lab2_insert.cpp` is deleted now. It never appears in the project
again — the real `ProductTrie::insert` above, working on the seven-
product catalog, is what the final Concept Unit builds on.

### Mechanical Walkthrough

Enumerating every distinct syntactic element of the New Code block, in
order:

- **`void insert(const std::string& label, Product* product) {`** —
  declares `insert` as a method taking two parameters. `const
  std::string& label` is a **reference parameter**: `label` refers
  directly to the caller's own string, not a copy of it — reading it
  character by character never needs to copy the whole string first.
  `Product* product` is an ordinary **pointer** parameter — `insert`
  never owns the `Product` it's given, only remembers where it lives.
- **`TrieNode* current = root;`** — a local **pointer** variable,
  `current`, starts out pointing at the same node `root` does. This is
  the walk's starting position — the loop below moves `current`
  forward one node at a time without ever touching `root` itself,
  which always has to still mean "the very beginning of every path."
- **`for (char c : label)`** — a **range-based for loop**, reappearing
  from earlier lessons' string and tree walks: visits every character
  of `label`, in order, one at a time, with no manually tracked index.
- **`unsigned char index = static_cast<unsigned char>(c);`** — the same
  **static_cast**-through-**unsigned char** conversion the first
  Concept Unit's demo code used, given its own name here, `index`,
  because this specific value is about to be used as an actual array
  position — converting once per character, right before it's needed,
  rather than trusting `c`'s own (possibly signed) value directly.
- **`if (current->children[index] == nullptr)`** — reads the child
  pointer at this character's position and compares it against
  **nullptr**. This is the exact check the isolated lab just proved:
  "has any earlier label already gone this way?"
- **`current->children[index] = new TrieNode();`** — only runs when the
  check above is true. `new TrieNode()` allocates a brand-new node on
  the heap and stores its address directly into the parent's own
  `children` array — this is the one place, in this entire method,
  where a `TrieNode` actually gets created; every other character in
  every other label either finds this same slot already filled by an
  earlier `insert` call, or fills it once, the first time.
- **`current = current->children[index];`** — advances the walk:
  `current` now points at the child just found or just created,
  whichever happened. This runs on *every* iteration, whether the `if`
  branch above ran or not — the walk always moves one node deeper,
  regardless of whether that node is old or new.
- **`current->isEnd = true;`** — after the loop finishes (every
  character of `label` has been walked), the node the walk ends on is
  marked complete. This is the one line in `insert` that turns "a path
  that exists" into "a real word," the same distinction the first
  Concept Unit's lab proved by hand.
- **`current->product = product;`** — stores the caller's `Product*` on
  that same final node, so a later lookup landing here has something
  real to return, not just a flag saying "yes, something ends here."

### CS Lens

This is **lazy, on-demand construction**: nothing about the trie's
shape is decided in advance — each `TrieNode` is only ever created the
first time some label's walk actually needs it, never before. Also
recognized in: `mkdir -p`, which creates only the missing segments of a
directory path, leaving any segment that already exists untouched;
copy-on-write memory pages, allocated only at the moment something
actually writes to them; Git's own tree objects, which are only created
for the paths that actually changed between two commits, not the whole
repository.

### SE Lens

The alternative not chosen: a separate `contains`-style check walking
the string once to find out how much of it already exists, followed by
a second pass that actually creates the missing nodes — two walks of
the same string instead of one. `insert` above does both jobs in a
single pass instead: the nullptr check and the "create it if missing"
step happen at the very moment each character is visited, because
there's no reason to know in advance whether a child exists — the
check itself is free, already sitting right there in the loop that has
to run regardless. The real cost this method is currently carrying,
honestly stated: `insert` is not idempotent-safe against being called
twice with the same label and two different `Product*` pointers — the
second call just silently overwrites `current->product` at the very
end, with no warning, exactly the same unguarded-overwrite gap
`ProductIndex::insert` had in Lesson C1.

### Commands Needed

```
clang++ -std=c++17 -Wall -Wextra step2_insert.cpp -o step2_insert && ./step2_insert
```

Same `clang++`/`-std=c++17`/`-Wall -Wextra`/`-o` flags as the previous
Concept Unit, compiling and immediately running this unit's own project
snapshot.

### Run It

```
$ clang++ -std=c++17 -Wall -Wextra step2_insert.cpp -o step2_insert && ./step2_insert
root->children['P']->children['e']->children['a']->isEnd = 1, product = Pea
...->children['c']->children['h']->isEnd = 1, product = Peach
"Pea" node's own isEnd = 1 even though it has a child leading to "Peach" -- both are real, complete words.
```

Real data now, not a hand-picked three-word demo: the full seven-
product catalog was inserted, and the manual walk down `"Pea"`'s own
path confirms both halves of `insert`'s contract at once — the node has
`isEnd = 1` (a real word ends exactly here) and, one level deeper, the
walk continues through `'c'` and `'h'` to a second complete word,
`"Peach"`. Nothing about the trie's structure treats these as
conflicting facts.

### The Connection

`insert` turned bare `TrieNode` shapes into a real, populated tree
holding all seven products. Nothing can read that tree back out yet,
though — the final Concept Unit adds the operation this whole lesson
exists for: given only a prefix, return everything stored below it.

---

## Concept Unit: Autocomplete — Prefix In, Every Match Out

### The Problem

The trie now holds every product, correctly shaped. But the actual
vehicle for this lesson was never "store the data differently" for its
own sake — it was "typing a few letters should suggest matches, and
exact-match lookup can't do that." Nothing built so far answers that.
What's needed: walk a typed prefix down to wherever it ends, and then —
because a hash map's `find` could never do this even in principle —
gather up *every* complete word still reachable underneath that point,
however many there are.

### Project Change

- **Reference Source** — no reference counterpart for
  `autocomplete`/`collect`; this is a from-scratch addition, the first
  prefix-collection algorithm in the curriculum.
- **Files affected** — `catalog_autocomplete.cpp` — modified.
- **Change type** — add: `autocomplete`, a new public method; `collect`,
  a new private helper.
- **Location** — inside `ProductTrie`, `autocomplete` added directly
  after `insert`; `collect` added under a new `private:` section,
  below `root`.
- **Dependencies** — `ProductTrie`, `TrieNode`, and `insert` from the
  previous Concept Unit.

### The New Code

```cpp
std::vector<Product*> autocomplete(const std::string& prefix) const {
    TrieNode* current = root;
    for (char c : prefix) {
        unsigned char index = static_cast<unsigned char>(c);
        if (current->children[index] == nullptr) {
            return {};
        }
        current = current->children[index];
    }
    std::vector<Product*> matches;
    collect(current, matches);
    return matches;
}

void collect(TrieNode* node, std::vector<Product*>& matches) const {
    if (node->isEnd) {
        matches.push_back(node->product);
    }
    for (int i = 0; i < 128; ++i) {
        if (node->children[i] != nullptr) {
            collect(node->children[i], matches);
        }
    }
}
```

### The Updated Project

```cpp
#include <iostream>
#include <string>
#include <vector>

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

struct TrieNode {
    TrieNode* children[128] = {};
    bool isEnd = false;
    Product* product = nullptr;
};

class ProductTrie {
public:
    ProductTrie() : root(new TrieNode()) {}

    void insert(const std::string& label, Product* product) {
        TrieNode* current = root;
        for (char c : label) {
            unsigned char index = static_cast<unsigned char>(c);
            if (current->children[index] == nullptr) {
                current->children[index] = new TrieNode();
            }
            current = current->children[index];
        }
        current->isEnd = true;
        current->product = product;
    }

    std::vector<Product*> autocomplete(const std::string& prefix) const {  // ← new
        TrieNode* current = root;                                          // ← new
        for (char c : prefix) {                                            // ← new
            unsigned char index = static_cast<unsigned char>(c);           // ← new
            if (current->children[index] == nullptr) {                     // ← new
                return {};                                                 // ← new
            }                                                              // ← new
            current = current->children[index];                           // ← new
        }                                                                  // ← new
        std::vector<Product*> matches;                                    // ← new
        collect(current, matches);                                        // ← new
        return matches;                                                   // ← new
    }                                                                      // ← new

private:                                                                   // ← new
    void collect(TrieNode* node, std::vector<Product*>& matches) const {   // ← new
        if (node->isEnd) {                                                 // ← new
            matches.push_back(node->product);                             // ← new
        }                                                                  // ← new
        for (int i = 0; i < 128; ++i) {                                    // ← new
            if (node->children[i] != nullptr) {                           // ← new
                collect(node->children[i], matches);                      // ← new
            }                                                              // ← new
        }                                                                  // ← new
    }                                                                      // ← new

    TrieNode* root;
};

void printMatches(const std::string& prefix, const std::vector<Product*>& matches) {
    std::cout << "autocomplete(\"" << prefix << "\") -> [";
    for (size_t i = 0; i < matches.size(); ++i) {
        std::cout << matches[i]->label;
        if (i + 1 < matches.size()) std::cout << ", ";
    }
    std::cout << "]" << std::endl;
}

int main() {
    TagPool tags;
    const std::string* perishable = tags.intern("perishable");
    const std::string* imported = tags.intern("imported");

    Product* apple = new Product("Apple", 12, perishable);
    Product* banana = new Product("Banana", 7, perishable);
    Product* cheese = new Product("Cheese", 3, imported);
    Product* bread = new Product("Bread", 9, imported);
    Product* cherry = new Product("Cherry", 15, perishable);
    Product* pea = new Product("Pea", 30, perishable);
    Product* peach = new Product("Peach", 20, perishable);

    ProductTrie trie;
    trie.insert(apple->label, apple);
    trie.insert(banana->label, banana);
    trie.insert(cheese->label, cheese);
    trie.insert(bread->label, bread);
    trie.insert(cherry->label, cherry);
    trie.insert(pea->label, pea);
    trie.insert(peach->label, peach);

    printMatches("Ch", trie.autocomplete("Ch"));
    printMatches("Che", trie.autocomplete("Che"));
    printMatches("Pea", trie.autocomplete("Pea"));
    printMatches("B", trie.autocomplete("B"));
    printMatches("Xyz", trie.autocomplete("Xyz"));

    return 0;
}
```

`ProductTrie` now has its complete public contract: `insert` to build
the tree, `autocomplete` to query it. `autocomplete` walks the prefix
exactly the way `insert` walks a full label, except it never creates —
a missing child means the prefix simply isn't in the catalog at all,
handled by returning an empty vector immediately. `collect` is new
too, as a `private` helper `autocomplete` alone calls, doing the actual
gathering once the prefix walk has landed somewhere real.
`printMatches`, in `main()`, is a small demonstration helper (not part
of `ProductTrie` itself) that turns a `std::vector<Product*>` back into
a readable line of labels — it reaches into the vector positionally
with `matches[i]`, `std::vector`'s **operator[]**, and reads `.size()`
to know when to stop and where to stop printing the `", "` separator,
the two `std::vector` members named in this lesson's own Header
alongside `push_back`.

### Introduce the Concept in Isolation

This is exactly what `collect` and `autocomplete` above are doing,
isolated with plain strings as the stored payload instead of
`Product*`, on a small set of words chosen specifically to have one
word sitting on the path to a longer one — same shape as "Pea" inside
"Peach," proven small first:

```cpp
#include <iostream>
#include <string>
#include <vector>

struct TrieNode {
    TrieNode* children[128] = {};
    bool isEnd = false;
    std::string word;
};

void insertWord(TrieNode* root, const std::string& word) {
    TrieNode* current = root;
    for (char c : word) {
        unsigned char index = static_cast<unsigned char>(c);
        if (current->children[index] == nullptr) {
            current->children[index] = new TrieNode();
        }
        current = current->children[index];
    }
    current->isEnd = true;
    current->word = word;
}

void collect(TrieNode* node, std::vector<std::string>& matches) {
    if (node->isEnd) {
        matches.push_back(node->word);
    }
    for (int i = 0; i < 128; ++i) {
        if (node->children[i] != nullptr) {
            collect(node->children[i], matches);
        }
    }
}

std::vector<std::string> autocomplete(TrieNode* root, const std::string& prefix) {
    TrieNode* current = root;
    for (char c : prefix) {
        unsigned char index = static_cast<unsigned char>(c);
        if (current->children[index] == nullptr) {
            return {};
        }
        current = current->children[index];
    }
    std::vector<std::string> matches;
    collect(current, matches);
    return matches;
}

void printMatches(const std::string& prefix, const std::vector<std::string>& matches) {
    std::cout << "autocomplete(\"" << prefix << "\") -> [";
    for (size_t i = 0; i < matches.size(); ++i) {
        std::cout << matches[i];
        if (i + 1 < matches.size()) std::cout << ", ";
    }
    std::cout << "]" << std::endl;
}

int main() {
    TrieNode* root = new TrieNode();
    insertWord(root, "in");
    insertWord(root, "inn");
    insertWord(root, "ink");

    printMatches("in", autocomplete(root, "in"));
    printMatches("inn", autocomplete(root, "inn"));
    printMatches("z", autocomplete(root, "z"));

    return 0;
}
```

Compiled and run, for real, this session:

```
$ clang++ -std=c++17 -Wall -Wextra lab3_autocomplete.cpp -o lab3_autocomplete && ./lab3_autocomplete
autocomplete("in") -> [in, ink, inn]
autocomplete("inn") -> [inn]
autocomplete("z") -> []
```

`"in"` was itself inserted as a complete word, and `"ink"`/`"inn"` both
continue past it — the same "Pea" inside "Peach" shape. `autocomplete("in")`
returns all three, proving `collect`'s `if (node->isEnd)` check finds
`"in"` at the very node where the walk stops recursing deeper on that
branch alone, without that check ever preventing the loop below it from
still continuing into `"ink"` and `"inn"`. `autocomplete("inn")` returns
only `"inn"` — walking a longer prefix lands on a smaller subtree with
fewer words left in it. `autocomplete("z")` returns nothing at all,
proving the early `return {}` in `autocomplete` fires the moment a
character in the prefix has no matching child, without ever calling
`collect`. This recursive, subtree-gathering walk — visit a node, act
on it if relevant, then call yourself on each child in turn — is a
**depth-first traversal**, the same **recursion** technique Lesson B1's
tree traversals used, this time walking up to 128 branches per node
instead of 2.

Here is exactly how that recursion actually unfolds for
`autocomplete("Ch")` against the real catalog:

1. `autocomplete` walks `'C'` then `'h'` and calls `collect(Ch-node,
   matches)` — the node reached after those two characters.
2. Inside `collect(Ch-node, matches)`: `Ch-node->isEnd` is `false`
   (`"Ch"` alone was never inserted as a product), so nothing is
   pushed yet.
3. The `for` loop scans `Ch-node->children[0..127]` in ascending
   index order. The first non-null slot it finds is index 101
   (`'e'`), so `collect(Che-node, matches)` runs *before* the loop
   ever reaches index 114 (`'r'`) — this is why `"Cheese"` ends up
   before `"Cherry"` in the result: not insertion order, but `'e'`
   sorting before `'r'` as the loop scans upward.
4. `collect(Che-node, matches)` finds `Che-node->isEnd` is also
   `false` (`"Che"` was never inserted either), finds one non-null
   child, and recurses again — this repeats one character at a time
   down `"Cheese"`'s own remaining letters until the node after its
   final `'e'` is reached.
5. At the node after `"Cheese"`'s last character, `isEnd` is `true`,
   so `matches.push_back(node->product)` runs — the base case that
   actually adds something to the results, pushing the `Cheese`
   product.
6. That call returns, unwinding back to `Che-node`'s own loop, which
   finds no other non-null children, so `collect(Che-node, ...)`
   itself returns with nothing left to do.
7. Back in `Ch-node`'s loop, the scan continues past index 101 and
   reaches index 114 (`'r'`), calling `collect(Chr-node, matches)`,
   which walks down `"Cherry"`'s remaining letters the same way steps
   4–6 did for `"Cheese"`, eventually pushing the `Cherry` product.
8. `Ch-node`'s loop finishes (no further non-null children after
   index 114), `collect(Ch-node, ...)` returns, and `autocomplete`
   hands back `matches = [Cheese, Cherry]` — exactly the real, verified
   order printed below.

### Discard the Throwaway Lab

`lab3_autocomplete.cpp` is deleted now. It never appears in the project
again — the real `ProductTrie::autocomplete`/`collect`, working on the
seven-product catalog, is this lesson's finished project state.

### Mechanical Walkthrough

Enumerating every distinct syntactic element of the New Code block, in
order:

- **`std::vector<Product*> autocomplete(const std::string& prefix)
  const {`** — declares `autocomplete` as a **const-qualified method**:
  the trailing `const` promises this call can never modify the
  `ProductTrie` it's called on — a lookup stays a lookup, never a
  hidden mutation. It takes `prefix` by **reference parameter**, the
  same reasoning as `insert`'s `label` parameter, and returns
  `std::vector<Product*>` by value — zero, one, or many matches, the
  exact shape a hash map's single-pointer-or-`nullptr` return in
  Lesson C1 can't express.
- **`TrieNode* current = root; for (char c : prefix) { ... }`** — the
  identical walk-forward shape `insert` used: a **pointer** starting at
  `root`, a **range-based for loop** over every character of `prefix`
  in order.
- **`unsigned char index = static_cast<unsigned char>(c);`** — the same
  conversion explained fully in the previous Concept Unit, reapplied
  here for the prefix's own characters.
- **`if (current->children[index] == nullptr) { return {}; }`** — the
  one place this walk differs from `insert`: on a missing child,
  `insert` would create one; `autocomplete` instead returns immediately
  with `{}`, an empty `std::vector<Product*>` built directly at the
  return statement — this is the concrete proof that a prefix genuinely
  not present in the catalog costs almost nothing to detect: the walk
  simply stops at whichever character broke it.
- **`current = current->children[index];`** — advances the walk one
  node deeper, identical to `insert`'s own advancing line.
- **`std::vector<Product*> matches; collect(current, matches); return
  matches;`** — once the whole prefix has been walked successfully,
  an empty results vector is created, handed to `collect` by
  **reference parameter** so `collect` can append directly into it
  (`std::vector`'s `push_back`, named in this lesson's own Header), and
  the now-filled vector is returned.
- **`void collect(TrieNode* node, std::vector<Product*>& matches)
  const {`** — `collect`'s own signature: a **pointer** to the subtree
  to search, a **reference parameter** to the shared results vector,
  and `const` for the same reason `autocomplete` has it — gathering
  results never modifies the tree being searched.
- **`if (node->isEnd) { matches.push_back(node->product); }`** — the
  base-case check: if this exact node represents a real, complete
  label, its product joins the results.
- **`for (int i = 0; i < 128; ++i) { if (node->children[i] !=
  nullptr) { collect(node->children[i], matches); } }`** — the
  recursive step: for every one of the 128 possible next characters,
  if that child actually exists, **recursion** calls `collect` on it —
  this is what turns "the node where the prefix ends" into "every
  complete word anywhere below that node," not just the one node
  itself.

### CS Lens

This same depth-first, "visit a node, then recurse into every child it
actually has" shape is recognized well beyond tries. Also recognized
in: recursive directory listing (`ls -R`, Python's `os.walk`, each
walking a filesystem's own tree exactly this way); a browser's
`querySelectorAll` gathering every matching descendant element under
one starting node; a garbage collector's mark phase, walking every
object reachable from a root to decide what's still alive; an XML or
JSON tree serializer, emitting every node under a given path in order.

### SE Lens

The alternative not chosen: keep one flat `std::vector<Product*>` of
every product, and on every `autocomplete` call, linear-scan it
checking whether each label starts with the given prefix. Simpler to
write, and for seven products the difference is unmeasurable — but it's
the same "pay per lookup instead of once" tradeoff Lesson C1 measured
for exact match: a flat scan costs time proportional to the *whole
catalog* on every single call (checking every product's label against
the prefix, one by one), while walking the trie costs time proportional
only to the prefix's own length plus however many matches actually
exist — the untouched rest of the catalog stops mattering at all once
it's a trie, exactly the same shape of win Lesson C1's hash map had
over a linear scan, now applied to prefix search instead of exact
match. The honest cost this project is currently carrying forward:
`autocomplete` builds and returns a brand-new `std::vector<Product*>`
on every call, with zero caching — a UI calling this once per keystroke
while someone typed `"Cheese"` letter by letter would re-walk and
re-collect largely overlapping subtrees five times in a row for no
reason. That's exactly the kind of gap a caching layer — bounded
memory, eviction, the whole idea Track D exists to teach — would close;
it isn't solved here, and closing it isn't this lesson's job.

### Commands Needed

```
clang++ -std=c++17 -Wall -Wextra step3_full_producttrie.cpp -o step3_full_producttrie && ./step3_full_producttrie
```

Same flags as both previous Concept Units, compiling and running this
lesson's finished project state.

### Run It

```
$ clang++ -std=c++17 -Wall -Wextra step3_full_producttrie.cpp -o step3_full_producttrie && ./step3_full_producttrie
autocomplete("Ch") -> [Cheese, Cherry]
autocomplete("Che") -> [Cheese, Cherry]
autocomplete("Pea") -> [Pea, Peach]
autocomplete("B") -> [Banana, Bread]
autocomplete("Xyz") -> []
```

Every one of this lesson's own claims, proven against the real,
seven-product catalog in one run: `"Ch"` and `"Che"` both return the
same two-product set (`Cheese`, `Cherry` — the prefix walk lands on
different nodes for each, but the same subtree of matches lies below
both); `"Pea"` returns *itself and* `"Peach"`, exactly the case the
naive "no children means it's a word" heuristic would get wrong;
`"B"` returns `Banana` and `Bread`, in the same ascending-character-code
order the execution trace above predicted; and `"Xyz"`, a prefix that
matches nothing in the catalog, returns an empty list rather than an
error or a crash.

### The Connection

Everything the Problem asked for is now real: a typed prefix, however
short, resolves to every product that could still be meant by it — the
one thing Lesson C1's hash map, by its own exact-match design, could
never do.

---

## Closing

### Connect the Pieces

One concrete action, traced through every unit built in this lesson:
inserting `"Cherry"`, then autocompleting `"Che"`.

1. `trie.insert("Cherry", cherry)` walks `C` → `h` → `e` → `r` → `r` →
   `y`. The first three characters already exist as nodes — created
   earlier while inserting `"Cheese"` — so `insert`'s nullptr check
   (Concept Unit 2) finds them already there and reuses them. Only the
   final three characters (`r`, `r`, `y`) are genuinely new `TrieNode`s.
2. The node reached after `"Che"` now has two live children: `'e'`
   (continuing into `"Cheese"`) and `'r'` (continuing into `"Cherry"`) —
   this is `TrieNode`'s `children[128]` array (Concept Unit 1) doing
   exactly its job: one shared node, two branches, because both
   products agree on three letters and then diverge.
3. `trie.autocomplete("Che")` walks those same three characters down to
   that shared node, then calls `collect` (Concept Unit 3), which
   recurses into both branches in ascending character-code order,
   pushing `Cheese`'s product first and `Cherry`'s second.
4. The real, verified result: `autocomplete("Che") -> [Cheese, Cherry]`
   — one prefix walk, shared for as long as two labels actually agree,
   splitting only where they genuinely differ, answering with every
   match still reachable from that point. This is the Problem's own
   opening claim — "a trie is a tree where each path spells a prefix" —
   made concrete, end to end.

### What Breaks Without This

`collect`'s entire correctness depends on checking `node->isEnd`
specifically — not some cheaper-looking substitute. A common,
tempting-but-wrong shortcut: decide a node is "a complete word" if it
simply has *no children* (a leaf). Swap that in on purpose:

```cpp
bool hasNoChildren(TrieNode* node) const {
    for (int i = 0; i < 128; ++i) {
        if (node->children[i] != nullptr) return false;
    }
    return true;
}

void collect(TrieNode* node, std::vector<Product*>& matches) const {
    if (hasNoChildren(node)) {  // BROKEN: should be `if (node->isEnd)`
        matches.push_back(node->product);
    }
    for (int i = 0; i < 128; ++i) {
        if (node->children[i] != nullptr) {
            collect(node->children[i], matches);
        }
    }
}
```

Run it against just `"Pea"` and `"Peach"`, the exact case this whole
lesson chose those two products to expose:

```
$ clang++ -std=c++17 -Wall -Wextra break_no_isend.cpp -o break_no_isend && ./break_no_isend
Both "Pea" and "Peach" were inserted.

autocomplete("Pea") -> [Peach]
"Pea" itself is missing -- its node has a child ('c', continuing to "Peach"),
so hasNoChildren() says it isn't a complete word, even though it is one.
```

`"Pea"` was genuinely inserted — `insert` marked its node `isEnd =
true` and stored the `Pea` product on it, exactly as Concept Unit 2
proved. But `"Pea"`'s node also has a live child (`'c'`, continuing on
to `"Peach"`), so `hasNoChildren` returns `false` for it, and the
broken `collect` never pushes it. The bug isn't in `insert` at all —
`insert` did its job correctly. It's a wrong question asked at read
time: "does this node have no children" is not the same fact as "was
this node ever marked as a complete word," and any catalog containing
one label that's a strict prefix of another (real and common — think
`"Pea"`/`"Peach"`, or `"Tea"`/`"Teal"`) makes the two facts diverge.
Restoring the real check — `if (node->isEnd)`, exactly as written in
`ProductTrie::collect` above — fixes it; `step3_full_producttrie.cpp`'s
own already-verified run, `autocomplete("Pea") -> [Pea, Peach]`, is that
fix in place.

### Exercises

1. Add an eighth product, `"Chai"`, to the catalog and insert it. Before
   running anything, predict what `autocomplete("Ch")` will return now
   — then verify it for real.
2. Write a `bool contains(const std::string& label) const` method on
   `ProductTrie` answering a genuinely different question than
   `autocomplete`: is `label` an *exact*, complete match — not just a
   valid prefix of something longer? Walk to the node `label` leads to,
   the same way `autocomplete` does, but check the one thing
   `autocomplete` never has to: is `isEnd` actually `true` there, or
   does the path just happen to exist as someone else's prefix? This is
   deliberately the same question `ProductIndex::find` (Lesson C1)
   already answers, by a completely different route.
3. Add a counter to `ProductTrie` that counts how many `TrieNode`
   objects currently exist across the whole tree — increment it exactly
   once, inside `insert`'s own `if (current->children[index] ==
   nullptr)` branch, the only place a new node is ever actually
   created. Print it after inserting all seven products. How does that
   number compare to the sum of all seven labels' lengths, and why
   isn't it the same?

### Definition of Done

- [ ] `catalog_autocomplete.cpp` (as shown across all three Concept
      Units' Updated Project blocks) compiles cleanly with `clang++
      -std=c++17 -Wall -Wextra`, no warnings.
- [ ] `TrieNode`, `ProductTrie::insert`, and
      `ProductTrie::autocomplete`/`collect` all run against the full
      seven-product catalog, producing the real, verified output shown
      in this lesson.
- [ ] `break_no_isend`'s failure was actually reproduced, actually
      understood, and actually restored back to the real, `isEnd`-based
      `collect`.
- [ ] Commit, with a message stating *why*:

  ```
  git commit -m "Add ProductTrie for prefix autocomplete

  ProductIndex's hash lookup needs a complete key and returns at most
  one match; this needs only a typed-so-far prefix and returns every
  product still reachable from it, which a hash map's design can't do."
  ```
