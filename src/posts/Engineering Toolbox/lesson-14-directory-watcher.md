# Lesson 14: Watching Is Just Comparing Two Snapshots
### (Directory Watcher)

**What you will build.** `watch(root)` — a tool that polls a folder
repeatedly and reports what changed since the last check: files added,
removed, or modified. The working feature is small. The transferable
problem underneath: there's no OS magic that pushes "a file changed"
notifications to a simple Python script by default — the approach this
lesson builds, **polling**, is genuinely just Lesson 5's snapshot idea,
taken twice, compared. That's both this approach's whole strength (dead
simple, works everywhere) and its real, honest weakness, which this
lesson's closing section triggers on purpose.

**What you need to know first.** From Lesson 12: `os.walk()`. From
Lesson 5: `time.sleep()`, the snapshot-then-compare idea. From Lesson
9: `os.stat`-family functions for file metadata. New in this lesson:
Python's `set` type, set difference (`-`) and intersection (`&`), and
set comprehensions.

No pipeline diagram — not part of an established multi-stage pipeline.

---

## Concept Unit: Sets, and Set Difference

### The Problem

To find what changed between two folder snapshots, we need to compare
which *paths* existed before versus after — paths only in the new
snapshot are additions; paths only in the old one are removals. Doing
this with `for` loops and manual membership checks would work, but
Python has a data type built specifically for exactly this kind of
comparison.

### Introduce the Concept in Isolation

```python
old = {"a": 1, "b": 2, "c": 3}
new = {"b": 2, "c": 99, "d": 4}

old_paths = set(old)
new_paths = set(new)
print("old_paths:", old_paths)
print("new_paths:", new_paths)
print("added:", new_paths - old_paths)
print("removed:", old_paths - new_paths)
print("common:", old_paths & new_paths)
```

Run it:

```
old_paths: {'a', 'b', 'c'}
new_paths: {'b', 'd', 'c'}
added: {'d'}
removed: {'a'}
common: {'b', 'c'}
```

This proves several things at once: `set(a_dict)` gives you a `set`
containing just that dictionary's keys (no values); a `set`, unlike a
list, holds each value at most once and has no guaranteed order;
`-` between two sets gives everything in the left one but *not* the
right — genuinely different from subtraction on numbers, reusing the
same operator for a related "remove these" idea; `&` gives everything
in *both*. This throwaway example is discarded; the real project
compares real file paths, not single letters.

### Discard the Throwaway Example

Discarded.

### Project Change

- **Files affected:** `watcher.py` (new file)
- **Change type:** create
- **Location:** top of the file — nothing exists yet
- **Dependencies:** `os`, `time` modules

### The New Code

```python
import os

def snapshot(root):
    state = {}
    for dirpath, dirnames, filenames in os.walk(root):
        for filename in filenames:
            path = os.path.join(dirpath, filename)
            state[path] = os.path.getmtime(path)
    return state
```

### The Updated Project

```python
import os

def snapshot(root):                                       # ← new
    state = {}                                                # ← new
    for dirpath, dirnames, filenames in os.walk(root):           # ← new
        for filename in filenames:                                  # ← new
            path = os.path.join(dirpath, filename)                     # ← new
            state[path] = os.path.getmtime(path)                          # ← new
    return state                                                            # ← new
```

`snapshot()` now walks a folder tree (Lesson 12's `os.walk()`,
reminder) and returns a dictionary mapping every file's path to its
last-modified time — a complete, single-moment picture of the folder,
the same "one honest reading" idea Lesson 5's `memory_usage()` already
established, applied here to a whole tree instead of one file.

### Mechanical Walkthrough
- `import os` — reminder.
- `def snapshot(root):` — basic.
- `state = {}` —
basic. `for dirpath, dirnames, filenames in os.walk(root):` and `path =
- os.path.join(dirpath, filename)` — Lesson 12, reminder.
- `state[path] = os.path.getmtime(path)` — `os.path.getmtime()` is a

small, self-explanatory `os.path` convenience function (same family as
- `os.path.basename`, `os.path.expanduser` — a direct equivalent to
reading `os.stat(path).st_mtime` directly, as Lesson 9 did; not given a
full lab since the idea "os.path has small metadata-reading utility
functions" is already well established).

### CS Lens

Not new — skipped per the Stopping Rule; this unit's real content was
the set operations in the lab above, not the snapshot-building code
itself.

### SE Lens

Using `os.path.getmtime()` (a timestamp) rather than a full content
hash (Lesson 13) as the "did this change" signal is a deliberate speed
tradeoff: reading a timestamp is one cheap system call per file;
hashing means reading every byte of every file, every single poll. For
a watcher checking frequently, that difference matters a lot — the
cost is that a file rewritten with the *exact same content* still
shows up as "modified" (its mtime changed even though nothing
meaningful did), a real, honest limitation of this choice.

### Commands Needed

None.

### Run It

Not runnable for meaningful comparison yet — one snapshot alone has
nothing to compare against.

### Connection

We can now capture a folder's state at one moment. The next unit
compares two such snapshots, taken at different times.

---

## Concept Unit: Diffing Two Snapshots

### The Problem

One snapshot is just a fact about one instant. To detect *change*, we
need two snapshots — an earlier one and a later one — and a way to
turn their difference into three real categories: added, removed, and
modified.

### Project Change

- **Files affected:** `watcher.py`
- **Change type:** add — a new function
- **Location:** after `snapshot()`
- **Dependencies:** `snapshot`'s return value (a dict)

### The New Code

```python
def diff_snapshots(old, new):
    old_paths = set(old)
    new_paths = set(new)
    added = new_paths - old_paths
    removed = old_paths - new_paths
    common = old_paths & new_paths
    modified = {p for p in common if old[p] != new[p]}
    return added, removed, modified
```

### The Updated Project

```python
import os

def snapshot(root):
    state = {}
    for dirpath, dirnames, filenames in os.walk(root):
        for filename in filenames:
            path = os.path.join(dirpath, filename)
            state[path] = os.path.getmtime(path)
    return state


def diff_snapshots(old, new):                            # ← new
    old_paths = set(old)                                     # ← new
    new_paths = set(new)                                        # ← new
    added = new_paths - old_paths                                  # ← new
    removed = old_paths - new_paths                                    # ← new
    common = old_paths & new_paths                                        # ← new
    modified = {p for p in common if old[p] != new[p]}                       # ← new
    return added, removed, modified                                            # ← new
```

`diff_snapshots()` now takes any two snapshots and correctly reports
exactly what changed between them — additions, removals, and content
modifications, as three separate sets.

### Mechanical Walkthrough
`old_paths = set(old)`, `new_paths = set(new)`, `added = new_paths -
- old_paths`, `removed = old_paths - new_paths`, `common = old_paths & new_paths` — all the exact set operations from this lesson's first

lab, reused for real. `modified = {p for p in common if old[p] !=
- new[p]}` — first appearance of a **set comprehension**: the same
comprehension idea as Lesson 5's list comprehension and Lesson 13's
- dict comprehension, here building a `set` instead — walking every path
present in *both* snapshots and keeping only the ones whose timestamp
actually changed.

### CS Lens

Not new beyond comprehensions and set operations already covered —
skipped per the Stopping Rule.

### SE Lens

Computing `added`, `removed`, and `modified` from two independent,
already-complete snapshots — rather than trying to track changes as
they happen — is a real and deliberate simplification: it means
`diff_snapshots()` doesn't need to know or care *how* the folder
changed, only what its state was at two distinct moments. The cost of
that simplicity is exactly what this lesson's closing section
demonstrates: anything that happens entirely *between* two polls is
invisible to this approach, no matter how the diffing logic itself is
written.

### Commands Needed

None new.

### Run It — Real Output

Using a background thread to make genuine file changes *during* a real
one-second interval between two snapshots — modifying one file,
deleting another, and creating a third:

```python
before = snapshot("watch_demo")
# real changes happen here, in another thread, during this window
after = snapshot("watch_demo")

added, removed, modified = diff_snapshots(before, after)
print("added:", added)
print("removed:", removed)
print("modified:", modified)
```

```
added: {'watch_demo/three.txt'}
removed: {'watch_demo/two.txt'}
modified: {'watch_demo/one.txt'}
```

Real output — all three real, independent changes correctly detected
and correctly categorized in one diff.

### Connection

We can now correctly diff any two snapshots. The last piece wires this
into a genuinely continuous, repeating watch loop.

---

## Building `watch()` (Reusing `time.sleep()`)

```python
import time

def watch(root, interval=1):
    previous = snapshot(root)
    print("watching...")
    while True:
        time.sleep(interval)
        current = snapshot(root)
        added, removed, modified = diff_snapshots(previous, current)
        for path in added:
            print(f"added: {path}")
        for path in removed:
            print(f"removed: {path}")
        for path in modified:
            print(f"modified: {path}")
        previous = current
```

`time.sleep(interval)` is Lesson 5's exact concept, reminder — reused
here to space out polls instead of measuring a rate. `while True:` is
Lesson 10's intentional-infinite-loop shape, reminder — this one has no
`break` at all, on purpose: a real watcher is meant to run until you
stop it (Ctrl+C, or closing the terminal), unlike Lesson 10's version
which terminated on an empty read. Nothing here is new beyond
`snapshot()` and `diff_snapshots()`, already fully built and verified
above — `watch()` is genuinely just "call both, repeatedly, forever."

**A note on how this was tested:** an infinite loop can't be "run to
completion" the way earlier lessons' code was. Every piece `watch()`
calls — `snapshot()` and `diff_snapshots()` — was independently run and
verified above with real file changes and real output; `watch()` itself
is just those two calls repeated inside a loop, which is why testing
each one directly, rather than watching the infinite loop run forever
in this document, is the honest way to verify it.

### Commands Needed

`python3 watcher.py` — runs it; `Ctrl+C` stops it, since nothing inside
the loop ever calls `break`.

### Connection

`watcher.py` is complete: a real, working directory watcher, built
entirely from pieces — snapshotting and set-based diffing — that were
independently tested and confirmed correct above.

---

## Closing

### Connect the Pieces

Trace one real detected change end to end: `watch_demo/one.txt` existed
in `before` with one `os.path.getmtime()` value. A separate thread
appended text to it during the sleep interval, genuinely changing its
modification time. `after` captured that new timestamp.
`diff_snapshots()` found `one.txt` in `common` (present in both
snapshots) and, via the set comprehension, compared `old["one.txt"]`
against `new["one.txt"]` — different — and included it in `modified`.
Nothing about *what* changed inside the file was inspected at all —
only that the timestamp moved, which is the entire signal this
approach relies on.

### What Breaks Without This

Polling has a real, structural blind spot: anything that happens
**entirely between two polls** never shows up at all, because there's
no snapshot that ever captured it existing.

```python
before = snapshot("watch_demo")

# a file created AND deleted entirely between two polls
with open("watch_demo/temp_file.txt", "w") as f:
    f.write("here and gone")
os.remove("watch_demo/temp_file.txt")

after = snapshot("watch_demo")
added, removed = diff_snapshots(before, after)[:2]
print("added:", added)
print("removed:", removed)
```

Real output:

```
added: set()
removed: set()
```

Genuinely real activity — a file was created and deleted — and the
watcher reports **nothing changed**, because by the time `after` was
captured, the file had already come and gone; `before` never saw it
either. This isn't a bug in `diff_snapshots()` — the diffing logic is
correct given what it was handed; the blind spot is structural to
polling itself, and it's exactly why real production file watchers
(inotify on Linux, FSEvents on macOS, not covered here) use OS-level
event notifications instead — the OS tells them the instant something
happens, rather than them having to ask "did anything change?"
periodically and hope nothing slipped through the gap.

### Exercises

1. Shrink `interval` to `0.1` and repeat the "here and gone" experiment
   with a longer-lived temporary file (say, existing for 0.5 seconds) —
   confirm a short enough polling interval *can* catch it, and think
   about why that's a mitigation, not a fix.
2. Extend `watch()` to also report *what specifically* changed for
   modified files — file size, using `os.path.getsize()` (Lesson 7) —
   alongside the timestamp change.
3. Swap the snapshot's value from `os.path.getmtime()` to Lesson 13's
   `hash_file()` — confirm this correctly ignores a file that's
   rewritten with identical content (a real false-positive this
   lesson's mtime-based version has, per this unit's SE Lens), at the
   real cost of a much slower poll on large folders.

### Definition of Done

- [ ] `watcher.py` runs, and you confirmed `snapshot()` and
      `diff_snapshots()` correctly detect a real addition, removal, and
      modification you triggered yourself
- [ ] You triggered the real "created and deleted between polls"
      blind spot and understand why it's structural to polling, not a
      bug in the diffing logic
- [ ] You can explain, without looking back, why this approach uses
      timestamps instead of Lesson 13's content hashing, and what that
      tradeoff costs
- [ ] Commit:

```
git add watcher.py
git commit -m "Add a polling directory watcher: prove change-detection can be built from two snapshots and a set diff, and that anything happening entirely between polls is structurally invisible to this approach"
```
