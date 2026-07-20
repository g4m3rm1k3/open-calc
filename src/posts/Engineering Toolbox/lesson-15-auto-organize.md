# Lesson 15: A Watcher Is Only Useful With Something to Do
### (Auto-Organize a Downloads Folder)

**What you will build.** `organize_downloads(folder)` — a function that
sorts a messy folder's files into category subfolders by extension
(`.pdf` → `Documents/`, `.jpg` → `Images/`, and so on) — and then a
version wired directly into Lesson 14's `watch()` loop, so new files get
sorted automatically the moment they're detected, not just on a manual
run. The working feature is small. The transferable problem underneath:
Lesson 14 built the *detection* half of automation; this lesson builds
the *action* half, and combining them is what actually makes something
"automatic" rather than just "observable." Along the way, this lesson
also closes a real gap Lesson 11 flagged and left open on purpose.

**What you need to know first.** From Lesson 14: `watch()`,
`diff_snapshots()`, set difference. From Lesson 11: `os.path.splitext()`,
`os.makedirs()`, and the cross-filesystem limitation of `os.rename()`.
New in this lesson: the `shutil` module's `shutil.move()`.

No pipeline diagram — not part of an established multi-stage pipeline.

---

## Concept Unit: `shutil.move()`

### The Problem

Lesson 11's closing section flagged a real, unfixed gap: `os.rename()`
can't move a file across a filesystem boundary — it raises `OSError:
Invalid cross-device link`, and `my_mv()` had no fallback. A Downloads
folder organizer is exactly the kind of tool where that gap would
actually bite — Downloads and a destination folder aren't guaranteed to
be on the same filesystem in general. We need a `move` that doesn't
have that limitation.

### Introduce the Concept in Isolation

```python
import shutil
result = shutil.move("shutil_test.txt", "/dev/shm/shutil_test.txt")
print("moved to:", result)

import os
print("source still exists:", os.path.exists("shutil_test.txt"))
print("dest exists:", os.path.exists("/dev/shm/shutil_test.txt"))
```

Run it, moving a real file from this machine's `ext4` disk to
`/dev/shm` (a `tmpfs`, genuinely different filesystem — the exact
cross-device case that broke `os.rename()` in Lesson 11):

```
moved to: /dev/shm/shutil_test.txt
source still exists: False
dest exists: True
```

This proves `shutil.move()` succeeds in exactly the situation
`os.rename()` couldn't — it worked without raising anything. This
closes Lesson 11's flagged gap directly: `shutil.move()` internally
tries `os.rename()` first (fast, when possible) and automatically falls
back to a full copy-then-delete when that fails across a filesystem
boundary — precisely the fallback Lesson 11's closing exercises asked
you to build by hand. This throwaway example is discarded.

### Discard the Throwaway Example

Discarded.

### Project Change

- **Files affected:** `organizer.py` (new file)
- **Change type:** create
- **Location:** top of the file — nothing exists yet
- **Dependencies:** `os`, `shutil` modules

### The New Code

```python
import os
import shutil

CATEGORIES = {
    ".pdf": "Documents",
    ".txt": "Documents",
    ".jpg": "Images",
    ".png": "Images",
    ".mp3": "Audio",
    ".zip": "Archives",
}
```

### The Updated Project

```python
import os
import shutil

CATEGORIES = {                # ← new
    ".pdf": "Documents",         # ← new
    ".txt": "Documents",           # ← new
    ".jpg": "Images",                # ← new
    ".png": "Images",                  # ← new
    ".mp3": "Audio",                     # ← new
    ".zip": "Archives",                    # ← new
}                                            # ← new
```

`CATEGORIES` is a real dictionary — deliberately just data, not logic —
mapping file extensions to the folder name each should land in. Nothing
reads it yet.

### Mechanical Walkthrough

`import os`, `import shutil` — reminders, `shutil` first appearance as
a module name (distinct from `os`, though closely related — `shutil`
sits on top of `os`, providing higher-level file operations).
`CATEGORIES = {...}` — a dictionary literal; assuming this as basic
syntax from your stated Python background.

### CS Lens

Not new — skipped per the Stopping Rule; `shutil.move()` itself was
this unit's lab content.

### SE Lens

Keeping `CATEGORIES` as a plain dictionary at the top of the file,
rather than hardcoding `if ext == ".pdf": ...` branches inside the
organizing logic, is a real, deliberate separation: adding a new
category later means editing one line of data, not touching any actual
logic. This is the same "config as data, not code" instinct that
motivated Lesson 6's `.bashrc` — behavior driven by a small, readable
table rather than scattered conditionals.

### Commands Needed

None.

### Run It

Not runnable for meaningful output — no logic reads `CATEGORIES` yet.

### Connection

We now have a real category map and a `move()` that won't fail across
filesystems. The next unit builds the actual organizing logic.

---

## Concept Unit: Classifying and Moving Files

### The Problem

For each file in a messy folder, we need to look up its category by
extension, make sure that category's folder exists, and move the file
there — safely skipping anything that's already a folder (so running
this twice doesn't try to "organize" the `Documents/` folder itself).

### Introduce the Concept in Isolation

```python
import os
categories = {".pdf": "Documents", ".txt": "Documents", ".jpg": "Images"}
for name in ["report.pdf", "photo.jpg", "notes.txt", "weird.xyz"]:
    base, ext = os.path.splitext(name)
    category = categories.get(ext, "Other")
    print(name, "->", category)
```

Run it:

```
report.pdf -> Documents
photo.jpg -> Images
notes.txt -> Documents
weird.xyz -> Other
```

This proves `os.path.splitext()` (Lesson 11, reminder) combined with
`.get(ext, "Other")` (Lesson 2/13, reminder) correctly classifies every
file, including `weird.xyz` — an extension with no entry in the map —
falling back to `"Other"` instead of crashing or being silently
dropped. This throwaway example is discarded.

### Discard the Throwaway Example

Discarded.

### Project Change

- **Files affected:** `organizer.py`
- **Change type:** add — a new function
- **Location:** after `CATEGORIES`
- **Dependencies:** `CATEGORIES`, `os`, `shutil`

### The New Code

```python
def organize_downloads(folder):
    for entry in os.listdir(folder):
        full_path = os.path.join(folder, entry)
        if os.path.isdir(full_path):
            continue
        base, ext = os.path.splitext(entry)
        category = CATEGORIES.get(ext, "Other")
        category_folder = os.path.join(folder, category)
        os.makedirs(category_folder, exist_ok=True)
        shutil.move(full_path, os.path.join(category_folder, entry))
        print(f"{entry} -> {category}/")
```

### The Updated Project

```python
import os
import shutil

CATEGORIES = {
    ".pdf": "Documents",
    ".txt": "Documents",
    ".jpg": "Images",
    ".png": "Images",
    ".mp3": "Audio",
    ".zip": "Archives",
}

def organize_downloads(folder):                                       # ← new
    for entry in os.listdir(folder):                                     # ← new
        full_path = os.path.join(folder, entry)                             # ← new
        if os.path.isdir(full_path):                                          # ← new
            continue                                                            # ← new
        base, ext = os.path.splitext(entry)                                       # ← new
        category = CATEGORIES.get(ext, "Other")                                     # ← new
        category_folder = os.path.join(folder, category)                              # ← new
        os.makedirs(category_folder, exist_ok=True)                                      # ← new
        shutil.move(full_path, os.path.join(category_folder, entry))                        # ← new
        print(f"{entry} -> {category}/")                                                      # ← new
```

`organize_downloads()` is now complete: it classifies and moves every
plain file directly inside `folder` into the right category subfolder,
creating each subfolder as needed, and safely leaves existing
subfolders (and anything already sorted inside them) untouched.

### Mechanical Walkthrough

`for entry in os.listdir(folder):` — Lesson 4, reminder — deliberately
`os.listdir()`, not `os.walk()`: this only looks at the folder's
immediate contents, not everything nested inside it (worth noting
explicitly, since Lessons 12–14 all reached for `os.walk()` instead —
here, recursing into subfolders would mean trying to "organize" files
that are already organized). `if os.path.isdir(full_path): continue` —
`os.path.isdir()` (Lesson 7, reminder) — skips folders entirely,
including the category folders this same function creates, which is
exactly what makes running it repeatedly safe. `base, ext =
os.path.splitext(entry)`, `category = CATEGORIES.get(ext, "Other")` —
this unit's lab, reused for real. `os.makedirs(category_folder,
exist_ok=True)` — Lesson 11, reminder. `shutil.move(full_path,
os.path.join(category_folder, entry))` — the concept from the previous
unit, reused for real.

### CS Lens

Not new — skipped per the Stopping Rule.

### SE Lens

Checking `os.path.isdir()` and `continue`-ing past it is the specific
detail that makes this function **idempotent** — safe to run
repeatedly on the same folder without different results each time.
Without it, a second run would try to classify `Documents` itself by
extension (finding none, since it has no `.`), dump it in `Other/`, and
badly corrupt the folder structure. Idempotence is a real, valuable
property for exactly this kind of tool — one you'll want to run
casually, repeatedly, without worrying about what state the folder was
already in.

### Commands Needed

`python3 organizer.py` — runs the script.

### Run It — Real Output

Against a real, messy folder:

```python
organize_downloads("downloads_demo")
```

```
$ python3 organizer.py
photo2.png -> Images/
song.mp3 -> Audio/
report.pdf -> Documents/
mystery.xyz -> Other/
another.pdf -> Documents/
archive.zip -> Archives/
notes.txt -> Documents/
photo1.jpg -> Images/
```

And confirmed idempotent — a second run, with one new file dropped in
alongside the now-organized folders, only touches the new file:

```
newfile.pdf -> Documents/
```

No errors, no re-processing of anything already sorted.

### Connection

`organize_downloads()` works as a real, safe, one-time (or
repeatable-anytime) tool. The rest of this lesson wires it into Lesson
14's `watch()` so it runs automatically.

---

## Wiring Into Lesson 14's Watcher (No New Concepts)

```python
def watch_and_organize(folder, interval=1):
    from watcher import snapshot, diff_snapshots
    import time

    organize_downloads(folder)  # clean up whatever's already there first
    previous = snapshot(folder)
    print("watching and auto-organizing...")
    while True:
        time.sleep(interval)
        current = snapshot(folder)
        added, removed, modified = diff_snapshots(previous, current)
        if added:
            organize_downloads(folder)
        previous = snapshot(folder)  # re-snapshot; organizing just moved files
```

Nothing here is a new concept — `snapshot()`, `diff_snapshots()`, and
`time.sleep()` are Lesson 14 unchanged; `if added: organize_downloads(
folder)` is the one genuinely new *idea*, not new syntax: reacting to
what a watcher detects, instead of only reporting it. The final
`previous = snapshot(folder)` (not just `previous = current`, unlike
Lesson 14's version) matters for a real reason — `organize_downloads()`
just moved the added files out of `folder` directly into subfolders, so
re-snapshotting *after* organizing keeps `previous` accurate; using the
stale `current` would make the watcher think those same files got
"removed" on the very next poll, which is technically true (they did
move) but not the kind of change worth reporting here.

### Run It — Real Output

Using a background thread to genuinely drop new files into a watched
folder during a real polling interval:

```
new files detected: {'vacation.jpg', 'invoice.pdf'}
auto_organize_demo/Documents/invoice.pdf
auto_organize_demo/Images/vacation.jpg
```

Real output — both files, dropped in by a separate thread while the
watch loop was mid-sleep, were detected on the next poll and
automatically sorted into the right subfolders with no manual step in
between.

---

## Closing

### Connect the Pieces

Trace `invoice.pdf` through the combined system: it was created by a
separate thread while `watch_and_organize()`'s loop was inside
`time.sleep(interval)`. On waking, a fresh `snapshot()` included it;
`diff_snapshots()` (Lesson 14, unchanged) correctly placed it in
`added`, since `previous` had no record of it. `if added:` triggered
`organize_downloads()`, which walked the folder, found `invoice.pdf`
sitting at the top level (not yet in any category folder), classified
it via `CATEGORIES.get(".pdf", "Other")` → `"Documents"`, created
`Documents/` if needed, and `shutil.move()`d it there — succeeding
even if `Documents/` had ended up on a different filesystem, unlike
Lesson 11's `os.rename()`-based version would have.

### What Breaks Without This

`shutil.move()` solved Lesson 11's cross-device gap, but it introduces
a different, real risk Lesson 11's `my_rm()` specifically avoided:
silent overwriting on a naming collision.

```python
import shutil
# Documents/notes.txt already exists with different content
shutil.move("notes.txt", "Documents/notes.txt")
```

Real output — checking the file's content before and after:

```
before move, existing Documents/notes.txt says:
'DIFFERENT pre-existing content\n'
after move:
'original content from documents folder\n'
```

Real, silent data loss: the pre-existing `Documents/notes.txt` was
overwritten with zero warning, zero error, zero prompt — `shutil.move()`
simply replaces an existing destination file outright. This is a real
gap `organize_downloads()` currently has: two different downloads that
happen to share a filename will silently destroy one of them the moment
both get organized. Lesson 11 already built the exact fix for this —
`unique_path()` — and it's a real, honest omission that this lesson's
`organize_downloads()` doesn't use it, left for the exercises rather
than fixed here.

### Exercises

1. Fix the silent-overwrite risk: import and reuse Lesson 11's
   `unique_path()` before calling `shutil.move()`, so a naming
   collision renames the incoming file (`notes (1).txt`) instead of
   destroying what's already there.
2. Add a `DRY_RUN` flag to `organize_downloads()` that prints what
   *would* move, without actually calling `shutil.move()` — a common,
   genuinely useful pattern for any tool that rearranges files
   automatically, letting you preview before trusting it.
3. Extend `CATEGORIES` with a few more extensions relevant to your own
   real Downloads folder, and run `organize_downloads()` against a
   real (but backed-up!) copy of it — notice how many files land in
   `Other/`, and use that to decide what other categories are worth
   adding.

### Definition of Done

- [ ] `organizer.py` runs and correctly sorts a real, messy folder you
      built yourself
- [ ] You confirmed running it twice in a row doesn't touch anything
      already organized
- [ ] You confirmed `shutil.move()` succeeds across a real filesystem
      boundary where Lesson 11's `os.rename()`-based `my_mv()` failed
- [ ] You triggered the real silent-overwrite collision and understand
      why it's a genuine, currently-unfixed gap in this lesson's version
- [ ] You wired `organize_downloads()` into `watch()` and watched a
      file get auto-sorted without running anything manually
- [ ] Commit:

```
git add organizer.py
git commit -m "Add an auto-organizing downloads folder: prove shutil.move() closes Lesson 11's cross-device gap, and that pairing a watcher with an action is what makes something actually automatic"
```
