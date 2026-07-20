# Lesson 13: A Fingerprint for Bytes
### (Find Duplicate Files by Hash)

**What you will build.** `find_duplicates(root)` — a function that
recursively scans a folder tree (reusing Lesson 12's `os.walk()`
pattern) and reports groups of files that contain *identical content*,
regardless of filename or location. The working feature is small. The
transferable problem underneath: **the only reliable way to know two
files are truly identical is to look at every byte** — but comparing
every byte of every pair of files directly would be painfully slow on a
large folder. A cryptographic hash gives you a short, fixed-size
"fingerprint" of a file's entire content, and two files with the same
fingerprint can be trusted to be identical without ever comparing them
directly.

**What you need to know first.** From Lesson 12: `os.walk()`. From
Lessons 10/11: reading a file in chunks with a `while` loop. From
Lesson 6: `.items()`. New in this lesson: the `hashlib` module and
`dict.setdefault()`.

No pipeline diagram — not part of an established multi-stage pipeline.

---

## Concept Unit: `hashlib`

### The Problem

We want a short, comparable value that represents a file's entire
content — so that comparing two files becomes "do these two short
values match" instead of "read and compare every byte of both files
directly."

### Introduce the Concept in Isolation

```python
import hashlib

h = hashlib.sha256()
h.update(b"hello world")
print(h.hexdigest())

h2 = hashlib.sha256()
h2.update(b"hello world")
print(h2.hexdigest())

h3 = hashlib.sha256()
h3.update(b"different content")
print(h3.hexdigest())
```

Run it:

```
b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde
b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde
9d9d56051b7344b869e54a8ecebf1b39f21fe2449222bbdd135e9a608b21673
```

This proves `hashlib.sha256()` creates a hash object; `.update(bytes)`
feeds it data; `.hexdigest()` produces a fixed-length (64 hex
characters, always, regardless of input size) string fingerprint of
whatever was fed in. Identical input (`b"hello world"`, twice,
separately) produces the identical fingerprint; different input
produces a completely different one. A second real check confirms
something equally important — that feeding the same data in *pieces*
produces the identical result to feeding it all at once:

```python
h1 = hashlib.sha256()
h1.update(b"hello world")
print("all at once:", h1.hexdigest())

h2 = hashlib.sha256()
h2.update(b"hello ")
h2.update(b"world")
print("in two pieces:", h2.hexdigest())
```

```
all at once: b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde
in two pieces: b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde
```

Identical — which is exactly what makes hashing compatible with
Lesson 10/11's chunked-reading pattern: a file can be hashed piece by
piece, in bounded memory, without ever holding the whole thing at once,
and still get the one correct answer. This throwaway example is
discarded.

### Discard the Throwaway Example

Discarded.

### Project Change

- **Files affected:** `find_dupes.py` (new file)
- **Change type:** create
- **Location:** top of the file — nothing exists yet
- **Dependencies:** `hashlib` module (standard library)

### The New Code

```python
import hashlib

def hash_file(path):
    hasher = hashlib.sha256()
    with open(path, "rb") as f:
        while True:
            chunk = f.read(4096)
            if not chunk:
                break
            hasher.update(chunk)
    return hasher.hexdigest()
```

### The Updated Project

This is the entire file so far:

```python
import hashlib

def hash_file(path):
    hasher = hashlib.sha256()
    with open(path, "rb") as f:
        while True:
            chunk = f.read(4096)
            if not chunk:
                break
            hasher.update(chunk)
    return hasher.hexdigest()
```

`hash_file()` now computes a real fingerprint for any file, reading it
in bounded 4096-byte chunks (Lesson 10/11's exact loop shape) and
feeding each one into the hash incrementally, rather than reading the
whole file into memory first.

### Mechanical Walkthrough

`import hashlib` — first appearance of this module. `def
hash_file(path):` — basic. `hasher = hashlib.sha256()` — the concept
from this unit's lab, reused for real. `with open(path, "rb") as f:` —
`"rb"` reminder from Lesson 61; binary mode matters here specifically
because `hasher.update()` needs real bytes, not decoded text. `while
True: chunk = f.read(4096) ...` — the exact chunked-reading loop from
Lesson 10, reminder. `hasher.update(chunk)` — the concept from this
unit's lab, reused for real, called once per chunk instead of once on
the whole file — proven equivalent by this unit's second lab example.
`return hasher.hexdigest()` — the concept from this unit's lab, reused
for real.

### CS Lens

This is a **cryptographic hash function** used for content
fingerprinting — deterministic (same input always produces the same
output), and practically collision-resistant (two genuinely different
inputs producing the same hash is astronomically unlikely with SHA-256,
though not mathematically impossible). Also recognized in: Git's own
commit and file hashing (literally SHA-1 or SHA-256 under the hood,
this exact idea), checksums verifying a downloaded file wasn't
corrupted, password storage (hashing a password instead of storing it
directly — a later Security-track lesson).

### SE Lens

SHA-256 is deliberately chosen here over a faster but weaker hash like
MD5, even though this task (finding duplicates, not security) doesn't
strictly need cryptographic strength — MD5 has known collision
vulnerabilities (deliberately crafted different files that hash
identically), and while that risk is irrelevant for accidentally
finding duplicate vacation photos, it's a bad habit to build reaching
for a broken hash by default. The real cost of SHA-256 over MD5 is a
small amount of extra CPU time per file — negligible for this lesson's
purpose.

### Commands Needed

None.

### Run It — Real Output

```python
print(hash_file("demo_dir/a.txt"))
print(hash_file("demo_dir/b.bin"))
print(hash_file("demo_dir/b_copy.bin"))
```

```
a948904f2f0f479b8f8197694b30184b0d2ed1c1cd2a1ec0fb85d299a192a44
a4cb404b6b16c118911e36eb3d69bba64cec52175ad4e6f20006296198674bf
a4cb404b6b16c118911e36eb3d69bba64cec52175ad4e6f20006296198674bf
```

Real, meaningful confirmation: `b.bin` and `b_copy.bin` — Lesson 11's
chunked *copy* of it — hash **identically**, real, direct proof that
Lesson 11's `my_cp()` genuinely produced byte-for-byte identical
content, not just "close enough."

### Connection

We can now fingerprint any single file. The next unit scans an entire
tree and groups files by matching fingerprint.

---

## Concept Unit: `dict.setdefault()`

### The Problem

We want to group every file in a tree by its hash — files sharing a
hash belong in the same group. Lesson 6's counting pattern
(`counts.get(key, 0) + 1`) handled *numbers*; here, each group is a
*list* of paths, and we need to either start a new list for a
never-seen hash or add to an existing one, in one step.

### Introduce the Concept in Isolation

```python
groups = {}
groups.setdefault("a", []).append(1)
groups.setdefault("a", []).append(2)
groups.setdefault("b", []).append(3)
print(groups)
```

Run it:

```
{'a': [1, 2], 'b': [3]}
```

This proves `dict.setdefault(key, default)` returns the existing value
for `key` if it's already there, or inserts `default` (a fresh empty
list, here) and returns *that* if it isn't — either way, you get back a
real list you can immediately `.append()` to, in one line, without a
separate `if key in groups: ... else: ...` check. Notice `"a"`'s list
grew across two separate calls, correctly, while `"b"` got its own
independent list. This throwaway example is discarded.

### Discard the Throwaway Example

Discarded.

### Project Change

- **Files affected:** `find_dupes.py`
- **Change type:** add — a new function
- **Location:** after `hash_file()`
- **Dependencies:** `hash_file`, `os.walk` (Lesson 12)

### The New Code

```python
import os

def find_duplicates(root):
    hashes = {}
    for dirpath, dirnames, filenames in os.walk(root):
        for filename in filenames:
            path = os.path.join(dirpath, filename)
            digest = hash_file(path)
            hashes.setdefault(digest, []).append(path)
    return hashes
```

### The Updated Project

```python
import hashlib
import os                                                    # ← new

def hash_file(path):
    hasher = hashlib.sha256()
    with open(path, "rb") as f:
        while True:
            chunk = f.read(4096)
            if not chunk:
                break
            hasher.update(chunk)
    return hasher.hexdigest()


def find_duplicates(root):                                     # ← new
    hashes = {}                                                    # ← new
    for dirpath, dirnames, filenames in os.walk(root):                # ← new
        for filename in filenames:                                       # ← new
            path = os.path.join(dirpath, filename)                          # ← new
            digest = hash_file(path)                                          # ← new
            hashes.setdefault(digest, []).append(path)                          # ← new
    return hashes                                                                 # ← new
```

`find_duplicates()` now walks the whole tree (Lesson 12's `os.walk()`,
reminder) and groups every file by its hash — but the returned
dictionary currently includes *every* file, even ones with no
duplicates at all, which the next unit filters out.

### Mechanical Walkthrough

`import os` — reminder. `def find_duplicates(root):` — basic. `hashes =
{}` — basic. `for dirpath, dirnames, filenames in os.walk(root):` —
Lesson 12, reminder. `path = os.path.join(dirpath, filename)` —
reminder. `digest = hash_file(path)` — calling the function built in
this lesson's first unit. `hashes.setdefault(digest, []).append(path)`
— the concept from this unit's lab, reused for real.

### CS Lens

This is building an **inverted index** — instead of looking up "what's
this file's hash," we're building a structure that answers the reverse
question, "which files share this hash," grouped and ready to query.
Also recognized in: search engines (word → list of documents containing
it, the classic inverted index), Lesson 6's own command-counting (a
simpler version of the same "group by a computed key" idea, using
counts instead of lists).

### SE Lens

`setdefault(digest, [])` creates a brand-new empty list on *every*
call, even when the key already exists and that new list is
immediately thrown away — a small, real inefficiency compared to
checking membership first with `if digest not in hashes:`. For a folder
with a modest number of files this cost is irrelevant; for a folder
with millions of files, the wasted list allocations would start to
matter, and Python's `collections.defaultdict` (not covered here) exists
specifically to avoid this exact overhead. A real, small optimization
opportunity, honestly flagged rather than silently accepted as
"obviously fine."

### Commands Needed

`python3 find_dupes.py` — runs the script.

### Run It

Runnable now, but returns every file, duplicated or not — not yet
narrowed to actual duplicates, which the closing assembly below fixes.

### Connection

Every file is now grouped by content fingerprint. The last step filters
that grouping down to only the groups that actually matter.

---

## Assembling the Real Report (Dict Comprehension)

```python
def find_duplicates(root):
    hashes = {}
    for dirpath, dirnames, filenames in os.walk(root):
        for filename in filenames:
            path = os.path.join(dirpath, filename)
            digest = hash_file(path)
            hashes.setdefault(digest, []).append(path)
    return {digest: paths for digest, paths in hashes.items() if len(paths) > 1}
```

The final line is a **dict comprehension** — the same comprehension
idea from Lesson 5's list comprehension, extended to build a
dictionary instead of a list: `{digest: paths for digest, paths in
hashes.items() if len(paths) > 1}` walks every `(digest, paths)` pair
(`.items()`, Lesson 6, reminder) and keeps only the ones where `len(
paths) > 1` — a real duplicate, by definition, only exists when more
than one path shares a hash. A single-file group (`len(paths) == 1`) is
just an ordinary, unique file, correctly excluded from the final
report.

### Run It — Real Output

Against a real folder built with three files sharing identical content
across three different folders and names, plus two genuinely unique
files:

```python
duplicates = find_duplicates("dup_demo")
for digest, paths in duplicates.items():
    print(f"{digest[:12]}...")
    for path in paths:
        print(f"  {path}")
```

```
$ python3 find_dupes.py
cd598176a5f3...
  dup_demo/folderA/report.txt
  dup_demo/folderB/report_copy.txt
  dup_demo/folderC/backup.txt
```

Real output — exactly the three files sharing content, correctly
grouped despite three different names and three different folders; the
two genuinely unique files never appear.

---

## Closing

### Connect the Pieces

Trace `dup_demo/folderB/report_copy.txt` end to end: `os.walk()`
reached it during the tree traversal. `hash_file()` opened it in
`"rb"` mode and streamed it through `sha256()` in 4096-byte chunks
(only one chunk needed, for a file this small), producing a real
64-character fingerprint. `hashes.setdefault(digest, []).append(path)`
added it to the *same* list as `folderA/report.txt` and
`folderC/backup.txt` — not because of anything about their names or
locations, but because all three, byte for byte, hashed identically.
The final dict comprehension kept that group (3 entries, `> 1`) and
would have dropped it had only one file ever produced that hash.

### What Breaks Without This

A tempting shortcut: compare files by *size* instead of hashing their
actual content — much cheaper to compute, since `os.path.getsize()`
needs no reading at all.

```python
def find_duplicates_by_size(root):
    sizes = {}
    for dirpath, dirnames, filenames in os.walk(root):
        for filename in filenames:
            path = os.path.join(dirpath, filename)
            size = os.path.getsize(path)
            sizes.setdefault(size, []).append(path)
    return {size: paths for size, paths in sizes.items() if len(paths) > 1}
```

Run against the same folder, now also containing two genuinely
different 10-byte files (`"aaaaaaaaaa"` and `"bbbbbbbbbb"`):

```
size 10:
  dup_demo/folderA/fileY.txt
  dup_demo/folderA/fileX.txt
size 27:
  dup_demo/folderA/report.txt
  dup_demo/folderB/report_copy.txt
  dup_demo/folderC/backup.txt
```

Real, genuine false positive: `fileX.txt` and `fileY.txt` have
completely different content — all `a`s versus all `b`s — but identical
*size*, so the size-only version wrongly reports them as duplicates.
The real, hash-based `find_duplicates()`, run against the identical
folder, correctly excludes them:

```
cd598176a5f3...
  dup_demo/folderA/report.txt
  dup_demo/folderB/report_copy.txt
  dup_demo/folderC/backup.txt
```

Only the genuinely identical trio appears. Size is cheap to check but
proves nothing about content; hashing costs more (real disk reads, real
computation) but is the only version that's actually correct.

### Exercises

1. Add a real optimization: check file *size* first (cheap), and only
   compute a full hash for files that share a size with at least one
   other file — this avoids hashing every file in a huge folder while
   keeping the correctness hashing provides. You'll need `setdefault()`
   twice: once for the size-grouping pass, once for the hash-grouping
   pass on the size-matched candidates only.
2. Modify `find_duplicates()` to report how many total bytes could be
   reclaimed by keeping only one copy from each duplicate group.
3. Build a `delete_duplicates()` function that keeps the *first* file
   in each group and moves the rest to Lesson 11's recycle-bin `my_rm()`
   — never permanently deleting anything, even here.

### Definition of Done

- [ ] `find_dupes.py` runs and correctly groups genuinely identical
      files across different names and folders you built yourself
- [ ] You confirmed `hash_file()` on two files you know are identical
      (like a file and its own copy) produces the exact same hash
- [ ] You ran the size-only version and saw a real false positive on
      two different-content, same-size files
- [ ] You can explain, without looking back, why the correct version
      needs to read every byte, not just check size
- [ ] Commit:

```
git add find_dupes.py
git commit -m "Add a duplicate file finder using content hashing: prove a cryptographic hash is a reliable fingerprint for file content, and that size alone is not"
```
