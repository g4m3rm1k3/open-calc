# Lesson 17: What's Actually Inside a Zip File
### (Zip an Entire Directory)

**What you will build.** `zip_directory(source_dir, zip_path)` — a
function that packs an entire folder tree into a single `.zip` file,
reusing Lesson 12's `os.walk()` and Lesson 16's `os.path.relpath()`
directly. The working feature is small and familiar — you've right-
clicked "Compress" more times than you can count. The transferable
problem underneath: a zip archive doesn't automatically know how a
file's *path inside the archive* should look — that's a choice your
code makes explicitly, one file at a time, and getting it wrong is
exactly why some zip files, when extracted, dump their contents loose
into your current folder while others helpfully create one clean
top-level folder.

**What you need to know first.** From Lesson 12: `os.walk()`. From
Lesson 16: `os.path.relpath()`. New in this lesson: the `zipfile`
module.

No pipeline diagram — not part of an established multi-stage pipeline.
This is the last lesson in Track 2 (File System).

---

## Concept Unit: `zipfile.ZipFile()` in Write Mode

### The Problem

We want to create a real `.zip` file and put content into it — a
fundamentally different kind of "writing" than every earlier lesson's
plain text or binary file writing, since a zip file has real internal
structure (multiple named entries, compression, a directory listing),
not just a stream of bytes.

### Introduce the Concept in Isolation

```python
import zipfile
with zipfile.ZipFile("test.zip", "w") as zf:
    zf.writestr("hello.txt", "hello world")
print("created")

with zipfile.ZipFile("test.zip") as zf:
    print(zf.namelist())
```

Run it:

```
created
['hello.txt']
```

This proves `zipfile.ZipFile(path, "w")` — a `with`-managed context
(Lesson 1's guarantee, reminder), same as every file this curriculum
has opened — creates a real zip archive; `.writestr(name, content)`
adds one entry directly from a string (a convenience method for quick
testing — the real project uses a different method, next unit, to add
actual files from disk); re-opening it (no `"w"` this time — read mode
is the default) and calling `.namelist()` confirms the entry is really
there. This throwaway example is discarded.

### Discard the Throwaway Example

Discarded.

### Project Change

- **Files affected:** `zip_tool.py` (new file)
- **Change type:** create
- **Location:** top of the file — nothing exists yet
- **Dependencies:** `zipfile`, `os` modules

### The New Code

```python
import zipfile
import os

def zip_directory(source_dir, zip_path):
    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zf:
        for dirpath, dirnames, filenames in os.walk(source_dir):
            for filename in filenames:
                pass
```

### The Updated Project

```python
import zipfile
import os

def zip_directory(source_dir, zip_path):                        # ← new
    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zf:  # ← new
        for dirpath, dirnames, filenames in os.walk(source_dir):        # ← new
            for filename in filenames:                                    # ← new
                pass                                                         # ← new, temporary placeholder
```

The function now opens a new zip archive and walks the source folder
(Lesson 12's `os.walk()`, reminder) — but adds nothing to the archive
yet. `zipfile.ZIP_DEFLATED` appears here already, ahead of its own
dedicated unit below, since it's simplest to set once at archive-
creation time — the next-but-one unit explains exactly what it does.

### Mechanical Walkthrough
- `import zipfile`, `import os` — reminders/first appearance.
- `def zip_directory(source_dir, zip_path):` — basic.
- `with zipfile.ZipFile( zip_path, "w", zipfile.ZIP_DEFLATED) as zf:` — the concept from this

unit's lab, reused for real, with a third argument (`zipfile.
- ZIP_DEFLATED`) not yet explained — flagged honestly rather than
silently used. `for dirpath, dirnames, filenames in os.walk(
- source_dir):`, `for filename in filenames:` — Lesson 12, reminder.
- `pass` — reminder placeholder.

### CS Lens

Not new beyond file writing and folder walking, both already
established — skipped per the Stopping Rule.

### SE Lens

A zip archive being one physical file containing many logical entries
is itself worth noticing: it's a real, self-contained *container
format*, not fundamentally different in spirit from what a folder on
disk already provides — the difference is that a zip's internal
structure (the entry list, each entry's compressed size and location)
is stored *within* the single file itself, which is exactly what makes
a zip portable as one unit in a way a folder isn't.

### Commands Needed

None.

### Run It

Not runnable for meaningful output — nothing is added to the archive
yet.

### Connection

We have an open, empty archive and a real folder to walk. The next unit
is adding files to it correctly — which, done carelessly, is the exact
source of this lesson's closing "what breaks" case.

---

## Concept Unit: `.write()` With `arcname`

### The Problem

Adding a file to a zip needs two separate pieces of information: where
the real file is on disk right now, and what path it should have
*inside the archive* — and those two things are not automatically the
same. Get this wrong, and extracting the zip later reproduces your
entire folder structure from the disk root, not a clean version
starting at the folder you meant to share.

### Introduce the Concept in Isolation

```python
import os
import zipfile

full = "demo_dir/subdir/c.txt"
root = "demo_dir"
arcname = os.path.relpath(full, root)
print(arcname)

with zipfile.ZipFile("t2.zip", "w") as zf:
    zf.write(full, arcname)

with zipfile.ZipFile("t2.zip") as zf:
    print(zf.namelist())
```

Run it:

```
subdir/c.txt
['subdir/c.txt']
```

This proves `zf.write(real_path, arcname)` — the second argument, not
required, but the one that matters here — controls exactly what path
the file gets *inside* the archive, independent of where it actually
lives on disk. `os.path.relpath()` (Lesson 16, reminder) is what
computes a clean `arcname`: relative to the folder you're zipping, not
to your current working directory or the filesystem root. This
throwaway example is discarded.

### Discard the Throwaway Example

Discarded.

### Project Change

- **Files affected:** `zip_tool.py`
- **Change type:** replace — the `pass` placeholder
- **Location:** inside the `for filename in filenames:` loop
- **Dependencies:** `dirpath`, `filename`, `source_dir`, `zf`

### The New Code

```python
full_path = os.path.join(dirpath, filename)
arcname = os.path.relpath(full_path, source_dir)
zf.write(full_path, arcname)
```

### The Updated Project

```python
import zipfile
import os

def zip_directory(source_dir, zip_path):
    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zf:
        for dirpath, dirnames, filenames in os.walk(source_dir):
            for filename in filenames:
                full_path = os.path.join(dirpath, filename)         # ← new
                arcname = os.path.relpath(full_path, source_dir)      # ← new
                zf.write(full_path, arcname)                            # ← new
```

`zip_directory()` is now complete: every real file gets added with a
clean, relative internal path — the same relationship every earlier
lesson's `relative_snapshot()` and `sync_folders()` relied on, reused
here for archiving instead of comparing or copying.

### Mechanical Walkthrough
- `full_path = os.path.join(dirpath, filename)` — Lesson 2, reminder.
- `arcname = os.path.relpath(full_path, source_dir)` — Lesson 16, reminder, reused for real.
- `zf.write(full_path, arcname)` — the concept

from this unit's lab, reused for real.

### CS Lens

Not new — skipped per the Stopping Rule.

### SE Lens

This is the exact same relative-path discipline Lesson 16's
`sync_folders()` needed, applied to a different problem — worth
noticing as a genuinely recurring pattern across this curriculum: any
tool that needs to describe "this file's identity, independent of where
it physically sits" reaches for the same relative-path technique.

### Commands Needed

`python3 zip_tool.py` — runs the script.

### Run It — Real Output

```python
zip_directory("search_demo", "project.zip")

with zipfile.ZipFile("project.zip") as zf:
    for name in sorted(zf.namelist()):
        print(name)
```

```
$ python3 zip_tool.py
docs/archive/old_notes.txt
docs/notes.txt
docs/todo.txt
src/data.bin
src/main.py
src/utils.py
```

Confirmed to exactly match the real folder's own structure (checked
independently against `find search_demo -type f`) — clean, relative
paths, no leaked absolute path information at all.

### Connection

`zip_directory()` genuinely produces a clean, correctly-structured
archive. The next unit explains the compression argument that's been
sitting in the code since the first unit.

---

## Concept Unit: `ZIP_DEFLATED` vs. `ZIP_STORED`

### The Problem

A zip archive can either genuinely compress each file's content, or
just bundle files together with no compression at all — and the size
difference between those two choices can be dramatic, depending on the
content.

### Introduce the Concept in Isolation

```python
with open("compressible.txt", "w") as f:
    f.write("the quick brown fox " * 2000)

import os
print("original size:", os.path.getsize("compressible.txt"))

import zipfile
with zipfile.ZipFile("stored.zip", "w", zipfile.ZIP_STORED) as zf:
    zf.write("compressible.txt")
with zipfile.ZipFile("deflated.zip", "w", zipfile.ZIP_DEFLATED) as zf:
    zf.write("compressible.txt")

print("ZIP_STORED size:  ", os.path.getsize("stored.zip"))
print("ZIP_DEFLATED size:", os.path.getsize("deflated.zip"))
```

Run it, on a real, deliberately repetitive 40,000-byte file:

```
original size: 40000
ZIP_STORED size:   40130
ZIP_DEFLATED size: 266
```

This proves the difference is real and can be dramatic: `ZIP_STORED`
(no compression) actually ends up slightly *larger* than the original
(a small amount of archive bookkeeping overhead, no compression
benefit); `ZIP_DEFLATED` shrank the same content to under 1% of its
original size, because this test file is extremely repetitive — real,
varied content typically compresses less dramatically than this, but
still meaningfully. This throwaway example is discarded.

### Discard the Throwaway Example

Discarded — `zip_directory()` already uses `ZIP_DEFLATED`, set from
this lesson's very first unit.

### CS Lens

`ZIP_DEFLATED` uses the **DEFLATE** algorithm — finding and encoding
repeated patterns more compactly than storing them literally, which is
exactly why extremely repetitive data (like this lab's repeated
phrase) compresses so dramatically, while already-dense or genuinely
random data (audio, video, already-compressed formats, encrypted data)
often barely shrinks at all, since there's little repeated pattern left
to exploit.

### SE Lens

`ZIP_STORED` still has real, legitimate uses despite compressing
nothing: bundling files that are already compressed (images, videos)
gains nothing from a second compression pass but still costs real CPU
time attempting it — `ZIP_STORED` skips that wasted work. `zip_directory
()`'s choice of `ZIP_DEFLATED` as a blanket default is reasonable for
general-purpose folders (a real mix of compressible text/code and
already-compressed binaries), but a tool built specifically for
archiving already-compressed media might reasonably default to
`ZIP_STORED` instead.

### Commands Needed

None new.

### Run It

Shown above — real, measured compression difference.

### Connection

`zip_directory()`'s compression choice is now understood, not just
copied. The closing section verifies the whole archive round-trips
correctly, then shows a real, common mistake.

---

## Closing

### Connect the Pieces

Trace `docs/notes.txt` through the whole function: `os.walk()` reached
it during the traversal. `os.path.join(dirpath, filename)` built its
real disk location; `os.path.relpath(full_path, source_dir)` computed
`"docs/notes.txt"` — its identity *inside* the archive, independent of
where `search_demo/` actually sits on disk. `zf.write(full_path,
arcname)` stored it under that clean name, compressed via
`ZIP_DEFLATED`. Extracting the resulting archive and `diff -r`-ing it
against the original folder confirmed the result byte-for-byte
identical:

```
$ diff -r search_demo extracted_check && echo IDENTICAL
IDENTICAL
```

### What Breaks Without This

Omit the `arcname` argument — a genuinely easy mistake, since `.write()`
works fine without it:

```python
def zip_directory_broken(source_dir, zip_path):
    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zf:
        for dirpath, dirnames, filenames in os.walk(source_dir):
            for filename in filenames:
                full_path = os.path.join(dirpath, filename)
                zf.write(full_path)  # forgot arcname
```

Real output, zipping the identical `search_demo/` folder:

```
search_demo/docs/archive/old_notes.txt
search_demo/docs/notes.txt
search_demo/docs/todo.txt
search_demo/src/data.bin
search_demo/src/main.py
search_demo/src/utils.py
```

This is the exact, real cause of a familiar annoyance: extracting this
archive doesn't drop `notes.txt` and friends cleanly into your current
folder — it recreates `search_demo/docs/archive/old_notes.txt`, nested
several folders deep, because without an explicit `arcname`, `.write()`
defaults to storing the path *exactly as you passed it in* —
`os.walk()`'s output, which already includes `source_dir` as a prefix.
Nothing crashed; the archive is completely valid and extracts
successfully — it's just structured differently than almost anyone
sharing a zip actually wants.

### Exercises

1. Add a real command-line entry point using `sys.argv` (Lesson 10):
   `python3 zip_tool.py search_demo project.zip` should call
   `zip_directory("search_demo", "project.zip")`.
2. Add an `exclude` parameter — a list of filename patterns
   (`fnmatch`, Lesson 12) to skip, so you can zip a project folder
   without including `*.bin` or other unwanted files.
3. Build `unzip_directory(zip_path, dest_dir)` using
   `zipfile.ZipFile(zip_path).extractall(dest_dir)`, then use Lesson
   16's `compare_folders()` to verify the extracted result matches the
   original folder exactly — turning this lesson's manual `diff -r`
   check into a real, reusable, automated one.

### Definition of Done

- [ ] `zip_tool.py` runs and `zip_directory()` produces a real,
      correctly-structured `.zip` file from a folder you built yourself
- [ ] You extracted it and confirmed, via `diff -r`, that the result is
      byte-identical to the original folder
- [ ] You triggered the real "forgot `arcname`" mistake and understand
      exactly why the resulting archive extracts with unwanted nested
      folders
- [ ] You can explain, without looking back, the real difference
      between `ZIP_STORED` and `ZIP_DEFLATED`
- [ ] Commit:

```
git add zip_tool.py
git commit -m "Add a directory zipper: prove an archive entry's internal path is a deliberate choice via arcname, not automatically derived from where the file lives on disk"
```
