# Lesson 12: Finding the `.dll` From Anywhere

**What you will build**
A real fix for the honest limitation Lesson 9's own SE Lens named but
didn't build: `pocketdb.py` currently loads `pocketdb_engine.dll` using
a relative path, which only works if whoever imports `pocketdb` happens
to be running their own script from inside the `pocketdb/` folder
itself — proven, on purpose, to actually fail otherwise. Then one
final, complete, real program — closing out Slice S01, the entire
real promise this project's own `README.md` made all the way back at
Lesson 0: Python creates a table in the C++ engine, inserts real rows,
and reads them back.

**What you need to know first:** Lesson 9 — `pocketdb.py`'s own
relative-path `.dll` loading, and the real limitation its SE Lens
already named.

**Terms introduced in this lesson:**
- **`__file__`** — a real, special variable Python automatically sets
  inside every module to that module's own real file path — not
  something any code has to compute; Python provides it automatically
  the moment the module is loaded.

**Objects and methods used**
- **`os.path.abspath` / `os.path.dirname` / `os.path.join`**
  - *What they are:* real, standard-library functions, from `os.path`
    — `abspath` turns a possibly-relative path into a real, complete
    one; `dirname` returns everything except a path's own final
    filename; `join` combines path pieces using the real, correct
    separator for whatever operating system is actually running.
  - *Implementation:* `os.path.abspath(__file__)` — `pocketdb.py`'s own
    real, complete path, regardless of how it was originally imported.
    `os.path.dirname(...)` — that path, with `pocketdb.py` itself
    removed, leaving just the real folder it lives in.
    `os.path.join(folder, "pocketdb_engine.dll")` — the real, complete
    path to the `.dll`, built correctly no matter what folder
    `pocketdb.py` actually lives in.
  - *Its use:* `pocketdb.py`'s own real fix, this lesson's subject —
    locating `pocketdb_engine.dll` relative to `pocketdb.py`'s own real
    location, not whatever directory the *caller* happens to be running
    from.

---

## Concept Unit: A Path That Only Works From One Directory

### The Problem

`ctypes.CDLL("./pocketdb_engine.dll")` (every lesson since Lesson 0)
resolves `"./"` relative to the *current working directory* — wherever
the real Python process happens to have been started from — not
relative to `pocketdb.py`'s own real location. Every real script this
project has run so far happened to be started from inside `pocketdb/`
itself, so this never actually failed. Does it actually break the
moment that's no longer true?

### Introduce the Concept in Isolation

Real, direct proof, not assumed. From a genuinely different real
directory — anywhere outside `pocketdb/` — run a real script that
imports `pocketdb`:

```python
import sys
sys.path.insert(0, r"C:\path\to\your\pocketdb")  # wherever your own pocketdb/ actually is
from pocketdb import Database

db = Database()
print("this line is never reached if the import itself fails")
```

Run it from a real, different working directory. Real, captured
failure:

```text
Traceback (most recent call last):
  ...
    from pocketdb import Database
  File "...\pocketdb.py", line 3, in <module>
    _engine = ctypes.CDLL("./pocketdb_engine.dll")
FileNotFoundError: Could not find module '...\pocketdb_engine.dll' (or one of its dependencies).
```

*What this proves:* `"./pocketdb_engine.dll"` really did resolve
relative to the *caller's* own current directory, not `pocketdb.py`'s —
proven directly by the real, reported path in the error message, which
points at the *wrong* folder entirely (wherever the script was actually
run from), not `pocketdb/` itself.

The real fix — resolve the `.dll`'s path relative to `pocketdb.py`
itself, using the one thing that's always true regardless of who's
calling it: its own real file location.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `pocketdb.py` (modified — its own `.dll`-loading
  line changes).
- **Change type:** Refactor (real, working behavior unchanged; only
  *where* it correctly finds the `.dll` changes).
- **Dependencies:** None beyond the Python standard library.

### The Updated Project — `pocketdb.py`'s Own Opening Lines

```python
import ctypes                                                              # ← unchanged
import os                                                                  # ← new

_dll_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "pocketdb_engine.dll")  # ← new
_engine = ctypes.CDLL(_dll_path)                                           # ← changed (was ctypes.CDLL("./pocketdb_engine.dll"))
_engine.database_open.restype = ctypes.c_void_p                            # ← unchanged
```

Proven for real — the identical import, run from the identical, genuinely
different real directory that already failed once:

```python
import sys
sys.path.insert(0, r"C:\path\to\your\pocketdb")
from pocketdb import Database

db = Database()
print("this line is now reached")
```

Real output — no crash this time:

```text
this line is now reached
```

*What this proves:* the identical real import, from the identical real
directory that failed before, now succeeds — because `_dll_path` is
built from `pocketdb.py`'s own real, absolute location
(`os.path.dirname(os.path.abspath(__file__))`), which is always true
regardless of where the calling script itself happens to run from.

### Mechanical Walkthrough

- `import os` — **first appearance.** Python's own real standard
  library module for operating-system-level operations — file paths,
  environment variables, process information.
- `os.path.abspath(__file__)` — covered fully in Objects and methods
  used, above; `__file__` itself covered fully in Terms Introduced.
- `os.path.dirname(...)` — covered fully in Objects and methods used.
- `os.path.join(..., "pocketdb_engine.dll")` — covered fully in Objects
  and methods used; using `os.path.join` instead of hand-building the
  path with a literal `"/"` or `"\\"` is what makes this correct on any
  real operating system, not just Windows.
- `ctypes.CDLL(_dll_path)` — reappearing exactly (Lesson 0) — the
  identical real call, now given a real, absolute path instead of a
  caller-relative one.

### CS Lens

This is resolving a path relative to a **module's own location**,
rather than the **process's current working directory** — a real,
important distinction any real, importable package needs to get right.
Also recognized in: how real compiled programs locate their own
resource files relative to the executable's real install location, not
wherever a user happened to launch a terminal from, and how a real web
server locates its own static asset files relative to the server's own
source tree, not whatever directory it happens to be started from.

### SE Lens

Why wasn't this fixed back in Lesson 9, the moment it was first named?
Because naming a real, known limitation honestly and deferring the fix
until it's actually needed — rather than fixing every possible edge
case the instant it's noticed — is itself a real, deliberate practice,
provided the limitation is written down where it won't be forgotten
(Lesson 9's own SE Lens did exactly that). Fixing it now, once
`pocketdb` is close to being a real, complete, importable package other
code might reasonably use from anywhere, is the real, correct moment —
not too early, when nothing yet depended on it working from elsewhere,
and not left forgotten either.

### Commands Needed

Every command was already shown above, alongside its real output.

### Run It

Already shown above — the real failure, and the real fix.

### Connection

`pocketdb` can now be imported correctly from anywhere, not just its
own folder. One last, complete, real program — using everything this
slice has built, start to finish — closes out Slice S01.

---

## Concept Unit: The Complete, Real Round Trip

### The Problem

`README.md`'s own S01 entry states one real, specific promise: "Python
creates a table in the C++ engine, inserts a row, reads it back — real
data, real round trip." Every piece of that has been proven separately,
lesson by lesson, since Lesson 6. Nothing has yet shown it all,
together, in one real, complete, ordinary-looking program — the actual
shape a real user of this project would write.

### The New Code — `demo.py`

Save this as `demo.py`, in `pocketdb/` — no `ctypes`, no raw handles,
nothing this project's own internals required at any earlier lesson:

```python
from pocketdb import Database, PocketDBError, INTEGER, TEXT

db = Database()

db.create_table("games", id=INTEGER, player=TEXT, score=INTEGER)

db.insert("games", 1, "Alice", 100)
db.insert("games", 2, "Bob", 85)
db.insert("games", 3, "Carol", 92)

print("All rows:")
for i in range(3):
    print(f"  {db.get('games', i)}")

try:
    db.get("games", 99)
except PocketDBError as e:
    print(f"Expected error for a missing row: {e}")

db.close()
print("Done.")
```

Run with `python demo.py`. Real output:

```text
All rows:
  ['1', "'Alice'", '100']
  ['2', "'Bob'", '85']
  ['3', "'Carol'", '92']
Expected error for a missing row: No row 99 in table 'games'
Done.
```

*What this proves:* every real value inserted comes back out correctly,
in order, through nothing but `pocketdb`'s own real, public interface —
`Database`, `create_table`, `insert`, `get`, `close`, `PocketDBError`.
Nothing in this file mentions `ctypes`, a raw handle, `argtypes`, or any
of the real machinery Lessons 6 through 8 built — all of it lives
inside `pocketdb.py` now, exactly as `README.md`'s own "two APIs, two
audiences" design principle intended from the very first lesson.

### Mechanical Walkthrough

Every line in `demo.py` reappears exactly from an earlier lesson —
`Database()` (Lesson 9), `create_table`/`insert` with `**kwargs`/`*args`
(Lesson 11), `get` (Lesson 10), `PocketDBError` (Lesson 10),
`for i in range(3):` (an ordinary, already-familiar counting loop) —
nothing in this file is new. That absence of anything new is itself
this unit's own real point: a complete, correct, real program, built
entirely from pieces this project already proved correct one at a time.

### CS Lens

This is the real payoff of every earlier lesson's own "two APIs, two
audiences" design principle: `demo.py` — the *audience* — never once
needs to know a C++ engine exists underneath it at all. The
`extern "C"` boundary, opaque handles, `static_cast`, manual memory
ownership — all real, all necessary, all now sealed entirely inside
`pocketdb.py`'s own implementation.

### SE Lens

Is `demo.py` itself part of the real `pocketdb` package, or something
separate? Separate, deliberately — it's a real, runnable example of
*using* the package, not a piece the package itself depends on; a real
user of `pocketdb` would write something shaped like `demo.py`, never
needing to open `pocketdb.py` at all unless something goes wrong.

### Commands Needed

Already shown above.

### Run It

Already shown above.

### Connection

Slice S01 — `README.md`'s own stated goal, "Python creates a table in
the C++ engine, inserts a row, reads it back" — is complete, proven
with one final, ordinary, complete real program. Slice S02, next, adds
real CSV import: pulling a real file's worth of rows into a table in
one call, instead of one `insert()` at a time.

---

## Closing

### Connect the Pieces

This lesson opened by proving a real, quiet limitation: `pocketdb.py`'s
own `.dll` path, resolved relative to whoever happened to `import` it,
genuinely failed the moment that assumption broke — a real
`FileNotFoundError`, caused on purpose, from a genuinely different real
directory. `os.path.dirname(os.path.abspath(__file__))` fixed it for
real, resolving the `.dll`'s path relative to `pocketdb.py`'s own real
location instead — proven by the identical failing scenario succeeding
afterward. `demo.py` then closed out the entire slice: a complete, real
program — table created, three real rows inserted, all three read back
correctly, one real, expected error caught cleanly — using nothing but
`pocketdb`'s own public interface, with every real mechanism from
Lessons 0 through 11 working together underneath it, invisibly, exactly
as designed.

### What Breaks Without This

Already shown directly above, at the very start: import `pocketdb` from
any directory other than its own, using the original relative-path
version, and it fails immediately with a real `FileNotFoundError` —
fixed by resolving the path relative to `pocketdb.py` itself instead.

### Exercises

- Move `demo.py` to a genuinely different real folder on your own
  machine (leaving `pocketdb.py`/`pocketdb_engine.dll` where they are),
  add the necessary `sys.path` adjustment, and confirm it still runs
  correctly — real, direct proof this lesson's own fix works, not just
  in the isolated proof above.
- Add a second real table to `demo.py` (a different real schema, your
  own choosing) and insert/read real rows from both tables in the same
  script, using the same `Database` instance — confirming, end to end,
  that `Database`/`Table` (Lesson 5) genuinely supports more than one
  table at once, all the way up through the real Python interface.
- Read back through this project's own `CURRICULUM_NOTES.md` "SQLite:
  compatible where it helps" section. `pocketdb`'s current real API
  (`create_table`/`insert`/`get`) doesn't yet resemble Python's own
  standard-library `sqlite3` module's shape
  (`connect()`/`.cursor()`/`.execute()`/`.fetchall()`) at all — a real,
  honest gap between what exists now and what Slice S05 eventually
  promises. Sketch, in your own words or in real code, what a thin
  `sqlite3`-shaped wrapper around today's real `Database` class might
  look like.

### Definition of Done

- [ ] `pocketdb.py` locates `pocketdb_engine.dll` using
      `os.path.dirname(os.path.abspath(__file__))`, not a relative
      path, in your own real project.
- [ ] You caused the real `FileNotFoundError` yourself, from a
      genuinely different working directory, and fixed it for real.
- [ ] `demo.py` runs correctly, end to end, using only `pocketdb`'s
      real public interface — no direct `ctypes` calls anywhere in it.
- [ ] You can state, from memory, `README.md`'s own original Slice S01
      promise, and explain exactly how `demo.py` proves it, line by
      line.
- [ ] Slice S01 is complete: every lesson from `Lesson-00` through
      `Lesson-12` builds and runs correctly, in order, in your own real
      `pocketdb/` folder.
- [ ] Committed with a message stating why: for example,
      `git commit -m "Fix DLL path resolution and complete Slice S01 with a full end-to-end demo"`.
