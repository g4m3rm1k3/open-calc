# Lesson 32: A Tree Whose Hash Knows What Changed
### (Project 11 — Mini Git, C++)

**What you will build.** A real hash function, a content-addressable
`BlobStore` that deduplicates identical content automatically, and a
`TreeNode` structure whose hash is computed *from its children's
hashes* — a real Merkle tree, the exact structure underlying every
commit any real Git repository has ever made. The transferable problem
this lesson is actually about: identifying data by *what it contains*
rather than *where it's stored or what it's named*, and detecting
change in a large, nested structure without re-examining every piece of
it from scratch.

**What you need to know first.** Project 9, Lesson 26 — recursive tree
structures and recursive traversal, directly reused here for a tree
whose recursion computes a hash instead of a height. Project 10,
Lesson 29 — `unordered_map`-shaped lookup, reused here for
content-addressable storage.

---

## Concept Unit: A Real Hash Function

### The Problem

Every file this project will ever track needs a short, fixed-size,
deterministic identifier derived entirely from its *content* — the
same content should always produce the same identifier, and different
content should, with overwhelming likelihood, produce a different one.

### Project Change

- **Reference Source** — No reference counterpart; from-scratch.
- **Files affected** — created `hash_lab.cpp` (throwaway, this unit
  only).
- **Change type** — add.
- **Location** — new file, new project directory.
- **Dependencies** — `<cstdint>`, for fixed-width integer types.

### The New Code

```cpp
#include <cstdint>

uint64_t fnv1a(const std::string& data) {
    uint64_t hash = 14695981039346656037ULL;  // FNV offset basis
    for (unsigned char c : data) {
        hash ^= c;
        hash *= 1099511628211ULL;  // FNV prime
    }
    return hash;
}
```

### The Updated Project

Brand-new throwaway file, shown whole above.

### Introduce the concept in isolation

```cpp
std::string a = "Hello, world!";
std::string b = "Hello, world!";
std::string c = "Hello, world?";

std::cout << "a == b content, same hash? " << (fnv1a(a) == fnv1a(b)) << std::endl;
std::cout << "a vs c (one char different), same hash? " << (fnv1a(a) == fnv1a(c)) << std::endl;
```

Real output:

```
hash(a) = 4094109891673226228
hash(b) = 4094109891673226228
hash(c) = 4094081304370892742
a == b content, same hash? 1
a vs c (one char different), same hash? 0
```

Two identical strings produce the identical hash — proven, not
assumed. Two strings differing by exactly one character (`!` versus
`?`) produce completely different-looking numbers. This is called
**FNV-1a** (Fowler–Noll–Vo), a real, genuinely used non-cryptographic
hash algorithm: `uint64_t hash = 14695981039346656037ULL;` — **(a)
first appearance** of the `ULL` suffix, marking this literal as an
`unsigned long long`, required because the value itself exceeds what a
plain `int` can hold — sets a fixed starting value, and the loop mixes
each byte of input into it through XOR (`^=`) and multiplication,
producing output that changes unpredictably with even a tiny input
change.

### Discard the throwaway example

`hash_lab.cpp`'s demonstration is deleted — `fnv1a` itself carries
forward directly into this project's real storage.

### Mechanical walkthrough

- `uint64_t` — **(a) first appearance.** An unsigned, exactly-64-bit
  integer type — "exactly," not "at least," unlike plain `int`, whose
  size can genuinely vary between platforms; a hash function needs a
  fixed, predictable width to produce consistent, comparable output
  everywhere.
- `for (unsigned char c : data)` — **(a) first appearance,**
  conceptually: iterating over a `std::string` byte by byte, each one
  read as an `unsigned char` — a raw byte value, 0–255, not
  interpreted as a printable character at all for this purpose.
- `hash ^= c; hash *= 1099511628211ULL;` — **(a) first appearance** of
  the actual mixing step: XOR folds each new byte into the running
  hash, and multiplying by a specific, carefully chosen prime number
  (the "FNV prime") spreads that change across the entire 64-bit value
  — the combination of both operations, repeated once per byte, is what
  gives small input changes a large, unpredictable effect on the final
  result.

### CS lens

This is a **hash function**: a deterministic mapping from
arbitrary-length input to fixed-length output, with the property that
different inputs are extremely unlikely to produce the same output (a
**collision**). Also recognized in: Project 3, Lesson 9's own
`_by_id` index (using a hash internally, though never examining the
hash function itself), Python's and Java's own built-in `hash()`/
`.hashCode()`, real Git's own use of SHA-1 (historically) and SHA-256
(increasingly) for exactly this project's purpose — content
identification — at a much stronger security level than FNV-1a
provides.

### SE lens

FNV-1a is fast and simple, genuinely used in real, non-security-critical
software (fast lookup tables, checksums) — and genuinely *not*
cryptographically secure: it's computationally feasible to construct
two different inputs that collide on purpose, which is precisely why
Git uses SHA-1/SHA-256 instead for content that needs real tamper-evidence,
not just accidental-collision resistance. This project uses FNV-1a
deliberately for the same reason Project 5, Lesson 12 used a small,
readable regex-based Markdown parser instead of a production one: to
make the *mechanism* fully visible and understandable, with the real,
stronger tool named honestly as what a production system would
actually reach for.

### Commands needed

`g++ -std=c++17 -o <output> <file>.cpp`, same pattern as every lesson
in this phase.

### Run it

Shown above.

### Connecting sentence

Content can now be turned into a real, deterministic identifier — the
next unit uses that identifier as the *address* content is stored
under, not just a fingerprint to compare.

---

## Concept Unit: Content-Addressable Storage

### The Problem

A real version control system doesn't store files by name and path the
way every file system does — it stores content once, addressed by what
that content *is*, so identical content — even across different files,
different commits, different points in a project's history — is never
stored twice.

### Project Change

- **Reference Source** — No reference counterpart; from-scratch.
- **Files affected** — created `blob_store.cpp`.
- **Change type** — add.
- **Location** — new file.
- **Dependencies** — `fnv1a`, this lesson's previous unit;
  `<unordered_map>`.

### The New Code

```cpp
#include <unordered_map>

class BlobStore {
public:
    std::string store(const std::string& content) {
        std::string hash = toHex(fnv1a(content));
        if (blobs.find(hash) == blobs.end()) {
            blobs[hash] = content;
            std::cout << "Stored new blob " << hash.substr(0, 8) << "..." << std::endl;
        } else {
            std::cout << "Content already stored as " << hash.substr(0, 8) << "... (deduplicated)" << std::endl;
        }
        return hash;
    }

    std::string retrieve(const std::string& hash) {
        return blobs.at(hash);
    }

    size_t blobCount() const { return blobs.size(); }

private:
    std::unordered_map<std::string, std::string> blobs;
};
```

### The Updated Project

Brand-new file, shown whole above — alongside a small `toHex` helper
converting the raw `uint64_t` hash into a readable hexadecimal string,
the same textual form real Git commit hashes are always shown in.

### Mechanical walkthrough

- `std::unordered_map<std::string, std::string> blobs;` — **(b) hard
  concept reappearing**: a hash-based map, the same underlying
  structure as Project 3, Lesson 9's own index — here, the map's own
  key genuinely *is* a content hash, making the connection between
  "hash table" and "content-addressable storage" direct rather than
  incidental.
- `if (blobs.find(hash) == blobs.end())` — **(b) hard concept
  reappearing**: the standard "does this key exist" check, the C++
  idiom for `.has()`/`.count()` used across earlier phases.
- `blobs[hash] = content;` — **(b) hard concept reappearing**, ordinary
  map assignment — note the value being stored is the *original*
  content, and the *hash* is the key; retrieval always requires already
  knowing the hash, the defining property of content addressing.
- `std::string retrieve(const std::string& hash) { return blobs.at(hash); }`
  — **(a) first appearance** of `.at()` specifically: unlike `[]`
  indexing (which would silently create a new, empty entry for a
  missing key on a non-`const` map), `.at()` throws a real exception if
  the key doesn't exist — the correct choice here, since retrieving a
  hash that was never stored is a genuine error, not a case that should
  be silently tolerated.

### CS lens

This is **content-addressable storage**: data is located by a
deterministic function of its own contents, not by an arbitrary,
externally assigned name. Also recognized in: real Git's own object
database (every blob, tree, and commit is stored exactly this way, keyed
by its own SHA hash), IPFS and other content-addressed distributed
storage systems, a CDN caching identical assets across many
differently-named files.

### SE lens

Proven directly — the exact same content, stored twice:

```cpp
BlobStore store;
std::string hash1 = store.store(readme);
std::string hash2 = store.store(configFile);
std::string hash3 = store.store(readme);  // identical to the first
```

Real output:

```
Stored new blob 413d0c1e...
Stored new blob 873b0619...
Content already stored as 413d0c1e... (deduplicated)

hash1 == hash3? 1
Total unique blobs stored: 2
Retrieved by hash: # My Project
This is version 1.
```

Three `store` calls, only **two** unique blobs — the third, identical
call was recognized and deduplicated automatically, with no explicit
"is this a duplicate?" check written by the caller anywhere. This is
exactly why a real Git repository with a thousand commits, most of them
touching only one or two files, doesn't store a thousand near-identical
full copies of every unchanged file — every unchanged file's content
hashes identically to its previous version and is simply never stored
again.

### Commands needed

Same pattern.

### Run it

Shown above.

### Connecting sentence

Individual pieces of content are now stored once, addressed by their
own hash — the final unit builds the real structure that ties many
such pieces together into one project snapshot, and makes checking
"did anything change" fast without re-hashing everything.

---

## Concept Unit: The Merkle Tree

### The Problem

A real project isn't one blob — it's a nested structure of files and
directories. Detecting whether *anything* changed, anywhere in a deep,
nested project, by comparing every single file's content directly would
mean reading and hashing every file, every time — real, wasted work for
files that didn't change at all.

### Project Change

- **Reference Source** — No reference counterpart; from-scratch.
- **Files affected** — created `merkle_lab.cpp` (throwaway, this unit
  only).
- **Change type** — add.
- **Location** — new file.
- **Dependencies** — `fnv1a`, `toHex`, both from this lesson's earlier
  units.

### The New Code

```cpp
std::string hashA = toHex(fnv1a(fileA));
std::string hashB = toHex(fnv1a(fileB));
std::string hashC = toHex(fnv1a(fileC));
std::string hashD = toHex(fnv1a(fileD));

std::string leftPairHash = toHex(fnv1a(hashA + hashB));
std::string rightPairHash = toHex(fnv1a(hashC + hashD));
std::string rootHash = toHex(fnv1a(leftPairHash + rightPairHash));
```

### The Updated Project

Brand-new throwaway file, shown whole above.

### Introduce the concept in isolation

Real output:

```
Root hash: f18b9194af3a03ee
```

Each file's own content is hashed first; then *pairs of hashes* are
concatenated and hashed again, one level up; then the two resulting
hashes are concatenated and hashed once more, producing a single
**root hash** for the entire four-file structure. This is the defining
idea of a **Merkle tree**: every non-leaf node's hash is derived
entirely from its children's hashes, not from re-reading any original
content directly — meaning the root hash genuinely, mathematically
depends on every single leaf, transitively, through the chain of
concatenation and re-hashing.

### Discard the throwaway example

`merkle_lab.cpp`'s hand-written, fixed four-file version is deleted —
the core idea (a parent's hash comes from its children's hashes)
carries forward into a real, general, recursive structure next.

### Project Change (real code)

- **Reference Source** — No reference counterpart; from-scratch.
- **Files affected** — created `merkle_tree.cpp`.
- **Change type** — add.
- **Location** — new file.
- **Dependencies** — `fnv1a`, `toHex`; `<memory>` for `shared_ptr`.

### The New Code

```cpp
class TreeNode {
public:
    std::string name;
    std::string content;
    std::vector<std::shared_ptr<TreeNode>> children;

    static std::shared_ptr<TreeNode> makeFile(const std::string& name, const std::string& content) {
        auto node = std::make_shared<TreeNode>();
        node->name = name;
        node->content = content;
        return node;
    }

    static std::shared_ptr<TreeNode> makeDir(const std::string& name, std::vector<std::shared_ptr<TreeNode>> children) {
        auto node = std::make_shared<TreeNode>();
        node->name = name;
        node->children = children;
        return node;
    }

    std::string hash() const {
        if (children.empty()) {
            return toHex(fnv1a(content));
        }
        std::string combined;
        for (const auto& child : children) {
            combined += child->hash();
        }
        return toHex(fnv1a(combined));
    }
};
```

### The Updated Project

Brand-new file, shown whole above — a single `TreeNode` type
represents both files (leaves, with real `content`, no `children`) and
directories (internal nodes, with `children`, no `content` of their
own) — the same Composite-pattern shape Project 8, Lesson 22 used for
`Category`/`Product`, here computing a hash recursively instead of a
sum.

### Mechanical walkthrough

- `static std::shared_ptr<TreeNode> makeFile(...)` / `makeDir(...)` —
  **(b) hard concept reappearing**: static factory methods, the same
  Factory-pattern shape from Project 1, Lesson 4 and Project 7, Lesson
  15 — here providing two clearly named ways to build a `TreeNode`,
  rather than one constructor trying to cover both a file's and a
  directory's genuinely different shape.
- `std::string hash() const { if (children.empty()) { return toHex(fnv1a(content)); } ... }`
  — **(a) first appearance,** as the actual Merkle recursion: a leaf's
  hash is simply its content's hash — the base case; an internal
  node's hash is computed by recursively calling `hash()` on every
  child *first*, then hashing the concatenation of all those results —
  the exact same recurse-into-children-before-combining shape as
  Lesson 26's B-Tree height calculation and Lesson 8's
  `Category::GetTotalValue`, here producing a hash instead of a count
  or a sum.
- `std::string combined; for (const auto& child : children) { combined += child->hash(); }`
  — **(b) hard concept reappearing**: string concatenation building up
  one combined string from every child's own hash, in order — order
  matters here, deliberately: swapping two children's positions would
  produce a different combined string and therefore a different parent
  hash, correctly treating a reordering as a real change.

### CS lens

This is a real **Merkle tree** (also called a hash tree): named after
Ralph Merkle, and used, beyond version control, in blockchain systems
(verifying a transaction belongs to a block without needing every other
transaction), BitTorrent (verifying a downloaded file piece against a
known-good hash without needing the whole file first), and — the
project's own direct subject — real Git's own internal object model,
where every commit's tree object is built from exactly this recursive
hashing scheme.

### SE lens

Proven directly — modifying exactly one file, deep in a small nested
structure, and checking what actually changed:

```cpp
auto srcDir = TreeNode::makeDir("src", {fileA, fileB});
auto root = TreeNode::makeDir("project", {srcDir, fileC});

std::string originalRootHash = root->hash();
std::string originalCHash = fileC->hash();

fileB->content = "content of file B, MODIFIED";
```

Real output:

```
--- original tree ---
project: 073c8e220b...
  src: 19df59547e...
    a.txt: b4417ac042...
    b.txt: b4417dc042...
  c.txt: b4417cc042...

--- after modifying only b.txt ---
project: 657e9bc7c1...
  src: dc61e57be6...
    a.txt: b4417ac042...
    b.txt: b0b3208844...
  c.txt: b4417cc042...

Root hash changed? 1
c.txt hash changed (it was never touched)? 0
```

Exactly the nodes on the path from `b.txt` to the root — `b.txt`
itself, `src` (its parent), and `project` (the root) — changed hash.
`a.txt`, `b.txt`'s own sibling, and `c.txt`, an entirely separate
branch, both kept their *exact original* hashes, proven directly, not
assumed. This is the real, structural payoff: a system built on this
tree can compare two root hashes and instantly know "something changed
somewhere," and, by comparing level by level, find *exactly* which leaf
changed without ever re-reading or re-hashing content that provably
didn't.

One honest, unscripted detail worth naming rather than smoothing over:
`a.txt` and `c.txt`'s hashes — `b4417ac042...` and `b4417cc042...` —
look suspiciously similar at a glance, differing by only one visible
character near the start. That's a real, visible symptom of FNV-1a's
weaker mixing on short, highly similar inputs (`"content of file A"`
versus `"content of file C"`, differing by exactly one character, in a
similar position) — genuinely not a bug in this project's code, but a
real, honest illustration of exactly why real Git doesn't use a hash
this simple: a cryptographic hash like SHA-256 is specifically designed
so that even a one-character input difference produces an output with
no visible pattern connecting it to the original at all.

### Commands needed

Same pattern.

### Run it

Shown above.

### Connecting sentence

A whole nested project structure now has one root hash, provably
sensitive to any single change anywhere inside it, and provably
*insensitive* to parts that never changed — the exact property real
Git relies on to make `git status` and `git diff` fast even across
enormous repositories, and the structure this project's next lessons
will build real commits, snapshots, and diffs on top of.

---

## Closing

**Connect the pieces.** One file, through the whole lesson:
`fileB`'s content is hashed by `fnv1a` (this lesson's first unit) into a
real, deterministic identifier; that same identifier is what a
`BlobStore` (this lesson's second unit) would use to store or retrieve
its content without ever needing its name or path; and inside a real
project tree (this lesson's third unit), that same hash becomes one
leaf's contribution to its parent's hash, and that parent's hash
becomes one contribution to *its* parent's, all the way to the root —
one small piece of content, its influence traceable, precisely, all the
way up a nested structure, and *only* up that one specific path.

**What breaks without this.** Already shown, precisely, directly: the
proof that unrelated siblings (`a.txt`, `c.txt`) keep their exact
original hashes while the changed file and every one of its ancestors
change — deliberately not restaged, since the whole point was observing
it exactly where the tree was built.

**Exercises.**
1. Add a `find(path)` method to `TreeNode` that navigates down through
   `children` by name (e.g., `"src/b.txt"`) and returns the matching
   node, or `nullptr` if no such path exists.
2. Write a `diff(TreeNode& a, TreeNode& b)` function that compares two
   trees with the *same* structure and returns the names of every leaf
   whose hash differs — using each level's hash first to skip
   comparing any subtree whose hash already matches.
3. FNV-1a's visible similarity pattern was named honestly in this
   lesson's SE lens. Try hashing `"content of file A"` and `"content of
   file B"` with `std::hash<std::string>` (C++'s own built-in hash)
   instead, and compare whether the same visible pattern appears —
   report your finding either way.

**Definition of done.**
- [ ] `fnv1a` produces identical hashes for identical input and
      different hashes for near-identical input, confirmed against
      real output.
- [ ] `BlobStore` correctly deduplicates identical content, confirmed
      by a real blob count lower than the number of `store` calls made.
- [ ] `TreeNode::hash()` correctly changes at the root and every
      ancestor of a modified leaf, while leaving every untouched
      sibling's hash exactly unchanged, confirmed against real output.
- [ ] You can state, in one sentence, why a Merkle tree's root hash
      changing tells you *that* something changed, and why walking the
      tree level by level is what tells you *what*.
- [ ] Commit with a message explaining why — e.g. `"Store content by
      its own hash for automatic deduplication, and build a Merkle
      tree whose root hash is provably sensitive only to the specific
      files that actually changed"` — not `"add hashing and Merkle
      tree"`.

**Next lesson** stays in Project 11: real commits — snapshots of an
entire tree at a point in time, linked to their parent commit, forming
the actual commit graph real Git navigates with `git log`, and the
`Memento` pattern for restoring a project to any prior snapshot.
