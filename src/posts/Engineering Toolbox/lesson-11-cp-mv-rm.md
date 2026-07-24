# Lesson 11: Moving Data Is Not the Same as Moving a Name
### (Build Your Own `cp` / `mv` / `rm`, Recycle-Bin Style)

**What you will build.** Three small functions: `my_cp()`, which
actually copies a file's bytes to a new location; `my_mv()`, which
relocates a file; and `my_rm()`, which doesn't delete anything at all —
it moves the file into a trash folder instead, safely, even if
something else in the trash already has the same name. The working
feature is small. The transferable problem underneath is a real
distinction most people never think about: **copying and moving are
fundamentally different operations**, not the same thing at different
speeds — copying genuinely duplicates a file's bytes; moving, when
possible, just relabels where an existing set of bytes lives, without
touching the bytes at all. That difference is *why* `mv` is
near-instant on a multi-gigabyte file while `cp` isn't, and it's also
exactly where `mv` can fail in a way `cp` never does.

**What you need to know first.** From Lesson 10: reading a file in
chunks with a `while` loop. From Lessons 2 and 8: `os.path.join()`,
`os.path.exists()`. New in this lesson: opening a file for *writing*
(`"wb"` mode, `.write()`), `os.rename()`, `os.makedirs()`, and
`os.path.splitext()`.

No pipeline diagram — not part of an established multi-stage pipeline.

---

## Concept Unit: Writing to a File

### The Problem

Every lesson so far has only ever *read* files. To copy one, we need to
create a brand-new file and put real bytes into it — writing, not
reading, for the first time in this curriculum.

### Introduce the Concept in Isolation

```python
with open("write_test.txt", "wb") as f:
    f.write(b"hello, binary world")

with open("write_test.txt", "rb") as f:
    print(f.read())
```

Run it:

```
b'hello, binary world'
```

This proves `"wb"` mode (write, binary — the write-mode sibling of
Lesson 61's `"rb"`) opens a file for writing raw bytes, creating it if
it doesn't exist or replacing its contents entirely if it does; `.write(
bytes)` then actually puts those bytes into the file. Reading it back
afterward, in `"rb"` mode, confirms exactly what was written is exactly
what comes back. This throwaway example is discarded.

### Discard the Throwaway Example

Discarded.

### Project Change

- **Files affected:** `file_tools.py` (new file)
- **Change type:** create
- **Location:** top of the file — nothing exists yet
- **Dependencies:** `os` module

### The New Code

```python
import os

def my_cp(src, dst):
    with open(src, "rb") as source, open(dst, "wb") as dest:
```

### The Updated Project

```python
import os

def my_cp(src, dst):                                       # ← new
    with open(src, "rb") as source, open(dst, "wb") as dest:  # ← new
```

The function now opens the source file for reading and the destination
for writing, both at once — but copies nothing between them yet.

### Mechanical Walkthrough
- `import os` — reminder.
- `def my_cp(src, dst):` — basic.
- `with open(src, "rb") as source, open(dst, "wb") as dest:` — first appearance of a

`with` statement managing **two** resources in one line, separated by a
- comma — both `source` and `dest` are guaranteed closed when the block
ends, exactly the same guarantee Lesson 1's single-resource `with`
- already established, just extended to two at once.
- `"rb"` — reminder from Lesson 61.
- `"wb"` — the concept from this unit's lab, reused for

real.

### CS Lens

Not new beyond file I/O already covered — skipped per the Stopping
Rule; the write-mode concept was this unit's own lab.

### SE Lens

Opening both files in one `with` statement, rather than two nested
separate `with` blocks, is a real but small readability choice — both
achieve identical guaranteed-cleanup behavior; the combined form just
keeps two closely-related resources visually paired at the same
indentation level instead of nesting one inside the other.

### Commands Needed

None.

### Run It

Not runnable for meaningful output — nothing is transferred between
`source` and `dest` yet.

### Connection

We can now write files, not just read them. The next unit actually
moves data from one to the other.

---

## Concept Unit: Chunked Copy (Reusing Lesson 10's Streaming Pattern)

### The Problem

We have a readable source and a writable destination. Now we need to
actually move the bytes across — and, per Lesson 10's lesson, without
assuming the whole file fits comfortably in memory at once.

### Project Change

- **Files affected:** `file_tools.py`
- **Change type:** add — completes `my_cp`
- **Location:** inside the `with` block
- **Dependencies:** `source`, `dest`

### The New Code

```python
while True:
    chunk = source.read(4096)
    if not chunk:
        break
    dest.write(chunk)
```

### The Updated Project

```python
import os

def my_cp(src, dst):
    with open(src, "rb") as source, open(dst, "wb") as dest:
        while True:                        # ← new
            chunk = source.read(4096)         # ← new
            if not chunk:                        # ← new
                break                                # ← new
            dest.write(chunk)                          # ← new
```

`my_cp()` is now complete: it streams a file from `src` to `dst` in
bounded 4096-byte pieces, the exact loop shape from Lesson 10, now
paired with a `.write()` on the far end instead of a `print()`.

### Mechanical Walkthrough
- `while True:`, `chunk = source.read(4096)`, `if not chunk: break` — all
direct reminders of Lesson 10's `cat_file()`, unchanged in shape.
- `dest.write(chunk)` — the concept from the previous unit's lab, reused
for real, writing each chunk out immediately after reading it rather
than accumulating them.

### CS Lens

Not new — this is Lesson 10's streaming concept, reapplied — skipped
per the Stopping Rule.

### SE Lens

Streaming the copy, chunk by chunk, rather than `source.read()` (whole
file) followed by one `dest.write()` of everything at once, means
`my_cp()`'s memory use stays flat regardless of file size — identical
reasoning to Lesson 10, now demonstrated on the write side too.

### Commands Needed

`python3 file_tools.py` — once there's something to run.

### Run It — Real Output

```python
my_cp("demo_dir/b.bin", "demo_dir/b_copy.bin")
```

Confirmed byte-identical to the original via `diff`:

```
$ diff demo_dir/b.bin demo_dir/b_copy.bin && echo IDENTICAL
IDENTICAL
```

Real, verified — a real 5000-byte file, copied in five 4096-byte-or-
smaller chunks, reconstructed exactly.

### Connection

`my_cp()` is done and genuinely correct. The next unit builds `my_mv()`
— and shows why it isn't just "copy, then delete the original."

---

## Concept Unit: `os.rename()`

### The Problem

Moving a file *could* be implemented as "copy it, then delete the
original" — and that would work. But real `mv` on a large file is
usually instant, while `cp` on the same file visibly takes time. If
moving were really copy-then-delete, both would take the same time.
Something else is happening.

### Introduce the Concept in Isolation

```python
with open("move_me.txt", "w") as f:
    f.write("movable")

import os
os.rename("move_me.txt", "moved.txt")
print(os.path.exists("move_me.txt"))
print(os.path.exists("moved.txt"))
```

Run it:

```
False
True
```

This proves `os.rename()` moves a file without any visible copying step
at all — no chunked reading, no writing, just the old path stops
existing and the new one instantly does. This throwaway example is
discarded.

### Discard the Throwaway Example

Discarded.

### Project Change

- **Files affected:** `file_tools.py`
- **Change type:** add — a new function
- **Location:** after `my_cp`
- **Dependencies:** `os`

### The New Code

```python
def my_mv(src, dst):
    os.rename(src, dst)
```

### The Updated Project

```python
import os

def my_cp(src, dst):
    with open(src, "rb") as source, open(dst, "wb") as dest:
        while True:
            chunk = source.read(4096)
            if not chunk:
                break
            dest.write(chunk)


def my_mv(src, dst):          # ← new
    os.rename(src, dst)          # ← new
```

`my_mv()` is complete, and dramatically simpler than `my_cp()` — one
line, no chunking, no streaming — because it's doing fundamentally less
work, per this unit's CS Lens.

### Mechanical Walkthrough
- `def my_mv(src, dst):` — basic.
- `os.rename(src, dst)` — the concept
from this unit's lab, reused for real.

### CS Lens

This is the real reason `mv` is fast: a file's actual bytes on disk are
tracked separately from the human-readable name and folder location
pointing at them (that underlying record is called an **inode**, on
Unix-like systems — not covered in depth here, but worth naming).
`os.rename()`, when source and destination are on the same filesystem,
only updates *which name points at which inode* — the bytes on disk
never move at all. `my_cp()`, by contrast, genuinely reads and rewrites
every byte, because copying, by definition, needs to exist as two
separate sets of bytes afterward. Also recognized in: hard links (two
different names pointing at the identical inode, no lesson here, but
the same underlying mechanism), Git's own object storage (renaming a
tracked file is cheap for a related reason — content is stored by hash,
independent of its current name).

### SE Lens

This efficiency has a real, sharp edge: `os.rename()` can only relabel
an inode within the *same filesystem* — the very next unit shows what
happens when source and destination live on genuinely different disks
or filesystems, where no shared inode table exists to simply repoint.

### Commands Needed

None new.

### Run It

Shown above — real, instant, no chunking involved.

### Connection

`my_mv()` works — on the same filesystem. The closing section shows
exactly what happens when it isn't, and why that's not a bug in this
code, but a genuine limit of what "just relabel it" can do.

---

## Concept Unit: `os.makedirs()`, `os.path.splitext()`, and the Recycle Bin

### The Problem

`my_rm()` shouldn't delete anything — it should move the target into a
trash folder instead, recoverable later. That trash folder might not
exist yet the first time this runs, and two different files sharing the
same name (from two different folders) would otherwise silently
overwrite each other once both land in the same trash folder.

### Introduce the Concept in Isolation

```python
import os
os.makedirs("test_makedirs/a/b/c")
print("created")
os.makedirs("test_makedirs/a/b/c", exist_ok=True)
print("ran again with exist_ok, no crash")
```

Run it:

```
created
ran again with exist_ok, no crash
```

This proves `os.makedirs()` creates a full nested folder path in one
call (unlike a hypothetical single-level `os.mkdir()`, not used here),
and `exist_ok=True` is what stops it from raising an error the second
time it's asked to create something already there — without that flag,
calling it twice on the same path crashes.

```python
counter = 1
print(os.path.splitext("notes.txt"))
```

```
('notes', '.txt')
```

`os.path.splitext()` splits a filename into its base and extension —
the piece we'll need to insert `" (1)"` before the extension, not after
it, matching how real file managers rename duplicates. This throwaway
example is discarded.

### Discard the Throwaway Example

Discarded.

### Project Change

- **Files affected:** `file_tools.py`
- **Change type:** add — two new functions
- **Location:** after `my_mv`
- **Dependencies:** `os`

### The New Code

```python
TRASH_DIR = os.path.expanduser("~/.my_trash")

def unique_path(path):
    if not os.path.exists(path):
        return path
    base, ext = os.path.splitext(path)
    counter = 1
    while True:
        candidate = f"{base} ({counter}){ext}"
        if not os.path.exists(candidate):
            return candidate
        counter += 1


def my_rm(path):
    os.makedirs(TRASH_DIR, exist_ok=True)
    filename = os.path.basename(path)
    destination = unique_path(os.path.join(TRASH_DIR, filename))
    os.rename(path, destination)
    print(f"moved {path} -> {destination}")
```

### The Updated Project

```python
import os

def my_cp(src, dst):
    with open(src, "rb") as source, open(dst, "wb") as dest:
        while True:
            chunk = source.read(4096)
            if not chunk:
                break
            dest.write(chunk)


def my_mv(src, dst):
    os.rename(src, dst)


TRASH_DIR = os.path.expanduser("~/.my_trash")                        # ← new

def unique_path(path):                                                 # ← new
    if not os.path.exists(path):                                         # ← new
        return path                                                         # ← new
    base, ext = os.path.splitext(path)                                       # ← new
    counter = 1                                                                 # ← new
    while True:                                                                  # ← new
        candidate = f"{base} ({counter}){ext}"                                     # ← new
        if not os.path.exists(candidate):                                            # ← new
            return candidate                                                            # ← new
        counter += 1                                                                     # ← new


def my_rm(path):                                                                          # ← new
    os.makedirs(TRASH_DIR, exist_ok=True)                                                    # ← new
    filename = os.path.basename(path)                                                          # ← new
    destination = unique_path(os.path.join(TRASH_DIR, filename))                                  # ← new
    os.rename(path, destination)                                                                     # ← new
    print(f"moved {path} -> {destination}")                                                            # ← new
```

`file_tools.py` is now complete: `my_cp` genuinely copies bytes, `my_mv`
relabels a file via `os.rename()`, and `my_rm` moves a file into a real
trash folder — never permanently deleting anything, and never silently
overwriting an existing trashed file with the same name.

### Mechanical Walkthrough
- `TRASH_DIR = os.path.expanduser("~/.my_trash")` — `os.path.expanduser()`
(Lesson 6, reminder), resolving `~` to a real home directory. `def
unique_path(path):` and its `if not os.path.exists(path): return path`
- — `os.path.exists()` (Lesson 8, reminder) — if nothing's there yet, no renaming needed at all.
- `base, ext = os.path.splitext(path)` — the

concept from this unit's lab, reused for real, paired with tuple
unpacking (Lesson 1, reminder). `while True: candidate = f"{base}
- ({counter}){ext}" ...` — the exact "try a name, check if it's taken,
increment and retry" pattern, structurally identical to Lesson 10's
chunked-read loop shape, just checking existence instead of reading
- data.
- `def my_rm(path):` — `os.makedirs(TRASH_DIR, exist_ok=True)` —
the concept from this unit's lab, reused for real, ensuring the trash
folder exists every time without erroring if it already does.
- `filename = os.path.basename(path)` — a small, self-explanatory
`os.path` function (same family as `os.path.join`, `os.path.expanduser`
— extracting just the final name from a full path); not given a full
lab since the idea "os.path has small utility functions" is already
well established by this point in the curriculum. `os.rename(path,
- destination)` — reused directly from the previous unit, doing the
actual move into the trash.

### CS Lens

The trash implementation is itself a real instance of a **soft delete**
— marking or relocating data instead of destroying it, so it remains
recoverable. Also recognized in: database rows with a `deleted_at`
column instead of an actual `DELETE`, version control never truly
losing old commits even after a branch is deleted, cloud storage
"30-day recovery" windows on deleted files — all the same underlying
idea as this lesson's trash folder.

### SE Lens

Real desktop trash implementations (macOS's `.Trash`, Windows'
Recycle Bin) go further than this lesson's version — they typically
also remember each file's *original location*, so "restore" can put it
back exactly where it came from, not just "somewhere." That's a real,
deliberate simplification this lesson leaves out, flagged honestly
rather than silently, and a natural next exercise.

### Commands Needed

None new.

### Run It — Real Output

```python
with open("delete_me.txt", "w") as f:
    f.write("please recycle me")

my_rm("delete_me.txt")
print("still exists?", os.path.exists("delete_me.txt"))
print("in trash?", os.listdir(TRASH_DIR))
```

```
moved delete_me.txt -> /root/.my_trash/delete_me.txt
still exists? False
in trash? ['delete_me.txt']
```

And confirmed the collision-avoidance actually works, deleting two
different files that happen to share a name:

```python
my_rm("dirA/notes.txt")
my_rm("dirB/notes.txt")
```

```
moved dirA/notes.txt -> /root/.my_trash/notes.txt
moved dirB/notes.txt -> /root/.my_trash/notes (1).txt
```

Real output — the second `notes.txt`, from a different folder, landed
as `notes (1).txt` instead of silently overwriting the first.

### Connection

All three functions are complete and genuinely working, including a
real, verified collision case for the trash.

---

## Closing

### Connect the Pieces

Trace `my_rm("dirB/notes.txt")` when `notes.txt` is already in the
trash: `os.makedirs(TRASH_DIR, exist_ok=True)` confirmed the trash
folder exists (creating it silently did nothing the second time,
thanks to `exist_ok`). `os.path.basename()` extracted `"notes.txt"`.
`unique_path()` checked `~/.my_trash/notes.txt` — already
`os.path.exists()` — split it into `("notes", ".txt")`, and tried
`"notes (1).txt"`, which didn't exist, and returned that. `os.rename()`
then did the actual, instant relabel from `dirB/notes.txt` to
`~/.my_trash/notes (1).txt` — no bytes copied, no chunking, unlike
`my_cp()` earlier in this same file.

### What Breaks Without This

`os.rename()`'s speed comes with a real, hard limit: it can't cross
filesystem boundaries, because there's no shared inode table to
repoint between two genuinely different filesystems. This container
has one, ready-made: `/` (a real disk, `ext4`) and `/dev/shm` (memory-
backed `tmpfs`) are different filesystems.

```python
import os
os.rename("cross_test.txt", "/dev/shm/cross_test.txt")
```

Real output:

```
OSError: [Errno 18] Invalid cross-device link: 'cross_test.txt' -> '/dev/shm/cross_test.txt'
```

Real error, on a real filesystem boundary — not a bug in `my_mv()`, a
genuine limit of what relabeling can do: there's nothing to repoint
when the destination isn't even tracked by the same underlying table.
This is exactly why real `mv` (the actual command-line tool, not this
lesson's simplified version) silently falls back to a full copy-then-
delete whenever it detects this exact situation — `my_mv()` doesn't,
which is a real, honestly-flagged gap, not fixed here.

### Exercises

1. Fix `my_mv()` to catch this exact `OSError` and fall back to
   `my_cp()` followed by deleting the original — matching what real
   `mv` actually does, and confirm it now works across `/dev/shm`.
2. Build `my_restore(filename)` — moves a file back out of `TRASH_DIR`
   to the current directory, reusing `unique_path()` in case something
   with that name already exists where you're restoring to.
3. Add an original-location record to `my_rm()` (a small text file
   alongside each trashed item, or a separate index file) so
   `my_restore()` could put a file back exactly where it came from,
   not just into the current directory — closing the real gap named in
   this lesson's SE Lens.

### Definition of Done

- [ ] `file_tools.py` runs; `my_cp()`'s output is confirmed
      byte-identical to the original via `diff`
- [ ] You tested `my_rm()` with two same-named files from different
      folders and confirmed neither one silently overwrote the other in
      the trash
- [ ] You triggered the real cross-filesystem `OSError` and understand
      why it's a genuine limit of `os.rename()`, not a bug
- [ ] You can explain, without looking back, why `mv` is typically much
      faster than `cp` on the same large file
- [ ] Commit:

```
git add file_tools.py
git commit -m "Add cp/mv/rm equivalents: prove copying duplicates bytes but moving (same filesystem) only relabels them, and rm-as-trash is recoverable soft deletion, not destruction"
```
