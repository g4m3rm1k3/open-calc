# Python Tool Database — LAB 60 — File System Navigation with pathlib

**Prerequisites:** Lab 55 (import pipeline). You can import a single `.tooldb` file. This lesson teaches you to find all the `.tooldb` files in a directory so you can import them in a batch.

**What this lab adds:**
- `pathlib.Path` — a path as an object with methods, not a string you manipulate with `os.path`
- `Path.glob()` and `Path.rglob()` — finding files by pattern
- `Path.stat()` — file size and last-modified timestamp
- Generators vs lists — why `.glob()` is lazy and when that matters

**Time:** 35–45 minutes

---

## What You Will Build

A script that scans a directory and prints every `.tooldb` file it finds, with its size and age:

```
Scanning: C:\Users\g4m3r\Desktop\tool_libraries
  shop_floor.tooldb       │  48 KB │ modified 2 days ago
  archive\old_tools.tooldb│  12 KB │ modified 30 days ago
  backup\tools_v2.tooldb  │  51 KB │ modified 1 day ago

Found 3 file(s).
```

---

> **Quick Check — try to answer before reading:**
>
> 1. `"C:\\Users\\g4m3r" + "\\" + "tools.db"` works but is fragile. What breaks it on macOS or Linux?
> 2. `Path.glob("*.tooldb")` returns a generator. `list(Path.glob("*.tooldb"))` returns a list. What is the practical difference if there are 10,000 files in the directory?
> 3. You want to find `.tooldb` files in a directory AND all its subdirectories. Which method: `glob()` or `rglob()`?
>
> *(Answers at the end of this lab)*

---

## Concept: `pathlib.Path`

**What it is:** A Python object that represents a file system path. Instead of building paths by concatenating strings, you use `/` to join path segments and call methods like `.exists()`, `.stat()`, and `.glob()` directly on the object.

**The problem before:**

```python
import os

base = "C:\\Users\\g4m3r\\tool_libraries"
subdir = os.path.join(base, "shop_floor")      # string concatenation
full_path = os.path.join(subdir, "tools.db")
exists = os.path.exists(full_path)
size   = os.path.getsize(full_path)
```

`os.path` works, but every operation is a function call with a string. The path has no identity — it is just a string you pass around.

**The solution:**

```python
from pathlib import Path

base     = Path("C:/Users/g4m3r/tool_libraries")
subdir   = base / "shop_floor"          # / operator joins segments
full_path = subdir / "tools.db"
exists   = full_path.exists()
size     = full_path.stat().st_size
```

**What it hides:** Platform-specific path separators. `Path("a") / "b"` produces `a\b` on Windows and `a/b` on macOS/Linux. You write one `/`; `pathlib` uses the right separator for the OS.

**The protected invariant:** A `Path` object is always a valid, platform-appropriate path. String concatenation with `+` or `os.path.join` can produce invalid paths if you accidentally use the wrong separator or add an extra one.

**Smallest possible example:**

```python
from pathlib import Path

p = Path(".")          # current directory
print(p.resolve())     # absolute path
print(p.exists())      # True
print(p / "subdir" / "file.txt")   # Path('subdir/file.txt')
```

**You will see this again in:** Every modern Python project. `pathlib` replaced `os.path` as the idiomatic way to handle files in Python 3.4+. FastAPI, SQLAlchemy, and every major library accepts `Path` objects anywhere they accept a filename string.

**Watch for:** `Path("C:/Users")` works on Windows even though Windows uses backslashes — `pathlib` normalizes it. `str(path)` converts back to a string if a library requires one.

---

## Step 1 — Build a Path and Check It

```python
from pathlib import Path
import os

# Create a test directory structure
test_dir = Path("test_libraries")
test_dir.mkdir(exist_ok=True)           # mkdir — exist_ok means no error if it exists
(test_dir / "shop_floor.tooldb").touch()    # touch() creates an empty file
(test_dir / "archive").mkdir(exist_ok=True)
(test_dir / "archive" / "old_tools.tooldb").touch()

print(test_dir.exists())        # True
print(test_dir.is_dir())        # True
print(test_dir / "shop_floor.tooldb")  # test_libraries\shop_floor.tooldb
```

### SAVE AND TRY

Run it. You should see `True`, `True`, and the path to the file.

**You should see:**
```
True
True
test_libraries\shop_floor.tooldb
```

**Change something:** Change `test_dir.exists()` to `(test_dir / "missing.tooldb").exists()`. Expected: `False`. Change it back.

---

## Step 2 — Find Files with `glob()`

```python
# glob() searches for files matching a pattern in THIS directory only
direct = list(test_dir.glob("*.tooldb"))
print(f"Direct: {len(direct)} file(s)")
for p in direct:
    print(f"  {p.name}")
```

### SAVE AND TRY

**You should see:**
```
Direct: 1 file(s)
  shop_floor.tooldb
```

`glob()` found only the file directly in `test_dir`. The one in `archive/` was not returned — it is a subdirectory. Now switch to `rglob()`:

```python
# rglob() = recursive glob — searches all subdirectories too
recursive = list(test_dir.rglob("*.tooldb"))
print(f"Recursive: {len(recursive)} file(s)")
for p in recursive:
    print(f"  {p}")
```

**You should see:**
```
Recursive: 2 file(s)
  test_libraries\shop_floor.tooldb
  test_libraries\archive\old_tools.tooldb
```

**Change something:** Change `"*.tooldb"` to `"*.db"`. Expected: `0` files — your test files use the `.tooldb` extension. Change it back.

---

## Step 3 — File Metadata with `stat()`

`p.stat()` returns a `stat_result` object. The two fields you need most:

```python
import time
from pathlib import Path

def describe_file(p: Path) -> str:
    stat = p.stat()
    size_kb = stat.st_size / 1024                       # bytes → kilobytes
    age_days = (time.time() - stat.st_mtime) / 86400   # seconds → days
    return f"{p.name:<30} │ {size_kb:6.1f} KB │ modified {age_days:.0f} day(s) ago"
```

`stat.st_size` is size in bytes. `stat.st_mtime` is the last-modified time as a Unix timestamp (seconds since 1970). Subtracting from `time.time()` gives you elapsed seconds.

### SAVE AND TRY

```python
for p in test_dir.rglob("*.tooldb"):
    print(describe_file(p))
```

**You should see** something like:
```
shop_floor.tooldb              │    0.0 KB │ modified 0 day(s) ago
old_tools.tooldb               │    0.0 KB │ modified 0 day(s) ago
```

(Your test files are empty, so 0 KB. Real `.tooldb` files will show actual sizes.)

**Change something:** Replace `stat.st_mtime` with `stat.st_ctime`. On Windows, `ctime` is the creation time; on Linux it is the inode change time. You should see the same value for freshly created files. Change it back.

---

## Step 4 — The Scanner Function

```python
from pathlib import Path
from typing import Iterator


def scan_for_tooldb_files(directory: str | Path) -> Iterator[Path]:
    """
    Yields every .tooldb file found in directory and all subdirectories.
    Uses a generator — does not load all paths into memory at once.
    Skips files it cannot read due to permission errors.
    """
    root = Path(directory)
    if not root.is_dir():
        raise ValueError(f"Not a directory: {root}")

    for path in root.rglob("*.tooldb"):
        try:
            path.stat()      # verify it's readable — raises PermissionError if not
            yield path
        except PermissionError:
            print(f"  [skipped — no permission] {path}")
```

The `yield` keyword makes this a generator — it returns one path at a time without building the full list in memory. For a directory with 10,000 `.tooldb` files, a generator starts returning results immediately; `list(rglob(...))` would load all 10,000 paths before you could process the first one.

### SAVE AND TRY

```python
for path in scan_for_tooldb_files("test_libraries"):
    print(describe_file(path))
print("Done.")
```

**You should see** the two test files described. "Done." prints immediately after — the scan is sequential, not waiting for a background thread.

---

## 🎯 Challenge: Sort by Most Recently Modified

**You know:** `scan_for_tooldb_files` yields `Path` objects. `path.stat().st_mtime` is a timestamp — higher means more recent.

**Task:** Write `scan_sorted_by_age(directory) -> list[Path]` that returns all `.tooldb` files sorted newest-first.

**Starting code:**
```python
def scan_sorted_by_age(directory: str | Path) -> list[Path]:
    paths = list(scan_for_tooldb_files(directory))
    # sort by modification time, newest first
    ...
    return paths
```

---

<details>
<summary>▶ Show Solution</summary>

```python
def scan_sorted_by_age(directory: str | Path) -> list[Path]:
    paths = list(scan_for_tooldb_files(directory))
    return sorted(paths, key=lambda p: p.stat().st_mtime, reverse=True)
```

**Key insight:** `sorted()` with a `key` function reads the mtime once per file. `reverse=True` puts the newest (highest timestamp) first. This same pattern — `sorted(items, key=lambda x: x.some_attribute)` — is how you sort any collection of objects by a computed property in Python.

</details>

---

## Final Check

| What to verify | How to verify |
|---|---|
| `Path("a") / "b" / "c"` produces a valid path, not a string | `type(Path("a") / "b")` → `<class 'pathlib.PosixPath'>` or `WindowsPath` |
| `glob("*.tooldb")` finds only direct children | Run Step 2 — count: 1 |
| `rglob("*.tooldb")` finds files in subdirectories | Run Step 2 recursive — count: 2 |
| `stat().st_size` returns bytes, not KB | Print raw value for a known file |
| Generator: `scan_for_tooldb_files` returns one path at a time | Add `print("yielding")` before `yield` — it prints before the loop body runs each time |

---

## Quick Check Answers

**1. What breaks when you concatenate paths with `+` on macOS/Linux?**
Windows uses `\` as a path separator; macOS and Linux use `/`. String concatenation with `"C:\\Users\\" + name` hardcodes the backslash. On macOS, the path becomes `C:\Users\name`, which is not a valid path. `Path` handles separators automatically — the same code works on all platforms.

**2. Generator vs list with 10,000 files:**
`list(path.glob(...))` reads all 10,000 file entries from the file system and stores them in RAM before returning. `path.glob(...)` returns a generator that reads one entry at a time on demand. For the first file, the generator is faster (no waiting for the full scan). For the whole collection, memory usage is proportional to what you process at once, not what exists on disk.

**3. `glob()` vs `rglob()`:**
`rglob("*.tooldb")` — the `r` stands for recursive. It descends into every subdirectory. `glob("*.tooldb")` only searches the immediate directory. For finding files anywhere under a root directory, always use `rglob`.
