# Lesson 9: A Picture Sent as Text

**What you will build** — a real "Analyze" button next to any selected
table: click it, and the actual, running window shows real mean/
standard-deviation statistics for every real numeric column, plus a
real histogram — a genuine, rendered image — computed entirely by
`pandas`/`matplotlib` inside this project's own Python sidecar, with no
new database capability at all. The real, transferable problem
underneath: getting a real, binary image out of a headless Python
process, across this project's own text-only JSON-lines protocol
(Lesson 2), into an actual `<img>` element in the renderer — three real
boundaries, each one requiring a real, different trick to cross.

**What you need to know first:** Lesson 2 (the JSON-lines protocol,
`query_server.py`), `pocket-db`'s own Lesson 25 (`pandas.DataFrame`
built from real, queried rows — reused here, not re-taught), Lesson 6
(this project's own real form patterns).

**Terms introduced in this lesson:**
- **headless / non-interactive backend** — software producing a real,
  actual output (here, an image) without ever opening a real, visible
  window on a real screen. `query_server.py` runs as a spawned child
  process with no display attached at all (Lesson 2) — a real, ordinary
  plotting call that tries to *show* a window would either hang
  waiting for one or crash outright.
- **Data URL** — a real, standard (`RFC 2397`) way of embedding a
  file's own actual bytes directly inside a URL string
  (`data:<mime-type>;base64,<data>`), instead of a URL that *points at*
  a separate, real file. A browser — or Electron's own renderer,
  built on the identical real Chromium — treats a Data URL exactly like
  any normally-fetched image, with no second, real network or
  filesystem request at all.

**Objects and methods used**
- **`hasattr`**
  - *What it is:* Python's own real, standard builtin — checks whether
    a real, given object has an attribute of a real, given name at all,
    returning a plain `True`/`False`, without ever raising if it's
    missing.
  - *Implementation:* `hasattr(object, name: str) -> bool`.
  - *Its use:* this lesson's own real, defensive check for
    `os.add_dll_directory`, which only real, actually exists on
    Windows.
- **`next`** (with a default argument)
  - *What it is:* Python's own real, standard builtin for pulling one
    real value out of an iterator — the real, two-argument form used
    here never raises `StopIteration` on a real, empty iterator; it
    returns the given default instead.
  - *Implementation:* `next(iterator, default)`.
  - *Its use:* this lesson's own real, third unit — real-picking the
    first numeric column's own name out of `stats`, or `None` if
    `stats` turned out real, genuinely empty.
- **`os.add_dll_directory`** (Python's standard `os` module, Windows-only)
  - *What it is:* a real, modern (Python 3.8+) function telling
    `ctypes`' own real DLL loader an additional, real directory to
    search for a dependent `.dll` — the actual, current replacement for
    manipulating the whole process's own `PATH` environment variable.
  - *Implementation:* `os.add_dll_directory(path: str) -> _AddedDllDirectory`.
  - *Its use:* this lesson's own first, real fix — see the first
    Concept Unit.
- **`pandas.DataFrame`**
  - *What it is:* `pandas`'s own real, two-dimensional, labeled data
    structure — the identical real type `pocket-db`'s own Lesson 25
    already gave full treatment to (real construction, real
    `.groupby()`), reused here without repeating that explanation.
  - *Implementation:* `pd.DataFrame(rows, columns=column_names)`.
  - *Its use:* this lesson's own real, first step — turning `query()`'s
    already-real rows into something `pandas` can compute real
    statistics over.
- **`pandas.to_numeric`**
  - *What it is:* a real `pandas` function converting one real column of
    string values into real numbers — raising a real, catchable error
    the moment a value genuinely isn't numeric, rather than silently
    producing garbage.
  - *Implementation:* `pd.to_numeric(df[column])` — returns a real
    `pandas.Series` of real numbers, or raises `ValueError`/`TypeError`.
  - *Its use:* this lesson's own real, automatic way to tell a numeric
    column (`INTEGER`) from a text one (`TEXT`) without needing this
    project's own schema type codes at all.
- **`matplotlib.pyplot.subplots` / `Axes.hist` / `Figure.savefig`**
  - *What they are:* `matplotlib`'s own real, standard plotting
    objects — `subplots()` returns a real, paired `(Figure, Axes)`
    tuple (the whole real image, and the real, single chart drawn
    inside it); `Axes.hist` draws a real histogram onto that `Axes`;
    `Figure.savefig` writes the real, whole `Figure` out as a real
    image, to a real file *or* — this lesson's own real use — an
    in-memory buffer.
  - *Implementation:* `figure, axes = plt.subplots()`;
    `axes.hist(values, bins=10)`; `figure.savefig(buffer, format="png")`.
  - *Its use:* this lesson's own real histogram, built and encoded with
    no real file ever written to disk.
- **`io.BytesIO`**
  - *What it is:* Python's own real, standard in-memory binary buffer —
    behaves like a real, open, writable file (supports `.write()`, and
    anything expecting a file-like object accepts it), but every real
    byte lives only in memory, never on disk.
  - *Implementation:* `buffer = io.BytesIO()`; `buffer.getvalue()`
    returns the real, accumulated `bytes`.
  - *Its use:* the real target `Figure.savefig` writes the histogram's
    own real PNG bytes into.
- **`base64.b64encode`**
  - *What it is:* Python's own real, standard function converting
    arbitrary real binary data into a real string using only 64
    printable ASCII characters — reversible with `base64.b64decode`.
  - *Implementation:* `base64.b64encode(data: bytes) -> bytes`, then
    `.decode("ascii")` for a real, ordinary Python `str`.
  - *Its use:* this lesson's own real, only way to fit a real, binary
    PNG image inside one real line of this project's own JSON-lines
    protocol (Lesson 2), which reads one real, textual line at a time.

---

## Concept Unit: The Bug the PATH Fix Left Behind

### The Problem

`PocketDBClient` (Lesson 2) has always spawned `python` with
`C:\msys64\ucrt64\bin` prepended to the child's own `PATH`, fixing a
real, original problem: `pocketdb_engine.dll`'s own dependent DLLs
weren't found otherwise. That fix has quietly shipped since Lesson 2,
through every later lesson — including Lesson 8's own real packaging
work — without ever causing a visible problem, because no lesson's own
`query_server.py` had ever needed a Python package before.

### Introduce the Concept in Isolation

The real, exact spawn this project has used since Lesson 2, run
directly, the moment `query_server.py` gained its first real `import
pandas` line for this lesson:

```javascript
spawn("python", ["-u", "query_server.py"], {
  env: { ...process.env, PATH: "C:\\msys64\\ucrt64\\bin;" + process.env.PATH },
});
```

Real, captured failure:

```text
ERR: Traceback (most recent call last):
  File "query_server.py", line 6, in <module>
    import pandas as pd
ModuleNotFoundError: No module named 'pandas'
```

*What this proves:* prepending `C:\msys64\ucrt64\bin` doesn't only add a
real DLL search directory — it also changes which real `python.exe`
the bare command name `"python"` resolves to, since that same folder
happens to contain its own, real, separate Python installation. `where
python`, run with this project's own real, ordinary, unmodified `PATH`,
resolves to a completely different, real interpreter — the one this
project has actually always installed its own packages into:

```text
$ where python
C:\Users\g4m3r\AppData\Local\Microsoft\WindowsApps\python.exe
```

Lesson 2's own real fix has been silently shadowing the *correct*
Python with a *different*, real, package-less one this entire time —
invisible until a lesson's own code needed a package only one of them
actually had.

### Discard the Throwaway Example

The isolated `spawn` call above reproduced a real bug in already-shipped
project code; it is not new project code itself and is not kept
separately — this unit's own real fix, next, replaces the approach it
exposed.

### Project Change

- **Reference Source:** `pocketdb.py:1-6` (this project's own copy, not
  `pocket-db`'s) — the real, original `ctypes.CDLL(_dll_path)` call this
  lesson adds one real line before.
- **Files affected:** `pocketdb.py` (modified — `os.add_dll_directory`),
  `src/pocketdb-client.ts` (modified — `extraPathEntry` removed),
  `src/main.ts` (modified — the now-simpler `PocketDBClient` call).
- **Change type:** Replace.
- **Dependencies:** None beyond what Lesson 2 already established.

### The New Code — `pocketdb.py`

```python
if hasattr(os, "add_dll_directory"):
    os.add_dll_directory("C:\\msys64\\ucrt64\\bin")
```

### The Updated Project — `pocketdb.py`

```python
import ctypes
import csv
import os

if hasattr(os, "add_dll_directory"):
    os.add_dll_directory("C:\\msys64\\ucrt64\\bin")

_dll_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "pocketdb_engine.dll")
_engine = ctypes.CDLL(_dll_path)
```

`os.add_dll_directory` now runs *before* `ctypes.CDLL` ever tries to
load `pocketdb_engine.dll` — the real DLL search directory is
registered directly, inside the process that actually needs it,
instead of being smuggled in through the *whole process's* own `PATH`,
which is what caused this unit's own real bug in the first place.

With the DLL search fixed at its real, correct source,
`PocketDBClient`'s own constructor no longer needs to touch `PATH` at
all:

```typescript
constructor(pythonPath: string, scriptPath: string) {
  this.process = spawn(pythonPath, [scriptPath]);
  this.process.stdout.on("data", (chunk: Buffer) => this.handleData(chunk));
}
```

And `main.ts`'s own call site simplifies to match:

```typescript
dbClient = new PocketDBClient("python", path.join(dir, "query_server.py"));
```

Real, re-run proof, the identical real spawn as this unit's own first
step, now with no `PATH` override at all:

```text
OUT: {"id": 1, "result": {"ok": true}}
```

### Mechanical Walkthrough

- `hasattr(os, "add_dll_directory")` — reappearing shape (`hasattr`,
  first used nowhere in this project yet — first appearance here) — a
  real, defensive check, since `add_dll_directory` only exists on
  Windows; this project only ever runs on Windows, but the check costs
  nothing and documents the real, platform-specific reason for this
  line's existence.
- `os.add_dll_directory("C:\\msys64\\ucrt64\\bin")` — covered fully in
  Objects and methods used, above.
- `spawn(pythonPath, [scriptPath])` — reappearing shape (Lesson 2's own
  `child_process.spawn`) — the real, new fact is only that the second,
  real `options` argument (previously a real, custom `env`) is gone
  entirely; `spawn` now inherits the real, ordinary, unmodified
  environment Node's own process already has.

### CS Lens

This is a real, small instance of **narrowing a fix to its actual
cause** — the original Lesson 2 fix solved a real problem ("the DLL
isn't found") by widening something far broader than the problem itself
("the whole process's `PATH`"), and that width is exactly what let it
collide with something unrelated later. `os.add_dll_directory` fixes
the identical real problem at the real, narrowest point that actually
has it.

Also recognized in: a firewall rule opened for one specific real port
instead of a whole subnet; a SQL grant given to one specific real table
instead of an entire schema; a Python `import` inside one function
instead of a module-wide `sys.path` mutation — every one of these
trades a broader, real fix that's easier to write for a narrower one
that can't collide with something unrelated later.

### SE Lens

Why not just install `pandas` into the *other* Python — the one at
`C:\msys64\ucrt64\bin\python.exe` — so the original, prepended-`PATH`
approach keeps working unchanged? Because that real interpreter has no
real package manager available at all (`python -m pip` fails there with
`No module named pip`), and even if it did, this project would then
depend on *two* real, separately-maintained Python environments staying
in sync forever — a real, ongoing maintenance cost `os.add_dll_directory`
avoids entirely by needing exactly one, real, already-correct Python
installation, unchanged.

### Commands Needed

```bash
python -m pip install pandas matplotlib
```

Already satisfied on this machine from earlier, real work; a fresh
reader's own real Python (the one `where python` resolves to,
*without* `C:\msys64\ucrt64\bin` on `PATH`) needs both installed once.

### Run It

Shown above, under "The Updated Project."

### Connection

The real interpreter this project has always meant to run is now the
one it actually runs, unconditionally. `pandas` — and everything this
lesson still needs to build — can finally be trusted to import
correctly.

---

## Concept Unit: Real Rows Become a Real DataFrame, Inside the Protocol

### The Problem

`analyze`, this lesson's own new protocol method, needs to answer "what
are this table's own real statistics" — the identical real question
`pocket-db`'s own Lesson 25 already answered from a standalone script.
Here, the same real technique has to run *inside* `query_server.py`
itself, and has to decide *automatically* which of a table's own real
columns are even numeric, since the caller (this project's own React
UI) never says.

### Project Change

- **Reference Source:** No reference counterpart — `query_server.py` is
  this project's own file; `pocket-db`'s Lesson 25 is a *pattern* reused
  here, not a file this project reads from directly.
- **Files affected:** `query_server.py` (modified — a new `elif method
  == "analyze":` branch).
- **Change type:** Add.
- **Location:** `query_server.py`'s own `handle_request`, alongside the
  existing `elif` chain (Lesson 2).
- **Dependencies:** This lesson's own first unit (a working `import
  pandas`).

### The New Code — `query_server.py`

```python
columns = conn._db.schema(table)
records = conn._db.query(table)
rows = [r.values() for r in records]
df = pd.DataFrame(rows, columns=columns)

stats = {}
for column in columns:
    try:
        numeric = pd.to_numeric(df[column])
    except (ValueError, TypeError):
        continue
    stats[column] = {
        "mean": float(numeric.mean()),
        "stdev": float(numeric.std(ddof=1)) if len(numeric) > 1 else 0.0,
    }
```

### The Updated Project — `query_server.py`

```python
import sys
import json
import io
import base64
import dbapi
import pandas as pd
import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt

conn = None


def handle_request(request):
    method = request["method"]
    params = request.get("params", {})

    if method == "open":
        global conn
        conn = dbapi.connect(params["path"])
        return {"ok": True}
    elif method == "list_tables":
        return {"tables": conn._db.table_names()}
    elif method == "get_rows":
        table = params["table"]
        records = conn._db.query(table)
        if not records:
            return {"columns": conn._db.schema(table), "rows": []}
        return {"columns": records[0].columns(), "rows": [r.values() for r in records]}
    elif method == "run_query":
        sql = params["sql"]
        cursor = conn.cursor()
        cursor.execute(sql)
        columns = [d[0] for d in cursor.description] if cursor.description else []
        return {"columns": columns, "rows": cursor.fetchall()}
    elif method == "create_table":
        table = params["table"]
        columns = params["columns"]
        conn._db.create_table(table, **columns)
        return {"ok": True}
    elif method == "insert_row":
        table = params["table"]
        values = params["values"]
        conn._db.insert(table, *values)
        return {"ok": True}
    elif method == "analyze":
        table = params["table"]
        columns = conn._db.schema(table)          # ← new
        records = conn._db.query(table)            # ← new
        rows = [r.values() for r in records]        # ← new
        df = pd.DataFrame(rows, columns=columns)     # ← new

        stats = {}                                    # ← new
        for column in columns:                        # ← new
            try:                                       # ← new
                numeric = pd.to_numeric(df[column])     # ← new
            except (ValueError, TypeError):             # ← new
                continue                                 # ← new
            stats[column] = {                            # ← new
                "mean": float(numeric.mean()),             # ← new
                "stdev": float(numeric.std(ddof=1)) if len(numeric) > 1 else 0.0,  # ← new
            }                                                # ← new
        # histogram encoding: next unit
        return {"rowCount": len(records), "stats": stats}   # ← new (extended next unit)
    else:
        raise ValueError(f"Unknown method: {method}")


for line in sys.stdin:
    line = line.strip()
    if not line:
        continue
    request = json.loads(line)
    try:
        result = handle_request(request)
        response = {"id": request["id"], "result": result}
    except Exception as e:
        response = {"id": request["id"], "error": str(e)}
    print(json.dumps(response), flush=True)
```

`handle_request`'s own real shape — a plain `if`/`elif` chain over
`method`, each real branch returning a real, plain dict `handle_request`
hands back to the same, unchanged real response-writing loop at the
bottom — is exactly what Lesson 2 already established; this lesson adds
one more real branch, nothing about the dispatch mechanism itself
changes.

### Mechanical Walkthrough

- `columns = conn._db.schema(table)` — reappearing shape (`pocket-db`'s
  own `schema()`, already used since this project's own Lesson 5) — a
  real, ordered list of this table's own real column names.
- `records = conn._db.query(table)` — reappearing shape (`pocket-db`'s
  own `query()`, Lesson 4) — every real, current row.
- `rows = [r.values() for r in records]` — reappearing shape (list
  comprehension, already used throughout this project's own protocol
  methods) — `Record.values()` (`pocket-db`'s own Lesson 4) returns each
  real row as a plain tuple, the exact real shape `pd.DataFrame` expects.
- `df = pd.DataFrame(rows, columns=columns)` — a hard concept
  reappearing (per the Repetition Rule) — the identical real
  `pandas.DataFrame` construction `pocket-db`'s own Lesson 25 already
  gave full treatment to: a real list of same-shaped rows, labeled with
  real column names, immediately gaining `pandas`'s own real, built-in
  aggregate methods.
- `for column in columns:` — reappearing syntax (a `for` loop over a
  list, already established) — the real, new idea is iterating every
  column to *discover* which are numeric, rather than being told.
- `try: numeric = pd.to_numeric(df[column]) except (ValueError,
  TypeError): continue` — covered fully in Objects and methods used,
  above (Terms); `continue` is reappearing syntax (already established)
  — silently skips a real, non-numeric column (`player`, a `TEXT`
  column whose real, stored values are still quote-wrapped, per this
  project's own Lesson 4 storage format) rather than crashing the whole
  real request over one column that was never going to have a
  meaningful mean anyway.
- `float(numeric.mean())` / `float(numeric.std(ddof=1))` — reappearing
  shape (`pocket-db`'s own Lesson 25 `numpy`/`pandas` standard-deviation
  pattern, `ddof=1` already explained there as *sample* standard
  deviation) — the real, new `float(...)` wrapper matters because
  `pandas` real, native number types (`numpy.float64`) aren't
  real, valid JSON on their own; `json.dumps` (already used since Lesson
  2's own response loop) only accepts real, plain Python `float`.
- `len(numeric) > 1` — reappearing shape (`len`, already established)
  — a real, deliberate guard: `.std(ddof=1)` divides by `n - 1`, which
  is genuinely undefined (a real `ZeroDivisionError`, or a real `NaN`)
  for a table with exactly one real row.

### CS Lens

Deciding "is this column numeric" by *attempting* the real conversion
and catching real failure, rather than consulting this project's own
already-known `INTEGER`/`TEXT` schema type codes directly, is a real,
deliberate instance of **duck typing** ("if it converts like a number,
treat it like one") over **explicit type dispatch**. It costs a real,
slightly wasteful attempt-and-discard for every genuinely non-numeric
column, but it means `analyze` never needs its own, separate, parallel
understanding of this project's schema type codes at all — one real
source of truth (whether the *data itself* parses), not two.

### SE Lens

Why not just pass `conn._db`'s own already-known column types
(`INTEGER`/`TEXT`, `pocketdb.py`'s own real constants) straight into
`analyze`, instead of re-discovering numeric-ness through
`pd.to_numeric`? Because `schema()` (Lesson 5) only ever returns real
column *names* — this project's own real `extern "C"` boundary
(`pocket-db`'s own `database_column_names`) has never exposed column
*types* back to Python at all, an honest, real gap this lesson works
around rather than closes; closing it for real would mean a new,
real `pocket-db`-side addition, out of this lesson's own, deliberately
narrow scope.

### Commands Needed

No new commands for this unit — `pandas` was already installed in this
lesson's own first unit.

### Run It

Real, isolated proof — `pd.to_numeric` on a small, real `DataFrame`
matching this project's own real, quoted-`TEXT` storage convention:

```python
rows = [("1", "'alice'", "42"), ("2", "'bob'", "88")]
df = pd.DataFrame(rows, columns=["id", "player", "score"])
print("id numeric:", pd.to_numeric(df["id"]).tolist())
print("score numeric:", pd.to_numeric(df["score"]).tolist())
try:
    pd.to_numeric(df["player"])
except (ValueError, TypeError) as e:
    print("player raised:", type(e).__name__, "-", e)
```

Real output:

```text
id numeric: [1, 2]
score numeric: [42, 88]
player raised: ValueError - Unable to parse string "'alice'" at position 0
```

*What this proves:* `id`/`score` (real `INTEGER` columns, stored as
plain digit strings) convert cleanly; `player` (a real `TEXT` column,
stored quote-wrapped) raises exactly the real, catchable
`ValueError` this unit's own `try`/`except` relies on — automatic
numeric detection, proven, not assumed.

### Connection

Real statistics exist as a real Python dict. Turning them into
something the actual, running window can *see* — a real chart — is
next.

---

## Concept Unit: A Chart That Never Opens a Window

### The Problem

`matplotlib`'s own ordinary, real behavior — the same real behavior
every earlier, standalone `pocket-db` script used (`analyze.py`,
Lesson 23) — tries to open a real, visible plot window. `query_server.py`
runs as a spawned child process with no real display attached at all
(Lesson 2); a real plotting call expecting one would hang or crash.

### Introduce the Concept in Isolation

Save this as `agg_check.py`:

```python
import io
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

figure, axes = plt.subplots()
axes.hist([1, 2, 2, 3, 3, 3, 4, 4, 5], bins=5)
buffer = io.BytesIO()
figure.savefig(buffer, format="png")
plt.close(figure)

data = buffer.getvalue()
print("byte count:", len(data))
print("first bytes:", data[:8])
print("is PNG signature:", data[:8] == b"\x89PNG\r\n\x1a\n")
```

Run with:

```bash
python agg_check.py
```

Real output:

```text
byte count: 8053
first bytes: b'\x89PNG\r\n\x1a\n'
is PNG signature: True
```

This is called a **headless / non-interactive backend**, named in the
Header above — *what this proves:* a real, complete, valid PNG image
(its own real, standard 8-byte signature, `\x89PNG\r\n\x1a\n`, present
and correct) exists as real bytes in memory, with no real window, no
real display, and no real file ever created on disk.

### Discard the Throwaway Example

```bash
rm agg_check.py
```

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `query_server.py` (modified — the `analyze`
  branch's own return value, extended).
- **Change type:** Add.
- **Location:** `query_server.py`, inside `analyze`, after this lesson's
  own second unit's `stats` loop.
- **Dependencies:** This unit's own isolated proof, above; `matplotlib`
  installed (this lesson's own first unit's Commands Needed).

### The New Code — `query_server.py`

```python
histogram_column = next(iter(stats), None)
histogram_png_base64 = None
if histogram_column is not None:
    figure, axes = plt.subplots()
    axes.hist(pd.to_numeric(df[histogram_column]), bins=10)
    axes.set_title(f"{histogram_column} distribution")
    buffer = io.BytesIO()
    figure.savefig(buffer, format="png")
    plt.close(figure)
    histogram_png_base64 = base64.b64encode(buffer.getvalue()).decode("ascii")
```

### The Updated Project — `query_server.py`'s `analyze` branch

```python
    elif method == "analyze":
        table = params["table"]
        columns = conn._db.schema(table)
        records = conn._db.query(table)
        rows = [r.values() for r in records]
        df = pd.DataFrame(rows, columns=columns)

        stats = {}
        for column in columns:
            try:
                numeric = pd.to_numeric(df[column])
            except (ValueError, TypeError):
                continue
            stats[column] = {
                "mean": float(numeric.mean()),
                "stdev": float(numeric.std(ddof=1)) if len(numeric) > 1 else 0.0,
            }

        histogram_column = next(iter(stats), None)              # ← new
        histogram_png_base64 = None                                # ← new
        if histogram_column is not None:                            # ← new
            figure, axes = plt.subplots()                             # ← new
            axes.hist(pd.to_numeric(df[histogram_column]), bins=10)     # ← new
            axes.set_title(f"{histogram_column} distribution")          # ← new
            buffer = io.BytesIO()                                       # ← new
            figure.savefig(buffer, format="png")                        # ← new
            plt.close(figure)                                           # ← new
            histogram_png_base64 = base64.b64encode(buffer.getvalue()).decode("ascii")  # ← new

        return {
            "rowCount": len(records),
            "stats": stats,
            "histogramColumn": histogram_column,      # ← new
            "histogramPngBase64": histogram_png_base64,  # ← new
        }
```

`analyze` now returns one real, complete result: every numeric column's
own real mean/stdev, plus one real histogram (the first numeric
column, by this table's own real, declared column order) encoded as a
real, transportable string. Base64 encoding itself is this lesson's
own next, final unit.

### Mechanical Walkthrough

- `next(iter(stats), None)` — first appearance of `next()` with a real,
  explicit default; `iter(stats)` real-produces an iterator over
  `stats`'s own real dict keys, in real, guaranteed insertion order
  (matching `columns`'s own real, declared order, since `stats` was
  built by iterating `columns` in this lesson's own second unit);
  `next(..., None)` real-takes the first one, or `None` if `stats` is
  real, genuinely empty (a table with no numeric columns at all).
- `plt.subplots()` / `axes.hist(...)` / `axes.set_title(...)` /
  `figure.savefig(...)` / `plt.close(figure)` — covered fully in
  Objects and methods used, above; `plt.close(figure)` is a real,
  necessary cleanup step this unit's own isolated lab didn't need to
  show explicitly but does need in a real, long-running process — each
  real, uncleaned `Figure` stays in `matplotlib`'s own internal memory
  until closed, a real, genuine memory leak across many real `analyze`
  calls in one, real, long-lived `query_server.py` process.
- `io.BytesIO()` — covered fully in Objects and methods used, above.
- `base64.b64encode(...)` — covered fully in Objects and methods used,
  above (used here; explained fully in the next unit).

### CS Lens

Choosing a real, non-interactive **rendering backend** instead of an
interactive one is a real, general pattern any graphics or UI toolkit
faces: the same real code that *describes* what to draw (a histogram,
a title) is kept separate from *how* that description actually becomes
pixels — a real windowed display in one real backend, a real, in-memory
byte buffer in another, with the describing code itself never needing
to know which.

Also recognized in: a headless Chromium instance rendering a real web
page to a real screenshot with no visible browser window at all (the
same real Electron/Chromium this project is already built on); a real
report-generation service producing real PDFs on a real server with no
real monitor attached; `pocket-db`'s own Lesson 9 `matplotlib` call,
which — run from an ordinary, interactive terminal — never needed
`Agg` at all, the identical real library, two real, different
environments.

### SE Lens

Why does this unit call `matplotlib.use("Agg")` before ever importing
`matplotlib.pyplot`, rather than after? Because `matplotlib` real,
actually selects and locks in its own backend the *first* real time
`pyplot` is imported — calling `.use("Agg")` any later would be a real,
silent no-op, an easy, genuine mistake this lesson's own import order
(visible in "The Updated Project" for `query_server.py`'s own top-level
imports) deliberately avoids.

### Commands Needed

```bash
python agg_check.py
```

Already shown above, alongside its real output.

### Run It

Already shown above, in "Introduce the Concept in Isolation."

### Connection

A real histogram exists as real, in-memory PNG bytes. Getting those real
bytes across this project's own real, text-only protocol — and onto
the actual screen — is last.

---

## Concept Unit: Sending a Picture Through a Line of Text

### The Problem

`query_server.py`'s own real protocol (Lesson 2) reads and writes one
real, whole line of text at a time — `for line in sys.stdin`, split on
real `\n` characters. A real PNG's own raw bytes routinely *contain*
real `\n` bytes internally, as ordinary, meaningless image data — sent
raw, they would be silently, incorrectly split across multiple real
"lines," corrupting this project's own protocol framing itself, not
just the image.

### Introduce the Concept in Isolation

Save this as `base64_check.py`:

```python
import base64

raw = b"\x89PNG\r\n\x1a\n\x00\x01\xff"
print("raw bytes:", raw)
encoded = base64.b64encode(raw).decode("ascii")
print("encoded (ascii text):", encoded)
print("contains newline:", "\n" in encoded)
decoded = base64.b64decode(encoded)
print("round-trip matches original:", decoded == raw)
```

Run with:

```bash
python base64_check.py
```

Real output:

```text
raw bytes: b'\x89PNG\r\n\x1a\n\x00\x01\xff'
encoded (ascii text): iVBORw0KGgoAAf8=
contains newline: False
round-trip matches original: True
```

*What this proves:* `raw`'s own real bytes deliberately include a
literal `\n` (byte `0x0a`) — exactly the real character this project's
own protocol splits lines on — yet the real, encoded result contains
none at all, and decoding it back reproduces the exact, original real
bytes. This is called **base64 encoding**, named in the Header above:
any real binary data becomes one real, safe, printable-only line, with
nothing lost.

### Discard the Throwaway Example

```bash
rm base64_check.py
```

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `query_server.py` (already shown in the previous
  unit's own real code — `base64.b64encode(...).decode("ascii")` is
  this lesson's own load-bearing use, explained fully only now);
  `src/preload.ts` (modified — a real `analyze` method), `src/main.ts`
  (modified — a real `"analyze"` IPC handler), `src/App.tsx` (modified
  — real `AnalyzeResult` state and UI).
- **Change type:** Add.
- **Dependencies:** This lesson's own previous two units.

### The New Code — `src/preload.ts`

```typescript
interface AnalyzeResult {
  rowCount: number;
  stats: Record<string, { mean: number; stdev: number }>;
  histogramColumn: string | null;
  histogramPngBase64: string | null;
}

analyze: (table: string): Promise<AnalyzeResult> => ipcRenderer.invoke("analyze", table),
```

### The Updated Project — `src/preload.ts`

```typescript
import { contextBridge, ipcRenderer } from "electron";

interface RowsResult {
  columns: string[];
  rows: string[][];
}

interface ColumnStats {
  mean: number;
  stdev: number;
}

interface AnalyzeResult {
  rowCount: number;
  stats: Record<string, ColumnStats>;
  histogramColumn: string | null;
  histogramPngBase64: string | null;
}

contextBridge.exposeInMainWorld("pocketStudio", {
  ping: (): Promise<string> => ipcRenderer.invoke("ping"),
  listTables: (): Promise<string[]> => ipcRenderer.invoke("list-tables"),
  getRows: (table: string): Promise<RowsResult> => ipcRenderer.invoke("get-rows", table),
  runQuery: (sql: string): Promise<RowsResult> => ipcRenderer.invoke("run-query", sql),
  createTable: (table: string, columns: Record<string, number>): Promise<void> =>
    ipcRenderer.invoke("create-table", table, columns),
  insertRow: (table: string, values: string[]): Promise<void> =>
    ipcRenderer.invoke("insert-row", table, values),
  analyze: (table: string): Promise<AnalyzeResult> => ipcRenderer.invoke("analyze", table),
});
```

`contextBridge.exposeInMainWorld` (Lesson 1) is unchanged; `analyze` is
simply one more real, narrow method on the same already-established
real bridge object, following the identical real
`ipcRenderer.invoke(channel, ...args)` shape every other method here
already uses.

`main.ts` gains the matching real handler — reappearing shape
(`ipcMain.handle`, Lesson 1), nothing new to walk through:

```typescript
ipcMain.handle("analyze", async (_event, table: string): Promise<AnalyzeResult> => {
  const client = await getDbClient();
  return (await client.request("analyze", { table })) as AnalyzeResult;
});
```

The real, new piece is entirely on the receiving, rendered side —
`src/App.tsx`:

```typescript
{analysis.histogramPngBase64 !== null && (
  <img
    src={`data:image/png;base64,${analysis.histogramPngBase64}`}
    alt={`${analysis.histogramColumn} distribution`}
  />
)}
```

### The Updated Project — `src/App.tsx`, the selected-table block

```typescript
      {selectedTable !== null && (
        <>
          <h2>{selectedTable}</h2>
          <Grid result={rows} />

          <h3>Insert Row</h3>
          {rows.columns.map((column, index) => (
            <input
              key={column}
              placeholder={column}
              value={insertValues[index] ?? ""}
              onChange={(event) => {
                const next = [...insertValues];
                next[index] = event.target.value;
                setInsertValues(next);
              }}
            />
          ))}
          <button onClick={insertRow}>Insert</button>

          <h3>Analyze</h3>
          <button onClick={analyzeTable}>Analyze</button>
          {analysis !== null && (
            <div>
              <p>rows: {analysis.rowCount}</p>
              <ul>
                {Object.entries(analysis.stats).map(([column, columnStats]) => (
                  <li key={column}>
                    {column}: mean {columnStats.mean.toFixed(2)}, stdev{" "}
                    {columnStats.stdev.toFixed(2)}
                  </li>
                ))}
              </ul>
              {analysis.histogramPngBase64 !== null && (
                <img
                  src={`data:image/png;base64,${analysis.histogramPngBase64}`}
                  alt={`${analysis.histogramColumn} distribution`}
                />
              )}
            </div>
          )}
        </>
      )}
```

The selected-table block — real, unchanged since Lesson 6 for
everything above "Analyze" — now shows a real, third real capability
(browse, insert, and, as of this lesson, analyze) for whichever table
is currently selected; `analyzeTable` (an `async` function following
this project's own established `runQuery`/`createTable` shape) sets a
new `analysis` state variable the moment its own real IPC call resolves.

### Mechanical Walkthrough

- `` `data:image/png;base64,${analysis.histogramPngBase64}` `` — a
  real, template-literal-built **Data URL**, covered fully in Terms
  Introduced, above; `image/png` is the real, standard MIME type
  matching `figure.savefig(buffer, format="png")`'s own real output
  format from the previous unit.
- `<img src={...} alt={...} />` — reappearing basic syntax (a real,
  ordinary HTML/JSX element, `src`/`alt` both real, standard attributes)
  — the real, only new fact is that `src` here is a Data URL instead of
  a real, separate network path (`https://...`) or bundled asset path,
  something this element accepts identically either way, with no real,
  special handling needed on React's own side at all.
- `Object.entries(analysis.stats).map(...)` — reappearing shape
  (`Object.entries`, first real use in this project — first
  appearance) — real-converts the `stats` dict (received as a real
  JSON object) into a real array of `[column, columnStats]` pairs,
  the real, standard way to iterate a plain object's own real
  key/value pairs in a `.map()` call, matching every other real list
  rendered in this project since Lesson 3.
- `columnStats.mean.toFixed(2)` — reappearing shape (already used for
  this project's own real, formatted numeric display, Lesson 6's own
  benchmark-adjacent patterns) — real-formats a real `number` to two
  real decimal places for real, readable display.

### CS Lens

A Data URL is a real, small instance of the identical real
**self-describing message** idea this project's own protocol (Lesson 2)
already uses — a real JSON `{"id": ..., "result": ...}` line carries
its own real meaning with no separate, out-of-band schema needed to
interpret it; `data:image/png;base64,...` carries its own real MIME
type and real encoding right inside the string itself, so whatever
reads it (here, Chromium's own real `<img>` rendering) never needs to
be told separately what kind of data it's looking at.

### SE Lens

Why base64-encode the real image and embed it directly, instead of
having `query_server.py` write a real `.png` file to disk and sending
back only its real path, for `<img src="file://...">` to load? Because
this project's own real architecture (Lesson 8) already proved that
crossing between this app's own two real process boundaries (main
process, packaged resources) with real, bare filesystem paths is a
genuine, recurring source of real bugs — a written file would need its
own, real, separate cleanup story (old histograms accumulating forever
on disk) that a value returned once, inside the identical real
request/response this lesson's own `analyze` call already makes, simply
never needs.

### Commands Needed

```bash
npm start
```

### Run It

Real, end-to-end proof — a real table selected, "Analyze" clicked, in
the actual, running window:

```text
ANALYZE: {"rowCount":20,"stats":{"id":{"mean":9.5,"stdev":5.916079783099616},"score":{"mean":42.45,"stdev":31.38802151676404}},"histogramColumn":"id","histogramLen":16392}
```

*What this proves:* every real, numeric column (`id`, `score`) got a
real mean and stdev; `player` (real `TEXT`) was correctly, silently
excluded; a real, complete, 16,392-character base64 string — a real,
whole PNG image — crossed both of this project's own real process
boundaries (Python sidecar → main process → renderer) as nothing more
than one real string inside one real JSON response, and rendered as an
actual, visible histogram in the running window.

### Connection

S09 is complete: real, professional-grade statistical analysis — the
same real `pandas`/`numpy` foundation `pocket-db`'s own S11 already
proved — is now one real click away in the actual GUI, not a separate
script a user would need to run by hand.

---

## Closing

### Connect the Pieces

This lesson's first unit found and fixed a real, latent bug Lesson 2's
own original DLL-PATH fix had left behind — a shadowed, package-less
Python interpreter, invisible until this lesson's own real `import
pandas` line needed the correct one; `os.add_dll_directory` fixed the
real DLL search at its own, narrow, correct source instead. The second
unit turned a table's own real, queried rows into a real
`pandas.DataFrame`, then used `pd.to_numeric` to automatically discover
which real columns could even have a mean or standard deviation at
all. The third unit proved `matplotlib`'s own `Agg` backend produces a
real, complete, valid image with no real window ever opened, entirely
in memory. The fourth unit crossed this project's own real, text-only
protocol boundary with that image intact, using base64 encoding to
turn real, arbitrary binary bytes — including ones that would otherwise
corrupt the protocol's own line-based framing — into one real, safe
line of text, decoded back into an actual, visible histogram by nothing
more exotic than a Data URL and an ordinary `<img>` tag.

### What Breaks Without This

Remove `plt.close(figure)` from `query_server.py`'s own `analyze`
branch, rebuild nothing (pure Python), and call `analyze` on several
different real tables in a row, in the same, real, still-running
`query_server.py` process. Nothing breaks *visibly* — every real
histogram still renders correctly — but `matplotlib` keeps every real,
un-closed `Figure` alive internally; a real, long-running session
calling `analyze` many times would slowly, genuinely leak memory,
invisible until it's already a real problem. Restore `plt.close(figure)`
and confirm this project's own established discipline (real cleanup,
right after real use) holds.

### Exercises

- `analyze`'s own real histogram only ever covers the *first* real
  numeric column, by table column order. Add a second, real dropdown
  in `App.tsx` letting a user pick which real, numeric column's own
  histogram to request, and extend `analyze`'s own real protocol
  message with a real, optional `column` parameter.
- This unit's own `stats` dict silently skips any real column
  `pd.to_numeric` can't parse. Add a real, visible list of skipped
  column names to `analyze`'s own real response, and show them in the
  window as real, honest "not analyzed (non-numeric)" text, instead of
  simply omitting them with no explanation.
- Using this lesson's own real, established base64/Data-URL technique,
  add a second real chart — a `pandas`-computed **correlation** between
  two real, chosen numeric columns (`df[col1].corr(df[col2])`),
  rendered as a second real `matplotlib` scatter plot
  (`axes.scatter(...)`) sent the identical real way.

### Definition of Done

- [ ] `pocketdb.py` calls `os.add_dll_directory` before
      `ctypes.CDLL`, and `PocketDBClient`'s own constructor no longer
      touches `PATH` at all.
- [ ] You reproduced the real `ModuleNotFoundError` yourself (the
      original, `PATH`-prepending spawn) and confirmed this lesson's
      own fix resolves it.
- [ ] `query_server.py`'s own `analyze` method returns real
      `rowCount`/`stats`/`histogramColumn`/`histogramPngBase64` for a
      real, selected table.
- [ ] A real "Analyze" button in the actual, running window shows real
      mean/stdev text and a real, rendered histogram image.
- [ ] You can explain, from memory, why the histogram is base64-encoded
      rather than sent as raw bytes — referencing this lesson's own
      fourth unit.
- [ ] Committed with a message stating why, for example:
      `git commit -m "Add real pandas analysis and a histogram, reachable from the GUI"`.
