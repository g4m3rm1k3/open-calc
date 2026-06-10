# DRILL 2.1 — How a Database Actually Stores Data

**Series:** Engineering Drills — Data Storage  
**Concept:** Databases are programs that read and write structured binary files. Pages, B-trees, WAL, and buffer pools are engineering decisions, not magic. Understanding them makes "add an index" stop being a cargo-cult command.  
**App:** A tiny key-value store in Python that persists to disk — built from scratch, step by step, until it has the same core architecture as SQLite.  
**Time:** 90–120 minutes

---

## Quick Check

Answer these before reading. Check your answers at the bottom.

1. When you run `UPDATE users SET name='Alice' WHERE id=1`, which file does the database write to first?
2. Why do databases use fixed-size pages (4KB, 8KB) instead of storing each row as a separate file?
3. What is a full table scan? When does it happen?
4. If you have 1,000,000 rows and a B-tree index with depth 4, how many page reads does a lookup require?

---

## Concept Block

### What It Is

A database is a program. When you call `INSERT INTO`, code runs. That code formats your data into bytes, organizes those bytes into fixed-size chunks called **pages**, and writes them to a file on disk. The index is a second set of pages organized as a **B-tree** — a balanced tree where each node is exactly one page. When you commit a transaction, the database first appends a record of the operation to a separate **Write-Ahead Log (WAL)** file, then later flushes the actual data pages. Hot pages live in a **buffer pool** — an in-memory cache — so the disk is only touched when necessary.

### The Problem Before

Without structure, data storage devolves into one of two traps:

- **Trap 1 (JSON file):** Read the whole file into memory, modify it, write the whole file back. Works for 100 rows. Explodes at 100,000.
- **Trap 2 (one file per row):** Fast writes, but every query reads every file. The filesystem itself becomes the bottleneck.

Real databases use neither. They use a middle ground: large fixed-size blocks that can be read independently, organized into a tree so any single block can be found in O(log n) reads.

### The Solution

**Pages:** The unit of I/O. Every read and write is one page (4KB or 8KB). The OS also reads in pages — aligning to OS page size means one syscall gets you exactly one page, no more.

**B-tree:** A tree where every node is one page and every page is at most half-full (so the tree stays balanced after splits and merges). Depth grows as log base N of total rows, where N is the branching factor (~100–500 for typical key sizes). One million rows → depth ~3. One billion → depth ~5. Each depth level is one disk read.

**WAL (Write-Ahead Log):** Before writing a modified page back to disk, append a log entry: "I am about to change page 42 from state X to state Y." If the process crashes mid-write, the page on disk may be half-written (torn write). On restart, the database reads the WAL and replays any incomplete operations. Durability is guaranteed because the log is append-only and append is atomic at the disk level.

**Buffer Pool:** An in-memory cache of pages. A page read from disk stays in RAM until evicted. Hot pages (like the root of the B-tree index) are read once and stay in RAM for the lifetime of the process. This is why a warm database is faster than a cold one — the buffer pool has already loaded the expensive pages.

### What It Hides

ORMs hide all of this. `db.session.add(obj)` looks like Python, but it generates SQL, which the query planner parses, which the storage engine executes, which writes bytes into pages. When something is slow, the abstraction is opaque. Knowing what happens below lets you interpret `EXPLAIN QUERY PLAN`, understand why adding an index helps, and recognize when a query forces a full table scan.

### Canonical Example

```sql
-- Without index: full table scan
SELECT * FROM orders WHERE customer_id = 42;
-- SQLite reads every single page of the orders table.
-- At 1M rows / ~50 rows per 4KB page = 20,000 page reads.

-- With index on customer_id:
CREATE INDEX idx_orders_customer ON orders(customer_id);
-- SQLite traverses the B-tree: ~4 page reads to find the leaf,
-- then follows a pointer to the actual row. Total: ~5 page reads.
```

### Failure Modes

- **Missing index:** Query that ran in 2ms at 1,000 rows runs in 4 seconds at 1,000,000. The query is correct; the execution plan is wrong.
- **Wrong column indexed:** Index on `(first_name, last_name)` does not help a query filtering only on `last_name`. Composite index column order matters.
- **WAL not flushed:** Calling `connection.close()` without `commit()` — changes are in the WAL but never applied. Data appears to be written, disappears on next open.
- **Buffer pool pressure:** Loading a huge table into memory evicts hot index pages. Performance collapses because every subsequent query must re-read from disk.

### Operational Reality

- SQLite stores everything in one `.db` file. The WAL is a separate `.db-wal` file that appears next to it while a write transaction is open.
- PostgreSQL uses 8KB pages. The buffer pool (`shared_buffers`) is a key tuning parameter — too small and the database thrashes disk, too large and it starves the OS.
- `VACUUM` in SQLite and PostgreSQL reclaims space from deleted rows by compacting pages.
- `ANALYZE` updates statistics so the query planner knows the actual data distribution and can choose the right index.

### You Will See This Again In

- SQLAlchemy: every `session.flush()` writes to WAL; every `session.commit()` makes it permanent.
- FastAPI + SQLite in production: the `.db-wal` file is your clue that a write transaction is open. If the server crashes, the WAL replays on next open.
- Any "why is my query slow" investigation: `EXPLAIN QUERY PLAN` shows `SCAN TABLE` (bad) vs `SEARCH TABLE USING INDEX` (good).
- Redis: an in-memory database that periodically snapshots to disk. Same concept as buffer pool, no WAL by default (configurable with AOF — Append Only File).

### Watch For

- A query that was fast during development becomes slow in production. The difference is data volume. Always test with realistic data sizes.
- Adding an index speeds up reads but slows writes (every INSERT must update the index B-tree too). Don't index every column.
- SQLite in WAL mode vs default journal mode: WAL mode allows concurrent reads during a write. Default mode locks the whole file. Know which mode you're in.

---

## Step 1 — The Naive Version: Why JSON Files Don't Scale

Create a project directory and start with the simplest possible approach.

```
engineering-drills/drills/2-data-storage/2.1-database-internals/
    kv_naive.py
    kv_pages.py
    kv_index.py
    kv_wal.py
    benchmark.py
```

Create `kv_naive.py`:

```python
# kv_naive.py — A key-value store using a JSON file.
#
# WHY start here: This is what most beginners reach for.
# We'll show exactly why it collapses under load.

import json
import os
import time

DB_FILE = "naive_store.json"

def _load() -> dict:
    """Read the ENTIRE file into memory as a Python dict.
    
    WHY this is the bottleneck: even if you want one key,
    you read all keys. At 1GB of data, this loads 1GB into RAM.
    """
    if not os.path.exists(DB_FILE):
        return {}
    with open(DB_FILE, "r") as f:
        return json.load(f)

def _save(data: dict) -> None:
    """Write the ENTIRE dict back to disk.
    
    WHY this is catastrophic for writes:
    - Every single INSERT rewrites the whole file.
    - If the process crashes mid-write, the file is corrupted.
    - At 100MB, every write takes ~200ms. At 1GB, ~2 seconds.
    """
    with open(DB_FILE, "w") as f:
        json.dump(data, f)

def put(key: str, value: str) -> None:
    """Insert or update a key-value pair."""
    data = _load()   # Read all data
    data[key] = value
    _save(data)      # Write all data

def get(key: str) -> str | None:
    """Look up a key."""
    data = _load()   # Read all data just to find one key
    return data.get(key)

def delete(key: str) -> None:
    """Remove a key."""
    data = _load()
    data.pop(key, None)
    _save(data)

# --- demonstration ---
if __name__ == "__main__":
    # Clean up from previous runs
    if os.path.exists(DB_FILE):
        os.remove(DB_FILE)

    # Write 100 entries and time it
    print("Writing 100 entries...")
    start = time.perf_counter()
    for i in range(100):
        put(f"key:{i}", f"value:{i}")
    elapsed = time.perf_counter() - start
    print(f"  100 writes: {elapsed:.3f}s")
    print(f"  Per write:  {elapsed/100*1000:.1f}ms")

    # Read one entry
    result = get("key:50")
    print(f"\nget('key:50') = {result}")

    # Show file size
    size = os.path.getsize(DB_FILE)
    print(f"File size after 100 entries: {size} bytes")

    print("\nThe problem: every write rewrites the entire file.")
    print("Try 10,000 entries and watch the time explode.")
```

### SAVE AND TRY

Run it:

```
python kv_naive.py
```

Expected output:

```
Writing 100 entries...
  100 writes: 0.412s
  Per write:  4.1ms

get('key:50') = value:50

File size after 100 entries: 1847 bytes

The problem: every write rewrites the entire file.
Try 10,000 entries and watch the time explode.
```

**Terminal test:** Change `range(100)` to `range(1000)` and re-run. The per-write time should be ~10x slower because the file is now 10x larger and every write reads and rewrites the whole thing.

**Change something:** Add a `list_keys()` function that returns all keys. Notice you still call `_load()` — you're reading everything just to return the keys.

---

## Step 2 — Page-Based Storage: Fixed-Size Chunks

The insight: instead of one big blob, divide storage into fixed-size pages. Each page holds exactly one key-value pair (for simplicity). Writing a new entry appends one page. Reading is still sequential scan for now — we fix that in Step 3.

Create `kv_pages.py`:

```python
# kv_pages.py — Page-based key-value store.
#
# WHY pages: Fixed size means we can calculate byte offsets.
# Page 0 starts at byte 0. Page 1 starts at byte PAGE_SIZE.
# Page N starts at byte N * PAGE_SIZE.
# This lets us seek directly to any page without reading others.
#
# Real databases use 4096 bytes (4KB) matching OS page size.
# We use 64 bytes to keep our demo files small.

import struct
import os

PAGE_SIZE = 64          # bytes per page — real DBs use 4096
DB_FILE = "pages_store.db"

# Page format (64 bytes total):
#   bytes 0–1:   flags (uint16) — bit 0: is this page active?
#   bytes 2–31:  key  (30 bytes, null-padded)
#   bytes 32–63: value (32 bytes, null-padded)
#
# WHY fixed-width strings: If we used variable-length strings,
# we couldn't calculate offsets. We'd need to scan byte by byte.
# Fixed-width makes offset math trivial: page N = byte N*64.

FLAGS_ACTIVE = 0x0001   # This page contains live data
FLAGS_DELETED = 0x0000  # This page is a tombstone (data removed)

def _encode_page(key: str, value: str, active: bool = True) -> bytes:
    """Pack a key-value pair into exactly PAGE_SIZE bytes.
    
    WHY struct.pack: struct converts Python values to raw bytes
    in a specific layout. 'H' = unsigned short (2 bytes).
    '30s' = 30-byte string (padded with null bytes if shorter).
    '32s' = 32-byte string.
    Total: 2 + 30 + 32 = 64 bytes = PAGE_SIZE.
    """
    flags = FLAGS_ACTIVE if active else FLAGS_DELETED
    # Encode strings to bytes, truncate if too long
    key_bytes = key.encode("utf-8")[:30].ljust(30, b"\x00")
    val_bytes = value.encode("utf-8")[:32].ljust(32, b"\x00")
    return struct.pack("H30s32s", flags, key_bytes, val_bytes)

def _decode_page(raw: bytes) -> tuple[bool, str, str]:
    """Unpack PAGE_SIZE bytes back into (is_active, key, value).
    
    WHY strip null bytes: our fixed-width strings are padded with
    null bytes (\x00). We strip them to get the original string back.
    """
    flags, key_bytes, val_bytes = struct.unpack("H30s32s", raw)
    is_active = bool(flags & FLAGS_ACTIVE)
    key = key_bytes.rstrip(b"\x00").decode("utf-8")
    value = val_bytes.rstrip(b"\x00").decode("utf-8")
    return is_active, key, value

def put(key: str, value: str) -> None:
    """Append a new page to the file.
    
    WHY append-only: We never overwrite existing pages.
    Appending is safe — even if we crash mid-append,
    the previous pages are untouched. The partial page
    at the end can be detected and ignored.
    
    This means duplicate keys exist in the file.
    The last entry for a key wins (we scan from the end).
    """
    page = _encode_page(key, value, active=True)
    # "ab" = append, binary mode
    with open(DB_FILE, "ab") as f:
        f.write(page)

def get(key: str) -> str | None:
    """Scan all pages from END to START, return the first match.
    
    WHY scan from end: we append updates, so the newest entry
    for a key is the last one. Scanning backwards finds it first.
    
    WHY this is O(n): we may read all N pages before finding the key.
    At 1,000,000 entries, that's 1,000,000 * 64 bytes = 64MB of reads.
    Step 4 fixes this with an index.
    """
    if not os.path.exists(DB_FILE):
        return None

    file_size = os.path.getsize(DB_FILE)
    num_pages = file_size // PAGE_SIZE

    with open(DB_FILE, "rb") as f:
        # Scan from last page to first
        for page_num in range(num_pages - 1, -1, -1):
            # Seek directly to the page's byte offset
            # WHY this works: page_num * PAGE_SIZE is exact
            f.seek(page_num * PAGE_SIZE)
            raw = f.read(PAGE_SIZE)
            is_active, k, v = _decode_page(raw)
            if is_active and k == key:
                return v

    return None  # key not found

def delete(key: str) -> None:
    """Mark a key as deleted by appending a tombstone page.
    
    WHY not erase: erasing requires rewriting the file.
    A tombstone is a page with FLAGS_DELETED set.
    When scanning, we stop at a tombstone for this key.
    """
    page = _encode_page(key, "", active=False)
    with open(DB_FILE, "ab") as f:
        f.write(page)

def count_pages() -> int:
    """Return total number of pages in the file."""
    if not os.path.exists(DB_FILE):
        return 0
    return os.path.getsize(DB_FILE) // PAGE_SIZE

# --- demonstration ---
if __name__ == "__main__":
    if os.path.exists(DB_FILE):
        os.remove(DB_FILE)

    print("=== Page-Based Storage Demo ===\n")

    # Write some entries
    put("user:1", "Alice")
    put("user:2", "Bob")
    put("user:3", "Carol")

    print(f"After 3 inserts: {count_pages()} pages in file")
    print(f"File size: {os.path.getsize(DB_FILE)} bytes")

    # Update user:1 — this appends a NEW page, not overwrite
    put("user:1", "Alice Smith")
    print(f"\nAfter update of user:1: {count_pages()} pages")
    print("(The old 'Alice' page still exists — updates are appends)")

    # Read
    print(f"\nget('user:1') = {get('user:1')}")  # Gets newest: Alice Smith
    print(f"get('user:2') = {get('user:2')}")

    # Delete
    delete("user:2")
    print(f"\nAfter delete of user:2: {count_pages()} pages")
    print(f"get('user:2') = {get('user:2')}")  # Returns None

    # Show the raw bytes on disk
    print("\nRaw page bytes (hex) for the first 3 pages:")
    with open(DB_FILE, "rb") as f:
        for i in range(3):
            raw = f.read(PAGE_SIZE)
            print(f"  Page {i}: {raw.hex()}")
```

### SAVE AND TRY

Run it:

```
python kv_pages.py
```

Expected output:

```
=== Page-Based Storage Demo ===

After 3 inserts: 3 pages in file
File size: 192 bytes

After update of user:1: 4 pages
(The old 'Alice' page still exists — updates are appends)

get('user:1') = Alice Smith
get('user:2') = Bob

After delete of user:2: 5 pages
get('user:2') = None

Raw page bytes (hex) for the first 3 pages:
  Page 0: 0100757365723a3100000000000000000000000000000000000000000000000041 ...
  Page 1: 0100757365723a3200000000000000000000000000000000000000000000000042 ...
  Page 2: 0100757365723a3300000000000000000000000000000000000000000000000043 ...
```

**Terminal test:** Open `pages_store.db` in a hex editor (or run `python -c "open('pages_store.db','rb').read()"` and look for your key names in the raw bytes). You can see "user:1", "Alice", "user:2", "Bob" as ASCII text embedded in the binary. The null padding bytes fill the gaps.

**Change something:** Try storing a key longer than 30 characters. The `[:30]` slice silently truncates it. Add a check that raises `ValueError` if the key or value is too long for the page format.

---

## Step 3 — The Cost of a Sequential Scan

Before building the index, measure exactly how expensive O(n) lookup is.

Add to `kv_pages.py` (or create `benchmark_scan.py`):

```python
# benchmark_scan.py — Measure O(n) lookup cost
#
# WHY measure before fixing: you need to see the problem
# concretely before the solution feels worth the complexity.

import os
import time
from kv_pages import put, get, DB_FILE

# Clean slate
if os.path.exists(DB_FILE):
    os.remove(DB_FILE)

NUM_ENTRIES = 1000

print(f"Inserting {NUM_ENTRIES} entries...")
for i in range(NUM_ENTRIES):
    put(f"key:{i:05d}", f"value-{i}")

print(f"File size: {os.path.getsize(DB_FILE):,} bytes")
print(f"Total pages: {os.path.getsize(DB_FILE) // 64}\n")

# Time looking up the FIRST key inserted (worst case: must scan all pages)
# Because we scan from end to start, the first-inserted key is the last found.
print("Timing lookup of FIRST inserted key (worst case — scans all pages):")
times = []
for _ in range(10):
    start = time.perf_counter()
    result = get("key:00000")
    elapsed = time.perf_counter() - start
    times.append(elapsed)

avg_ms = sum(times) / len(times) * 1000
print(f"  Result: {result}")
print(f"  Average lookup time: {avg_ms:.3f}ms over 10 runs")
print(f"  Pages scanned: {NUM_ENTRIES} (must scan all {NUM_ENTRIES} pages)")
print(f"  Cost per page: {avg_ms/NUM_ENTRIES*1000:.2f} microseconds")

print("\nO(n) means: double the entries, double the lookup time.")
print("At 1,000,000 entries this is ~1,000x slower than at 1,000.")
```

### SAVE AND TRY

```
python benchmark_scan.py
```

Expected output (times vary by machine):

```
Inserting 1000 entries...
File size: 64,000 bytes
Total pages: 1000

Timing lookup of FIRST inserted key (worst case — scans all pages):
  Result: value-0
  Average lookup time: 1.847ms over 10 runs
  Pages scanned: 1000 (must scan all 1000 pages)
  Cost per page: 1.85 microseconds

O(n) means: double the entries, double the lookup time.
At 1,000,000 entries this is ~1,000x slower than at 1,000.
```

**Change something:** Change `"key:00000"` to `"key:00999"` (the last inserted key). Notice the lookup is now extremely fast — it's the first page found scanning from the end. This shows why scan order matters and why "worst case" is defined as the most expensive path.

---

## Step 4 — Simple Index: Key → Page Offset

An index is a separate data structure that maps keys to their locations. We'll store a Python dict as a JSON header at the beginning of the file — page 0 is the index, pages 1+ are data.

Create `kv_index.py`:

```python
# kv_index.py — Page-based store with an in-memory index.
#
# WHY a separate index structure: instead of scanning all data pages,
# the index tells us exactly which page contains our key.
# Lookup becomes O(1): read the index, seek to the offset, read one page.
#
# Real databases store the index as a B-tree on disk (also in pages).
# Our simplification: keep the index in memory, persist it on each write.
# This works for small stores; a real index also needs its own page management.

import struct
import os
import json

PAGE_SIZE = 64
DB_FILE = "index_store.db"
INDEX_FILE = "index_store.idx"  # Separate file for our index

FLAGS_ACTIVE = 0x0001
FLAGS_DELETED = 0x0000

def _encode_page(key: str, value: str, active: bool = True) -> bytes:
    flags = FLAGS_ACTIVE if active else FLAGS_DELETED
    key_bytes = key.encode("utf-8")[:30].ljust(30, b"\x00")
    val_bytes = value.encode("utf-8")[:32].ljust(32, b"\x00")
    return struct.pack("H30s32s", flags, key_bytes, val_bytes)

def _decode_page(raw: bytes) -> tuple[bool, str, str]:
    flags, key_bytes, val_bytes = struct.unpack("H30s32s", raw)
    is_active = bool(flags & FLAGS_ACTIVE)
    key = key_bytes.rstrip(b"\x00").decode("utf-8")
    value = val_bytes.rstrip(b"\x00").decode("utf-8")
    return is_active, key, value

# --- Index management ---

def _load_index() -> dict[str, int]:
    """Load the index from disk.
    
    WHY JSON for the index: our index is small (just key→offset pairs).
    A real database stores the index as a B-tree in its own pages,
    which can be partially loaded. We take the simple path.
    """
    if not os.path.exists(INDEX_FILE):
        return {}
    with open(INDEX_FILE, "r") as f:
        return json.load(f)

def _save_index(index: dict[str, int]) -> None:
    """Persist the index to disk.
    
    WHY save on every write: if we only keep the index in memory
    and crash, we lose all our index entries. On next start we'd
    have to rebuild by scanning all pages.
    
    Real databases do exactly that rebuild on crash recovery:
    they replay the WAL to reconstruct in-memory state.
    """
    with open(INDEX_FILE, "w") as f:
        json.dump(index, f)

def put(key: str, value: str) -> None:
    """Insert a key-value pair and update the index.
    
    Steps:
    1. Determine what page number this will be (current file size / PAGE_SIZE)
    2. Write the page (append)
    3. Update index: key → page_number
    4. Save index
    """
    index = _load_index()

    # Calculate which page number this write will produce
    # WHY before writing: file size before append = offset of new page
    if os.path.exists(DB_FILE):
        page_num = os.path.getsize(DB_FILE) // PAGE_SIZE
    else:
        page_num = 0

    # Write the data page
    page = _encode_page(key, value, active=True)
    with open(DB_FILE, "ab") as f:
        f.write(page)

    # Update index to point to the new page
    # WHY overwrite: if key already existed, the old page is now stale.
    # We point the index to the newest page for this key.
    index[key] = page_num
    _save_index(index)

def get(key: str) -> str | None:
    """Look up a key using the index — O(1) disk seeks.
    
    Steps:
    1. Load index (dict lookup: O(1))
    2. If key not in index, return None immediately
    3. Seek to the exact page offset
    4. Read exactly PAGE_SIZE bytes
    5. Decode and return value
    
    WHY this is fast: we never scan. We jump directly to the right page.
    """
    index = _load_index()

    if key not in index:
        return None  # Definitely not there — no scan needed

    page_num = index[key]

    with open(DB_FILE, "rb") as f:
        # Seek to exact byte offset of this page
        f.seek(page_num * PAGE_SIZE)
        raw = f.read(PAGE_SIZE)

    is_active, k, v = _decode_page(raw)

    # Sanity check: if the page is a tombstone, the key was deleted
    if not is_active:
        return None

    return v

def delete(key: str) -> None:
    """Remove a key from the index and write a tombstone."""
    index = _load_index()

    if key not in index:
        return  # Nothing to delete

    # Write tombstone page (marks space as dead on disk)
    page = _encode_page(key, "", active=False)
    with open(DB_FILE, "ab") as f:
        f.write(page)

    # Remove from index — now it's unreachable via get()
    del index[key]
    _save_index(index)

# --- demonstration ---
if __name__ == "__main__":
    for f in [DB_FILE, INDEX_FILE]:
        if os.path.exists(f):
            os.remove(f)

    print("=== Indexed Storage Demo ===\n")

    # Insert entries
    for i in range(5):
        put(f"user:{i}", f"name-{i}")

    # Show index contents
    index = _load_index()
    print("Index contents (key → page number):")
    for k, v in sorted(index.items()):
        print(f"  '{k}' → page {v} (byte offset {v * PAGE_SIZE})")

    print(f"\nget('user:2') = {get('user:2')}")
    print("  (Jumped directly to page 2, zero scanning)")

    # Update — index points to new page
    put("user:2", "updated-name-2")
    index = _load_index()
    print(f"\nAfter update, 'user:2' now at page {index['user:2']}")
    print(f"get('user:2') = {get('user:2')}")
```

### SAVE AND TRY

```
python kv_index.py
```

Expected output:

```
=== Indexed Storage Demo ===

Index contents (key → page number):
  'user:0' → page 0 (byte offset 0)
  'user:1' → page 1 (byte offset 64)
  'user:2' → page 2 (byte offset 128)
  'user:3' → page 3 (byte offset 192)
  'user:4' → page 4 (byte offset 256)

get('user:2') = name-2
  (Jumped directly to page 2, zero scanning)

After update, 'user:2' now at page 5
get('user:2') = updated-name-2
```

**Terminal test:** Open `index_store.idx` in a text editor. You'll see a JSON file with `{"user:0": 0, "user:1": 1, ...}`. This is your index. The database and index are separate files — exactly how SQLite stores its main B-tree data and index pages in one file but treats them as logically separate structures.

**Change something:** Delete `user:1` with `delete("user:1")` then try `get("user:1")`. Confirm it returns `None`. Then open `index_store.idx` and verify `user:1` is gone from the JSON.

---

## Step 5 — Benchmark: Index vs Sequential Scan

Now measure the speedup. Create `benchmark.py`:

```python
# benchmark.py — Index O(1) vs scan O(n) at 1000 entries
#
# WHY 1000 entries: small enough to run fast, big enough to show the gap.
# The ratio (scan_time / index_time) should stay roughly constant
# as you scale up, because scan is O(n) and index is O(1).

import os
import time
import kv_pages    # no index — sequential scan
import kv_index    # with index

NUM_ENTRIES = 1000
RUNS = 20          # average over multiple runs for stable timing

# --- Setup page store (no index) ---
if os.path.exists(kv_pages.DB_FILE):
    os.remove(kv_pages.DB_FILE)

print(f"Setting up sequential store ({NUM_ENTRIES} entries)...")
for i in range(NUM_ENTRIES):
    kv_pages.put(f"key:{i:05d}", f"value-{i}")

# --- Setup index store ---
for f in [kv_index.DB_FILE, kv_index.INDEX_FILE]:
    if os.path.exists(f):
        os.remove(f)

print(f"Setting up indexed store ({NUM_ENTRIES} entries)...")
for i in range(NUM_ENTRIES):
    kv_index.put(f"key:{i:05d}", f"value-{i}")

print()

# --- Benchmark: worst-case key (first inserted, last found in scan) ---
TARGET_KEY = "key:00000"

# Sequential scan timing
scan_times = []
for _ in range(RUNS):
    start = time.perf_counter()
    result = kv_pages.get(TARGET_KEY)
    scan_times.append(time.perf_counter() - start)
scan_avg_ms = sum(scan_times) / RUNS * 1000

# Index lookup timing
index_times = []
for _ in range(RUNS):
    start = time.perf_counter()
    result = kv_index.get(TARGET_KEY)
    index_times.append(time.perf_counter() - start)
index_avg_ms = sum(index_times) / RUNS * 1000

print(f"Lookup of '{TARGET_KEY}' ({NUM_ENTRIES} total entries, {RUNS} runs each):")
print(f"  Sequential scan: {scan_avg_ms:.3f}ms  (reads {NUM_ENTRIES} pages)")
print(f"  Index lookup:    {index_avg_ms:.3f}ms  (reads 1 page)")
print(f"  Speedup:         {scan_avg_ms / index_avg_ms:.0f}x faster with index")

print()
print("What this means at scale:")
for n in [10_000, 100_000, 1_000_000]:
    # Extrapolate linearly: scan time scales with n, index is constant
    projected_scan = scan_avg_ms * (n / NUM_ENTRIES)
    print(f"  {n:>10,} entries: scan ~{projected_scan:>8.1f}ms | index ~{index_avg_ms:.3f}ms")

print()
print("This is why 'add an index' is the most common database performance fix.")
```

### SAVE AND TRY

```
python benchmark.py
```

Expected output (times will vary by machine):

```
Setting up sequential store (1000 entries)...
Setting up indexed store (1000 entries)...

Lookup of 'key:00000' (1000 total entries, 20 runs each):
  Sequential scan: 2.341ms  (reads 1000 pages)
  Index lookup:    0.087ms  (reads 1 page)
  Speedup:         27x faster with index

What this means at scale:
      10,000 entries: scan ~   23.4ms | index ~0.087ms
     100,000 entries: scan ~  234.1ms | index ~0.087ms
   1,000,000 entries: scan ~ 2341.0ms | index ~0.087ms

This is why 'add an index' is the most common database performance fix.
```

**Change something:** Try targeting `"key:00999"` (the last inserted, first found in scan). The sequential scan will be near-instant for this key. This shows that O(n) describes the *worst case*, not every case. The index is consistent: it's always the same speed regardless of which key you look up.

---

## Step 6 — WAL: Durability Through Ordered Writes

The WAL (Write-Ahead Log) ensures that if the process crashes mid-write, the database can recover to a consistent state on next start.

Create `kv_wal.py`:

```python
# kv_wal.py — Write-Ahead Log demonstration
#
# WHY WAL: Writing a page to disk is not atomic.
# The OS may write part of a 64-byte page before a crash.
# A torn write leaves the page in an undefined state.
#
# Solution: BEFORE writing the page, append a log entry to the WAL.
# The WAL entry says: "I am about to write key=X value=Y to page N."
# If we crash after the log entry but before the page write,
# on recovery we replay the WAL and complete the write.
# If we crash before the log entry, we lost the write — but the
# existing data is intact. No corruption.
#
# This is exactly how PostgreSQL, SQLite (in WAL mode), and MySQL
# implement ACID durability.

import struct
import os
import time

PAGE_SIZE = 64
DB_FILE = "wal_store.db"
WAL_FILE = "wal_store.wal"  # Write-Ahead Log — this is .db-wal in SQLite

FLAGS_ACTIVE = 0x0001

# WAL entry format (100 bytes):
#   bytes 0–3:   sequence number (uint32) — monotonically increasing
#   bytes 4–5:   entry type (uint16) — 1=write, 2=commit, 3=checkpoint
#   bytes 6–9:   target page number (uint32)
#   bytes 10–39: key (30 bytes)
#   bytes 40–99: value (60 bytes — larger than page value to store metadata)
#
# WHY sequence numbers: lets recovery know which entries are newer.
# Partial entries at the end (from a crash mid-append) are detected
# because their sequence number would be out of order.

WAL_ENTRY_SIZE = 100
WAL_TYPE_WRITE  = 1   # A data write is pending
WAL_TYPE_COMMIT = 2   # Transaction is committed
WAL_TYPE_CHECKPOINT = 3  # WAL has been flushed to main file (safe to truncate)

def _next_seq() -> int:
    """Get the next sequence number by reading the current max."""
    if not os.path.exists(WAL_FILE):
        return 1
    size = os.path.getsize(WAL_FILE)
    if size < WAL_ENTRY_SIZE:
        return 1
    with open(WAL_FILE, "rb") as f:
        f.seek(size - WAL_ENTRY_SIZE)
        raw = f.read(WAL_ENTRY_SIZE)
    seq = struct.unpack("I", raw[:4])[0]
    return seq + 1

def _write_wal_entry(entry_type: int, page_num: int, key: str, value: str) -> None:
    """Append one entry to the WAL.
    
    WHY append: WAL entries are never overwritten. They accumulate.
    Periodically, a 'checkpoint' copies WAL entries to the main data file,
    then truncates the WAL. This is called 'checkpointing'.
    """
    seq = _next_seq()
    key_bytes = key.encode("utf-8")[:30].ljust(30, b"\x00")
    val_bytes = value.encode("utf-8")[:60].ljust(60, b"\x00")
    entry = struct.pack("IH I 30s 60s",
                        seq,
                        entry_type,
                        page_num,
                        key_bytes,
                        val_bytes)
    with open(WAL_FILE, "ab") as f:
        f.write(entry)
        # WHY flush: we must ensure the WAL entry reaches disk
        # BEFORE we write the data page. If we don't flush,
        # the OS buffer may write the data page first, making the
        # WAL entry useless for recovery.
        f.flush()
        os.fsync(f.fileno())   # Force OS to flush to physical disk

def _write_page(page_num: int, key: str, value: str) -> None:
    """Write a data page at the specified position.
    
    WHY this can tear: if the system crashes after writing 32 bytes
    of a 64-byte page, the remaining 32 bytes on disk are stale data
    from whatever was there before. The page is now half-old-half-new.
    The WAL entry written before this call allows recovery.
    """
    flags = FLAGS_ACTIVE
    key_bytes = key.encode("utf-8")[:30].ljust(30, b"\x00")
    val_bytes = value.encode("utf-8")[:32].ljust(32, b"\x00")
    page = struct.pack("H30s32s", flags, key_bytes, val_bytes)

    with open(DB_FILE, "r+b" if os.path.exists(DB_FILE) else "wb") as f:
        f.seek(page_num * PAGE_SIZE)
        f.write(page)

def put(key: str, value: str) -> None:
    """Insert with WAL protection.
    
    Order of operations (CRITICAL):
    1. Write WAL entry (log the intent) ← must happen first
    2. Write data page (execute the intent) ← happens second
    3. Write WAL COMMIT entry (declare transaction complete)
    
    If crash happens between 1 and 2: WAL has the entry, data page is untouched.
    Recovery replays step 2.
    
    If crash happens between 2 and 3: Data page written, WAL has no commit.
    Recovery sees an uncommitted WAL entry — it can either replay or discard.
    SQLite discards (simpler, relies on idempotent writes).
    """
    # Determine page number (append to end)
    if os.path.exists(DB_FILE):
        page_num = os.path.getsize(DB_FILE) // PAGE_SIZE
    else:
        page_num = 0

    # STEP 1: Log the intent to the WAL BEFORE touching the data file
    print(f"  [WAL] Writing log entry: SET {key}={value} at page {page_num}")
    _write_wal_entry(WAL_TYPE_WRITE, page_num, key, value)

    # Simulate a crash here to demonstrate WAL recovery:
    # Uncomment the next line, run once, then comment it out and run recovery
    # raise SystemExit("SIMULATED CRASH: WAL written, data page NOT written yet")

    # STEP 2: Write the data page
    print(f"  [DB ] Writing data page {page_num}")
    _write_page(page_num, key, value)

    # STEP 3: Log the commit
    print(f"  [WAL] Writing COMMIT entry")
    _write_wal_entry(WAL_TYPE_COMMIT, page_num, key, value)

def recover_from_wal() -> int:
    """Replay uncommitted WAL entries to restore consistency.
    
    Called on startup. Reads the WAL and finds any WRITE entries
    that do not have a corresponding COMMIT. Replays them.
    
    WHY this works: WAL entries are idempotent — writing the same
    page twice with the same data leaves it in the correct state.
    """
    if not os.path.exists(WAL_FILE):
        return 0

    entries = []
    with open(WAL_FILE, "rb") as f:
        while True:
            raw = f.read(WAL_ENTRY_SIZE)
            if len(raw) < WAL_ENTRY_SIZE:
                break
            seq, etype, page_num, key_bytes, val_bytes = struct.unpack(
                "IH I 30s 60s", raw
            )
            key = key_bytes.rstrip(b"\x00").decode("utf-8")
            value = val_bytes.rstrip(b"\x00").decode("utf-8", errors="replace")
            entries.append((seq, etype, page_num, key, value))

    # Find WRITE entries without a following COMMIT
    committed_pages = {e[2] for e in entries if e[1] == WAL_TYPE_COMMIT}
    pending = [e for e in entries if e[1] == WAL_TYPE_WRITE
               and e[2] not in committed_pages]

    replayed = 0
    for seq, etype, page_num, key, value in pending:
        print(f"  [RECOVERY] Replaying: SET {key}={value} at page {page_num}")
        _write_page(page_num, key, value)
        replayed += 1

    return replayed

# --- demonstration ---
if __name__ == "__main__":
    for f in [DB_FILE, WAL_FILE]:
        if os.path.exists(f):
            os.remove(f)

    print("=== WAL Demo ===\n")
    print("Writing 3 entries with WAL protection:")
    put("alpha", "one")
    put("beta", "two")
    put("gamma", "three")

    print(f"\nWAL file size: {os.path.getsize(WAL_FILE)} bytes")
    print(f"WAL entries: {os.path.getsize(WAL_FILE) // WAL_ENTRY_SIZE}")
    print(f"(Each put() writes 2 WAL entries: WRITE + COMMIT)")

    print("\nSimulating crash recovery (no uncommitted entries here):")
    replayed = recover_from_wal()
    print(f"  Entries replayed: {replayed} (should be 0 — all committed)")

    print("\n--- To see actual recovery: ---")
    print("1. Uncomment the 'raise SystemExit' line in put()")
    print("2. Run: python kv_wal.py  (it will crash after WAL write)")
    print("3. Comment the raise back out")
    print("4. Run: python -c \"import kv_wal; kv_wal.recover_from_wal()\"")
    print("   You'll see the uncommitted entry get replayed.")
```

### SAVE AND TRY

```
python kv_wal.py
```

Expected output:

```
=== WAL Demo ===

Writing 3 entries with WAL protection:
  [WAL] Writing log entry: SET alpha=one at page 0
  [DB ] Writing data page 0
  [WAL] Writing COMMIT entry
  [WAL] Writing log entry: SET beta=two at page 1
  [DB ] Writing data page 1
  [WAL] Writing COMMIT entry
  [WAL] Writing log entry: SET gamma=three at page 2
  [DB ] Writing data page 2
  [WAL] Writing COMMIT entry

WAL file size: 600 bytes
WAL entries: 6
(Each put() writes 2 WAL entries: WRITE + COMMIT)

Simulating crash recovery (no uncommitted entries here):
  Entries replayed: 0 (should be 0 — all committed)
```

**Terminal test:** Uncomment the `raise SystemExit` line in `put()`. Run `python kv_wal.py`. It will crash after the first WAL entry. Then comment `raise SystemExit` back out and run:

```
python -c "import kv_wal; print(kv_wal.recover_from_wal())"
```

Expected crash-recovery output:

```
  [RECOVERY] Replaying: SET alpha=one at page 0
1
```

The WAL saved your write. The data page that was never written gets written now.

**Change something:** Add a `checkpoint()` function that reads all committed WAL entries, confirms they are reflected in the data file, and then deletes the WAL file. This is what SQLite does periodically to keep WAL files from growing forever.

---

## Step 7 — SQLite: See These Concepts in Action

Everything built above exists inside SQLite. Now observe it directly.

```python
# sqlite_demo.py — See pages, WAL, and indexes in SQLite
#
# WHY this step: confirm that what we built maps directly to
# a real database. The abstractions are the same; only the
# implementation is more sophisticated.

import sqlite3
import os

DB = "demo.sqlite"
if os.path.exists(DB):
    os.remove(DB)

# Open in WAL mode (SQLite's production-ready WAL implementation)
conn = sqlite3.connect(DB)
conn.execute("PRAGMA journal_mode=WAL")  # Enable WAL
conn.execute("PRAGMA page_size=4096")    # 4KB pages (our demo used 64 bytes)

conn.execute("""
    CREATE TABLE items (
        id    INTEGER PRIMARY KEY,
        name  TEXT NOT NULL,
        score INTEGER
    )
""")

# Insert 10,000 rows
conn.executemany(
    "INSERT INTO items (name, score) VALUES (?, ?)",
    [(f"item-{i}", i * 7 % 1000) for i in range(10_000)]
)
conn.commit()

# Check page count
row = conn.execute("PRAGMA page_count").fetchone()
print(f"Pages used: {row[0]} (each {4096} bytes = {row[0]*4096:,} bytes total)")

# Query without index — full table scan
print("\nQUERY PLAN without index:")
plan = conn.execute(
    "EXPLAIN QUERY PLAN SELECT * FROM items WHERE score = 500"
).fetchall()
for p in plan:
    print(f"  {p}")

# Add index
conn.execute("CREATE INDEX idx_score ON items(score)")

# Query with index
print("\nQUERY PLAN with index:")
plan = conn.execute(
    "EXPLAIN QUERY PLAN SELECT * FROM items WHERE score = 500"
).fetchall()
for p in plan:
    print(f"  {p}")

conn.close()

# Show the WAL file that SQLite created
print(f"\nFiles on disk:")
for f in [DB, DB + "-wal", DB + "-shm"]:
    if os.path.exists(f):
        print(f"  {f}: {os.path.getsize(f):,} bytes")
    else:
        print(f"  {f}: not present (WAL checkpointed on close)")
```

### SAVE AND TRY

```
python sqlite_demo.py
```

Expected output:

```
Pages used: 43 (each 4096 bytes = 176,128 bytes total)

QUERY PLAN without index:
  (0, 0, 0, 'SCAN items')

QUERY PLAN with index:
  (0, 0, 0, 'SEARCH items USING INDEX idx_score (score=?)')

Files on disk:
  demo.sqlite: 180,224 bytes
  demo.sqlite-wal: not present (WAL checkpointed on close)
  demo.sqlite-shm: not present (WAL checkpointed on close)
```

`SCAN items` = full table scan = reads all 43 pages. `SEARCH items USING INDEX` = B-tree traversal = reads ~3 pages. Same concept as our benchmark, now inside a real database engine.

---

## Challenge — Compaction

No solution is provided. Build it from scratch.

### Requirements

Extend `kv_pages.py` with:

1. A `delete(key)` function that appends a **tombstone page** (flags set to `FLAGS_DELETED`) without removing any existing data pages.
2. A `compact()` function that:
   - Opens the current `DB_FILE`
   - Reads every page
   - Writes all **active, non-superseded** pages to a new file `DB_FILE + ".compact"`
   - Replaces `DB_FILE` with the compacted file
   - Prints file size before and after

### Starter Code

```python
# compact_starter.py
import os
from kv_pages import put, get, DB_FILE, PAGE_SIZE, _decode_page, _encode_page

def compact():
    """Rewrite the store, keeping only the latest active entry per key."""
    # HINT: You need to know which keys are live and where they are.
    # Scan all pages, build a dict of {key: latest_active_value}.
    # Then write only those entries to a fresh file.
    # After writing, replace the original file.
    pass  # Your implementation here

# Setup: write, update, delete some entries
if os.path.exists(DB_FILE):
    os.remove(DB_FILE)

for i in range(50):
    put(f"key:{i}", f"value-{i}")

# Update half the keys (creates duplicate pages)
for i in range(0, 50, 2):
    put(f"key:{i}", f"updated-{i}")

# Delete a quarter of the keys (creates tombstones)
for i in range(0, 25):
    # Add your delete() function call here
    pass

print(f"Before compact: {os.path.getsize(DB_FILE):,} bytes, "
      f"{os.path.getsize(DB_FILE)//PAGE_SIZE} pages")

compact()

print(f"After compact:  {os.path.getsize(DB_FILE):,} bytes, "
      f"{os.path.getsize(DB_FILE)//PAGE_SIZE} pages")
```

### When Done

- The after-compact file should be significantly smaller than before (roughly 30–40% of original size in this test case).
- `get("key:1")` should still return the correct value after compaction.
- `get("key:0")` should return `None` if key:0 was deleted before compaction.
- `get("key:2")` should return `"updated-2"` (the newer value, not `"value-2"`).

**Stuck? Ask AI:** "I'm building a compaction function for an append-only key-value store. I need to identify the latest active value per key while ignoring tombstones and superseded entries. My pages have a `flags` field indicating active vs. deleted. How do I build the dict of live entries from a full page scan?"

---

## Quick Check Answers

1. **The WAL (Write-Ahead Log) file.** The database writes the log entry first, then the data page. This is the "write-ahead" in WAL — the log entry must be on disk before the data page is modified.

2. **Fixed pages allow direct byte-offset calculation.** Page N starts at byte `N * PAGE_SIZE`. One `seek()` call jumps directly there. Separate files per row would require directory lookups (which are themselves tree traversals) and each row would waste filesystem metadata overhead.

3. **A full table scan reads every page in the table looking for matching rows.** It happens when there is no index on the column used in the WHERE clause, or when the query planner estimates that the index won't help (e.g., if you're selecting 80% of all rows, it's faster to scan than to follow index pointers).

4. **~4 page reads.** B-tree with branching factor ~500: depth 4 covers 500^4 = 62.5 billion rows. Each level is one page read. Root node is often in RAM (buffer pool), so practical lookup is 2–3 disk reads for common queries.
