# Concept: `pathlib.Path`

**What you'll understand by the end:** what a `Path` object actually is,
how `__file__`, `.parent`, and `.absolute()` combine to locate a file
relative to the script that names it, and why this is preferred over
building paths as plain strings.

**Prerequisites:** none.

## What it is

`Path` is Python's standard-library object representing a filesystem
path — a file or directory location — as a real object with methods on
it, not a bare string you'd otherwise have to slice and concatenate by
hand.

## Implementation

From the `pathlib` module in Python's standard library:

```python
from pathlib import Path

class Path:
    def __init__(self, *pathsegments): ...

    @property
    def parent(self) -> "Path": ...   # the containing directory, one level up

    def absolute(self) -> "Path": ...  # this path, made absolute if it wasn't already
```

- `Path(*pathsegments)` — builds a `Path` from one or more string
  segments, joining them with the correct separator for the current
  operating system (`\` on Windows, `/` elsewhere) automatically —
  code that builds paths this way behaves correctly on both without
  an `if` statement anywhere.
- `__file__` — not part of `Path` at all; a variable Python sets
  automatically inside every module, holding that module's own file
  path as a string. `Path(__file__)` turns that string into a real
  `Path` object.
- `.parent` — a property (read like an attribute, no `()`) returning a
  new `Path` one directory up from the current one. `Path(__file__)`
  is the file itself; `.parent` is the folder containing it.
- `.absolute()` — a method returning an equivalent `Path`, guaranteed
  to start from the filesystem root rather than being relative to
  whatever directory a program happened to be run from. `__file__` is
  usually already absolute in practice, but nothing guarantees that in
  every situation Python can be invoked from — calling `.absolute()`
  removes the question entirely rather than relying on that usually
  holding true.
- `str(a_path)` / `os.path.join(a_path, "more")` — a `Path` object
  converts to a plain string when one is needed (both work directly, no
  explicit `str()` required in most cases), so it composes with older,
  string-based APIs without friction.

## Its use

`BASE_DIR = Path(__file__).parent.absolute()` reads right to left in
effect, left to right in execution: take this file's own path
(`__file__`), find its containing folder (`.parent`), and make that
folder path absolute (`.absolute()`) — a directory path anchored to
wherever this specific source file lives on disk, regardless of what
directory a terminal happened to be sitting in when the program was
started. Building `DATA_PATH` from `BASE_DIR` this way means the
program finds its own data folder correctly no matter where it's
launched from — a real, common bug class in the alternative (hardcoding
a relative path like `"data/manufacturing.db"`) is that it only works
when the program is launched from one specific working directory.

## Try It Yourself

1. In a real Python file (not a scratch REPL, since `__file__` isn't
   defined there), print `__file__`, then `Path(__file__)`, then
   `Path(__file__).parent`, then `Path(__file__).parent.absolute()` —
   one per line — and compare all four.
2. Run that same file from two different starting directories (`cd` into
   its own folder first, then `cd` somewhere else and run it by full
   path) and confirm `.absolute()`'s output is identical both times,
   while a plain relative string path would not have been.
