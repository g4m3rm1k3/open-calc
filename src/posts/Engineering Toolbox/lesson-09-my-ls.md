# Lesson 9: What `ls -l` Is Actually Reading
### (Build Your Own `ls`)

**What you will build.** `my_ls()` — a function that lists a folder's
contents the way `ls -l` does: permissions, size, modified time, name,
one line per entry, real columns lining up. The working feature is
small and deliberately familiar — you've run `ls -l` hundreds of times
without ever seeing what it's actually reading. The transferable
problem underneath: everything `ls -l` shows you is **metadata that
already exists**, sitting right there for any program to read — nothing
about it is computed specially or hidden behind `ls` itself. Once you've
read that metadata directly, `ls -l`'s output stops being a fixed format
you memorize and becomes a specific choice about how to *display* data
you now know how to get yourself.

**What you need to know first.** From Lesson 7/8: `os.listdir()`,
`os.path.join()`. From Lesson 6: `sorted()`. New in this lesson:
`os.stat()`, the `stat` module's `filemode()`, and `datetime` for
turning a raw timestamp into something readable.

No pipeline diagram — not part of an established multi-stage pipeline.

---

## Concept Unit: `os.stat()`

### The Problem

`os.listdir()` gives us names. `os.path.getsize()` (Lesson 7) gives us
one specific number. `ls -l` shows several different facts about a file
at once — permissions, size, modification time, and more — and asking
for each one with a separate function call, if that's even possible for
all of them, would mean touching the filesystem repeatedly for
information that's naturally read together in one place.

### Introduce the Concept in Isolation

```python
import os
info = os.stat("a.txt")
print(info)
```

Run it, against a real file:

```
os.stat_result(st_mode=33188, st_ino=622613, st_dev=65024, st_nlink=1, st_uid=0, st_gid=0, st_size=12, st_atime=1784508072, st_mtime=1784508072, st_ctime=1784508072)
```

This proves `os.stat()` returns one object carrying *all* of a file's
metadata at once — size (`st_size`), a raw permissions-and-type number
(`st_mode`), and several timestamps (`st_mtime` — modified time —
among them), each reachable as a named attribute (`info.st_size`,
`info.st_mtime`, ...) rather than needing a separate function call per
fact. This throwaway example is discarded; the real project reads real
attributes off a real `os.stat()` call, not just prints the whole
object.

### Discard the Throwaway Example

Discarded.

### Project Change

- **Files affected:** `my_ls.py` (new file)
- **Change type:** create
- **Location:** top of the file — nothing exists yet
- **Dependencies:** `os` module

### The New Code

```python
import os

def my_ls(path="."):
    entries = sorted(os.listdir(path))
    for entry in entries:
        full_path = os.path.join(path, entry)
        info = os.stat(full_path)
```

### The Updated Project

```python
import os

def my_ls(path="."):                          # ← new
    entries = sorted(os.listdir(path))           # ← new
    for entry in entries:                           # ← new
        full_path = os.path.join(path, entry)          # ← new
        info = os.stat(full_path)                         # ← new
```

The function now lists a folder's contents, alphabetically sorted
(`sorted()`, Lesson 6, reminder), and reads each entry's full metadata
into `info` — but doesn't display any of it yet.

### Mechanical Walkthrough
- `import os` — reminder.
- `def my_ls(path="."):` — default argument
(reminder), with `"."` meaning "the current folder," a standard Unix
convention worth naming since it's the first time this curriculum uses
- it as a real default.
- `entries = sorted(os.listdir(path))` — `os.listdir()` (reminder) wrapped in `sorted()` (Lesson 6, reminder) —

real `ls` also sorts alphabetically by default, which this line
- reproduces directly.
- `full_path = os.path.join(path, entry)` — reminder.
- `info = os.stat(full_path)` — the concept from this unit's

lab, reused for real.

### CS Lens

Not new — skipped per the Stopping Rule; the file-metadata idea itself
is what this unit's lab already covered.

### SE Lens

`os.stat()` bundling everything into one call, instead of separate
`os.path.getsize()`, `os.path.getmtime()`, and similar individual
functions (which do exist in Python, as thin wrappers *around*
`os.stat()` internally), matters for a real reason: reading a file's
metadata is itself a system call — a real, if small, cost. `ls -l` on a
folder with thousands of entries calling `stat()` once per file, rather
than three or four separate metadata calls per file, is a genuine
performance difference, not just a style preference.

### Commands Needed

None.

### Run It

Not runnable for meaningful output — `info` is read but nothing is
printed yet.

### Connection

We now have every fact about each entry, bundled together. The next
three units turn three of those raw facts into the columns `ls -l`
actually shows.

---

## Concept Unit: `stat.filemode()`

### The Problem

`info.st_mode` is a plain integer (`33188`, seen above) — not remotely
readable as "this is a regular file, owner can read and write, group
and others can only read," which is what `ls -l`'s leading
`-rw-r--r--` actually communicates. We need to convert that number into
the familiar permission-string format.

### Introduce the Concept in Isolation

```python
import os
import stat

info = os.stat("a.txt")
print(info.st_mode)
print(stat.filemode(info.st_mode))

info2 = os.stat("subdir")
print(stat.filemode(info2.st_mode))
```

Run it:

```
33188
-rw-r--r--
drwxr-xr-x
```

This proves `stat.filemode()` — from Python's `stat` module, a separate
import from `os` — decodes that raw number into exactly the string
format `ls -l` shows, including the leading character that identifies
the entry's *type* (`-` for a plain file, `d` for a directory — the same
distinction Lessons 7 and 8 checked with `os.path.isdir()`, here
encoded as part of this one number instead). This throwaway example is
discarded.

### Discard the Throwaway Example

Discarded.

### Project Change

- **Files affected:** `my_ls.py`
- **Change type:** add
- **Location:** inside the `for entry in entries:` loop, after `info =
  os.stat(full_path)`
- **Dependencies:** `info`

### The New Code

```python
import stat

permissions = stat.filemode(info.st_mode)
```

### The Updated Project

```python
import os
import stat                                       # ← new

def my_ls(path="."):
    entries = sorted(os.listdir(path))
    for entry in entries:
        full_path = os.path.join(path, entry)
        info = os.stat(full_path)
        permissions = stat.filemode(info.st_mode)   # ← new
```

Each entry now has its permission string computed — `"-rw-r--r--"` or
similar — ready to display, though nothing is printed yet.

### Mechanical Walkthrough
- `import stat` — first appearance of this module, distinct from the
`os` module even though the names sound related. `permissions =
- stat.filemode(info.st_mode)` — the concept from this unit's lab, reused
for real.

### CS Lens

`st_mode`'s single integer encoding both a file's type *and* its full
permission set is **bit-packing** — cramming several independent pieces
of information into one number's individual bits, rather than storing
each as a separate field. Also recognized in: RGB colors packed into one
32-bit integer, HTTP status code ranges (2xx, 4xx, 5xx encoding a
category in the leading digit), CPU flag registers.

### SE Lens

Storing permissions this way — dense, bit-packed — instead of, say,
three separate readable strings for owner/group/other, is a real
holdover from Unix's original design constraints (every byte of
filesystem metadata mattered), still in use today because it's compact
and every tool that reads a filesystem already agrees on the format.
The cost: the raw number is meaningless without a decoder like
`stat.filemode()` — nobody reads `33188` and knows what it means without
tooling.

### Commands Needed

None new.

### Run It

Not runnable for meaningful output yet.

### Connection

We now have real permission strings. The next unit handles the
timestamp, which needs a different kind of conversion.

---

## Concept Unit: `datetime.fromtimestamp()`

### The Problem

`info.st_mtime` is a raw number — seconds since a fixed reference point
(January 1, 1970) — not a date anyone would recognize at a glance. We
need to turn that into something like `"Jul 20 00:41"`, the format
`ls -l` actually shows.

### Introduce the Concept in Isolation

```python
import datetime
import os

info = os.stat("a.txt")
print(info.st_mtime)
readable = datetime.datetime.fromtimestamp(info.st_mtime)
print(readable)
print(readable.strftime("%b %d %H:%M"))
```

Run it:

```
1784508072.6675258
2026-07-20 00:41:12.667526
Jul 20 00:41
```

This proves two separate steps: `datetime.fromtimestamp()` converts a
raw number into a real `datetime` object — one that already knows the
year, month, day, hour, and so on, not just a formatted string yet;
`.strftime("%b %d %H:%M")` then formats *that* object into exactly the
string shape we want — `%b` (abbreviated month name), `%d` (day),
`%H:%M` (hour:minute), each a placeholder `strftime` fills in. This
throwaway example is discarded.

### Discard the Throwaway Example

Discarded.

### Project Change

- **Files affected:** `my_ls.py`
- **Change type:** add — completes the loop body, including the final
  `print`
- **Location:** inside the `for entry in entries:` loop, after
  `permissions = ...`
- **Dependencies:** `info`, `permissions`, `entry`

### The New Code

```python
import datetime

size = info.st_size
mtime = datetime.datetime.fromtimestamp(info.st_mtime).strftime("%b %d %H:%M")
print(f"{permissions} {size:>10} {mtime} {entry}")
```

### The Updated Project

```python
import os
import stat
import datetime                                                            # ← new

def my_ls(path="."):
    entries = sorted(os.listdir(path))
    for entry in entries:
        full_path = os.path.join(path, entry)
        info = os.stat(full_path)
        permissions = stat.filemode(info.st_mode)
        size = info.st_size                                                    # ← new
        mtime = datetime.datetime.fromtimestamp(info.st_mtime).strftime("%b %d %H:%M")  # ← new
        print(f"{permissions} {size:>10} {mtime} {entry}")                       # ← new
```

`my_ls()` is now complete: every entry prints its permission string,
right-aligned size, formatted modification time, and name — one real
line per entry, columns lined up.

### Mechanical Walkthrough
- `size = info.st_size` — direct attribute access, already basic once
`os.stat()` itself is understood. `mtime = ...fromtimestamp(...
- ).strftime(...)` — the two-step conversion from this unit's lab, reused
for real, chained directly (calling `.strftime()` immediately on the
`datetime` object `fromtimestamp()` just returned, without a separate
- named variable in between — already-basic method chaining).
- `print( f"{permissions} {size:>10} {mtime} {entry}")` — first appearance of

`:>10` specifically: a format spec meaning "right-align this value
- within a 10-character-wide field" — a small extension of the `:02x`
zero-padding format spec from Lesson 61, same mechanism, different
alignment flag, worth the reminder rather than a full new unit.

### CS Lens

Not new beyond formatting already covered — skipped per the Stopping
Rule.

### SE Lens

Formatting the date as `"Jul 20 00:41"` rather than the full,
unambiguous `fromtimestamp()` default (`"2026-07-20 00:41:12.667526"`)
is exactly the tradeoff real `ls -l` makes: a shorter, glanceable
format costs precision (no seconds, no explicit year for recent files)
in exchange for output that stays readable across many files in a
narrow terminal column. Worth noticing this is a genuine design
decision `ls`'s authors made, not an accident of what timestamps
"naturally" look like.

### Commands Needed

`python3 my_ls.py` — runs the script.

### Run It — Real Output

Against the real `demo_dir/` folder from Lesson 7 (`a.txt`, `b.bin`,
`subdir/`):

```python
my_ls("demo_dir")
```

```
$ python3 my_ls.py
-rw-r--r--         12 Jul 20 00:41 a.txt
-rw-r--r--       5000 Jul 20 00:41 b.bin
drwxr-xr-x       4096 Jul 20 00:41 subdir
```

Compared directly against the real `ls -la` on the identical folder:

```
$ ls -la demo_dir
drwxr-xr-x  3 root root 4096 Jul 20 00:41 .
drwxr-xr-x 10 root root 4096 Jul 20 10:52 ..
-rw-r--r--  1 root root   12 Jul 20 00:41 a.txt
-rw-r--r--  1 root root 5000 Jul 20 00:41 b.bin
drwxr-xr-x  2 root root 4096 Jul 20 00:41 subdir
```

Real, side-by-side match on permissions, size, and modification time for
every entry — `my_ls()` is missing only the link-count/owner/group
columns and the `.`/`..` self-references, both left out on purpose to
keep this version focused.

### Connection

`my_ls()` genuinely reproduces `ls -l`'s core columns. The closing
section shows a real gap it still has — one this curriculum already
built the exact tool to explain.

---

## Closing

### Connect the Pieces

Trace `b.bin` through the whole function: `os.listdir()` found it as a
name. `os.stat()` read its full metadata in one call — `st_mode=33188`
(interpreted by `stat.filemode()` into `-rw-r--r--`), `st_size=5000`,
and a raw `st_mtime` float. `stat.filemode()` decoded the permission
bits; `datetime.fromtimestamp().strftime()` turned the raw timestamp
into `"Jul 20 00:41"`; the final f-string laid all four pieces —
permissions, right-aligned size, time, name — into one line matching
real `ls -l` exactly.

### What Breaks Without This

Run `my_ls()` against Lesson 8's `symlink_demo/` folder — which
contains `broken_link`, a symlink pointing nowhere:

```
Traceback (most recent call last):
  ...
  File "my_ls.py", line 9, in my_ls
    info = os.stat(full_path)
FileNotFoundError: [Errno 2] No such file or directory: 'symlink_demo/broken_link'
```

Real crash, on a real broken symlink — and this is exactly Lesson 8's
lesson resurfacing here: `os.stat()`, like `os.path.isfile()` and
`os.path.exists()` before it, **follows** symlinks by default, so
asking for a broken symlink's metadata fails the same way asking to
open one would. The fix is `os.lstat()` instead of `os.stat()` — same
interface, but it reports on the symlink *itself* rather than following
it:

```python
info = os.lstat("symlink_demo/broken_link")
print(info.st_size)
```

```
17
```

Real, working output — `17`, the length of the stored target path
string itself (`/nonexistent/path`), not a crash. Real `ls -l` uses
exactly this distinction, which is why `ls -l` can list a broken
symlink without ever failing.

### Exercises

1. Switch `os.stat()` to `os.lstat()` in `my_ls()` and confirm it now
   lists Lesson 8's `symlink_demo/` folder, including `broken_link`,
   without crashing.
2. Add a fifth column showing the symlink's target (using
   `os.readlink()` from Lesson 8) whenever `stat.filemode()`'s first
   character is `l` (symlink) — matching real `ls -l`'s `name ->
   target` display.
3. Add a simple `-a` flag equivalent: an optional parameter that, when
   `True`, also lists entries starting with `.` (which `os.listdir()`
   already includes, but a real `ls` without `-a` hides by convention —
   check whether your current version already shows them, and decide
   whether that matches what you expected).

### Definition of Done

- [ ] `my_ls.py` runs and its output matches real `ls -l` on the same
      folder, column for column
- [ ] You ran it against a folder containing a broken symlink and saw
      the real crash
- [ ] You fixed it with `os.lstat()` and confirmed the real, correct
      output
- [ ] You can explain, without looking back, why `os.stat()` bundles
      multiple facts into one call instead of several
- [ ] Commit:

```
git add my_ls.py
git commit -m "Add a real ls -l clone: prove every column ls shows is metadata already sitting on disk, read through os.stat(), not something ls computes specially"
```
