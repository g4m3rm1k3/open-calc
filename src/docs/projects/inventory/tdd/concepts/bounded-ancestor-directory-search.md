# Concept: Bounded Ancestor-Directory Search

**What you'll understand by the end:** how to search a filesystem
**upward** from a starting directory toward a declared real root,
rather than the filesystem's actual top, and the real, deliberate
safety check that refuses to search at all if that declared root isn't
genuinely an ancestor of the starting point.

**Prerequisites:** `python-pathlib-file-reading.md`.

## Setup

Python 3, no packages needed (`pathlib` is standard library).

## The Problem

Finding a real, related file — a subprogram referenced by number, not
by full path — sometimes means searching not just the current
directory but its real parent directories too, since a real project
might organize related files across nested folders. A completely
unbounded upward search (walking all the way to a real filesystem's
actual root) is both slow and a real, genuine safety risk — it could
wander into unrelated directories far outside any sensible real
project boundary. A **bounded** search needs an explicit, real stopping
point.

## The Isolated Example

```python
from pathlib import Path

def find_ancestor_file(program_number, start_dir, root_dir):
    start_dir = start_dir.resolve()
    root_dir = root_dir.resolve()

    if root_dir != start_dir and root_dir not in start_dir.parents:
        return None  # refuse to search -- root isn't really an ancestor

    current = start_dir
    while True:
        for candidate in sorted(current.iterdir()):
            if candidate.is_file() and candidate.stem.lstrip("O") == program_number:
                return candidate
        if current == root_dir:
            break
        current = current.parent
    return None


root = Path("/real/project")
deep_start = Path("/real/project/subdir/deeper")

found = find_ancestor_file("1000", deep_start, root)
print("found while walking upward from a deep subdirectory:", found)

result = find_ancestor_file("1000", Path("/real/project"), Path("/not-a-real-ancestor"))
print("refuses to search when root is not a real ancestor:", result)
```

**Real output, run this session:**
```
found while walking upward from a deep subdirectory: /real/project/O1000.txt
refuses to search when root is not a real ancestor: None
```

**What this proves:** starting from a real, deeply-nested subdirectory
(`.../subdir/deeper`), the search genuinely walked **upward**,
directory by directory, until it found `O1000.txt` sitting in the real
declared root two levels up — confirming the upward walk itself works.
The second, real call — where `root_dir` genuinely isn't an ancestor of
`start_dir` at all — correctly returned `None` **immediately**, without
searching anywhere, rather than silently searching from `start_dir`
with no real boundary at all.

## Mechanical Walkthrough

- `Path.resolve()` normalizes a path to its real, absolute,
  canonical form — resolving `..`/`.` segments and symbolic links —
  necessary before comparing two paths for a real ancestor relationship,
  since two differently-written paths could otherwise refer to the
  identical real location without comparing as equal.
- `Path.parents` is a real, ordered sequence of every ancestor
  directory of a path, from its immediate parent up to the real
  filesystem root — `root_dir not in start_dir.parents` is a real,
  idiomatic way to ask "is this genuinely an ancestor of that,"
  checked once, up front, before any real directory walking begins.
- `Path.stem` gives a filename without its extension (`"O1000"` from
  `"O1000.txt"`) — combined with `.lstrip("O")` here to recover the
  real, bare program number for comparison.
- `Path.iterdir()` lists a real directory's immediate contents;
  wrapping it in `sorted(...)` gives a real, deterministic order —
  without it, the real order real operating systems return directory
  entries in is not guaranteed to be consistent.
- The loop walks `current = current.parent` **upward**, one real
  directory at a time, stopping the moment `current == root_dir` is
  reached — the search never goes beyond that declared, real boundary,
  even if a match might exist further up the real filesystem tree.

## CS Lens

This is a real, bounded instance of **tree traversal** — walking
upward through a real filesystem's own implicit tree structure
(directories nested inside directories) toward a declared root, rather
than an unbounded walk to the tree's actual top. The explicit ancestor
check before searching at all is a real, deliberate **safety
boundary** — refusing to even begin an operation whose scope can't be
verified as valid, rather than performing a real, partial search and
hoping it happens to stay within bounds.

Also recognized in: version control systems walking upward from a
working directory to find a real repository root (`.git`); build tools
walking upward to find a real project's own configuration file
(`pyproject.toml`, `package.json`) — the identical real "search
upward, stop at a real boundary" shape, differing only in what marks
the boundary.

## SE Lens

The real, practical value of the explicit ancestor check: without it,
a caller accidentally passing a `root_dir` that isn't really an
ancestor of `start_dir` would either search the wrong real directory
tree entirely, or (worse, if the loop condition weren't carefully
written) risk never terminating, walking indefinitely upward with no
real boundary ever satisfied. Checking the relationship **once, up
front**, and refusing outright if it's invalid is real, cheap
insurance against a whole class of real, silent misconfiguration bugs.

## Connection

Builds on `python-pathlib-file-reading.md`. A real, applied instance in
this project's own history: resolving a real subprogram call (`M98
P1000`) to an actual file on disk, searching upward from the calling
program's own directory but never beyond a declared, real project
root.

## Try It Yourself

1. Construct a real directory structure where the target file exists
   **above** the declared `root_dir` (outside the searched boundary)
   and confirm the search correctly returns `None` — direct, real proof
   the boundary is genuinely enforced, not just checked once and then
   ignored.
2. Pass `start_dir == root_dir` (searching a single, real directory
   with no upward walking at all) and confirm the function still works
   correctly for that real, minimal case.
3. Rewrite the safety check using `start_dir == root_dir or root_dir in
   start_dir.parents` combined via `or` instead of the original
   `and`-based negation — confirm it's logically equivalent, and reason
   about which phrasing you find easier to read correctly at a glance.
