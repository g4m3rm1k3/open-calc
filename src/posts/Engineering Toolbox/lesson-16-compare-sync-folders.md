# Lesson 16: Same Relative Path, Two Different Roots
### (Compare Two Folders / Sync Two Directories)

**What you will build.** `compare_folders(a, b)` — reporting files
unique to each side and files that exist in both but differ in content
— and `sync_folders(source, dest)`, which copies whatever's missing or
different from `source` into `dest`. The working feature is small. The
transferable problem underneath: comparing two folders isn't about
comparing *absolute* paths — `backup_a/docs/notes.txt` and
`backup_b/docs/notes.txt` are different strings but the "same file" in
the comparison that matters. Everything in this lesson turns on
stripping each root off first, so both trees get compared on equal,
relative terms.

**What you need to know first.** From Lesson 12: `os.walk()`. From
Lesson 13: `hash_file()`, content-based comparison. From Lesson 14: `set`
difference/intersection. From Lesson 15: `shutil`. New in this lesson:
`os.path.relpath()`, `os.path.dirname()`, and `shutil.copy2()`.

No pipeline diagram — not part of an established multi-stage pipeline.

---

## Concept Unit: `os.path.relpath()`

### The Problem

Lesson 14's set-based diffing compared paths directly — but that only
worked because both snapshots came from the *same* root folder. Here,
`backup_a/docs/notes.txt` and `backup_b/docs/notes.txt` need to be
recognized as "the same file" for comparison purposes, even though
they're different strings and live under different roots.

### Introduce the Concept in Isolation

```python
import os
full = "/home/claude/backup_a/docs/notes.txt"
root = "/home/claude/backup_a"
print(os.path.relpath(full, root))
```

Run it:

```
docs/notes.txt
```

This proves `os.path.relpath(path, start)` strips the `start` prefix
off, leaving just the part that describes *where inside that root* the
file lives — the piece that's genuinely comparable between two
different trees, regardless of where each tree happens to sit on disk.
This throwaway example is discarded.

### Discard the Throwaway Example

Discarded.

### Project Change

- **Files affected:** `folder_sync.py` (new file)
- **Change type:** create
- **Location:** top of the file — nothing exists yet
- **Dependencies:** `os` module

### The New Code

```python
import os

def relative_snapshot(root):
    paths = set()
    for dirpath, dirnames, filenames in os.walk(root):
        for filename in filenames:
            full_path = os.path.join(dirpath, filename)
            rel_path = os.path.relpath(full_path, root)
            paths.add(rel_path)
    return paths
```

### The Updated Project

This is the entire file so far:

```python
import os

def relative_snapshot(root):
    paths = set()
    for dirpath, dirnames, filenames in os.walk(root):
        for filename in filenames:
            full_path = os.path.join(dirpath, filename)
            rel_path = os.path.relpath(full_path, root)
            paths.add(rel_path)
    return paths
```

`relative_snapshot()` walks a folder (Lesson 12's `os.walk()`, reminder)
and returns a `set` of every file's path *relative to that root* —
meaning calling this on two completely different folders produces two
sets that are genuinely comparable to each other.

### Mechanical Walkthrough

`import os` — reminder. `def relative_snapshot(root):` — basic. `paths
= set()` — first appearance of building a `set` from scratch (Lesson
14 only ever built sets *from* existing dicts via `set(some_dict)`) —
`set()` with no arguments creates an empty one, ready for `.add()`.
`for dirpath, dirnames, filenames in os.walk(root):`, `full_path =
os.path.join(dirpath, filename)` — Lesson 12, reminder. `rel_path =
os.path.relpath(full_path, root)` — the concept from this unit's lab,
reused for real. `paths.add(rel_path)` — first appearance of `.add()`
on a `set` — the set equivalent of a list's `.append()`, adding one
item; unlike a list, adding the same value twice has no effect — a set
never holds duplicates.

### CS Lens

Not new beyond sets themselves, already introduced in Lesson 14 —
skipped per the Stopping Rule; this unit's own new piece was
`relpath()`, this unit's lab.

### SE Lens

Building the comparison on *relative* paths, rather than comparing
absolute paths directly, is what makes `compare_folders()` genuinely
reusable — it works identically whether you're comparing two folders
sitting next to each other, or a local folder against something mounted
from a completely different location. Absolute-path comparison would
only ever "work" by accident, if both trees happened to share the same
folder depth and naming.

### Commands Needed

None.

### Run It

Not runnable for a meaningful comparison yet — one snapshot alone has
nothing to compare against, same limitation Lesson 14 started with.

### Connection

We can now snapshot any folder in a comparable, root-independent way.
The next unit compares two such snapshots.

---

## Concept Unit: Comparing Two Trees

### The Problem

With two relative-path snapshots in hand, we need three real answers:
what exists only in the first folder, what exists only in the second,
and — for paths present in *both* — which ones actually have different
content.

### Project Change

- **Files affected:** `folder_sync.py`
- **Change type:** add — a new function
- **Location:** after `relative_snapshot()`
- **Dependencies:** `relative_snapshot`, Lesson 13's `hash_file()`

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


def compare_folders(source, dest):
    source_paths = relative_snapshot(source)
    dest_paths = relative_snapshot(dest)
    only_in_source = source_paths - dest_paths
    only_in_dest = dest_paths - source_paths
    common = source_paths & dest_paths
    differing = {
        p for p in common
        if hash_file(os.path.join(source, p)) != hash_file(os.path.join(dest, p))
    }
    return only_in_source, only_in_dest, differing
```

### The Updated Project

```python
import os
import hashlib                                                       # ← new

def relative_snapshot(root):
    paths = set()
    for dirpath, dirnames, filenames in os.walk(root):
        for filename in filenames:
            full_path = os.path.join(dirpath, filename)
            rel_path = os.path.relpath(full_path, root)
            paths.add(rel_path)
    return paths


def hash_file(path):                                                   # ← new
    hasher = hashlib.sha256()                                              # ← new
    with open(path, "rb") as f:                                              # ← new
        while True:                                                            # ← new
            chunk = f.read(4096)                                                  # ← new
            if not chunk:                                                           # ← new
                break                                                                  # ← new
            hasher.update(chunk)                                                        # ← new
    return hasher.hexdigest()                                                             # ← new


def compare_folders(source, dest):                                                          # ← new
    source_paths = relative_snapshot(source)                                                   # ← new
    dest_paths = relative_snapshot(dest)                                                          # ← new
    only_in_source = source_paths - dest_paths                                                       # ← new
    only_in_dest = dest_paths - source_paths                                                            # ← new
    common = source_paths & dest_paths                                                                    # ← new
    differing = {                                                                                            # ← new
        p for p in common                                                                                       # ← new
        if hash_file(os.path.join(source, p)) != hash_file(os.path.join(dest, p))                                  # ← new
    }                                                                                                                # ← new
    return only_in_source, only_in_dest, differing                                                                     # ← new
```

`compare_folders()` is now complete: it correctly reports what's unique
to each side and what's genuinely different in content between the two,
by relative path.

### Mechanical Walkthrough

`hash_file()` — Lesson 13, reminder, unchanged. `source_paths =
relative_snapshot(source)`, `dest_paths = relative_snapshot(dest)` —
calling this lesson's first unit's function on two real, different
roots. `only_in_source = source_paths - dest_paths`, `only_in_dest =
dest_paths - source_paths`, `common = source_paths & dest_paths` —
Lesson 14's set operations, reminder, now comparing two genuinely
different trees instead of two snapshots of the *same* tree at
different times. `differing = {p for p in common if hash_file(...) !=
hash_file(...)}` — a set comprehension (Lesson 14, reminder) combining
`common` with `hash_file()` — for every path both trees share, comparing
their real content, not just their names.

### CS Lens

Not new — skipped per the Stopping Rule; every individual piece here
was already covered.

### SE Lens

Using content hashing (Lesson 13) rather than timestamp comparison
(Lesson 14's approach) to detect "differing" files is a deliberate,
different tradeoff here than the watcher made: a folder sync tool needs
to be *correct* about whether content actually differs — copying an
unchanged file because its timestamp merely looked different would
waste real time and bandwidth on a large sync; hashing costs more CPU
per file but gives a trustworthy answer.

### Commands Needed

None new.

### Run It — Real Output

Against two real folders — one file identical in both, one file with
genuinely different content in each, and one file unique to each side:

```python
only_a, only_b, differing = compare_folders("backup_a", "backup_b")
print("only in A:", only_a)
print("only in B:", only_b)
print("differing:", differing)
```

```
only in A: {'only_a.txt'}
only in B: {'only_b.txt'}
differing: {'docs/changed.txt'}
```

Real output — all three categories correctly identified; `shared.txt`,
present and identical in both, correctly appears in none of them.

### Connection

We can now correctly compare two trees. The last unit uses that
comparison to actually bring one folder in line with another.

---

## Concept Unit: `shutil.copy2()`

### The Problem

Comparing is only half the job — syncing means actually copying
whatever's missing or different from `source` into `dest`. Lesson
11/15 already have copying tools (`my_cp()`, `shutil.move()`), but a
backup tool specifically benefits from preserving each file's original
modification time, not stamping it with "when the sync ran."

### Introduce the Concept in Isolation

```python
import shutil
import os

with open("copy2_src.txt", "w") as f:
    f.write("hello")
os.utime("copy2_src.txt", (1000000000, 1000000000))

shutil.copy("copy2_src.txt", "copy2_plain.txt")
shutil.copy2("copy2_src.txt", "copy2_with_meta.txt")

print("source mtime:     ", os.path.getmtime("copy2_src.txt"))
print("plain copy mtime: ", os.path.getmtime("copy2_plain.txt"))
print("copy2 mtime:      ", os.path.getmtime("copy2_with_meta.txt"))
```

Run it (`os.utime()` here just forces the source file's timestamp to a
known, fixed value for a clean comparison — not part of the real
project, purely test scaffolding):

```
source mtime:      1000000000.0
plain copy mtime:  1784586925.4975662
copy2 mtime:       1000000000.0
```

This proves a real, meaningful difference: `shutil.copy()` (a plain
content copy — conceptually Lesson 11's `my_cp()`) stamps the new file
with the time *the copy happened*; `shutil.copy2()` preserves the
*original* file's modification time on the copy. For a backup tool,
that difference matters — you want the backup to reflect when the
content was actually last changed, not when you happened to run the
sync. This throwaway example is discarded.

### Discard the Throwaway Example

Discarded.

### Project Change

- **Files affected:** `folder_sync.py`
- **Change type:** add — a new function
- **Location:** after `compare_folders()`
- **Dependencies:** `compare_folders`, `shutil`

### The New Code

```python
import shutil

def sync_folders(source, dest):
    only_in_source, only_in_dest, differing = compare_folders(source, dest)
    for rel_path in only_in_source | differing:
        src_path = os.path.join(source, rel_path)
        dst_path = os.path.join(dest, rel_path)
        os.makedirs(os.path.dirname(dst_path), exist_ok=True)
        shutil.copy2(src_path, dst_path)
        print(f"copied {rel_path}")
```

### The Updated Project

```python
import os
import hashlib
import shutil                                                        # ← new

# ...relative_snapshot(), hash_file(), compare_folders() unchanged above...

def sync_folders(source, dest):                                        # ← new
    only_in_source, only_in_dest, differing = compare_folders(source, dest)  # ← new
    for rel_path in only_in_source | differing:                              # ← new
        src_path = os.path.join(source, rel_path)                              # ← new
        dst_path = os.path.join(dest, rel_path)                                  # ← new
        os.makedirs(os.path.dirname(dst_path), exist_ok=True)                      # ← new
        shutil.copy2(src_path, dst_path)                                             # ← new
        print(f"copied {rel_path}")                                                    # ← new
```

`folder_sync.py` is now complete: `sync_folders()` copies every file
that's missing from `dest` or genuinely different, preserving each
one's original timestamp — a real, working one-way sync.

### Mechanical Walkthrough

`only_in_source | differing` — first appearance of `|`, set **union**:
combining two sets into one containing everything from either —
exactly the two categories that actually need copying (files only in
`source`, and files that exist in both but differ). `os.makedirs(
os.path.dirname(dst_path), exist_ok=True)` — `os.path.dirname()` — a
small, self-explanatory `os.path` function (same family as `basename`,
`expanduser` — returns everything *except* the final filename) — needed
here because a file nested in a subfolder that doesn't yet exist in
`dest` needs that subfolder created first; `exist_ok=True` (Lesson 11,
reminder) makes this safe even when it already exists. `shutil.copy2(
src_path, dst_path)` — the concept from this unit's lab, reused for
real.

### CS Lens

`|` (union), alongside `-` (difference, Lesson 14) and `&`
(intersection, Lesson 14), completes the basic set of set operations
this curriculum uses — the same three operations from mathematical set
theory, directly available as Python operators.

### SE Lens

This is a **one-way** sync, deliberately: it only ever adds or updates
files in `dest` to match `source` — it never deletes anything from
`dest` that isn't in `source` (`only_in_dest` is computed by
`compare_folders()` but never acted on here). That's a real, safer
default for a backup tool: accidentally *adding* a file nobody asked
for is a minor annoyance; accidentally *deleting* something because
`sync_folders()` misjudged what "extra" meant would be a genuinely
serious bug in a tool people trust with backups.

### Commands Needed

`python3 folder_sync.py` — runs the script.

### Run It — Real Output

```python
sync_folders("backup_a", "backup_b")
```

```
$ python3 folder_sync.py
copied only_a.txt
copied docs/changed.txt
```

Confirmed by checking `backup_b` afterward — `only_a.txt` now exists
there, and `docs/changed.txt`'s content now matches `backup_a`'s
version (`"version one"`), while `only_b.txt` (never in `source`) was
correctly left untouched, exactly matching this unit's one-way-sync
design.

### Connection

`sync_folders()` genuinely works for the ordinary case. The closing
section shows a real, structural failure mode it doesn't handle.

---

## Closing

### Connect the Pieces

Trace `docs/changed.txt` end to end: `relative_snapshot()` found it in
both `backup_a` and `backup_b`, so it landed in `common`, not
`only_in_source` or `only_in_dest`. The set comprehension hashed both
real copies — genuinely different content (`"version one"` versus
`"version TWO"`) — producing different hashes, so it landed in
`differing`. `sync_folders()`'s `only_in_source | differing` union
included it; `shutil.copy2()` overwrote `backup_b`'s version with
`backup_a`'s, preserving `backup_a`'s original timestamp rather than
stamping "now."

### What Breaks Without This

A genuinely interesting failure — not a crash, something arguably
worse: a **type conflict**, where the same relative path is a plain
file in one tree and a folder in the other.

```
conflict_a/conflict          (a file)
conflict_b/conflict/inner.txt  (conflict_b/conflict is a folder)
```

Running `sync_folders("conflict_a", "conflict_b")`:

```
copied conflict
```

No error at all — which is exactly the problem. Checking what actually
happened:

```
conflict_b/conflict/          (still a folder, untouched)
conflict_b/conflict/inner.txt   (still there, untouched)
conflict_b/conflict/conflict    (the new file — landed INSIDE the folder)
```

`shutil.copy2()`, when its destination path is an existing *directory*,
doesn't error and doesn't replace it — it copies the source file
*into* that directory, using the source's own filename. `dst_path` was
supposed to mean "put the file exactly here"; instead, the file ended
up nested one level deeper than intended, and `conflict_b/conflict` is
now still a directory, silently structurally different from
`conflict_a/conflict`, which is a plain file. `compare_folders()`,
run again after this "successful" sync, would report `conflict` as
still differing — because it genuinely still is, just not in the way
anyone watching the "copied conflict" message would have guessed.

### Exercises

1. Fix the type-conflict case: before calling `shutil.copy2()`, check
   whether `dst_path` already exists *and* is a directory
   (`os.path.isdir()`, Lesson 7) when the source is a plain file — if
   so, remove the conflicting directory first (carefully — reuse
   Lesson 11's recycle-bin `my_rm()` rather than a permanent delete)
   before copying.
2. Add real deletion support: a `mirror=True` parameter that, when set,
   also removes `only_in_dest` files — using Lesson 11's `my_rm()`, not
   a permanent delete, given this unit's SE Lens about the real danger
   of automated deletion.
3. Run `compare_folders()` again immediately after a `sync_folders()`
   call — in the non-conflicting case, confirm `only_in_source` and
   `differing` are now both empty, proving the sync actually worked;
   in the conflict case, confirm `conflict` still shows up as
   differing, proving the "successful" sync didn't actually fix it.

### Definition of Done

- [ ] `folder_sync.py` runs; `compare_folders()` correctly identifies
      unique and differing files across two real folders you built
- [ ] `sync_folders()` correctly brings a destination folder in line
      with a source, confirmed by re-running `compare_folders()`
      afterward and seeing empty results
- [ ] You triggered the real file/directory type-conflict case and
      understand why it produced a silent, structural inconsistency
      instead of an error
- [ ] You can explain, without looking back, why this sync is one-way
      by design, and what real risk making it two-way (or deleting)
      would introduce
- [ ] Commit:

```
git add folder_sync.py
git commit -m "Add folder compare/sync: prove relative paths make two different trees comparable, and that a 'successful' sync can still be silently wrong when a path's type differs between source and destination"
```
