# Lesson 78: A Version Control System Is Just a Hash Table and a Linked List

**What you will build:** a `MiniGit` class with `init`, `add`,
`commit`, and `log` — a genuinely working, if minimal, version control
system: content-addressable storage, a staging area, and a commit
history you can walk backward through. The working feature is real
version control. The transferable insight, worth stating up front
because it's the entire point of this capstone: Git's core mechanism
isn't some novel invention specific to source code — it's Lesson 70's
hash table (content addressed by its own hash) combined with Lesson
68's linked list (commits linked backward by parent pointers), applied
to a genuinely different problem than either lesson originally posed.

**What you need to know first:** Lesson 44 (file checksum generator) —
this lesson's entire storage model is built on the same idea, hashing
content to fingerprint it, now used not just to *verify* a file but to
*name and store* it. Lesson 70 (hash table) — a `MiniGit` object store
is a hash table in every meaningful sense: keys are hashes, values are
content, lookup is O(1) — just persisted to disk instead of held in
memory. Lesson 68 (linked list) — each commit holds a reference to
exactly one previous commit, the same "each node points to the thing
before it" shape as a linked list, walked in `log`. Lesson 56 (JSON
parser/config-file parser) — commit objects here are serialized with
Python's own `json` module, storing structured data as reusable text,
exactly the problem that lesson solved from scratch.

---

## Concept Unit: The Problem — Copies Waste Space, Filenames Aren't Identity

### The Problem

The obvious way to keep old versions of a file is to copy the whole
thing somewhere else before changing it. This works, but wastes space
in direct proportion to how little actually changed — one new line
means duplicating the entire rest of the file, every single time — and
it identifies each version only by *where it happens to be stored*
(`notes_v1.txt`, `notes_v2.txt`), which says nothing about whether two
files anywhere actually contain the same content.

### The New Code

```python
import shutil, os

os.makedirs("backups", exist_ok=True)
with open("notes.txt", "w") as f:
    f.write("Meeting notes v1\nDiscuss budget.\n")

shutil.copy("notes.txt", "backups/notes_v1.txt")

with open("notes.txt", "a") as f:
    f.write("Discuss timeline.\n")

shutil.copy("notes.txt", "backups/notes_v2.txt")

print(os.listdir("backups"))
print("size v1:", os.path.getsize("backups/notes_v1.txt"), "bytes")
print("size v2:", os.path.getsize("backups/notes_v2.txt"), "bytes")
print("Only one line changed, but the ENTIRE file was duplicated to keep both versions.")
```

### Run It

```
['notes_v2.txt', 'notes_v1.txt']
size v1: 33 bytes
size v2: 51 bytes
Only one line changed, but the ENTIRE file was duplicated to keep both versions.
```

Discarded now. The fix isn't a cleverer copying scheme — it's a
completely different way of identifying and storing content, built
next.

### CS Lens

Identifying data by *where it's stored* rather than *what it contains*
is a limitation with consequences well beyond backups. Also recognized
in: two identical files sitting in different folders with no system
aware they're the same, a CDN caching the same image twice under two
different URLs, a package manager unable to tell that two dependencies
pinned to different version strings actually resolve to bit-identical
code.

---

## Concept Unit: Content-Addressable Storage

### The Problem

What's needed is a way to name a piece of content using *the content
itself* — so identical content always gets the same name, no matter
where it came from or what it's called, and different content always
gets a different name.

### The New Code

```python
import hashlib

content1 = b"Meeting notes v1\nDiscuss budget.\n"
content2 = b"Meeting notes v1\nDiscuss budget.\n"   # identical content
content3 = b"Meeting notes v1\nDiscuss budget.\nDiscuss timeline.\n"

def content_id(data):
    return hashlib.sha1(data).hexdigest()

print("content1 id:", content_id(content1))
print("content2 id:", content_id(content2))
print("content3 id:", content_id(content3))
print("content1 == content2 id?", content_id(content1) == content_id(content2))
```

### Run It

```
content1 id: b00a0c1d93a8d998dab55afeadc20baad0aec471
content2 id: b00a0c1d93a8d998dab55afeadc20baad0aec471
content3 id: 2c73fe38dd7d99b7b7f18e9636d9f01ebfb55c4f
content1 == content2 id? True
```

`content1` and `content2` are two separate Python objects, built from
two separate string literals — but their hash is identical, because
`hashlib.sha1`, reappearing from Lesson 44's checksum work, is
deterministic: same bytes in, same digest out, every time, regardless
of when, where, or how many times it's computed. This is called
**content-addressable storage**: the content's own hash *is* its
address. Discarded as a standalone lab now — the real object store
below uses exactly this function as its foundation.

### CS Lens

Naming data by a hash of its own content, rather than an arbitrary
assigned label, is the same idea behind Git's own object model (this
lesson's direct inspiration), IPFS and other content-addressed
storage networks, Docker image layers (identical layers across
different images are stored once, referenced by digest), and Lesson
70's own hash table — a hash table maps *keys* to values; content-
addressable storage is the special case where the key is derived
*from* the value itself.

---

## Concept Unit: `init` and the Object Store

### The Problem

Content-addressable storage needs somewhere real to live — a directory
structure that can hold arbitrary pieces of content, named by their
own hashes, plus a place to track "what's currently staged to be
saved" before it's actually committed.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch
  addition, though the underlying mechanism (hash → stored value) is
  Lesson 70's own `HashTable`, reimplemented here with the filesystem
  as the backing store instead of an in-memory bucket array.
- **Files affected:** `minigit.py` (new file).
- **Change type:** add.
- **Location:** n/a — brand-new file.
- **Dependencies:** `hashlib`, `os`, `json` (standard library).

### The New Code

```python
import hashlib
import os
import json


class MiniGit:
    def __init__(self, repo_dir):
        self.repo_dir = repo_dir
        self.minigit_dir = os.path.join(repo_dir, ".minigit")
        self.objects_dir = os.path.join(self.minigit_dir, "objects")
        self.index_path = os.path.join(self.minigit_dir, "index")

    def init(self):
        os.makedirs(self.objects_dir, exist_ok=True)
        if not os.path.exists(self.index_path):
            self._write_index({})

    def _hash_content(self, content_bytes):
        return hashlib.sha1(content_bytes).hexdigest()

    def _write_object(self, content_bytes):
        oid = self._hash_content(content_bytes)
        obj_path = os.path.join(self.objects_dir, oid)
        if not os.path.exists(obj_path):
            with open(obj_path, "wb") as f:
                f.write(content_bytes)
        return oid

    def _read_index(self):
        with open(self.index_path) as f:
            return json.load(f)

    def _write_index(self, index):
        with open(self.index_path, "w") as f:
            json.dump(index, f)
```

### Run It

```python
>>> from minigit import MiniGit
>>> repo = MiniGit(".")
>>> repo.init()
>>> import os
>>> os.path.exists(".minigit/objects")
True
>>> repo._read_index()
{}
```

### Mechanical Walkthrough

- `self.minigit_dir`, `self.objects_dir`, `self.index_path` — three
  paths computed once in `__init__` and reused everywhere else in the
  class — already-established good practice: compute a derived value
  once, store it, rather than rebuilding the same path string in every
  method.
- `os.makedirs(self.objects_dir, exist_ok=True)` — creates the entire
  directory tree needed (`.minigit/` and `.minigit/objects/` together,
  since `objects` is nested inside `minigit_dir`) in one call;
  `exist_ok=True` means calling `init()` a second time on an
  already-initialized repository doesn't raise an error — already-
  established defensive pattern from earlier file-system lessons.
- `def _hash_content(self, content_bytes):` — the exact function from
  the previous unit's lab, moved into the class, unchanged.
- `def _write_object(self, content_bytes): oid = self._hash_content(content_bytes); obj_path = os.path.join(self.objects_dir, oid); if not os.path.exists(obj_path): ...`
  — **first appearance of the object store's write path, and the
  deduplication check that makes content-addressable storage actually
  pay off.** The object's filename *is* its content hash — computed
  first, before anything is written. The `if not os.path.exists(...)`
  check means: if a file with this exact name (this exact content
  hash) already exists on disk, **don't write anything at all** —
  identical content, requested to be stored twice, is only ever
  physically stored once. This is the direct fix for the very first
  unit's wasted-space problem, not a separate optimization bolted on
  afterward.
- `def _read_index` / `_write_index` — **first appearance of `json`
  used for real project persistence in this lesson**, reappearing
  Lesson 56's own JSON-parsing work: the staging index (which files
  are staged, and which content hash each one currently points to) is
  a plain Python dict, serialized to and from a JSON file on disk so
  it survives between separate runs of the program — necessary because,
  unlike everything built so far in this curriculum, a version control
  tool has to remember state *across* separate program executions, not
  just within one.

### CS Lens

Checking whether a value already exists before storing it again — so
identical inputs are only ever paid for once — is the same
deduplication instinct behind Lesson 72's LRU cache's update-in-place
logic (Lesson 72's `put` explicitly avoided storing a duplicate entry
for an existing key) and, more broadly, any content-addressed system's
entire value proposition: storage cost scales with *unique* content,
not with *how many times* that content was ever submitted.

---

## Concept Unit: `add` — Staging

### The Problem

The object store can hold content, but nothing yet connects a real
file on disk to an entry in that store, or tracks "these are the
specific versions of these specific files I intend to save next."

### Project Change

- **Reference Source:** No reference counterpart — from-scratch
  addition.
- **Files affected:** `minigit.py`.
- **Change type:** add.
- **Location:** inside `MiniGit`, immediately after `_write_index`.
- **Dependencies:** `_write_object`, `_read_index`/`_write_index`.

### The New Code

```python
    def add(self, filename):
        path = os.path.join(self.repo_dir, filename)
        with open(path, "rb") as f:
            content = f.read()
        oid = self._write_object(content)
        index = self._read_index()
        index[filename] = oid
        self._write_index(index)
        return oid
```

### Run It

```python
>>> repo = MiniGit(".")
>>> repo.init()
>>> with open("notes.txt", "w") as f:
...     f.write("Meeting notes v1\nDiscuss budget.\n")
>>> oid = repo.add("notes.txt")
>>> oid
'b00a0c1d93a8d998dab55afeadc20baad0aec471'
>>> repo._read_index()
{'notes.txt': 'b00a0c1d93a8d998dab55afeadc20baad0aec471'}
>>> import os
>>> os.listdir(".minigit/objects")
['b00a0c1d93a8d998dab55afeadc20baad0aec471']
```

### Mechanical Walkthrough

- `with open(path, "rb") as f: content = f.read()` — reads the real
  file's raw bytes — `"rb"` (binary mode), not `"r"` (text mode),
  because content-addressable hashing needs the file's *exact* bytes;
  text-mode reading can silently translate line endings on some
  platforms, which would change the hash for content a person would
  consider identical.
- `oid = self._write_object(content)` — hands the file's actual
  content to the object store built in the previous unit; `oid`
  ("object ID") comes back as that content's hash, whether it was
  freshly stored or already existed.
- `index = self._read_index(); index[filename] = oid; self._write_index(index)`
  — **first appearance of the staging area's actual purpose.** The
  index maps *filenames* to *content hashes* — this is the bridge
  between "what a human calls a file" and "what the content-addressable
  store actually knows about," since the object store itself has no
  concept of filenames at all, only content and hashes.

### CS Lens

Separating "what a human names a thing" from "what uniquely identifies
its content" — two different pieces of information, tracked in two
different places — mirrors a filesystem's own separation between a
directory entry (a name, pointing at) and an inode (the actual file
data) — a real, standard operating-system design, not something Git
(or this lesson) invented from nothing.

---

## Concept Unit: `commit` — a Linked List of Snapshots

### The Problem

Staged content sits in the index, but nothing yet turns "here's what's
currently staged" into a permanent, named point in history — and
nothing yet connects that point to *whatever came before it*, which is
the entire reason "history" is a meaningful word here at all.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch
  addition, though the shape (each new node referencing the one
  before it) is directly Lesson 68's linked list, applied to commits
  instead of list elements.
- **Files affected:** `minigit.py`.
- **Change type:** add; also adds `self.head_path` to `__init__` and a
  new `init()` step to create it.
- **Location:** `__init__`/`init` updated; `commit` added after `add`.
- **Dependencies:** `_write_object`, `_read_index`.

### The New Code

```python
    def _read_head(self):
        with open(self.head_path) as f:
            content = f.read().strip()
        return content if content else None

    def _write_head(self, commit_id):
        with open(self.head_path, "w") as f:
            f.write(commit_id)

    def commit(self, message):
        index = self._read_index()
        parent = self._read_head()
        commit_obj = {
            "tree": index,
            "parent": parent,
            "message": message,
            "time": time.time(),
        }
        commit_bytes = json.dumps(commit_obj, sort_keys=True).encode()
        commit_id = self._write_object(commit_bytes)
        self._write_head(commit_id)
        return commit_id
```

### The Updated Project

```python
import hashlib
import os
import json
import time


class MiniGit:
    def __init__(self, repo_dir):
        self.repo_dir = repo_dir
        self.minigit_dir = os.path.join(repo_dir, ".minigit")
        self.objects_dir = os.path.join(self.minigit_dir, "objects")
        self.index_path = os.path.join(self.minigit_dir, "index")
        self.head_path = os.path.join(self.minigit_dir, "HEAD")                # ← new

    def init(self):
        os.makedirs(self.objects_dir, exist_ok=True)
        if not os.path.exists(self.index_path):
            self._write_index({})
        if not os.path.exists(self.head_path):                                  # ← new
            with open(self.head_path, "w") as f:                                  # ← new
                f.write("")                                                         # ← new

    # ... _hash_content, _write_object, _read_index, _write_index unchanged ...

    def _read_head(self):                                                            # ← new
        with open(self.head_path) as f:                                                # ← new
            content = f.read().strip()                                                   # ← new
        return content if content else None                                                # ← new

    def _write_head(self, commit_id):                                                        # ← new
        with open(self.head_path, "w") as f:                                                    # ← new
            f.write(commit_id)                                                                    # ← new

    def add(self, filename):
        # unchanged from the previous unit
        ...

    def commit(self, message):                                                                        # ← new
        index = self._read_index()                                                                       # ← new
        parent = self._read_head()                                                                          # ← new
        commit_obj = {                                                                                         # ← new
            "tree": index,                                                                                        # ← new
            "parent": parent,                                                                                        # ← new
            "message": message,                                                                                        # ← new
            "time": time.time(),                                                                                          # ← new
        }                                                                                                                     # ← new
        commit_bytes = json.dumps(commit_obj, sort_keys=True).encode()                                                          # ← new
        commit_id = self._write_object(commit_bytes)                                                                               # ← new
        self._write_head(commit_id)                                                                                                  # ← new
        return commit_id                                                                                                                # ← new
```

### Mechanical Walkthrough

- `self.head_path` and `init()`'s new block — **first appearance of
  `HEAD`.** A single small file holding exactly one thing: the ID of
  the *most recent* commit. Initialized to an empty string,
  representing "no commits exist yet" — the same "empty means nothing
  here yet" convention already familiar from `self.root = None` in
  Lesson 71's binary search tree.
- `parent = self._read_head()` — **first appearance of reading HEAD to
  find the previous commit.** Whatever commit `HEAD` currently points
  to becomes this new commit's `parent` — this single line is the
  entire mechanism that turns a series of independent commits into a
  connected history.
- `commit_obj = {"tree": index, "parent": parent, "message": message, "time": time.time()}`
  — **first appearance of a commit's actual shape.** `"tree"` here is
  simply the staged index at the moment of committing — a snapshot of
  "which filename mapped to which content hash," copied by value into
  the commit itself (already-established: assigning a dict literal
  like this copies its structure into a new key, not a live reference
  to the working index that could change later). `"parent"` is the
  single previous commit's ID, or `None` for the very first commit —
  reappearing the sentinel-`None` idea from `TreeNode`/`LRUCache`.
- `commit_bytes = json.dumps(commit_obj, sort_keys=True).encode()` —
  **first appearance of `sort_keys=True`.** Serializing a dict to JSON
  without this can produce different byte output for logically
  identical dicts, depending on the order Python happens to have
  stored their keys internally — which would make two *conceptually
  identical* commits hash to two *different* IDs, breaking
  content-addressing's core promise. Sorting keys first guarantees the
  same commit content always serializes to the exact same bytes,
  every time.
- `commit_id = self._write_object(commit_bytes)` — **the key insight
  this whole unit builds toward**: a commit is stored in the *exact
  same* object store as a file's content, using the *exact same*
  `_write_object` method built two units ago. There's no separate
  "commit storage" system — a commit is just another piece of content,
  identified the same way, whose *content happens to include another
  object's ID*.
- `self._write_head(commit_id)` — advances `HEAD` to point at this
  brand-new commit, so the *next* commit's `parent` will correctly be
  this one.

### Execution Trace

```python
repo.add("notes.txt")            # notes.txt: "Meeting notes v1\nDiscuss budget.\n"
c1 = repo.commit("Initial notes")
# ... notes.txt is edited, appending a line ...
repo.add("notes.txt")            # notes.txt: same content + "Discuss timeline.\n"
c2 = repo.commit("Add timeline discussion")
```

1. First `commit`: `parent = self._read_head()` → `None` (HEAD was
   empty). `commit_obj = {"tree": {"notes.txt": "b00a0c1d..."},
   "parent": None, "message": "Initial notes", "time": ...}`. Hashed
   and stored as `c1`; HEAD now points at `c1`.
2. `notes.txt` is edited and re-`add`ed — its content hash changes
   (different bytes → different SHA-1, from the content-addressing
   unit), so the index now maps `"notes.txt"` to a *new* hash.
3. Second `commit`: `parent = self._read_head()` → `c1` (HEAD still
   points there, from step 1). `commit_obj = {"tree": {"notes.txt":
   "2c73fe38..."}, "parent": "<c1's full hash>", "message": "Add
   timeline discussion", ...}`. Hashed and stored as `c2`; HEAD now
   points at `c2`.

Two commit objects now exist in the object store, and `c2`'s own
content literally contains `c1`'s ID — a real, followable link, not a
separate index or table tracking history alongside the objects.

### Run It

```
commit 1: 342ac653384b2de9671c016b7c380053a828f846
commit 2: 1718376eb1c5a1e7c5e23dc991f0e49311301a8f
```

### CS Lens

Each commit referencing exactly one previous commit by ID is,
structurally, precisely Lesson 68's singly linked list: a commit is a
node; `"parent"` is `.next`, just pointing backward instead of
forward; `HEAD` is the equivalent of a list's own head pointer,
tracking where to start walking from. Real Git's history is a bit more
general — a **directed acyclic graph**, not a strict linked list,
because a merge commit can have *two* parents — but a linear history
with one parent per commit, exactly what this lesson builds, is the
common case, and the DAG generalization is a natural extension flagged
in this lesson's exercises rather than built here.

---

## Concept Unit: `log` — Walking the History Backward

### The Problem

Commits exist, linked to their parents, but nothing yet reads that
chain back out as an actual, ordered history a person could look at.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch
  addition.
- **Files affected:** `minigit.py`.
- **Change type:** add; also requires a `_read_object` method to read
  an object's bytes back given its ID (the read-side counterpart to
  `_write_object`, not needed until now).
- **Location:** inside `MiniGit`, after `commit`.
- **Dependencies:** `_read_head`, the object store.

### The New Code

```python
    def _read_object(self, oid):
        with open(os.path.join(self.objects_dir, oid), "rb") as f:
            return f.read()

    def log(self):
        commit_id = self._read_head()
        history = []
        while commit_id:
            commit_bytes = self._read_object(commit_id)
            commit_obj = json.loads(commit_bytes)
            history.append((commit_id, commit_obj))
            commit_id = commit_obj["parent"]
        return history
```

### Mechanical Walkthrough

- `def _read_object(self, oid): with open(os.path.join(self.objects_dir, oid), "rb") as f: return f.read()`
  — the mirror image of `_write_object`: given a hash, find the file
  named exactly that hash inside `objects/`, and return its raw bytes.
  This is the O(1) lookup half of content-addressable storage — no
  searching, no scanning; the ID *is* the exact filename to open.
- `commit_id = self._read_head(); history = []` — start from the most
  recent commit, exactly where `HEAD` currently points.
- `while commit_id:` — **first appearance of walking backward through
  commit history**, structurally identical to walking a linked list
  from its head to its end (Lesson 68) or Lesson 71's `shortest_path`
  walking a `parent` chain backward from a goal to a start — the same
  "follow one link at a time until you hit `None`" shape, reused a
  third time with a third kind of data.
- `commit_bytes = self._read_object(commit_id); commit_obj = json.loads(commit_bytes)`
  — retrieve and deserialize the commit's own stored content — the
  read-side mirror of `commit`'s `json.dumps`/`_write_object` pair.
- `history.append((commit_id, commit_obj))` — record this commit
  before moving on.
- `commit_id = commit_obj["parent"]` — **the actual traversal step.**
  Step to whatever this commit's own `"parent"` field says came
  before it — when that's `None` (the very first commit, whose parent
  was `None` when created), the `while commit_id:` condition becomes
  false and the loop ends.

### Run It

```python
>>> for oid, commit in repo.log():
...     print(oid[:8], "-", commit["message"], "| tree:", commit["tree"])
```

```
1718376e - Add timeline discussion | tree: {'notes.txt': '2c73fe38dd7d99b7b7f18e9636d9f01ebfb55c4f'}
342ac653 - Initial notes | tree: {'notes.txt': 'b00a0c1d93a8d998dab55afeadc20baad0aec471'}
```

Real output: two real commits, printed newest-first (since the walk
starts at `HEAD` and moves *backward* through parents), each showing
its own message and the exact content hash `notes.txt` had at that
point in history — genuinely two different hashes, for genuinely
different content, both still sitting in the object store, both still
retrievable at any time.

### CS Lens

Reconstructing an ordered sequence purely by following stored
backward-pointers from a known starting point, with no separate list
or index of "all commits in order" maintained anywhere, is the same
technique Lesson 71's `shortest_path` used to reconstruct a route —
here applied to project history instead of graph traversal, confirming
the same mechanism generalizes across genuinely different problems.

---

## Connect the Pieces — Deduplication, For Real

```python
repo = MiniGit(".")
repo.init()

with open("notes.txt", "w") as f:
    f.write("Meeting notes v1\nDiscuss budget.\n")
repo.add("notes.txt")
repo.commit("Initial notes")

with open("notes.txt", "a") as f:
    f.write("Discuss timeline.\n")
repo.add("notes.txt")
repo.commit("Add timeline discussion")

# Now revert notes.txt back to its ORIGINAL content and re-add it.
with open("notes.txt", "w") as f:
    f.write("Meeting notes v1\nDiscuss budget.\n")
oid = repo.add("notes.txt")
print("re-added original content, oid:", oid[:8])
print("total objects on disk:", len(os.listdir(".minigit/objects")))
```

```
re-added original content, oid: b00a0c1d
total objects on disk: 4
```

Four objects total — two file-content blobs and two commits — even
after three separate `add` calls across the whole session. The third
`add`, reverting `notes.txt` back to its exact original text, produced
the *exact same* content hash (`b00a0c1d`) as the very first `add`
did — and `_write_object`'s existence check meant nothing new was
written to disk at all. This is the very first unit's wasted-space
problem, concretely solved: identical content, submitted at two
completely different points in a project's history, costs disk space
exactly once.

## What Breaks Without This — Detecting Corruption

Content-addressable storage has a second real property worth
demonstrating, not just claiming: if an object's *stored bytes* are
ever tampered with — a disk error, a manual edit, anything — its
filename (the hash it was originally stored under) will no longer
match a hash recomputed from its *current* content. That mismatch is
detectable.

```python
import hashlib

index = repo._read_index()
target_oid = index["notes.txt"]
obj_path = os.path.join(repo.objects_dir, target_oid)
with open(obj_path, "r+b") as f:
    data = f.read()
    f.seek(0)
    f.write(data.replace(b"budget", b"BUDGET"))   # simulate corruption

with open(obj_path, "rb") as f:
    actual_content = f.read()
recomputed = hashlib.sha1(actual_content).hexdigest()
print("claimed id (filename):", target_oid[:8])
print("recomputed id (from content):", recomputed[:8])
print("object corrupted:", recomputed != target_oid)
```

```
claimed id (filename): b00a0c1d
recomputed id (from content): 5dfd9e07
object corrupted: True
```

The corrupted object doesn't raise an error just from being read — a
`_read_object` call would happily return the tampered bytes without
complaint. Detecting the corruption requires *actively checking*: does
this object's name still match a hash of what it actually contains?
This is precisely why real Git can detect a corrupted or tampered
repository — every single object, everywhere in history, carries its
own built-in integrity check for free, as a direct consequence of
being named by its own content in the first place, the same mechanism
this lesson built from its very first unit onward.

## Exercises

- Add a `checkout(commit_id)` method that reads a past commit's
  `"tree"`, and writes each file's content (looked up by hash from the
  object store) back into the working directory — reconstructing a
  full past snapshot of the project on demand.
- Add a `status()` method comparing the current working directory's
  files against the index, reporting which tracked files have changed
  since they were last `add`ed (by comparing a freshly computed hash
  of each file's current content against what's stored in the index).
- Research how real Git's object model differs from this lesson's: a
  real commit points to a **tree** object (representing a whole
  directory structure), which itself points to **blob** objects (file
  contents) — a two-level structure this lesson simplified into one,
  by storing the whole index directly inside the commit.
- Extend `commit` to accept *multiple* parents, and `log` to handle
  branching history correctly (each commit potentially having more
  than one immediate predecessor) — the seam where this lesson's
  linked-list-shaped history becomes Lesson 71's more general graph.

## Definition of Done

- [ ] `init`, `add`, `commit`, and `log` all implemented and run,
      matching every trace above.
- [ ] Two real commits made on your own machine, with `log()` printing
      both, newest-first, with correct messages and tree contents.
- [ ] Deduplication confirmed directly: reverting a file to previous
      content and re-`add`ing it produces the *same* object ID as
      before, and the object count on disk does not increase.
- [ ] The corruption-detection demo run for real: a tampered object's
      recomputed hash confirmed to differ from its stored filename.
- [ ] Can explain out loud, without looking at the code, why
      `json.dumps(commit_obj, sort_keys=True)` — not without
      `sort_keys=True` — is required for content-addressing to work
      correctly on commit objects.
- [ ] Committed (to a *real* Git repository, not just `MiniGit` — the
      irony is worth noticing), with a message explaining *why* — e.g.
      `"Mini Git: content-addressable object store (Lesson 70's hash
      table) plus parent-pointer commit history (Lesson 68's linked
      list)"` — not `"add minigit.py"`.
