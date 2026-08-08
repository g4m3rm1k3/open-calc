# Lesson 33: A History You Can Walk Backward
### (Project 11 — Mini Git, C++)

**What you will build.** A real `Commit` — itself content-addressed,
the same way Lesson 32's blobs and trees were — referencing a tree
snapshot and its own parent commit by hash, chained together into a
real, walkable history. Then a `Repository` wrapping it all: `commit`,
`log`, and `checkout` — the same three operations any real Git user
runs daily, restoring any prior snapshot exactly, without disturbing
the project's current state. The transferable problem this lesson is
actually about: capturing enough state to restore something later,
without the thing doing the restoring needing to understand or expose
its own internals to do it.

**What you need to know first.** Lesson 32 in full — `fnv1a`, content
addressing, and the `TreeNode` Merkle tree this lesson's commits wrap
directly.

---

## Concept Unit: A Commit Is Also Content-Addressed

### The Problem

Lesson 32 gave a whole project tree one hash, sensitive to any change
anywhere inside it. But a tree hash alone can't answer "what changed,"
"when," or "what came before this" — a real snapshot needs a message,
and needs to know what snapshot preceded it, forming a real,
navigable history rather than a series of disconnected tree hashes.

### Project Change

- **Reference Source** — No reference counterpart; from-scratch.
- **Files affected** — created `commit_lab.cpp` (throwaway, this unit
  only).
- **Change type** — add.
- **Location** — new file, new project directory.
- **Dependencies** — `fnv1a`, `toHex`, both from Lesson 32.

### The New Code

```cpp
struct Commit {
    std::string treeHash;
    std::string message;
    std::string parentHash;  // empty for the very first commit

    std::string hash() const {
        return toHex(fnv1a(treeHash + message + parentHash));
    }
};
```

### The Updated Project

Brand-new throwaway file, shown whole above.

### Introduce the concept in isolation

```cpp
Commit first{"treehash111", "Initial commit", ""};
Commit second{"treehash222", "Add README", first.hash()};

std::cout << "Matches first's hash? " << (second.parentHash == first.hash()) << std::endl;
```

Real output:

```
First commit:  f47a732ca827ee03
Second commit: b51e87ebad70ded0
Second's parent field: f47a732ca827ee03
Matches first's hash?  1
```

`second.parentHash` genuinely equals `first.hash()` — a real,
verifiable link, not a symbolic reference or an array index. And,
critically, `Commit::hash()` is computed exactly the way Lesson 32's
blob and tree hashes were: a deterministic function of the commit's own
*content* — its tree, its message, its parent — meaning a `Commit`
is itself content-addressable, the same as everything else in this
project so far. Change a commit's message after the fact, and its own
hash changes too — there's no way to silently edit history without the
identifier itself revealing that something changed.

### Discard the throwaway example

`commit_lab.cpp`'s two hand-built commits are deleted — the shape
(`treeHash`, `message`, `parentHash`, a hash computed from all three)
carries forward directly into the real project.

### Mechanical walkthrough

- `std::string parentHash;` — **(a) first appearance,** conceptually:
  a string field holding *another commit's own hash* — the actual
  mechanism that turns a flat set of independent snapshots into a real,
  linked chain.
- `std::string hash() const { return toHex(fnv1a(treeHash + message + parentHash)); }`
  — **(b) hard concept reappearing**: the exact same
  hash-of-concatenated-fields technique as Lesson 32's own tree-node
  hashing, applied to a commit's metadata instead of a tree's children.

### CS lens

This is a **linked list**, expressed through content-addressed hashes
instead of raw memory pointers — each commit points to exactly one
predecessor, the same "one node, one link to what comes before"
structure from any earlier phase's linked list, except the link here
is a cryptographic-ish identifier rather than a memory address, which
is precisely what makes it meaningful to write to disk, share across
machines, or verify independently. Also recognized in: a blockchain's
own block-to-previous-block hash chain (structurally almost identical
to this exact mechanism), real Git's own commit objects, which work
exactly this way.

### SE lens

The alternative — storing commits in a plain, ordered list or array,
referenced by position — would work for one single, linear history, and
breaks down the moment two people's histories need to be compared or
merged (a later lesson's own subject): positions in two different
people's separate lists have no inherent relationship to each other,
while two commits with the *same* hash are, by construction,
guaranteed to represent the exact same content and history up to that
point — a real, structural guarantee position-based referencing can't
offer.

### Commands needed

Same `g++ -std=c++17` pattern as Project 11's own Lesson 32.

### Run it

Shown above.

### Connecting sentence

One commit can now point to exactly one predecessor — the next unit
builds the real object that creates this chain and walks it back to
front, the way `git log` does.

---

## Concept Unit: `Repository`, `commit`, and `log`

### The Problem

Building `Commit` objects and linking them by hand, the way the
isolated lab did, doesn't scale to real use — something needs to own
the *current* state (which commit is "now"), create new commits linked
correctly to whatever came before, and walk that chain back through
history on request.

### Project Change

- **Reference Source** — No reference counterpart; from-scratch.
- **Files affected** — created `repository.cpp`.
- **Change type** — add.
- **Location** — new file, combining `TreeNode` (Lesson 32) and
  `Commit` (this lesson's previous unit).
- **Dependencies** — `<unordered_map>`.

### The New Code

```cpp
class Repository {
public:
    std::string commit(std::shared_ptr<TreeNode> tree, const std::string& message) {
        std::string treeHash = tree->hash();
        trees[treeHash] = tree;

        Commit c{treeHash, message, headHash};
        std::string commitHash = c.hash();
        commits[commitHash] = c;
        headHash = commitHash;

        return commitHash;
    }

    void log() {
        std::string current = headHash;
        while (!current.empty()) {
            const Commit& c = commits.at(current);
            std::cout << current.substr(0, 8) << " " << c.message << std::endl;
            current = c.parentHash;
        }
    }

    std::string head() const { return headHash; }

private:
    std::unordered_map<std::string, Commit> commits;
    std::unordered_map<std::string, std::shared_ptr<TreeNode>> trees;
    std::string headHash;
};
```

### The Updated Project

Brand-new file, shown whole above — `Repository` owns two
content-addressed stores (one for trees, one for commits, echoing
Lesson 32's own `BlobStore` shape twice over) and one piece of mutable
state: `headHash`, tracking whatever the *most recent* commit is.

### Mechanical walkthrough

- `Commit c{treeHash, message, headHash};` — **(a) first appearance,**
  conceptually: the new commit's `parentHash` is set to whatever
  `headHash` *currently* holds, *before* it's updated — automatically
  linking every new commit to whatever was "current" the moment before
  it was made.
- `headHash = commitHash;` — **(b) hard concept reappearing**: ordinary
  assignment — the entire mechanism of "moving forward" in history is
  this one line, updating which commit counts as "now."
- `void log() { std::string current = headHash; while (!current.empty()) { ... current = c.parentHash; } }`
  — **(a) first appearance,** as applied here: walks *backward*
  through history, starting at `headHash` and following each commit's
  `parentHash` link until reaching the very first commit, whose own
  `parentHash` is empty — the loop's natural termination condition.

### CS lens

Nothing new beyond what the previous unit already established about
linked, content-addressed structures — this unit's real content is the
traversal: walking a linked list backward from its most recent node,
the exact operation `git log` performs against a real repository's
actual commit graph.

### SE lens

Proven directly, three real commits, each genuinely building on the
last:

```cpp
auto readme = TreeNode::makeFile("README.md", "# My Project");
auto v1 = TreeNode::makeDir("project", {readme});
std::string commit1 = repo.commit(v1, "Initial commit");

auto readmeV2 = TreeNode::makeFile("README.md", "# My Project\nNow with more detail.");
auto v2 = TreeNode::makeDir("project", {readmeV2});
std::string commit2 = repo.commit(v2, "Expand README");

auto license = TreeNode::makeFile("LICENSE", "MIT License");
auto v3 = TreeNode::makeDir("project", {readmeV2, license});
std::string commit3 = repo.commit(v3, "Add license");

repo.log();
```

Real output:

```
efdc9fc3 Add license
7a9e5e42 Expand README
b93dfe6b Initial commit
```

Newest first, correctly — exactly the order `git log` prints by
default — walked entirely by following `parentHash` links backward,
with no separate "history list" ever maintained; the chain of commits
*is* the history.

### Commands needed

Same pattern.

### Run it

Shown above.

### Connecting sentence

History can now be created and walked — the final unit is what makes
this genuinely useful instead of merely observable: restoring the
actual project state from any point in that history, on demand.

---

## Concept Unit: `checkout`, and the Memento Pattern

### The Problem

Seeing a commit's message in `log()` output is one thing; actually
*restoring* the project to that exact prior state — the real files, as
they existed at that point — is the entire practical point of version
control. Whatever does the restoring needs to reconstruct that old
state precisely, without `Repository`'s own internal storage needing to
be exposed or rebuilt by hand from outside.

### Project Change

- **Reference Source** — No reference counterpart; from-scratch.
- **Files affected** — modified `repository.cpp`.
- **Change type** — add.
- **Location** — inside `class Repository`, a new method.
- **Dependencies** — none new.

### The New Code

```cpp
std::shared_ptr<TreeNode> checkout(const std::string& commitHash) {
    const Commit& c = commits.at(commitHash);
    return trees.at(c.treeHash);
}
```

### The Updated Project

`Repository` gains this one method, alongside `commit`, `log`, and
`head`.

### Mechanical walkthrough

- `const Commit& c = commits.at(commitHash);` — **(b) hard concept
  reappearing**: `.at()`, the safe, exception-throwing lookup from
  Lesson 32's own `BlobStore::retrieve`, here looking up a commit by
  its hash rather than a blob.
- `return trees.at(c.treeHash);` — **(b) hard concept reappearing**:
  the same lookup, one level further — the commit itself is never the
  *state*, only a pointer to it; the actual tree snapshot lives in
  `trees`, addressed by the hash the commit happens to reference.

### CS lens

This is the **Memento pattern**: an object (`Commit`, playing the
**memento** role) captures enough state to restore something later,
without exposing the restoring mechanism's own internal structure to
whoever asked for the restore — `checkout`'s caller receives a real
`TreeNode`, complete and correct, with no need to understand how
`Repository` stores its history internally to get it. Also recognized
in: an undo system that snapshots enough state to reverse an action
(Project 2, Lesson 5's own `Command` objects took a related but
distinct approach — reversing an action's *effect* directly, rather
than restoring from a stored snapshot), a video game's save file, a
document editor's version history feature.

### SE lens

Proven directly — checking out the *first* commit, after two more
commits have already been made, without disturbing the repository's
current state at all:

```cpp
auto restoredTree = repo.checkout(commit1);
std::cout << "Restored tree has " << restoredTree->children.size() << " file(s):" << std::endl;
for (const auto& f : restoredTree->children) {
    std::cout << "  " << f->name << ": " << f->content << std::endl;
}

std::cout << "HEAD: " << repo.head().substr(0, 8) << " (== commit3? " << (repo.head() == commit3) << ")" << std::endl;
```

Real output:

```
--- checking out the first commit ---
Restored tree has 1 file(s):
  README.md: # My Project

--- current HEAD still points to the latest commit ---
HEAD: efdc9fc3 (== commit3? 1)
```

The restored tree has genuinely **one** file — `LICENSE`, added in the
third commit, correctly doesn't exist in this snapshot — and its
`README.md` holds the *original*, shorter content, not the expanded
version from the second commit. And `repo.head()` still equals
`commit3` — `checkout`, as built here, is read-only: it hands back a
past snapshot without moving `HEAD`, a deliberate, honest scope choice
worth naming — real Git's own `checkout` can optionally *move* `HEAD`
too, a genuinely more complex operation this lesson doesn't attempt.

### Commands needed

Same pattern.

### Run it

Shown above.

### Connecting sentence

Every idea in this lesson now works together: a commit chain that can
be built, walked, and — the whole practical point — restored from,
precisely, at any point, without the caller ever needing to know how
`Repository` actually stores anything internally.

---

## Closing

**Connect the pieces.** One file, through the whole lesson: `README.md`
starts as `"# My Project"`, wrapped in a `TreeNode` and committed —
`Repository::commit` hashes the tree, stores it, builds a `Commit`
referencing that tree hash and the (empty) previous `HEAD`, and moves
`HEAD` forward. Two more commits follow, one changing `README.md`'s own
content, one adding a second file entirely — each one a new tree,
hashed and stored, each new `Commit` correctly chained to whatever
`HEAD` was at that exact moment. `repo.log()` walks that chain
backward, printing every message in reverse order. `repo.checkout(commit1)`
looks up that first commit, follows its `treeHash` into `trees`, and
returns the *exact* original tree — one file, original content — proven
by real output, not description, while `HEAD` itself stays exactly
where it was.

**What breaks without this.** Already shown directly, precisely: the
restored tree's exact file count and exact original content, confirmed
against real output, and `HEAD`'s position confirmed unchanged after a
`checkout` — deliberately not restaged, since both were the actual
point of running the code in the first place.

**Exercises.**
1. Add a `diff(commitHashA, commitHashB)` method to `Repository` that
   checks out both trees and reports which top-level file names exist
   in one but not the other — a real, minimal version of `git diff`'s
   own file-list summary.
2. Modify `checkout` so it *does* move `HEAD` (matching real Git's
   default `checkout` behavior more closely), and write a test
   confirming a *new* commit made after such a checkout correctly
   chains to the checked-out commit, not to whatever was `HEAD` before.
3. Add timestamps to `Commit`, and extend `log()` to print them —
   deciding, and justifying in one sentence, whether the timestamp
   should be included in the commit's own `hash()` computation.

**Definition of done.**
- [ ] `Commit::hash()` is genuinely a function of its own content —
      confirmed by changing a commit's message and observing its hash
      change too.
- [ ] `Repository::commit` correctly chains each new commit to whatever
      `HEAD` was immediately before it, confirmed by `log()` printing
      all commits in the correct, real order.
- [ ] `checkout` correctly restores an exact prior tree snapshot,
      confirmed by real file counts and real file content matching
      what that commit actually captured — and confirmed *not* to move
      `HEAD`.
- [ ] Commit with a message explaining why — e.g. `"Chain commits by
      parent hash into a real, content-addressed history, and restore
      any prior tree snapshot via checkout without disturbing HEAD"` —
      not `"add commits"`.

**Next lesson** stays in Project 11: a real `diff` between two trees —
walking both Merkle structures together to report exactly which files
were added, removed, or changed — and the `Visitor` pattern, once
walking a tree needs to support several genuinely different operations
without `TreeNode` itself growing a new method for every one of them.
