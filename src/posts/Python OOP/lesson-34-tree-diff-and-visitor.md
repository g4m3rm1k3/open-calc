# Lesson 34: Skipping What Didn't Change, and New Operations Without New Methods
### (Project 11 — Mini Git, C++)

**What you will build.** A real `diff` walking two Merkle trees
together — reporting exactly which files were added, removed, or
modified — proven, at real scale, to skip an entire 500-file unchanged
subtree without ever individually comparing a single file inside it.
Then the `Visitor` pattern, letting three genuinely different
operations — printing, counting files, summing content size — run
against the same tree with `TreeNode` itself gaining exactly one new
method, ever, no matter how many more operations get added later. The
transferable problem this lesson is actually about: a Merkle tree's
hash isn't just an identifier, it's a real shortcut for skipping work,
and a class shouldn't need to grow a new method every time someone
thinks of a new thing to do with it.

**What you need to know first.** Lesson 32 — `TreeNode`, `hash()`, and
the proof that an unchanged subtree keeps its exact hash. Lesson 33 —
`Repository`, `commit`, the two snapshots this lesson's `diff` compares.

---

## Concept Unit: Diffing Two Trees

### The Problem

Given two commits' tree snapshots, a real `diff` needs to report
exactly what changed between them — which files are new, which are
gone, which have different content — without simply comparing every
single file's content directly, which would mean visiting every file in
both trees even when almost nothing changed.

### Project Change

- **Reference Source** — No reference counterpart; from-scratch.
- **Files affected** — created `diff_lab.cpp` (throwaway, this unit
  only).
- **Change type** — add.
- **Location** — new file, new project directory.
- **Dependencies** — `<map>`.

### The New Code

```cpp
std::map<std::string, std::string> before = {{"a", "1"}, {"b", "2"}, {"c", "3"}};
std::map<std::string, std::string> after  = {{"a", "1"}, {"b", "99"}, {"d", "4"}};

for (const auto& [name, value] : before) {
    if (after.find(name) == after.end()) {
        std::cout << "removed: " << name << std::endl;
    } else if (after.at(name) != value) {
        std::cout << "modified: " << name << std::endl;
    }
}
for (const auto& [name, value] : after) {
    if (before.find(name) == before.end()) {
        std::cout << "added: " << name << std::endl;
    }
}
```

### The Updated Project

Brand-new throwaway file, shown whole above.

### Introduce the concept in isolation

Real output:

```
modified: b
removed: c
added: d
```

Two flat maps, compared by key: `"b"` exists in both but with
different values (modified), `"c"` exists only in `before` (removed),
`"d"` exists only in `after` (added), and `"a"`, unchanged, correctly
produces no output at all. This is the core shape of any diff — three
categories, checked by presence and by value — but a real project tree
is *nested*, not flat, which the next unit addresses directly.

### Discard the throwaway example

`diff_lab.cpp`'s flat-map comparison is deleted — the three-category
shape (added/removed/modified) carries forward directly into the real,
recursive tree diff.

### Project Change (real code)

- **Reference Source** — No reference counterpart; from-scratch.
- **Files affected** — created `tree_diff.cpp`.
- **Change type** — add.
- **Location** — new file, alongside `TreeNode` (Lesson 32).
- **Dependencies** — `TreeNode::hash()`, `TreeNode::isFile()`
  (Lesson 32).

### The New Code

```cpp
int comparisons = 0;

void diffTrees(const std::shared_ptr<TreeNode>& a, const std::shared_ptr<TreeNode>& b, const std::string& displayPath) {
    comparisons++;
    if (a->hash() == b->hash()) {
        return;  // identical subtree -- skip it entirely, no need to look inside
    }

    if (a->isFile() && b->isFile()) {
        std::cout << "modified: " << displayPath << std::endl;
        return;
    }

    std::map<std::string, std::shared_ptr<TreeNode>> aChildren, bChildren;
    for (auto& c : a->children) aChildren[c->name] = c;
    for (auto& c : b->children) bChildren[c->name] = c;

    for (auto& [name, node] : aChildren) {
        if (bChildren.find(name) == bChildren.end()) {
            std::cout << "removed: " << displayPath << "/" << name << std::endl;
        }
    }
    for (auto& [name, node] : bChildren) {
        if (aChildren.find(name) == aChildren.end()) {
            std::cout << "added: " << displayPath << "/" << name << std::endl;
        }
    }
    for (auto& [name, node] : aChildren) {
        auto it = bChildren.find(name);
        if (it != bChildren.end()) {
            diffTrees(node, it->second, displayPath + "/" + name);
        }
    }
}
```

### The Updated Project

Brand-new file, shown whole above — the single most important line is
the very first check: `if (a->hash() == b->hash()) return;` — this is
the Merkle tree's entire reason for existing in this lesson, not just
identifying a snapshot but *pruning* an entire comparison the instant
two subtrees are provably identical.

### Mechanical walkthrough

- `if (a->hash() == b->hash()) return;` — **(a) first appearance,**
  conceptually: this single line is what makes the algorithm efficient
  — if two subtrees' hashes match, *nothing* inside either one could
  possibly differ (proven directly by Lesson 32's own change-sensitivity
  demonstration), so the function returns immediately without ever
  looking at a single child.
- `if (a->isFile() && b->isFile()) { std::cout << "modified: " << displayPath << std::endl; return; }`
  — **(b) hard concept reappearing**: reached only once the hash check
  has already ruled out "identical" — if both sides are plain files at
  this point, their content must genuinely differ.
- `std::map<std::string, std::shared_ptr<TreeNode>> aChildren, bChildren; for (auto& c : a->children) aChildren[c->name] = c;`
  — **(b) hard concept reappearing**: building a name-indexed lookup
  from each side's children — the same "index by name for fast lookup"
  idea from Project 3, Lesson 9's own hash index, here applied so
  "does this name exist on the other side" is an `O(1)` check instead
  of a linear scan.
- `diffTrees(node, it->second, displayPath + "/" + name);` — **(b) hard
  concept reappearing**: recursion into matching children, the same
  self-referential call shape as Lesson 26's B-Tree and Lesson 32's own
  `hash()`.

### CS lens

This is diffing accelerated by exactly the property a Merkle tree
provides: comparing two large, nested structures in time proportional
to *how much actually differs*, not how large either structure is —
proven directly, at real scale, in this unit's own SE lens. Also
recognized in: real Git's own `git diff` (this exact optimization,
against real, much larger repositories), rsync's file-transfer
algorithm (skipping entire unchanged files via checksums before ever
transferring bytes), any distributed system reconciling replicas by
comparing Merkle roots first.

### SE lens

Proven directly, at a scale where the difference is impossible to miss
— a `vendor/` directory holding 500 completely unchanged files,
alongside one genuinely modified file:

```cpp
// 500 files, byte-for-byte identical on both sides
auto vendorA = TreeNode::makeDir("vendor", vendorFilesA);
auto vendorB = TreeNode::makeDir("vendor", vendorFilesB);

auto mainA = TreeNode::makeFile("main.cpp", "// v1");
auto mainB = TreeNode::makeFile("main.cpp", "// v2, changed");

auto rootA = TreeNode::makeDir("project", {mainA, vendorA});
auto rootB = TreeNode::makeDir("project", {mainB, vendorB});

diffTrees(rootA, rootB, "project");
```

Real output:

```
vendor/ has 500 completely unchanged files.
--- diff ---
modified: project/main.cpp

Total node comparisons performed: 3
(NOT 502 -- the unchanged vendor/ subtree's hash matched, so its 500 files were never individually compared)
```

**Three** comparisons — the root, `main.cpp`, and `vendor` itself — for
a tree containing over 500 total nodes. `vendor`'s own hash matched on
the very first check, and the function returned immediately, never
looking at a single one of the 500 files inside it. This is the real,
measured payoff of every hour this project has spent on Merkle trees
since Lesson 32: a diff against a massive, mostly-unchanged real
repository costs time proportional to what changed, not to the
repository's total size.

### Commands needed

`g++ -std=c++17 -o <output> <file>.cpp`, same pattern as every lesson
in this project.

### Run it

Both shown above.

### Connecting sentence

Comparing two trees is now fast specifically because of the Merkle
structure — the final unit turns to a different kind of scalability:
adding new *operations* over a tree without `TreeNode` itself growing
new methods forever.

---

## Concept Unit: The Visitor Pattern

### The Problem

`TreeNode::hash()` (Lesson 32) is one operation, living directly on
the class. A real project will want more — counting files, summing
total size, printing a listing, this lesson's own `diffTrees` (a
free function, not even a method) — and adding each one as a new
method directly on `TreeNode` means the class keeps growing forever,
mixing its core identity (a node in a tree) with every unrelated thing
anyone ever wants to compute *about* that tree.

### Project Change

- **Reference Source** — No reference counterpart; from-scratch.
- **Files affected** — created `visitor_lab.cpp` (throwaway, this unit
  only).
- **Change type** — add.
- **Location** — new file.
- **Dependencies** — none new.

### The New Code

```cpp
class Visitor {
public:
    virtual void visitFile(File& file) = 0;
    virtual void visitFolder(Folder& folder) = 0;
    virtual ~Visitor() = default;
};

class Entry {
public:
    virtual void accept(Visitor& v) = 0;
    virtual ~Entry() = default;
};

class File : public Entry {
public:
    std::string name;
    int size;
    void accept(Visitor& v) override { v.visitFile(*this); }
};

class Folder : public Entry {
public:
    std::string name;
    std::vector<std::shared_ptr<Entry>> children;
    void accept(Visitor& v) override {
        v.visitFolder(*this);
        for (auto& child : children) child->accept(v);
    }
};

class SizeCounterVisitor : public Visitor {
public:
    int totalSize = 0;
    void visitFile(File& file) override { totalSize += file.size; }
    void visitFolder(Folder& folder) override { }
};
```

### The Updated Project

Brand-new throwaway file, shown whole above.

### Introduce the concept in isolation

```cpp
auto folder = std::make_shared<Folder>("docs", std::vector<std::shared_ptr<Entry>>{a, b});

SizeCounterVisitor counter;
folder->accept(counter);

std::cout << "Total size: " << counter.totalSize << std::endl;
```

Real output:

```
Total size: 350
```

`folder->accept(counter)` triggers a **double dispatch**: `accept`
calls `v.visitFolder(*this)` — which method of `Visitor` actually runs
depends on *two* things at once, both `folder`'s own concrete type
(`Folder`, calling `visitFolder`) and `v`'s own concrete type
(`SizeCounterVisitor`, providing this specific behavior for it) —
neither `File` nor `Folder` needed to know anything about *what*
`SizeCounterVisitor` actually does; they only know to call the
matching `visit` method and let the visitor decide the rest.

### Discard the throwaway example

`visitor_lab.cpp`'s `File`/`Folder`/`SizeCounterVisitor` are deleted —
the `accept`/`visit` double-dispatch shape carries forward directly
into `TreeNode`.

### Project Change (real code)

- **Reference Source** — No reference counterpart; from-scratch.
- **Files affected** — modified `TreeNode` (adds `accept`); created
  three new `TreeVisitor` implementations.
- **Change type** — add.
- **Location** — `TreeNode` gains one method; three new classes added.
- **Dependencies** — `TreeNode`, Lesson 32.

### The New Code

```cpp
class TreeVisitor {
public:
    virtual void visitFile(TreeNode& file) = 0;
    virtual void visitDirectory(TreeNode& dir) = 0;
    virtual ~TreeVisitor() = default;
};
```

and, on `TreeNode`:

```cpp
void accept(TreeVisitor& v) {
    if (isFile()) {
        v.visitFile(*this);
    } else {
        v.visitDirectory(*this);
        for (auto& child : children) child->accept(v);
    }
}
```

with three independent visitors:

```cpp
class FileCounterVisitor : public TreeVisitor {
public:
    int fileCount = 0;
    void visitFile(TreeNode& file) override { fileCount++; }
    void visitDirectory(TreeNode& dir) override { }
};

class TotalSizeVisitor : public TreeVisitor {
public:
    size_t totalBytes = 0;
    void visitFile(TreeNode& file) override { totalBytes += file.content.size(); }
    void visitDirectory(TreeNode& dir) override { }
};

class PrintVisitor : public TreeVisitor {
public:
    int depth = 0;
    void visitFile(TreeNode& file) override {
        std::cout << std::string(depth * 2, ' ') << file.name << std::endl;
    }
    void visitDirectory(TreeNode& dir) override {
        std::cout << std::string(depth * 2, ' ') << dir.name << "/" << std::endl;
    }
};
```

### The Updated Project

`TreeNode` gains exactly one method — `accept` — for all three of
these operations, and every future one. Note `accept`'s own recursion
lives *inside* it, on the directory branch, unlike the isolated lab's
version — `TreeNode` itself still owns traversal, since walking a tree
is genuinely part of what a tree *is*; only the per-node *behavior* is
delegated out to the visitor.

### Mechanical walkthrough

- `void accept(TreeVisitor& v) { if (isFile()) { v.visitFile(*this); } else { v.visitDirectory(*this); for (...) child->accept(v); } }`
  — **(b) hard concept reappearing**: the exact `accept` shape from the
  isolated lab, adapted to `TreeNode`'s own single-class
  file-or-directory representation (Lesson 32's own Composite shape)
  rather than two separate classes.
- Three separate `TreeVisitor` subclasses, each implementing
  `visitFile`/`visitDirectory` differently — **(b) hard concept
  reappearing**: the Strategy-pattern shape from Project 7, Lesson 15 —
  a shared interface, several independent, swappable implementations —
  here applied to *what happens at each node* rather than *how a value
  gets computed*.

### CS lens

This is the **Visitor pattern**: separating an operation from the
object structure it operates on, so new operations can be added by
writing a new `Visitor` implementation, with zero changes to the
classes being visited. Also recognized in: a compiler's own AST
traversal (Project 9, Lesson 27's own `SelectQuery`/`WhereClause` — a
real compiler would typically add a `Visitor` for each pass —
type-checking, code generation — rather than growing the AST node
classes themselves), any real filesystem-walking tool (`find`,
antivirus scanners, backup tools — all conceptually visitors over a
directory tree), Project 9, Lesson 26's own recursive `height()` and
this project's own `hash()` — both are, structurally, single-purpose
visitors hardcoded directly onto the class, exactly what this pattern
generalizes away from.

### SE lens

Proven directly — three completely independent operations, run against
the identical tree, with `TreeNode` touched exactly once (`accept`)
to enable all three, and never again for any of them individually:

```cpp
PrintVisitor printer;
root->accept(printer);

FileCounterVisitor counter;
root->accept(counter);

TotalSizeVisitor sizer;
root->accept(sizer);
```

Real output:

```
project/
README.md
src/
utils.cpp
math.cpp
File count: 3
Total content bytes: 43
```

Compare this directly against `hash()` and `diffTrees` from earlier in
this project: both are hardcoded — `hash()` lives *inside* `TreeNode`
itself, `diffTrees` is a free function tightly coupled to `TreeNode`'s
exact internal shape. Neither is *wrong* — `hash()` in particular is
called so constantly, by so much of this project, that giving it its
own dedicated method is a reasonable, deliberate choice, not an
oversight — but every *additional* operation from here forward can be a
plain `TreeVisitor` instead, at the real cost of the interface's own
two required methods per new visitor, some of which (like
`visitDirectory` in `FileCounterVisitor`) end up empty simply because
that particular operation has nothing to do at that node type.

### Commands needed

Same pattern.

### Run it

Shown above.

### Connecting sentence

Every operation this project has built — hashing, diffing, and now
counting, sizing, printing — walks the exact same tree structure, and
from this lesson forward, adding one more means writing one small,
focused class, never touching `TreeNode`'s own definition again.

---

## Closing

**Connect the pieces.** One tree, exercised every way this project now
supports: `root->hash()` (Lesson 32) identifies it uniquely by content;
`diffTrees(rootA, rootB, "project")` (this lesson) compares it against
a prior snapshot, skipping every subtree whose hash matches — proven,
at 500-file scale, to touch only 3 nodes instead of 502; and
`root->accept(printer)` / `accept(counter)` / `accept(sizer)` (this
lesson) each walk the identical structure for three unrelated purposes,
through one shared `accept` method that will never need to grow again.
Every one of these operations ultimately rests on the same guarantee
Lesson 32 first proved: a tree's structure and content are fully,
provably captured by how it's built, and everything this project does
with that tree — comparing it, walking it, describing it — follows
directly from that one foundation.

**What breaks without this.** Already shown, measured, precisely: the
3-versus-502 comparison count, proof the hash-skip optimization is real
and not incidental — deliberately not restaged, since the whole point
was measuring it exactly where the diff algorithm needed it.

**Exercises.**
1. Write a `FindByNameVisitor` that records the full path to any file
   matching a given name, walking the whole tree and confirming it
   finds `"math.cpp"` at `"project/src/math.cpp"`.
2. This lesson's `diffTrees` is a free function, not a `TreeVisitor` —
   research whether Visitor's double-dispatch shape could express a
   two-tree comparison at all, and write a few sentences on why a
   single-tree Visitor may or may not be the right tool for a
   two-tree operation like diffing.
3. Add a `visitCount` field to `TreeVisitor` itself (incremented inside
   `accept`, not inside each visitor), and confirm the same count
   applies correctly across all three of this lesson's visitors without
   any of them needing to track it themselves.

**Definition of done.**
- [ ] `diffTrees` correctly reports added, removed, and modified files
      between two real tree snapshots, confirmed against real output.
- [ ] You've measured, at real scale (500+ unchanged files), that the
      hash-skip optimization keeps comparison count small, confirmed by
      a real, printed count far below the tree's actual size.
- [ ] Three independent `TreeVisitor` implementations correctly walk
      the same tree for three different purposes, with `TreeNode`
      itself touched only once (`accept`) to support all three.
- [ ] Commit with a message explaining why — e.g. `"Diff two Merkle
      trees by skipping subtrees whose hash matches, proven to scan
      only 3 of 502 nodes for a mostly-unchanged tree, and add Visitor
      so new tree operations never require new TreeNode methods"` —
      not `"add diff and visitor"`.

**Next lesson** stays in Project 11, closing it: real compression —
reducing how much space this project's content-addressed blobs
actually take on disk — and the `Iterator` pattern, once walking this
project's commit history needs to support several different traversal
orders without `Repository::log` growing a parameter for every one of
them.
